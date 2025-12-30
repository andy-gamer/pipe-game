
import { PipeType, LevelData, CustomerType, Difficulty } from './types';

export const LEVELS: LevelData[] = [
  {
    id: 1,
    difficulty: Difficulty.EASY,
    gridSize: { rows: 4, cols: 4 },
    startRow: 0,
    exitRow: 3,
    customers: [
      { x: 1, y: 0, type: CustomerType.NORMAL },
      { x: 2, y: 3, type: CustomerType.VIP }
    ],
    targetCustomerCount: 1,
    initialPipes: [
      { x: 0, y: 0, type: PipeType.CORNER, rotation: 1 },
      { x: 3, y: 3, type: PipeType.CORNER, rotation: 3 },
    ]
  },
  {
    id: 2,
    difficulty: Difficulty.EASY,
    gridSize: { rows: 4, cols: 4 },
    startRow: 1,
    exitRow: 1,
    customers: [
      { x: 1, y: 1, type: CustomerType.NORMAL },
      { x: 2, y: 1, type: CustomerType.NORMAL }
    ],
    targetCustomerCount: 1,
    initialPipes: []
  },
  {
    id: 3,
    difficulty: Difficulty.MEDIUM,
    gridSize: { rows: 5, cols: 5 },
    startRow: 2,
    exitRow: 2,
    customers: [
      { x: 1, y: 1, type: CustomerType.NORMAL },
      { x: 2, y: 2, type: CustomerType.VIP },
      { x: 3, y: 3, type: CustomerType.NORMAL }
    ],
    targetCustomerCount: 2,
    initialPipes: [
      { x: 2, y: 2, type: PipeType.CROSS, rotation: 0 },
    ]
  },
  {
    id: 4,
    difficulty: Difficulty.MEDIUM,
    gridSize: { rows: 5, cols: 5 },
    startRow: 0,
    exitRow: 4,
    customers: [
      { x: 0, y: 4, type: CustomerType.VIP },
      { x: 4, y: 0, type: CustomerType.NORMAL }
    ],
    targetCustomerCount: 2,
    initialPipes: []
  },
  {
    id: 5,
    difficulty: Difficulty.HARD,
    gridSize: { rows: 6, cols: 6 },
    startRow: 1,
    exitRow: 4,
    customers: [
      { x: 2, y: 2, type: CustomerType.VIP },
      { x: 3, y: 3, type: CustomerType.VIP },
      { x: 4, y: 1, type: CustomerType.NORMAL }
    ],
    targetCustomerCount: 3,
    initialPipes: []
  }
];

export const PIPE_OPENINGS: Record<PipeType, number[]> = {
  [PipeType.STRAIGHT]: [0, 2], 
  [PipeType.CORNER]: [1, 2],   
  [PipeType.TEE]: [1, 2, 3],    
  [PipeType.CROSS]: [0, 1, 2, 3], 
  [PipeType.EMPTY]: [],
};
