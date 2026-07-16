import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Wrench, Home, ChevronRight, Info, Shuffle, Sun, Moon, Share2, Mail, Globe, ExternalLink, ChevronRight as Arr } from 'lucide-react';
import { getToolByHref, TOOLS } from '../lib/tools';
import { pushRecent, checkAchievement, ACHIEVEMENT_LABELS } from '../lib/toolPrefs';
import { useTheme } from '../lib/theme';
import GlobalSearch from './GlobalSearch';
import ToolActionBar from './ToolActionBar';
import NotificationBell from './NotificationBell';

const APP_VERSION = 'v2.0';

const STATIC_TITLES: Record<string, string> = {
  '/about': 'About',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Use',
  '/vision': 'Our Vision',
};

const mailto = (subject: string) =>
  `mailto:toolboxhub2@gmail.com?subject=${encodeURIComponent(subject)}`;

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
        <span className="font-medium opacity-90">{TOOLS.length}+ FREE TOOLS</span>
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

  const { theme, toggle } = useTheme();
  const [badge, setBadge]           = useState<number | null>(null);
  const [nlEmail, setNlEmail]       = useState('');
  const [nlSent, setNlSent]         = useState(false);
  const [shareMsg, setShareMsg]     = useState('');

  const handleShare = async () => {
    const url  = window.location.origin + import.meta.env.BASE_URL;
    const text = '🚀 Check out ToolBox Hub — 122+ free online tools for everyone. No account needed!';
    if (navigator.share) {
      try { await navigator.share({ title: 'ToolBox Hub', text, url }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShareMsg('🔗 Link copied!');
      setTimeout(() => setShareMsg(''), 2500);
    } catch {}
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = encodeURIComponent(`Newsletter Subscription — ${nlEmail}`);
    const body = encodeURIComponent(`Please add me to the ToolBox Hub newsletter.\n\nEmail: ${nlEmail}`);
    window.open(`mailto:toolboxhub2@gmail.com?subject=${sub}&body=${body}`);
    setNlSent(true);
    setTimeout(() => { setNlSent(false); setNlEmail(''); }, 4000);
  };

  useEffect(() => {
    if (!getToolByHref(location)) return;
    pushRecent(location);
    const milestone = checkAchievement(location);
    if (milestone) {
      setBadge(milestone);
      setTimeout(() => setBadge(null), 5000);
    }
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
              {/* Notification bell */}
              <NotificationBell />

              {/* Dark / light toggle */}
              <button
                onClick={toggle}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                {theme === 'dark'
                  ? <Sun className="w-4 h-4" />
                  : <Moon className="w-4 h-4" />
                }
              </button>

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
      <footer className="bg-slate-900 text-slate-300 mt-auto">

        {/* ── Main grid ───────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-700/60">

            {/* Brand col (spans 2) */}
            <div className="col-span-2 lg:col-span-2 space-y-5">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-500 p-2 rounded-xl">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-white text-lg leading-none">ToolBox Hub</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">116+ FREE online tools</p>
                </div>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Built for everyone. Work smarter with powerful browser-based tools for PDFs, images,
                writing, development, business, education, and more.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {['⚡ Fast', '🔒 Secure', '💯 Free Forever'].map(b => (
                  <span key={b} className="text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full">{b}</span>
                ))}
              </div>

              {/* Why ToolBox Hub */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">❤️ Why ToolBox Hub?</p>
                <ul className="space-y-1.5">
                  {[
                    '116+ Free Tools',
                    'No Account Required',
                    'No Downloads',
                    'Works on Mobile & Desktop',
                    'Fast & Secure',
                    'Regularly Updated',
                  ].map(r => (
                    <li key={r} className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="text-emerald-400 font-bold">✔</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Explore col */}
            <div className="col-span-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">🚀 Explore</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/" className="text-slate-400 hover:text-blue-400 transition-colors">All Tools</Link></li>
                <li><Link href="/?q=new" className="text-slate-400 hover:text-blue-400 transition-colors">New Tools</Link></li>
                <li><Link href="/?q=popular" className="text-slate-400 hover:text-blue-400 transition-colors">Trending</Link></li>
                <li><Link href="/" className="text-slate-400 hover:text-blue-400 transition-colors">Categories</Link></li>
                <li><Link href="/about" className="text-slate-400 hover:text-blue-400 transition-colors">Our Journey</Link></li>
                <li><span className="text-slate-600 text-xs italic">Roadmap — coming soon</span></li>
              </ul>

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-6 mb-3">Tool Types</p>
              <ul className="space-y-2 text-sm">
                {['AI Tools','PDF Tools','Image Tools','Developer Tools','Writing Tools','Business Tools'].map(c => (
                  <li key={c}><Link href="/" className="text-slate-400 hover:text-blue-400 transition-colors">{c}</Link></li>
                ))}
              </ul>
            </div>

            {/* Community col */}
            <div className="col-span-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">💙 Community</p>
              <ul className="space-y-2.5 text-sm">
                <li><a href={mailto('Feedback — ToolBox Hub')} className="text-slate-400 hover:text-blue-400 transition-colors">Give Feedback</a></li>
                <li><a href={mailto('Tool Suggestion — ToolBox Hub')} className="text-slate-400 hover:text-blue-400 transition-colors">Suggest a Tool</a></li>
                <li><a href={mailto('Contact — ToolBox Hub')} className="text-slate-400 hover:text-blue-400 transition-colors">Contact Us</a></li>
                <li><a href={mailto('Bug Report — ToolBox Hub')} className="text-slate-400 hover:text-blue-400 transition-colors">Report a Bug</a></li>
                <li><a href={mailto('Partnership Enquiry — ToolBox Hub')} className="text-slate-400 hover:text-blue-400 transition-colors">Become a Partner</a></li>
                <li><a href={mailto('Feature Request — ToolBox Hub')} className="text-slate-400 hover:text-blue-400 transition-colors">Feature Request</a></li>
              </ul>
            </div>

            {/* Resources col */}
            <div className="col-span-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">📚 Resources</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/help" className="text-slate-400 hover:text-blue-400 transition-colors">Help Center</Link></li>
                <li><Link href="/faq" className="text-slate-400 hover:text-blue-400 transition-colors">Frequently Asked Questions</Link></li>
                <li><span className="text-slate-400">Keyboard Shortcuts</span></li>
                <li><span className="text-slate-400">Save to Home Screen</span></li>
                <li><Link href="/privacy" className="text-slate-400 hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-slate-400 hover:text-blue-400 transition-colors">Terms of Use</Link></li>
                <li><span className="text-slate-600 text-xs italic">Blog — Coming Soon</span></li>
              </ul>
            </div>
          </div>

          {/* ── Mid strip: Follow · Share · Newsletter ────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-12 border-b border-slate-700/60">

            {/* Follow */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">🌍 Follow ToolBox Hub</p>
              <ul className="space-y-3">
                <li>
                  <a href="https://x.com/toolboxhub?s=11" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 group">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-extrabold text-white group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">𝕏</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">X (Twitter)</p>
                      <p className="text-[11px] text-slate-500">@toolboxhub</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400 ml-auto transition-colors" />
                  </a>
                </li>
                <li>
                  <a href="mailto:toolboxhub2@gmail.com" className="flex items-center gap-3 group">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
                      <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">Email</p>
                      <p className="text-[11px] text-slate-500">toolboxhub2@gmail.com</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="https://tool-box-hub-1.replit.app" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 group">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
                      <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">Website</p>
                      <p className="text-[11px] text-slate-500">tool-box-hub-1.replit.app</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400 ml-auto transition-colors" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Share + Install */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">⭐ Love ToolBox Hub?</p>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Help us grow by sharing with your friends, classmates, colleagues, and family.
                Every share helps someone discover free tools.
              </p>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors mb-2 w-full justify-center"
              >
                <Share2 className="w-4 h-4" />
                {shareMsg || '🚀 Share ToolBox Hub'}
              </button>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-5 mb-2">📱 Install ToolBox Hub</p>
              <p className="text-xs text-slate-500 mb-3">Save to your Home Screen for one-tap access. Works just like a mobile app.</p>
              <a
                href="https://tool-box-hub-1.replit.app" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors w-full justify-center"
              >
                📌 Add to Home Screen
              </a>
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">🔔 Stay Updated</p>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Be the first to know when new tools are released.
              </p>
              {nlSent ? (
                <div className="rounded-xl bg-emerald-900/30 border border-emerald-700/50 px-4 py-3 text-sm text-emerald-400 font-semibold text-center">
                  ✅ Subscribed! Thank you.
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="space-y-2">
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={nlEmail}
                    onChange={e => setNlEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-600 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="w-full bg-slate-700 hover:bg-blue-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors"
                  >
                    📧 Subscribe to Newsletter
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* ── Quote ────────────────────────────────────────────────────── */}
          <div className="py-10 text-center border-b border-slate-700/60">
            <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-2">💬 Our Promise</p>
            <blockquote className="text-xl sm:text-2xl font-extrabold text-white leading-snug max-w-xl mx-auto">
              "One website. Endless possibilities.<br />
              <span className="text-blue-400">Every tool you need.</span>"
            </blockquote>
          </div>

          {/* ── Bottom bar ───────────────────────────────────────────────── */}
          <div className="pt-8 space-y-4">
            {/* Attribution */}
            <div className="text-center">
              <p className="text-sm text-slate-400">
                Made with <span className="text-rose-400">❤️</span> by{' '}
                <span className="font-semibold text-slate-300">Oluwatobi</span>{' '}
                in Nigeria 🇳🇬
              </p>
              <p className="text-xs text-slate-600 mt-1 max-w-lg mx-auto leading-relaxed">
                Empowering students, creators, developers, businesses, teachers, freelancers,
                and professionals with free productivity tools.
              </p>
            </div>

            {/* Legal links */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-slate-600">
              <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Use</Link>
              <span>·</span>
              <a href={mailto('Contact — ToolBox Hub')} className="hover:text-slate-400 transition-colors">Contact</a>
            </div>

            {/* Copyright + version */}
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-600">
                © {new Date().getFullYear()} ToolBox Hub. All Rights Reserved.
              </p>
              <p className="text-[11px] text-slate-700">
                {APP_VERSION} · 116+ Free Tools · Built for Everyone · Growing Every Week 🚀
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Global floating Surprise Me button */}
      <FloatButton />

      {/* Achievement badge toast */}
      {badge && (() => {
        const a = ACHIEVEMENT_LABELS[badge];
        return (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[700] pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div
              className="flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl text-white min-w-[280px]"
              style={{ backgroundImage: 'linear-gradient(135deg,#d97706 0%,#f97316 100%)' }}
            >
              <span className="text-4xl leading-none">{a.emoji}</span>
              <div>
                <p className="font-extrabold text-sm">{a.title}</p>
                <p className="text-xs text-amber-100 mt-0.5">{a.sub}</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
