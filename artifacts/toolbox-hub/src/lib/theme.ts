// Theme (light / dark) — persists to localStorage, respects system preference.
import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
const THEME_KEY = 'tbh_theme';

function getInitial(): Theme {
  try {
    const s = localStorage.getItem(THEME_KEY);
    if (s === 'dark' || s === 'light') return s;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(t: Theme) {
  document.documentElement.classList.toggle('dark', t === 'dark');
}

/** Call once in the <head> script to avoid FOUC */
export function applyThemeImmediate() {
  applyTheme(getInitial());
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}
