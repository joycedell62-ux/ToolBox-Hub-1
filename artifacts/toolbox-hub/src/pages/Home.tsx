import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, X, ChevronRight, ArrowRight,
  Star, Flame, Clock, Sparkles,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { TOOLS, getToolByHref } from '../lib/tools';
import type { Tool, Category } from '../lib/tools';
import { useFavorites, useRecentlyUsed } from '../lib/toolPrefs';

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */

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

const STAT_CARDS = [
  { icon: '🛠️', num: 116, suffix: '+', label: 'Free Tools',    color: 'text-blue-600',    ring: 'ring-blue-100',    bg: 'bg-blue-50'    },
  { icon: '⚡', num: 0,   suffix: '',  label: 'Instant Results', color: 'text-amber-600',   ring: 'ring-amber-100',   bg: 'bg-amber-50',   text: '⚡' },
  { icon: '🔒', num: 0,   suffix: '',  label: 'Secure & Private', color: 'text-green-600',   ring: 'ring-green-100',   bg: 'bg-green-50',   text: '100%' },
  { icon: '📱', num: 0,   suffix: '',  label: 'Mobile Friendly',  color: 'text-violet-600',  ring: 'ring-violet-100',  bg: 'bg-violet-50',  text: '✓' },
];

const CATEGORY_CARDS: { emoji: string; label: string; cat: Category; grad: string; count: number }[] = [
  { emoji: '📄', label: 'PDF',       cat: 'PDF Tools',          grad: 'from-red-500    to-orange-400',  count: TOOLS.filter(t => t.category === 'PDF Tools').length          },
  { emoji: '🖼️', label: 'Images',    cat: 'Image Tools',         grad: 'from-violet-500 to-purple-400',  count: TOOLS.filter(t => t.category === 'Image Tools').length        },
  { emoji: '💻', label: 'Developer', cat: 'Developer Tools',     grad: 'from-slate-600  to-slate-400',   count: TOOLS.filter(t => t.category === 'Developer Tools').length    },
  { emoji: '💼', label: 'Business',  cat: 'Marketing Tools',     grad: 'from-cyan-500   to-teal-400',    count: TOOLS.filter(t => t.category === 'Marketing Tools').length    },
  { emoji: '✍️', label: 'Writing',   cat: 'Writing Generators',  grad: 'from-pink-500   to-rose-400',    count: TOOLS.filter(t => t.category === 'Writing Generators').length },
  { emoji: '🎨', label: 'Design',    cat: 'Branding & Design',   grad: 'from-fuchsia-500 to-pink-400',   count: TOOLS.filter(t => t.category === 'Branding & Design').length  },
  { emoji: '🎓', label: 'Student',   cat: 'Calculators',         grad: 'from-indigo-500 to-blue-400',    count: TOOLS.filter(t => t.category === 'Calculators').length        },
  { emoji: '😂', label: 'Fun',       cat: 'Fun & Lifestyle',     grad: 'from-amber-500  to-yellow-400',  count: TOOLS.filter(t => t.category === 'Fun & Lifestyle').length    },
  { emoji: '❤️', label: 'Lifestyle', cat: 'Daily Life',          grad: 'from-teal-500   to-emerald-400', count: TOOLS.filter(t => t.category === 'Daily Life').length         },
];

const POPULAR_HREFS = [
  '/qr-code-generator',
  '/resume-builder',
  '/certificate-generator',
  '/logo-generator',
  '/password-generator',
  '/pdf-merge',
  '/image-compressor',
  '/invoice-generator',
];

const RECENT_SPEC_HREFS = [
  '/resume-builder',
  '/logo-generator',
  '/invoice-generator',
  '/business-name-generator',
  '/birthday-reminder',
  '/daily-fortune',
];

const JOURNEY_STEPS = [
  { icon: '💡', title: 'The Idea',          sub: 'What if one website could provide hundreds of useful tools for everyone — for free?'                  },
  { icon: '🛠️', title: 'First Tool',        sub: 'We built our very first tool and shared it with the world. People loved it.'                          },
  { icon: '🚀', title: '116+ Tools',        sub: 'Today ToolBox Hub has 116+ free online tools used every day by people around the world.'              },
  { icon: '🌍', title: 'Growing Every Day', sub: 'Every day we add new tools and improve existing ones. We\'re just getting started.'                   },
];

