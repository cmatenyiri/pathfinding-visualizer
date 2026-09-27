import { useEffect } from 'react';
import { engine } from '../core/engine';

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  target.closest(
    'input, textarea, select, [contenteditable="true"], [role="listbox"], [role="menu"]',
  ) !== null;

/**
 * Global keyboard shortcuts. Holding W switches the brush to weights; the rest are one-shot
 * commands that are paused while a dialog (e.g. the tutorial) is open.
 */
export function useShortcuts(enabled: boolean, openTutorial: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === 'w') {
        engine.setWeightKey(true);
        return;
      }
      if (!enabled || event.repeat || isEditable(event.target)) return;

      switch (key) {
        case 'v':
          engine.visualize();
          break;
        case 'b':
          if (engine.getSnapshot().hasBomb) engine.removeBomb();
          else engine.addBomb();
          break;
        case 'c':
          engine.clearPath();
          break;
        case 'escape':
          engine.stop();
          break;
        case '?':
          openTutorial();
          break;
        default:
          return;
      }
      event.preventDefault();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'w') engine.setWeightKey(false);
    };
    const release = () => engine.setWeightKey(false);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', release);
    };
  }, [enabled, openTutorial]);
}
