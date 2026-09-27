import { manhattan, moveCost } from '../core/grid';
import type { SearchInput, SearchResult } from '../core/types';
import { bestFirstSearch } from './bestFirst';

/**
 * Chases whichever node *looks* closest to the goal and never revisits a decision.
 * A weight only makes its own node look a bit further away, so weights are respected
 * locally but the overall route is not guaranteed to be the cheapest.
 */
export function greedyBestFirst(input: SearchInput): SearchResult {
  const { cells, goal, cols } = input;
  return bestFirstSearch(input, {
    stepCost: (_from, to) => moveCost(cells, to),
    priority: (_g, node) => manhattan(node, goal, cols) + moveCost(cells, node) - 1,
    tieBreak: (g) => g,
    relax: false,
  });
}
