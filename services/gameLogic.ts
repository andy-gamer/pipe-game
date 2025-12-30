
import { PipeType, CellData, CustomerType } from '../types.ts';
import { PIPE_OPENINGS } from '../constants.ts';

export const getEffectiveOpenings = (type: PipeType, rotation: number): number[] => {
  const base = PIPE_OPENINGS[type] || [];
  return base.map(dir => (dir + rotation) % 4);
};

const findMatchingRotation = (type: PipeType, openings: number[]): number => {
  const baseOpenings = PIPE_OPENINGS[type];
  for (let r = 0; r < 4; r++) {
    const rotated = baseOpenings.map(dir => (dir + r) % 4).sort();
    if (JSON.stringify(rotated) === JSON.stringify(openings.sort())) {
      return r;
    }
  }
  return 0;
};

export const generateSolvableGrid = (
  rows: number, 
  cols: number, 
  startRow: number, 
  exitRow: number,
  targetCustomerCount: number
): CellData[][] => {
  const grid: (CellData | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  const path: { x: number; y: number }[] = [];
  const visited = new Set<string>();

  const findPath = (cx: number, cy: number): boolean => {
    path.push({ x: cx, y: cy });
    visited.add(`${cx}-${cy}`);
    if (cx === cols - 1 && cy === exitRow) return true;
    const neighbors = [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: -1, dy: 0 }].sort(() => Math.random() - 0.6);
    for (const { dx, dy } of neighbors) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited.has(`${nx}-${ny}`)) {
        if (findPath(nx, ny)) return true;
      }
    }
    path.pop();
    return false;
  };

  findPath(0, startRow);

  for (let i = 0; i < path.length; i++) {
    const curr = path[i];
    const prev = i === 0 ? { x: -1, y: startRow } : path[i - 1];
    const next = i === path.length - 1 ? { x: cols, y: exitRow } : path[i + 1];
    const inDir = getDir(curr, prev);   
    const outDir = getDir(curr, next); 
    const isStraight = (inDir % 2 === outDir % 2);
    const type = isStraight ? PipeType.STRAIGHT : PipeType.CORNER;
    const solutionRotation = findMatchingRotation(type, [inDir, outDir]);

    grid[curr.y][curr.x] = {
      id: `${curr.x}-${curr.y}`,
      type,
      rotation: Math.floor(Math.random() * 4),
      solutionRotation,
      hasCustomer: false,
      x: curr.x,
      y: curr.y,
      isVisited: false
    };
  }

  const possibleIndices = Array.from({ length: path.length - 2 }, (_, i) => i + 1);
  const shuffledIndices = possibleIndices.sort(() => Math.random() - 0.5);
  const selectedIndices = shuffledIndices.slice(0, targetCustomerCount);

  selectedIndices.forEach((idx) => {
    const p = path[idx];
    const cell = grid[p.y][p.x]!;
    cell.hasCustomer = true;
    
    // 隨機分配花語類型
    const rand = Math.random();
    if (rand > 0.8) cell.customerType = CustomerType.WEDDING;
    else if (rand > 0.5) cell.customerType = CustomerType.ROMANCE;
    else cell.customerType = CustomerType.BOUQUET;
  });

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!grid[y][x]) {
        grid[y][x] = {
          id: `${x}-${y}`,
          type: Math.random() > 0.3 ? PipeType.CORNER : PipeType.STRAIGHT,
          rotation: Math.floor(Math.random() * 4),
          hasCustomer: false,
          x,
          y,
          isVisited: false
        };
      }
    }
  }

  return grid as CellData[][];
};

const getDir = (from: {x:number, y:number}, to: {x:number, y:number}): number => {
  if (to.x < from.x) return 3; if (to.x > from.x) return 1; if (to.y < from.y) return 0; if (to.y > from.y) return 2;
  return -1;
};

export const isConnected = (cellA: CellData, cellB: CellData): boolean => {
  const openingsA = getEffectiveOpenings(cellA.type, cellA.rotation);
  const openingsB = getEffectiveOpenings(cellB.type, cellB.rotation);
  let dirAToB: number = -1;
  if (cellB.x === cellA.x + 1 && cellB.y === cellA.y) dirAToB = 1;
  if (cellB.x === cellA.x - 1 && cellB.y === cellA.y) dirAToB = 3;
  if (cellB.x === cellA.x && cellB.y === cellA.y + 1) dirAToB = 2;
  if (cellB.x === cellA.x && cellB.y === cellA.y - 1) dirAToB = 0;
  if (dirAToB === -1) return false;
  const dirBToA = (dirAToB + 2) % 4;
  return openingsA.includes(dirAToB) && openingsB.includes(dirBToA);
};

export const getReachableCells = (grid: CellData[][], startRow: number): Set<string> => {
  const reachable = new Set<string>();
  if (grid.length === 0) return reachable;
  const startCell = grid[startRow][0];
  if (!getEffectiveOpenings(startCell.type, startCell.rotation).includes(3)) return reachable;
  const queue = [startCell];
  reachable.add(startCell.id);
  while (queue.length > 0) {
    const curr = queue.shift()!;
    const ops = getEffectiveOpenings(curr.type, curr.rotation);
    for (const dir of ops) {
      let nx = curr.x, ny = curr.y;
      if (dir === 0) ny -= 1; if (dir === 1) nx += 1; if (dir === 2) ny += 1; if (dir === 3) nx -= 1;
      if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length) {
        const neighbor = grid[ny][nx];
        if (!reachable.has(neighbor.id) && isConnected(curr, neighbor)) {
          reachable.add(neighbor.id);
          queue.push(neighbor);
        }
      }
    }
  }
  return reachable;
};

export const tracePath = (grid: CellData[][], startRow: number, exitRow: number) => {
  if (grid.length === 0) return { path: [], reachedExit: false };
  const startCell = grid[startRow][0];
  if (!getEffectiveOpenings(startCell.type, startCell.rotation).includes(3)) return { path: [], reachedExit: false };
  const queue: { cell: CellData; path: CellData[] }[] = [{ cell: startCell, path: [startCell] }];
  const visited = new Set([startCell.id]);
  while (queue.length > 0) {
    const { cell, path } = queue.shift()!;
    if (cell.x === grid[0].length - 1 && cell.y === exitRow) {
      if (getEffectiveOpenings(cell.type, cell.rotation).includes(1)) {
        return { path, reachedExit: true };
      }
    }
    const ops = getEffectiveOpenings(cell.type, cell.rotation);
    for (const dir of ops) {
      let nx = cell.x, ny = cell.y;
      if (dir === 0) ny -= 1; if (dir === 1) nx += 1; if (dir === 2) ny += 1; if (dir === 3) nx -= 1;
      if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length) {
        const neighbor = grid[ny][nx];
        if (!visited.has(neighbor.id) && isConnected(cell, neighbor)) {
          visited.add(neighbor.id);
          queue.push({ cell: neighbor, path: [...path, neighbor] });
        }
      }
    }
  }
  return { path: [], reachedExit: false };
};
