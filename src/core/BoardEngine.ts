import { getAlgorithm } from '../algorithms';
import { buildMaze } from '../mazes';
import { cellClass, VISIT_BOMB_LEG, VISIT_MAIN, VISIT_NONE, type SpecialNode } from './cellClass';
import { lineBetween, toIndex } from './grid';
import { planSearch, type BoardState, type SearchPlan } from './plan';
import {
  CellKind,
  type AlgorithmId,
  type Brush,
  type EngineStatus,
  type MazeId,
  type RunStats,
  type Speed,
} from './types';

/** Nodes revealed per second while animating the search. */
const VISIT_RATE: Record<Speed, number> = { fast: 260, average: 80, slow: 24 };
/** Nodes revealed per second while tracing the final path. */
const PATH_RATE: Record<Speed, number> = { fast: 75, average: 36, slow: 14 };
/** Cells placed per second while building a maze. */
const MAZE_RATE: Record<Speed, number> = { fast: 520, average: 240, slow: 90 };

type Gesture =
  | { type: 'draw' | 'erase'; kind: CellKind; last: number }
  | { type: 'move'; node: SpecialNode; last: number };

export interface EngineSnapshot {
  status: EngineStatus;
  stats: RunStats | null;
  hasBomb: boolean;
  rows: number;
  cols: number;
  /** The brush picked in the toolbar. */
  brush: Brush;
  /** The brush that a click would use right now (holding W overrides the selected brush). */
  activeBrush: Brush;
  /** Any walls or weights on the board. */
  hasObstacles: boolean;
  hasWeights: boolean;
}

export interface Notice {
  severity: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

/**
 * Owns the board model and paints it straight to the DOM.
 *
 * React renders the chrome around the board, but a grid with ~1.5k cells being animated at
 * hundreds of updates per second is far smoother when each cell is a plain element whose
 * className is patched directly. React subscribes to a small immutable snapshot instead.
 */
export class BoardEngine {
  rows = 0;
  cols = 0;
  cells = new Uint8Array(0);
  start = -1;
  target = -1;
  bomb = -1;

  private visit = new Uint8Array(0);
  private path = new Uint8Array(0);
  /** Cell kind changed without animation (maze fills, resizes). */
  private kindStatic = new Uint8Array(0);
  /** Overlay painted instantly (live recompute) rather than animated. */
  private overlayStatic = new Uint8Array(0);
  /** Just carved out of a wall by a maze generator. */
  private carved = new Uint8Array(0);

  private container: HTMLElement | null = null;
  private elements: HTMLElement[] = [];
  private classCache: string[] = [];

  private status: EngineStatus = 'idle';
  private stats: RunStats | null = null;
  private algorithm: AlgorithmId = 'dijkstra';
  private speed: Speed = 'fast';
  private brush: Brush = 'wall';
  private weightKey = false;

  private gesture: Gesture | null = null;
  private frame: number | null = null;
  private runToken = 0;
  private recomputeFrame: number | null = null;

  private listeners = new Set<() => void>();
  private noticeListeners = new Set<(notice: Notice) => void>();
  private snapshot: EngineSnapshot = this.buildSnapshot();

  // ─── Subscription ───────────────────────────────────────────────────────────

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  onNotice(listener: (notice: Notice) => void) {
    this.noticeListeners.add(listener);
    return () => {
      this.noticeListeners.delete(listener);
    };
  }

  private notify(notice: Notice) {
    for (const listener of this.noticeListeners) listener(notice);
  }

  private buildSnapshot(): EngineSnapshot {
    let hasObstacles = false;
    let hasWeights = false;
    for (const kind of this.cells) {
      if (kind !== CellKind.Empty) hasObstacles = true;
      if (kind === CellKind.Weight) {
        hasWeights = true;
        break;
      }
    }
    return {
      status: this.status,
      stats: this.stats,
      hasBomb: this.bomb !== -1,
      rows: this.rows,
      cols: this.cols,
      brush: this.brush,
      activeBrush: this.weightKey ? 'weight' : this.brush,
      hasObstacles,
      hasWeights,
    };
  }

