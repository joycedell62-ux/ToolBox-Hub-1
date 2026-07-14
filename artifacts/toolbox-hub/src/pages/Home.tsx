import React, { useState, useMemo, useRef } from 'react';
import {
  Search, X, ChevronRight, ArrowRight,
  Zap, Lock, Smartphone, Gift,
  Star, Flame, Clock, Sparkles,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { TOOLS, getToolByHref } from '../lib/tools';
import type { Tool, Category } from '../lib/tools';
import { useFavorites, useRecentlyUsed } from '../lib/toolPrefs';

// ─── Per-category gradient for icon boxes ────────────────────────────────────
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

// ─── Category chips ───────────────────────────────────────────────────────────
const CHIPS: { label: string; emoji: string; cat: Category; chip: string }[] = [
  { label: 'PDF',        emoji: '📄', cat: 'PDF Tools',          chip: 'bg-red-50    text-red-700    border-red-200    hover:bg-red-100'    },
  { label: 'Images',     emoji: '🖼️', cat: 'Image Tools',         chip: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100' },
  { label: 'Developer',  emoji: '💻', cat: 'Developer Tools',     chip: 'bg-slate-50  text-slate-700  border-slate-200  hover:bg-slate-100'  },
  { label: 'Writing',    emoji: '✍️', cat: 'Writing Generators',  chip: 'bg-pink-50   text-pink-700   border-pink-200   hover:bg-pink-100'   },
  { label: 'Finance',    emoji: '💰', cat: 'Calculators',         chip: 'bg-green-50  text-green-700  border-green-200  hover:bg-green-100'  },
  { label: 'Design',     emoji: '🎨', cat: 'Branding & Design',   chip: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100' },
  { label: 'Business',   emoji: '💼', cat: 'Marketing Tools',     chip: 'bg-cyan-50   text-cyan-700   border-cyan-200   hover:bg-cyan-100'   },
  { label: 'Security',   emoji: '🛡️', cat: 'Utility Tools',       chip: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
  { label: 'Daily Life', emoji: '🌟', cat: 'Daily Life',          chip: 'bg-teal-50   text-teal-700   border-teal-200   hover:bg-teal-100'   },
  { label: 'Fun',        emoji: '🎉', cat: 'Fun & Lifestyle',     chip: 'bg-amber-50  text-amber-700  border-amber-200  hover:bg-amber-100'  },
];

// ─── Why ToolBox Hub — 4 cards ────────────────────────────────────────────────
const WHY = [
  {
    emoji: '⚡', label: 'Fast',
    sub: 'Runs instantly in your browser. No waiting, no loading screens.',
    grad: 'from-amber-400 to-orange-500', light: 'bg-amber-50 border-amber-100',
  },
  {
    emoji: '🔒', label: 'Secure',
    sub: 'Privacy first. Your files and data never leave your device.',
    grad: 'from-green-400 to-emerald-600', light: 'bg-green-50 border-green-100',
  },
  {
    emoji: '📱', label: 'Mobile Friendly',
    sub: 'Works beautifully on phones, tablets, and every screen.',
    grad: 'from-violet-400 to-purple-600', light: 'bg-violet-50 border-violet-100',
  },
  {
    emoji: '💙', label: 'Free Forever',
    sub: 'No account. No credit card. No hidden fees. Ever.',
    grad: 'from-blue-400 to-blue-700', light: 'bg-blue-50 border-blue-100',
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { num: '116+', label: 'Free Tools',         color: 'text-blue-600'   },
  { num: '100%', label: 'Mobile Friendly',    color: 'text-violet-600' },
  { num: '24/7', label: 'Available',          color: 'text-emerald-600'},
  { num: '0',    label: 'Sign-ups Required',  color: 'text-rose-500'   },
];

// ─── Collections ─────────────────────────────────────────────────────────────
const COLLECTIONS = [
  { title: 'For Writers',   desc: 'Essays, stories, scripts & letters.',  grad: 'from-blue-600 to-indigo-700',    emoji: '✍️', cta: '/word-counter',           chips: ['Word Counter','Essay Generator','Story Generator']     },
  { title: 'For Designers', desc: 'Logos, palettes, brand kits & more.',  grad: 'from-fuchsia-600 to-violet-700', emoji: '🎨', cta: '/color-palette-generator', chips: ['Color Palette','Logo Generator','Font Pairing']        },
  { title: 'Get Work Done', desc: 'PDF, images, QR codes & passwords.',   grad: 'from-slate-700 to-slate-900',    emoji: '⚡', cta: '/pdf-merge',               chips: ['PDF Merge','Image Resizer','QR Code Generator']       },
];

// ─── Daily-seeded tool of day ─────────────────────────────────────────────────
const POP      = TOOLS.filter(t => t.popular);
const TOD      = POP[Math.floor(Date.now() / 86_400_000) % POP.length];

// ─── Colourful tool card ──────────────────────────────────────────────────────
function FeedCard({ tool }: { tool: Tool }) {
  const grad = CAT_COLOR[tool.category] ?? 'from-blue-400 to-blue-700';
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(tool.href);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 hover:-translate-y-1.5 hover:border-slate-200 transition-all duration-300 flex flex-col overflow-hidden">
      <Link href={tool.href} className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500" aria-label={`Open ${tool.title}`} />
      <button
        aria-label={fav ? 'Unfavourite' : 'Favourite'}
        aria-pressed={fav}
        onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(tool.href); }}
        className={`absolute top-3 right-3 z-[2] p-1.5 rounded-lg transition-colors ${fav ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
      >
        <Star className={`w-4 h-4 ${fav ? 'fill-amber-400' : ''}`} />
      </button>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          <tool.icon className="w-5 h-5 text-white drop-shadow-sm" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1 group-hover:text-blue-700 transition-colors">{tool.title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{tool.description}</p>
        </div>
        <div className="flex items-center gap-1 text-blue-500 text-xs font-semibold opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200">
          Open <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ icon, label, sub, badge, action, onAction }: {
  icon: React.ReactNode; label: string; sub?: string;
  badge?: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="flex items-end justify-between mb-6 gap-3 flex-wrap">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xl leading-none">{icon}</span>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{label}</h2>
          {badge && <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{badge}</span>}
        </div>
        {sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {action && onAction && (
        <button onClick={onAction} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
          {action} <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
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

  const popularTools = useMemo(() => TOOLS.filter(t => t.popular), []);
  const newTools     = useMemo(() => TOOLS.filter(t => t.isNew).slice(0, 12), []);
  const catTools     = useMemo(() => activeCat ? TOOLS.filter(t => t.category === activeCat) : [], [activeCat]);

  const surpriseMe = () => navigate(TOOLS[Math.floor(Math.random() * TOOLS.length)].href);

  const scrollTo = (id: string) =>
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);

  const pickCat = (cat: Category) => {
    setActiveCat(cat);
    setQuery('');
    scrollTo('cat-results');
  };

  return (
    <div className="flex flex-col -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 md:-mt-12">

      {/* ════════════════════════════════════════════════════════
          HERO — compact, search-first
      ════════════════════════════════════════════════════════ */}
      <section
        className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-10 md:pt-16 md:pb-12 text-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#dbeafe 0%,#eff6ff 35%,#ffffff 65%)' }}
      >
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 -right-24 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-blue-100 shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold text-blue-700 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            116+ free tools &nbsp;·&nbsp; No account needed
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-2">
            Your free toolkit<br />
            <span className="text-blue-600">for everything.</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base mb-8 max-w-sm mx-auto leading-relaxed">
            Writing, PDF, design, code & more — runs in your browser, free forever.
          </p>

          {/* Search bar */}
          <div className="relative group mb-4">
            <div className="flex items-center bg-white rounded-2xl border border-slate-200 shadow-[0_4px_32px_rgba(37,99,235,0.14)] group-focus-within:border-blue-400 group-focus-within:shadow-[0_4px_40px_rgba(37,99,235,0.22)] transition-all duration-300">
              <Search className="ml-5 flex-shrink-0 w-5 h-5 text-slate-400" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={e => { setQuery(e.target.value); setActiveCat(null); }}
                onKeyDown={e => e.key === 'Escape' && setQuery('')}
                placeholder="Search 116+ tools — try 'PDF', 'password', 'resume'…"
                aria-label="Search tools"
                className="flex-1 px-4 py-4 md:py-4.5 text-sm md:text-base bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
              />
              {query ? (
                <button
                  aria-label="Clear search"
                  onClick={() => { setQuery(''); searchRef.current?.focus(); }}
                  className="mr-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <span className="mr-3 bg-blue-600 text-white text-sm font-bold px-5 py-2 rounded-xl hidden sm:block select-none">
                  Search
                </span>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: '🔥 Trending',    fn: () => scrollTo('sec-popular') },
              { label: '🆕 New Tools',   fn: () => scrollTo('sec-new') },
              { label: '🎲 Surprise Me', fn: surpriseMe },
            ].map(q => (
              <button key={q.label} onClick={q.fn}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-700 bg-white/70 hover:bg-white border border-slate-200 hover:border-blue-200 rounded-xl shadow-sm hover:shadow transition-all">
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips — horizontal scroll */}
        <div className="mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="px-4 sm:px-6 lg:px-8 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex gap-2 w-max mx-auto pb-1">
              {CHIPS.map(c => (
                <button
                  key={c.label}
                  onClick={() => activeCat === c.cat ? setActiveCat(null) : pickCat(c.cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:scale-105 hover:shadow-sm select-none ${
                    activeCat === c.cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : c.chip
                  }`}
                >
                  <span className="text-base leading-none">{c.emoji}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* ════════════════════════════════════════════════════════
          SEARCH RESULTS
      ════════════════════════════════════════════════════════ */}
      {isSearching && (
        <section className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-6xl mx-auto">
            <div className="mb-5">
              <h2 className="font-extrabold text-slate-900 text-lg">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for{' '}
                <span className="text-blue-600">"{query}"</span>
              </h2>
            </div>
            {searchResults.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🔍</div>
                <p className="font-semibold text-slate-700">No tools matched "{query}"</p>
                <p className="text-sm text-slate-400 mt-1">Try "PDF", "password", or "resume".</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {searchResults.map(t => <FeedCard key={t.href} tool={t} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          CATEGORY FILTER
      ════════════════════════════════════════════════════════ */}
      {!isSearching && activeCat && (
        <section id="cat-results" className="px-4 sm:px-6 lg:px-8 py-10 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <h2 className="font-extrabold text-slate-900 text-lg flex-1">
                {activeCat} <span className="text-slate-400 font-normal text-sm">({catTools.length} tools)</span>
              </h2>
              <button onClick={() => setActiveCat(null)}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-colors">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {catTools.map(t => <FeedCard key={t.href} tool={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          MAIN SECTIONS
      ════════════════════════════════════════════════════════ */}
      {!isSearching && !activeCat && (
        <>
          {/* Favourites + Recently Used */}
          {(favTools.length > 0 || recentTools.length > 0) && (
            <section className="px-4 sm:px-6 lg:px-8 py-8 border-b border-slate-100">
              <div className="max-w-6xl mx-auto space-y-8">
                {favTools.length > 0 && (
                  <div>
                    <SectionHead icon="⭐" label="Favourites" sub="Your starred tools." />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {favTools.map(t => <FeedCard key={t.href} tool={t} />)}
                    </div>
                  </div>
                )}
                {recentTools.length > 0 && (
                  <div>
                    <SectionHead icon={<Clock className="w-5 h-5 text-slate-500" />} label="Recently Used" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {recentTools.slice(0, 10).map(t => <FeedCard key={t.href} tool={t} />)}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ════════════════════
              🔥 POPULAR TOOLS
          ════════════════════ */}
          <section id="sec-popular" className="px-4 sm:px-6 lg:px-8 py-10">
            <div className="max-w-6xl mx-auto">
              <SectionHead
                icon={<Flame className="w-5 h-5 text-orange-500" />}
                label="Popular Tools"
                sub="The tools people use every single day."
                badge="Trending"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {popularTools.map(t => <FeedCard key={t.href} tool={t} />)}
              </div>
            </div>
          </section>

          <div className="h-px mx-4 sm:mx-6 lg:mx-8 bg-slate-100" />

          {/* ════════════════════
              ✨ COLLECTIONS
          ════════════════════ */}
          <section className="px-4 sm:px-6 lg:px-8 py-10 bg-slate-50">
            <div className="max-w-6xl mx-auto">
              <SectionHead
                icon={<Sparkles className="w-5 h-5 text-violet-500" />}
                label="Curated Collections"
                sub="Handpicked sets for how you actually work."
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {COLLECTIONS.map(col => (
                  <Link key={col.title} href={col.cta}
                    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${col.grad} p-6 text-white group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 block`}>
                    <div className="absolute -right-6 -bottom-6 text-8xl opacity-[0.09] select-none pointer-events-none leading-none">{col.emoji}</div>
                    <div className="text-3xl mb-3">{col.emoji}</div>
                    <h3 className="font-extrabold text-base mb-1">{col.title}</h3>
                    <p className="text-xs opacity-80 mb-4 leading-relaxed">{col.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {col.chips.map(c => (
                        <span key={c} className="text-[10px] font-semibold bg-white/20 rounded-full px-2.5 py-1">{c}</span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 transition-colors">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <div className="h-px mx-4 sm:mx-6 lg:mx-8 bg-slate-100" />

          {/* ════════════════════
              🆕 NEW THIS WEEK
          ════════════════════ */}
          <section id="sec-new" className="px-4 sm:px-6 lg:px-8 py-10">
            <div className="max-w-6xl mx-auto">
              <SectionHead
                icon="🆕"
                label="New This Week"
                sub="Fresh tools just shipped — be the first to try them."
                badge="New"
                action={showAll ? undefined : `See all ${TOOLS.filter(t => t.isNew).length}`}
                onAction={() => setShowAll(true)}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {(showAll ? TOOLS.filter(t => t.isNew) : newTools).map(t => <FeedCard key={t.href} tool={t} />)}
              </div>
              {!showAll && TOOLS.filter(t => t.isNew).length > 12 && (
                <button onClick={() => setShowAll(true)}
                  className="mt-5 w-full py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-600 hover:text-blue-700 transition-colors">
                  Show all {TOOLS.filter(t => t.isNew).length} new tools ↓
                </button>
              )}
            </div>
          </section>

          {/* ════════════════════
              ⭐ TOOL OF THE DAY
          ════════════════════ */}
          {TOD && (
            <section className="px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 border-y border-slate-100">
              <div className="max-w-6xl mx-auto">
                <SectionHead
                  icon="⭐"
                  label="Today's Featured Tool"
                  sub="A fresh spotlight every morning — bookmark it."
                />
                <div className="rounded-2xl border border-blue-100 shadow-lg shadow-blue-50/80 overflow-hidden grid md:grid-cols-5">
                  {/* Info */}
                  <div className="md:col-span-3 p-8 md:p-10 bg-white flex flex-col justify-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${CAT_COLOR[TOD.category] ?? 'from-blue-500 to-indigo-600'} flex items-center justify-center mb-5 shadow-md`}>
                      <TOD.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">⭐ Today's Pick</div>
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">{TOD.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-sm">{TOD.description}</p>
                    <div className="flex flex-wrap gap-3">
                      <Link href={TOD.href}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] shadow-md shadow-blue-200">
                        Try it — one click <ArrowRight className="w-4 h-4" />
                      </Link>
                      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 font-semibold">
                        ✓ No account needed
                      </span>
                    </div>
                  </div>
                  {/* Visual panel */}
                  <div className="hidden md:flex md:col-span-2 items-center justify-center p-10 relative overflow-hidden"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='white' fill-opacity='0.07'/%3E%3C/svg%3E"), linear-gradient(135deg,#2563eb 0%,#4f46e5 100%)` }}>
                    <div className="w-28 h-28 bg-white/15 rounded-3xl flex items-center justify-center shadow-2xl ring-1 ring-white/20">
                      <TOD.icon className="w-14 h-14 text-white drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ════════════════════
              💙 WHY TOOLBOX HUB
          ════════════════════ */}
          <section className="px-4 sm:px-6 lg:px-8 py-14 bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">Why ToolBox Hub?</p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Built for everyone. Built to last.
                </h2>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  Great tools should be free, fast, and private. That's the whole idea.
                </p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {WHY.map(w => (
                  <div key={w.label}
                    className={`flex flex-col items-center text-center p-6 rounded-2xl border ${w.light} hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}>
                    {/* Icon circle with gradient */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${w.grad} flex items-center justify-center mb-4 shadow-md`}>
                      <span className="text-2xl leading-none">{w.emoji}</span>
                    </div>
                    <p className="font-extrabold text-slate-900 text-base mb-1.5">{w.label}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{w.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════
              📊 STATS — trust
          ════════════════════ */}
          <section className="px-4 sm:px-6 lg:px-8 py-12 border-y border-slate-100"
            style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 55%,#4f46e5 100%)' }}>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
                {STATS.map((s, i) => (
                  <div key={s.label} className={`${i < 3 ? 'sm:border-r border-white/10' : ''}`}>
                    <div className="text-4xl md:text-5xl font-extrabold text-white mb-1 tracking-tight">{s.num}</div>
                    <div className="text-sm text-blue-200 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════
              💡 SUGGEST A TOOL
          ════════════════════ */}
          <section className="px-4 sm:px-6 lg:px-8 py-12 bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="rounded-3xl overflow-hidden grid md:grid-cols-2 shadow-2xl shadow-blue-100">
                {/* Content */}
                <div className="p-8 md:p-12 flex flex-col justify-center"
                  style={{ backgroundImage: 'linear-gradient(135deg,#2563eb 0%,#4338ca 100%)' }}>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
                    <span className="text-3xl leading-none">💡</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight leading-tight">
                    Can't find what you need?
                  </h2>
                  <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-7">
                    Tell us what tool would help you most. We read every suggestion — some of our best tools came from user requests.
                  </p>
                  <a
                    href="mailto:hello@toolboxhub.app?subject=Tool+Suggestion"
                    className="inline-flex items-center gap-2 bg-white text-blue-700 font-extrabold px-7 py-3.5 rounded-xl hover:bg-blue-50 transition-all hover:scale-[1.02] shadow-lg w-fit text-sm"
                  >
                    💡 Suggest a Tool <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
                {/* Illustration panel */}
                <div className="hidden md:flex bg-blue-50 items-center justify-center p-12">
                  <div className="text-center">
                    <div className="text-7xl mb-4">🛠️</div>
                    <p className="text-slate-600 font-bold">Your idea could be the next tool.</p>
                    <p className="text-slate-400 text-sm mt-1">Hundreds of tools were built from suggestions.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════
              📖 OUR JOURNEY
          ════════════════════ */}
          <section className="px-4 sm:px-6 lg:px-8 py-14 bg-slate-50 border-t border-slate-100">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">Our Journey</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
                Started with one tool.<br />Grew into something bigger.
              </h2>
              <div className="space-y-5 text-slate-600 text-base leading-relaxed text-left">
                <p>
                  ToolBox Hub started with one simple idea: great tools should be free and easy to use for everyone. No downloads, no sign-ups, no paywalls. Just tools that open instantly and work.
                </p>
                <p>
                  We've grown from a single-page experiment into a collection of 116+ tools used by writers, designers, developers, students, and everyday people around the world. Every tool is built with care, runs in your browser, and respects your privacy — your data never leaves your device.
                </p>
                <p className="font-semibold text-slate-800">
                  We're just getting started.
                </p>
              </div>
              <div className="mt-8">
                <Link href="/vision"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold border border-blue-200 hover:border-blue-400 bg-white px-6 py-3 rounded-xl transition-all hover:shadow-md text-sm">
                  Read our full story <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* ════════════════════
              CTA
          ════════════════════ */}
          <section className="relative overflow-hidden py-20 px-4 text-center"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='white' fill-opacity='0.06'/%3E%3C/svg%3E"), linear-gradient(135deg,#1e3a8a 0%,#2563eb 55%,#4f46e5 100%)` }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-60 h-60 bg-blue-400/15 rounded-full blur-3xl" />
              <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-60 h-60 bg-indigo-400/15 rounded-full blur-3xl" />
            </div>
            <div className="relative max-w-lg mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3 leading-tight">
                Everything you need.<br />One tab. Free forever.
              </h2>
              <p className="text-blue-200 text-sm md:text-base mb-8">116+ tools, zero cost, no sign-up required.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => searchRef.current?.focus(), 400); }}
                  className="px-7 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all hover:scale-[1.03] shadow-xl shadow-blue-900/20 text-sm">
                  Start Searching
                </button>
                <button onClick={surpriseMe}
                  className="px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all text-sm">
                  🎲 Surprise Me
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
