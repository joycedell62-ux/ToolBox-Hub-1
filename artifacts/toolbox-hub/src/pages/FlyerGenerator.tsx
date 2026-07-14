import React, { useState, useRef, useEffect } from 'react';
import { FileText, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What ratio is the flyer?', a: 'A4 portrait (210 × 297 mm). The export is 1240 × 1754 px, crisp for print at ~150 DPI or clear on screen.' },
  { q: 'Can I add my logo image?', a: 'This tool builds text-based flyers. Export the PNG, then drop in a logo in any editor if needed.' },
  { q: 'How do I print it full-page?', a: 'Open the PNG, print at A4, and set scaling to "Fit". Or place it in a document sized to A4.' },
  { q: 'Why use templates?', a: 'Each template arranges the headline, details, and footer with proven layout hierarchy so your flyer reads clearly.' },
  { q: 'Does this work offline?', a: 'Yes — the flyer renders on a local canvas with no network calls.' },
];

type Template = 'bold' | 'banner' | 'split' | 'clean';
const TEMPLATES: { id: Template; label: string }[] = [
  { id: 'bold', label: 'Bold' }, { id: 'banner', label: 'Banner' },
  { id: 'split', label: 'Split' }, { id: 'clean', label: 'Clean' },
];
const PALETTES = [
  { name: 'Blue', a: '#2563eb', b: '#1e3a8a', text: '#0f172a', light: '#eff6ff' },
  { name: 'Sunset', a: '#f97316', b: '#dc2626', text: '#1f2937', light: '#fff7ed' },
  { name: 'Emerald', a: '#059669', b: '#047857', text: '#0f172a', light: '#ecfdf5' },
  { name: 'Violet', a: '#7c3aed', b: '#5b21b6', text: '#1f2937', light: '#f5f3ff' },
  { name: 'Rose', a: '#db2777', b: '#9d174d', text: '#1f2937', light: '#fdf2f8' },
  { name: 'Slate', a: '#334155', b: '#0f172a', text: '#0f172a', light: '#f1f5f9' },
];

