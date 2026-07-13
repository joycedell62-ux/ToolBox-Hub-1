import React, { useState, useRef } from 'react';
import {
  Search, ShieldAlert, QrCode, FileText, Activity, Calendar,
  TrendingUp, Percent, Tag, CaseSensitive, Shuffle, X,
  Zap, Lock, Smartphone, Gift, ChevronRight, Award, ClipboardList, Receipt,
  // PDF Tools icons
  Layers, Scissors, Minimize2, FileCode, FileOutput, FileImage,
  Image, RotateCcw, Unlock, ShieldCheck,
  // Image Tools icons
  Maximize2, Crop, ArrowLeftRight, Images, Stamp,
  LayoutGrid, Pipette, Focus,
  // New tool icons
  Flame, Dumbbell, Baby, Heart, DollarSign, Landmark, Coins, Lightbulb,
  ShoppingBag, Utensils, CalendarDays, CheckSquare, ListTodo, Clipboard, Star,
  BookOpen, Replace, Filter, ArrowUpDown, StickyNote, FileText as FileText2,
  Code, Binary, Link2, Shield, Fingerprint,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import { TOOLS, CATEGORIES } from '../lib/tools';
import type { Tool } from '../lib/tools';

// ─── Tool registry ────────────────────────────────────────────────────────────


// ─── Hero background dot pattern ──────────────────────────────────────────────

const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='white' fill-opacity='0.08'/%3E%3C/svg%3E")`;

// ─── Stat items ───────────────────────────────────────────────────────────────

const STATS = [
  { icon: Gift,       label: '63+ Free Tools',  sub: 'Always free, no limits' },
  { icon: Lock,       label: 'No Sign-up',       sub: 'Use instantly, no account' },
  { icon: Zap,        label: 'Instant Results',  sub: 'Everything runs in browser' },
  { icon: Smartphone, label: 'Mobile Ready',     sub: 'Works on any device' },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const toolsSectionRef = useRef<HTMLElement>(null);

  const isSearching = searchQuery.trim().length > 0;

  const filteredTools = isSearching
    ? TOOLS.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const popularTools  = TOOLS.filter((t) => t.popular);
  const recentTools   = TOOLS.filter((t) => t.isNew);

  const scrollToTools = () => {
    toolsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col">

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #3b82f6 100%)',
        }}
      >
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: DOT_PATTERN }}
          aria-hidden="true"
        />
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(147,197,253,0.15) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-blue-100 text-xs font-semibold px-4 py-2 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
            63+ Free Tools Available — No sign-up required
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-75">
            ToolBox&nbsp;
            <span
              style={{
                background: 'linear-gradient(90deg, #93c5fd, #c4b5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Hub
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
            Free online tools to make everyday tasks faster and easier.
            <br className="hidden sm:block" />
            No downloads, no accounts — just open and use.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              id="hero-search"
              aria-label="Search tools"
              placeholder="Search tools — try &quot;password&quot; or &quot;calculator&quot;…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-13 pr-12 py-4 bg-white rounded-2xl text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-4 focus:ring-blue-300/50 shadow-2xl text-base transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-r-2xl"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* CTAs */}
          {!isSearching && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <button
                onClick={scrollToTools}
                className="px-7 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50
                           shadow-lg shadow-black/10 transition-all duration-200 hover:scale-105 active:scale-100 text-sm"
              >
                Get Started
              </button>
              <button
                onClick={scrollToTools}
                className="px-7 py-3.5 bg-white/10 backdrop-blur-sm border border-white/25 text-white font-semibold
                           rounded-xl hover:bg-white/20 transition-all duration-200 text-sm"
              >
                Browse All Tools
              </button>
            </div>
          )}
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none" aria-hidden="true">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40Z" fill="hsl(210 40% 98%)" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SEARCH RESULTS (overlay when searching)
      ══════════════════════════════════════════════════════════ */}
      {isSearching && (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10">
          {filteredTools.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-5">
                {filteredTools.length} result{filteredTools.length !== 1 ? 's' : ''} for&nbsp;
                <strong className="text-gray-800">"{searchQuery}"</strong>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTools.map((t) => (
                  <ToolCard
                    key={t.href}
                    title={t.title}
                    description={t.description}
                    icon={t.icon}
                    href={t.href}
                    badge={t.popular ? 'Popular' : t.isNew ? 'New' : undefined}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-gray-600 font-medium mb-1">No tools found for "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground mb-4">Try a different keyword like "word", "BMI", or "QR"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:underline font-medium text-sm"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          BODY — hidden while searching
      ══════════════════════════════════════════════════════════ */}
      {!isSearching && (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20 space-y-20">

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10">
            {STATS.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-start gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-100 transition-all duration-200"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm leading-tight">{label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Popular Tools ── */}
          <section>
            <SectionHeader
              title="Popular Tools"
              subtitle="The tools people reach for most"
              emoji="⭐"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
              {popularTools.map((t) => (
                <ToolCard
                  key={t.href}
                  title={t.title}
                  description={t.description}
                  icon={t.icon}
                  href={t.href}
                  badge="Popular"
                  size="featured"
                />
              ))}
            </div>
          </section>

          {/* ── Recently Added ── */}
          <section>
            <SectionHeader
              title="Recently Added"
              subtitle="Fresh tools just landed"
              emoji="✨"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
              {recentTools.map((t) => (
                <ToolCard
                  key={t.href}
                  title={t.title}
                  description={t.description}
                  icon={t.icon}
                  href={t.href}
                  badge="New"
                />
              ))}
            </div>
          </section>

          {/* ── Browse by Category ── */}
          <section ref={toolsSectionRef} id="tools">
            <SectionHeader
              title="Browse by Category"
              subtitle="All tools, organised for you"
              emoji="🗂️"
            />

            <div className="space-y-14 mt-8">
              {CATEGORIES.map((cat) => {
                const tools = TOOLS.filter((t) => t.category === cat.name);
                if (!tools.length) return null;
                return (
                  <div key={cat.name}>
                    {/* Category pill header */}
                    <div className="flex items-center gap-3 mb-5">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${cat.color} ${cat.bg} ${cat.border}`}
                      >
                        <span aria-hidden="true">{cat.emoji}</span>
                        {cat.name}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {tools.length} tool{tools.length !== 1 ? 's' : ''}
                      </span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {tools.map((t) => (
                        <ToolCard
                          key={t.href}
                          title={t.title}
                          description={t.description}
                          icon={t.icon}
                          href={t.href}
                          badge={t.popular ? 'Popular' : t.isNew ? 'New' : undefined}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Footer CTA ── */}
          <section className="relative overflow-hidden rounded-3xl"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: DOT_PATTERN }}
              aria-hidden="true"
            />
            <div className="relative text-center px-6 py-14 space-y-5">
              <p className="text-3xl font-extrabold text-white">More tools coming soon</p>
              <p className="text-blue-200 text-base max-w-md mx-auto">
                We're constantly adding new free tools. Bookmark this page so you don't miss anything.
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-300 text-sm font-medium">
                <ChevronRight className="w-4 h-4" />
                All tools are free forever
              </div>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, emoji }: { title: string; subtitle: string; emoji: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl" aria-hidden="true">{emoji}</span>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

