
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
    <footer className="px-6 py-8 shrink-0 bg-white/80 backdrop-blur-md border-t border-[#f0ece2] z-20">
      {gameState === 'playing' ? (
        <div className="flex flex-col gap-4">
          <button 
            onClick={onCheckDelivery}
            disabled={isDriving}
            className={`w-full py-4 text-white tracking-[0.4em] font-bold text-sm rounded-2xl shadow-lg transition-all btn-active
              ${tutorialStep === 3 ? 'z-[101] relative ring-4 ring-[#a78b75] ring-offset-4 ring-offset-white' : ''}
              ${isDriving ? 'bg-[#bbb] opacity-50 cursor-not-allowed' : 'bg-[#a78b75] hover:bg-[#8f7562]'}
              ${hasPathToExit && !isDriving ? 'animate-pulse' : ''}
            `}
          >
            GO DELIVERY 🛵
          </button>
          <button onClick={onResetLevel} className="text-[10px] text-[#bbb] hover:text-[#a78b75] font-black tracking-widest uppercase py-1">
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
                onClick={onNextLevel}
                className="w-full py-4 bg-[#7d8570] text-white tracking-[0.3em] font-bold text-sm rounded-2xl shadow-lg btn-active"
              >
                NEXT ORDER ➔
              </button>
           ) : (
              <button 
                onClick={onResetLevel}
                className="w-full py-4 bg-[#a78b75] text-white tracking-[0.3em] font-bold text-sm rounded-2xl shadow-lg btn-active"
              >
                TRY AGAIN
              </button>
           )}
        </div>
      )}
    </footer>
  );
};

export default React.memo(ControlPanel);
