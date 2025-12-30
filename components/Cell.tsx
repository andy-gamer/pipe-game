
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
  const isVisited = cell.isVisited;

  const renderRoad = () => {
    // 街道顏色：灰色(預設)、深灰(接通)、暖黃(正在行駛)
    let roadColor = isConnectedToStart ? '#4a5568' : '#cbd5e0';
    let dashColor = isConnectedToStart ? '#ffffffaa' : '#ffffff44';
    
    if (isVisited) roadColor = '#2d3748';
    if (isCurrentScooterPos) roadColor = '#f59e0b'; // 暖黃色燈光感

    const roadWidth = 44;
    const dashWidth = 2;

    switch (cell.type) {
      case PipeType.STRAIGHT:
        return (
          <>
            {/* 路基 */}
            <line x1="50" y1="0" x2="50" y2="100" stroke={roadColor} strokeWidth={roadWidth} strokeLinecap="butt" />
            {/* 中央分隔線 */}
            <line x1="50" y1="5" x2="50" y2="95" stroke={dashColor} strokeWidth={dashWidth} strokeDasharray="8,8" />
            {/* 路沿石 */}
            <line x1={50 - roadWidth/2} y1="0" x2={50 - roadWidth/2} y2="100" stroke="#a0aec0" strokeWidth="2" />
            <line x1={50 + roadWidth/2} y1="0" x2={50 + roadWidth/2} y2="100" stroke="#a0aec0" strokeWidth="2" />
          </>
        );
      case PipeType.CORNER:
        return (
          <>
            {/* 轉角綠地 */}
            <path d="M 0 0 L 25 0 Q 25 25 0 25 Z" fill="#d9f99d" opacity="0.4" />
            {/* 路基 */}
            <path d="M 50 100 Q 50 50 100 50" fill="none" stroke={roadColor} strokeWidth={roadWidth} strokeLinecap="butt" />
            {/* 中央分隔線 */}
            <path d="M 50 100 Q 50 50 100 50" fill="none" stroke={dashColor} strokeWidth={dashWidth} strokeDasharray="10,10" />
            {/* 路沿石 */}
            <path d="M {50 - roadWidth/2} 100 Q {50 - roadWidth/2} {50 - roadWidth/2} 100 {50 - roadWidth/2}" fill="none" stroke="#a0aec0" strokeWidth="2" />
            <path d="M {50 + roadWidth/2} 100 Q {50 + roadWidth/2} {50 + roadWidth/2} 100 {50 + roadWidth/2}" fill="none" stroke="#a0aec0" strokeWidth="2" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-300 rounded-sm overflow-visible
        cursor-pointer bg-[#f9fafb] border-[0.5px] border-gray-100
        ${isConnectedToStart ? 'z-10' : 'z-0'}
        ${isCurrentScooterPos ? 'scale-105 z-30' : ''}
        ${isTutorialTarget ? 'ring-2 ring-inset ring-amber-400 bg-amber-50 animate-pulse z-40' : ''}
      `}
      style={{ width: `${gridSize}px`, height: `${gridSize}px` }}
      onClick={() => !isDriving && onRotate(cell.id)}
    >
      {/* 基礎地磚感 */}
      <div className="absolute inset-0 border border-gray-200/30 pointer-events-none" />

      {isEntryCell && <div className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 text-[10px] animate-pulse">🚩</div>}
      {isExitCell && <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-[10px]">🏁</div>}

      <svg 
        viewBox="0 0 100 100" 
        className={`w-full h-full transform transition-transform duration-300 
          ${isCurrentScooterPos ? 'drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'drop-shadow-sm'}
        `}
        style={{ transform: `rotate(${cell.rotation * 90}deg)` }}
      >
        {renderRoad()}
      </svg>
      
      {cell.hasCustomer && !isVisited && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-md">
          <div className={`relative rounded-full w-8 h-8 flex flex-col items-center justify-center shadow-md border-2 transition-all
            ${cell.customerType === CustomerType.VIP 
              ? 'bg-amber-100 border-amber-400 scale-110' 
              : 'bg-white border-blue-100'}`}>
             <span className="text-sm leading-none">{cell.customerType === CustomerType.VIP ? '👑' : '🙋'}</span>
          </div>
        </div>
      )}

      {isCurrentScooterPos && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
           <span className="text-2xl drop-shadow-lg -mt-1 transform -rotate-12">🛵</span>
        </div>
      )}
    </div>
  );
};

export default Cell;