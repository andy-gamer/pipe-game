
import { PipeType, LevelData, CustomerType, Difficulty } from './types.ts';

export const LEVELS: LevelData[] = [
  {
    id: 1,
    difficulty: Difficulty.EASY,
    gridSize: { rows: 3, cols: 3 },
    startRow: 0,
    exitRow: 2,
    customers: [],
    targetCustomerCount: 1,
    initialPipes: []
  },
  {
    id: 2,
    difficulty: Difficulty.EASY,
    gridSize: { rows: 4, cols: 3 },
    startRow: 1,
    exitRow: 2,
    customers: [],
    targetCustomerCount: 1,
    initialPipes: []
  },
  {
    id: 3,
    difficulty: Difficulty.EASY,
    gridSize: { rows: 4, cols: 4 },
    startRow: 3,
    exitRow: 0,
    customers: [],
    targetCustomerCount: 2,
    initialPipes: []
  },
  {
    id: 4,
    difficulty: Difficulty.MEDIUM,
    gridSize: { rows: 5, cols: 4 },
    startRow: 0,
    exitRow: 4,
    customers: [],
    targetCustomerCount: 2,
    initialPipes: []
  },
  {
    id: 5,
    difficulty: Difficulty.MEDIUM,
    gridSize: { rows: 5, cols: 5 },
    startRow: 2,
    exitRow: 2,
    customers: [],
    targetCustomerCount: 3,
    initialPipes: []
  },
  {
    id: 6,
    difficulty: Difficulty.MEDIUM,
    gridSize: { rows: 5, cols: 5 },
    startRow: 4,
    exitRow: 0,
    customers: [],
    targetCustomerCount: 3,
    initialPipes: []
  },
  {
    id: 7,
    difficulty: Difficulty.HARD,
    gridSize: { rows: 6, cols: 6 },
    startRow: 0,
    exitRow: 5,
    customers: [],
    targetCustomerCount: 3,
    initialPipes: []
  },
  {
    id: 8,
    difficulty: Difficulty.HARD,
    gridSize: { rows: 6, cols: 6 },
    startRow: 3,
    exitRow: 3,
    customers: [],
    targetCustomerCount: 4,
    initialPipes: []
  },
  {
    id: 9,
    difficulty: Difficulty.HARD,
    gridSize: { rows: 7, cols: 6 },
    startRow: 0,
    exitRow: 6,
    customers: [],
    targetCustomerCount: 4,
    initialPipes: []
  },
  {
    id: 10,
    difficulty: Difficulty.HARD,
    gridSize: { rows: 7, cols: 7 },
    startRow: 6,
    exitRow: 0,
    customers: [],
    targetCustomerCount: 5,
    initialPipes: []
  }
];

export const PIPE_OPENINGS: Record<PipeType, number[]> = {
  [PipeType.STRAIGHT]: [0, 2], // 北、南 (旋轉 1 會變成 東、西)
  [PipeType.CORNER]: [1, 2],   // 東、南
  [PipeType.EMPTY]: [],
};
