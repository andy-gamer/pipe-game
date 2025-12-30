
export enum PipeType {
  STRAIGHT = 'STRAIGHT', // ┃ or ━
  CORNER = 'CORNER',     // ┗, ┛, ┓, ┏
  TEE = 'TEE',           // ┣, ┫, ┳, ┻
  CROSS = 'CROSS',       // ╋ (十字路口)
  START = 'START',
  EXIT = 'EXIT',
  EMPTY = 'EMPTY',
}

export enum CustomerType {
  NORMAL = 'NORMAL',
  VIP = 'VIP',
}

export type Direction = 0 | 1 | 2 | 3; // 0=北, 1=東, 2=南, 3=西

export interface CellData {
  id: string;
  type: PipeType;
  rotation: number; // 0, 1, 2, 3 (90度倍數)
  hasCustomer: boolean;
  customerType?: CustomerType;
  isVisited?: boolean;
  x: number;
  y: number;
}

export interface LevelData {
  id: number;
  gridSize: { rows: number; cols: number };
  startPos: { x: number; y: number; rotation: number };
  exitPos: { x: number; y: number; rotation: number };
  customers: { x: number; y: number; type: CustomerType }[];
  initialPipes: { x: number; y: number; type: PipeType; rotation: number }[];
  targetCustomerCount: number;
}
