import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What size is the poster?', a: 'A tall 2:3 poster ratio exported at 1200 × 1800 px — great for screens and clear enough for medium-size prints.' },
  { q: 'How is a poster different from a flyer?', a: 'Posters use bolder, larger typography meant to be seen from a distance. Flyers pack more detail for hand-held reading.' },
  { q: 'Can I use huge headlines?', a: 'Yes. Long headlines automatically wrap and scale within the safe area so they always fit.' },
  { q: 'Will it print sharp?', a: 'For large-format prints, this resolution suits up to ~A3. For bigger, recreate the layout in a vector tool.' },
  { q: 'Does anything upload?', a: 'No. Everything renders locally on a canvas element.' },
];

type Template = 'stack' | 'diagonal' | 'block' | 'outline';
const TEMPLATES: { id: Template; label: string }[] = [
  { id: 'stack', label: 'Stack' }, { id: 'diagonal', label: 'Diagonal' },
  { id: 'block', label: 'Block' }, { id: 'outline', label: 'Outline' },
];
const PALETTES = [
  { name: 'Blue', a: '#2563eb', b: '#1e3a8a', ink: '#0f172a', paper: '#ffffff' },
  { name: 'Noir', a: '#f59e0b', b: '#111827', ink: '#f9fafb', paper: '#0b0b0b' },
  { name: 'Punch', a: '#ec4899', b: '#7c3aed', ink: '#ffffff', paper: '#1e1b4b' },
  { name: 'Lime', a: '#84cc16', b: '#0f172a', ink: '#ecfccb', paper: '#111827' },
  { name: 'Coral', a: '#f97316', b: '#dc2626', ink: '#fff7ed', paper: '#7c2d12' },
  { name: 'Cream', a: '#0f172a', b: '#c9a227', ink: '#1f2937', paper: '#faf7f2' },
];

