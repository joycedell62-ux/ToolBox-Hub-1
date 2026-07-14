import React, { useState, useRef, useEffect } from 'react';
import { Barcode, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Download, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import JsBarcode from 'jsbarcode';

const FAQS = [
  { q: 'Which barcode formats can I generate?', a: 'CODE128 (any text/numbers), EAN-13 (13 digits), UPC-A (12 digits), and CODE39 (letters, numbers and a few symbols). Each has its own validation rules.' },
  { q: 'What is the difference between EAN-13 and UPC-A?', a: 'Both are retail product codes. EAN-13 uses 13 digits (international), UPC-A uses 12 digits (North America). The last digit is a checksum, computed automatically.' },
  { q: 'Why is my input rejected?', a: 'Each format restricts what characters and lengths are valid — e.g. EAN-13 needs exactly 12 or 13 digits. The tool shows a clear error explaining the requirement.' },
  { q: 'Can I download the barcode?', a: 'Yes. Click "Download PNG" to save a high-resolution transparent-free PNG rendered from the barcode canvas.' },
  { q: 'Does this work offline?', a: 'Yes. Barcodes are generated entirely in your browser with no network requests.' },
];

type Format = 'CODE128' | 'EAN13' | 'UPC' | 'CODE39';

const FORMATS: { id: Format; label: string; hint: string; sample: string }[] = [
  { id: 'CODE128', label: 'CODE128', hint: 'Any letters, numbers or symbols', sample: 'ToolBox-2024' },
  { id: 'EAN13', label: 'EAN-13', hint: 'Exactly 12 or 13 digits (last is checksum)', sample: '5901234123457' },
  { id: 'UPC', label: 'UPC-A', hint: 'Exactly 11 or 12 digits (last is checksum)', sample: '036000291452' },
  { id: 'CODE39', label: 'CODE39', hint: 'A–Z, 0–9, space, - . $ / + %', sample: 'TOOLBOX 39' },
];

function validate(format: Format, value: string): string | null {
  if (!value) return 'Enter a value to generate a barcode.';
  switch (format) {
    case 'EAN13':
      if (!/^\d{12,13}$/.test(value)) return 'EAN-13 requires exactly 12 or 13 digits.';
      return null;
    case 'UPC':
      if (!/^\d{11,12}$/.test(value)) return 'UPC-A requires exactly 11 or 12 digits.';
      return null;
    case 'CODE39':
      if (!/^[0-9A-Z\-. $/+%]+$/.test(value)) return 'CODE39 allows only A–Z, 0–9, space and - . $ / + %.';
      return null;
    case 'CODE128':
    default:
      return null;
  }
}

export default function BarcodeGenerator() {
  const [format, setFormat] = useState<Format>('CODE128');
  const [value, setValue] = useState('ToolBox-2024');
  const [displayValue, setDisplayValue] = useState(true);
  const [lineColor, setLineColor] = useState('#111827');
  const [barWidth, setBarWidth] = useState(2);
  const [height, setHeight] = useState(90);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const err = validate(format, value);
    setError(err);
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (err) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    try {
      JsBarcode(canvas, value, {
        format,
        displayValue,
        lineColor,
        width: barWidth,
        height,
        background: '#ffffff',
        margin: 12,
        font: 'monospace',
        fontSize: 16,
      });
    } catch (e) {
      setError('Could not render barcode: ' + ((e as Error).message || 'invalid input for this format.'));
    }
  }, [format, value, displayValue, lineColor, barWidth, height]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || error) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${format.toLowerCase()}.png`;
    a.click();
  };

  const useSample = () => {
    const f = FORMATS.find(x => x.id === format);
    if (f) setValue(f.sample);
  };

  const activeHint = FORMATS.find(f => f.id === format)?.hint;

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Barcode className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Barcode Generator</h1><p className="text-blue-200 text-sm">CODE128 · EAN-13 · UPC-A · CODE39 · PNG download</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Create scannable barcodes in multiple formats. Customize color and size, then download a PNG — all in your browser.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Format</label>
              <div className="grid grid-cols-2 gap-2">
                {FORMATS.map(f => (
                  <button key={f.id} onClick={() => setFormat(f.id)} className={`text-sm font-semibold rounded-xl px-3 py-2 border transition-colors ${format === f.id ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-700 hover:border-blue-300'}`}>{f.label}</button>
                ))}
              </div>
              {activeHint && <p className="text-xs text-gray-400 mt-1.5">{activeHint}</p>}
            </div>
            <div>
              <label htmlFor="bc-value" className="block text-xs font-semibold text-gray-500 mb-1">Value</label>
              <div className="flex gap-2">
                <input id="bc-value" type="text" value={value} onChange={e => setValue(e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={useSample} className="shrink-0 border border-gray-200 text-gray-600 rounded-xl px-3 hover:border-blue-300 transition-colors" aria-label="Use a sample value" title="Use a sample value"><RefreshCw className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Bar width ({barWidth})</label>
                <input type="range" min="1" max="4" step="1" value={barWidth} onChange={e => setBarWidth(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Height ({height})</label>
                <input type="range" min="40" max="160" step="10" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="bc-color" className="text-xs font-semibold text-gray-500">Bar color</label>
              <input id="bc-color" type="color" value={lineColor} onChange={e => setLineColor(e.target.value)} className="w-10 h-8 rounded border border-gray-200 cursor-pointer" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={displayValue} onChange={e => setDisplayValue(e.target.checked)} className="rounded w-4 h-4 accent-blue-600" />
              Show value text under barcode
            </label>
            <button onClick={download} disabled={!!error} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:scale-[1.02] disabled:hover:scale-100 shadow-sm flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download PNG
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Use CODE128 for general-purpose text and numbers — it’s the most flexible.</li>
              <li>• EAN-13 and UPC-A auto-add a checksum digit when you supply the shorter length.</li>
              <li>• Keep bar color dark and background light for reliable scanning.</li>
              <li>• Wider bars scan better at a distance but need more label space.</li>
              <li>• Everything runs offline — no data leaves your browser.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Preview</h2>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 flex items-center justify-center min-h-[180px] overflow-auto">
              {error ? (
                <p className="text-sm text-red-600 text-center">{error}</p>
              ) : (
                <canvas ref={canvasRef} className="max-w-full" aria-label="Generated barcode preview" />
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Barcode Scanner', href: '/barcode-scanner' }, { label: 'QR Generator', href: '/qr-code-generator' }, { label: 'QR Scanner', href: '/qr-scanner' }, { label: 'Invoice Numbers', href: '/invoice-number-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_barcode-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
