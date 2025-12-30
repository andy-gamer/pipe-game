
import React from 'react';

interface ControlPanelProps {
  gameState: 'playing' | 'success' | 'failed';
  isDriving: boolean;
  hasPathToExit: boolean;
  tutorialStep: number;
  onCheckDelivery: () => void;
  onResetLevel: () => void;
  onNextLevel: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  gameState,
  isDriving,
  hasPathToExit,
  tutorialStep,
  onCheckDelivery,
  onResetLevel,
  onNextLevel
}) => {
  return (
    <footer className="px-8 py-10 shrink-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
      {gameState === 'playing' ? (
        <div className="flex flex-col gap-4">
          <button 
            onClick={onCheckDelivery}
            disabled={isDriving}
            className={`group relative w-full py-4 text-white tracking-[0.2em] font-black text-sm rounded-2xl shadow-xl transition-all btn-active
              ${tutorialStep === 3 ? 'z-[101] ring-4 ring-amber-400 ring-offset-4 ring-offset-white' : ''}
              ${isDriving ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'}
              ${hasPathToExit && !isDriving ? 'scale-[1.02] shadow-amber-200' : ''}
            `}
          >
            <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            {isDriving ? '配送中...' : '出發送餐！ 🛵'}
          </button>
          
          <button 
            onClick={onResetLevel} 
            className="text-[10px] text-gray-400 hover:text-amber-500 font-black tracking-widest uppercase py-1 transition-colors"
          >
            重新生成街道地圖
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
           <div className="text-center">
              <span className={`text-2xl font-black tracking-tight ${gameState === 'success' ? 'text-green-600' : 'text-rose-600'}`}>
                {gameState === 'success' ? '✨ 配送圓滿達成！' : '❌ 配送出錯了...'}
              </span>
           </div>
           
           {gameState === 'success' ? (
              <button 
                onClick={onNextLevel}
                className="w-full py-5 bg-gray-800 text-white tracking-[0.2em] font-black text-sm rounded-2xl shadow-2xl btn-active border-b-4 border-gray-950"
              >
                接下個訂單 ➔
              </button>
           ) : (
              <button 
                onClick={onResetLevel}
                className="w-full py-5 bg-rose-500 text-white tracking-[0.2em] font-black text-sm rounded-2xl shadow-2xl btn-active border-b-4 border-rose-700"
              >
                再次挑戰此區域
              </button>
           )}
        </div>
      )}
    </footer>
  );
};

export default React.memo(ControlPanel);