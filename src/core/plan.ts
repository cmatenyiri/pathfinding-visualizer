import type { AlgorithmInfo } from '../algorithms';
import { pathCost } from './grid';
import type { RunStats } from './types';

export interface BoardState {
  rows: number;
  cols: number;
  cells: Uint8Array;
  start: number;
  target: number;
  /** -1 when there is no bomb on the board. */
  bomb: number;
}

export interface SearchLeg {
  visited: number[];
  /** True for the start → bomb leg, drawn in its own colour. */
  toBomb: boolean;
}

export interface SearchPlan {
  legs: SearchLeg[];
  path: number[];
  stats: RunStats;
}

/**
 * Runs the algorithm for the whole trip. With a bomb on the board the trip is split in two:
 * start → bomb (defuse it first), then bomb → target. Both legs are searched from scratch,
 * exactly as if the bomb were the target and then the start.
 */
export function planSearch(board: BoardState, algorithm: AlgorithmInfo): SearchPlan {
  const { rows, cols, cells, start, target, bomb } = board;
  const t0 = performance.now();
  const stops = bomb === -1 ? [start, target] : [start, bomb, target];
  const legs: SearchLeg[] = [];
  let path: number[] = [];
  let found = true;

  for (let i = 0; i < stops.length - 1; i++) {
    const result = algorithm.run({ rows, cols, cells, source: stops[i], goal: stops[i + 1] });
    legs.push({ visited: result.visited, toBomb: bomb !== -1 && i === 0 });
    if (!result.path.length) {
      found = false;
      path = [];
      break;
    }
    path = path.length ? path.concat(result.path.slice(1)) : result.path;
  }

  const computeMs = performance.now() - t0;
  return {
    legs,
    path,
    stats: {
      algorithm: algorithm.id,
      found,
      visited: legs.reduce((sum, leg) => sum + leg.visited.length, 0),
      pathLength: found ? Math.max(0, path.length - 1) : 0,
      pathCost: found ? pathCost(cells, path) : 0,
      computeMs,
      viaBomb: bomb !== -1,
    },
  };
}
