
import { PipeType, LevelData, CustomerType } from './types';

export const LEVELS: LevelData[] = [
  {
    id: 1,
    gridSize: { rows: 4, cols: 4 }, // 縮小網格使簡單化
    startPos: { x: 0, y: 0, rotation: 1 }, // 起點在左上，開口向東
    exitPos: { x: 3, y: 3, rotation: 3 },  // 終點在右下，開口向西
    customers: [
      { x: 1, y: 0, type: CustomerType.NORMAL },
      { x: 2, y: 3, type: CustomerType.VIP }
    ],
    targetCustomerCount: 1,
    initialPipes: [
      // 確保一條簡單的主幹道
      { x: 1, y: 0, type: PipeType.STRAIGHT, rotation: 1 },
      { x: 2, y: 0, type: PipeType.CORNER, rotation: 1 },
      { x: 2, y: 1, type: PipeType.STRAIGHT, rotation: 0 },
      { x: 2, y: 2, type: PipeType.TEE, rotation: 2 },
      { x: 3, y: 2, type: PipeType.CORNER, rotation: 2 },
      // 其餘格子隨機填充 (App.tsx 會處理剩餘未指定的格子)
    ]
  },
  {
    id: 2,
    gridSize: { rows: 5, cols: 5 },
    startPos: { x: 0, y: 2, rotation: 1 }, 
    exitPos: { x: 4, y: 2, rotation: 3 },  
    customers: [
      { x: 1, y: 1, type: CustomerType.NORMAL },
      { x: 2, y: 2, type: CustomerType.VIP },
      { x: 3, y: 3, type: CustomerType.NORMAL }
    ],
    targetCustomerCount: 2,
    initialPipes: [
      { x: 1, y: 2, type: PipeType.CROSS, rotation: 0 },
      { x: 2, y: 2, type: PipeType.TEE, rotation: 1 },
      { x: 3, y: 2, type: PipeType.STRAIGHT, rotation: 1 },
      // 豐富的路徑選擇
      { x: 1, y: 1, type: PipeType.CORNER, rotation: 3 },
      { x: 2, y: 1, type: PipeType.STRAIGHT, rotation: 1 },
      { x: 3, y: 1, type: PipeType.CORNER, rotation: 2 },
    ]
  }
];

export const PIPE_OPENINGS: Record<PipeType, number[]> = {
  [PipeType.STRAIGHT]: [0, 2], 
  [PipeType.CORNER]: [2, 1],   
  [PipeType.TEE]: [3, 1, 2],    
  [PipeType.CROSS]: [0, 1, 2, 3], 
  [PipeType.START]: [1, 2], 
  [PipeType.EXIT]: [0, 3],  
  [PipeType.EMPTY]: [],
};
