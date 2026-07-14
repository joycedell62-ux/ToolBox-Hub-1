import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Wrench, Home, ChevronRight, Info, Shuffle } from 'lucide-react';
import { getToolByHref, TOOLS } from '../lib/tools';
import { pushRecent } from '../lib/toolPrefs';
import GlobalSearch from './GlobalSearch';
import ToolActionBar from './ToolActionBar';

const APP_VERSION = 'v2.0';

const STATIC_TITLES: Record<string, string> = {
  '/about': 'About',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Use',
  '/vision': 'Our Vision',
};

const mailto = (subject: string) =>
  `mailto:hello@toolboxhub.app?subject=${encodeURIComponent(subject)}`;

// ─── Launch banner ────────────────────────────────────────────────────────────
const BANNER_KEY = 'tbh_launch_v2_dismissed';

function LaunchBanner() {
  const [visible, setVisible] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    try { setVisible(!localStorage.getItem(BANNER_KEY)); }
    catch { setVisible(true); }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(BANNER_KEY, '1'); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="banner"
      className="relative flex items-center justify-center gap-3 px-4 py-2.5 text-white text-sm font-semibold overflow-hidden"
      style={{ backgroundImage: 'linear-gradient(135deg,#1d4ed8 0%,#2563eb 45%,#4f46e5 100%)' }}
    >
      {/* shine */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 pointer-events-none" />

      <span className="text-base leading-none">🚀</span>
      <span className="tracking-wide">
        <span className="font-extrabold">TOOLBOX HUB IS LIVE!</span>
        <span className="mx-2 opacity-60">·</span>
        <span className="font-medium opacity-90">116+ FREE TOOLS</span>
      </span>

      <button
        onClick={() => { dismiss(); navigate('/'); }}
        className="flex items-center gap-1 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-sm"
      >
        Explore Now →
      </button>

      <button
        onClick={dismiss}
        aria-label="Dismiss banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full opacity-60 hover:opacity-100 hover:bg-white/20 transition-all"
      >
        <span className="text-base leading-none">×</span>
      </button>
    </div>
  );
}

// ─── Floating Surprise Me button ──────────────────────────────────────────────
function FloatButton() {
  const [, navigate] = useLocation();
  const [pop, setPop] = useState(false);

  const go = () => {
    setPop(true);
    setTimeout(() => setPop(false), 300);
    navigate(TOOLS[Math.floor(Math.random() * TOOLS.length)].href);
  };

  return (
    <button
      onClick={go}
      aria-label="Open a random tool"
      className={`fixed bottom-6 right-5 z-50 flex items-center gap-2 text-white font-bold text-sm px-4 py-3 rounded-2xl shadow-xl transition-all duration-300
        hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/30 active:scale-95
        ${pop ? 'scale-110' : 'scale-100'}`}
      style={{ backgroundImage: 'linear-gradient(135deg,#2563eb 0%,#4f46e5 100%)' }}
    >
      <span className={`text-lg leading-none transition-transform duration-300 ${pop ? 'rotate-180' : ''}`}>🎲</span>
      <span className="hidden sm:inline">Surprise Me</span>
    </button>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isHome  = location === '/';
  const isAbout = location === '/about';
  const tool    = getToolByHref(location);
  const pageTitle = tool?.title ?? STATIC_TITLES[location] ?? 'Tool';

  useEffect(() => {
    if (getToolByHref(location)) pushRecent(location);
  }, [location]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">

      {/* Launch announcement banner */}
      <LaunchBanner />

      {/* ── Header ── */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-500 shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity flex-shrink-0">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg">
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="font-bold text-base sm:text-lg tracking-tight hidden min-[400px]:inline">ToolBox Hub</span>
            </Link>

            <div className="flex-1 flex justify-end sm:justify-center min-w-0">
              <GlobalSearch />
            </div>

            <nav className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              {!isHome && (
                <Link href="/"
                  className="flex items-center gap-1.5 text-blue-50 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium px-2 sm:px-3 py-2 rounded-lg"
                  aria-label="Home">
                  <Home className="w-4 h-4" />
                  <span className="hidden md:inline">Home</span>
                </Link>
              )}
              <Link href="/about"
                aria-label="About"
                className={`flex items-center gap-1.5 text-sm font-medium px-2 sm:px-3 py-2 rounded-lg transition-colors ${
                  isAbout ? 'bg-white/20 text-white' : 'text-blue-50 hover:text-white hover:bg-white/10'
                }`}>
                <Info className="w-4 h-4" />
                <span className="hidden md:inline">About</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col">
        {!isHome && !isAbout && (
          <div className="bg-blue-50/50 border-b border-blue-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                <span className="text-foreground font-medium">{pageTitle}</span>
              </div>
              {tool && <ToolActionBar href={tool.href} title={tool.title} />}
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full flex-1 flex flex-col">
          {children}

          {tool && (
            <div className="mt-12 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 sm:p-8 text-center">
              <p className="font-bold text-gray-900">💙 Thank you for using ToolBox Hub!</p>
              <p className="text-sm text-gray-600 mt-1.5 max-w-lg mx-auto leading-relaxed">
                We're constantly adding new tools and improving existing ones.
                If you have an idea or feedback, we'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                <a href={mailto('Tool suggestion — ToolBox Hub')}
                  className="w-full sm:w-auto px-5 py-2 bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-700 font-medium rounded-xl transition-colors text-sm">
                  💡 Suggest a Tool
                </a>
                <a href={mailto('Feedback — ToolBox Hub')}
                  className="w-full sm:w-auto px-5 py-2 bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-700 font-medium rounded-xl transition-colors text-sm">
                  💬 Give Feedback
                </a>
                <Link href="/"
                  className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
                  🚀 Explore More Tools
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">ToolBox Hub</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Free online tools that run entirely in your browser. No downloads, no accounts, no limits.
              </p>
            </div>

            {/* Explore */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Explore</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">All Tools</Link></li>
                <li><Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link></li>
                <li><Link href="/vision" className="text-gray-600 hover:text-blue-600 transition-colors">Our Journey</Link></li>
                <li><span className="text-gray-400 text-xs italic">Roadmap — coming soon</span></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Community</h3>
              <ul className="space-y-2 text-sm">
                <li><a href={mailto('Feedback — ToolBox Hub')} className="text-gray-600 hover:text-blue-600 transition-colors">Give Feedback</a></li>
                <li><a href={mailto('Tool suggestion — ToolBox Hub')} className="text-gray-600 hover:text-blue-600 transition-colors">Suggest a Tool</a></li>
                <li><a href={mailto('Contact — ToolBox Hub')} className="text-gray-600 hover:text-blue-600 transition-colors">Contact Us</a></li>
                <li><a href={mailto('Bug Report — ToolBox Hub')} className="text-gray-600 hover:text-blue-600 transition-colors">Report a Bug</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">Terms of Use</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <span>© {new Date().getFullYear()} ToolBox Hub — Free tools for everyone.</span>
            <span>{APP_VERSION} · Made with care, runs entirely in your browser</span>
          </div>
        </div>
      </footer>

      {/* Global floating Surprise Me button */}
      <FloatButton />
    </div>
  );
}
