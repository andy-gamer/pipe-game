
import React from 'react';
import { PipeType, CellData, CustomerType } from '../types.ts';
import { PIPE_OPENINGS } from '../constants.ts';

interface CellProps {
  cell: CellData;
  isConnectedToStart: boolean;
  isDriving: boolean;
  isCurrentScooterPos: boolean;
  onRotate: (id: string) => void;
  gridSize: number;
  isEntryCell?: boolean;
  isExitCell?: boolean;
  isTutorialTarget?: boolean;
}

const Cell: React.FC<CellProps> = ({ 
  cell, 
  isConnectedToStart, 
  isDriving, 
  isCurrentScooterPos, 
  onRotate, 
  gridSize, 
  isEntryCell, 
  isExitCell,
  isTutorialTarget 
}) => {
  // Define isVisited at the top level of the component so it's accessible in the return statement
  const isVisited = cell.isVisited;

  // 取得當前旋轉後的開口方向
  const getOpenings = () => {
    const base = PIPE_OPENINGS[cell.type] || [];
    return base.map(dir => (dir + cell.rotation) % 4);
  };

  const openings = getOpenings();

  const renderPipe = () => {
    let pipeColor = 'stroke-[#d1d5db]';
    let glowColor = 'stroke-transparent';
    
    if (isConnectedToStart) {
      pipeColor = 'stroke-[#a78b75]';
      glowColor = 'stroke-[#a78b75]/20';
    }
    if (isVisited) {
      pipeColor = 'stroke-[#7d8570]';
      glowColor = 'stroke-[#7d8570]/40';
    }
    if (isCurrentScooterPos) {
      pipeColor = 'stroke-[#fbbf24]';
      glowColor = 'stroke-[#fbbf24]/60';
    }

    const strokeWidth = 16;
    const glowWidth = 24;

    const renderSegment = (Component: any, props: any) => (
      <React.Fragment key={props.d || props.x1}>
        <Component {...props} className={`${glowColor} transition-all duration-300`} strokeWidth={glowWidth} strokeLinecap="round" />
        <Component {...props} className={`${pipeColor} transition-all duration-300`} strokeWidth={strokeWidth} strokeLinecap="round" />
      </React.Fragment>
    );

    // SVG 內部座標為 100x100
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
        ${isCurrentScooterPos ? 'scale-110 z-30' : ''}
        ${isVisited && !isCurrentScooterPos ? 'bg-[#7d8570]/5' : ''}
        ${isTutorialTarget ? 'ring-2 ring-inset ring-[#fbbf24] bg-[#fbbf24]/10 animate-pulse z-40' : ''}
      `}
      style={{ width: `${gridSize}px`, height: `${gridSize}px` }}
      onClick={() => !isDriving && onRotate(cell.id)}
    >
      {/* 視覺輔助：連接點 (Interface Dots) */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {openings.includes(0) && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-current rounded-full" />}
        {openings.includes(1) && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-current rounded-full" />}
        {openings.includes(2) && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-current rounded-full" />}
        {openings.includes(3) && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-current rounded-full" />}
      </div>

      {isTutorialTarget && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-2xl animate-bounce pointer-events-none drop-shadow-lg">
          👇
        </div>
      )}

      {isEntryCell && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 opacity-40 pointer-events-none text-[8px] font-bold text-[#a78b75]">▶</div>}
      {isExitCell && <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 opacity-40 pointer-events-none text-[8px] font-bold text-[#a78b75]">▶</div>}

      {isCurrentScooterPos && <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping scale-75 pointer-events-none" />}

      <svg 
        viewBox="0 0 100 100" 
        className={`w-full h-full transform transition-all duration-300 
          ${isConnectedToStart ? 'text-[#a78b75]' : 'text-[#d1d5db]'}
          ${isVisited ? 'text-[#7d8570]' : ''}
          ${isCurrentScooterPos ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : ''}
        `}
        style={{ transform: `rotate(${cell.rotation * 90}deg)` }}
      >
        {renderPipe()}
      </svg>
      
      {cell.hasCustomer && !isVisited && (
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
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-bounce">
           <span className="text-2xl drop-shadow-md">🛵</span>
        </div>
      )}
    </div>
  );
};

export default Cell;
