
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
  isEditorMode: boolean;
  toggleEditor: () => void;
}

const Header: React.FC<HeaderProps> = ({
  levelId, totalLevels, score, streak, difficulty, progressPercentage, gridCols, gridRows, isEditorMode, toggleEditor
}) => {
  const diffColors = {
    [Difficulty.EASY]: 'bg-emerald-50 text-emerald-600',
    [Difficulty.MEDIUM]: 'bg-purple-50 text-purple-600',
    [Difficulty.HARD]: 'bg-rose-50 text-rose-600',
  };

  return (
    <header className="px-6 pt-8 pb-4 flex flex-col gap-4 shrink-0 bg-white/80 backdrop-blur-md border-b border-rose-50 z-20">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-rose-800 tracking-tight">小城花語快遞</h1>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${diffColors[difficulty]}`}>
              {difficulty}
            </span>
            <button 
              onClick={toggleEditor}
              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase transition-colors ${isEditorMode ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              {isEditorMode ? '編輯中' : '自定義'}
            </button>
          </div>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">讓每一份思念都能準時抵達</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
             🌸 連續送達 {streak}
          </span>
          <span className="text-xs font-black text-gray-600">訂單 {levelId}/{totalLevels}</span>
        </div>
      </div>

      <div className="relative w-full h-1.5 bg-rose-50 rounded-full overflow-hidden">
        <div className="h-full bg-rose-400 transition-all duration-1000 ease-out" style={{ width: `${progressPercentage}%` }} />
      </div>

      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-3xl font-black text-gray-800 leading-none">
            ${score.toLocaleString()}
          </span>
          <span className="text-[9px] text-rose-400 uppercase font-black mt-1">累積送花酬勞</span>
        </div>
        <div className="bg-rose-800 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg scale-90 origin-right">
           <span className="text-[10px] font-bold">配送範圍</span>
           <span className="text-xs font-black text-pink-200">{gridCols}x{gridRows}</span>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
