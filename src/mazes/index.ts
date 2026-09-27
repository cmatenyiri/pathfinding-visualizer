import { toIndex } from '../core/grid';
import { CellKind, type GridShape, type MazeId } from '../core/types';

export interface MazeOp {
  index: number;
  kind: CellKind;
}

/**
 * How to build a maze: optionally flood the board with `fill` first (instantly),
 * then animate `ops` in order. Protected cells (start / target / bomb) are never overwritten.
 */
export interface MazeRecipe {
  fill: CellKind | null;
  ops: MazeOp[];
}

export interface MazeInfo {
  id: MazeId;
  name: string;
  group: 'Mazes' | 'Patterns';
  description: string;
  generate: (shape: GridShape, protectedCells: ReadonlySet<number>) => MazeRecipe;
}

const randomInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function range(from: number, to: number, parity: 0 | 1): number[] {
  const out: number[] = [];
  for (let v = from; v <= to; v++) if ((v & 1) === parity) out.push(v);
  return out;
}

type Skew = 'none' | 'vertical' | 'horizontal';

function recursiveDivision(skew: Skew): MazeInfo['generate'] {
  return ({ rows, cols }, protectedCells) => {
    const ops: MazeOp[] = [];
    const wall = (r: number, c: number) => {
      const index = toIndex(r, c, cols);
      if (!protectedCells.has(index)) ops.push({ index, kind: CellKind.Wall });
    };

    // Frame the board, drawn clockwise.
    for (let c = 0; c < cols; c++) wall(0, c);
    for (let r = 1; r < rows; r++) wall(r, cols - 1);
    for (let c = cols - 2; c >= 0; c--) wall(rows - 1, c);
    for (let r = rows - 2; r > 0; r--) wall(r, 0);

    // Walls sit on even rows/cols and gaps on odd ones, so passages never get sealed.
    const divide = (r1: number, r2: number, c1: number, c2: number) => {
      const wallRows = range(r1 + 1, r2 - 1, 0);
      const wallCols = range(c1 + 1, c2 - 1, 0);
      if (!wallRows.length && !wallCols.length) return;

      let horizontal: boolean;
      if (!wallCols.length) horizontal = true;
      else if (!wallRows.length) horizontal = false;
      else if (skew === 'vertical') horizontal = Math.random() < 0.2;
      else if (skew === 'horizontal') horizontal = Math.random() < 0.8;
      else if (r2 - r1 !== c2 - c1) horizontal = r2 - r1 > c2 - c1;
      else horizontal = Math.random() < 0.5;

      if (horizontal) {
        const wr = pick(wallRows);
        const gaps = range(c1, c2, 1);
        const gap = gaps.length ? pick(gaps) : c1;
        for (let c = c1; c <= c2; c++) if (c !== gap) wall(wr, c);
        divide(r1, wr - 1, c1, c2);
        divide(wr + 1, r2, c1, c2);
      } else {
        const wc = pick(wallCols);
        const gaps = range(r1, r2, 1);
        const gap = gaps.length ? pick(gaps) : r1;
        for (let r = r1; r <= r2; r++) if (r !== gap) wall(r, wc);
        divide(r1, r2, c1, wc - 1);
        divide(r1, r2, wc + 1, c2);
      }
    };
    divide(1, rows - 2, 1, cols - 2);
    return { fill: null, ops };
  };
}

/** Rooms live on odd/odd coordinates; the cell between two rooms is the wall joining them. */
function roomNeighbors(rows: number, cols: number, r: number, c: number) {
  const out: [number, number][] = [];
  if (r - 2 >= 1) out.push([r - 2, c]);
  if (c + 2 <= cols - 2) out.push([r, c + 2]);
  if (r + 2 <= rows - 2) out.push([r + 2, c]);
  if (c - 2 >= 1) out.push([r, c - 2]);
  return out;
}

const backtracker: MazeInfo['generate'] = ({ rows, cols }) => {
  const ops: MazeOp[] = [];
  const carved = new Uint8Array(rows * cols);
  const carve = (r: number, c: number) => {
    const index = toIndex(r, c, cols);
    carved[index] = 1;
    ops.push({ index, kind: CellKind.Empty });
  };

  const stack: [number, number][] = [[1, 1]];
  carve(1, 1);
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const options = roomNeighbors(rows, cols, r, c).filter(
      ([nr, nc]) => !carved[toIndex(nr, nc, cols)],
    );
    if (!options.length) {
      stack.pop();
      continue;
    }
    const [nr, nc] = pick(options);
    carve((r + nr) / 2, (c + nc) / 2);
    carve(nr, nc);
    stack.push([nr, nc]);
  }
  return { fill: CellKind.Wall, ops };
};

