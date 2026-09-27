import { manhattan, moveCost } from '../core/grid';
import type { SearchInput, SearchResult } from '../core/types';
import { bestFirstSearch } from './bestFirst';

/**
 * Dijkstra plus a Manhattan-distance estimate of the remaining cost. The estimate never
 * overshoots (every move costs at least 1), so the result is still optimal.
 */
export function aStar(input: SearchInput): SearchResult {
  const h = (node: number) => manhattan(node, input.goal, input.cols);
  return bestFirstSearch(input, {
    stepCost: (_from, to) => moveCost(input.cells, to),
    priority: (g, node) => g + h(node),
    // Among equally promising nodes prefer the one closer to the goal: a tighter, straighter search.
    tieBreak: (_g, node) => h(node),
    relax: true,
  });
}
