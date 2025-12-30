
import React, { useMemo } from 'react';

const ConfettiOverlay: React.FC = () => {
  const pieces = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: ['#d4a373', '#7d8570', '#fbbf24', '#faedcd', '#ccd5ae'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1.5,
      size: 6 + Math.random() * 8
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
            height: `${p.size}px`,
            borderRadius: p.id % 2 === 0 ? '50%' : '2px'
          }}
        />
      ))}
    </div>
  );
};

export default React.memo(ConfettiOverlay);
