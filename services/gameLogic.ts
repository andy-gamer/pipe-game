
import { PipeType, CellData } from '../types';
import { PIPE_OPENINGS } from '../constants';

export const getEffectiveOpenings = (type: PipeType, rotation: number): number[] => {
  const base = PIPE_OPENINGS[type] || [];
  return base.map(dir => (dir + rotation) % 4);
};

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

export const getReachableCells = (grid: CellData[][], startRow: number): Set<string> => {
  const reachable = new Set<string>();
  if (grid.length === 0) return reachable;

  const firstCell = grid[startRow][0];
  const firstOpenings = getEffectiveOpenings(firstCell.type, firstCell.rotation);
  
  // Scooter enters from the West (Direction 3)
  if (!firstOpenings.includes(3)) return reachable;

  reachable.add(firstCell.id);
  const queue = [firstCell];

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

export const tracePath = (grid: CellData[][], startRow: number, exitRow: number) => {
  if (grid.length === 0) return { path: [], reachedExit: false };

  const firstCell = grid[startRow][0];
  const firstOpenings = getEffectiveOpenings(firstCell.type, firstCell.rotation);
  
  // Must be able to enter from the West
  if (!firstOpenings.includes(3)) return { path: [], reachedExit: false };

  const queue: { cell: CellData; path: CellData[] }[] = [{ cell: firstCell, path: [firstCell] }];
  const visited = new Set([firstCell.id]);

  while (queue.length > 0) {
    const { cell, path } = queue.shift()!;

    // Check if this is the exit row and it opens to the East (Direction 1)
    if (cell.x === grid[0].length - 1 && cell.y === exitRow) {
      const openings = getEffectiveOpenings(cell.type, cell.rotation);
      if (openings.includes(1)) {
        return { path, reachedExit: true };
      }
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

  return { path: [], reachedExit: false };
};