  private emit() {
    this.snapshot = this.buildSnapshot();
    for (const listener of this.listeners) listener();
  }

  // ─── Settings ───────────────────────────────────────────────────────────────

  setAlgorithm(id: AlgorithmId) {
    this.algorithm = id;
    if (this.status === 'done') this.recomputeNow();
  }

  setSpeed(speed: Speed) {
    this.speed = speed;
  }

  setBrush(brush: Brush) {
    this.brush = brush;
    this.emit();
  }

  setWeightKey(held: boolean) {
    if (this.weightKey === held) return;
    this.weightKey = held;
    this.emit();
  }

  get busy() {
    return this.status === 'running' || this.status === 'generating';
  }

  // ─── DOM ────────────────────────────────────────────────────────────────────

  mount(container: HTMLElement) {
    this.container = container;
    this.buildDom();
  }

  unmount() {
    this.cancelAnimation();
    this.container = null;
    this.elements = [];
    this.classCache = [];
  }

  private buildDom() {
    const container = this.container;
    if (!container) return;
    const fragment = document.createDocumentFragment();
    const count = this.rows * this.cols;
    this.elements = new Array<HTMLElement>(count);
    this.classCache = new Array<string>(count).fill('');
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      this.elements[i] = el;
      fragment.appendChild(el);
    }
    container.replaceChildren(fragment);
    container.style.setProperty('--rows', String(this.rows));
    container.style.setProperty('--cols', String(this.cols));
    this.paintAll();
  }

  private paint(i: number) {
    const el = this.elements[i];
    if (!el) return;
    const cls = cellClass(this.cells[i], this.specialAt(i), this.visit[i], this.path[i] === 1, {
      kindStatic: this.kindStatic[i] === 1,
      settled: this.overlayStatic[i] === 1,
      carved: this.carved[i] === 1,
    });
    if (this.classCache[i] !== cls) {
      this.classCache[i] = cls;
      el.className = cls;
    }
  }

  private paintAll() {
    for (let i = 0; i < this.elements.length; i++) this.paint(i);
  }

  // ─── Layout ─────────────────────────────────────────────────────────────────

  /** Resizes the board, keeping whatever walls/weights still fit. */
  resize(rows: number, cols: number) {
    if (rows === this.rows && cols === this.cols) return;
    this.cancelAnimation();
    const prev = { rows: this.rows, cols: this.cols, cells: this.cells };
    const n = rows * cols;
    const cells = new Uint8Array(n);
    for (let r = 0; r < Math.min(rows, prev.rows); r++) {
      for (let c = 0; c < Math.min(cols, prev.cols); c++) {
        cells[r * cols + c] = prev.cells[r * prev.cols + c];
      }
    }

    const relocate = (index: number) => {
      if (index === -1 || prev.cols === 0) return -1;
      const r = Math.floor(index / prev.cols);
      const c = index % prev.cols;
      return r < rows && c < cols ? toIndex(r, c, cols) : -1;
    };
    let start = relocate(this.start);
    let target = relocate(this.target);
    let bomb = relocate(this.bomb);
    const defaults = this.defaultPositions(rows, cols);
    if (start === -1 || target === -1 || start === target) {
      start = defaults.start;
      target = defaults.target;
    }
    if (bomb === start || bomb === target) bomb = -1;

    this.rows = rows;
    this.cols = cols;
    this.cells = cells;
    this.start = start;
    this.target = target;
    this.bomb = bomb;
    for (const special of [start, target, bomb])
      if (special !== -1) cells[special] = CellKind.Empty;
    this.visit = new Uint8Array(n);
    this.path = new Uint8Array(n);
    this.kindStatic = new Uint8Array(n).fill(1);
    this.overlayStatic = new Uint8Array(n);
    this.carved = new Uint8Array(n);
    this.status = 'idle';
    this.stats = null;
    this.buildDom();
    this.emit();
  }

