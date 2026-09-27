import { getAlgorithm } from '../algorithms';
import {
  cellClass,
  VISIT_BOMB_LEG,
  VISIT_MAIN,
  VISIT_NONE,
  type SpecialNode,
} from '../core/cellClass';
import { toIndex } from '../core/grid';
import { planSearch } from '../core/plan';
import { CellKind, type AlgorithmId, type MazeId } from '../core/types';
import { buildMaze } from '../mazes';

export interface Cursor {
  index: number;
  pressed: boolean;
}

export interface Frame {
  cells: string[];
  cursor: Cursor | null;
  /** Keys shown as held down. */
  keys: string[];
  duration: number;
}

export interface Scene {
  rows: number;
  cols: number;
  frames: Frame[];
}

const ROWS = 11;
const COLS = 21;

/** Scripts a tiny board frame-by-frame, running the real algorithms for the search parts. */
class SceneBuilder {
  readonly frames: Frame[] = [];
  readonly cells = new Uint8Array(ROWS * COLS);
  private visit = new Uint8Array(ROWS * COLS);
  private path = new Uint8Array(ROWS * COLS);
  private kindStatic = new Uint8Array(ROWS * COLS).fill(1);
  private settled = false;
  start: number;
  target: number;
  bomb = -1;
  cursor: Cursor | null = null;
  keys: string[] = [];

  constructor(start: [number, number], target: [number, number]) {
    this.start = at(...start);
    this.target = at(...target);
  }

  private specialAt(i: number): SpecialNode | null {
    if (i === this.start) return 'start';
    if (i === this.target) return 'target';
    if (i === this.bomb) return 'bomb';
    return null;
  }

  snap(duration = 50) {
    const cells: string[] = [];
    for (let i = 0; i < ROWS * COLS; i++) {
      cells.push(
        cellClass(this.cells[i], this.specialAt(i), this.visit[i], this.path[i] === 1, {
          kindStatic: this.kindStatic[i] === 1,
          settled: this.settled,
        }),
      );
    }
    this.frames.push({
      cells,
      cursor: this.cursor && { ...this.cursor },
      keys: [...this.keys],
      duration,
    });
    return this;
  }

  set(index: number, kind: CellKind, animate = true) {
    this.cells[index] = kind;
    this.kindStatic[index] = animate ? 0 : 1;
    return this;
  }

  private plan(algorithm: AlgorithmId) {
    return planSearch(
      {
        rows: ROWS,
        cols: COLS,
        cells: this.cells,
        start: this.start,
        target: this.target,
        bomb: this.bomb,
      },
      getAlgorithm(algorithm),
    );
  }

  clearOverlay() {
    this.visit.fill(VISIT_NONE);
    this.path.fill(0);
    return this;
  }

  animateSearch(algorithm: AlgorithmId, perFrame = 3, frameMs = 40) {
    const plan = this.plan(algorithm);
    this.clearOverlay();
    this.settled = false;
    let count = 0;
    for (const leg of plan.legs) {
      for (const node of leg.visited) {
        this.visit[node] = leg.toBomb ? VISIT_BOMB_LEG : VISIT_MAIN;
        if (++count % perFrame === 0) this.snap(frameMs);
      }
    }
    this.snap(frameMs * 3);
    for (const node of plan.path) {
      this.path[node] = 1;
      this.snap(frameMs);
    }
    return this;
  }

  showSearch(algorithm: AlgorithmId) {
    const plan = this.plan(algorithm);
    this.clearOverlay();
    this.settled = true;
    for (const leg of plan.legs) {
      for (const node of leg.visited) this.visit[node] = leg.toBomb ? VISIT_BOMB_LEG : VISIT_MAIN;
    }
    for (const node of plan.path) this.path[node] = 1;
    return this;
  }

  build(): Scene {
    return { rows: ROWS, cols: COLS, frames: this.frames };
  }
}

const at = (row: number, col: number) => toIndex(row, col, COLS);

