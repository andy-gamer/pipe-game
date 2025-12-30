
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CellData, PipeType, CustomerType, Difficulty } from './types.ts';
import { LEVELS } from './constants.ts';
import { tracePath, getReachableCells, generateSolvableGrid } from './services/gameLogic.ts';

// Components
import Header from './components/Header.tsx';
import GameBoard from './components/GameBoard.tsx';
import ControlPanel from './components/ControlPanel.tsx';
import TutorialOverlay from './components/TutorialOverlay.tsx';
import ConfettiOverlay from './components/ConfettiOverlay.tsx';

interface ScorePopup {
  id: string;
  x: number;
  y: number;
  value: number;
  type: CustomerType;
}

const STORAGE_KEYS = {
  CURRENT_LEVEL_ID: 'flower-delivery-v1-level',
  SCORE: 'flower-delivery-v1-score',
  STREAK: 'flower-delivery-v1-streak',
  TUTORIAL_DONE: 'flower-delivery-v1-tutorial',
};

const MAX_HINTS = 3;

export default function App() {
  const [levelId, setLevelId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_LEVEL_ID);
    return saved ? parseInt(saved, 10) : 1;
  });
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCORE);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STREAK);
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [grid, setGrid] = useState<CellData[][]>([]);
  const [initialGrid, setInitialGrid] = useState<CellData[][]>([]);
  
  const [isDriving, setIsDriving] = useState(false);
  const [currentScooterId, setCurrentScooterId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [gameState, setGameState] = useState<'playing' | 'success' | 'failed'>('playing');
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(MAX_HINTS);
  const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const currentLevel = useMemo(() => LEVELS.find(l => l.id === levelId) || LEVELS[0], [levelId]);
  const reachableFromStart = useMemo(() => (grid.length > 0 ? getReachableCells(grid, currentLevel.startRow) : new Set<string>()), [grid, currentLevel]);
  const hasPathToExit = useMemo(() => (grid.length > 0 && tracePath(grid, currentLevel.startRow, currentLevel.exitRow).reachedExit), [grid, currentLevel]);

  const cellSize = useMemo(() => {
    const availableWidth = Math.min(windowDimensions.width - 100, 420); 
    const availableHeight = windowDimensions.height - 380;
    const sizeByWidth = availableWidth / currentLevel.gridSize.cols;
    const sizeByHeight = availableHeight / currentLevel.gridSize.rows;
    return Math.min(65, sizeByWidth, sizeByHeight);
  }, [currentLevel, windowDimensions]);

  const progressPercentage = (levelId / LEVELS.length) * 100;

  useEffect(() => localStorage.setItem(STORAGE_KEYS.CURRENT_LEVEL_ID, levelId.toString()), [levelId]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.SCORE, score.toString()), [score]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.STREAK, streak.toString()), [streak]);
  
  useEffect(() => {
    const tutorialDone = localStorage.getItem(STORAGE_KEYS.TUTORIAL_DONE);
    if (!tutorialDone && levelId === 1 && gameState === 'playing' && grid.length > 0) setTutorialStep(1);
  }, [levelId, gameState, grid.length]);

  useEffect(() => { if (tutorialStep === 2 && hasPathToExit) setTutorialStep(3); }, [hasPathToExit, tutorialStep]);

  const resetLevel = useCallback(() => {
    const { rows, cols } = currentLevel.gridSize;
    const newGrid = generateSolvableGrid(rows, cols, currentLevel.startRow, currentLevel.exitRow, currentLevel.targetCustomerCount);
    setGrid(newGrid);
    setInitialGrid(newGrid.map(row => row.map(cell => ({ ...cell }))));
    setGameState('playing');
    setCurrentScooterId(null);
    setScorePopups([]);
    setHintsRemaining(MAX_HINTS);
    setMessage(`今天要送出 ${currentLevel.targetCustomerCount} 束鮮花。`);
    setIsDriving(false);
  }, [currentLevel]);

  const retryLevel = useCallback(() => {
    if (initialGrid.length === 0) return;
    setGrid(initialGrid.map(row => row.map(cell => ({ ...cell, isVisited: false, isHinted: false }))));
    setGameState('playing');
    setCurrentScooterId(null);
    setScorePopups([]);
    setMessage(`重新整理花籃，再次出發！`);
    setIsDriving(false);
  }, [initialGrid]);

  useEffect(() => { resetLevel(); }, [resetLevel]);

  const handleRotate = useCallback((id: string) => {
    if (isDriving || gameState !== 'playing') return;
    setGrid(prev => prev.map(row => row.map(cell => cell.id === id ? { ...cell, rotation: (cell.rotation + 1) % 4, isHinted: false } : cell)));
    if (tutorialStep === 1) setTutorialStep(2);
  }, [isDriving, gameState, tutorialStep]);

  const handleHint = useCallback(() => {
    if (hintsRemaining <= 0 || isDriving || gameState !== 'playing') return;
    let hintCell: CellData | null = null;
    for (const row of grid) {
      for (const cell of row) {
        if (cell.solutionRotation !== undefined && cell.rotation !== cell.solutionRotation) { hintCell = cell; break; }
      }
      if (hintCell) break;
    }
    if (hintCell) {
      const targetId = hintCell.id;
      const targetRotation = hintCell.solutionRotation!;
      setGrid(prev => prev.map(row => row.map(cell => cell.id === targetId ? { ...cell, rotation: targetRotation, isHinted: true } : cell)));
      setHintsRemaining(h => h - 1);
      setMessage("花店助手為你修剪了這段路徑！");
      setTimeout(() => setGrid(prev => prev.map(row => row.map(cell => cell.id === targetId ? { ...cell, isHinted: false } : cell))), 3000);
    } else { setMessage("這條路已經開滿了鮮花！"); }
  }, [grid, hintsRemaining, isDriving, gameState]);

  const handleCheckDelivery = () => {
    const { path, reachedExit } = tracePath(grid, currentLevel.startRow, currentLevel.exitRow);
    if (tutorialStep > 0) { setTutorialStep(0); localStorage.setItem(STORAGE_KEYS.TUTORIAL_DONE, 'true'); }
    setIsDriving(true);
    let step = 0;
    const interval = setInterval(() => {
      if (step < path.length) {
        const pCell = path[step];
        setCurrentScooterId(pCell.id);
        if (pCell.hasCustomer && !pCell.isVisited) {
          let val = 300;
          if (pCell.customerType === CustomerType.WEDDING) val = 1500;
          else if (pCell.customerType === CustomerType.ROMANCE) val = 600;
          setScorePopups(prev => [...prev, { id: Math.random().toString(), x: pCell.x, y: pCell.y, value: val, type: pCell.customerType || CustomerType.BOUQUET }]);
          setScore(s => s + val);
        }
        setGrid(prev => prev.map(row => row.map(cell => cell.id === pCell.id ? { ...cell, isVisited: true } : cell)));
        step++;
      } else {
        clearInterval(interval);
        const visitedTotal = path.filter(c => c.hasCustomer).length;
        if (reachedExit && visitedTotal >= currentLevel.targetCustomerCount) {
          setGameState('success'); setStreak(s => s + 1); setScore(s => s + 500); setMessage(`鮮花準時送達！大家都感受到了幸福。`);
        } else {
          setGameState('failed'); setStreak(0); setMessage(!reachedExit ? `找不到路... 鮮花快枯萎了。` : `還有客人的花沒送到！`);
        }
        setIsDriving(false);
      }
    }, 250);
  };

  const handleNextLevel = () => setLevelId(prev => (prev < LEVELS.length ? prev + 1 : 1));

  return (
    <div className="relative flex flex-col h-screen-safe max-w-md mx-auto bg-[#fdfbf7] text-[#5d5c58] overflow-hidden shadow-2xl">
      {gameState === 'success' && <ConfettiOverlay />}
      <TutorialOverlay step={tutorialStep} hasPathToExit={hasPathToExit} onClose={() => setTutorialStep(0)} onNext={() => {
        if (tutorialStep < 3 && !(tutorialStep === 2 && hasPathToExit)) setTutorialStep(s => s + 1);
        else { setTutorialStep(0); localStorage.setItem(STORAGE_KEYS.TUTORIAL_DONE, 'true'); }
      }} />
      <Header levelId={levelId} totalLevels={LEVELS.length} score={score} streak={streak} difficulty={currentLevel.difficulty} progressPercentage={progressPercentage} gridCols={currentLevel.gridSize.cols} gridRows={currentLevel.gridSize.rows} />
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <GameBoard grid={grid} currentLevel={currentLevel} reachableFromStart={reachableFromStart} isDriving={isDriving} currentScooterId={currentScooterId} onRotate={handleRotate} cellSize={cellSize} scorePopups={scorePopups} setScorePopups={setScorePopups} tutorialHighlight={tutorialStep === 1 || tutorialStep === 2} tutorialTargetId={levelId === 1 && tutorialStep === 1 ? `0-${currentLevel.startRow}` : null} />
        <div className="mt-8 text-center w-full px-8 h-12 flex items-center justify-center">
           <p className="text-xs text-[#a78b75] font-bold leading-relaxed italic">{isDriving ? "🚲🌸 正在配送鮮花..." : message}</p>
        </div>
      </main>
      <ControlPanel gameState={gameState} isDriving={isDriving} hasPathToExit={hasPathToExit} tutorialStep={tutorialStep} hintsRemaining={hintsRemaining} onCheckDelivery={handleCheckDelivery} onResetLevel={resetLevel} onRetryLevel={retryLevel} onNextLevel={handleNextLevel} onHint={handleHint} />
    </div>
  );
}
