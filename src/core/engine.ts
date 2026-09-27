import { useSyncExternalStore } from 'react';
import { BoardEngine } from './BoardEngine';

/** The single board instance shared by the whole app. */
export const engine = new BoardEngine();

export function useEngineSnapshot() {
  return useSyncExternalStore(engine.subscribe, engine.getSnapshot);
}
