
import { PipeType, LevelData, CustomerType, Difficulty } from './types.ts';

export const LEVELS: LevelData[] = [
  // --- CHAPTER 1: 小鎮啟程 (4x4) ---
  {
    id: 1,
    difficulty: Difficulty.EASY,
    gridSize: { rows: 4, cols: 4 },
    startRow: 0,
    exitRow: 0,
    customers: [{ x: 1, y: 0, type: CustomerType.NORMAL }],
    targetCustomerCount: 1,
    initialPipes: []
  },
  {
    id: 2,
    difficulty: Difficulty.EASY,
    gridSize: { rows: 4, cols: 4 },
    startRow: 1,
    exitRow: 2,
    customers: [{ x: 2, y: 1, type: CustomerType.NORMAL }],
    targetCustomerCount: 1,
    initialPipes: []
  },
  {
    id: 3,
    difficulty: Difficulty.EASY,
    gridSize: { rows: 4, cols: 4 },
    startRow: 3,
    exitRow: 0,
    customers: [{ x: 1, y: 3, type: CustomerType.VIP }, { x: 3, y: 1, type: CustomerType.NORMAL }],
    targetCustomerCount: 2,
    initialPipes: []
  },

  // --- CHAPTER 2: 社區配送 (5x5) ---
  {
    id: 4,
    difficulty: Difficulty.MEDIUM,
    gridSize: { rows: 5, cols: 5 },
    startRow: 0,
    exitRow: 4,
    customers: [
      { x: 2, y: 0, type: CustomerType.NORMAL },
      { x: 2, y: 4, type: CustomerType.VIP }
    ],
    targetCustomerCount: 2,
    initialPipes: []
  },
  {
    id: 5,
    difficulty: Difficulty.MEDIUM,
    gridSize: { rows: 5, cols: 5 },
    startRow: 2,
    exitRow: 2,
    customers: [
      { x: 0, y: 2, type: CustomerType.NORMAL },
      { x: 4, y: 2, type: CustomerType.NORMAL },
      { x: 2, y: 0, type: CustomerType.VIP }
    ],
    targetCustomerCount: 3,
    initialPipes: []
  },
  {
    id: 6,
    difficulty: Difficulty.MEDIUM,
    gridSize: { rows: 5, cols: 5 },
    startRow: 4,
    exitRow: 0,
    customers: [
      { x: 1, y: 1, type: CustomerType.NORMAL },
      { x: 3, y: 3, type: CustomerType.VIP }
    ],
    targetCustomerCount: 2,
    initialPipes: []
  },

  // --- CHAPTER 3: 城市迷宮 (6x6) ---
  {
    id: 7,
    difficulty: Difficulty.HARD,
    gridSize: { rows: 6, cols: 6 },
    startRow: 0,
    exitRow: 5,
    customers: [
      { x: 2, y: 0, type: CustomerType.NORMAL },
      { x: 2, y: 5, type: CustomerType.VIP },
      { x: 5, y: 0, type: CustomerType.NORMAL }
    ],
    targetCustomerCount: 3,
    initialPipes: []
  },
  {
    id: 8,
    difficulty: Difficulty.HARD,
    gridSize: { rows: 6, cols: 6 },
    startRow: 3,
    exitRow: 3,
    customers: [
      { x: 0, y: 0, type: CustomerType.VIP },
      { x: 5, y: 0, type: CustomerType.VIP },
      { x: 0, y: 5, type: CustomerType.NORMAL },
      { x: 5, y: 5, type: CustomerType.NORMAL }
    ],
    targetCustomerCount: 4,
    initialPipes: []
  },
  {
    id: 9,
    difficulty: Difficulty.HARD,
    gridSize: { rows: 7, cols: 7 },
    startRow: 0,
    exitRow: 6,
    customers: [
      { x: 3, y: 3, type: CustomerType.VIP },
      { x: 1, y: 5, type: CustomerType.NORMAL },
      { x: 5, y: 1, type: CustomerType.NORMAL }
    ],
    targetCustomerCount: 3,
    initialPipes: []
  },
  {
    id: 10,
    difficulty: Difficulty.HARD,
    gridSize: { rows: 7, cols: 7 },
    startRow: 6,
    exitRow: 0,
    customers: [
      { x: 0, y: 0, type: CustomerType.VIP },
      { x: 6, y: 6, type: CustomerType.VIP },
      { x: 3, y: 0, type: CustomerType.NORMAL },
      { x: 3, y: 6, type: CustomerType.NORMAL }
    ],
    targetCustomerCount: 4,
    initialPipes: []
  }
];

export const PIPE_OPENINGS: Record<PipeType, number[]> = {
  [PipeType.STRAIGHT]: [0, 2], 
  [PipeType.CORNER]: [1, 2],   
  [PipeType.EMPTY]: [],
};
