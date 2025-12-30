
export enum PipeType {
  STRAIGHT = 'STRAIGHT',
  CORNER = 'CORNER',
  EMPTY = 'EMPTY',
}

export enum CustomerType {
  BOUQUET = 'BOUQUET',
  ROMANCE = 'ROMANCE',
  WEDDING = 'WEDDING',
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
  solutionRotation?: number; 
  isHinted?: boolean;        
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
  startRow: number; 
  exitRow: number;  
  customers: { x: number; y: number; type: CustomerType }[];
  initialPipes: { x: number; y: number; type: PipeType; rotation: number }[];
  targetCustomerCount: number;
}
