
import React from 'react';

interface ControlPanelProps {
  gameState: 'playing' | 'success' | 'failed';
  isDriving: boolean;
  hasPathToExit: boolean;
  tutorialStep: number;
  hintsRemaining: number;
  onCheckDelivery: () => void;
  onResetLevel: () => void;
  onRetryLevel: () => void;
  onNextLevel: () => void;
  onHint: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  gameState,
  isDriving,
  hasPathToExit,
  tutorialStep,
  hintsRemaining,
  onCheckDelivery,
  onResetLevel,
  onRetryLevel,
  onNextLevel,
  onHint
}) => {
  return (
    <footer className="px-8 py-8 shrink-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
      {gameState === 'playing' ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
             <button 
              onClick={onCheckDelivery}
              disabled={isDriving}
              className={`group relative flex-1 py-4 text-white tracking-[0.2em] font-black text-sm rounded-2xl shadow-xl transition-all btn-active
                ${tutorialStep === 3 ? 'z-[101] ring-4 ring-amber-400 ring-offset-4 ring-offset-white' : ''}
                ${isDriving ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'}
                ${hasPathToExit && !isDriving ? 'scale-[1.02] shadow-amber-200' : ''}
              `}
            >
              {isDriving ? '配送中...' : '出發送餐！ 🛵'}
            </button>

            <button
              onClick={onHint}
              disabled={isDriving || hintsRemaining <= 0}
              className={`w-16 h-14 rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg btn-active
                ${hintsRemaining > 0 ? 'bg-amber-50 text-amber-500 border border-amber-200' : 'bg-gray-50 text-gray-300 border border-gray-100'}
              `}
            >
              <span className="text-xl">💡</span>
              <span className="text-[10px] font-black">{hintsRemaining}</span>
            </button>
          </div>
          
          <button 
            onClick={onResetLevel} 
            className="text-[10px] text-gray-400 hover:text-amber-500 font-black tracking-widest uppercase py-1 transition-colors"
          >
            換一張新的地圖
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
              <div className="flex flex-col gap-3">
                <button 
                  onClick={onRetryLevel}
                  className="w-full py-5 bg-amber-500 text-white tracking-[0.2em] font-black text-sm rounded-2xl shadow-2xl btn-active border-b-4 border-amber-700"
                >
                  再次挑戰同區域
                </button>
                <button 
                  onClick={onResetLevel}
                  className="w-full py-3 bg-white text-gray-400 border border-gray-200 tracking-[0.1em] font-bold text-[10px] rounded-xl btn-active"
                >
                  放棄此區域，重新生成
                </button>
              </div>
           )}
        </div>
      )}
    </footer>
  );
};

export default React.memo(ControlPanel);
