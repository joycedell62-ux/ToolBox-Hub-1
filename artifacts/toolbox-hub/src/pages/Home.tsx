import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Search, X, ChevronRight, ArrowRight, Star,
  Flame, Clock, LayoutGrid, Command, Copy, Check,
  ChevronUp, Link as LinkIcon,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { TOOLS, getToolByHref } from '../lib/tools';
import type { Tool, Category } from '../lib/tools';
import { useFavorites, useRecentlyUsed } from '../lib/toolPrefs';

/* ─── Category gradient map ──────────────────────────────────────────────── */
const CAT_COLOR: Record<Category, string> = {
  'PDF Tools':          'from-red-400    to-orange-500',
  'Image Tools':        'from-violet-400 to-purple-600',
  'Developer Tools':    'from-slate-500  to-slate-800',
  'Calculators':        'from-green-400  to-emerald-600',
  'Text Tools':         'from-blue-400   to-blue-700',
  'Utility Tools':      'from-indigo-400 to-indigo-700',
  'Daily Life':         'from-teal-400   to-teal-600',
  'Writing Generators': 'from-pink-400   to-rose-600',
  'Fun & Lifestyle':    'from-amber-400  to-orange-600',
  'Branding & Design':  'from-fuchsia-400 to-pink-600',
  'Marketing Tools':    'from-cyan-400   to-sky-600',
};

const CAT_SHORT: Record<Category, string> = {
  'PDF Tools': 'PDF', 'Image Tools': 'Images', 'Developer Tools': 'Dev',
  'Calculators': 'Finance', 'Text Tools': 'Text', 'Utility Tools': 'Utility',
  'Daily Life': 'Daily', 'Writing Generators': 'Writing',
  'Fun & Lifestyle': 'Fun', 'Branding & Design': 'Design', 'Marketing Tools': 'Business',
};

/* ─── Category chips ─────────────────────────────────────────────────────── */
const CHIPS: { label: string; emoji: string; cat: Category; chip: string }[] = [
  { label: 'PDF',        emoji: '📄', cat: 'PDF Tools',          chip: 'bg-red-50    text-red-700    border-red-200    hover:bg-red-100'         },
  { label: 'Images',     emoji: '🖼️', cat: 'Image Tools',         chip: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'     },
  { label: 'Developer',  emoji: '💻', cat: 'Developer Tools',     chip: 'bg-slate-50  text-slate-700  border-slate-200  hover:bg-slate-100'       },
  { label: 'Writing',    emoji: '✍️', cat: 'Writing Generators',  chip: 'bg-pink-50   text-pink-700   border-pink-200   hover:bg-pink-100'         },
  { label: 'Finance',    emoji: '💰', cat: 'Calculators',         chip: 'bg-green-50  text-green-700  border-green-200  hover:bg-green-100'       },
  { label: 'Design',     emoji: '🎨', cat: 'Branding & Design',   chip: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100'  },
  { label: 'Business',   emoji: '💼', cat: 'Marketing Tools',     chip: 'bg-cyan-50   text-cyan-700   border-cyan-200   hover:bg-cyan-100'         },
  { label: 'Security',   emoji: '🛡️', cat: 'Utility Tools',       chip: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'     },
  { label: 'Daily Life', emoji: '🌟', cat: 'Daily Life',          chip: 'bg-teal-50   text-teal-700   border-teal-200   hover:bg-teal-100'         },
  { label: 'Fun',        emoji: '🎉', cat: 'Fun & Lifestyle',     chip: 'bg-amber-50  text-amber-700  border-amber-200  hover:bg-amber-100'       },
];

const POPULAR_HREFS = [
  '/qr-code-generator', '/resume-builder', '/certificate-generator', '/logo-generator',
  '/password-generator', '/pdf-merge', '/image-compressor', '/invoice-generator',
];

const RECENT_HREFS = [
  '/resume-builder', '/logo-generator', '/invoice-generator',
  '/business-name-generator', '/birthday-reminder', '/daily-fortune',
];

const SUGGEST_TERMS = ['PDF', 'resume', 'password', 'QR code', 'invoice', 'logo', 'image', 'calculator'];

const POP = TOOLS.filter(t => t.popular);
const TOD = POP[Math.floor(Date.now() / 86_400_000) % POP.length];

/* ─── Toast ──────────────────────────────────────────────────────────────── */
function Toast({ msg }: { msg: string }) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] pointer-events-none">
      <div className="flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        {msg}
      </div>
    </div>
  );
}

