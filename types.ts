
export enum PipeType {
  STRAIGHT = 'STRAIGHT',
  CORNER = 'CORNER',
  TEE = 'TEE',
  CROSS = 'CROSS',
  EMPTY = 'EMPTY',
}

export enum CustomerType {
  NORMAL = 'NORMAL',
  VIP = 'VIP',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export type Direction = 0 | 1 | 2 | 3; // 0=North, 1=East, 2=South, 3=West

export interface CellData {
  id: string;
  type: PipeType;
  rotation: number;
  hasCustomer: boolean;
  customerType?: CustomerType;
  isVisited?: boolean;
  x: number;
  y: number;
}

export interface LevelData {
  id: number;
  difficulty: Difficulty;
  gridSize: { rows: number; cols: number };
  startRow: number; // The row index where the scooter enters from the left
  exitRow: number;  // The row index where the scooter exits to the right
  customers: { x: number; y: number; type: CustomerType }[];
  initialPipes: { x: number; y: number; type: PipeType; rotation: number }[];
  targetCustomerCount: number;
}
