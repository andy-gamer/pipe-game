
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CellData, PipeType, LevelData, CustomerType, Difficulty } from './types.ts';
import { LEVELS } from './constants.ts';
import { tracePath, getReachableCells } from './services/gameLogic.ts';
import Cell from './components/Cell.tsx';

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
};

const Confetti: React.FC = () => {
  const pieces = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: ['#d4a373', '#7d8570', '#fbbf24', '#faedcd', '#ccd5ae'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1.5,
      size: 6 + Math.random() * 8
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[60]">
      {pieces.map(p => (
        <div key={p.id} className="confetti" style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: p.id % 2 === 0 ? '50%' : '2px'
          }}
        />
      ))}
    </div>
  );
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
  
  const currentLevel = useMemo(() => {
    return LEVELS.find(l => l.id === levelId) || LEVELS[0];
  }, [levelId]);

  const reachableFromStart = useMemo(() => {
    if (grid.length === 0 || !currentLevel) return new Set<string>();
    return getReachableCells(grid, currentLevel.startRow);
  }, [grid, currentLevel]);

  useEffect(() => localStorage.setItem(STORAGE_KEYS.CURRENT_LEVEL_ID, levelId.toString()), [levelId]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.SCORE, score.toString()), [score]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.STREAK, streak.toString()), [streak]);

  const resetLevel = useCallback(() => {
    if (!currentLevel) return;
    const { rows, cols } = currentLevel.gridSize;
    const newGrid: CellData[][] = [];
    for (let y = 0; y < rows; y++) {
      const row: CellData[] = [];
      for (let x = 0; x < cols; x++) {
        const initial = currentLevel.initialPipes.find(p => p.x === x && p.y === y);
        let type = initial ? initial.type : PipeType.STRAIGHT;
        let rotation = initial ? initial.rotation : Math.floor(Math.random() * 4);

        if (!initial) {
          // Weighted random: More corners and tees make pathfinding easier between rows
          const types = [
            PipeType.CORNER, PipeType.CORNER, PipeType.CORNER, 
            PipeType.STRAIGHT, PipeType.STRAIGHT,
            PipeType.TEE, PipeType.TEE
          ];
          if (currentLevel.difficulty !== Difficulty.EASY) {
            types.push(PipeType.CROSS);
          }
          type = types[Math.floor(Math.random() * types.length)];
        }

        const customer = currentLevel.customers.find(c => c.x === x && c.y === y);
        row.push({ 
          id: `${x}-${y}`, 
          type, 
          rotation, 
          hasCustomer: !!customer, 
          customerType: customer?.type, 
          x, 
          y, 
          isVisited: false 
        });
      }
      newGrid.push(row);
    }

    setGrid(newGrid);
    setGameState('playing');
    setCurrentScooterId(null);
    setScorePopups([]);
    
    const diffText = currentLevel.difficulty === Difficulty.EASY ? '簡單輕鬆' : 
                   currentLevel.difficulty === Difficulty.MEDIUM ? '普通社區' : '困難巷弄';
    setMessage(`第 ${currentLevel.id} 關：${diffText}。目標顧客：${currentLevel.targetCustomerCount} 位。`);
    setIsDriving(false);
  }, [currentLevel]);

  useEffect(() => {
    resetLevel();
  }, [resetLevel]);

  const handleRotate = useCallback((id: string) => {
    setGrid(prev => prev.map(row => row.map(cell => {
      if (cell.id === id) return { ...cell, rotation: (cell.rotation + 1) % 4 };
      return cell;
    })));
  }, []);

  const checkDelivery = () => {
    const { path, reachedExit } = tracePath(grid, currentLevel.startRow, currentLevel.exitRow);

    setIsDriving(true);
    let step = 0;
    const interval = setInterval(() => {
      if (step < path.length) {
        const pCell = path[step];
        setCurrentScooterId(pCell.id);
        
        if (pCell.hasCustomer && !pCell.isVisited) {
          const isVIP = pCell.customerType === CustomerType.VIP;
          const val = isVIP ? 1000 : 300;
          setScorePopups(prev => [...prev, { 
            id: Math.random().toString(), 
            x: pCell.x, 
            y: pCell.y, 
            value: val,
            type: pCell.customerType || CustomerType.NORMAL
          }]);
          setScore(s => s + val);
        }

        setGrid(prev => prev.map(row => row.map(cell => {
          if (cell.id === pCell.id) return { ...cell, isVisited: true };
          return cell;
        })));
        step++;
      } else {
        clearInterval(interval);
        evaluateResult(reachedExit, path);
      }
    }, 150);
  };

  const evaluateResult = (reachedExit: boolean, path: CellData[]) => {
    const visitedTotal = path.filter(c => c.hasCustomer).length;
    if (reachedExit && visitedTotal >= currentLevel.targetCustomerCount) {
      setGameState('success');
      setStreak(s => s + 1);
      setScore(s => s + 500);
      setMessage(`使命必達！獲得額外獎金。`);
    } else {
      setGameState('failed');
      setStreak(0);
      if (!reachedExit) setMessage(`路徑中斷了，沒辦法抵達目的地。`);
      else setMessage(`雖然抵達，但遺漏了重要的客人。`);
    }
    setIsDriving(false);
  };

  const nextLevel = () => {
    if (levelId < LEVELS.length) {
      setLevelId(prev => prev + 1);
    } else {
      setLevelId(1);
    }
  };

  const cellSize = useMemo(() => {
    if (!currentLevel) return 60;
    const windowWidth = window.innerWidth;
    const maxGridWidth = windowWidth - 100;
    return Math.min(60, maxGridWidth / currentLevel.gridSize.cols);
  }, [currentLevel]);

  const progressPercentage = (levelId / LEVELS.length) * 100;

  return (
    <div className="relative flex flex-col h-screen-safe max-w-md mx-auto bg-[#fdfbf7] text-[#5d5c58] overflow-hidden">
      {gameState === 'success' && <Confetti />}
      
      <header className="px-6 py-4 flex flex-col gap-3 shrink-0 bg-white/50 border-b border-[#f0ece2] z-20">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-xs tracking-widest font-bold text-[#a78b75]">城市外送計畫</h1>
            <span className="text-[10px] text-gray-400 font-medium">Chapter: {currentLevel.difficulty}</span>
          </div>
          <div className="bg-[#a78b75] text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
             LEVEL {levelId} / {LEVELS.length}
          </div>
        </div>

        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#7d8570] transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex justify-between items-baseline">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-[#5d5c58]">{score.toLocaleString()}</span>
            <span className="text-[9px] text-[#9ca3af] uppercase tracking-tighter font-bold">Total Earnings</span>
          </div>
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-1 mb-1">
                <span className="text-xs">🔥</span>
                <span className="text-[10px] font-bold text-[#7d8570]">{streak} STREAK</span>
             </div>
             <div className="text-[9px] font-bold py-0.5 px-2 rounded border border-[#f0ece2] bg-white text-[#888]">
               {currentLevel.gridSize.cols}x{currentLevel.gridSize.rows} MAP
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <div className="flex items-center gap-1 transition-all duration-500">
          {/* Start Point */}
          <div className="flex flex-col" style={{ height: `${currentLevel.gridSize.rows * cellSize}px` }}>
            {Array.from({ length: currentLevel.gridSize.rows }).map((_, r) => (
              <div key={r} className="flex items-center justify-end pr-1" style={{ height: `${cellSize}px`, width: '40px' }}>
                {r === currentLevel.startRow && (
                  <div className="flex items-center gap-1 animate-pulse">
                    <span className="text-lg drop-shadow-sm">🛵</span>
                    <div className="w-4 h-4 bg-[#a78b75] rounded-r-lg shadow-sm"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Puzzle Grid */}
          <div 
            className="bg-white p-2 rounded-2xl border-2 border-[#f0ece2] relative shadow-xl transition-all z-10"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${currentLevel?.gridSize.cols}, 1fr)`,
              width: 'fit-content'
            }}
          >
            {grid.map((row, y) => 
              row.map((cell, x) => {
                const isEntryCell = x === 0 && y === currentLevel.startRow;
                const isExitCell = x === currentLevel.gridSize.cols - 1 && y === currentLevel.exitRow;
                return (
                  <Cell 
                    key={cell.id} 
                    cell={cell} 
                    isConnectedToStart={reachableFromStart.has(cell.id)}
                    isDriving={isDriving}
                    isCurrentScooterPos={currentScooterId === cell.id}
                    onRotate={handleRotate}
                    gridSize={cellSize}
                    isEntryCell={isEntryCell}
                    isExitCell={isExitCell}
                  />
                );
              })
            )}

            {scorePopups.map(popup => (
              <div 
                key={popup.id}
                className={`absolute pointer-events-none animate-bounce font-black z-50 drop-shadow-lg flex items-center gap-1
                  ${popup.type === CustomerType.VIP ? 'text-[#d97706] text-lg' : 'text-[#fbbf24] text-sm'}`}
                style={{
                  left: `${(popup.x + 0.5) * (100 / currentLevel.gridSize.cols)}%`,
                  top: `${(popup.y + 0.1) * (100 / currentLevel.gridSize.rows)}%`,
                  transform: 'translateX(-50%)'
                }}
                onAnimationEnd={() => setScorePopups(prev => prev.filter(p => p.id !== popup.id))}
              >
                {popup.type === CustomerType.VIP && <span>👑</span>}
                +{popup.value}
              </div>
            ))}
          </div>

          {/* Exit Point */}
          <div className="flex flex-col" style={{ height: `${currentLevel.gridSize.rows * cellSize}px` }}>
            {Array.from({ length: currentLevel.gridSize.rows }).map((_, r) => (
              <div key={r} className="flex items-center justify-start pl-1" style={{ height: `${cellSize}px`, width: '40px' }}>
                {r === currentLevel.exitRow && (
                  <div className="flex items-center gap-1">
                    <div className={`w-4 h-4 rounded-l-lg shadow-sm transition-colors ${reachableFromStart.has(`${currentLevel.gridSize.cols - 1}-${currentLevel.exitRow}`) ? 'bg-[#7d8570]' : 'bg-gray-200'}`}></div>
                    <span className="text-lg drop-shadow-sm">☕</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center w-full px-8 min-h-[48px]">
           <p className="text-[11px] text-[#888] font-medium leading-relaxed italic">"{message}"</p>
        </div>
      </main>

      <footer className="px-6 py-8 shrink-0 bg-white/80 backdrop-blur-md border-t border-[#f0ece2] z-20">
        {gameState === 'playing' ? (
          <div className="flex flex-col gap-4">
            <button 
              onClick={checkDelivery}
              disabled={isDriving}
              className={`w-full py-4 text-white tracking-[0.4em] font-bold text-sm rounded-2xl shadow-lg transition-all btn-active ${
                isDriving ? 'bg-[#bbb] opacity-50 cursor-not-allowed' : 'bg-[#a78b75] hover:bg-[#8f7562]'
              }`}
            >
              GO DELIVERY 🛵
            </button>
            <button onClick={() => resetLevel()} className="text-[10px] text-[#bbb] hover:text-[#a78b75] font-black tracking-widest uppercase py-1">
              REFRESH MAP
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
             <div className="text-center mb-1">
                <span className={`text-2xl font-black tracking-widest ${gameState === 'success' ? 'text-[#7d8570]' : 'text-[#a78b75]'}`}>
                  {gameState === 'success' ? 'DELIVERED!' : 'FAILED...'}
                </span>
             </div>
             {gameState === 'success' ? (
                <button 
                  onClick={nextLevel}
                  className="w-full py-4 bg-[#7d8570] text-white tracking-[0.3em] font-bold text-sm rounded-2xl shadow-lg btn-active"
                >
                  NEXT ORDER ➔
                </button>
             ) : (
                <button 
                  onClick={() => resetLevel()}
                  className="w-full py-4 bg-[#a78b75] text-white tracking-[0.3em] font-bold text-sm rounded-2xl shadow-lg btn-active"
                >
                  TRY AGAIN
                </button>
             )}
          </div>
        )}
      </footer>
    </div>
  );
}
