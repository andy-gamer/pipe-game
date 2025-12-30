
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CellData, PipeType, CustomerType, Difficulty } from './types.ts';
import { LEVELS } from './constants.ts';
import { tracePath, getReachableCells } from './services/gameLogic.ts';

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
  CURRENT_LEVEL_ID: 'delivery-pipe-global-level-id-v5',
  SCORE: 'delivery-pipe-score-v5',
  STREAK: 'delivery-pipe-streak-v5',
  TUTORIAL_DONE: 'delivery-pipe-tutorial-v1',
};

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
  const [isDriving, setIsDriving] = useState(false);
  const [currentScooterId, setCurrentScooterId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [gameState, setGameState] = useState<'playing' | 'success' | 'failed'>('playing');
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // 監聽視窗大小變化以動態調整遊戲板
  useEffect(() => {
    const handleResize = () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const currentLevel = useMemo(() => LEVELS.find(l => l.id === levelId) || LEVELS[0], [levelId]);
  
  const reachableFromStart = useMemo(() => (grid.length > 0 ? getReachableCells(grid, currentLevel.startRow) : new Set<string>()), [grid, currentLevel]);
  
  const hasPathToExit = useMemo(() => {
    if (grid.length === 0) return false;
    const { reachedExit } = tracePath(grid, currentLevel.startRow, currentLevel.exitRow);
    return reachedExit;
  }, [grid, currentLevel]);

  // 更精確的 CellSize 計算，考量寬度與高度限制
  const cellSize = useMemo(() => {
    const availableWidth = Math.min(windowDimensions.width - 80, 400); 
    const availableHeight = windowDimensions.height - 350;
    const sizeByWidth = availableWidth / currentLevel.gridSize.cols;
    const sizeByHeight = availableHeight / currentLevel.gridSize.rows;
    return Math.min(60, sizeByWidth, sizeByHeight);
  }, [currentLevel, windowDimensions]);

  const progressPercentage = (levelId / LEVELS.length) * 100;

  useEffect(() => localStorage.setItem(STORAGE_KEYS.CURRENT_LEVEL_ID, levelId.toString()), [levelId]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.SCORE, score.toString()), [score]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.STREAK, streak.toString()), [streak]);
  
  useEffect(() => {
    const tutorialDone = localStorage.getItem(STORAGE_KEYS.TUTORIAL_DONE);
    if (!tutorialDone && levelId === 1 && gameState === 'playing' && grid.length > 0) {
       setTutorialStep(1);
    }
  }, [levelId, gameState, grid.length]);

  useEffect(() => { 
    if (tutorialStep === 2 && hasPathToExit) setTutorialStep(3);
  }, [hasPathToExit, tutorialStep]);

  const resetLevel = useCallback(() => {
    const { rows, cols } = currentLevel.gridSize;
    const newGrid: CellData[][] = [];
    
    const linearPool = [
      PipeType.STRAIGHT, PipeType.STRAIGHT, 
      PipeType.CORNER, PipeType.CORNER, PipeType.CORNER
    ];

    for (let y = 0; y < rows; y++) {
      const row: CellData[] = [];
      for (let x = 0; x < cols; x++) {
        const initial = currentLevel.initialPipes.find(p => p.x === x && p.y === y);
        const customer = currentLevel.customers.find(c => c.x === x && c.y === y);
        
        let type = initial ? initial.type : PipeType.STRAIGHT;
        let rotation = initial ? initial.rotation : Math.floor(Math.random() * 4);
        
        if (!initial) {
          type = linearPool[Math.floor(Math.random() * linearPool.length)];
        }
        
        row.push({ id: `${x}-${y}`, type, rotation, hasCustomer: !!customer, customerType: customer?.type, x, y, isVisited: false });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setGameState('playing');
    setCurrentScooterId(null);
    setScorePopups([]);
    setMessage(`第 ${currentLevel.id} 關：${currentLevel.difficulty === Difficulty.HARD ? '城市迷宮' : '小鎮導航'}。請接載 ${currentLevel.targetCustomerCount} 位客人。`);
    setIsDriving(false);
  }, [currentLevel]);

  useEffect(() => { resetLevel(); }, [resetLevel]);

  const handleRotate = useCallback((id: string) => {
    if (isDriving) return;
    setGrid(prev => prev.map(row => row.map(cell => cell.id === id ? { ...cell, rotation: (cell.rotation + 1) % 4 } : cell)));
    if (tutorialStep === 1) setTutorialStep(2);
  }, [isDriving, tutorialStep]);

  const handleCheckDelivery = () => {
    const { path, reachedExit } = tracePath(grid, currentLevel.startRow, currentLevel.exitRow);
    if (tutorialStep > 0) {
      setTutorialStep(0);
      localStorage.setItem(STORAGE_KEYS.TUTORIAL_DONE, 'true');
    }
    setIsDriving(true);
    let step = 0;
    const interval = setInterval(() => {
      if (step < path.length) {
        const pCell = path[step];
        setCurrentScooterId(pCell.id);
        if (pCell.hasCustomer && !pCell.isVisited) {
          const isVIP = pCell.customerType === CustomerType.VIP;
          const val = isVIP ? 1000 : 300;
          setScorePopups(prev => [...prev, { id: Math.random().toString(), x: pCell.x, y: pCell.y, value: val, type: pCell.customerType || CustomerType.NORMAL }]);
          setScore(s => s + val);
        }
        setGrid(prev => prev.map(row => row.map(cell => cell.id === pCell.id ? { ...cell, isVisited: true } : cell)));
        step++;
      } else {
        clearInterval(interval);
        const visitedTotal = path.filter(c => c.hasCustomer).length;
        if (reachedExit && visitedTotal >= currentLevel.targetCustomerCount) {
          setGameState('success');
          setStreak(s => s + 1);
          setScore(s => s + 500);
          setMessage(`完美的路線！獎金已入帳。`);
        } else {
          setGameState('failed');
          setStreak(0);
          setMessage(!reachedExit ? `目的地連不通，請檢查道路接縫。` : `還有客人沒接到，快回頭！`);
        }
        setIsDriving(false);
      }
    }, 200);
  };

  const handleNextLevel = () => setLevelId(prev => (prev < LEVELS.length ? prev + 1 : 1));

  const tutorialTargetId = useMemo(() => {
    if (levelId === 1 && tutorialStep === 1) return `${0}-${currentLevel.startRow}`;
    return null;
  }, [levelId, tutorialStep, currentLevel]);

  if (grid.length === 0) return <div className="h-screen flex items-center justify-center bg-[#fdfbf7] text-[#a78b75] font-bold">載入地圖中...</div>;

  return (
    <div className="relative flex flex-col h-screen-safe max-w-md mx-auto bg-[#fdfbf7] text-[#5d5c58] overflow-hidden">
      {gameState === 'success' && <ConfettiOverlay />}
      <TutorialOverlay step={tutorialStep} hasPathToExit={hasPathToExit} onClose={() => setTutorialStep(0)} onNext={() => {
          if (tutorialStep < 3 && !(tutorialStep === 2 && hasPathToExit)) setTutorialStep(s => s + 1);
          else { setTutorialStep(0); localStorage.setItem(STORAGE_KEYS.TUTORIAL_DONE, 'true'); }
        }}
      />
      <Header levelId={levelId} totalLevels={LEVELS.length} score={score} streak={streak} difficulty={currentLevel.difficulty} progressPercentage={progressPercentage} gridCols={currentLevel.gridSize.cols} gridRows={currentLevel.gridSize.rows} />
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <GameBoard grid={grid} currentLevel={currentLevel} reachableFromStart={reachableFromStart} isDriving={isDriving} currentScooterId={currentScooterId} onRotate={handleRotate} cellSize={cellSize} scorePopups={scorePopups} setScorePopups={setScorePopups} tutorialHighlight={tutorialStep === 1 || tutorialStep === 2} tutorialTargetId={tutorialTargetId} />
        <div className="mt-6 text-center w-full px-8 min-h-[48px] flex items-center justify-center">
           <p className="text-[11px] text-[#888] font-medium leading-relaxed italic">"{message}"</p>
        </div>
      </main>
      <ControlPanel gameState={gameState} isDriving={isDriving} hasPathToExit={hasPathToExit} tutorialStep={tutorialStep} onCheckDelivery={handleCheckDelivery} onResetLevel={resetLevel} onNextLevel={handleNextLevel} />
    </div>
  );
}
