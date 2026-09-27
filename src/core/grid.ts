import { CellKind, WEIGHT_COST, type GridShape } from './types';

export const toIndex = (row: number, col: number, cols: number) => row * cols + col;
export const toRow = (index: number, cols: number) => Math.floor(index / cols);
export const toCol = (index: number, cols: number) => index % cols;

export const inBounds = ({ rows, cols }: GridShape, row: number, col: number) =>
  row >= 0 && row < rows && col >= 0 && col < cols;

/** Row/col deltas in exploration order: up, right, down, left. */
export const DIRECTIONS: readonly (readonly [number, number])[] = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

/**
 * Writes the in-bounds neighbour indices of `index` into `out` (in DIRECTIONS order)
 * and returns how many were written. Reusing one buffer keeps the hot loops allocation-free.
 */
export function neighbors(shape: GridShape, index: number, out: Int32Array): number {
  const { rows, cols } = shape;
  const row = Math.floor(index / cols);
  const col = index - row * cols;
  let n = 0;
  if (row > 0) out[n++] = index - cols;
  if (col < cols - 1) out[n++] = index + 1;
  if (row < rows - 1) out[n++] = index + cols;
  if (col > 0) out[n++] = index - 1;
  return n;
}

/** Cost of stepping onto a cell. */
export const moveCost = (cells: Uint8Array, index: number) =>
  cells[index] === CellKind.Weight ? WEIGHT_COST : 1;

export const isWall = (cells: Uint8Array, index: number) => cells[index] === CellKind.Wall;

export function manhattan(a: number, b: number, cols: number): number {
  const ar = Math.floor(a / cols);
  const br = Math.floor(b / cols);
  return Math.abs(ar - br) + Math.abs(a - ar * cols - (b - br * cols));
}

/** Walks a predecessor array back from `goal`; returns [] when goal was never reached. */
export function tracePath(prev: Int32Array, source: number, goal: number): number[] {
  if (goal !== source && prev[goal] === -1) return [];
  const path: number[] = [];
  for (let at = goal; at !== -1; at = at === source ? -1 : prev[at]) path.push(at);
  return path.reverse();
}

export function pathCost(cells: Uint8Array, path: readonly number[]): number {
  let cost = 0;
  for (let i = 1; i < path.length; i++) cost += moveCost(cells, path[i]);
  return cost;
}

/** Integer points on the straight line between two cells (Bresenham), both ends included. */
export function lineBetween(a: number, b: number, cols: number): number[] {
  let r0 = toRow(a, cols);
  let c0 = toCol(a, cols);
  const r1 = toRow(b, cols);
  const c1 = toCol(b, cols);
  const dr = Math.abs(r1 - r0);
  const dc = Math.abs(c1 - c0);
  const sr = r0 < r1 ? 1 : -1;
  const sc = c0 < c1 ? 1 : -1;
  let err = dc - dr;
  const points: number[] = [];
  for (;;) {
    points.push(toIndex(r0, c0, cols));
    if (r0 === r1 && c0 === c1) return points;
    const e2 = 2 * err;
    if (e2 > -dr) {
      err -= dr;
      c0 += sc;
    }
    if (e2 < dc) {
      err += dc;
      r0 += sr;
    }
  }
}
