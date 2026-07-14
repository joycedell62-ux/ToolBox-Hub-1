import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Wrench, Home, ChevronRight, Info } from 'lucide-react';
import { getToolByHref } from '../lib/tools';
import { pushRecent } from '../lib/toolPrefs';
import GlobalSearch from './GlobalSearch';
import ToolActionBar from './ToolActionBar';
import WelcomeBanner from './WelcomeBanner';

const APP_VERSION = 'v2.0';

const STATIC_TITLES: Record<string, string> = {
  '/about': 'About',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Use',
  '/vision': 'Our Vision',
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isHome = location === '/';
  const isAbout = location === '/about';
  const tool = getToolByHref(location);
  const pageTitle = tool?.title ?? STATIC_TITLES[location] ?? 'Tool';

  // Track recently used tools
  useEffect(() => {
    if (getToolByHref(location)) pushRecent(location);
  }, [location]);

  const mailto = (subject: string) =>
    `mailto:hello@toolboxhub.app?subject=${encodeURIComponent(subject)}`;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="bg-gradient-to-r from-blue-800 to-blue-500 shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity flex-shrink-0">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg">
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="font-bold text-base sm:text-lg tracking-tight hidden min-[400px]:inline">ToolBox Hub</span>
            </Link>

            {/* Global search — on every page */}
            <div className="flex-1 flex justify-end sm:justify-center min-w-0">
              <GlobalSearch />
            </div>

            {/* Nav links */}
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

      <main className="flex-1 flex flex-col">
        {/* Breadcrumb + tool actions — shown on tool pages */}
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

          {/* End-of-page thank-you — on every tool page */}
          {tool && (
            <div className="mt-12 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 sm:p-8 text-center">
              <p className="font-bold text-gray-900">💙 Thank you for using ToolBox Hub!</p>
              <p className="text-sm text-gray-600 mt-1.5 max-w-lg mx-auto leading-relaxed">
                We're constantly adding new tools and improving existing ones.
                If you have an idea or feedback, we'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                <a
                  href={mailto('Tool suggestion — ToolBox Hub')}
                  className="w-full sm:w-auto px-5 py-2 bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-700 font-medium rounded-xl transition-colors text-sm"
                >
                  💡 Suggest a Tool
                </a>
                <a
                  href={mailto('Feedback — ToolBox Hub')}
                  className="w-full sm:w-auto px-5 py-2 bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-700 font-medium rounded-xl transition-colors text-sm"
                >
                  💬 Give Feedback
                </a>
                <Link
                  href="/"
                  className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  🚀 Explore More Tools
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

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
                <li><Link href="/#tools" className="text-gray-600 hover:text-blue-600 transition-colors">Categories</Link></li>
                <li><Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link></li>
                <li><Link href="/vision" className="text-gray-600 hover:text-blue-600 transition-colors">Our Vision</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href={mailto('Feedback — ToolBox Hub')} className="text-gray-600 hover:text-blue-600 transition-colors">Send Feedback</a></li>
                <li><a href={mailto('Tool request — ToolBox Hub')} className="text-gray-600 hover:text-blue-600 transition-colors">Request a Tool</a></li>
                <li><a href={mailto('Contact — ToolBox Hub')} className="text-gray-600 hover:text-blue-600 transition-colors">Contact Us</a></li>
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
            <span>{APP_VERSION} · Made with care, runs in your browser</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
