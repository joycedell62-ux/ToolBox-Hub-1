import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Search, X, ArrowRight } from 'lucide-react';
import { TOOLS } from '../lib/tools';
import type { Tool } from '../lib/tools';

const PREVIEW_LIMIT = 8;

/**
 * Score a tool against a query.
 * Higher = better match. Returns 0 if no match.
 *   4 — title starts with query
 *   3 — title contains query
 *   2 — tag contains query
 *   1 — description or category contains query
 */
function score(tool: Tool, q: string): number {
  const title = tool.title.toLowerCase();
  const desc  = tool.description.toLowerCase();
  const cat   = tool.category.toLowerCase();
  const tags  = (tool.tags ?? []).map(t => t.toLowerCase());

  if (title.startsWith(q))                          return 4;
  if (title.includes(q))                            return 3;
  if (tags.some(t => t.includes(q)))                return 2;
  if (desc.includes(q) || cat.includes(q))          return 1;
  return 0;
}

/** Header search with autocomplete — lives on every page. */
export default function GlobalSearch() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, total } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { results: [] as Tool[], total: 0 };

    const scored = TOOLS
      .map(t => ({ tool: t, s: score(t, q) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s || a.tool.title.localeCompare(b.tool.title));

    return {
      results: scored.slice(0, PREVIEW_LIMIT).map(x => x.tool),
      total: scored.length,
    };
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const go = (href: string) => {
    setQuery('');
    setOpen(false);
    navigate(href);
  };

  const goAll = () => {
    const q = query.trim();
    setOpen(false);
    navigate(`/?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) {
      if (e.key === 'Escape') { setQuery(''); inputRef.current?.blur(); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + results.length) % results.length); }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[active].href); }
    else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  };

  const hasMore = total > PREVIEW_LIMIT;

  return (
    <div ref={wrapRef} className="relative flex-1 max-w-[11rem] min-[400px]:max-w-[13rem] sm:max-w-xs md:max-w-sm">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-label="Search tools"
          placeholder="Search tools…"
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full h-9 pl-8 pr-7 rounded-lg bg-white/15 border border-white/20 text-sm text-white placeholder:text-blue-200
            focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60
            transition-colors"
        />
        {query && (
          <button
            aria-label="Clear search"
            onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute top-full mt-2 left-0 right-0 sm:right-auto sm:w-80 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden z-50">
          {results.length > 0 ? (
            <>
              <ul role="listbox">
                {results.map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <li key={t.href} role="option" aria-selected={i === active}>
                      <button
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(t.href)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          i === active ? 'bg-blue-50' : 'bg-white'
                        }`}
                      >
                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-900 truncate">{t.title}</span>
                          <span className="block text-xs text-gray-400 truncate">{t.category}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* "See all N results" footer */}
              {hasMore && (
                <button
                  onClick={goAll}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-50 hover:bg-blue-100 transition-colors border-t border-blue-100"
                >
                  <span className="text-xs font-semibold text-blue-700">
                    See all {total} results for &ldquo;{query.trim()}&rdquo;
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                </button>
              )}
            </>
          ) : (
            <p className="px-4 py-3 text-sm text-gray-500">No tools match &ldquo;{query.trim()}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  );
}
