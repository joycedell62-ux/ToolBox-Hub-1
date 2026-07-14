import React, { useState, useMemo } from 'react';
import {
  Search, ChevronRight, X, Zap, ShieldCheck, Smartphone, WifiOff, Gift,
  Star, ArrowRight,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import ToolCard from '../components/ToolCard';
import { TOOLS, getToolByHref } from '../lib/tools';
import type { Tool, Category } from '../lib/tools';
import { useFavorites, useRecentlyUsed } from '../lib/toolPrefs';

// ─── Category gradient tiles ──────────────────────────────────────────────────
const QUICK_CATS: {
  label: string; emoji: string; cat: Category; count?: number;
  grad: string; shine: string;
}[] = [
  { label: 'PDF Tools',    emoji: '📄', cat: 'PDF Tools',          grad: 'from-rose-500 to-orange-500',      shine: 'from-white/10 to-transparent' },
  { label: 'Images',       emoji: '🖼️', cat: 'Image Tools',         grad: 'from-violet-500 to-purple-700',    shine: 'from-white/10 to-transparent' },
  { label: 'Business',     emoji: '💼', cat: 'Marketing Tools',     grad: 'from-sky-500 to-blue-700',         shine: 'from-white/10 to-transparent' },
  { label: 'Developer',    emoji: '💻', cat: 'Developer Tools',     grad: 'from-slate-600 to-slate-900',      shine: 'from-white/10 to-transparent' },
  { label: 'AI Writing',   emoji: '🤖', cat: 'Writing Generators',  grad: 'from-emerald-500 to-teal-700',     shine: 'from-white/10 to-transparent' },
  { label: 'Education',    emoji: '📚', cat: 'Text Tools',          grad: 'from-amber-400 to-orange-600',     shine: 'from-white/10 to-transparent' },
  { label: 'Finance',      emoji: '💰', cat: 'Calculators',         grad: 'from-green-500 to-emerald-700',    shine: 'from-white/10 to-transparent' },
  { label: 'Security',     emoji: '🛡️', cat: 'Utility Tools',       grad: 'from-indigo-600 to-violet-800',    shine: 'from-white/10 to-transparent' },
];

// ─── Curated tool collections ─────────────────────────────────────────────────
const COLLECTIONS = [
  {
    id: 'write',
    title: 'For Writers',
    desc: 'Essays, stories, scripts, and polished letters — in minutes.',
    grad: 'from-blue-600 to-indigo-700',
    emoji: '✍️',
    tools: ['/word-counter', '/essay-generator', '/story-generator', '/blog-post-idea-generator'],
    cta: '/word-counter',
  },
  {
    id: 'design',
    title: 'For Designers',
    desc: 'Build a complete brand identity without expensive software.',
    grad: 'from-fuchsia-600 to-violet-700',
    emoji: '🎨',
    tools: ['/color-palette-generator', '/logo-generator', '/font-pairing-generator', '/brand-style-guide-generator'],
    cta: '/color-palette-generator',
  },
  {
    id: 'work',
    title: 'Get Things Done',
    desc: 'PDF, images, passwords, QR codes — no installs needed.',
    grad: 'from-slate-700 to-slate-900',
    emoji: '⚡',
    tools: ['/pdf-merge', '/image-resizer', '/qr-code-generator', '/password-generator'],
    cta: '/pdf-merge',
  },
];

// ─── Why ToolBox Hub ──────────────────────────────────────────────────────────
const WHY = [
  { icon: Gift,        label: 'Always Free',       sub: 'No credit card. No paywalls. Ever.' },
  { icon: Zap,         label: 'Instant Results',   sub: 'Everything runs right in your browser.' },
  { icon: ShieldCheck, label: 'Private by Design', sub: 'Your files never leave your device.' },
  { icon: Smartphone,  label: 'Works Everywhere',  sub: 'Mobile, tablet, desktop — any screen.' },
  { icon: WifiOff,     label: 'Offline Ready',     sub: 'Most tools work without the internet.' },
];

// ─── Tool of the Day (daily seed) ────────────────────────────────────────────
const POPULAR_POOL = TOOLS.filter(t => t.popular);
const TOOL_OF_DAY = POPULAR_POOL[Math.floor(Date.now() / 86_400_000) % POPULAR_POOL.length];

// ─── All categories (full browse) ─────────────────────────────────────────────
const ALL_CATS: { name: Category; emoji: string }[] = [
  { name: 'Text Tools',         emoji: '✍️' },
  { name: 'Calculators',        emoji: '🔢' },
  { name: 'Utility Tools',      emoji: '🔧' },
  { name: 'Developer Tools',    emoji: '💻' },
  { name: 'PDF Tools',          emoji: '📄' },
  { name: 'Image Tools',        emoji: '🖼️' },
  { name: 'Daily Life',         emoji: '🌟' },
  { name: 'Writing Generators', emoji: '🤖' },
  { name: 'Fun & Lifestyle',    emoji: '🎉' },
  { name: 'Branding & Design',  emoji: '🎨' },
  { name: 'Marketing Tools',    emoji: '📢' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionHead({
  eyebrow, title, sub, action, onAction,
}: {
  eyebrow: string; title: string; sub?: string;
  action?: string; onAction?: () => void;
}) {
  return (
    <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-blue-500 mb-1.5">{eyebrow}</p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">{title}</h2>
        {sub && <p className="text-slate-500 mt-1.5 text-sm md:text-base max-w-xl">{sub}</p>}
      </div>
      {action && onAction && (
        <button
          onClick={onAction}
          className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
        >
          {action} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCat, setActiveCat]     = useState<Category | null>(null);
  const [showAll, setShowAll]         = useState(false);
  const [, navigate]                  = useLocation();

  const { favorites }  = useFavorites();
  const recentHrefs    = useRecentlyUsed();
  const favTools       = useMemo(() => favorites.map(getToolByHref).filter(Boolean) as Tool[], [favorites]);
  const recentTools    = useMemo(() => recentHrefs.map(getToolByHref).filter(Boolean) as Tool[], [recentHrefs]);

  const isSearching    = searchQuery.trim().length > 0;
  const isCatFilter    = activeCat !== null;

  const searchResults  = useMemo(() =>
    isSearching ? TOOLS.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [],
    [searchQuery]);

  const catTools = useMemo(() =>
    activeCat ? TOOLS.filter(t => t.category === activeCat) : [],
    [activeCat]);

  const trendingTools = useMemo(() => TOOLS.filter(t => t.popular), []);

  const surpriseMe = () => navigate(TOOLS[Math.floor(Math.random() * TOOLS.length)].href);

  const openCat = (cat: Category) => {
    setActiveCat(cat);
    setSearchQuery('');
    // small delay for smooth scroll after state settles
    setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const clearCat = () => { setActiveCat(null); setShowAll(false); };

  const allToolsVisible = showAll ? TOOLS : TOOLS.slice(0, 24);

  return (
    <div className="flex flex-col">

      {/* ════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-b from-[#EFF6FF] via-[#F8FBFF] to-white pb-16 pt-16 md:pt-24 overflow-hidden">
        {/* Background orbs for depth */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-8 right-8 w-48 h-48 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none hidden lg:block" />
        <div className="absolute top-16 left-8 w-32 h-32 bg-sky-200/40 rounded-full blur-2xl pointer-events-none hidden lg:block" />

        <div className="relative max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-blue-100 shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold text-blue-700 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            116+ Free Tools &nbsp;·&nbsp; No sign-up required
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-5">
            Your free toolkit<br className="hidden sm:block" />
            <span className="text-blue-600"> for everything.</span>
          </h1>

          <p className="text-slate-500 text-base md:text-lg max-w-lg mb-10 leading-relaxed">
            Writing, design, PDF, images, developer tools, and more.
            No accounts. No downloads. No cost.
          </p>

          {/* SEARCH BAR */}
          <div className="relative w-full max-w-2xl mb-7">
            <div
              className="flex items-center bg-white rounded-2xl border border-slate-200 shadow-[0_8px_40px_rgba(37,99,235,0.13)] hover:shadow-[0_12px_50px_rgba(37,99,235,0.18)] focus-within:border-blue-400 focus-within:shadow-[0_8px_40px_rgba(37,99,235,0.22)] transition-all duration-300"
            >
              <Search className="ml-5 flex-shrink-0 w-5 h-5 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setActiveCat(null); }}
                placeholder="Search 116+ free tools…"
                aria-label="Search tools"
                className="flex-1 px-4 py-4 md:py-5 text-base md:text-lg bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
              />
              {searchQuery ? (
                <button
                  aria-label="Clear"
                  onClick={() => setSearchQuery('')}
                  className="mr-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="mr-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-default hidden sm:block select-none">
                  Search
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              { label: '🔥 Trending',          action: () => document.getElementById('trending-section')?.scrollIntoView({ behavior: 'smooth' }) },
              { label: '🆕 New Tools',          action: () => { setShowAll(false); document.getElementById('browse-section')?.scrollIntoView({ behavior: 'smooth' }); } },
              { label: '📂 Browse All',         action: () => { setShowAll(true);  document.getElementById('browse-section')?.scrollIntoView({ behavior: 'smooth' }); } },
              { label: '🎲 Surprise Me',        action: surpriseMe },
            ].map(q => (
              <button
                key={q.label}
                onClick={q.action}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-blue-700 bg-white/80 hover:bg-white border border-slate-200 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SEARCH RESULTS
      ════════════════════════════════════════════════════════ */}
      {isSearching && (
        <section className="max-w-7xl mx-auto w-full px-4 md:px-8 py-12">
          <SectionHead
            eyebrow="Search results"
            title={`${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`}
          />
          {searchResults.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-semibold text-slate-600">No tools matched</p>
              <p className="text-sm mt-1">Try a different keyword — e.g. "password" or "PDF".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {searchResults.map(t => (
                <ToolCard key={t.href} title={t.title} description={t.description} icon={t.icon} href={t.href}
                  badge={t.popular ? 'Popular' : t.isNew ? 'New' : undefined} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          BODY — hidden while searching
      ════════════════════════════════════════════════════════ */}
      {!isSearching && (
        <>
          {/* ── Personal (favorites + recent) ── */}
          {(favTools.length > 0 || recentTools.length > 0) && (
            <section className="max-w-7xl mx-auto w-full px-4 md:px-8 py-12 border-b border-slate-100">
              {favTools.length > 0 && (
                <div className="mb-10">
                  <SectionHead eyebrow="Your library" title="⭐ Favorites" sub="Tools you've starred for quick access." />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {favTools.map(t => <ToolCard key={t.href} title={t.title} description={t.description} icon={t.icon} href={t.href} />)}
                  </div>
                </div>
              )}
              {recentTools.length > 0 && (
                <div>
                  <SectionHead eyebrow="Pick up where you left off" title="🕐 Recently Used" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {recentTools.slice(0, 8).map(t => <ToolCard key={t.href} title={t.title} description={t.description} icon={t.icon} href={t.href} />)}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ════════════════════════════════════════════════════════
              CATEGORY GRADIENT TILES
          ════════════════════════════════════════════════════════ */}
          <section className="bg-white py-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <SectionHead
                eyebrow="Browse by category"
                title="What are you working on?"
                sub="Jump straight to the tools built for your task."
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {QUICK_CATS.map(cat => {
                  const cnt = TOOLS.filter(t => t.category === cat.cat).length;
                  return (
                    <button
                      key={cat.label}
                      onClick={() => openCat(cat.cat)}
                      className={`relative overflow-hidden rounded-2xl p-5 md:p-6 bg-gradient-to-br ${cat.grad} text-white text-left group hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
                    >
                      {/* Inner shine */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${cat.shine} pointer-events-none rounded-2xl`} />
                      <span className="relative text-3xl md:text-4xl block mb-3 drop-shadow-sm">{cat.emoji}</span>
                      <span className="relative font-bold text-sm md:text-base block leading-tight">{cat.label}</span>
                      <span className="relative text-xs opacity-70 mt-1 block">{cnt} tools</span>
                      {/* Decorative large emoji */}
                      <span className="absolute -right-3 -bottom-3 text-7xl opacity-[0.12] group-hover:opacity-[0.18] transition-opacity select-none pointer-events-none leading-none">{cat.emoji}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Category filter results */}
          {isCatFilter && (
            <section id="results-section" className="bg-slate-50 py-14 px-4 md:px-8 border-y border-slate-100">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8 flex-wrap">
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase text-blue-500 mb-1">Category</p>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{activeCat}</h2>
                    <p className="text-slate-500 mt-1 text-sm">{catTools.length} tools available</p>
                  </div>
                  <button
                    onClick={clearCat}
                    className="ml-auto flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Clear filter
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {catTools.map(t => (
                    <ToolCard key={t.href} title={t.title} description={t.description} icon={t.icon} href={t.href}
                      badge={t.popular ? 'Popular' : t.isNew ? 'New' : undefined} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ════════════════════════════════════════════════════════
              TRENDING TOOLS
          ════════════════════════════════════════════════════════ */}
          <section id="trending-section" className="py-16 px-4 md:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <SectionHead
                eyebrow="🔥 Trending right now"
                title="Most Popular Tools"
                sub="The tools people reach for every single day."
                action="Browse all tools"
                onAction={() => { setShowAll(true); document.getElementById('browse-section')?.scrollIntoView({ behavior: 'smooth' }); }}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingTools.map(t => (
                  <ToolCard key={t.href} title={t.title} description={t.description} icon={t.icon} href={t.href} badge="Popular" />
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════
              TOOL COLLECTIONS
          ════════════════════════════════════════════════════════ */}
          <section className="py-16 px-4 md:px-8 bg-slate-50 border-y border-slate-100">
            <div className="max-w-7xl mx-auto">
              <SectionHead
                eyebrow="✨ Curated collections"
                title="Tools for every goal"
                sub="Handpicked sets designed around how you actually work."
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {COLLECTIONS.map(col => {
                  const tools = col.tools.map(h => getToolByHref(h)).filter(Boolean) as Tool[];
                  return (
                    <div
                      key={col.id}
                      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${col.grad} p-7 md:p-8 text-white flex flex-col hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300`}
                    >
                      {/* Decorative background */}
                      <div className="absolute -right-8 -bottom-8 text-[9rem] opacity-[0.07] select-none pointer-events-none leading-none">{col.emoji}</div>

                      <span className="text-4xl mb-5 drop-shadow-sm">{col.emoji}</span>
                      <h3 className="text-xl md:text-2xl font-extrabold mb-2 tracking-tight">{col.title}</h3>
                      <p className="text-sm opacity-80 leading-relaxed mb-6 flex-1">{col.desc}</p>

                      {/* Tool name chips */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {tools.slice(0, 3).map(t => (
                          <span key={t.href} className="text-xs bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 font-semibold">
                            {t.title}
                          </span>
                        ))}
                        {tools.length === 0 && (
                          <span className="text-xs bg-white/20 rounded-full px-3 py-1 font-semibold opacity-70">Coming soon</span>
                        )}
                      </div>

                      <Link
                        href={tools[0]?.href || '/'}
                        className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-5 py-2.5 text-sm font-bold transition-colors w-fit"
                      >
                        Explore <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════
              TOOL OF THE DAY
          ════════════════════════════════════════════════════════ */}
          {TOOL_OF_DAY && (
            <section className="py-16 px-4 md:px-8 bg-white">
              <div className="max-w-7xl mx-auto">
                <SectionHead eyebrow="⭐ Featured today" title="Tool of the Day" sub="A fresh spotlight every morning — no duplicates." />
                <div className="rounded-3xl overflow-hidden grid md:grid-cols-5 shadow-xl shadow-blue-100/60 border border-blue-100">
                  {/* Content */}
                  <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center bg-white">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <TOOL_OF_DAY.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">{TOOL_OF_DAY.title}</h3>
                    <p className="text-slate-500 text-base leading-relaxed mb-7 max-w-md">{TOOL_OF_DAY.description}</p>
                    <div className="flex gap-3 flex-wrap">
                      <Link
                        href={TOOL_OF_DAY.href}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-md shadow-blue-200"
                      >
                        Try it free <ArrowRight className="w-4 h-4" />
                      </Link>
                      <span className="inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 font-semibold">
                        ✓ No account needed
                      </span>
                    </div>
                  </div>
                  {/* Decorative panel */}
                  <div
                    className="hidden md:flex md:col-span-2 items-center justify-center p-12 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,#2563eb 0%,#4f46e5 100%)' }}
                  >
                    {/* Dot pattern overlay */}
                    <div
                      className="absolute inset-0 opacity-[0.07]"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='white'/%3E%3C/svg%3E")` }}
                    />
                    <div className="relative w-32 h-32 bg-white/15 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm ring-1 ring-white/20">
                      <TOOL_OF_DAY.icon className="w-16 h-16 text-white drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ════════════════════════════════════════════════════════
              BROWSE ALL TOOLS
          ════════════════════════════════════════════════════════ */}
          <section id="browse-section" className="py-16 px-4 md:px-8 bg-slate-50 border-t border-slate-100">
            <div className="max-w-7xl mx-auto">
              {/* Category tabs */}
              <div className="flex items-center gap-3 mb-8 flex-wrap">
                <div className="flex-1">
                  <p className="text-xs font-bold tracking-widest uppercase text-blue-500 mb-1.5">📂 Browse all</p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {showAll ? 'All 116+ Tools' : 'New Additions'}
                  </h2>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setShowAll(false)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${!showAll ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                  >
                    🆕 New Tools
                  </button>
                  <button
                    onClick={() => setShowAll(true)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${showAll ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                  >
                    View All
                  </button>
                </div>
              </div>

              {showAll ? (
                /* Full category-by-category browse */
                <div className="space-y-12">
                  {ALL_CATS.map(cat => {
                    const catT = TOOLS.filter(t => t.category === cat.name);
                    if (catT.length === 0) return null;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="text-xl">{cat.emoji}</span>
                            {cat.name}
                            <span className="text-xs font-semibold text-slate-400 ml-1">{catT.length}</span>
                          </h3>
                          <button
                            onClick={() => openCat(cat.name)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            All <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {catT.map(t => (
                            <ToolCard key={t.href} title={t.title} description={t.description} icon={t.icon} href={t.href}
                              badge={t.popular ? 'Popular' : t.isNew ? 'New' : undefined} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* New tools grid */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {TOOLS.filter(t => t.isNew).map(t => (
                      <ToolCard key={t.href} title={t.title} description={t.description} icon={t.icon} href={t.href} badge="New" />
                    ))}
                  </div>
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setShowAll(true)}
                      className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-semibold px-7 py-3 rounded-xl transition-all hover:shadow-md"
                    >
                      View all 116+ tools <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════
              WHY TOOLBOX HUB
          ════════════════════════════════════════════════════════ */}
          <section className="py-20 px-4 md:px-8 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-14">
                <p className="text-xs font-bold tracking-widest uppercase text-blue-500 mb-3">💙 Why ToolBox Hub?</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                  Built for everyone.<br className="hidden sm:block" /> Built to last.
                </h2>
                <p className="text-slate-500 text-base max-w-md mx-auto">
                  We believe great tools should be available to everyone — not behind a paywall.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-8">
                {WHY.map(item => (
                  <div key={item.label} className="flex flex-col items-center text-center group">
                    <div className="w-14 h-14 bg-blue-50 group-hover:bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 transition-colors shadow-sm">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-900 mb-1.5">✓ {item.label}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════
              OUR JOURNEY
          ════════════════════════════════════════════════════════ */}
          <section className="py-16 px-4 md:px-8 bg-slate-50 border-y border-slate-100">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-xs font-bold tracking-widest uppercase text-blue-500 mb-4">📖 Our Journey</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-5">
                Started with one tool.<br />Grew into 116+ solutions.
              </h2>
              <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-lg mx-auto">
                ToolBox Hub began as a single page to scratch a personal itch. One useful tool became
                ten. Ten became a hundred. Every tool on this site is free — because we believe
                genuinely useful software shouldn't cost anything. We're just getting started.
              </p>
              <Link
                href="/vision"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold border border-blue-200 hover:border-blue-400 bg-white px-6 py-3 rounded-xl transition-all hover:shadow-md"
              >
                Read our full story <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════
              COMMUNITY
          ════════════════════════════════════════════════════════ */}
          <section className="py-20 px-4 md:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-xs font-bold tracking-widest uppercase text-blue-500 mb-3">💬 Community</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Help us build something great</h2>
                <p className="text-slate-500 text-base max-w-md mx-auto">Every piece of feedback shapes the next update. We read every message.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
                {[
                  { emoji: '⭐', title: 'Suggest a Tool',  desc: 'Got an idea? We might build it next.',    subject: 'Tool+Suggestion' },
                  { emoji: '💡', title: 'Give Feedback',   desc: 'Something could be better? Tell us.',    subject: 'Feedback' },
                  { emoji: '🐞', title: 'Report a Bug',   desc: 'Found something broken? Help us fix it.', subject: 'Bug+Report' },
                ].map(item => (
                  <a
                    key={item.title}
                    href={`mailto:hello@toolboxhub.app?subject=${item.subject}`}
                    className="group flex flex-col items-center text-center p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <span className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">{item.emoji}</span>
                    <span className="font-bold text-slate-900 text-base mb-2">{item.title}</span>
                    <span className="text-sm text-slate-500 leading-relaxed">{item.desc}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════
              START EXPLORING CTA
          ════════════════════════════════════════════════════════ */}
          <section className="relative overflow-hidden py-24 px-4 text-center"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='white' fill-opacity='0.07'/%3E%3C/svg%3E"), linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)` }}
          >
            {/* Glow orbs */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-2xl mx-auto">
              <p className="text-blue-300 text-sm font-semibold mb-4 tracking-wide uppercase">🚀 Ready to begin?</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-[1.1]">
                Everything you need.<br />One website. Free forever.
              </h2>
              <p className="text-blue-200 text-base md:text-lg mb-10 leading-relaxed">
                116+ tools, zero cost, no account needed. Start in seconds.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => document.getElementById('trending-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-all hover:scale-[1.03] shadow-xl shadow-blue-900/20 text-base"
                >
                  Browse All Tools
                </button>
                <button
                  onClick={surpriseMe}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold rounded-2xl transition-all text-base"
                >
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
