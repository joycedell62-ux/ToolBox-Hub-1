import React, { useState, useRef } from 'react';
import { PenTool, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Download, Check } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Are these real handwritten signatures?', a: 'They are stylized typed signatures using cursive/handwriting fonts. For a hand-drawn signature, use the Digital Signature Creator tool.' },
  { q: 'Which fonts are used?', a: 'A curated set of cursive and handwriting system fonts with sensible fallbacks, so signatures render even offline.' },
  { q: 'Can I change the color and slant?', a: 'Yes — pick any ink color and add an italic slant for a more natural, flowing look.' },
  { q: 'How do I download my signature?', a: 'Pick a style from the gallery, then click Download PNG. The signature is rendered on a transparent canvas so it drops cleanly onto documents.' },
  { q: 'Is this private?', a: 'Completely. Everything is generated in your browser — your name is never sent anywhere.' },
];

const FONTS: { name: string; stack: string }[] = [
  { name: 'Classic Script', stack: '"Brush Script MT", "Segoe Script", cursive' },
  { name: 'Elegant', stack: '"Snell Roundhand", "Apple Chancery", cursive' },
  { name: 'Flowing', stack: '"Lucida Handwriting", "Segoe Script", cursive' },
  { name: 'Casual', stack: '"Bradley Hand", "Comic Sans MS", cursive' },
  { name: 'Formal Italic', stack: 'Georgia, "Times New Roman", serif' },
  { name: 'Chancery', stack: '"Apple Chancery", "URW Chancery L", cursive' },
  { name: 'Handnote', stack: '"Ink Free", "Segoe Print", cursive' },
  { name: 'Signature Pro', stack: '"Zapfino", "Snell Roundhand", cursive' },
  { name: 'Modern', stack: '"Gabriola", "Segoe Script", cursive' },
  { name: 'Refined', stack: 'Palatino, "Palatino Linotype", serif' },
  { name: 'Freehand', stack: '"Segoe Print", "Bradley Hand", cursive' },
  { name: 'Vintage', stack: '"Monotype Corsiva", "Apple Chancery", cursive' },
];

const COLORS = ['#1e293b', '#1d4ed8', '#000000', '#7c3aed', '#b91c1c', '#0f766e'];

export default function SignatureGenerator() {
  const [name, setName] = useState('Alex Morgan');
  const [color, setColor] = useState('#1d4ed8');
  const [slant, setSlant] = useState(true);
  const [fontSize, setFontSize] = useState(56);
  const [selected, setSelected] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const download = () => {
    const font = FONTS[selected];
    const canvas = canvasRef.current || document.createElement('canvas');
    const scale = 3;
    const w = 800, h = 260;
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${slant ? 'italic ' : ''}${fontSize}px ${font.stack}`;
    ctx.fillText(name || 'Signature', w / 2, h / 2);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `signature-${(name || 'signature').replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><PenTool className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Signature Generator</h1><p className="text-blue-200 text-sm">typed signatures · 12 styles · color · slant · PNG</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Turn your name into a stylish typed signature. Choose from a dozen handwriting styles, pick your ink color, and download a transparent PNG.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="sig-name" className="block text-xs font-semibold text-gray-500 mb-1">Your name</label>
              <input id="sig-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Ink color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-lg border-2 transition-all ${color === c ? 'border-blue-600 scale-110' : 'border-gray-200'}`} style={{ background: c }} aria-label={`Select color ${c}`} />
                ))}
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer" aria-label="Custom ink color" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Size ({fontSize}px)</label>
              <input type="range" min="32" max="80" step="2" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={slant} onChange={e => setSlant(e.target.checked)} className="rounded w-4 h-4 accent-blue-600" />
              Italic slant
            </label>
            <button onClick={download} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              {downloaded ? <><Check className="w-4 h-4" /> Downloaded</> : <><Download className="w-4 h-4" /> Download PNG</>}
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Try several styles — the same name looks very different across fonts.</li>
              <li>• Dark blue and black ink read as the most authentic.</li>
              <li>• The downloaded PNG has a transparent background, so it layers onto any document.</li>
              <li>• Add a slant for a more natural, flowing signature.</li>
              <li>• Everything is generated locally — your name never leaves your browser.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Style Gallery — tap to select</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {FONTS.map((f, i) => (
                <button key={f.name} onClick={() => setSelected(i)} className={`text-left rounded-xl border p-4 transition-all ${selected === i ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/40' : 'border-gray-100 hover:border-blue-200 bg-gray-50'}`}>
                  <div className="h-16 flex items-center overflow-hidden">
                    <span className="truncate" style={{ fontFamily: f.stack, color, fontSize: 34, fontStyle: slant ? 'italic' : 'normal' }}>{name || 'Signature'}</span>
                  </div>
                  <span className="text-xs text-gray-400">{f.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Selected Preview</h2>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 flex items-center justify-center min-h-[140px]">
              <span className="truncate" style={{ fontFamily: FONTS[selected].stack, color, fontSize, fontStyle: slant ? 'italic' : 'normal' }}>{name || 'Signature'}</span>
            </div>
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Digital Signature', href: '/digital-signature-creator' }, { label: 'Invoice Numbers', href: '/invoice-number-generator' }, { label: 'QR Generator', href: '/qr-code-generator' }, { label: 'Barcode Generator', href: '/barcode-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_signature-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