  private defaultPositions(rows: number, cols: number) {
    // Odd coordinates line up with maze corridors, so mazes never wall the nodes in.
    const odd = (v: number, max: number) => Math.min(v % 2 === 0 ? v + 1 : v, max);
    const row = odd(Math.floor(rows / 2), rows - 2);
    return {
      start: toIndex(row, odd(Math.floor(cols / 4), cols - 2), cols),
      target: toIndex(row, odd(Math.floor((cols * 3) / 4), cols - 2), cols),
    };
  }

  // ─── Pointer interaction ────────────────────────────────────────────────────

  private indexAt(clientX: number, clientY: number): number {
    const container = this.container;
    if (!container || !this.cols) return -1;
    const rect = container.getBoundingClientRect();
    const col = Math.floor(((clientX - rect.left) / rect.width) * this.cols);
    const row = Math.floor(((clientY - rect.top) / rect.height) * this.rows);
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return -1;
    return toIndex(row, col, this.cols);
  }

  private specialAt(i: number): SpecialNode | null {
    if (i === this.start) return 'start';
    if (i === this.target) return 'target';
    if (i === this.bomb) return 'bomb';
    return null;
  }

  /** Returns true when the engine started a gesture (the caller should capture the pointer). */
  pointerDown(clientX: number, clientY: number): boolean {
    if (this.busy) return false;
    const i = this.indexAt(clientX, clientY);
    if (i === -1) return false;

    const special = this.specialAt(i);
    if (special) {
      this.gesture = { type: 'move', node: special, last: i };
      if (this.container) this.container.dataset.dragging = '';
      return true;
    }

    const brush = this.weightKey ? 'weight' : this.brush;
    const kind = brush === 'wall' ? CellKind.Wall : CellKind.Weight;
    this.gesture = { type: this.cells[i] === kind ? 'erase' : 'draw', kind, last: i };
    this.applyBrush(i);
    this.afterEdit();
    return true;
  }

  pointerMove(clientX: number, clientY: number) {
    const gesture = this.gesture;
    if (!gesture || this.busy) return;
    const i = this.indexAt(clientX, clientY);
    if (i === -1 || i === gesture.last) return;

    if (gesture.type === 'move') {
      if (this.specialAt(i)) return;
      const from = this[gesture.node];
      this[gesture.node] = i;
      gesture.last = i;
      this.paint(from);
      this.paint(i);
      this.afterEdit();
      return;
    }

    for (const cell of lineBetween(gesture.last, i, this.cols)) this.applyBrush(cell);
    gesture.last = i;
    this.afterEdit();
  }

  pointerUp() {
    const gesture = this.gesture;
    this.gesture = null;
    if (this.container) delete this.container.dataset.dragging;
    if (gesture?.type === 'move') {
      // A node dropped onto a wall or weight replaces it.
      const at = this[gesture.node];
      if (this.cells[at] !== CellKind.Empty) {
        this.cells[at] = CellKind.Empty;
        this.afterEdit();
      }
    }
    this.emit();
  }

  private applyBrush(i: number) {
    const gesture = this.gesture;
    if (!gesture || gesture.type === 'move' || this.specialAt(i)) return;
    const next = gesture.type === 'draw' ? gesture.kind : CellKind.Empty;
    if (gesture.type === 'erase' && this.cells[i] !== gesture.kind) return;
    if (this.cells[i] === next) return;
    this.cells[i] = next;
    this.kindStatic[i] = 0;
    this.carved[i] = 0;
    this.paint(i);
  }

  /** After the board has been visualised, edits update the result live. */
  private afterEdit() {
    if (this.status === 'done') this.scheduleRecompute();
  }

  // ─── Board commands ─────────────────────────────────────────────────────────

