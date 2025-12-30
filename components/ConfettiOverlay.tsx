
import React, { useMemo } from 'react';

const ConfettiOverlay: React.FC = () => {
  const pieces = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: ['#fbcfe8', '#fce7f3', '#fdf2f8', '#ffffff', '#fb7185'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 0.5,
      duration: 3 + Math.random() * 2,
      size: 4 + Math.random() * 6
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
            height: `${p.size * 0.8}px`,
            borderRadius: '100% 10% 100% 10%' // 花瓣形狀
          }}
        />
      ))}
    </div>
  );
};

export default React.memo(ConfettiOverlay);
