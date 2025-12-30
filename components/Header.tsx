
import React from 'react';
import { Difficulty } from '../types.ts';

interface HeaderProps {
  levelId: number;
  totalLevels: number;
  score: number;
  streak: number;
  difficulty: Difficulty;
  progressPercentage: number;
  gridCols: number;
  gridRows: number;
}

const Header: React.FC<HeaderProps> = ({
  levelId,
  totalLevels,
  score,
  streak,
  difficulty,
  progressPercentage,
  gridCols,
  gridRows
}) => {
  return (
    <header className="px-6 py-4 flex flex-col gap-3 shrink-0 bg-white/50 border-b border-[#f0ece2] z-20">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-xs tracking-widest font-bold text-[#a78b75]">城市外送計畫</h1>
          <span className="text-[10px] text-gray-400 font-medium">Chapter: {difficulty}</span>
        </div>
        <div className="bg-[#a78b75] text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
           LEVEL {levelId} / {totalLevels}
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
             {gridCols}x{gridRows} MAP
           </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
