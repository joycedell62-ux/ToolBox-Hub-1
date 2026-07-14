import React, { useState, useMemo, useRef } from 'react';
import { Search, X, ChevronRight, ArrowRight, Star, Flame, Clock } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { TOOLS, getToolByHref } from '../lib/tools';
import type { Tool, Category } from '../lib/tools';
import { useFavorites, useRecentlyUsed } from '../lib/toolPrefs';

/* ─── Per-category icon gradient ─────────────────────────────────────────── */
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

/* ─── Category chips ─────────────────────────────────────────────────────── */
const CHIPS: { label: string; emoji: string; cat: Category; chip: string }[] = [
  { label: 'PDF',        emoji: '📄', cat: 'PDF Tools',          chip: 'bg-red-50    text-red-700    border-red-200    hover:bg-red-100'        },
  { label: 'Images',     emoji: '🖼️', cat: 'Image Tools',         chip: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'    },
  { label: 'Developer',  emoji: '💻', cat: 'Developer Tools',     chip: 'bg-slate-50  text-slate-700  border-slate-200  hover:bg-slate-100'      },
  { label: 'Writing',    emoji: '✍️', cat: 'Writing Generators',  chip: 'bg-pink-50   text-pink-700   border-pink-200   hover:bg-pink-100'        },
  { label: 'Finance',    emoji: '💰', cat: 'Calculators',         chip: 'bg-green-50  text-green-700  border-green-200  hover:bg-green-100'      },
  { label: 'Design',     emoji: '🎨', cat: 'Branding & Design',   chip: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100' },
  { label: 'Business',   emoji: '💼', cat: 'Marketing Tools',     chip: 'bg-cyan-50   text-cyan-700   border-cyan-200   hover:bg-cyan-100'        },
  { label: 'Security',   emoji: '🛡️', cat: 'Utility Tools',       chip: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'    },
  { label: 'Daily Life', emoji: '🌟', cat: 'Daily Life',          chip: 'bg-teal-50   text-teal-700   border-teal-200   hover:bg-teal-100'        },
  { label: 'Fun',        emoji: '🎉', cat: 'Fun & Lifestyle',     chip: 'bg-amber-50  text-amber-700  border-amber-200  hover:bg-amber-100'      },
];

/* ─── Popular & new tool hrefs ───────────────────────────────────────────── */
const POPULAR_HREFS = [
  '/qr-code-generator', '/resume-builder', '/certificate-generator', '/logo-generator',
  '/password-generator', '/pdf-merge', '/image-compressor', '/invoice-generator',
];

const RECENT_HREFS = [
  '/resume-builder', '/logo-generator', '/invoice-generator',
  '/business-name-generator', '/birthday-reminder', '/daily-fortune',
];

/* ─── Tool of the Day (daily seed) ──────────────────────────────────────── */
const POP = TOOLS.filter(t => t.popular);
const TOD = POP[Math.floor(Date.now() / 86_400_000) % POP.length];

/* ─── Tool card ──────────────────────────────────────────────────────────── */
function ToolCard({ tool }: { tool: Tool }) {
  const grad = CAT_COLOR[tool.category] ?? 'from-blue-400 to-blue-700';
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(tool.href);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1.5 hover:border-slate-200 transition-all duration-300 flex flex-col overflow-hidden">
      <Link href={tool.href} className="absolute inset-0 z-[1] rounded-2xl" aria-label={`Open ${tool.title}`} />
      <button
        aria-label={fav ? 'Unfavourite' : 'Favourite'}
        onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(tool.href); }}
        className={`absolute top-3 right-3 z-[2] p-1.5 rounded-lg transition-colors ${fav ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
      >
        <Star className={`w-4 h-4 ${fav ? 'fill-amber-400' : ''}`} />
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
  const [query,     setQuery]     = useState('');
  const [activeCat, setActiveCat] = useState<Category | null>(null);
  const [showAll,   setShowAll]   = useState(false);
  const [, navigate] = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);

  const { favorites } = useFavorites();
  const recentHrefs   = useRecentlyUsed();
  const favTools      = useMemo(() => favorites.map(getToolByHref).filter(Boolean) as Tool[], [favorites]);
  const recentTools   = useMemo(() => recentHrefs.map(getToolByHref).filter(Boolean) as Tool[], [recentHrefs]);

  const isSearching = query.trim().length > 0;

  const searchResults = useMemo(() =>
    isSearching ? TOOLS.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase()) ||
      t.category.toLowerCase().includes(query.toLowerCase())
    ) : [], [query]);

  const popularTools = useMemo(
    () => POPULAR_HREFS.map(h => getToolByHref(h)).filter(Boolean) as Tool[], []);

  const newTools = useMemo(() => {
    const spec    = RECENT_HREFS.map(h => getToolByHref(h)).filter(Boolean) as Tool[];
    const extras  = TOOLS.filter(t => t.isNew && !RECENT_HREFS.includes(t.href));
    const merged  = [...spec, ...extras.filter(t => !spec.find(x => x.href === t.href))];
    return showAll ? merged : merged.slice(0, 6);
  }, [showAll]);

  const catTools = useMemo(() =>
    activeCat ? TOOLS.filter(t => t.category === activeCat) : [], [activeCat]);

  const surpriseMe = () => navigate(TOOLS[Math.floor(Math.random() * TOOLS.length)].href);

  const scrollTo = (id: string) =>
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);

  const pickCat = (cat: Category) => { setActiveCat(cat); setQuery(''); scrollTo('cat-results'); };

  return (
    <>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <div className="flex flex-col -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 md:-mt-12">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
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

            {/* Search bar */}
            <div className="relative group mb-4">
              <div className="flex items-center bg-white rounded-2xl border border-slate-200 shadow-[0_4px_32px_rgba(37,99,235,0.12)] group-focus-within:border-blue-400 group-focus-within:shadow-[0_4px_40px_rgba(37,99,235,0.20)] transition-all duration-300">
                <Search className="ml-5 flex-shrink-0 w-5 h-5 text-slate-400" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setActiveCat(null); }}
                  onKeyDown={e => e.key === 'Escape' && setQuery('')}
                  placeholder="Search 116+ tools — try 'PDF', 'password', 'resume'…"
                  aria-label="Search tools"
                  className="flex-1 px-4 py-4 text-sm md:text-base bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
                />
                {query ? (
                  <button onClick={() => { setQuery(''); searchRef.current?.focus(); }}
                    className="mr-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Clear">
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="mr-3 bg-blue-600 text-white text-sm font-bold px-5 py-2 rounded-xl hidden sm:block select-none">
                    Search
                  </span>
                )}
              </div>
            </div>

            {/* Quick pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: '🔥 Popular',    fn: () => scrollTo('sec-popular') },
                { label: '🆕 New Tools',  fn: () => scrollTo('sec-new') },
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
                {CHIPS.map(c => (
                  <button key={c.label}
                    onClick={() => activeCat === c.cat ? setActiveCat(null) : pickCat(c.cat)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:scale-105 hover:shadow-sm select-none ${
                      activeCat === c.cat ? 'bg-blue-600 text-white border-blue-600 shadow-md' : c.chip
                    }`}>
                    <span className="text-base leading-none">{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* ── SEARCH RESULTS ────────────────────────────────────────────────── */}
        {isSearching && (
          <section className="px-4 sm:px-6 lg:px-8 py-8 bg-white">
            <div className="max-w-6xl mx-auto">
              <p className="font-bold text-slate-900 text-sm mb-4">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for{' '}
                <span className="text-blue-600">"{query}"</span>
              </p>
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="font-semibold text-slate-700 text-sm">No tools matched "{query}"</p>
                  <p className="text-xs text-slate-400 mt-1">Try "PDF", "password", or "resume".</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {searchResults.map(t => <ToolCard key={t.href} tool={t} />)}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── CATEGORY FILTER ───────────────────────────────────────────────── */}
        {!isSearching && activeCat && (
          <section id="cat-results" className="px-4 sm:px-6 lg:px-8 py-8 bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <p className="font-bold text-slate-900 text-sm flex-1">
                  {activeCat}{' '}
                  <span className="text-slate-400 font-normal">({catTools.length} tools)</span>
                </p>
                <button onClick={() => setActiveCat(null)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-colors">
                  <X className="w-3 h-3" /> Clear
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {catTools.map(t => <ToolCard key={t.href} tool={t} />)}
              </div>
            </div>
          </section>
        )}

        {/* ── MAIN ──────────────────────────────────────────────────────────── */}
        {!isSearching && !activeCat && (
          <div className="bg-white">

            {/* Favourites + Recently Used (personal, only when data exists) */}
            {(favTools.length > 0 || recentTools.length > 0) && (
              <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-4">
                <div className="max-w-6xl mx-auto space-y-6">
                  {favTools.length > 0 && (
                    <div>
                      <SectionHead icon="⭐" label="Favourites" />
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {favTools.map(t => <ToolCard key={t.href} tool={t} />)}
                      </div>
                    </div>
                  )}
                  {recentTools.length > 0 && (
                    <div>
                      <SectionHead icon={<Clock className="w-4 h-4 text-slate-400" />} label="Recently Used" />
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {recentTools.slice(0, 5).map(t => <ToolCard key={t.href} tool={t} />)}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Popular Tools */}
            <section id="sec-popular" className="px-4 sm:px-6 lg:px-8 py-8">
              <div className="max-w-6xl mx-auto">
                <SectionHead
                  icon={<Flame className="w-4 h-4 text-orange-500" />}
                  label="Most Popular"
                  badge="Trending"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {popularTools.map(t => <ToolCard key={t.href} tool={t} />)}
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
                      <Link href={TOD.href}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all hover:scale-[1.02] shadow-sm text-sm w-fit">
                        Try it free <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                    <div className="hidden md:flex md:col-span-2 items-center justify-center p-8 relative overflow-hidden"
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
                      <ToolCard tool={t} />
                      {t.isNew && (
                        <span className="absolute top-3 left-3 z-[3] text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>
        )}
      </div>
    </>
  );
}
