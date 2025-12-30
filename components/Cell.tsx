
import React from 'react';
import { PipeType, CellData, CustomerType } from '../types';

interface CellProps {
  cell: CellData;
  isConnectedToStart: boolean;
  isDriving: boolean;
  isCurrentScooterPos: boolean;
  onRotate: (id: string) => void;
  gridSize: number;
}

const Cell: React.FC<CellProps> = ({ cell, isConnectedToStart, isDriving, isCurrentScooterPos, onRotate, gridSize }) => {
  const renderPipe = () => {
    // Standard color for inactive pipes, warm brand color for active ones
    const pipeColor = isConnectedToStart ? 'stroke-[#a78b75]' : 'stroke-[#d1d5db]';
    const glowColor = isConnectedToStart ? 'stroke-[#a78b75]/20' : 'stroke-transparent';
    const strokeWidth = 16;
    const glowWidth = 24; // Slightly wider for the glow effect

    const renderSegment = (Component: any, props: any) => (
      <>
        {/* Subtle background glow segment */}
        <Component {...props} className={`${glowColor} transition-all duration-500`} strokeWidth={glowWidth} strokeLinecap="round" />
        {/* Main pipe segment */}
        <Component {...props} className={`${pipeColor} transition-all duration-300`} strokeWidth={strokeWidth} strokeLinecap="round" />
      </>
    );

    switch (cell.type) {
      case PipeType.STRAIGHT:
        return renderSegment('line', { x1: 50, y1: 0, x2: 50, y2: 100 });
      case PipeType.CORNER:
        return renderSegment('path', { d: "M 50 100 Q 50 50 100 50", fill: "transparent" });
      case PipeType.TEE:
        return (
          <>
            {renderSegment('line', { x1: 0, y1: 50, x2: 100, y2: 50 })}
            {renderSegment('line', { x1: 50, y1: 50, x2: 50, y2: 100 })}
          </>
        );
      case PipeType.CROSS:
        return (
          <>
            {renderSegment('line', { x1: 0, y1: 50, x2: 100, y2: 50 })}
            {renderSegment('line', { x1: 50, y1: 0, x2: 50, y2: 100 })}
          </>
        );
      default:
        return null;
    }
  };

  const isVIP = cell.customerType === CustomerType.VIP;

  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-200 rounded-sm overflow-visible
        cursor-pointer hover:bg-[#faf6f0] active:scale-95
        ${isConnectedToStart ? 'z-10' : 'z-0'}
      `}
      style={{ width: `${gridSize}px`, height: `${gridSize}px` }}
      onClick={() => !isDriving && onRotate(cell.id)}
    >
      <svg 
        viewBox="0 0 100 100" 
        className={`w-full h-full transform transition-transform duration-300 ${isConnectedToStart ? 'drop-shadow-[0_0_2px_rgba(167,139,117,0.3)]' : ''}`}
        style={{ transform: `rotate(${cell.rotation * 90}deg)` }}
      >
        {renderPipe()}
      </svg>
      
      {cell.hasCustomer && !cell.isVisited && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`relative rounded-full w-9 h-9 flex flex-col items-center justify-center shadow-lg border-2 transition-all
            ${isVIP 
              ? 'bg-gradient-to-br from-[#fef3c7] to-[#fbbf24] border-[#d97706] scale-110 ring-2 ring-[#fbbf24]/50' 
              : 'bg-white border-[#e5e7eb]'}`}>
             
             {isVIP && <span className="absolute -top-1.5 -right-1.5 text-[10px] animate-pulse">⭐</span>}
             <span className="text-sm leading-none">{isVIP ? '👑' : '🙋'}</span>
             <span className={`absolute -bottom-2.5 px-1.5 rounded-full text-[8px] font-black tracking-tighter text-white shadow-md border border-white/20
               ${isVIP ? 'bg-[#d97706]' : 'bg-[#9ca3af]'}`}>
               {isVIP ? 'VIP' : '+300'}
             </span>
          </div>
        </div>
      )}

      {isCurrentScooterPos && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
           <span className="text-xl drop-shadow-md">🛵</span>
        </div>
      )}
    </div>
  );
};

export default Cell;
