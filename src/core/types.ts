/** What a grid cell physically contains. Start/target/bomb are tracked separately. */
export const CellKind = {
  Empty: 0,
  Wall: 1,
  Weight: 2,
} as const;
export type CellKind = (typeof CellKind)[keyof typeof CellKind];

/** Moving onto a weight node costs this much instead of 1. */
export const WEIGHT_COST = 15;

export interface GridShape {
  rows: number;
  cols: number;
}

/** Everything a search algorithm needs to know about the board. */
export interface SearchInput extends GridShape {
  cells: Uint8Array;
  source: number;
  goal: number;
}

export interface SearchResult {
  /** Nodes in the order the algorithm settled/expanded them. */
  visited: number[];
  /** Source → goal inclusive; empty when the goal is unreachable. */
  path: number[];
}

export type AlgorithmId =
  'dijkstra' | 'astar' | 'greedy' | 'comet' | 'bidirectional' | 'bfs' | 'dfs';

export type MazeId =
  | 'recursive-division'
  | 'recursive-division-vertical'
  | 'recursive-division-horizontal'
  | 'backtracker'
  | 'prim'
  | 'random-walls'
  | 'random-weights'
  | 'stairs';

export type Speed = 'fast' | 'average' | 'slow';

export type Brush = 'wall' | 'weight';

export type EngineStatus = 'idle' | 'running' | 'generating' | 'done';

export interface RunStats {
  algorithm: AlgorithmId;
  found: boolean;
  visited: number;
  /** Number of moves on the path (nodes − 1). */
  pathLength: number;
  /** Sum of move costs along the path, weights included. */
  pathCost: number;
  /** Time spent computing the search, not animating it. */
  computeMs: number;
  viaBomb: boolean;
}
