const STORAGE_KEY = 'wayfinder:hide-tutorial';

export function shouldShowTutorial(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== '1';
  } catch {
    return true;
  }
}

export function rememberTutorialChoice(hide: boolean) {
  try {
    if (hide) localStorage.setItem(STORAGE_KEY, '1');
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (e.g. private mode): the tutorial simply shows again next time.
  }
}