const COLLECTIONS = [
  { title: 'For Writers',   desc: 'Essays, stories, scripts & letters.',  grad: 'from-blue-600 to-indigo-700',    emoji: '✍️', cta: '/word-counter',           chips: ['Word Counter','Essay Generator','Story Generator']     },
  { title: 'For Designers', desc: 'Logos, palettes, brand kits & more.',  grad: 'from-fuchsia-600 to-violet-700', emoji: '🎨', cta: '/color-palette-generator', chips: ['Color Palette','Logo Generator','Font Pairing']        },
  { title: 'Get Work Done', desc: 'PDF, images, QR codes & passwords.',   grad: 'from-slate-700 to-slate-900',    emoji: '⚡', cta: '/pdf-merge',               chips: ['PDF Merge','Image Resizer','QR Code Generator']       },
];

const POP = TOOLS.filter(t => t.popular);
const TOD = POP[Math.floor(Date.now() / 86_400_000) % POP.length];

/* ─────────────────────────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────────────────────────── */

function useInView(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCountUp(end: number, duration = 1400, active = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || end === 0) return;
    let raf: number;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, active]);
  return val;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────────────────────── */

function AnimatedNum({ end, suffix, active }: { end: number; suffix: string; active: boolean }) {
  const n = useCountUp(end, 1400, active);
  return <>{end > 0 ? `${n}${suffix}` : suffix}</>;
}

