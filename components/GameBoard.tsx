
import React from 'react';
import { CellData, CustomerType, LevelData } from '../types.ts';
import Cell from './Cell.tsx';

interface ScorePopup {
  id: string; x: number; y: number; value: number; type: CustomerType;
}

interface GameBoardProps {
  grid: CellData[][];
  currentLevel: LevelData;
  reachableFromStart: Set<string>;
  isDriving: boolean;
  currentScooterId: string | null;
  onRotate: (id: string) => void;
  cellSize: number;
  scorePopups: ScorePopup[];
  tutorialHighlight: boolean;
  tutorialTargetId: string | null;
  setScorePopups: React.Dispatch<React.SetStateAction<ScorePopup[]>>;
}

const GameBoard: React.FC<GameBoardProps> = ({
  grid, currentLevel, reachableFromStart, isDriving, currentScooterId, onRotate, cellSize, scorePopups, tutorialHighlight, tutorialTargetId, setScorePopups
}) => {
  return (
    <div className={`flex items-center gap-2 transition-all duration-500 p-4 ${tutorialHighlight ? 'z-[101] relative' : ''}`}>
      
      {/* 左側：花店門市 */}
      <div className="flex flex-col justify-center items-center gap-4" style={{ height: `${currentLevel.gridSize.rows * cellSize}px` }}>
        {Array.from({ length: currentLevel.gridSize.rows }).map((_, r) => (
          <div key={r} className="flex flex-col items-center justify-center" style={{ height: `${cellSize}px`, width: '48px' }}>
            {r === currentLevel.startRow ? (
              <div className="flex flex-col items-center gap-1 animate-pulse">
                <div className="text-2xl">🏡</div>
                <div className="text-[8px] font-bold text-rose-400 bg-rose-50 px-1 border border-rose-100 rounded">花店</div>
              </div>
            ) : (
              <div className="text-lg opacity-10 grayscale">🌷</div>
            )}
          </div>
        ))}
      </div>

      {/* 配送地圖 */}
      <div 
        className={`bg-[#fdf2f8] p-2 rounded-xl street-shadow relative transition-all border-4 border-[#fbcfe8]
          ${tutorialHighlight ? 'ring-8 ring-rose-400/30' : ''}`}
        style={{ 
          display: 'grid', gridTemplateColumns: `repeat(${currentLevel.gridSize.cols}, 1fr)`, width: 'fit-content'
        }}
      >
        {grid.map((row, y) => 
          row.map((cell, x) => (
            <Cell 
              key={cell.id} cell={cell} isConnectedToStart={reachableFromStart.has(cell.id)}
              isDriving={isDriving} isCurrentScooterPos={currentScooterId === cell.id}
              onRotate={onRotate} gridSize={cellSize}
              isEntryCell={x === 0 && y === currentLevel.startRow}
              isExitCell={x === currentLevel.gridSize.cols - 1 && y === currentLevel.exitRow}
              isTutorialTarget={tutorialTargetId === cell.id}
            />
          ))
        )}

        {scorePopups.map(popup => (
          <div key={popup.id} className={`absolute pointer-events-none animate-bounce font-black z-50 flex items-center gap-1
              ${popup.type === CustomerType.WEDDING ? 'text-rose-600 text-xl' : 'text-pink-500 text-sm'}`}
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

      {/* 右側：目的地 */}
      <div className="flex flex-col justify-center items-center gap-4" style={{ height: `${currentLevel.gridSize.rows * cellSize}px` }}>
        {Array.from({ length: currentLevel.gridSize.rows }).map((_, r) => (
          <div key={r} className="flex flex-col items-center justify-center" style={{ height: `${cellSize}px`, width: '48px' }}>
            {r === currentLevel.exitRow ? (
              <div className="flex flex-col items-center gap-1">
                <div className="text-2xl">{currentLevel.difficulty === 'HARD' ? '💒' : '🏡'}</div>
                <div className={`text-[8px] font-bold px-1 rounded shadow-sm ${reachableFromStart.has(`${currentLevel.gridSize.cols - 1}-${currentLevel.exitRow}`) ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  目的地
                </div>
              </div>
            ) : (
              <div className="text-lg opacity-10 grayscale">{r % 2 === 0 ? '🌳' : '🏘️'}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(GameBoard);
