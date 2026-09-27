import { manhattan, moveCost } from '../core/grid';
import type { SearchInput, SearchResult } from '../core/types';
import { bestFirstSearch } from './bestFirst';

/** How strongly the goal "pulls" the search compared to plain A*. */
const PULL = 2;
/** Virtual surcharge for changing direction; it steers the search but is not a real path cost. */
const TURN_PENALTY = 0.5;

/**
 * Comet Search — this app's custom algorithm.
 *
 * It is an A* variant with two twists:
 *  1. The distance-to-goal estimate is amplified (×2), so the frontier streaks toward the
 *     target like a comet instead of spreading out evenly.
 *  2. Every change of direction carries a small virtual surcharge, so among similar routes it
 *     prefers long straight runs with few turns — paths that look deliberate, like a robot or a
 *     person would walk them.
 *
 * It explores a fraction of what Dijkstra does and weights are respected, but because the
 * estimate can overshoot, the path it returns is usually — not always — the cheapest.
 */
export function cometSearch(input: SearchInput): SearchResult {
  const { cells, goal, cols } = input;
  const h = (node: number) => manhattan(node, goal, cols);
  return bestFirstSearch(input, {
    stepCost: (from, to, prev) => {
      const turned = prev !== -1 && from - prev !== to - from;
      return moveCost(cells, to) + (turned ? TURN_PENALTY : 0);
    },
    priority: (g, node) => g + PULL * h(node),
    tieBreak: (_g, node) => h(node),
    relax: true,
  });
}