/* ─── Tool card ──────────────────────────────────────────────────────────── */
function ToolCard({ tool, onToast }: { tool: Tool; onToast?: (msg: string) => void }) {
  const grad = CAT_COLOR[tool.category] ?? 'from-blue-400 to-blue-700';
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(tool.href);
  const [copied, setCopied] = useState(false);

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const wasOff = !fav;
    toggleFavorite(tool.href);
    onToast?.(wasOff ? '⭐ Added to favourites' : 'Removed from favourites');
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const url = window.location.origin + tool.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      onToast?.('🔗 Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1.5 hover:border-slate-200 transition-all duration-300 flex flex-col overflow-hidden">
      <Link href={tool.href} className="absolute inset-0 z-[1] rounded-2xl" aria-label={`Open ${tool.title}`} />

      {/* Favourite */}
      <button
        aria-label={fav ? 'Unfavourite' : 'Favourite'}
        onClick={handleFav}
        className={`absolute top-3 right-3 z-[2] p-1.5 rounded-lg transition-all duration-200 ${fav ? 'text-amber-400 opacity-100' : 'text-slate-200 hover:text-amber-300 opacity-0 group-hover:opacity-100'}`}
      >
        <Star className={`w-4 h-4 ${fav ? 'fill-amber-400' : ''}`} />
      </button>

      {/* Copy link — appears on hover next to star */}
      <button
        aria-label="Copy link"
        onClick={handleCopy}
        className={`absolute top-3 right-10 z-[2] p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${copied ? 'text-emerald-500' : 'text-slate-300 hover:text-blue-500'}`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          <tool.icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1 group-hover:text-blue-700 transition-colors">{tool.title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{tool.description}</p>
        </div>
        <div className="flex items-center gap-1 text-blue-500 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          Open <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

/* ─── Section heading ────────────────────────────────────────────────────── */
function SectionHead({ icon, label, sub, badge, action, onAction }: {
  icon: React.ReactNode; label: string; sub?: string;
  badge?: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="flex items-end justify-between mb-5 gap-3 flex-wrap">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{icon}</span>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{label}</h2>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {sub && <p className="text-xs text-slate-400 mt-0.5 ml-7">{sub}</p>}
      </div>
      {action && onAction && (
        <button onClick={onAction}
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
          {action} <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function Home() {
  const [query,        setQuery]        = useState('');
  const [activeCat,    setActiveCat]    = useState<Category | null>(null);
  const [showAll,      setShowAll]      = useState(false);
  const [browseAll,    setBrowseAll]    = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toast,        setToast]        = useState<string | null>(null);
  const [scrolled,     setScrolled]     = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('tbh_recent_searches') || '[]'); } catch { return []; }
  });

  const [, navigate]  = useLocation();
  const searchRef     = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const toastTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { favorites } = useFavorites();
  const recentHrefs   = useRecentlyUsed();
  const favTools      = useMemo(() => favorites.map(getToolByHref).filter(Boolean) as Tool[], [favorites]);
  const recentTools   = useMemo(() => recentHrefs.map(getToolByHref).filter(Boolean) as Tool[], [recentHrefs]);
  const popularTools  = useMemo(() => POPULAR_HREFS.map(h => getToolByHref(h)).filter(Boolean) as Tool[], []);

  const isSearching = query.trim().length > 0;

  const dropdownResults = useMemo(() =>
    isSearching ? TOOLS.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase()) ||
      t.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 7) : [],
  [query, isSearching]);

  const searchResults = useMemo(() =>
    isSearching ? TOOLS.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase()) ||
      t.category.toLowerCase().includes(query.toLowerCase())
    ) : [],
  [query, isSearching]);

  const newTools = useMemo(() => {
    const spec   = RECENT_HREFS.map(h => getToolByHref(h)).filter(Boolean) as Tool[];
    const extras = TOOLS.filter(t => t.isNew && !RECENT_HREFS.includes(t.href));
    const merged = [...spec, ...extras.filter(t => !spec.find(x => x.href === t.href))];
    return showAll ? merged : merged.slice(0, 6);
  }, [showAll]);

  const catTools = useMemo(() =>
    activeCat ? TOOLS.filter(t => t.category === activeCat) : [], [activeCat]);

  const allToolsSorted = useMemo(() =>
    [...TOOLS].sort((a, b) => a.title.localeCompare(b.title)), []);

  /* ── Toast ─────────────────────────────────────────────────────────────── */
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  /* ── Recent searches ────────────────────────────────────────────────────── */
  const saveSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    setRecentSearches(prev => {
      const next = [q.trim(), ...prev.filter(s => s !== q.trim())].slice(0, 6);
      try { localStorage.setItem('tbh_recent_searches', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  /* ── Scroll watcher (back-to-top) ───────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Keyboard shortcuts: / and Cmd+K ───────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA';
      if (e.key === '/' && !inInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchRef.current?.focus();
        setDropdownOpen(true);
      }
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchRef.current?.focus();
        setDropdownOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* ── Click outside → close dropdown ────────────────────────────────────── */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  /* ── Helpers ────────────────────────────────────────────────────────────── */
  const surpriseMe = () => navigate(TOOLS[Math.floor(Math.random() * TOOLS.length)].href);

  const scrollTo = (id: string) =>
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);

  const pickCat = (cat: Category) => {
    setActiveCat(cat); setQuery(''); setDropdownOpen(false); scrollTo('cat-results');
  };

  const clearSearch = () => {
    setQuery(''); setDropdownOpen(false); searchRef.current?.focus();
  };

  const commitSearch = (q: string) => {
    saveSearch(q);
    setDropdownOpen(false);
  };

  const applyTerm = (term: string) => {
    setQuery(term);
    setActiveCat(null);
    setDropdownOpen(true);
    searchRef.current?.focus();
  };

  const showDropdown = dropdownOpen;
  const showEmptyDropdown = showDropdown && !isSearching && (recentSearches.length > 0 || true);
  const showResultsDropdown = showDropdown && isSearching;

  return (
    <>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .2s ease both}
      `}</style>

      {/* ── Toast notification ─────────────────────────────────────────────── */}
      {toast && <Toast msg={toast} />}

      {/* ── Back to top ────────────────────────────────────────────────────── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className={`fixed bottom-24 left-4 z-50 bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-200 shadow-lg hover:shadow-xl rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 ${
          scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      <div className="flex flex-col -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 md:-mt-12">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section
          className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-10 md:pt-16 md:pb-12 text-center overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#dbeafe 0%,#eff6ff 35%,#ffffff 65%)' }}
        >
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-12 -right-24 w-64 h-64 bg-indigo-200/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 border border-blue-100 shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold text-blue-700 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              116+ free tools · No account needed
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-2">
              Your free toolkit<br />
              <span className="text-blue-600">for everything.</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base mb-8 max-w-xs mx-auto leading-relaxed">
              Writing, PDF, design, code & more — runs in your browser, free forever.
            </p>

            {/* ── Search + Dropdown ──────────────────────────────────────── */}
            <div ref={searchWrapRef} className="relative mb-4 text-left">
              {/* Search bar */}
              <div className={`flex items-center bg-white shadow-[0_4px_32px_rgba(37,99,235,0.12)] transition-all duration-300 ${
                showDropdown
                  ? 'rounded-t-2xl border border-b-slate-100 border-blue-400 shadow-[0_4px_40px_rgba(37,99,235,0.20)]'
                  : 'rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:shadow-[0_4px_40px_rgba(37,99,235,0.20)]'
              }`}>
                <Search className="ml-5 flex-shrink-0 w-5 h-5 text-slate-400" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onFocus={() => setDropdownOpen(true)}
                  onChange={e => {
                    setQuery(e.target.value);
                    setActiveCat(null);
                    setDropdownOpen(true);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Escape') clearSearch();
                    if (e.key === 'Enter') {
                      if (dropdownResults.length > 0) {
                        saveSearch(query);
                        navigate(dropdownResults[0].href);
                        clearSearch();
                      } else if (isSearching) {
                        commitSearch(query);
                      }
                    }
                  }}
                  placeholder="Search 116+ tools…"
                  aria-label="Search tools"
                  className="flex-1 px-4 py-4 text-sm md:text-base bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
                />
                {query ? (
                  <button onClick={clearSearch}
                    className="mr-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Clear">
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="mr-3 hidden sm:flex items-center gap-1 text-slate-300 text-[11px] font-mono select-none">
                    <kbd className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">/</kbd>
                    <span className="text-slate-300">or</span>
                    <kbd className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">⌘K</kbd>
                  </div>
                )}
              </div>

              {/* ── Dropdown: empty state ──────────────────────────────────── */}
              {showEmptyDropdown && (
                <div className="absolute left-0 right-0 top-full bg-white border border-blue-400 border-t-slate-100 rounded-b-2xl shadow-2xl shadow-blue-100/40 z-50 overflow-hidden fade-up">

                  {/* Recent searches */}
                  {recentSearches.length > 0 && (
                    <div className="px-3 pt-3 pb-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Recent</p>
                        <button
                          onMouseDown={e => { e.preventDefault(); setRecentSearches([]); localStorage.removeItem('tbh_recent_searches'); }}
                          className="text-[10px] text-slate-400 hover:text-slate-600 px-1">
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pb-2">
                        {recentSearches.map(s => (
                          <button key={s}
                            onMouseDown={e => { e.preventDefault(); applyTerm(s); }}
                            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-xl transition-colors">
                            <Clock className="w-3 h-3 text-slate-400" /> {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular searches */}
                  <div className="px-3 pt-2 pb-2 border-t border-slate-50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">Try searching</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGEST_TERMS.map(t => (
                        <button key={t}
                          onMouseDown={e => { e.preventDefault(); applyTerm(t); }}
                          className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-xl transition-colors">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick-access popular tools */}
                  <div className="border-t border-slate-50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4 pt-3 pb-1">Popular right now</p>
                    {popularTools.slice(0, 4).map((t, i) => {
                      const grad = CAT_COLOR[t.category] ?? 'from-blue-400 to-blue-700';
                      return (
                        <button key={t.href}
                          onMouseDown={e => { e.preventDefault(); navigate(t.href); setDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left ${i > 0 ? 'border-t border-slate-50' : ''}`}>
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <t.icon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <p className="text-sm font-medium text-slate-700">{t.title}</p>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Dropdown: search results ───────────────────────────────── */}
              {showResultsDropdown && (
                <div className="absolute left-0 right-0 top-full bg-white border border-blue-400 border-t-slate-100 rounded-b-2xl shadow-2xl shadow-blue-100/40 z-50 overflow-hidden fade-up">
                  {dropdownResults.length === 0 ? (
                    <div className="px-5 py-4 text-sm text-slate-400 text-center">
                      No tools matched "<span className="text-slate-600">{query}</span>"
                    </div>
                  ) : (
                    <>
                      <ul>
                        {dropdownResults.map((t, i) => {
                          const grad = CAT_COLOR[t.category] ?? 'from-blue-400 to-blue-700';
                          return (
                            <li key={t.href}>
                              <button
                                onMouseDown={e => { e.preventDefault(); saveSearch(query); navigate(t.href); clearSearch(); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left ${i > 0 ? 'border-t border-slate-50' : ''}`}>
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                  <t.icon className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 truncate">{t.title}</p>
                                  <p className="text-xs text-slate-400 truncate">{t.description}</p>
                                </div>
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                                  {CAT_SHORT[t.category]}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      {searchResults.length > 7 && (
                        <button
                          onMouseDown={e => { e.preventDefault(); commitSearch(query); }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/60 hover:bg-blue-50 border-t border-slate-100 transition-colors">
                          See all {searchResults.length} results for "{query}" <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Quick pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: '🔥 Popular',     fn: () => scrollTo('sec-popular') },
                { label: '🆕 New Tools',   fn: () => scrollTo('sec-new') },
                { label: '📋 All Tools',   fn: () => { setBrowseAll(true); scrollTo('sec-browse'); } },
                { label: '🎲 Surprise Me', fn: surpriseMe },
              ].map(q => (
                <button key={q.label} onClick={q.fn}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-700 bg-white/70 hover:bg-white border border-slate-200 hover:border-blue-200 rounded-xl shadow-sm hover:shadow transition-all">
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category chips */}
          <div className="mt-7 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="flex gap-2 w-max mx-auto pb-1">
                {CHIPS.map(c => {
                  const count = TOOLS.filter(t => t.category === c.cat).length;
                  return (
                    <button key={c.label}
                      onClick={() => activeCat === c.cat ? setActiveCat(null) : pickCat(c.cat)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:scale-105 hover:shadow-sm select-none ${
                        activeCat === c.cat ? 'bg-blue-600 text-white border-blue-600 shadow-md' : c.chip
                      }`}>
                      <span className="text-base leading-none">{c.emoji}</span>
                      {c.label}
                      <span className={`text-[10px] font-bold ml-0.5 ${activeCat === c.cat ? 'text-blue-200' : 'text-current opacity-50'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* ── FULL SEARCH RESULTS ──────────────────────────────────────────── */}
        {isSearching && !dropdownOpen && (
          <section className="px-4 sm:px-6 lg:px-8 py-8 bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <p className="font-bold text-slate-900 text-sm flex-1">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for{' '}
                  <span className="text-blue-600">"{query}"</span>
                </p>
                <button onClick={clearSearch}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-colors">
                  <X className="w-3 h-3" /> Clear
                </button>
              </div>
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="font-semibold text-slate-700 text-sm">No tools matched "{query}"</p>
                  <p className="text-xs text-slate-400 mt-1">Try "PDF", "password", or "resume".</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {searchResults.map(t => <ToolCard key={t.href} tool={t} onToast={showToast} />)}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── CATEGORY FILTER ──────────────────────────────────────────────── */}
        {!isSearching && activeCat && (
          <section id="cat-results" className="px-4 sm:px-6 lg:px-8 py-8 bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <p className="font-bold text-slate-900 text-sm flex-1">
                  {activeCat} <span className="text-slate-400 font-normal">({catTools.length} tools)</span>
                </p>
                <button onClick={() => setActiveCat(null)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-colors">
                  <X className="w-3 h-3" /> Clear
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {catTools.map(t => <ToolCard key={t.href} tool={t} onToast={showToast} />)}
              </div>
            </div>
          </section>
        )}

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        {!isSearching && !activeCat && (
          <div className="bg-white">

            {/* Favourites + Recently Used */}
            {(favTools.length > 0 || recentTools.length > 0) && (
              <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-4">
                <div className="max-w-6xl mx-auto space-y-6">
                  {favTools.length > 0 && (
                    <div>
                      <SectionHead icon="⭐" label="Favourites" sub={`${favTools.length} saved tool${favTools.length !== 1 ? 's' : ''}`} />
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {favTools.map(t => <ToolCard key={t.href} tool={t} onToast={showToast} />)}
                      </div>
                    </div>
                  )}
                  {recentTools.length > 0 && (
                    <div>
                      <SectionHead icon={<Clock className="w-4 h-4 text-slate-400" />} label="Recently Used" />
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {recentTools.slice(0, 5).map(t => <ToolCard key={t.href} tool={t} onToast={showToast} />)}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Popular */}
            <section id="sec-popular" className="px-4 sm:px-6 lg:px-8 py-8">
              <div className="max-w-6xl mx-auto">
                <SectionHead
                  icon={<Flame className="w-4 h-4 text-orange-500" />}
                  label="Most Popular"
                  badge="Trending"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {popularTools.map(t => <ToolCard key={t.href} tool={t} onToast={showToast} />)}
                </div>
              </div>
            </section>

            <div className="h-px mx-4 sm:mx-6 lg:mx-8 bg-slate-100" />

            {/* Tool of the Day */}
            {TOD && (
              <section className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-6xl mx-auto">
                  <SectionHead icon="⭐" label="Tool of the Day" sub="A new pick every morning." />
                  <div className="rounded-2xl border border-blue-100 shadow-md overflow-hidden grid md:grid-cols-5">
                    <div className="md:col-span-3 p-6 md:p-8 bg-white flex flex-col justify-center">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CAT_COLOR[TOD.category] ?? 'from-blue-500 to-indigo-600'} flex items-center justify-center mb-4 shadow-sm`}>
                        <TOD.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 mb-1">{TOD.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-xs">{TOD.description}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Link href={TOD.href}
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all hover:scale-[1.02] shadow-sm text-sm">
                          Try it free <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + TOD.href);
                            showToast('🔗 Link copied to clipboard');
                          }}
                          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-700 border border-slate-200 hover:border-blue-200 px-4 py-2.5 rounded-xl text-sm transition-colors">
                          <LinkIcon className="w-3.5 h-3.5" /> Share
                        </button>
                      </div>
                    </div>
                    <div className="hidden md:flex md:col-span-2 items-center justify-center p-8 overflow-hidden"
                      style={{ backgroundImage: 'linear-gradient(135deg,#2563eb 0%,#4f46e5 100%)' }}>
                      <div className="w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center shadow-xl ring-1 ring-white/20">
                        <TOD.icon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <div className="h-px mx-4 sm:mx-6 lg:mx-8 bg-slate-100" />

            {/* New This Week */}
            <section id="sec-new" className="px-4 sm:px-6 lg:px-8 py-8">
              <div className="max-w-6xl mx-auto">
                <SectionHead
                  icon="🆕"
                  label="New This Week"
                  badge="New"
                  action={showAll ? undefined : 'See all'}
                  onAction={() => setShowAll(true)}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {newTools.map(t => (
                    <div key={t.href} className="relative">
                      <ToolCard tool={t} onToast={showToast} />
                      {t.isNew && (
                        <span className="absolute top-3 left-3 z-[3] text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full pointer-events-none">
                          New
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="h-px mx-4 sm:mx-6 lg:mx-8 bg-slate-100" />

            {/* Browse all tools A–Z */}
            <section id="sec-browse" className="px-4 sm:px-6 lg:px-8 py-8">
              <div className="max-w-6xl mx-auto">
                {!browseAll ? (
                  <button
                    onClick={() => setBrowseAll(true)}
                    className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-slate-500 hover:text-blue-700 transition-all group">
                    <LayoutGrid className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-sm">Browse all {TOOLS.length} tools A–Z</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <SectionHead
                      icon={<LayoutGrid className="w-4 h-4 text-slate-500" />}
                      label={`All ${TOOLS.length} Tools`}
                      sub="Every tool, sorted A–Z."
                      action="Collapse"
                      onAction={() => setBrowseAll(false)}
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {allToolsSorted.map(t => <ToolCard key={t.href} tool={t} onToast={showToast} />)}
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ── Keyboard hint strip ────────────────────────────────────────── */}
        {!isSearching && !activeCat && (
          <div className="px-4 sm:px-6 lg:px-8 py-3 bg-slate-50 border-t border-slate-100">
            <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-2 flex-wrap">
              <Command className="w-3 h-3" />
              Press
              <kbd className="inline-flex items-center bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-600 shadow-sm">/</kbd>
              or
              <kbd className="inline-flex items-center bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-600 shadow-sm">⌘K</kbd>
              to search ·
              <kbd className="inline-flex items-center bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-600 shadow-sm">Esc</kbd>
              to clear ·
              <kbd className="inline-flex items-center bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-600 shadow-sm">↵</kbd>
              to open top result
            </p>
          </div>
        )}
      </div>
    </>
  );
}
