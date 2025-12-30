
import React from 'react';
import { CellData, CustomerType, LevelData } from '../types.ts';
import Cell from './Cell.tsx';

interface ScorePopup {
  id: string;
  x: number;
  y: number;
  value: number;
  type: CustomerType;
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
  grid,
  currentLevel,
  reachableFromStart,
  isDriving,
  currentScooterId,
  onRotate,
  cellSize,
  scorePopups,
  tutorialHighlight,
  tutorialTargetId,
  setScorePopups
}) => {
  return (
    <div className={`flex items-center gap-1 transition-all duration-500 ${tutorialHighlight ? 'z-[101] relative' : ''}`}>
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
        className={`bg-white p-2 rounded-2xl border-2 border-[#f0ece2] relative shadow-xl transition-all z-10
          ${tutorialHighlight ? 'ring-4 ring-[#a78b75] ring-offset-4 ring-offset-[#fdfbf7]' : ''}`}
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
              onRotate={onRotate}
              gridSize={cellSize}
              isEntryCell={x === 0 && y === currentLevel.startRow}
              isExitCell={x === currentLevel.gridSize.cols - 1 && y === currentLevel.exitRow}
              isTutorialTarget={tutorialTargetId === cell.id}
            />
          ))
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
  );
};

export default React.memo(GameBoard);
