# Wayfinder — Pathfinding Visualizer

An interactive playground for pathfinding algorithms, built with React, TypeScript, Vite and a
fully custom Material UI theme ("Midnight Aurora").

Draw walls, sprinkle weights, drop a bomb, pick an algorithm and watch it explore the board node
by node.

## Features

- **7 algorithms**
  - Dijkstra's Algorithm: weighted, guarantees the shortest path
  - A\* Search: weighted, guarantees the shortest path
  - Comet Search: weighted, no guarantee. This is a custom A\* variant with a stronger pull
    toward the target and a small penalty for turning, so it favours straight runs.
  - Greedy Best-First Search: weighted, no guarantee
  - Bidirectional Dijkstra: weighted, guarantees the shortest path
  - Breadth-First Search: unweighted, guarantees the fewest moves
  - Depth-First Search: unweighted, no guarantee
- **Mazes & patterns:** Recursive Division (plain, vertical skew, horizontal skew), Recursive
  Backtracker, Randomized Prim's, Basic Random Maze, Basic Weight Maze, Simple Stair Pattern.
- **Draggable start, target and bomb nodes.** After a run has finished, the result updates live
  as you drag nodes or draw walls.
- **Bomb node:** the path has to reach the bomb first and then continue to the target. The two
  legs of the search are drawn in different colours.
- **Speed selector** (Fast / Average / Slow). You can change it while an animation is running.
- **Clear path, clear walls & weights, clear board**, plus a legend and live run stats (nodes
  visited, path length, path cost, compute time).
- **Interactive tutorial** on first launch, with animated illustrations that run the real
  algorithms.

### Controls

| Input                  | Action                                              |
| ---------------------- | --------------------------------------------------- |
| Click / drag           | Draw walls (drag over existing walls to erase them) |
| Hold `W` + drag        | Draw weight nodes (cost 15)                         |
| Drag start/target/bomb | Move the node                                       |
| `V`                    | Visualize                                           |
| `B`                    | Add / remove bomb                                   |
| `C`                    | Clear path                                          |
| `Esc`                  | Stop the running animation                          |
| `?`                    | Open the tutorial                                   |

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Script                 | What it does                             |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the Vite dev server                |
| `npm run build`        | Type-check and build for production      |
| `npm run preview`      | Serve the production build locally       |
| `npm run typecheck`    | Run the TypeScript compiler only         |
| `npm run lint`         | Run ESLint                               |
| `npm run lint:fix`     | Run ESLint and auto-fix what it can      |
| `npm run format`       | Format everything with Prettier          |
| `npm run format:check` | Verify formatting without changing files |

## Tooling

- **ESLint** (flat config in `eslint.config.js`): typed `typescript-eslint` rules, React Hooks
  rules (including the React Compiler checks) and React Refresh. `eslint-config-prettier` turns
  off anything that would conflict with Prettier.
- **Prettier** (`.prettierrc.json`): `.vscode/settings.json` turns on format-on-save and
  ESLint fix-on-save. Install the recommended extensions when VS Code prompts you.
- **CI** (`.github/workflows/ci.yml`): runs on every push to any branch and on pull requests.
  It runs ESLint (with zero warnings allowed), checks Prettier formatting, then type-checks and
  builds.

## Project structure

```
src/
  algorithms/   the search algorithms and their metadata
  mazes/        maze and pattern generators
  core/         board engine (model + DOM painting), grid helpers, search planning
  components/   app chrome: top bar, toolbar, legend, stats, board
  tutorial/     tutorial dialog and its scripted mini-board illustrations
  theme/        design tokens and the custom MUI theme
  styles/       node / board styles and animations
```

The board is painted imperatively by `BoardEngine`: each node is a plain element whose class
is patched directly. React subscribes to a small snapshot of the engine's state for everything
else. This keeps animations smooth while thousands of nodes change state.
