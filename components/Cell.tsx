
import React from 'react';
import { PipeType, CellData, CustomerType } from '../types.ts';

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
  cell, isConnectedToStart, isDriving, isCurrentScooterPos, onRotate, gridSize, isEntryCell, isExitCell, isTutorialTarget 
}) => {
  const isVisited = cell.isVisited;
  const isHinted = cell.isHinted;

  const renderRoad = () => {
    let roadColor = isConnectedToStart ? '#718096' : '#cbd5e0';
    let dashColor = isConnectedToStart ? '#ffffffaa' : '#ffffff44';
    
    if (isVisited) roadColor = '#4a5568';
    if (isCurrentScooterPos) roadColor = '#f687b3'; // 送花中變粉色
    if (isHinted) roadColor = '#fbbf24';

    const roadWidth = 44;
    const dashWidth = 2;

    switch (cell.type) {
      case PipeType.STRAIGHT:
        return (
          <>
            <line x1="50" y1="0" x2="50" y2="100" stroke={roadColor} strokeWidth={roadWidth} strokeLinecap="butt" />
            <line x1="50" y1="5" x2="50" y2="95" stroke={dashColor} strokeWidth={dashWidth} strokeDasharray="8,8" />
            <line x1={50 - roadWidth/2} y1="0" x2={50 - roadWidth/2} y2="100" stroke="#edf2f7" strokeWidth="1" />
            <line x1={50 + roadWidth/2} y1="0" x2={50 + roadWidth/2} y2="100" stroke="#edf2f7" strokeWidth="1" />
          </>
        );
      case PipeType.CORNER:
        return (
          <>
            <path d="M 50 100 Q 50 50 100 50" fill="none" stroke={roadColor} strokeWidth={roadWidth} strokeLinecap="butt" />
            <path d="M 50 100 Q 50 50 100 50" fill="none" stroke={dashColor} strokeWidth={dashWidth} strokeDasharray="10,10" />
          </>
        );
      default: return null;
    }
  };

  const getCustomerEmoji = () => {
    switch(cell.customerType) {
      case CustomerType.WEDDING: return '👰';
      case CustomerType.ROMANCE: return '💝';
      default: return '💐';
    }
  };

  const getCustomerColor = () => {
    switch(cell.customerType) {
      case CustomerType.WEDDING: return 'bg-white border-amber-400 ring-2 ring-amber-100';
      case CustomerType.ROMANCE: return 'bg-rose-50 border-rose-300';
      default: return 'bg-white border-blue-100';
    }
  };

  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-300 rounded-sm overflow-visible
        cursor-pointer bg-[#f9fafb] border-[0.5px] border-gray-100
        ${isConnectedToStart ? 'z-10' : 'z-0'}
        ${isCurrentScooterPos ? 'scale-105 z-30' : ''}
        ${isHinted ? 'ring-4 ring-amber-300/60 shadow-[0_0_20px_rgba(251,191,36,0.5)] z-40 animate-pulse' : ''}
      `}
      style={{ width: `${gridSize}px`, height: `${gridSize}px` }}
      onClick={() => !isDriving && onRotate(cell.id)}
    >
      <div className="absolute inset-0 border border-gray-200/10 pointer-events-none" />
      {isEntryCell && <div className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 text-[10px] animate-bounce">🏠</div>}
      {isExitCell && <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-[10px]">📍</div>}
      {isHinted && <div className="absolute -inset-1 bg-amber-400/20 rounded-lg animate-ping" />}

      <svg 
        viewBox="0 0 100 100" 
        className={`w-full h-full transform transition-transform duration-300 ${isCurrentScooterPos ? 'drop-shadow-lg' : 'drop-shadow-sm'}`}
        style={{ transform: `rotate(${cell.rotation * 90}deg)` }}
      >
        {renderRoad()}
      </svg>
      
      {cell.hasCustomer && !isVisited && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-md">
          <div className={`relative rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 transition-all ${getCustomerColor()}`}>
             <span className="text-sm">{getCustomerEmoji()}</span>
          </div>
        </div>
      )}

      {isCurrentScooterPos && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
           <span className="text-2xl drop-shadow-lg -mt-1 transform -rotate-12">🚲🌸</span>
        </div>
      )}
    </div>
  );
};

export default Cell;
