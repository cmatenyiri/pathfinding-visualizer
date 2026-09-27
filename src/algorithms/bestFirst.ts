import { isWall, neighbors, tracePath } from '../core/grid';
import { MinHeap } from '../core/MinHeap';
import type { SearchInput, SearchResult } from '../core/types';

export interface BestFirstStrategy {
  /** Cost accumulated when stepping `from → to`. `prev` is the predecessor of `from` (or -1). */
  stepCost: (from: number, to: number, prev: number) => number;
  /** Queue priority of a node that has been reached with accumulated cost `g`. Lower = sooner. */
  priority: (g: number, node: number) => number;
  /** Tie-breaker between equal priorities. Lower = sooner. */
  tieBreak?: (g: number, node: number) => number;
  /**
   * When false, a node keeps the first predecessor that discovered it (classic greedy search).
   * When true, cheaper routes found later replace it (Dijkstra / A* style relaxation).
   */
  relax: boolean;
}

/**
 * Shared engine behind Dijkstra, A*, Greedy Best-First and Comet: they differ only in how
 * steps are priced and how the frontier is ordered.
 */
export function bestFirstSearch(input: SearchInput, strategy: BestFirstStrategy): SearchResult {
  const { rows, cols, cells, source, goal } = input;
  const shape = { rows, cols };
  const n = rows * cols;
  const g = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  const closed = new Uint8Array(n);
  const buffer = new Int32Array(4);
  const heap = new MinHeap();
  const visited: number[] = [];
  const { stepCost, priority, tieBreak, relax } = strategy;

  g[source] = 0;
  heap.push(source, priority(0, source), tieBreak?.(0, source));

  while (heap.size) {
    const current = heap.pop();
    if (closed[current]) continue; // stale duplicate from an earlier relaxation
    closed[current] = 1;
    visited.push(current);
    if (current === goal) break;

    const count = neighbors(shape, current, buffer);
    for (let k = 0; k < count; k++) {
      const next = buffer[k];
      if (closed[next] || isWall(cells, next)) continue;
      if (!relax && g[next] !== Infinity) continue;
      const cost = g[current] + stepCost(current, next, prev[current]);
      if (cost < g[next]) {
        g[next] = cost;
        prev[next] = current;
        heap.push(next, priority(cost, next), tieBreak?.(cost, next));
      }
    }
  }

  return { visited, path: closed[goal] ? tracePath(prev, source, goal) : [] };
}
