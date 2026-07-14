import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, ThumbsUp, ThumbsDown, Lightbulb, ChevronDown, Download, Printer, Upload } from 'lucide-react';
import { Link } from 'wouter';
import { getRelatedTools } from '@/lib/tools';

const related = getRelatedTools('/passport-photo-maker', 4);

type CountrySpec = { name: string; w: number; h: number; unit: string; dpi: number };
const SPECS: CountrySpec[] = [
  { name: 'US Passport (2×2 in)', w: 51, h: 51, unit: 'mm', dpi: 300 },
  { name: 'UK Passport (35×45 mm)', w: 35, h: 45, unit: 'mm', dpi: 300 },
  { name: 'EU / Schengen (35×45 mm)', w: 35, h: 45, unit: 'mm', dpi: 300 },
  { name: 'India (35×35 mm)', w: 35, h: 35, unit: 'mm', dpi: 300 },
  { name: 'Canada (50×70 mm)', w: 50, h: 70, unit: 'mm', dpi: 300 },
  { name: 'Australia (35×45 mm)', w: 35, h: 45, unit: 'mm', dpi: 300 },
  { name: 'China (33×48 mm)', w: 33, h: 48, unit: 'mm', dpi: 300 },
  { name: 'South Africa (35×45 mm)', w: 35, h: 45, unit: 'mm', dpi: 300 },
];

const BG_OPTIONS = [
  { label: 'White', value: '#ffffff' },
  { label: 'Off-White', value: '#f5f5f0' },
  { label: 'Light Blue', value: '#d6e8f7' },
  { label: 'Light Gray', value: '#e8e8e8' },
];

const FAQS = [
  { q: 'What size does it output?', a: 'The single photo exports at the exact pixel size for the chosen country spec at 300 DPI. The print sheet puts 6 copies on an A4 layout.' },
  { q: 'Does my photo get uploaded?', a: 'No. Everything is processed locally in your browser. Your photo never leaves your device.' },
  { q: 'How do I get the right crop?', a: 'Upload a clear, front-facing photo. Use the crop sliders to center your face. The standard requires your face to fill 70–80% of the frame.' },
  { q: 'Which background colour should I use?', a: "Most countries require plain white or off-white. Check your government's official requirements before printing." },
  { q: 'Can I print multiple copies?', a: 'Yes. Click "Print Sheet (6 copies)" to get a standard A4 sheet with 6 photos arranged in a 2×3 grid.' },
];

