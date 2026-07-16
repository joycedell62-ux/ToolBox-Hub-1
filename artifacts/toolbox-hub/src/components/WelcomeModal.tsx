import React, { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';

/* ─── Pure-canvas confetti ───────────────────────────────────────────────── */
function fireConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;

  const COLORS = [
    '#3b82f6','#6366f1','#10b981','#f59e0b',
    '#ef4444','#8b5cf6','#ec4899','#06b6d4','#f97316',
  ];

  type Particle = {
    x: number; y: number; vx: number; vy: number;
    color: string; size: number; rotation: number;
    rotV: number; alpha: number; shape: number;
  };

  const particles: Particle[] = Array.from({ length: 160 }, () => ({
    x:        Math.random() * canvas.width,
    y:        -20 - Math.random() * 200,
    vx:       (Math.random() - 0.5) * 5,
    vy:       2 + Math.random() * 5,
    color:    COLORS[Math.floor(Math.random() * COLORS.length)],
    size:     6 + Math.random() * 9,
    rotation: Math.random() * Math.PI * 2,
    rotV:     (Math.random() - 0.5) * 0.25,
    alpha:    1,
    shape:    Math.floor(Math.random() * 3),
  }));

  let frame = 0;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.12;
      p.rotation += p.rotV;
      if (p.y > canvas.height * 0.75) p.alpha -= 0.025;
      if (p.alpha <= 0) continue;
      alive++;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle   = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      if (p.shape === 0)      { ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2); }
      else if (p.shape === 1) { ctx.beginPath(); ctx.arc(0,0,p.size/2,0,Math.PI*2); ctx.fill(); }
      else                    { ctx.beginPath(); ctx.moveTo(0,-p.size/2); ctx.lineTo(p.size/2,p.size/2); ctx.lineTo(-p.size/2,p.size/2); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
    frame++;
    if (alive > 0 && frame < 360) requestAnimationFrame(animate);
    else canvas.remove();
  };
  requestAnimationFrame(animate);
}

/* ─── Component ──────────────────────────────────────────────────────────── */
interface WelcomeModalProps {
  onDismiss: (msg: string) => void;
}

const FEATURES = [
  '116+ Free Tools',
  'No Sign-up Required',
  'Fast & Secure',
  'Mobile Friendly',
  'Works in Your Browser',
];

const TOAST_MSG = '💙 Thanks for visiting ToolBox Hub! We hope you enjoy using our tools.';

export default function WelcomeModal({ onDismiss }: WelcomeModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(true); fireConfetti(); }, 400);
    return () => clearTimeout(t);
  }, []);

  const close = (withConfetti = false) => {
    setVisible(false);
    if (withConfetti) fireConfetti();
    setTimeout(() => onDismiss(TOAST_MSG), 280);
  };

  const handleInstall = () => {
    close();
    // Give PWAInstallPrompt time to appear naturally,
    // or open the site in a new tab so the browser offers install
    setTimeout(() => {
      const url = window.location.origin + window.location.pathname;
      window.open(url, '_blank');
    }, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-[600] flex items-center justify-center p-4
        transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => close()} />

      {/* Card */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden
          transition-all duration-300 ${visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-6'}`}
      >
        {/* ── Gradient header ─────────────────────────────────── */}
        <div
          className="relative px-8 pt-8 pb-10 text-center overflow-hidden"
          style={{ backgroundImage: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 50%,#4f46e5 100%)' }}
        >
          {/* Decorative orbs */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute -bottom-8 -left-12 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute top-4 left-8 w-12 h-12 bg-white/5 rounded-full pointer-events-none" />

          <div className="relative">
            <div className="text-5xl mb-3 drop-shadow-lg select-none">👋</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
              Welcome to ToolBox Hub!
            </h2>
            <p className="text-blue-200 text-sm mt-2 font-medium">
              Hello and welcome! 💙
            </p>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────── */}
        <div className="px-7 sm:px-8 py-6 max-h-[60vh] overflow-y-auto">

          <p className="text-slate-600 text-sm leading-relaxed mb-3">
            We're delighted to have you here. <strong className="text-slate-800">ToolBox Hub</strong> is
            your all-in-one platform with{' '}
            <span className="font-bold text-blue-600">116+ free online tools</span> designed to help
            students, professionals, businesses, creators, developers, teachers, and everyone get more done.
          </p>

          <p className="text-slate-500 text-sm leading-relaxed mb-5">
            Whether you need to edit PDFs, generate QR codes, compress images, create invoices,
            format code, or use productivity tools — everything is available in one place.
          </p>

          {/* Why you'll love it */}
          <div className="bg-blue-50 rounded-2xl px-5 py-4 mb-5 border border-blue-100">
            <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-3">
              Why you'll love ToolBox Hub
            </p>
            <ul className="space-y-2">
              {FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 text-[11px] font-extrabold">✓</span>
                  </span>
                  <span className="text-sm text-slate-700 font-medium">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mission */}
          <div className="border-l-4 border-blue-500 pl-4 mb-5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-1">
              🚀 Our Mission
            </p>
            <p className="text-sm text-slate-600 leading-relaxed italic">
              "To make everyday tasks easier by providing powerful, free, and accessible
              online tools for everyone."
            </p>
          </div>

          <p className="text-slate-500 text-xs text-center leading-relaxed mb-6">
            Thank you for visiting, and we hope ToolBox Hub becomes one of your favourite websites.{' '}
            <span className="font-semibold text-slate-600">Enjoy exploring! 💙</span>
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => close(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl
                transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-blue-300/60 hover:shadow-lg text-sm"
            >
              🚀 Start Exploring
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200
                text-slate-700 font-semibold px-6 py-3 rounded-2xl transition-all text-sm border border-slate-200"
            >
              <Smartphone className="w-4 h-4 text-slate-500" />
              Save to Home Screen
            </button>
          </div>
        </div>

        {/* Close × */}
        <button
          onClick={() => close()}
          aria-label="Close welcome popup"
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/15"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