  addBomb() {
    if (this.busy || this.bomb !== -1 || !this.cols) return;
    const center = toIndex(Math.floor(this.rows / 2), Math.floor(this.cols / 2), this.cols);
    this.bomb = this.nearestFree(center);
    this.cells[this.bomb] = CellKind.Empty;
    this.paint(this.bomb);
    this.afterEdit();
    this.emit();
  }

  removeBomb() {
    if (this.busy || this.bomb === -1) return;
    const at = this.bomb;
    this.bomb = -1;
    this.paint(at);
    this.afterEdit();
    this.emit();
  }

  /** Closest cell to `from` that is not start/target (spiral outwards). */
  private nearestFree(from: number): number {
    const r0 = Math.floor(from / this.cols);
    const c0 = from % this.cols;
    for (let d = 0; d < Math.max(this.rows, this.cols); d++) {
      for (let dr = -d; dr <= d; dr++) {
        for (let dc = -d; dc <= d; dc++) {
          if (Math.max(Math.abs(dr), Math.abs(dc)) !== d) continue;
          const r = r0 + dr;
          const c = c0 + dc;
          if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) continue;
          const i = toIndex(r, c, this.cols);
          if (i !== this.start && i !== this.target) return i;
        }
      }
    }
    return from;
  }

  clearPath() {
    this.cancelAnimation();
    this.resetOverlay();
    this.status = 'idle';
    this.stats = null;
    this.paintAll();
    this.emit();
  }

  clearWallsAndWeights() {
    const wasDone = this.status === 'done';
    this.cancelAnimation();
    this.cells.fill(CellKind.Empty);
    this.carved.fill(0);
    if (wasDone) {
      this.status = 'done';
      this.recomputeNow();
    } else {
      this.resetOverlay();
      this.status = 'idle';
      this.stats = null;
      this.paintAll();
      this.emit();
    }
  }

  clearBoard() {
    this.cancelAnimation();
    this.cells.fill(CellKind.Empty);
    this.carved.fill(0);
    this.kindStatic.fill(1);
    this.resetOverlay();
    const defaults = this.defaultPositions(this.rows, this.cols);
    this.start = defaults.start;
    this.target = defaults.target;
    this.bomb = -1;
    this.status = 'idle';
    this.stats = null;
    this.paintAll();
    this.emit();
  }

  private resetOverlay() {
    this.visit.fill(VISIT_NONE);
    this.path.fill(0);
    this.overlayStatic.fill(0);
  }

  // ─── Search ─────────────────────────────────────────────────────────────────

  private boardState(): BoardState {
    // Specials are always passable, even while being dragged across a wall.
    const cells = this.cells.slice();
    for (const special of [this.start, this.target, this.bomb]) {
      if (special !== -1) cells[special] = CellKind.Empty;
    }
    return {
      rows: this.rows,
      cols: this.cols,
      cells,
      start: this.start,
      target: this.target,
      bomb: this.bomb,
    };
  }

  private plan(): SearchPlan {
    return planSearch(this.boardState(), getAlgorithm(this.algorithm));
  }

  visualize() {
    if (this.busy || !this.cols) return;
    this.cancelAnimation();
    this.resetOverlay();
    this.carved.fill(0);
    this.paintAll();

    const algorithm = getAlgorithm(this.algorithm);
    if (!algorithm.weighted && this.snapshot.hasWeights) {
      this.notify({
        severity: 'info',
        message: `${algorithm.shortName} is unweighted — weight nodes are treated like normal nodes.`,
      });
    }

    const plan = this.plan();
    const order: number[] = [];
    const legOf: number[] = [];
    for (const leg of plan.legs) {
      for (const node of leg.visited) {
        order.push(node);
        legOf.push(leg.toBomb ? VISIT_BOMB_LEG : VISIT_MAIN);
      }
    }

    this.status = 'running';
    this.stats = null;
    this.emit();

    const finish = () => {
      this.status = 'done';
      this.stats = plan.stats;
      this.emit();
      if (!plan.stats.found) {
        this.notify({
          severity: 'warning',
          message: plan.stats.viaBomb
            ? 'No path found — the bomb or the target is walled off.'
            : 'No path found — the target is walled off.',
        });
      }
    };

    this.play(
      order.length,
      () => VISIT_RATE[this.speed],
      (k) => {
        const node = order[k];
        this.visit[node] = legOf[k];
        this.paint(node);
      },
      () => {
        if (!plan.path.length) return finish();
        this.play(
          plan.path.length,
          () => PATH_RATE[this.speed],
          (k) => {
            const node = plan.path[k];
            this.path[node] = 1;
            this.paint(node);
          },
          finish,
        );
      },
    );
  }

  /** Stops a running visualisation or maze build. */
  stop() {
    if (this.status === 'running') {
      this.clearPath();
    } else if (this.status === 'generating') {
      this.cancelAnimation();
      this.status = 'idle';
      this.emit();
    }
  }

  private scheduleRecompute() {
    if (this.recomputeFrame !== null) return;
    this.recomputeFrame = requestAnimationFrame(() => {
      this.recomputeFrame = null;
      if (this.status === 'done') this.recomputeNow();
    });
  }

  /** Recomputes the search and paints the result instantly, without animation. */
  private recomputeNow() {
    const plan = this.plan();
    this.visit.fill(VISIT_NONE);
    this.path.fill(0);
    for (const leg of plan.legs) {
      for (const node of leg.visited) this.visit[node] = leg.toBomb ? VISIT_BOMB_LEG : VISIT_MAIN;
    }
    for (const node of plan.path) this.path[node] = 1;
    this.overlayStatic.fill(1);
    this.paintAll();
    this.stats = plan.stats;
    this.emit();
  }

  // ─── Mazes ──────────────────────────────────────────────────────────────────

  generateMaze(id: MazeId) {
    if (!this.cols) return;
    this.cancelAnimation();
    this.resetOverlay();
    this.stats = null;
    this.cells.fill(CellKind.Empty);
    this.carved.fill(0);
    this.kindStatic.fill(1);

    const specials = [this.start, this.target, this.bomb].filter((i) => i !== -1);
    const protectedCells = new Set(specials);
    const recipe = buildMaze(id, { rows: this.rows, cols: this.cols }, protectedCells);
    if (recipe.fill !== null) {
      this.cells.fill(recipe.fill);
      for (const i of specials) this.cells[i] = CellKind.Empty;
    }
    this.paintAll();

    this.status = 'generating';
    this.emit();
    const ops = recipe.ops.filter((op) => !protectedCells.has(op.index));
    this.play(
      ops.length,
      () => MAZE_RATE[this.speed],
      (k) => {
        const { index, kind } = ops[k];
        const carving = kind === CellKind.Empty && this.cells[index] === CellKind.Wall;
        this.cells[index] = kind;
        this.kindStatic[index] = 0;
        this.carved[index] = carving ? 1 : 0;
        this.paint(index);
      },
      () => {
        this.status = 'idle';
        this.emit();
      },
    );
  }

  // ─── Animation loop ─────────────────────────────────────────────────────────

  /**
   * Calls `step(0..total-1)` spread over time at `rate()` steps per second. The rate is read
   * every frame, so changing the speed mid-animation takes effect immediately.
   */
  private play(total: number, rate: () => number, step: (k: number) => void, done: () => void) {
    const token = ++this.runToken;
    let applied = 0;
    let budget = 1; // show the first step on the very first frame
    let last = -1;
    const tick = (now: number) => {
      if (token !== this.runToken) return;
      if (last >= 0) budget += (Math.min(now - last, 100) / 1000) * rate();
      last = now;
      while (budget >= 1 && applied < total) {
        step(applied++);
        budget -= 1;
      }
      if (applied >= total) {
        this.frame = null;
        done();
        return;
      }
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  private cancelAnimation() {
    this.runToken++;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    if (this.recomputeFrame !== null) cancelAnimationFrame(this.recomputeFrame);
    this.frame = null;
    this.recomputeFrame = null;
  }
}
