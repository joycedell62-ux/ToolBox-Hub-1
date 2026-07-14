import React, { useEffect, useState } from 'react';
import { X, PartyPopper } from 'lucide-react';

const STORAGE_KEY = 'toolbox-welcome-dismissed';
const CONFETTI_COLORS = ['#2563eb', '#93c5fd', '#c4b5fd', '#fbbf24', '#34d399', '#f87171'];

/** One-time friendly welcome shown to first-visit users at the top of Home. */
export default function WelcomeBanner() {
  const [visible, setVisible] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduce) setConfetti(true);
      }
    } catch {
      /* private mode — just skip */
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
  };

  if (!visible) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-b border-blue-100 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Confetti burst */}
      {confetti && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="absolute block w-1.5 h-3 rounded-sm opacity-0"
              style={{
                left: `${(i * 41) % 100}%`,
                top: '-12px',
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                animation: `tbh-confetti 2.4s ease-in ${(i % 8) * 0.15}s 1 forwards`,
                transform: `rotate(${(i * 47) % 360}deg)`,
              }}
            />
          ))}
          <style>{`@keyframes tbh-confetti { 0% { opacity: 1; transform: translateY(0) rotate(0deg); } 100% { opacity: 0; transform: translateY(140px) rotate(320deg); } }`}</style>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-start gap-3 sm:gap-4">
        <div className="bg-blue-600 p-2 rounded-xl flex-shrink-0 mt-0.5">
          <PartyPopper className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm sm:text-base">🎉 Welcome to ToolBox Hub! We're excited you're here.</p>
          <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
            Explore our growing collection of free online tools designed to help you work smarter,
            create faster, and solve everyday problems. Everything You Need. One Website. Free Forever. 💙
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss welcome message"
          className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