const prim: MazeInfo['generate'] = ({ rows, cols }) => {
  const ops: MazeOp[] = [];
  const inMaze = new Uint8Array(rows * cols);
  const queued = new Uint8Array(rows * cols);
  const frontier: [number, number][] = [];
  const carve = (r: number, c: number) => {
    ops.push({ index: toIndex(r, c, cols), kind: CellKind.Empty });
  };
  const addRoom = (r: number, c: number) => {
    inMaze[toIndex(r, c, cols)] = 1;
    carve(r, c);
    for (const [nr, nc] of roomNeighbors(rows, cols, r, c)) {
      const i = toIndex(nr, nc, cols);
      if (!inMaze[i] && !queued[i]) {
        queued[i] = 1;
        frontier.push([nr, nc]);
      }
    }
  };

  addRoom(pick(range(1, rows - 2, 1)), pick(range(1, cols - 2, 1)));
  while (frontier.length) {
    const k = randomInt(0, frontier.length - 1);
    const [r, c] = frontier[k];
    frontier[k] = frontier[frontier.length - 1];
    frontier.pop();
    const [pr, pc] = pick(
      roomNeighbors(rows, cols, r, c).filter(([nr, nc]) => inMaze[toIndex(nr, nc, cols)]),
    );
    carve((r + pr) / 2, (c + pc) / 2);
    addRoom(r, c);
  }
  return { fill: CellKind.Wall, ops };
};

function scatter(kind: CellKind, density: number): MazeInfo['generate'] {
  return ({ rows, cols }, protectedCells) => {
    const ops: MazeOp[] = [];
    for (let index = 0; index < rows * cols; index++) {
      if (!protectedCells.has(index) && Math.random() < density) ops.push({ index, kind });
    }
    return { fill: null, ops: shuffle(ops) };
  };
}

const stairs: MazeInfo['generate'] = ({ rows, cols }, protectedCells) => {
  const ops: MazeOp[] = [];
  // Zig-zag diagonals from edge to edge. A diagonal wall can't be slipped through with
  // 4-way movement, so the cell at every turn is left open: that is the only way past.
  let r = rows - 1;
  let dir = -1;
  for (let c = 0; c < cols; c++) {
    const index = toIndex(r, c, cols);
    const turn = r === 0 || r === rows - 1;
    if (!turn && !protectedCells.has(index)) ops.push({ index, kind: CellKind.Wall });
    if (r + dir < 0 || r + dir > rows - 1) dir = -dir;
    r += dir;
  }
  return { fill: null, ops };
};

export const MAZES: readonly MazeInfo[] = [
  {
    id: 'recursive-division',
    name: 'Recursive Division',
    group: 'Mazes',
    description: 'Splits the board with walls, each with a single gap, then recurses.',
    generate: recursiveDivision('none'),
  },
  {
    id: 'recursive-division-vertical',
    name: 'Recursive Division (vertical skew)',
    group: 'Mazes',
    description: 'Recursive division that favours vertical walls — long up/down corridors.',
    generate: recursiveDivision('vertical'),
  },
  {
    id: 'recursive-division-horizontal',
    name: 'Recursive Division (horizontal skew)',
    group: 'Mazes',
    description: 'Recursive division that favours horizontal walls — long sideways corridors.',
    generate: recursiveDivision('horizontal'),
  },
  {
    id: 'backtracker',
    name: 'Recursive Backtracker',
    group: 'Mazes',
    description: 'Carves a perfect maze with a random depth-first walk: long, twisty corridors.',
    generate: backtracker,
  },
  {
    id: 'prim',
    name: "Randomized Prim's",
    group: 'Mazes',
    description: 'Grows a perfect maze outward from a random room: short, branching dead ends.',
    generate: prim,
  },
  {
    id: 'random-walls',
    name: 'Basic Random Maze',
    group: 'Patterns',
    description: 'Scatters walls across roughly 30% of the board.',
    generate: scatter(CellKind.Wall, 0.3),
  },
  {
    id: 'random-weights',
    name: 'Basic Weight Maze',
    group: 'Patterns',
    description: 'Scatters weight nodes across roughly 30% of the board.',
    generate: scatter(CellKind.Weight, 0.3),
  },
  {
    id: 'stairs',
    name: 'Simple Stair Pattern',
    group: 'Patterns',
    description: 'A zig-zag staircase of walls; the path has to snake through every turn.',
    generate: stairs,
  },
];

export const getMaze = (id: MazeId): MazeInfo => MAZES.find((m) => m.id === id) ?? MAZES[0];

/**
 * Generates a maze and, if a protected node ended up boxed in by walls on all four sides,
 * appends an op that opens one of its neighbours so it can still be reached.
 */
export function buildMaze(
  id: MazeId,
  shape: GridShape,
  protectedCells: ReadonlySet<number>,
): MazeRecipe {
  const { rows, cols } = shape;
  const recipe = getMaze(id).generate(shape, protectedCells);
  const final = new Uint8Array(rows * cols);
  if (recipe.fill !== null) final.fill(recipe.fill);
  for (const index of protectedCells) final[index] = CellKind.Empty;
  for (const op of recipe.ops) if (!protectedCells.has(op.index)) final[op.index] = op.kind;

  for (const index of protectedCells) {
    const r = Math.floor(index / cols);
    const c = index % cols;
    const around: [number, number][] = [
      [r - 1, c],
      [r, c + 1],
      [r + 1, c],
      [r, c - 1],
    ];
    const inside = around.filter(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols);
    if (inside.some(([nr, nc]) => final[toIndex(nr, nc, cols)] !== CellKind.Wall)) continue;
    const interior = inside.filter(
      ([nr, nc]) => nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1,
    );
    const [nr, nc] = interior[0] ?? inside[0];
    const opening = toIndex(nr, nc, cols);
    final[opening] = CellKind.Empty;
    recipe.ops.push({ index: opening, kind: CellKind.Empty });
  }
  return recipe;
}
