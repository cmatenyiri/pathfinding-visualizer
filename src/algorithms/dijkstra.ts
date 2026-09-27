import { moveCost } from '../core/grid';
import type { SearchInput, SearchResult } from '../core/types';
import { bestFirstSearch } from './bestFirst';

/** Always settles the cheapest unexplored node next, so the first time it reaches the goal the route is optimal. */
export function dijkstra(input: SearchInput): SearchResult {
  return bestFirstSearch(input, {
    stepCost: (_from, to) => moveCost(input.cells, to),
    priority: (g) => g,
    relax: true,
  });
}
