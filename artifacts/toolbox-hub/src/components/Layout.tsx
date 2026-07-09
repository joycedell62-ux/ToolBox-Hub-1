import React from 'react';
import { Link, useLocation } from 'wouter';
import { Wrench, Home, ChevronRight, Info } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isHome  = location === '/';
  const isAbout = location === '/about';

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/about':                  return 'About';
      case '/password-generator':     return 'Password Generator';
      case '/qr-code-generator':      return 'QR Code Generator';
      case '/word-counter':           return 'Word Counter';
      case '/bmi-calculator':         return 'BMI Calculator';
      case '/age-calculator':         return 'Age Calculator';
      case '/loan-calculator':        return 'Loan Calculator';
      case '/percentage-calculator':  return 'Percentage Calculator';
      case '/discount-calculator':    return 'Discount Calculator';
      case '/text-case-converter':    return 'Text Case Converter';
      case '/random-number-generator':return 'Random Number Generator';
      case '/certificate-generator':  return 'Certificate Generator';
      case '/resume-builder':         return 'Resume Builder';
      case '/invoice-generator':      return 'Invoice Generator';
      default:                        return 'Tool';
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="bg-gradient-to-r from-blue-800 to-blue-500 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity">
              <div className="bg-white/20 p-2 rounded-lg">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">ToolBox Hub</span>
            </Link>

            {/* Nav links */}
            <nav className="flex items-center gap-1">
              {!isHome && (
                <Link href="/"
                  className="flex items-center gap-1.5 text-blue-50 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium px-3 py-2 rounded-lg">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
              )}
              <Link href="/about"
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                  isAbout ? 'bg-white/20 text-white' : 'text-blue-50 hover:text-white hover:bg-white/10'
                }`}>
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">About</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Breadcrumb — not shown on home or about (about has its own hero) */}
        {!isHome && !isAbout && (
          <div className="bg-blue-50/50 border-b border-blue-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                <span className="text-foreground font-medium">{getPageTitle(location)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full flex-1 flex flex-col">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Wrench className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-gray-700">ToolBox Hub</span>
              <span className="text-sm">— Free tools for everyone.</span>
            </div>
            <div className="flex items-center gap-5 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">All Tools</Link>
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
              <span>© {new Date().getFullYear()} ToolBox Hub</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