function heroScene(): Scene {
  const s = new SceneBuilder([5, 3], [5, 17]);
  for (let r = 1; r <= 7; r++) s.set(at(r, 7), CellKind.Wall, false);
  for (let r = 3; r <= 9; r++) s.set(at(r, 13), CellKind.Wall, false);
  for (const [r, c] of [
    [1, 10],
    [2, 10],
    [8, 9],
    [9, 16],
    [2, 16],
  ] as const) {
    s.set(at(r, c), CellKind.Weight, false);
  }
  s.snap(700);
  s.animateSearch('astar', 2, 45);
  return s.snap(2600).build();
}

function rippleScene(): Scene {
  const s = new SceneBuilder([5, 4], [5, 16]);
  for (let r = 3; r <= 7; r++) s.set(at(r, 10), CellKind.Wall, false);
  s.snap(600);
  s.animateSearch('dijkstra', 4, 40);
  return s.snap(2600).build();
}

function wallsAndWeightsScene(): Scene {
  const s = new SceneBuilder([5, 3], [5, 17]);
  s.snap(500);

  // Draw a wall with the mouse.
  s.cursor = { index: at(0, 8), pressed: false };
  s.snap(450);
  s.cursor.pressed = true;
  for (let r = 0; r <= 6; r++) {
    s.cursor.index = at(r, 8);
    s.set(at(r, 8), CellKind.Wall);
    s.snap(90);
  }
  s.cursor.pressed = false;
  s.snap(400);

  // Hold W and draw weights.
  s.cursor.index = at(10, 13);
  s.snap(350);
  s.keys = ['W'];
  s.snap(350);
  s.cursor.pressed = true;
  for (let r = 10; r >= 4; r--) {
    s.cursor.index = at(r, 13);
    s.set(at(r, 13), CellKind.Weight);
    s.snap(100);
  }
  s.cursor.pressed = false;
  s.snap(250);
  s.keys = [];
  s.cursor = null;
  s.snap(400);

  s.animateSearch('astar', 2, 45);
  return s.snap(2600).build();
}

function bombScene(): Scene {
  const s = new SceneBuilder([8, 3], [8, 17]);
  s.bomb = at(2, 10);
  for (let c = 6; c <= 14; c++) s.set(at(5, c), CellKind.Wall, false);
  s.snap(600);
  s.animateSearch('dijkstra', 4, 40);
  return s.snap(2600).build();
}

function dragScene(): Scene {
  const s = new SceneBuilder([5, 3], [5, 17]);
  for (let r = 2; r <= 8; r++) s.set(at(r, 10), CellKind.Wall, false);
  s.showSearch('astar').snap(800);

  s.cursor = { index: at(8, 14), pressed: false };
  s.snap(200);
  for (const [r, c] of [
    [7, 15],
    [6, 16],
    [5, 17],
  ] as const) {
    s.cursor.index = at(r, c);
    s.snap(130);
  }
  s.cursor.pressed = true;
  s.snap(250);

  const route: [number, number][] = [];
  for (let r = 4; r >= 1; r--) route.push([r, 17]);
  for (let c = 16; c >= 13; c--) route.push([1, c]);
  for (let r = 2; r <= 9; r++) route.push([r, 13]);
  for (let c = 14; c <= 17; c++) route.push([9, c]);
  for (let r = 8; r >= 5; r--) route.push([r, 17]);
  for (const [r, c] of route) {
    s.target = at(r, c);
    s.cursor.index = s.target;
    s.showSearch('astar').snap(140);
  }
  s.cursor.pressed = false;
  s.snap(500);
  s.cursor = null;
  return s.snap(1400).build();
}

function mazeScene(id: MazeId = 'recursive-division'): Scene {
  const s = new SceneBuilder([5, 1], [5, 19]);
  s.snap(500);
  const recipe = buildMaze(id, { rows: ROWS, cols: COLS }, new Set([s.start, s.target]));
  recipe.ops.forEach((op, k) => {
    s.set(op.index, op.kind);
    if (k % 3 === 2) s.snap(30);
  });
  s.snap(500);
  s.animateSearch('astar', 2, 40);
  return s.snap(2600).build();
}

export const scenes = {
  hero: heroScene,
  ripple: rippleScene,
  wallsAndWeights: wallsAndWeightsScene,
  bomb: bombScene,
  drag: dragScene,
  maze: mazeScene,
};
