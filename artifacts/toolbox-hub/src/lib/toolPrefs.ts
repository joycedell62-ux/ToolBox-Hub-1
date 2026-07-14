// Favorites + Recently Used — localStorage-backed, synced across components
// via useSyncExternalStore (stable string snapshots, so no render loops).
import { useCallback, useMemo, useSyncExternalStore } from 'react';

const FAV_KEY = 'toolbox_favorites';
const RECENT_KEY = 'toolbox_recent';
const RECENT_MAX = 8;

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: Listener) {
  listeners.add(l);
  window.addEventListener('storage', l);
  return () => {
    listeners.delete(l);
    window.removeEventListener('storage', l);
  };
}

function readList(key: string): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeList(key: string, value: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full/blocked — ignore */
  }
  emit();
}

// Snapshots return the raw string so the reference is stable between renders.
const favSnapshot = () => localStorage.getItem(FAV_KEY) || '[]';
const recentSnapshot = () => localStorage.getItem(RECENT_KEY) || '[]';
const serverSnapshot = () => '[]';

function parseList(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, favSnapshot, serverSnapshot);
  const favorites = useMemo(() => parseList(raw), [raw]);
  const isFavorite = useCallback((href: string) => favorites.includes(href), [favorites]);
  const toggleFavorite = useCallback((href: string) => {
    const cur = readList(FAV_KEY);
    writeList(FAV_KEY, cur.includes(href) ? cur.filter((h) => h !== href) : [href, ...cur]);
  }, []);
  return { favorites, isFavorite, toggleFavorite };
}

export function useRecentlyUsed(): string[] {
  const raw = useSyncExternalStore(subscribe, recentSnapshot, serverSnapshot);
  return useMemo(() => parseList(raw), [raw]);
}

/** Record a tool visit. Safe to call from an effect; no-ops if href is already most recent. */
export function pushRecent(href: string) {
  const cur = readList(RECENT_KEY);
  if (cur[0] === href) return;
  writeList(RECENT_KEY, [href, ...cur.filter((h) => h !== href)].slice(0, RECENT_MAX));
}
