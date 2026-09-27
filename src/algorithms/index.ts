import type { AlgorithmId, SearchInput, SearchResult } from '../core/types';
import { aStar } from './astar';
import { breadthFirst } from './bfs';
import { bidirectional } from './bidirectional';
import { cometSearch } from './comet';
import { depthFirst } from './dfs';
import { dijkstra } from './dijkstra';
import { greedyBestFirst } from './greedy';

export interface AlgorithmInfo {
  id: AlgorithmId;
  name: string;
  shortName: string;
  /** Respects the extra cost of weight nodes. */
  weighted: boolean;
  /** Always returns the cheapest possible path. */
  optimal: boolean;
  custom?: boolean;
  tagline: string;
  description: string;
  run: (input: SearchInput) => SearchResult;
}

export const ALGORITHMS: readonly AlgorithmInfo[] = [
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    shortName: 'Dijkstra',
    weighted: true,
    optimal: true,
    tagline: 'The father of pathfinding algorithms',
    description:
      'Expands outward from the start in order of total cost, like a ripple spreading across water. Slow but thorough — it guarantees the cheapest path.',
    run: dijkstra,
  },
  {
    id: 'astar',
    name: 'A* Search',
    shortName: 'A*',
    weighted: true,
    optimal: true,
    tagline: 'Arguably the best all-round pathfinder',
    description:
      'Dijkstra with a sense of direction: it adds an estimate of the remaining distance, so it heads for the target while still guaranteeing the cheapest path.',
    run: aStar,
  },
  {
    id: 'comet',
    name: 'Comet Search',
    shortName: 'Comet',
    weighted: true,
    optimal: false,
    custom: true,
    tagline: 'Custom hybrid — straight, fast, decisive',
    description:
      'An original A* variant: the target pulls twice as hard and every turn carries a small penalty, so it streaks toward the goal and prefers long straight runs. Very fast, usually — not always — optimal.',
    run: cometSearch,
  },
  {
    id: 'greedy',
    name: 'Greedy Best-First Search',
    shortName: 'Greedy',
    weighted: true,
    optimal: false,
    tagline: 'A faster, more heuristic-heavy A*',
    description:
      'Always jumps to whichever node looks closest to the target and never reconsiders. Blazing fast on open boards, easily fooled by walls.',
    run: greedyBestFirst,
  },
  {
    id: 'bidirectional',
    name: 'Bidirectional Dijkstra',
    shortName: 'Bidirectional',
    weighted: true,
    optimal: true,
    tagline: 'Two searches that meet in the middle',
    description:
      'Runs Dijkstra from the start and from the target at the same time, stopping when the two waves meet. Explores roughly half the area and still guarantees the cheapest path.',
    run: bidirectional,
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    shortName: 'BFS',
    weighted: false,
    optimal: true,
    tagline: 'A great algorithm; guarantees the shortest path',
    description:
      'Explores every node one step away, then two steps, then three. Finds the path with the fewest moves, but treats weight nodes like ordinary ones.',
    run: breadthFirst,
  },
  {
    id: 'dfs',
    name: 'Depth-First Search',
    shortName: 'DFS',
    weighted: false,
    optimal: false,
    tagline: 'A very bad algorithm for pathfinding',
    description:
      'Follows one corridor as deep as it can before backing up to try another. It will find the target eventually, but the path is usually a long, winding mess.',
    run: depthFirst,
  },
];

export const getAlgorithm = (id: AlgorithmId): AlgorithmInfo =>
  ALGORITHMS.find((a) => a.id === id) ?? ALGORITHMS[0];
