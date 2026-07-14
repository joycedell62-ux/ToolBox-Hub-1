import React, { useState } from 'react';
import { Palette, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Lock, Unlock } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What do the harmony modes mean?', a: 'Complementary uses opposite colors for high contrast. Analogous uses neighbors for a calm look. Triadic spaces three colors evenly for balanced vibrancy. Monochrome varies one hue\'s lightness.' },
  { q: 'How do I keep a color I like?', a: 'Click the lock icon on a swatch. Locked colors stay fixed when you regenerate the rest of the palette.' },
  { q: 'How do I copy a hex code?', a: 'Click anywhere on a swatch to copy its hex value. A checkmark confirms the copy.' },
  { q: 'Are these palettes accessible?', a: 'Harmony gives you a good start, but always check text/background pairs for WCAG contrast before shipping.' },
  { q: 'Does this work offline?', a: 'Yes — all color math runs in your browser with no network calls.' },
];

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function hexToHsl(hex: string): [number, number, number] {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

type Mode = 'random' | 'complementary' | 'analogous' | 'triadic' | 'monochrome';

function buildPalette(mode: Mode, base: string): string[] {
  const [h, s, l] = hexToHsl(base);
  switch (mode) {
    case 'complementary':
      return [hslToHex(h, s, Math.max(20, l - 20)), hslToHex(h, s, l), hslToHex(h, Math.max(20, s - 15), Math.min(90, l + 20)), hslToHex((h + 180) % 360, s, l), hslToHex((h + 180) % 360, Math.max(20, s - 10), Math.min(85, l + 15))];
    case 'analogous':
      return [hslToHex((h + 330) % 360, s, l), hslToHex((h + 345) % 360, s, l), hslToHex(h, s, l), hslToHex((h + 15) % 360, s, l), hslToHex((h + 30) % 360, s, l)];
    case 'triadic':
      return [hslToHex(h, s, l), hslToHex(h, Math.max(20, s - 20), Math.min(88, l + 18)), hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l), hslToHex((h + 240) % 360, Math.max(20, s - 20), Math.min(88, l + 18))];
    case 'monochrome':
      return [hslToHex(h, s, 92), hslToHex(h, s, 72), hslToHex(h, s, 52), hslToHex(h, s, 34), hslToHex(h, s, 18)];
    default: {
      return Array.from({ length: 5 }, () => hslToHex(Math.floor(Math.random() * 360), 55 + Math.floor(Math.random() * 35), 40 + Math.floor(Math.random() * 30)));
    }
  }
}

export default function ColorPaletteGenerator() {
  const [mode, setMode] = useState<Mode>('random');
  const [base, setBase] = useState('#2563eb');
  const [colors, setColors] = useState<string[]>(() => buildPalette('random', '#2563eb'));
  const [locked, setLocked] = useState<boolean[]>([false, false, false, false, false]);
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => {
    const next = buildPalette(mode, base);
    setColors(prev => prev.map((c, i) => (locked[i] ? c : next[i])));
  };

  const toggleLock = (i: number) => setLocked(prev => prev.map((v, idx) => (idx === i ? !v : v)));

  const copyOne = async (hex: string, i: number) => { await navigator.clipboard.writeText(hex); setCopied(i); setTimeout(() => setCopied(null), 1500); };
  const copyAll = async () => { await navigator.clipboard.writeText(colors.join(', ')); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000); };

  const textOn = (hex: string) => { const [, , l] = hexToHsl(hex); return l > 60 ? '#0f172a' : '#ffffff'; };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Palette className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Color Palette Generator</h1><p className="text-blue-200 text-sm">random · harmony modes · lock swatches · click to copy</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Generate beautiful, harmonious color palettes. Start from a base color or go fully random, lock the swatches you love, and copy any hex with a click.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Harmony mode</label>
              <div className="grid grid-cols-2 gap-2">
                {(['random', 'complementary', 'analogous', 'triadic', 'monochrome'] as Mode[]).map(m => (
                  <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} className={`text-xs font-semibold py-2 rounded-lg border capitalize transition-all ${mode === m ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>{m}</button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="base" className="block text-xs font-semibold text-gray-500 mb-1">Base color {mode === 'random' ? '(used when not random)' : ''}</label>
              <div className="flex items-center gap-2">
                <input id="base" type="color" value={base} onChange={e => setBase(e.target.value)} className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <input type="text" value={base} onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setBase(v); }} className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
              </div>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Palette
            </button>
          </div>

          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Lock a color you love, then regenerate to build a palette around it.</li>
              <li>• Use the 60-30-10 rule: one dominant, one secondary, one accent color.</li>
              <li>• Monochrome palettes are foolproof for clean, professional designs.</li>
              <li>• Always verify text-on-background contrast meets WCAG AA (4.5:1).</li>
              <li>• Copy All to grab the whole palette as a comma-separated list.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Your Palette</h2>
              <button onClick={copyAll} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                {copiedAll ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied All</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2 rounded-xl overflow-hidden">
              {colors.map((c, i) => (
                <div key={i} className="flex flex-col">
                  <button onClick={() => copyOne(c, i)} aria-label={`Copy ${c}`} className="h-40 sm:h-48 flex items-end justify-center pb-3 transition-all hover:brightness-95" style={{ background: c }}>
                    <span className="text-[10px] sm:text-xs font-mono font-semibold" style={{ color: textOn(c) }}>{copied === i ? 'Copied!' : c.toUpperCase()}</span>
                  </button>
                  <button onClick={() => toggleLock(i)} aria-label={locked[i] ? 'Unlock swatch' : 'Lock swatch'} aria-pressed={locked[i]} className={`flex items-center justify-center py-2 text-xs transition-colors ${locked[i] ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400 hover:text-blue-600'}`}>
                    {locked[i] ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">Click a swatch to copy its hex · lock swatches to preserve them when regenerating.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Color Picker', href: '/color-picker' }, { label: 'Logo Generator', href: '/logo-generator' }, { label: 'Font Pairing Generator', href: '/font-pairing-generator' }, { label: 'Brand Style Guide', href: '/brand-style-guide-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_color-palette-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