export default function FlyerGenerator() {
  const [headline, setHeadline] = useState('Summer Music Festival');
  const [subhead, setSubhead] = useState('Three days of live sound');
  const [details, setDetails] = useState('Join us for an unforgettable weekend featuring local bands, food trucks, and family fun for all ages.');
  const [date, setDate] = useState('Aug 15–17, 2025');
  const [venue, setVenue] = useState('Riverside Park · Main Stage');
  const [footer, setFooter] = useState('Tickets at northwind.co/festival');
  const [template, setTemplate] = useState<Template>('bold');
  const [palette, setPalette] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const wrap = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, align: CanvasTextAlign = 'left') => {
    ctx.textAlign = align;
    const words = text.split(' ');
    let line = '';
    let yy = y;
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lh; }
      else line = test;
    }
    if (line) ctx.fillText(line, x, yy);
    return yy + lh;
  };

  const draw = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    const p = PALETTES[palette];
    const px = (v: number) => v * (W / 1240);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';

    if (template === 'bold') {
      const g = ctx.createLinearGradient(0, 0, 0, px(620));
      g.addColorStop(0, p.b); g.addColorStop(1, p.a);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, px(620));
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${px(96)}px Arial, sans-serif`;
      let y = wrap(ctx, headline, px(80), px(220), W - px(160), px(104), 'left');
      ctx.font = `${px(44)}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      wrap(ctx, subhead, px(80), y + px(10), W - px(160), px(56), 'left');
      ctx.fillStyle = p.text;
      ctx.font = `${px(40)}px Arial, sans-serif`;
      let dy = wrap(ctx, details, px(80), px(760), W - px(160), px(56), 'left');
      drawFooterBlock(ctx, px, p, dy + px(40), 'left', W);
    } else if (template === 'banner') {
      ctx.fillStyle = p.light; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = p.a; ctx.fillRect(0, px(120), W, px(300));
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${px(88)}px Arial, sans-serif`;
      wrap(ctx, headline, W / 2, px(255), W - px(160), px(96), 'center');
      ctx.fillStyle = p.text;
      ctx.font = `600 ${px(46)}px Arial, sans-serif`;
      wrap(ctx, subhead, W / 2, px(520), W - px(200), px(58), 'center');
      ctx.font = `${px(38)}px Arial, sans-serif`;
      let dy = wrap(ctx, details, W / 2, px(640), W - px(220), px(52), 'center');
      drawFooterBlock(ctx, px, p, dy + px(50), 'center', W);
    } else if (template === 'split') {
      ctx.fillStyle = p.b; ctx.fillRect(0, 0, W, px(560));
      ctx.fillStyle = p.light; ctx.fillRect(0, px(560), W, H - px(560));
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${px(92)}px Arial, sans-serif`;
      let y = wrap(ctx, headline, px(80), px(240), W - px(160), px(100), 'left');
      ctx.font = `${px(42)}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      wrap(ctx, subhead, px(80), y + px(8), W - px(160), px(54), 'left');
      ctx.fillStyle = p.text;
      ctx.font = `${px(40)}px Arial, sans-serif`;
      let dy = wrap(ctx, details, px(80), px(680), W - px(160), px(56), 'left');
      drawFooterBlock(ctx, px, p, dy + px(40), 'left', W);
    } else {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = p.a; ctx.lineWidth = px(10);
      ctx.strokeRect(px(50), px(50), W - px(100), H - px(100));
      ctx.fillStyle = p.a; ctx.fillRect(px(90), px(200), px(140), px(12));
      ctx.fillStyle = p.text;
      ctx.font = `800 ${px(90)}px Arial, sans-serif`;
      let y = wrap(ctx, headline, px(90), px(320), W - px(200), px(98), 'left');
      ctx.font = `${px(42)}px Arial, sans-serif`;
      ctx.fillStyle = p.a;
      y = wrap(ctx, subhead, px(90), y + px(8), W - px(200), px(54), 'left');
      ctx.fillStyle = p.text;
      ctx.font = `${px(38)}px Arial, sans-serif`;
      let dy = wrap(ctx, details, px(90), y + px(40), W - px(200), px(54), 'left');
      drawFooterBlock(ctx, px, p, dy + px(50), 'left', W);
    }
  };

  const drawFooterBlock = (ctx: CanvasRenderingContext2D, px: (v: number) => number, p: typeof PALETTES[number], y: number, align: CanvasTextAlign, W: number) => {
    const x = align === 'center' ? W / 2 : px(80);
    ctx.textAlign = align;
    ctx.fillStyle = p.a;
    ctx.font = `800 ${px(52)}px Arial, sans-serif`;
    ctx.fillText(date, x, y);
    ctx.fillStyle = p.text;
    ctx.font = `600 ${px(40)}px Arial, sans-serif`;
    ctx.fillText(venue, x, y + px(64));
    ctx.font = `${px(34)}px Arial, sans-serif`;
    ctx.fillStyle = '#64748b';
    ctx.fillText(footer, x, y + px(120));
  };

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = 1240; canvas.height = 1754;
    draw(ctx, 1240, 1754);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headline, subhead, details, date, venue, footer, template, palette]);

  const download = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${(headline || 'flyer').toLowerCase().replace(/\s+/g, '-').slice(0, 40)}-flyer.png`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><FileText className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Flyer Generator</h1><p className="text-blue-200 text-sm">A4 ratio · 4 templates · palettes · download PNG</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Create an event or promo flyer in the A4 ratio. Add your headline, details, date and venue, choose a template and palette, and download a print-ready PNG.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="hl" className="block text-xs font-semibold text-gray-500 mb-1">Headline</label>
              <input id="hl" type="text" value={headline} onChange={e => setHeadline(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label htmlFor="sub" className="block text-xs font-semibold text-gray-500 mb-1">Subheading</label>
              <input id="sub" type="text" value={subhead} onChange={e => setSubhead(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label htmlFor="det" className="block text-xs font-semibold text-gray-500 mb-1">Details</label>
              <textarea id="det" value={details} onChange={e => setDetails(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dt" className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                <input id="dt" type="text" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
              </div>
              <div>
                <label htmlFor="vn" className="block text-xs font-semibold text-gray-500 mb-1">Venue</label>
                <input id="vn" type="text" value={venue} onChange={e => setVenue(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
              </div>
            </div>
            <div>
              <label htmlFor="ft" className="block text-xs font-semibold text-gray-500 mb-1">Footer / call to action</label>
              <input id="ft" type="text" value={footer} onChange={e => setFooter(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Template</label>
              <div className="grid grid-cols-4 gap-2">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t.id)} aria-pressed={template === t.id} className={`text-xs font-semibold py-2 rounded-lg border transition-all ${template === t.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>{t.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Palette</label>
              <div className="grid grid-cols-3 gap-2">
                {PALETTES.map((p, i) => (
                  <button key={p.name} onClick={() => setPalette(i)} aria-pressed={palette === i} aria-label={`${p.name} palette`} className={`flex items-center gap-2 text-xs font-semibold py-2 px-2 rounded-lg border transition-all ${palette === i ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                    <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ background: p.a }} />{p.name}
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
              <li>• Lead with a short, punchy headline — it does most of the work.</li>
              <li>• Put the date and venue where the eye lands after the headline.</li>
              <li>• End with one clear call to action (a URL or phone number).</li>
              <li>• Keep body copy to two or three sentences maximum.</li>
              <li>• Match the palette to your brand for instant recognition.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Live Preview (A4)</h2>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 flex items-center justify-center">
              <canvas ref={canvasRef} className="w-full max-w-xs rounded-lg shadow-md" style={{ aspectRatio: '1240 / 1754' }} aria-label="Flyer preview" />
            </div>
            <p className="text-xs text-gray-400 mt-3">Exports at 1240 × 1754 px (A4 portrait).</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Poster Generator', href: '/poster-generator' }, { label: 'Banner Creator', href: '/banner-creator' }, { label: 'Business Card Designer', href: '/business-card-designer' }, { label: 'Color Palette Generator', href: '/color-palette-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_flyer-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