export default function PosterGenerator() {
  const [headline, setHeadline] = useState('LIVE IN CONCERT');
  const [subhead, setSubhead] = useState('The Midnight Echo Tour');
  const [date, setDate] = useState('SEPTEMBER 20');
  const [venue, setVenue] = useState('The Grand Hall');
  const [footer, setFooter] = useState('doors 7pm · tickets online');
  const [template, setTemplate] = useState<Template>('stack');
  const [palette, setPalette] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const wrap = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, align: CanvasTextAlign) => {
    ctx.textAlign = align;
    const words = text.split(' ');
    let line = ''; let yy = y;
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
    const px = (v: number) => v * (W / 1200);
    ctx.fillStyle = p.paper; ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';

    if (template === 'stack') {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, p.b); g.addColorStop(1, p.a);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${px(150)}px Arial, sans-serif`;
      let y = wrap(ctx, headline, W / 2, px(500), W - px(120), px(150), 'center');
      ctx.font = `600 ${px(56)}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      wrap(ctx, subhead, W / 2, y + px(30), W - px(160), px(70), 'center');
      ctx.font = `900 ${px(90)}px Arial, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(date, W / 2, H - px(340));
      ctx.font = `600 ${px(52)}px Arial, sans-serif`;
      ctx.fillText(venue, W / 2, H - px(250));
      ctx.font = `${px(40)}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(footer, W / 2, H - px(160));
    } else if (template === 'diagonal') {
      ctx.fillStyle = p.b; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = p.a;
      ctx.beginPath(); ctx.moveTo(0, px(300)); ctx.lineTo(W, 0); ctx.lineTo(W, px(900)); ctx.lineTo(0, px(1300)); ctx.closePath(); ctx.fill();
      ctx.fillStyle = p.ink;
      ctx.font = `900 ${px(140)}px Arial, sans-serif`;
      let y = wrap(ctx, headline, px(70), px(560), W - px(160), px(140), 'left');
      ctx.font = `600 ${px(52)}px Arial, sans-serif`;
      wrap(ctx, subhead, px(70), y + px(20), W - px(160), px(64), 'left');
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${px(84)}px Arial, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(date, px(70), H - px(320));
      ctx.font = `600 ${px(48)}px Arial, sans-serif`;
      ctx.fillText(venue, px(70), H - px(240));
      ctx.font = `${px(38)}px Arial, sans-serif`;
      ctx.fillText(footer, px(70), H - px(160));
    } else if (template === 'block') {
      ctx.fillStyle = p.paper; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = p.a; ctx.fillRect(0, px(120), W, px(560));
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${px(150)}px Arial, sans-serif`;
      wrap(ctx, headline, W / 2, px(420), W - px(120), px(150), 'center');
      ctx.fillStyle = p.ink;
      ctx.font = `700 ${px(60)}px Arial, sans-serif`;
      let y = wrap(ctx, subhead, W / 2, px(820), W - px(160), px(74), 'center');
      ctx.fillStyle = p.b;
      ctx.font = `900 ${px(96)}px Arial, sans-serif`;
      ctx.fillText(date, W / 2, y + px(90));
      ctx.fillStyle = p.ink;
      ctx.font = `600 ${px(52)}px Arial, sans-serif`;
      ctx.fillText(venue, W / 2, y + px(170));
      ctx.font = `${px(40)}px Arial, sans-serif`;
      ctx.fillText(footer, W / 2, H - px(160));
    } else {
      ctx.fillStyle = p.paper; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = p.a; ctx.lineWidth = px(16);
      ctx.strokeRect(px(60), px(60), W - px(120), H - px(120));
      ctx.fillStyle = p.ink;
      ctx.font = `900 ${px(150)}px Arial, sans-serif`;
      let y = wrap(ctx, headline, W / 2, px(520), W - px(200), px(150), 'center');
      ctx.strokeStyle = p.a; ctx.lineWidth = px(6);
      ctx.beginPath(); ctx.moveTo(W / 2 - px(120), y - px(60)); ctx.lineTo(W / 2 + px(120), y - px(60)); ctx.stroke();
      ctx.font = `600 ${px(56)}px Arial, sans-serif`;
      wrap(ctx, subhead, W / 2, y + px(40), W - px(220), px(68), 'center');
      ctx.fillStyle = p.a;
      ctx.font = `900 ${px(88)}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(date, W / 2, H - px(330));
      ctx.fillStyle = p.ink;
      ctx.font = `600 ${px(50)}px Arial, sans-serif`;
      ctx.fillText(venue, W / 2, H - px(250));
      ctx.font = `${px(38)}px Arial, sans-serif`;
      ctx.fillText(footer, W / 2, H - px(170));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = 1200; canvas.height = 1800;
    draw(ctx, 1200, 1800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headline, subhead, date, venue, footer, template, palette]);

  const download = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${(headline || 'poster').toLowerCase().replace(/\s+/g, '-').slice(0, 40)}-poster.png`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><ImageIcon className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Poster Generator</h1><p className="text-blue-200 text-sm">bold 2:3 posters · typographic templates · download PNG</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Make an eye-catching poster with bold, large-scale typography. Enter your headline and event details, pick a striking template and palette, and download a high-res PNG.</p>
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
              <label htmlFor="ft" className="block text-xs font-semibold text-gray-500 mb-1">Footer</label>
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
              <li>• Posters are read from across a room — keep the headline huge and short.</li>
              <li>• Uppercase headlines add impact for events and gigs.</li>
              <li>• Limit yourself to one big idea per poster.</li>
              <li>• High contrast between text and background boosts legibility.</li>
              <li>• Put the essential info (date, venue) in a consistent spot.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Live Preview (2:3)</h2>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 flex items-center justify-center">
              <canvas ref={canvasRef} className="w-full max-w-xs rounded-lg shadow-md" style={{ aspectRatio: '1200 / 1800' }} aria-label="Poster preview" />
            </div>
            <p className="text-xs text-gray-400 mt-3">Exports at 1200 × 1800 px.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Flyer Generator', href: '/flyer-generator' }, { label: 'Banner Creator', href: '/banner-creator' }, { label: 'Social Media Brand Kit', href: '/social-media-brand-kit' }, { label: 'Color Palette Generator', href: '/color-palette-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_poster-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
