import React, { useState, useRef, useEffect } from 'react';
import { CreditCard, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What size is the exported card?', a: 'A standard 3.5 × 2 inch card at 300 DPI (1050 × 600 px), ready for professional printing.' },
  { q: 'Is a bleed included?', a: 'The preview is the trim size. If your printer needs a bleed, add ~0.125in margin in your print layout before ordering.' },
  { q: 'Can I print double-sided?', a: 'This designs the front. Export it, then design a simple back (logo + tagline) separately if needed.' },
  { q: 'Why is the text slightly different when downloaded?', a: 'The canvas uses system fonts for reliable rendering. Layout and colors match the preview exactly.' },
  { q: 'Does anything upload?', a: 'No. The card renders on a local canvas — nothing leaves your device.' },
];

type Template = 'classic' | 'sidebar' | 'centered' | 'minimal';
const TEMPLATES: { id: Template; label: string }[] = [
  { id: 'classic', label: 'Classic' }, { id: 'sidebar', label: 'Sidebar' },
  { id: 'centered', label: 'Centered' }, { id: 'minimal', label: 'Minimal' },
];
const SCHEMES = [
  { name: 'Blue', bg: '#ffffff', accent: '#2563eb', text: '#0f172a' },
  { name: 'Midnight', bg: '#0f172a', accent: '#38bdf8', text: '#f1f5f9' },
  { name: 'Emerald', bg: '#ffffff', accent: '#059669', text: '#0f172a' },
  { name: 'Charcoal', bg: '#1f2937', accent: '#f59e0b', text: '#f9fafb' },
  { name: 'Berry', bg: '#ffffff', accent: '#db2777', text: '#111827' },
  { name: 'Slate', bg: '#f8fafc', accent: '#334155', text: '#0f172a' },
];

export default function BusinessCardDesigner() {
  const [name, setName] = useState('Jordan Rivera');
  const [title, setTitle] = useState('Founder & CEO');
  const [company, setCompany] = useState('Northwind Studio');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [email, setEmail] = useState('jordan@northwind.co');
  const [site, setSite] = useState('northwind.co');
  const [template, setTemplate] = useState<Template>('classic');
  const [scheme, setScheme] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const draw = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    const s = SCHEMES[scheme];
    const px = (v: number) => v * (W / 1050);
    ctx.fillStyle = s.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';

    const drawLines = (x: number, startY: number, align: CanvasTextAlign) => {
      ctx.textAlign = align;
      ctx.fillStyle = s.text;
      ctx.font = `bold ${px(58)}px Arial, sans-serif`;
      ctx.fillText(name || 'Your Name', x, startY);
      ctx.fillStyle = s.accent;
      ctx.font = `${px(30)}px Arial, sans-serif`;
      ctx.fillText(title || '', x, startY + px(44));
      ctx.fillStyle = s.text;
      ctx.font = `600 ${px(28)}px Arial, sans-serif`;
      ctx.fillText(company || '', x, startY + px(88));
      ctx.fillStyle = s.text;
      ctx.font = `${px(24)}px Arial, sans-serif`;
      const contacts = [phone, email, site].filter(Boolean);
      contacts.forEach((c, i) => ctx.fillText(c, x, startY + px(150) + i * px(38)));
    };

    if (template === 'classic') {
      ctx.fillStyle = s.accent;
      ctx.fillRect(0, 0, W, px(14));
      drawLines(px(70), px(180), 'left');
    } else if (template === 'sidebar') {
      ctx.fillStyle = s.accent;
      ctx.fillRect(0, 0, px(320), H);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${px(46)}px Arial, sans-serif`;
      const initials = (name || 'YN').split(' ').map(w => w[0]).slice(0, 2).join('');
      ctx.beginPath();
      ctx.arc(px(160), px(300), px(80), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(initials.toUpperCase(), px(160), px(316));
      drawLines(px(390), px(200), 'left');
    } else if (template === 'centered') {
      ctx.fillStyle = s.accent;
      ctx.fillRect(0, 0, W, px(14));
      ctx.fillRect(0, H - px(14), W, px(14));
      drawLines(W / 2, px(200), 'center');
    } else {
      // minimal
      drawLines(px(70), px(200), 'left');
      ctx.strokeStyle = s.accent;
      ctx.lineWidth = px(4);
      ctx.beginPath();
      ctx.moveTo(px(70), px(140));
      ctx.lineTo(px(300), px(140));
      ctx.stroke();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 1050;
    canvas.height = 600;
    draw(ctx, 1050, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, title, company, phone, email, site, template, scheme]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${(name || 'business-card').toLowerCase().replace(/\s+/g, '-')}-card.png`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><CreditCard className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Business Card Designer</h1><p className="text-blue-200 text-sm">4 templates · color schemes · print-ready PNG</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Design a clean business card in the standard 3.5 × 2 ratio. Fill in your details, pick a template and color scheme, and download a 300 DPI print-ready PNG.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            {[
              { id: 'nm', label: 'Full name', val: name, set: setName }, { id: 'ti', label: 'Job title', val: title, set: setTitle },
              { id: 'co', label: 'Company', val: company, set: setCompany }, { id: 'ph', label: 'Phone', val: phone, set: setPhone },
              { id: 'em', label: 'Email', val: email, set: setEmail }, { id: 'st', label: 'Website', val: site, set: setSite },
            ].map(f => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                <input id={f.id} type="text" value={f.val} onChange={e => f.set(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Template</label>
              <div className="grid grid-cols-4 gap-2">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t.id)} aria-pressed={template === t.id} className={`text-xs font-semibold py-2 rounded-lg border transition-all ${template === t.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>{t.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Color scheme</label>
              <div className="grid grid-cols-3 gap-2">
                {SCHEMES.map((sc, i) => (
                  <button key={sc.name} onClick={() => setScheme(i)} aria-pressed={scheme === i} aria-label={`${sc.name} scheme`} className={`flex items-center gap-2 text-xs font-semibold py-2 px-2 rounded-lg border transition-all ${scheme === i ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                    <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ background: sc.accent }} />{sc.name}
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
              <li>• Include only essentials — name, title, one phone, one email, one URL.</li>
              <li>• Use your brand accent color to tie the card to your logo.</li>
              <li>• Leave breathing room; crowded cards look cheap.</li>
              <li>• When printing, ask for a 0.125in bleed and matte finish.</li>
              <li>• Keep the back simple: logo + tagline on a solid color.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Live Preview (3.5 × 2)</h2>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 flex items-center justify-center">
              <canvas ref={canvasRef} className="w-full max-w-md rounded-lg shadow-md" style={{ aspectRatio: '1050 / 600' }} aria-label="Business card preview" />
            </div>
            <p className="text-xs text-gray-400 mt-3">Exports at 1050 × 600 px (300 DPI).</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Logo Generator', href: '/logo-generator' }, { label: 'Flyer Generator', href: '/flyer-generator' }, { label: 'Brand Style Guide', href: '/brand-style-guide-generator' }, { label: 'Color Palette Generator', href: '/color-palette-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_business-card-designer', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
