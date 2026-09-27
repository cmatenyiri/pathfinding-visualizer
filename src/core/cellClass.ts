import { CellKind } from './types';

export type SpecialNode = 'start' | 'target' | 'bomb';

export const VISIT_NONE = 0;
export const VISIT_BOMB_LEG = 1;
export const VISIT_MAIN = 2;

export interface CellFlags {
  /** Cell kind changed without animation (maze fills, resizes). */
  kindStatic?: boolean;
  /** Overlay painted instantly rather than animated. */
  settled?: boolean;
  /** Just carved out of a wall by a maze generator. */
  carved?: boolean;
}

/** The className for one node. Every visual state of a node is expressed through these classes. */
export function cellClass(
  kind: number,
  special: SpecialNode | null,
  visit: number,
  onPath: boolean,
  flags: CellFlags = {},
): string {
  if (special) return `cell cell--${special}`;
  let cls = 'cell';
  if (kind === CellKind.Wall) cls += ' cell--wall';
  else if (kind === CellKind.Weight) cls += ' cell--weight';
  if (flags.kindStatic) cls += ' cell--static';

  if (onPath) cls += ' cell--path';
  else if (visit === VISIT_MAIN) cls += ' cell--visited';
  else if (visit === VISIT_BOMB_LEG) cls += ' cell--visited-bomb';
  else if (flags.carved) cls += ' cell--carved';
  if (flags.settled) cls += ' cell--settled';
  return cls;
}
