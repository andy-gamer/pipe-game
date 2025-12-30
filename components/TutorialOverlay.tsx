
import React from 'react';

interface TutorialOverlayProps {
  step: number;
  hasPathToExit: boolean;
  onNext: () => void;
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  step,
  hasPathToExit,
  onNext,
  onClose
}) => {
  if (step === 0) return null;

  const tutorialContent = [
    { 
      text: "歡迎來到巷弄外送！這是你的第一張訂單，點擊發光的水管來開通道路吧。",
      btn: "好，我知道了"
    },
    { 
      text: "太棒了！你的目標是連接 🛵 起點與 ☕ 終點。路徑變色代表已成功接通！",
      btn: "我知道了"
    },
    { 
      text: "路徑已經完全接通了！現在點擊下方的「GO DELIVERY」開始送餐吧！",
      btn: "出發送餐！"
    }
  ];

  const current = tutorialContent[step - 1];
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-6 shadow-2xl max-w-xs w-full pointer-events-auto border-t-4 border-[#a78b75] animate-in fade-in zoom-in duration-300">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#a78b75] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
          新手指南 {step}/3
        </div>
        <p className="text-sm font-medium text-gray-700 leading-relaxed mb-5 mt-2 text-center">
          {current.text}
        </p>
        <button 
          onClick={onNext}
          className="w-full py-3 bg-[#a78b75] text-white rounded-xl text-xs font-bold tracking-widest shadow-md active:scale-95 transition-all"
        >
          {current.btn}
        </button>
      </div>
    </div>
  );
};

export default React.memo(TutorialOverlay);
