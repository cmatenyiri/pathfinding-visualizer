import { isWall, neighbors, tracePath } from '../core/grid';
import type { SearchInput, SearchResult } from '../core/types';

/** Explores in rings of equal step count. Shortest in steps, but blind to weights. */
export function breadthFirst(input: SearchInput): SearchResult {
  const { rows, cols, cells, source, goal } = input;
  const shape = { rows, cols };
  const prev = new Int32Array(rows * cols).fill(-1);
  const seen = new Uint8Array(rows * cols);
  const buffer = new Int32Array(4);
  const queue = new Int32Array(rows * cols);
  const visited: number[] = [];
  let head = 0;
  let tail = 0;

  queue[tail++] = source;
  seen[source] = 1;
  while (head < tail) {
    const current = queue[head++];
    visited.push(current);
    if (current === goal) return { visited, path: tracePath(prev, source, goal) };

    const count = neighbors(shape, current, buffer);
    for (let k = 0; k < count; k++) {
      const next = buffer[k];
      if (seen[next] || isWall(cells, next)) continue;
      seen[next] = 1;
      prev[next] = current;
      queue[tail++] = next;
    }
  }
  return { visited, path: [] };
}
