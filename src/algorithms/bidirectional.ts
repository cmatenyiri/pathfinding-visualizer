import { isWall, moveCost, neighbors } from '../core/grid';
import { MinHeap } from '../core/MinHeap';
import type { SearchInput, SearchResult } from '../core/types';

/**
 * Bidirectional Dijkstra: one wave grows from the start, another from the target, taking turns.
 * It stops once no unexplored pair of nodes could beat the best meeting point found so far
 * (top(forward) + top(backward) ≥ best), which keeps the result optimal with weights.
 */
export function bidirectional(input: SearchInput): SearchResult {
  const { rows, cols, cells, source, goal } = input;
  const shape = { rows, cols };
  const n = rows * cols;
  const buffer = new Int32Array(4);
  const visited: number[] = [];

  if (source === goal) return { visited: [source], path: [source] };

  // Index 0 = forward (from source), 1 = backward (from goal).
  const dist = [new Float64Array(n).fill(Infinity), new Float64Array(n).fill(Infinity)];
  const link = [new Int32Array(n).fill(-1), new Int32Array(n).fill(-1)];
  const closed = [new Uint8Array(n), new Uint8Array(n)];
  const heaps = [new MinHeap(), new MinHeap()];
  const seenByAny = new Uint8Array(n);

  dist[0][source] = 0;
  dist[1][goal] = 0;
  heaps[0].push(source, 0);
  heaps[1].push(goal, 0);

  let best = Infinity;
  let meet = -1;

  const dropStale = (side: number) => {
    const heap = heaps[side];
    while (heap.size && closed[side][heap.peek()]) heap.pop();
  };

  let side = 0;
  for (;;) {
    dropStale(0);
    dropStale(1);
    if (!heaps[0].size || !heaps[1].size) break;
    if (heaps[0].peekKey() + heaps[1].peekKey() >= best) break;

    const heap = heaps[side];
    const d = dist[side];
    const other = dist[1 - side];
    const current = heap.pop();
    closed[side][current] = 1;
    if (!seenByAny[current]) {
      seenByAny[current] = 1;
      visited.push(current);
    }

    const count = neighbors(shape, current, buffer);
    for (let k = 0; k < count; k++) {
      const next = buffer[k];
      if (closed[side][next] || isWall(cells, next)) continue;
      // Forward pays for entering `next`; backward pays for entering `current` (the edge is reversed).
      const cost = d[current] + (side === 0 ? moveCost(cells, next) : moveCost(cells, current));
      if (cost < d[next]) {
        d[next] = cost;
        link[side][next] = current;
        heap.push(next, cost);
        if (other[next] !== Infinity && cost + other[next] < best) {
          best = cost + other[next];
          meet = next;
        }
      }
    }
    side = 1 - side;
  }

  if (meet === -1) return { visited, path: [] };

  const path: number[] = [];
  for (let at = meet; at !== -1; at = link[0][at]) path.push(at);
  path.reverse();
  for (let at = link[1][meet]; at !== -1; at = link[1][at]) path.push(at);
  return { visited, path };
}
