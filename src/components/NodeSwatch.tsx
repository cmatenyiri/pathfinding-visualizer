import type { CSSProperties } from 'react';
import { cellClass, VISIT_BOMB_LEG, VISIT_MAIN, VISIT_NONE } from '../core/cellClass';
import { CellKind } from '../core/types';

export type SwatchType =
  | 'start'
  | 'target'
  | 'bomb'
  | 'weight'
  | 'unvisited'
  | 'visited'
  | 'visited-bomb'
  | 'path'
  | 'wall';

const CLASSES: Record<SwatchType, string> = {
  start: cellClass(CellKind.Empty, 'start', VISIT_NONE, false),
  target: cellClass(CellKind.Empty, 'target', VISIT_NONE, false),
  bomb: cellClass(CellKind.Empty, 'bomb', VISIT_NONE, false),
  weight: cellClass(CellKind.Weight, null, VISIT_NONE, false),
  unvisited: cellClass(CellKind.Empty, null, VISIT_NONE, false),
  visited: cellClass(CellKind.Empty, null, VISIT_MAIN, false),
  'visited-bomb': cellClass(CellKind.Empty, null, VISIT_BOMB_LEG, false),
  path: cellClass(CellKind.Empty, null, VISIT_NONE, true),
  wall: cellClass(CellKind.Wall, null, VISIT_NONE, false),
};

/** A single node rendered with the exact same styles as the board. */
export function NodeSwatch({ type, size = 20 }: { type: SwatchType; size?: number }) {
  return (
    <span className="swatch" style={{ '--cell': `${size}px` } as CSSProperties} aria-hidden>
      <span className={CLASSES[type]} />
    </span>
  );
}
