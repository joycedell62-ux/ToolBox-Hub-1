import React, { useState, useRef, useEffect } from 'react';
import { RectangleHorizontal, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What sizes can I make?', a: 'Common presets: Leaderboard ad (728×90), Medium rectangle (300×250), Twitter/X header (1500×500), Facebook cover (820×312), LinkedIn banner (1584×396), and YouTube channel art (2560×1440).' },
  { q: 'Are these the correct social sizes?', a: 'Yes — they match the platforms\' recommended dimensions at the time of writing. Platforms occasionally change; verify if a banner looks cropped.' },
  { q: 'How do I download it?', a: 'Click Download PNG. The image exports at the exact pixel size of the chosen preset.' },
  { q: 'Can I move the text?', a: 'Use the alignment controls to position text left, center, or right — vertical centering is automatic.' },
  { q: 'Is my data private?', a: 'Completely. The banner is drawn on a local canvas and never uploaded.' },
];

const PRESETS = [
  { name: 'Leaderboard', w: 728, h: 90 },
  { name: 'Medium Rectangle', w: 300, h: 250 },
  { name: 'X / Twitter Header', w: 1500, h: 500 },
  { name: 'Facebook Cover', w: 820, h: 312 },
  { name: 'LinkedIn Banner', w: 1584, h: 396 },
  { name: 'YouTube Art', w: 2560, h: 1440 },
];
const STYLES = [
  { name: 'Blue', from: '#1e3a8a', to: '#2563eb', text: '#ffffff' },
  { name: 'Sunset', from: '#f97316', to: '#db2777', text: '#ffffff' },
  { name: 'Emerald', from: '#047857', to: '#10b981', text: '#ffffff' },
  { name: 'Violet', from: '#5b21b6', to: '#8b5cf6', text: '#ffffff' },
  { name: 'Noir', from: '#0b0b0b', to: '#1f2937', text: '#f9fafb' },
  { name: 'Solid', from: '#f8fafc', to: '#e2e8f0', text: '#0f172a' },
];
type Align = 'left' | 'center' | 'right';

export default function BannerCreator() {
  const [preset, setPreset] = useState(2);
  const [style, setStyle] = useState(0);
  const [title, setTitle] = useState('Northwind Studio');
  const [subtitle, setSubtitle] = useState('Design · Build · Launch');
  const [align, setAlign] = useState<Align>('center');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const draw = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    const s = STYLES[style];
    const base = Math.min(W, H);
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, s.from); g.addColorStop(1, s.to);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'middle';

    const pad = Math.max(W * 0.05, 24);
    let x = W / 2; let a: CanvasTextAlign = 'center';
    if (align === 'left') { x = pad; a = 'left'; }
    else if (align === 'right') { x = W - pad; a = 'right'; }
    ctx.textAlign = a;

    const titleSize = Math.max(base * 0.16, 20);
    const subSize = Math.max(base * 0.08, 12);
    ctx.fillStyle = s.text;
    ctx.font = `800 ${titleSize}px Arial, sans-serif`;
    const hasSub = subtitle.trim().length > 0;
    ctx.fillText(title || 'Your Title', x, hasSub ? H / 2 - subSize * 0.9 : H / 2, W - pad * 2);
    if (hasSub) {
      ctx.font = `500 ${subSize}px Arial, sans-serif`;
      ctx.globalAlpha = 0.9;
      ctx.fillText(subtitle, x, H / 2 + titleSize * 0.6, W - pad * 2);
      ctx.globalAlpha = 1;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const p = PRESETS[preset];
    canvas.width = p.w; canvas.height = p.h;
    draw(ctx, p.w, p.h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, style, title, subtitle, align]);

  const download = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${(title || 'banner').toLowerCase().replace(/\s+/g, '-').slice(0, 30)}-${PRESETS[preset].w}x${PRESETS[preset].h}.png`;
    a.click();
  };

  const p = PRESETS[preset];

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><RectangleHorizontal className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Banner Creator</h1><p className="text-blue-200 text-sm">preset sizes · gradients · text alignment · download PNG</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Create banners and social covers at exactly the right size. Pick a preset (ad or social), add your text, choose a gradient and alignment, then download a pixel-perfect PNG.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Size preset</label>
              <div className="grid grid-cols-1 gap-2">
                {PRESETS.map((pr, i) => (
                  <button key={pr.name} onClick={() => setPreset(i)} aria-pressed={preset === i} className={`flex items-center justify-between text-xs font-semibold py-2.5 px-3 rounded-lg border transition-all ${preset === i ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                    <span>{pr.name}</span><span className="text-gray-400 font-mono">{pr.w}×{pr.h}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="tt" className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
              <input id="tt" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label htmlFor="st" className="block text-xs font-semibold text-gray-500 mb-1">Subtitle (optional)</label>
              <input id="st" type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Text alignment</label>
              <div className="grid grid-cols-3 gap-2">
                {(['left', 'center', 'right'] as Align[]).map(al => (
                  <button key={al} onClick={() => setAlign(al)} aria-pressed={align === al} className={`text-xs font-semibold py-2 rounded-lg border capitalize transition-all ${align === al ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>{al}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Style</label>
              <div className="grid grid-cols-3 gap-2">
                {STYLES.map((st, i) => (
                  <button key={st.name} onClick={() => setStyle(i)} aria-pressed={style === i} aria-label={`${st.name} style`} className={`flex items-center gap-2 text-xs font-semibold py-2 px-2 rounded-lg border transition-all ${style === i ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                    <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ background: `linear-gradient(135deg,${st.from},${st.to})` }} />{st.name}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={download} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download PNG
            </button>
          </div>

          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Social platforms crop covers on mobile — keep text away from edges.</li>
              <li>• Center alignment reads best on wide headers and covers.</li>
              <li>• Reuse one gradient across all your banners for brand cohesion.</li>
              <li>• Short titles look cleaner than long ones at banner scale.</li>
              <li>• Preview at 100% before uploading to check for cropping.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Live Preview</h2>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 rounded-full px-2 py-0.5 font-mono">{p.w}×{p.h}</span>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 overflow-x-auto flex items-center justify-center">
              <canvas ref={canvasRef} className="rounded-lg shadow-md max-w-full" style={{ width: '100%', maxWidth: 640, aspectRatio: `${p.w} / ${p.h}` }} aria-label="Banner preview" />
            </div>
            <p className="text-xs text-gray-400 mt-3">Downloads at the exact preset size ({p.w} × {p.h} px).</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Social Media Brand Kit', href: '/social-media-brand-kit' }, { label: 'Poster Generator', href: '/poster-generator' }, { label: 'Flyer Generator', href: '/flyer-generator' }, { label: 'Color Palette Generator', href: '/color-palette-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_banner-creator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
