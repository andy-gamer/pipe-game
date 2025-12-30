
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CellData, PipeType, LevelData, CustomerType } from './types.ts';
import { LEVELS } from './constants.ts';
import { tracePath, getReachableCells } from './services/gameLogic.ts';
import Cell from './components/Cell.tsx';

interface ScorePopup {
  id: string;
  x: number;
  y: number;
  value: number;
}

const STORAGE_KEYS = {
  LEVEL: 'delivery-pipe-level-progress-v2',
  SCORE: 'delivery-pipe-score-v2',
  STREAK: 'delivery-pipe-streak-v2',
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
  const [levelIndex, setLevelIndex] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEVEL);
    return saved ? parseInt(saved, 10) : 0;
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
  
  const currentLevel = useMemo(() => LEVELS[levelIndex] || LEVELS[0], [levelIndex]);
  const reachableFromStart = useMemo(() => {
    if (grid.length === 0) return new Set<string>();
    const startCell = grid[currentLevel.startPos.y][currentLevel.startPos.x];
    return getReachableCells(grid, startCell);
  }, [grid, currentLevel]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEVEL, levelIndex.toString());
  }, [levelIndex]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCORE, score.toString());
  }, [score]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STREAK, streak.toString());
  }, [streak]);

  const resetLevel = useCallback((force: boolean = false) => {
    const { rows, cols } = currentLevel.gridSize;
    const newGrid: CellData[][] = [];
    for (let y = 0; y < rows; y++) {
      const row: CellData[] = [];
      for (let x = 0; x < cols; x++) {
        let type = PipeType.STRAIGHT;
        let rotation = Math.floor(Math.random() * 4);
        let hasCustomer = false;
        let customerType: CustomerType | undefined;

        if (x === currentLevel.startPos.x && y === currentLevel.startPos.y) {
          type = PipeType.START;
          rotation = currentLevel.startPos.rotation;
        } else if (x === currentLevel.exitPos.x && y === currentLevel.exitPos.y) {
          type = PipeType.EXIT;
          rotation = currentLevel.exitPos.rotation;
        } else {
          const initial = currentLevel.initialPipes.find(p => p.x === x && p.y === y);
          if (initial) {
            type = initial.type;
            rotation = initial.rotation;
          } else {
            const types = [PipeType.STRAIGHT, PipeType.CORNER, PipeType.TEE];
            type = types[Math.floor(Math.random() * types.length)];
          }
          const customer = currentLevel.customers.find(c => c.x === x && c.y === y);
          if (customer) {
            hasCustomer = true;
            customerType = customer.type;
          }
        }
        row.push({ id: `${x}-${y}`, type, rotation, hasCustomer, customerType, x, y, isVisited: false });
      }
      newGrid.push(row);
    }

    setGrid(newGrid);
    setGameState('playing');
    setCurrentScooterId(null);
    setScorePopups([]);
    setMessage(`規劃路徑連結終點！連通的水管會變色喔。`);
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
    const startCell = grid[currentLevel.startPos.y][currentLevel.startPos.x];
    const exitCell = grid[currentLevel.exitPos.y][currentLevel.exitPos.x];
    const { path, reachedExit } = tracePath(grid, startCell, exitCell);

    setIsDriving(true);
    let step = 0;
    const interval = setInterval(() => {
      if (step < path.length) {
        const pCell = path[step];
        setCurrentScooterId(pCell.id);
        
        // 如果遇到客人
        if (pCell.hasCustomer && !pCell.isVisited) {
          const val = pCell.customerType === CustomerType.VIP ? 1000 : 300;
          setScorePopups(prev => [...prev, { id: Math.random().toString(), x: pCell.x, y: pCell.y, value: val }]);
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
      setScore(s => s + 500); // 抵達紅利
      setMessage(`順利抵達！獲得了豐厚的配送評分。`);
    } else {
      setGameState('failed');
      setStreak(0);
      setMessage(reachedExit ? `雖然到了終點，但漏掉太多客人囉。` : `外送員迷路了，沒辦法到達終點！`);
    }
    setIsDriving(false);
  };

  const cellSize = useMemo(() => {
    const windowWidth = window.innerWidth;
    const maxGridWidth = windowWidth - 64;
    return Math.min(64, maxGridWidth / currentLevel.gridSize.cols);
  }, [currentLevel]);

  return (
    <div className="relative flex flex-col h-screen-safe max-w-md mx-auto bg-[#fdfbf7] text-[#5d5c58] overflow-hidden">
      {gameState === 'success' && <Confetti />}
      
      <header className="px-6 py-4 flex flex-col gap-1 shrink-0 bg-white/50 border-b border-[#f0ece2]">
        <div className="flex justify-between items-center">
          <h1 className="text-xs tracking-widest font-bold text-[#a78b75]">城市外送計畫</h1>
          <div className="bg-[#a78b75] text-white text-[10px] px-2 py-0.5 rounded font-bold">關卡 {levelIndex + 1}</div>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-black text-[#5d5c58]">{score.toLocaleString()}</span>
          <span className="text-[10px] font-medium text-[#7d8570]">連勝：{streak}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <div 
          className="bg-white p-2 rounded-2xl border-2 border-[#f0ece2] relative shadow-xl"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${currentLevel.gridSize.cols}, 1fr)`,
            width: 'fit-content'
          }}
        >
          {grid.map((row, y) => 
            row.map((cell, x) => (
              <Cell 
                key={cell.id} 
                cell={cell} 
                isConnectedToStart={reachableFromStart.has(cell.id)}
                isDriving={isDriving}
                isCurrentScooterPos={currentScooterId === cell.id}
                onRotate={handleRotate}
                gridSize={cellSize}
              />
            ))
          )}

          {/* 得分動畫彈窗 */}
          {scorePopups.map(popup => (
            <div 
              key={popup.id}
              className="absolute pointer-events-none animate-bounce text-[#fbbf24] font-black text-sm z-50 drop-shadow-md"
              style={{
                left: `${(popup.x + 0.5) * (100 / currentLevel.gridSize.cols)}%`,
                top: `${(popup.y + 0.1) * (100 / currentLevel.gridSize.rows)}%`,
                transform: 'translateX(-50%)'
              }}
              onAnimationEnd={() => setScorePopups(prev => prev.filter(p => p.id !== popup.id))}
            >
              +{popup.value}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center w-full px-6 min-h-[40px]">
           <p className="text-xs text-[#888] font-medium leading-relaxed">{message}</p>
        </div>
      </main>

      <footer className="px-6 py-8 shrink-0 bg-white/80 backdrop-blur-md">
        {gameState === 'playing' ? (
          <div className="flex flex-col gap-4">
            <button 
              onClick={checkDelivery}
              disabled={isDriving}
              className={`w-full py-4 text-white tracking-[0.4em] font-bold text-sm rounded-2xl shadow-lg transition-all active:scale-95 ${
                isDriving ? 'bg-[#bbb] opacity-50' : 'bg-[#a78b75] hover:bg-[#8f7562]'
              }`}
            >
              開始配送 🛵
            </button>
            <button onClick={() => resetLevel(true)} className="text-[10px] text-[#bbb] hover:text-[#a78b75] font-bold tracking-widest uppercase">
              重新排路
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
             <div className="text-center mb-2">
                <span className={`text-2xl font-black ${gameState === 'success' ? 'text-[#7d8570]' : 'text-[#a78b75]'}`}>
                  {gameState === 'success' ? '任務完成！' : '配送失敗'}
                </span>
             </div>
             {gameState === 'success' ? (
                <button 
                  onClick={() => setLevelIndex(prev => (prev + 1) % LEVELS.length)}
                  className="w-full py-4 bg-[#7d8570] text-white tracking-[0.3em] font-bold text-sm rounded-2xl shadow-lg active:scale-95"
                >
                  下一關 ➔
                </button>
             ) : (
                <button 
                  onClick={() => resetLevel()}
                  className="w-full py-4 bg-[#a78b75] text-white tracking-[0.3em] font-bold text-sm rounded-2xl shadow-lg active:scale-95"
                >
                  再試一次
                </button>
             )}
          </div>
        )}
      </footer>
    </div>
  );
}
