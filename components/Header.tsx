
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
  const diffColors = {
    [Difficulty.EASY]: 'bg-green-100 text-green-700',
    [Difficulty.MEDIUM]: 'bg-blue-100 text-blue-700',
    [Difficulty.HARD]: 'bg-rose-100 text-rose-700',
  };

  return (
    <header className="px-6 pt-8 pb-4 flex flex-col gap-4 shrink-0 bg-white/70 backdrop-blur-md border-b border-gray-100 z-20">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-gray-800 tracking-tight">小城外送日誌</h1>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${diffColors[difficulty]}`}>
              {difficulty}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">區域地圖加載完成</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
             🔥 連送中 {streak}
          </span>
          <span className="text-xs font-black text-gray-700">LEVEL {levelId}/{totalLevels}</span>
        </div>
      </div>

      <div className="relative w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-amber-400 transition-all duration-1000 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-3xl font-black text-gray-800 leading-none">
            ${score.toLocaleString()}
          </span>
          <span className="text-[9px] text-gray-400 uppercase font-black mt-1">累積小費收益</span>
        </div>
        <div className="bg-gray-800 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg scale-90 origin-right">
           <span className="text-[10px] font-bold">地圖尺寸</span>
           <span className="text-xs font-black text-amber-400">{gridCols}x{gridRows}</span>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);