export default function PassportPhotoMaker() {
  const [specIndex, setSpecIndex] = useState(0);
  const [bg, setBg] = useState('#ffffff');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropScale, setCropScale] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const spec = SPECS[specIndex];
  // Display canvas at a comfortable size (200px wide max)
  const displayW = 200;
  const displayH = Math.round((spec.h / spec.w) * displayW);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Export at 300 DPI equivalent: 1mm ≈ 11.81px at 300dpi
    const pxPerMm = 11.811;
    const exportW = Math.round(spec.w * pxPerMm);
    const exportH = Math.round(spec.h * pxPerMm);
    canvas.width = exportW;
    canvas.height = exportH;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, exportW, exportH);

    if (photoUrl) {
      const img = new Image();
      img.onload = () => {
        const scale = cropScale;
        const sw = img.naturalWidth * scale;
        const sh = img.naturalHeight * scale;
        // Center + offset
        const dx = (exportW - sw) / 2 + cropX * exportW;
        const dy = (exportH - sh) / 2 + cropY * exportH;
        ctx.drawImage(img, dx, dy, sw, sh);
      };
      img.src = photoUrl;
    } else {
      // Placeholder
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(0, 0, exportW, exportH);
      ctx.fillStyle = '#9ca3af';
      ctx.font = `bold ${Math.round(exportW * 0.08)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Upload Photo', exportW / 2, exportH / 2);
    }
  }, [spec, bg, photoUrl, cropX, cropY, cropScale]);

  useEffect(() => { draw(); }, [draw]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    draw();
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const a = document.createElement('a');
      a.download = `passport-photo-${spec.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    }, 100);
  };

  const handlePrintSheet = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const src = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    if (!win) return;
    // 2×3 grid on A4
    win.document.write(`<html><head><title>Passport Photos</title>
      <style>
        body{margin:0;padding:10mm;background:#fff;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:5mm;width:190mm;}
        img{width:100%;display:block;}
      </style></head><body>
      <div class="grid">
        ${Array(6).fill(`<img src="${src}" />`).join('')}
      </div>
      <script>window.onload=()=>window.print();<\/script>
      </body></html>`);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full py-10 px-4 text-white text-center" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex justify-center mb-3"><Camera className="w-10 h-10 opacity-90" /></div>
        <h1 className="text-3xl font-bold mb-2">Passport Photo Maker</h1>
        <p className="text-blue-100 max-w-xl mx-auto">Generate correctly-sized passport photos for any country. Upload, crop, set background, and download or print a sheet of 6.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Country / Spec</h2>
            <select value={specIndex} onChange={e => setSpecIndex(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              {SPECS.map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}
            </select>
            <p className="text-xs text-slate-400 mt-2">Size: {spec.w} × {spec.h} mm at {spec.dpi} DPI</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Background</h2>
            <div className="grid grid-cols-4 gap-2">
              {BG_OPTIONS.map(b => (
                <button key={b.value} onClick={() => setBg(b.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${bg === b.value ? 'border-blue-500' : 'border-slate-100'}`}>
                  <div className="w-8 h-8 rounded-lg border border-slate-200" style={{ background: b.value }} />
                  <span className="text-[10px] text-slate-600 text-center leading-tight">{b.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Photo</h2>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2 justify-center py-3 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors">
              <Upload className="w-4 h-4" /> {photoUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
          </div>

          {photoUrl && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
              <h2 className="font-semibold text-slate-800">Adjust Crop</h2>
              {[
                { label: 'Horizontal Position', value: cropX, set: setCropX, min: -0.5, max: 0.5, step: 0.01 },
                { label: 'Vertical Position', value: cropY, set: setCropY, min: -0.5, max: 0.5, step: 0.01 },
                { label: 'Zoom', value: cropScale, set: setCropScale, min: 0.5, max: 3, step: 0.05 },
              ].map(s => (
                <div key={s.label}>
                  <label className="block text-xs text-slate-500 mb-1">{s.label}</label>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                    onChange={e => s.set(Number(e.target.value))}
                    className="w-full accent-blue-600" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Live Preview</h2>
            <div className="flex flex-col items-center gap-4">
              <canvas ref={canvasRef}
                style={{ width: `${displayW}px`, height: `${displayH}px`, border: '2px solid #e2e8f0', borderRadius: '8px' }} />
              <p className="text-xs text-slate-400">{spec.name} — {spec.w}×{spec.h} mm</p>
            </div>
            <div className="mt-5 flex gap-3 flex-wrap">
              <button onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-sm">
                <Download className="w-4 h-4" /> Download PNG
              </button>
              <button onClick={handlePrintSheet}
                className="flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-medium text-slate-700 transition-colors text-sm">
                <Printer className="w-4 h-4" /> Print Sheet (6×)
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><h3 className="font-semibold text-blue-900 text-sm">Pro Tips</h3></div>
            <ul className="space-y-1.5 text-sm text-blue-800">
              <li>• Use a recent photo with a neutral expression and both eyes open.</li>
              <li>• Ensure your face takes up 70–80% of the frame for most country specs.</li>
              <li>• Avoid glasses and headwear (unless for religious reasons).</li>
              <li>• Plain white background is accepted by the most countries.</li>
              <li>• Print the sheet on 6×4 inch photo paper for best results.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Frequently Asked Questions</h3>
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-slate-100 last:border-0">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center py-3 text-left text-sm font-medium text-slate-700 hover:text-blue-600">
                  {faq.q}<ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="pb-3 text-sm text-slate-600">{faq.a}</p>}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {related.map(t => (
                <Link key={t.href} href={t.href} className="p-3 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all">
                  <p className="font-medium text-sm text-slate-800">{t.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{t.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-center">
            <p className="text-sm text-slate-600 mb-3">Was this tool helpful?</p>
            <div className="flex justify-center gap-3">
              {(['up', 'down'] as const).map(v => (
                <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_passport-photo-maker', v); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm transition-all ${feedback === v ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                  {v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                  {v === 'up' ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
            {feedback && <p className="text-xs text-slate-400 mt-2">Thanks for your feedback!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
