import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

  const particles: Particle[] = Array.from({ length: 150 }, () => ({
    x:        Math.random() * canvas.width,
    y:        -20 - Math.random() * 200,
    vx:       (Math.random() - 0.5) * 5,
    vy:       2 + Math.random() * 5,
    color:    COLORS[Math.floor(Math.random() * COLORS.length)],
    size:     6 + Math.random() * 9,
    rotation: Math.random() * Math.PI * 2,
    rotV:     (Math.random() - 0.5) * 0.25,
    alpha:    1,
    shape:    Math.floor(Math.random() * 3), // 0=rect 1=circle 2=triangle
  }));

  let frame = 0;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;

    for (const p of particles) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.12;
      p.rotation += p.rotV;
      if (p.y > canvas.height * 0.75) p.alpha -= 0.025;
      if (p.alpha <= 0) continue;
      alive++;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle   = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.shape === 0) {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.shape === 1) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -p.size / 2);
        ctx.lineTo(p.size / 2, p.size / 2);
        ctx.lineTo(-p.size / 2, p.size / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    frame++;
    if (alive > 0 && frame < 350) requestAnimationFrame(animate);
    else canvas.remove();
  };

  requestAnimationFrame(animate);
}

/* ─── Component ──────────────────────────────────────────────────────────── */
interface WelcomeModalProps {
  /** Called when the modal closes — pass the thank-you message to show. */
  onDismiss: (msg: string) => void;
}

export default function WelcomeModal({ onDismiss }: WelcomeModalProps) {
  const [visible, setVisible] = useState(false);

  /* slight delay so the page renders first, then modal fades in */
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      fireConfetti(); // 🎊 confetti on first visit
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const close = (withConfetti = false) => {
    setVisible(false);
    if (withConfetti) fireConfetti();
    setTimeout(
      () => onDismiss('👋 Thanks for visiting Toolbox Hub. Have an amazing day!'),
      280,
    );
  };

  const FEATURES = [
    'No signup required',
    'Completely free',
    'Fast & Secure — runs in your browser',
  ];

  return (
    <div
      className={`fixed inset-0 z-[600] flex items-center justify-center p-4 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => close()}
      />

      {/* Card */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transition-all duration-300 ${
          visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* ── Gradient header ── */}
        <div
          className="relative px-8 pt-8 pb-10 text-center overflow-hidden"
          style={{ backgroundImage: 'linear-gradient(135deg,#1d4ed8 0%,#4f46e5 100%)' }}
        >
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute -bottom-6 -left-10 w-28 h-28 bg-white/10 rounded-full pointer-events-none" />
          <div className="relative">
            <div className="text-5xl mb-3 drop-shadow-md">🚀</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Welcome to Toolbox Hub!
            </h2>
            <p className="text-blue-200 text-sm mt-1.5 font-medium">
              Your all-in-one collection of 122+ free online tools
            </p>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-8 py-6">
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            Whether you're a student, developer, business owner, designer, creator, or professional —
            we've built these tools to help you work faster and smarter.
          </p>

          <div className="space-y-2.5 mb-5">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-600 text-xs font-extrabold">✓</span>
                </span>
                <span className="text-sm text-slate-700 font-medium">{f}</span>
              </div>
            ))}
          </div>

          <p className="text-slate-400 text-xs text-center mb-6 italic">
            We're excited to have you here. Explore, create, and get more done!
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => close(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition-all hover:scale-[1.02] shadow-md hover:shadow-lg text-sm"
            >
              🚀 Start Exploring
            </button>
            <button
              onClick={() => close()}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-6 py-3 rounded-2xl transition-all text-sm"
            >
              Maybe Later
            </button>
          </div>
        </div>

        {/* Close × */}
        <button
          onClick={() => close()}
          aria-label="Close welcome"
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
