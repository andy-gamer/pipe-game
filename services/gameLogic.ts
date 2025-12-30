
import { PipeType, CellData, CustomerType } from '../types.ts';
import { PIPE_OPENINGS } from '../constants.ts';

/**
 * 取得旋轉後的有效開口方向 (0:北, 1:東, 2:南, 3:西)
 */
export const getEffectiveOpenings = (type: PipeType, rotation: number): number[] => {
  const base = PIPE_OPENINGS[type] || [];
  return base.map(dir => (dir + rotation) % 4);
};

/**
 * 判斷兩個相鄰儲存格是否接通
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
 * 核心演算法：生成絕對可解的棋盤
 */
export const generateSolvableGrid = (
  rows: number, 
  cols: number, 
  startRow: number, 
  exitRow: number,
  targetCustomerCount: number
): CellData[][] => {
  const grid: (CellData | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  
  // 1. 使用 DFS 生成路徑
  const path: { x: number; y: number }[] = [];
  const visited = new Set<string>();

  const findPath = (cx: number, cy: number): boolean => {
    path.push({ x: cx, y: cy });
    visited.add(`${cx}-${cy}`);

    if (cx === cols - 1 && cy === exitRow) return true;

    // 優先向右探索，其次上下
    const neighbors = [
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: -1, dy: 0 }
    ].sort(() => Math.random() - 0.6); // 稍微權重向右

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

  // 2. 根據路徑結構決定每個儲存格的類型
  const pathSet = new Set(path.map(p => `${p.x}-${p.y}`));
  
  for (let i = 0; i < path.length; i++) {
    const curr = path[i];
    // 虛擬的「進入」與「離開」點，確保頭尾連接到邊界
    const prev = i === 0 ? { x: -1, y: startRow } : path[i - 1];
    const next = i === path.length - 1 ? { x: cols, y: exitRow } : path[i + 1];

    const inDir = getDir(curr, prev);   // 進入方向
    const outDir = getDir(curr, next); // 離開方向

    // 如果方向相反(差2)則是直管，否則(差1或3)則是彎管
    const isStraight = (inDir % 2 === outDir % 2);
    const type = isStraight ? PipeType.STRAIGHT : PipeType.CORNER;

    // 儲存格資料（初始旋轉設為隨機，由玩家解謎）
    grid[curr.y][curr.x] = {
      id: `${curr.x}-${curr.y}`,
      type,
      rotation: Math.floor(Math.random() * 4),
      hasCustomer: false,
      x: curr.x,
      y: curr.y,
      isVisited: false
    };
  }

  // 3. 在路徑上隨機放置顧客
  // 排除頭尾以確保體驗平衡
  const possibleCustomerIndices = Array.from({ length: path.length - 2 }, (_, i) => i + 1);
  const shuffledIndices = possibleCustomerIndices.sort(() => Math.random() - 0.5);
  const selectedIndices = shuffledIndices.slice(0, targetCustomerCount);

  selectedIndices.forEach((idx, i) => {
    const p = path[idx];
    const cell = grid[p.y][p.x]!;
    cell.hasCustomer = true;
    cell.customerType = (i === 0 && targetCustomerCount > 1) ? CustomerType.VIP : CustomerType.NORMAL;
  });

  // 4. 填充背景（路徑以外的儲存格）
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
  if (to.x < from.x) return 3; // West
  if (to.x > from.x) return 1; // East
  if (to.y < from.y) return 0; // North
  if (to.y > from.y) return 2; // South
  return -1;
};

/**
 * 尋找當前起點可達的所有區域（用於即時路徑預覽）
 */
export const getReachableCells = (grid: CellData[][], startRow: number): Set<string> => {
  const reachable = new Set<string>();
  if (grid.length === 0) return reachable;

  const startCell = grid[startRow][0];
  // 起點必須向西開口才能接收進場車輛
  if (!getEffectiveOpenings(startCell.type, startCell.rotation).includes(3)) return reachable;

  const queue = [startCell];
  reachable.add(startCell.id);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const ops = getEffectiveOpenings(curr.type, curr.rotation);

    for (const dir of ops) {
      let nx = curr.x, ny = curr.y;
      if (dir === 0) ny -= 1;
      if (dir === 1) nx += 1;
      if (dir === 2) ny += 1;
      if (dir === 3) nx -= 1;

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

/**
 * 實際外送路徑追蹤
 */
export const tracePath = (grid: CellData[][], startRow: number, exitRow: number) => {
  if (grid.length === 0) return { path: [], reachedExit: false };

  const startCell = grid[startRow][0];
  if (!getEffectiveOpenings(startCell.type, startCell.rotation).includes(3)) return { path: [], reachedExit: false };

  const queue: { cell: CellData; path: CellData[] }[] = [{ cell: startCell, path: [startCell] }];
  const visited = new Set([startCell.id]);

  while (queue.length > 0) {
    const { cell, path } = queue.shift()!;

    // 判斷是否到達終點且向東開口
    if (cell.x === grid[0].length - 1 && cell.y === exitRow) {
      if (getEffectiveOpenings(cell.type, cell.rotation).includes(1)) {
        return { path, reachedExit: true };
      }
    }

    const ops = getEffectiveOpenings(cell.type, cell.rotation);
    for (const dir of ops) {
      let nx = cell.x, ny = cell.y;
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
