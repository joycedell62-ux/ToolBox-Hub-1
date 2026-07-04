import React from 'react';
import { Link, useLocation } from 'wouter';
import { Wrench, Home, ChevronRight } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isHome = location === '/';
  
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/password-generator': return 'Password Generator';
      case '/qr-code-generator': return 'QR Code Generator';
      case '/word-counter': return 'Word Counter';
      case '/bmi-calculator': return 'BMI Calculator';
      case '/age-calculator': return 'Age Calculator';
      case '/loan-calculator': return 'Loan Calculator';
      case '/percentage-calculator': return 'Percentage Calculator';
      case '/discount-calculator': return 'Discount Calculator';
      case '/text-case-converter': return 'Text Case Converter';
      default: return 'Tool';
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="bg-gradient-to-r from-blue-800 to-blue-500 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity">
              <div className="bg-white/20 p-2 rounded-lg">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">ToolBox Hub</span>
            </Link>
            <nav>
              {!isHome && (
                <Link href="/" className="flex items-center gap-2 text-blue-50 hover:text-white transition-colors text-sm font-medium">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {!isHome && (
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} ToolBox Hub. Free tools for everyone.</p>
        </div>
      </footer>
    </div>
  );
}