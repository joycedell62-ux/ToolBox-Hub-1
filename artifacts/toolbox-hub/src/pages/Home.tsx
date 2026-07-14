import React, { useState, useRef, useMemo } from 'react';
import {
  Search, Zap, Lock, Smartphone, Gift, ShieldCheck,
  ChevronRight, Shuffle, Bug, X,
  WifiOff,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import ToolCard from '../components/ToolCard';
import { TOOLS, getToolByHref } from '../lib/tools';
import type { Tool, Category } from '../lib/tools';
import { useFavorites, useRecentlyUsed } from '../lib/toolPrefs';

// ─── Dot pattern ──────────────────────────────────────────────────────────────
const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='white' fill-opacity='0.08'/%3E%3C/svg%3E")`;

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type Tab = 'popular' | 'new' | 'featured' | 'categories';
const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'popular',    label: 'Popular',          emoji: '🔥' },
  { id: 'new',        label: 'New Tools',        emoji: '🆕' },
  { id: 'featured',   label: 'Featured',         emoji: '⭐' },
  { id: 'categories', label: 'Browse Categories',emoji: '📂' },
];

// ─── Quick-browse categories ───────────────────────────────────────────────────
interface QuickCat {
  label: string;
  emoji: string;
  category: Category;
  color: string;
}
const QUICK_CATS: QuickCat[] = [
  { label: 'PDF',         emoji: '📄', category: 'PDF Tools',          color: 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100' },
  { label: 'Images',      emoji: '🖼️', category: 'Image Tools',         color: 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100' },
  { label: 'Business',    emoji: '💼', category: 'Marketing Tools',     color: 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100' },
  { label: 'Developer',   emoji: '💻', category: 'Developer Tools',     color: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100' },
  { label: 'AI Writing',  emoji: '🤖', category: 'Writing Generators',  color: 'bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100' },
  { label: 'Education',   emoji: '📚', category: 'Text Tools',          color: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100' },
  { label: 'Finance',     emoji: '💰', category: 'Calculators',         color: 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' },
  { label: 'Security',    emoji: '🛡️', category: 'Utility Tools',       color: 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100' },
];

// ─── All categories (for Browse tab) ──────────────────────────────────────────
const ALL_CATEGORIES: { name: Category; emoji: string; color: string; ring: string }[] = [
  { name: 'Text Tools',         emoji: '✍️',  color: 'bg-blue-50 text-blue-700',    ring: 'ring-blue-100' },
  { name: 'Calculators',        emoji: '🔢',  color: 'bg-green-50 text-green-700',  ring: 'ring-green-100' },
  { name: 'Utility Tools',      emoji: '🔧',  color: 'bg-slate-50 text-slate-700',  ring: 'ring-slate-100' },
  { name: 'Developer Tools',    emoji: '💻',  color: 'bg-indigo-50 text-indigo-700',ring: 'ring-indigo-100' },
  { name: 'PDF Tools',          emoji: '📄',  color: 'bg-red-50 text-red-700',      ring: 'ring-red-100' },
  { name: 'Image Tools',        emoji: '🖼️',  color: 'bg-purple-50 text-purple-700',ring: 'ring-purple-100' },
  { name: 'Daily Life',         emoji: '🌟',  color: 'bg-orange-50 text-orange-700',ring: 'ring-orange-100' },
  { name: 'Writing Generators', emoji: '🤖',  color: 'bg-teal-50 text-teal-700',    ring: 'ring-teal-100' },
  { name: 'Fun & Lifestyle',    emoji: '🎉',  color: 'bg-pink-50 text-pink-700',    ring: 'ring-pink-100' },
  { name: 'Branding & Design',  emoji: '🎨',  color: 'bg-fuchsia-50 text-fuchsia-700', ring: 'ring-fuchsia-100' },
  { name: 'Marketing Tools',    emoji: '📢',  color: 'bg-cyan-50 text-cyan-700',    ring: 'ring-cyan-100' },
];

// ─── Why ToolBox Hub ──────────────────────────────────────────────────────────
const WHY = [
  { icon: Gift,        label: 'Free',             sub: 'Every tool, always free — no credit card needed' },
  { icon: Zap,         label: 'Fast',             sub: 'Results in seconds, runs right in your browser' },
  { icon: ShieldCheck, label: 'Privacy First',    sub: 'Your files and data never leave your device' },
  { icon: Smartphone,  label: 'Mobile Friendly',  sub: 'Looks and works great on any screen size' },
  { icon: WifiOff,     label: 'Works Offline',    sub: 'Most tools run without an internet connection' },
];

// ─── Tool of the Day (daily seed from popular pool) ───────────────────────────
const POPULAR_POOL = TOOLS.filter(t => t.popular);
const todayIndex = Math.floor(Date.now() / 86_400_000) % POPULAR_POOL.length;
const TOOL_OF_DAY = POPULAR_POOL[todayIndex];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionHeading({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-extrabold text-gray-900">{children}</h2>
      {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [searchQuery, setSearchQuery]       = useState('');
  const [activeTab, setActiveTab]           = useState<Tab>('popular');
  const [activeCat, setActiveCat]           = useState<Category | null>(null);
  const [, navigate]                        = useLocation();
  const toolsSectionRef                     = useRef<HTMLElement>(null);
  const searchInputRef                      = useRef<HTMLInputElement>(null);

  const { favorites }   = useFavorites();
  const recentHrefs     = useRecentlyUsed();
  const favoriteTools   = favorites.map(getToolByHref).filter(Boolean) as Tool[];
  const recentlyUsed    = recentHrefs.map(getToolByHref).filter(Boolean) as Tool[];

  const isSearching    = searchQuery.trim().length > 0;
  const filteredSearch = useMemo(() =>
    isSearching
      ? TOOLS.filter(t =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase()))
      : [],
    [searchQuery]);

  const popularTools = useMemo(() => TOOLS.filter(t => t.popular), []);
  const newTools     = useMemo(() => TOOLS.filter(t => t.isNew),   []);

  const tabTools: Tool[] = useMemo(() => {
    if (activeTab === 'popular')  return popularTools;
    if (activeTab === 'new')      return newTools;
    if (activeTab === 'featured') return popularTools.slice(0, 6);
    return [];
  }, [activeTab, popularTools, newTools]);

  const categoryTools = useMemo(() =>
    activeCat ? TOOLS.filter(t => t.category === activeCat) : [],
    [activeCat]);

  const surpriseMe = () => navigate(TOOLS[Math.floor(Math.random() * TOOLS.length)].href);

  const scrollToTools = () =>
    toolsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleQuickCat = (cat: Category) => {
    setActiveCat(cat);
    setActiveTab('categories');
    scrollToTools();
  };

  const clearCatFilter = () => setActiveCat(null);

  return (
    <div className="flex flex-col gap-0">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section
        className="relative flex flex-col items-center text-center px-4 pt-14 pb-20 overflow-hidden"
        style={{ backgroundImage: `${DOT_PATTERN}, linear-gradient(160deg,#1e3a8a 0%,#2563eb 55%,#3b82f6 100%)` }}
      >
        {/* Logo mark */}
        <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
          <span className="text-2xl">🛠️</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-xl mb-3">
          ToolBox Hub
        </h1>
        <p className="text-blue-200 text-base md:text-lg max-w-md mb-8 leading-relaxed">
          Everything You Need.&nbsp; One Website.&nbsp; Free Forever.
        </p>

        {/* Search bar */}
        <div className="relative w-full max-w-xl mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="🔍  Search for any tool..."
            aria-label="Search tools"
            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white text-gray-800 text-base shadow-xl focus:outline-none focus:ring-2 focus:ring-white/60"
          />
          {searchQuery && (
            <button
              aria-label="Clear search"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setActiveCat(null); setSearchQuery(''); scrollToTools(); }}
              aria-pressed={activeTab === tab.id && !isSearching}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all
                ${activeTab === tab.id && !isSearching
                  ? 'bg-white text-blue-700 border-white shadow-md'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
          <button
            onClick={surpriseMe}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all"
          >
            🎲 Surprise Me
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SEARCH RESULTS
      ══════════════════════════════════════════ */}
      {isSearching && (
        <section className="px-4 md:px-8 max-w-7xl mx-auto w-full py-10">
          <SectionHeading sub={`${filteredSearch.length} result${filteredSearch.length !== 1 ? 's' : ''} for "${searchQuery}"`}>
            Search Results
          </SectionHeading>
          {filteredSearch.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="text-4xl mb-3 block">🔍</span>
              No tools matched — try a different word.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSearch.map(t => (
                <ToolCard key={t.href} title={t.title} description={t.description} icon={t.icon} href={t.href}
                  badge={t.popular ? 'Popular' : t.isNew ? 'New' : undefined} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════
          BODY (hidden while searching)
      ══════════════════════════════════════════ */}
      {!isSearching && (
        <>
          {/* ── Popular Categories quick strip ── */}
          <section className="bg-white border-b border-gray-100 py-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Popular Categories</p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {QUICK_CATS.map(cat => {
                  const count = TOOLS.filter(t => t.category === cat.category).length;
                  return (
                    <button
                      key={cat.label}
                      onClick={() => handleQuickCat(cat.category)}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all hover:scale-105 hover:shadow-md ${cat.color}`}
                    >
                      <span className="text-2xl leading-none">{cat.emoji}</span>
                      <span className="text-xs font-bold text-center leading-tight">{cat.label}</span>
                      <span className="text-[10px] opacity-60">{count} tools</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── Favorites / Recently Used (personal) ── */}
          {(favoriteTools.length > 0 || recentlyUsed.length > 0) && (
            <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto w-full">
              {favoriteTools.length > 0 && (
                <div className="mb-10">
                  <SectionHeading sub="Tools you starred">⭐ Your Favorites</SectionHeading>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {favoriteTools.map(t => <ToolCard key={t.href} title={t.title} description={t.description} icon={t.icon} href={t.href} />)}
                  </div>
                </div>
              )}
              {recentlyUsed.length > 0 && (
                <div>
                  <SectionHeading sub="Pick up where you left off">🕐 Recently Used</SectionHeading>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {recentlyUsed.slice(0, 8).map(t => <ToolCard key={t.href} title={t.title} description={t.description} icon={t.icon} href={t.href} />)}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── Tool grid (tab-driven) ── */}
          <section ref={toolsSectionRef} className="py-10 px-4 md:px-8 max-w-7xl mx-auto w-full">

            {/* Tab: Browse Categories — full category browser */}
            {activeTab === 'categories' && (
              <>
                {activeCat ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <SectionHeading sub={`${categoryTools.length} tools in this category`}>
                        {ALL_CATEGORIES.find(c => c.name === activeCat)?.emoji} {activeCat}
                      </SectionHeading>
                      <button onClick={clearCatFilter} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl px-3 py-1.5 hover:border-gray-300 transition-colors">
                        <X className="w-3.5 h-3.5" /> All categories
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {categoryTools.map(t => (
                        <ToolCard key={t.href} title={t.title} description={t.description} icon={t.icon} href={t.href}
                          badge={t.popular ? 'Popular' : t.isNew ? 'New' : undefined} />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <SectionHeading sub="Tap a category to explore all tools inside">📂 All Categories</SectionHeading>
                    <div className="space-y-10">
                      {ALL_CATEGORIES.map(cat => {
                        const catTools = TOOLS.filter(t => t.category === cat.name);
                        return (
                          <div key={cat.name}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ring-1 ${cat.color} ${cat.ring}`}>
                                  {cat.emoji} {cat.name}
                                </span>
                                <span className="text-xs text-gray-400">{catTools.length} tools</span>
                              </div>
                              <button
                                onClick={() => setActiveCat(cat.name)}
                                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                              >
                                View all <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {catTools.slice(0, 4).map(t => (
                                <ToolCard key={t.href} title={t.title} description={t.description} icon={t.icon} href={t.href}
                                  badge={t.popular ? 'Popular' : t.isNew ? 'New' : undefined} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Tab: Popular / New / Featured */}
            {activeTab !== 'categories' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <SectionHeading
                    sub={
                      activeTab === 'popular'  ? 'The tools people reach for most' :
                      activeTab === 'new'      ? 'Fresh additions to the collection' :
                      'Hand-picked tools worth trying'
                    }
                  >
                    {activeTab === 'popular'  && '🔥 Most Popular Tools'}
                    {activeTab === 'new'      && '🆕 New Tools'}
                    {activeTab === 'featured' && '⭐ Featured Tools'}
                  </SectionHeading>
                  {activeTab === 'popular' && (
                    <button
                      onClick={() => { setActiveTab('categories'); setActiveCat(null); }}
                      className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tabTools.map(t => (
                    <ToolCard key={t.href} title={t.title} description={t.description} icon={t.icon} href={t.href}
                      badge={t.popular ? 'Popular' : t.isNew ? 'New' : undefined} />
                  ))}
                </div>
              </>
            )}
          </section>

          {/* ══════════════════════════════════════════
              TOOL OF THE DAY
          ══════════════════════════════════════════ */}
          {TOOL_OF_DAY && (
            <section className="px-4 md:px-8 py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="max-w-7xl mx-auto">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-5">⭐ Tool of the Day</p>
                <div className="bg-white rounded-3xl border border-blue-100 shadow-xl overflow-hidden">
                  <div className="grid md:grid-cols-2">
                    {/* Left: info */}
                    <div className="p-8 md:p-10 flex flex-col justify-center">
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                        <TOOL_OF_DAY.icon className="w-7 h-7 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-gray-900 mb-3">{TOOL_OF_DAY.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">{TOOL_OF_DAY.description}</p>
                      <Link
                        href={TOOL_OF_DAY.href}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 w-fit shadow-md"
                      >
                        Try Now <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                    {/* Right: decorative */}
                    <div
                      className="hidden md:flex items-center justify-center p-10"
                      style={{ background: 'linear-gradient(135deg,#2563eb 0%,#4f46e5 100%)', backgroundImage: DOT_PATTERN }}
                    >
                      <div className="w-28 h-28 bg-white/20 rounded-3xl flex items-center justify-center shadow-2xl">
                        <TOOL_OF_DAY.icon className="w-14 h-14 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════
              WHY TOOLBOX HUB
          ══════════════════════════════════════════ */}
          <section className="py-14 px-4 md:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">💙 Why ToolBox Hub?</p>
                <h2 className="text-2xl font-extrabold text-gray-900">Built for everyone. Built to last.</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {WHY.map(item => (
                  <div key={item.label} className="flex flex-col items-center text-center p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-colors">
                    <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-900 text-sm mb-1">✓ {item.label}</span>
                    <span className="text-xs text-gray-500 leading-relaxed">{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              OUR JOURNEY
          ══════════════════════════════════════════ */}
          <section className="py-12 px-4 md:px-8 bg-gray-50 border-y border-gray-100">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">📖 Our Journey</p>
              <h2 className="text-xl font-extrabold text-gray-900 mb-4">Started with one problem. Grew into 116+ solutions.</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xl mx-auto">
                ToolBox Hub began as a single-page tool to scratch an itch. One tool became ten. Ten became a hundred.
                Every tool on this site is free because we believe useful software shouldn't cost anything.
                We're just getting started.
              </p>
              <Link
                href="/vision"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-sm border border-blue-200 hover:border-blue-400 px-5 py-2.5 rounded-xl transition-all"
              >
                Read More <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              COMMUNITY
          ══════════════════════════════════════════ */}
          <section className="py-14 px-4 md:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">💬 Community</p>
                <h2 className="text-2xl font-extrabold text-gray-900">Help us build something great</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <a
                  href="mailto:hello@toolboxhub.app?subject=Tool+Suggestion"
                  className="group flex flex-col items-center text-center p-7 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="text-3xl mb-3">⭐</span>
                  <span className="font-bold text-gray-900 mb-1">Suggest a Tool</span>
                  <span className="text-xs text-gray-500">Got a tool idea? We'd love to hear it and might build it next.</span>
                </a>
                <a
                  href="mailto:hello@toolboxhub.app?subject=Feedback"
                  className="group flex flex-col items-center text-center p-7 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="text-3xl mb-3">💡</span>
                  <span className="font-bold text-gray-900 mb-1">Give Feedback</span>
                  <span className="text-xs text-gray-500">Something could be better? Your feedback shapes every update.</span>
                </a>
                <a
                  href="mailto:hello@toolboxhub.app?subject=Bug+Report"
                  className="group flex flex-col items-center text-center p-7 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="text-3xl mb-3">🐞</span>
                  <span className="font-bold text-gray-900 mb-1">Report a Bug</span>
                  <span className="text-xs text-gray-500">Found something broken? Help us fix it fast.</span>
                </a>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              START EXPLORING CTA
          ══════════════════════════════════════════ */}
          <section
            className="relative py-20 px-4 text-center overflow-hidden"
            style={{ backgroundImage: `${DOT_PATTERN}, linear-gradient(160deg,#1e3a8a 0%,#2563eb 100%)` }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">🚀 Start Exploring</h2>
            <p className="text-blue-200 text-base md:text-lg mb-8 max-w-md mx-auto">
              Everything You Need.&nbsp; One Website.&nbsp; Free Forever.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => { setActiveTab('popular'); scrollToTools(); }}
                className="px-7 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all hover:scale-105 shadow-md"
              >
                Browse All Tools
              </button>
              <button
                onClick={surpriseMe}
                className="px-7 py-3 bg-white/15 border border-white/30 text-white font-bold rounded-xl hover:bg-white/25 transition-all"
              >
                🎲 Surprise Me
              </button>
            </div>
          </section>

        </>
      )}
    </div>
  );
}
