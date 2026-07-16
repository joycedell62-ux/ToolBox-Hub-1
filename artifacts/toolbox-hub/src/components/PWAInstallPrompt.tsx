import React, { useState, useEffect } from 'react';
import { X, Smartphone, Monitor, Apple } from 'lucide-react';

const SHOWN_KEY = 'tbh_pwa_prompted';

type Platform = 'ios' | 'android' | 'desktop';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [visible, setVisible]   = useState(false);
  const [platform, setPlatform] = useState<Platform>('desktop');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    try { if (localStorage.getItem(SHOWN_KEY)) return; } catch {}

    setPlatform(detectPlatform());

    /* Chrome/Edge/Android: native install prompt */
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 3000); // delay so page settles
    };
    window.addEventListener('beforeinstallprompt', handler);

    /* iOS / desktop fallback: show manual guide after 30s on home page */
    const fallback = setTimeout(() => {
      if (!deferredPrompt) setVisible(true);
    }, 30_000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(fallback);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(SHOWN_KEY, '1'); } catch {}
  };

  const install = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') dismiss();
    }
  };

  if (!visible) return null;

  const STEPS: Record<Platform, { icon: React.ReactNode; steps: string[] }> = {
    ios: {
      icon: <Apple className="w-5 h-5" />,
      steps: [
        "Tap the Share button (□↑) at the bottom of Safari",
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to confirm',
      ],
    },
    android: {
      icon: <Smartphone className="w-5 h-5" />,
      steps: [
        'Tap the three-dot menu (⋮) in Chrome',
        'Tap "Add to Home screen"',
        'Tap "Add" to confirm',
      ],
    },
    desktop: {
      icon: <Monitor className="w-5 h-5" />,
      steps: [
        'Click the install icon (⊕) in your browser\'s address bar',
        'Click "Install" in the popup',
        'Toolbox Hub opens as a standalone app',
      ],
    },
  };

  const info = STEPS[platform];

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-[500] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ backgroundImage: 'linear-gradient(135deg,#1d4ed8 0%,#4f46e5 100%)' }}
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white flex-shrink-0">
            {info.icon}
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-white text-sm">Add to Home Screen</p>
            <p className="text-blue-200 text-xs">Access Toolbox Hub like an app</p>
          </div>
          <button onClick={dismiss} className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="px-5 py-4 space-y-2.5">
          {info.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 px-5 pb-4">
          {deferredPrompt && (
            <button
              onClick={install}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl transition-colors"
            >
              Install Now
            </button>
          )}
          <button
            onClick={dismiss}
            className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-semibold text-sm py-2.5 rounded-xl transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
