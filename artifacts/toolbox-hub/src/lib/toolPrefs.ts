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

// ── Achievement tracking ──────────────────────────────────────────────────────
const UNIQUE_KEY     = 'tbh_unique_visited';
const ACHIEVED_KEY   = 'tbh_achievements_done';
const MILESTONES     = [5, 10, 25, 50] as const;

export const ACHIEVEMENT_LABELS: Record<number, { emoji: string; title: string; sub: string }> = {
  5:  { emoji: '🏅', title: 'Explorer Badge',        sub: 'You\'ve tried 5 different tools!' },
  10: { emoji: '🥈', title: 'Power User Badge',      sub: '10 tools explored — you\'re on a roll!' },
  25: { emoji: '🥇', title: 'Productivity Pro Badge', sub: '25 tools! You\'re a Toolbox Pro.' },
  50: { emoji: '🏆', title: 'Toolbox Master Badge',  sub: 'Incredible — 50 tools explored!' },
};

/**
 * Call when a tool page is visited.
 * Returns the milestone number just reached (5 / 10 / 25 / 50), or null.
 */
export function checkAchievement(href: string): number | null {
  try {
    const raw     = localStorage.getItem(UNIQUE_KEY) || '[]';
    const visited = JSON.parse(raw) as string[];
    if (visited.includes(href)) return null;                    // already counted

    const updated = [...visited, href];
    localStorage.setItem(UNIQUE_KEY, JSON.stringify(updated));

    const count = updated.length;
    const done  = JSON.parse(localStorage.getItem(ACHIEVED_KEY) || '[]') as number[];
    const hit   = MILESTONES.find(m => m === count && !done.includes(m));
    if (hit !== undefined) {
      localStorage.setItem(ACHIEVED_KEY, JSON.stringify([...done, hit]));
      return hit;
    }
  } catch {}
  return null;
}
