
import { PipeType, CellData, Direction } from '../types';
import { PIPE_OPENINGS } from '../constants';

/**
 * Returns the directions a pipe is open to, given its base openings and rotation.
 */
export const getEffectiveOpenings = (type: PipeType, rotation: number): number[] => {
  const base = PIPE_OPENINGS[type] || [];
  return base.map(dir => (dir + rotation) % 4);
};

/**
 * Checks if two adjacent cells are connected.
 */
export const isConnected = (cellA: CellData, cellB: CellData): boolean => {
  const openingsA = getEffectiveOpenings(cellA.type, cellA.rotation);
  const openingsB = getEffectiveOpenings(cellB.type, cellB.rotation);

  let dirAToB: number = -1;
  if (cellB.x === cellA.x + 1 && cellB.y === cellA.y) dirAToB = 1; // East
  if (cellB.x === cellA.x - 1 && cellB.y === cellA.y) dirAToB = 3; // West
  if (cellB.x === cellA.x && cellB.y === cellA.y + 1) dirAToB = 2; // South
  if (cellB.x === cellA.x && cellB.y === cellA.y - 1) dirAToB = 0; // North

  if (dirAToB === -1) return false;

  const dirBToA = (dirAToB + 2) % 4;

  return openingsA.includes(dirAToB) && openingsB.includes(dirBToA);
};

/**
 * 獲取從起點開始所有連通的格子。
 */
export const getReachableCells = (grid: CellData[][], start: CellData): Set<string> => {
  const reachable = new Set<string>([start.id]);
  const queue = [start];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const openings = getEffectiveOpenings(current.type, current.rotation);

    for (const dir of openings) {
      let nx = current.x;
      let ny = current.y;
      if (dir === 0) ny -= 1;
      if (dir === 1) nx += 1;
      if (dir === 2) ny += 1;
      if (dir === 3) nx -= 1;

      if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length) {
        const neighbor = grid[ny][nx];
        if (!reachable.has(neighbor.id) && isConnected(current, neighbor)) {
          reachable.add(neighbor.id);
          queue.push(neighbor);
        }
      }
    }
  }
  return reachable;
};

/**
 * Finds a path from start to exit using BFS.
 */
export const tracePath = (grid: CellData[][], start: CellData, exit: CellData) => {
  const queue: { cell: CellData; path: CellData[] }[] = [{ cell: start, path: [start] }];
  const visited = new Set([start.id]);
  
  let finalPath: CellData[] = [];
  let reachedExit = false;

  while (queue.length > 0) {
    const { cell, path } = queue.shift()!;

    if (cell.id === exit.id) {
      finalPath = path;
      reachedExit = true;
      break;
    }

    const openings = getEffectiveOpenings(cell.type, cell.rotation);
    for (const dir of openings) {
      let nx = cell.x;
      let ny = cell.y;
      if (dir === 0) ny -= 1;
      if (dir === 1) nx += 1;
      if (dir === 2) ny += 1;
      if (dir === 3) nx -= 1;

      if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length) {
        const neighbor = grid[ny][nx];
        if (!visited.has(neighbor.id) && isConnected(cell, neighbor)) {
          visited.add(neighbor.id);
          queue.push({ cell: neighbor, path: [...path, neighbor] });
        }
      }
    }
  }

  return { path: finalPath, reachedExit };
};