/** Large card for the 8 featured "Most Popular" tools */
function PopularCard({ tool }: { tool: Tool }) {
  const grad = CAT_COLOR[tool.category] ?? 'from-blue-400 to-blue-700';
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(tool.href);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-2xl hover:shadow-slate-200/80 hover:-translate-y-2 hover:border-slate-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Gradient top strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${grad}`} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Icon + Fav */}
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <tool.icon className="w-6 h-6 text-white drop-shadow-sm" />
          </div>
          <button
            aria-label={fav ? 'Unfavourite' : 'Favourite'}
            onClick={() => toggleFavorite(tool.href)}
            className={`p-1.5 rounded-lg transition-colors ${fav ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
          >
            <Star className={`w-4 h-4 ${fav ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Text */}
        <div className="flex-1">
          <h3 className="font-extrabold text-slate-900 text-sm mb-1.5 group-hover:text-blue-700 transition-colors leading-snug">{tool.title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{tool.description}</p>
        </div>

        {/* CTA Button */}
        <Link href={tool.href}
          className="block w-full text-center text-xs font-bold py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700
            group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
          Open Tool →
        </Link>
      </div>
    </div>
  );
}

/** Compact card for search results / recent / new tools */
function FeedCard({ tool }: { tool: Tool }) {
  const grad = CAT_COLOR[tool.category] ?? 'from-blue-400 to-blue-700';
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(tool.href);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 hover:-translate-y-1.5 hover:border-slate-200 transition-all duration-300 flex flex-col overflow-hidden">
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
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{tool.description}</p>
        </div>
        <div className="flex items-center gap-1 text-blue-500 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          Open <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

function SectionHead({ icon, label, sub, badge, action, onAction }: {
  icon: React.ReactNode; label: string; sub?: string;
  badge?: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="flex items-end justify-between mb-7 gap-3 flex-wrap">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl leading-none">{icon}</span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{label}</h2>
          {badge && <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{badge}</span>}
        </div>
        {sub && <p className="text-sm text-slate-500">{sub}</p>}
      </div>
      {action && onAction && (
        <button onClick={onAction} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
          {action} <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */

export default function Home() {
  const [query,       setQuery]       = useState('');
  const [activeCat,   setActiveCat]   = useState<Category | null>(null);
  const [showAll,     setShowAll]     = useState(false);
  const [feedVote,    setFeedVote]    = useState<string | null>(() => {
    try { return localStorage.getItem('tbh_feedback_v1'); } catch { return null; }
  });
  const [, navigate] = useLocation();
  const searchRef    = useRef<HTMLInputElement>(null);

  const { favorites }  = useFavorites();
  const recentHrefs    = useRecentlyUsed();
  const favTools       = useMemo(() => favorites.map(getToolByHref).filter(Boolean) as Tool[], [favorites]);
  const recentTools    = useMemo(() => recentHrefs.map(getToolByHref).filter(Boolean) as Tool[], [recentHrefs]);

  // Stats IntersectionObserver
  const { ref: statsRef, inView: statsInView } = useInView(0.3);

  const isSearching = query.trim().length > 0;

  const searchResults = useMemo(() =>
    isSearching ? TOOLS.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase()) ||
      t.category.toLowerCase().includes(query.toLowerCase())
    ) : [], [query]);

  const popularTools = useMemo(
    () => POPULAR_HREFS.map(h => getToolByHref(h)).filter(Boolean) as Tool[],
    []
  );

  const recentTools6 = useMemo(() => {
    const spec   = RECENT_SPEC_HREFS.map(h => getToolByHref(h)).filter(Boolean) as Tool[];
    const newOnes = TOOLS.filter(t => t.isNew && !RECENT_SPEC_HREFS.includes(t.href));
    const all    = [...spec];
    for (const t of newOnes) { if (all.length >= 12) break; if (!all.find(x => x.href === t.href)) all.push(t); }
    return showAll ? all : all.slice(0, 6);
  }, [showAll]);

  const catTools = useMemo(() =>
    activeCat ? TOOLS.filter(t => t.category === activeCat) : [], [activeCat]);

  const surpriseMe = () => navigate(TOOLS[Math.floor(Math.random() * TOOLS.length)].href);

  const scrollTo = (id: string) =>
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);

  const pickCat = (cat: Category) => {
    setActiveCat(cat);
    setQuery('');
    scrollTo('cat-results');
  };

  const vote = (v: string) => {
    setFeedVote(v);
    try { localStorage.setItem('tbh_feedback_v1', v); } catch {}
  };

  return (
    <>
      <style>{`
        @keyframes floatA{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-24px) rotate(6deg)}}
        @keyframes floatB{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(-5deg)}}
        .fA{animation:floatA 7s ease-in-out infinite}
        .fB{animation:floatB 9s ease-in-out infinite 1.5s}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <div className="flex flex-col -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 md:-mt-12">

        {/* ══════════════════════════════════════════════════════
            1 ▸ HERO
        ══════════════════════════════════════════════════════ */}
        <section
          className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-10 md:pt-16 md:pb-12 text-center overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#dbeafe 0%,#eff6ff 35%,#ffffff 65%)' }}
        >
          {/* Subtle ambient blobs */}
          <div className="fA absolute -top-24 -left-24 w-80 h-80 bg-blue-200/25 rounded-full blur-3xl pointer-events-none" />
          <div className="fB absolute -top-12 -right-24 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

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

          {/* Category chips */}
          <div className="mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="flex gap-2 w-max mx-auto pb-1">
                {CHIPS.map(c => (
                  <button key={c.label}
                    onClick={() => activeCat === c.cat ? setActiveCat(null) : pickCat(c.cat)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:scale-105 hover:shadow-sm select-none ${
                      activeCat === c.cat
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : c.chip
                    }`}>
                    <span className="text-base leading-none">{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            2 ▸ STATS (animated on scroll)
        ══════════════════════════════════════════════════════ */}
        <section ref={statsRef} className="px-4 sm:px-6 lg:px-8 py-10 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CARDS.map((s, i) => (
              <div key={s.label}
                className={`flex flex-col items-center text-center p-6 rounded-2xl ${s.bg} border ring-4 ${s.ring} hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="text-3xl mb-2 leading-none">{s.icon}</div>
                <div className={`text-3xl md:text-4xl font-extrabold mb-1 ${s.color} tabular-nums`}>
                  {i === 0
                    ? <AnimatedNum end={s.num} suffix={s.suffix} active={statsInView} />
                    : <span>{s.text}</span>
                  }
                </div>
                <div className="text-xs font-semibold text-slate-600">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SEARCH RESULTS (overlay)
        ══════════════════════════════════════════════════════ */}
        {isSearching && (
          <section className="px-4 sm:px-6 lg:px-8 py-10 bg-white">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-extrabold text-slate-900 text-xl mb-5">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for <span className="text-blue-600">"{query}"</span>
              </h2>
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

        {/* ══════════════════════════════════════════════════════
            CATEGORY FILTER (overlay)
        ══════════════════════════════════════════════════════ */}
        {!isSearching && activeCat && (
          <section id="cat-results" className="px-4 sm:px-6 lg:px-8 py-10 bg-slate-50">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <h2 className="font-extrabold text-slate-900 text-xl flex-1">
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

        {/* ══════════════════════════════════════════════════════
            MAIN SECTIONS (hidden while searching/filtering)
        ══════════════════════════════════════════════════════ */}
        {!isSearching && !activeCat && (
          <>
            {/* Favs + Recent */}
            {(favTools.length > 0 || recentTools.length > 0) && (
              <section className="px-4 sm:px-6 lg:px-8 py-8 bg-white border-b border-slate-100">
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

            {/* ══════════════════════════════════════════════
                3 ▸ 🔥 MOST POPULAR
            ══════════════════════════════════════════════ */}
            <section id="sec-popular" className="px-4 sm:px-6 lg:px-8 py-12 bg-white">
              <div className="max-w-6xl mx-auto">
                <SectionHead
                  icon={<Flame className="w-5 h-5 text-orange-500" />}
                  label="Most Popular"
                  sub="The tools people open every single day."
                  badge="Trending"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {popularTools.map(t => <FeedCard key={t.href} tool={t} />)}
                </div>
              </div>
            </section>

            <div className="h-px mx-4 sm:mx-6 lg:mx-8 bg-slate-100" />

            {/* ══════════════════════════════════════════════
                4 ▸ TOOL CATEGORIES
            ══════════════════════════════════════════════ */}
            <section className="px-4 sm:px-6 lg:px-8 py-12 bg-slate-50">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">Browse by Category</p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Find the right tool, fast.</h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {CATEGORY_CARDS.map(c => (
                    <button key={c.label} onClick={() => pickCat(c.cat)}
                      className="group flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 cursor-pointer">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.grad} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-2xl leading-none">{c.emoji}</span>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-slate-900 text-xs">{c.label}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{c.count} tools</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div className="h-px mx-4 sm:mx-6 lg:mx-8 bg-slate-100" />

            {/* ══════════════════════════════════════════════
                5 ▸ COLLECTIONS
            ══════════════════════════════════════════════ */}
            <section className="px-4 sm:px-6 lg:px-8 py-12 bg-white">
              <div className="max-w-6xl mx-auto">
                <SectionHead
                  icon={<Sparkles className="w-5 h-5 text-violet-500" />}
                  label="Curated Collections"
                  sub="Handpicked sets for how you actually work."
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {COLLECTIONS.map(col => (
                    <Link key={col.title} href={col.cta}
                      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${col.grad} p-7 text-white group hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 block`}>
                      <div className="absolute -right-6 -bottom-6 text-9xl opacity-[0.07] select-none pointer-events-none leading-none">{col.emoji}</div>
                      <div className="text-4xl mb-3">{col.emoji}</div>
                      <h3 className="font-extrabold text-lg mb-1">{col.title}</h3>
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

            {/* ══════════════════════════════════════════════
                6 ▸ WHY TOOLBOX HUB
            ══════════════════════════════════════════════ */}
            <section className="px-4 sm:px-6 lg:px-8 py-14 bg-slate-50 border-y border-slate-100">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">Why ToolBox Hub?</p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Built for everyone. Built to last.</h2>
                  <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">Great tools should be free, fast, and private. That's the whole idea.</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { emoji: '⚡', label: 'Fast',           sub: 'Generate results instantly. No waiting, no loading.',  grad: 'from-amber-400 to-orange-500', bg: 'bg-amber-50 border-amber-100' },
                    { emoji: '🔒', label: 'Secure',         sub: 'Everything runs safely in your browser. Nothing is uploaded.', grad: 'from-green-400 to-emerald-600', bg: 'bg-green-50 border-green-100' },
                    { emoji: '📱', label: 'Mobile Friendly', sub: 'Perfect on phones and desktops alike.',               grad: 'from-violet-400 to-purple-600', bg: 'bg-violet-50 border-violet-100' },
                    { emoji: '💙', label: 'Free Forever',   sub: 'No sign-up. No hidden fees. Free today and always.',  grad: 'from-blue-400 to-blue-700',    bg: 'bg-blue-50 border-blue-100'   },
                  ].map(w => (
                    <div key={w.label} className={`flex flex-col items-center text-center p-7 rounded-2xl border ${w.bg} hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300`}>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${w.grad} flex items-center justify-center mb-4 shadow-lg`}>
                        <span className="text-2xl leading-none">{w.emoji}</span>
                      </div>
                      <p className="font-extrabold text-slate-900 text-base mb-2">{w.label}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{w.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════
                7 ▸ TOOL OF THE DAY
            ══════════════════════════════════════════════ */}
            {TOD && (
              <section className="px-4 sm:px-6 lg:px-8 py-12 bg-white">
                <div className="max-w-6xl mx-auto">
                  <SectionHead icon="⭐" label="Tool of the Day" sub="A fresh spotlight every morning — try something new." />
                  <div className="rounded-3xl border border-blue-100 shadow-2xl shadow-blue-50 overflow-hidden grid md:grid-cols-5">
                    <div className="md:col-span-3 p-8 md:p-12 bg-white flex flex-col justify-center">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${CAT_COLOR[TOD.category] ?? 'from-blue-500 to-indigo-600'} flex items-center justify-center mb-5 shadow-lg`}>
                        <TOD.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">⭐ Today's Pick</div>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">{TOD.title}</h3>
                      <p className="text-slate-500 leading-relaxed mb-6 max-w-sm">{TOD.description}</p>
                      <div className="flex flex-wrap gap-3">
                        <Link href={TOD.href}
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-md shadow-blue-200">
                          Try Now <ArrowRight className="w-4 h-4" />
                        </Link>
                        <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 font-semibold">
                          ✓ No account needed
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:flex md:col-span-2 items-center justify-center p-10 relative overflow-hidden"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='white' fill-opacity='0.07'/%3E%3C/svg%3E"), linear-gradient(135deg,#2563eb 0%,#4f46e5 100%)` }}>
                      <div className="w-32 h-32 bg-white/15 rounded-3xl flex items-center justify-center shadow-2xl ring-1 ring-white/20">
                        <TOD.icon className="w-16 h-16 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <div className="h-px mx-4 sm:mx-6 lg:mx-8 bg-slate-100" />

            {/* ══════════════════════════════════════════════
                8 ▸ RECENTLY ADDED
            ══════════════════════════════════════════════ */}
            <section id="sec-new" className="px-4 sm:px-6 lg:px-8 py-12 bg-slate-50">
              <div className="max-w-6xl mx-auto">
                <SectionHead
                  icon="🆕"
                  label="Recently Added"
                  sub="Fresh tools just shipped — be the first to try them."
                  badge="New"
                  action={showAll ? undefined : 'Show all'}
                  onAction={() => setShowAll(true)}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {recentTools6.map(t => (
                    <div key={t.href} className="relative">
                      <FeedCard tool={t} />
                      {t.isNew && (
                        <span className="absolute top-3 left-3 z-[3] text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                          New
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════
                9 ▸ OUR JOURNEY (timeline)
            ══════════════════════════════════════════════ */}
            <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">Our Journey</p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Started with one tool.<br />Growing into something bigger.
                  </h2>
                  <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
                    ToolBox Hub started as a simple idea: What if one website could provide hundreds of useful tools for everyone — for free? Today that idea is becoming reality.
                  </p>
                </div>

                {/* Timeline */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-400 to-violet-400 md:-translate-x-px" />

                  <div className="space-y-8 md:space-y-0">
                    {JOURNEY_STEPS.map((step, i) => {
                      const isRight = i % 2 === 0;
                      return (
                        <div key={step.title} className={`relative flex items-start gap-4 md:gap-0 ${isRight ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                          {/* Dot */}
                          <div className="relative z-10 flex-shrink-0 ml-0 md:absolute md:left-1/2 md:-translate-x-1/2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-4 ring-white text-2xl leading-none">
                              {step.icon}
                            </div>
                          </div>

                          {/* Content card */}
                          <div className={`flex-1 md:w-[calc(50%-48px)] ${isRight ? 'md:pr-16 md:text-right' : 'md:pl-16 md:ml-auto'}`}>
                            <div className="ml-4 md:ml-0 bg-white rounded-2xl border border-slate-100 shadow-md p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 md:mb-8">
                              <h3 className="font-extrabold text-slate-900 text-base mb-1">{step.title}</h3>
                              <p className="text-sm text-slate-500 leading-relaxed">{step.sub}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Brand story */}
                <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <p className="text-slate-700 leading-relaxed mb-2">
                    Every tool we build brings us closer to becoming one of the world's most trusted collections of free online tools.
                  </p>
                  <p className="font-extrabold text-blue-700 text-lg">
                    Everything You Need. One Website. Free Forever.
                  </p>
                  <div className="mt-5">
                    <Link href="/vision"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold border border-blue-200 hover:border-blue-400 bg-white px-6 py-3 rounded-xl transition-all hover:shadow-md text-sm">
                      Read our full story <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════
                10 ▸ FEEDBACK
            ══════════════════════════════════════════════ */}
            <section className="px-4 sm:px-6 lg:px-8 py-12 bg-slate-50 border-t border-slate-100">
              <div className="max-w-lg mx-auto text-center">
                <div className="text-3xl mb-3">⭐</div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-1">Was this page helpful?</h2>
                <p className="text-sm text-slate-500 mb-6">Your feedback shapes what we build next.</p>

                {feedVote ? (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="text-3xl mb-2">🙏</div>
                    <p className="font-bold text-slate-900">Thanks for your feedback!</p>
                    <p className="text-sm text-slate-500 mt-1">We read every response and use it to improve.</p>
                  </div>
                ) : (
                  <div className="flex justify-center gap-3 mb-6">
                    {[
                      { v: 'yes',   label: '😀 Yes',   bg: 'hover:bg-green-50  hover:border-green-300  hover:text-green-700'  },
                      { v: 'maybe', label: '😐 Maybe', bg: 'hover:bg-amber-50   hover:border-amber-300  hover:text-amber-700' },
                      { v: 'no',    label: '🙁 No',    bg: 'hover:bg-red-50    hover:border-red-300    hover:text-red-700'    },
                    ].map(btn => (
                      <button key={btn.v} onClick={() => vote(btn.v)}
                        className={`flex-1 sm:flex-none px-6 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 text-sm transition-all hover:scale-105 hover:shadow-md ${btn.bg}`}>
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                  <a href="mailto:hello@toolboxhub.app?subject=Tool+Suggestion"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold rounded-xl transition-all text-sm">
                    💡 Suggest a Tool
                  </a>
                  <a href="mailto:hello@toolboxhub.app?subject=Bug+Report"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold rounded-xl transition-all text-sm">
                    🐞 Report a Bug
                  </a>
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════
                CTA
            ══════════════════════════════════════════════ */}
            <section className="relative overflow-hidden py-20 px-4 text-center"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='white' fill-opacity='0.06'/%3E%3C/svg%3E"), linear-gradient(135deg,#1e3a8a 0%,#2563eb 55%,#4f46e5 100%)` }}>
              <div className="absolute inset-0 pointer-events-none">
                <div className="fA absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl" />
                <div className="fB absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 bg-indigo-400/15 rounded-full blur-3xl" />
              </div>
              <div className="relative max-w-lg mx-auto">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3 leading-tight">
                  Everything You Need.<br />One Website. Free Forever. 💙
                </h2>
                <p className="text-blue-200 text-base mb-8">116+ tools, zero cost, no sign-up required.</p>
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
    </>
  );
}
