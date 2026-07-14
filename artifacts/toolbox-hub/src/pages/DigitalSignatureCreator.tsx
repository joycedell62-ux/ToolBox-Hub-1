import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Signature, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Download, Undo2, Eraser } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'How do I draw my signature?', a: 'Sign with your mouse, trackpad, or finger on a touchscreen. The canvas captures your strokes smoothly using pointer events.' },
  { q: 'Does the download have a transparent background?', a: 'Yes. The PNG is exported with a fully transparent background so your signature drops cleanly onto documents, contracts, or images.' },
  { q: 'Can I undo a mistake?', a: 'Yes. Undo removes your last stroke, and Clear wipes the whole canvas so you can start fresh.' },
  { q: 'Can I change the pen?', a: 'Yes — adjust the stroke width and choose any ink color before or between strokes.' },
  { q: 'Is my signature private?', a: 'Completely. Nothing is uploaded — your drawing stays in your browser and is only saved when you download it.' },
];

const COLORS = ['#111827', '#1d4ed8', '#000000', '#7c3aed', '#b91c1c'];

export default function DigitalSignatureCreator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const strokes = useRef<{ x: number; y: number }[][]>([]);
  const current = useRef<{ x: number; y: number }[]>([]);
  const [color, setColor] = useState('#111827');
  const [width, setWidth] = useState(3);
  const [hasContent, setHasContent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    for (const stroke of strokes.current) {
      if (stroke.length < 2) {
        if (stroke.length === 1) {
          ctx.beginPath();
          ctx.arc(stroke[0].x, stroke[0].y, width / 2, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    }
    setHasContent(strokes.current.length > 0);
  }, [color, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      redraw();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [redraw]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    current.current = [pos(e)];
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    current.current.push(pos(e));
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const pts = current.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (current.current.length) strokes.current.push(current.current);
    current.current = [];
    setHasContent(strokes.current.length > 0);
  };

  const undo = () => { strokes.current.pop(); redraw(); };
  const clear = () => { strokes.current = []; redraw(); };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'signature.png';
    a.click();
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Signature className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Digital Signature Creator</h1><p className="text-blue-200 text-sm">draw · undo/clear · transparent PNG · touch ready</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Draw your signature with a mouse or finger and download it as a transparent PNG — perfect for signing PDFs and documents. Runs entirely in your browser.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
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
              <label className="block text-xs font-semibold text-gray-500 mb-1">Stroke width ({width}px)</label>
              <input type="range" min="1" max="10" step="1" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={undo} disabled={!hasContent} className="py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"><Undo2 className="w-4 h-4" /> Undo</button>
              <button onClick={clear} disabled={!hasContent} className="py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"><Eraser className="w-4 h-4" /> Clear</button>
            </div>
            <button onClick={download} disabled={!hasContent} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:scale-[1.02] disabled:hover:scale-100 shadow-sm flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download PNG
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• On a phone or tablet, sign with your finger for the most natural stroke.</li>
              <li>• A slightly thicker stroke (3–5px) usually looks best on documents.</li>
              <li>• The exported PNG is transparent — layer it directly onto a PDF or image.</li>
              <li>• Use Undo to remove the last stroke without starting over.</li>
              <li>• Your signature stays on your device; nothing is uploaded.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Draw your signature below</h2>
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-[repeating-linear-gradient(45deg,#f8fafc,#f8fafc_10px,#f1f5f9_10px,#f1f5f9_20px)]">
              <canvas
                ref={canvasRef}
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerLeave={up}
                className="w-full h-64 touch-none cursor-crosshair block"
                aria-label="Signature drawing canvas"
              />
            </div>
            {!hasContent && <p className="text-sm text-gray-400 mt-3 text-center">Sign above using your mouse or finger.</p>}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Signature Generator', href: '/signature-generator' }, { label: 'Invoice Numbers', href: '/invoice-number-generator' }, { label: 'QR Generator', href: '/qr-code-generator' }, { label: 'Barcode Generator', href: '/barcode-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_digital-signature-creator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
