
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
    // 沒連結到的地方是灰色，連結到的是品牌色
    const pipeColor = isConnectedToStart ? 'stroke-[#a78b75]' : 'stroke-[#d1d5db]';
    const strokeWidth = 14;

    switch (cell.type) {
      case PipeType.STRAIGHT:
        return (
          <line x1="50" y1="0" x2="50" y2="100" className={`${pipeColor} transition-colors duration-300`} strokeWidth={strokeWidth} strokeLinecap="round" />
        );
      case PipeType.CORNER:
        return (
          <path d="M 50 100 Q 50 50 100 50" fill="transparent" className={`${pipeColor} transition-colors duration-300`} strokeWidth={strokeWidth} strokeLinecap="round" />
        );
      case PipeType.TEE:
        return (
          <>
            <line x1="0" y1="50" x2="100" y2="50" className={`${pipeColor} transition-colors duration-300`} strokeWidth={strokeWidth} strokeLinecap="round" />
            <line x1="50" y1="50" x2="50" y2="100" className={`${pipeColor} transition-colors duration-300`} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );
      case PipeType.CROSS:
        return (
          <>
            <line x1="0" y1="50" x2="100" y2="50" className={`${pipeColor} transition-colors duration-300`} strokeWidth={strokeWidth} strokeLinecap="round" />
            <line x1="50" y1="0" x2="50" y2="100" className={`${pipeColor} transition-colors duration-300`} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );
      case PipeType.START: 
        return (
          <g>
             <rect x="10" y="30" width="40" height="40" rx="8" fill="#a78b75" />
             <line x1="50" y1="50" x2="100" y2="50" className="stroke-[#a78b75]" strokeWidth={strokeWidth} strokeLinecap="round" />
             <text x="30" y="58" fontSize="22" textAnchor="middle">🛵</text>
          </g>
        );
      case PipeType.EXIT: 
        return (
          <g>
            <rect x="40" y="20" width="50" height="60" rx="4" fill="#7d8570" />
            <line x1="0" y1="50" x2="40" y2="50" className={isConnectedToStart ? "stroke-[#7d8570]" : "stroke-[#d1d5db]"} strokeWidth={strokeWidth} strokeLinecap="round" />
            <text x="65" y="58" fontSize="20" textAnchor="middle">☕</text>
          </g>
        );
      default:
        return null;
    }
  };

  const isInteractive = cell.type !== PipeType.START && cell.type !== PipeType.EXIT;

  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-200 rounded-sm
        ${isInteractive ? 'cursor-pointer hover:bg-[#faf6f0] active:scale-95' : ''}
      `}
      style={{ width: `${gridSize}px`, height: `${gridSize}px` }}
      onClick={() => isInteractive && !isDriving && onRotate(cell.id)}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full transform transition-transform duration-300"
        style={{ transform: `rotate(${cell.rotation * 90}deg)` }}
      >
        {renderPipe()}
      </svg>
      
      {cell.hasCustomer && !cell.isVisited && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`relative rounded-full w-8 h-8 flex flex-col items-center justify-center shadow-md border-2 
            ${cell.customerType === CustomerType.VIP ? 'bg-[#fef3c7] border-[#fbbf24]' : 'bg-white border-[#e5e7eb]'}`}>
             <span className="text-sm leading-none">🙋</span>
             <span className={`absolute -bottom-2 px-1 rounded-sm text-[7px] font-black tracking-tighter text-white shadow-sm
               ${cell.customerType === CustomerType.VIP ? 'bg-[#fbbf24]' : 'bg-[#9ca3af]'}`}>
               {cell.customerType === CustomerType.VIP ? 'VIP' : '+300'}
             </span>
          </div>
        </div>
      )}

      {isCurrentScooterPos && cell.type !== PipeType.START && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
           <span className="text-xl drop-shadow-md">🛵</span>
        </div>
      )}
    </div>
  );
};

export default Cell;
