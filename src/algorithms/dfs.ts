import { isWall, neighbors, tracePath } from '../core/grid';
import type { SearchInput, SearchResult } from '../core/types';

/** Dives down one corridor as far as it can before backtracking. Finds *a* path, rarely a good one. */
export function depthFirst(input: SearchInput): SearchResult {
  const { rows, cols, cells, source, goal } = input;
  const shape = { rows, cols };
  const prev = new Int32Array(rows * cols).fill(-1);
  const done = new Uint8Array(rows * cols);
  const buffer = new Int32Array(4);
  const stack: [node: number, from: number][] = [[source, -1]];
  const visited: number[] = [];

  while (stack.length) {
    const [current, from] = stack.pop()!;
    if (done[current]) continue;
    done[current] = 1;
    prev[current] = from;
    visited.push(current);
    if (current === goal) return { visited, path: tracePath(prev, source, goal) };

    const count = neighbors(shape, current, buffer);
    // Push in reverse so the first direction (up) is explored first.
    for (let k = count - 1; k >= 0; k--) {
      const next = buffer[k];
      if (!done[next] && !isWall(cells, next)) stack.push([next, current]);
    }
  }
  return { visited, path: [] };
}
