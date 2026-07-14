import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Package, ThumbsUp, ThumbsDown, Lightbulb, ChevronDown, Download, Printer, RefreshCw, Shuffle } from 'lucide-react';
import { Link } from 'wouter';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { getRelatedTools } from '@/lib/tools';

const related = getRelatedTools('/shipping-label-generator', 4);

const FAQS = [
  { q: 'What barcode format is used?', a: 'CODE128, which supports any alphanumeric tracking number and is accepted by all major carriers.' },
  { q: 'Can I use my own tracking number?', a: 'Yes. Enter any tracking number in the field or click the dice icon to generate a random one.' },
  { q: 'Does this connect to any carrier?', a: 'No. This is a design tool only. It generates a printable label — no carrier integration or shipment booking.' },
  { q: 'What size is the label?', a: 'The label is designed for a standard 4×6 inch thermal label (the most common shipping label size). The PNG exports at 2× for crisp printing.' },
  { q: 'Does anything upload to a server?', a: 'No. Everything is generated locally in your browser.' },
];

function randTracking() {
  return 'TB' + Math.random().toString(36).toUpperCase().replace('.', '').slice(2, 14);
}

export default function ShippingLabelGenerator() {
  const [fromName, setFromName] = useState('ToolBox Corp');
  const [fromAddr, setFromAddr] = useState('123 Main Street');
  const [fromCity, setFromCity] = useState('New York');
  const [fromState, setFromState] = useState('NY');
  const [fromZip, setFromZip] = useState('10001');
  const [fromCountry, setFromCountry] = useState('USA');

  const [toName, setToName] = useState('Jane Smith');
  const [toAddr, setToAddr] = useState('456 Oak Avenue');
  const [toCity, setToCity] = useState('Los Angeles');
  const [toState, setToState] = useState('CA');
  const [toZip, setToZip] = useState('90001');
  const [toCountry, setToCountry] = useState('USA');

  const [tracking, setTracking] = useState('TB1A2B3C4D5E6F');
  const [weight, setWeight] = useState('2.5 lbs');
  const [service, setService] = useState('Priority Mail');
  const [showQr, setShowQr] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 4×6 inch at 150 DPI for display (600×400)
    const W = 600; const H = 400;
    canvas.width = W * 2; canvas.height = H * 2;
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Outer border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, W - 8, H - 8);

    // FROM section
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(8, 8, W - 16, 70);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, W - 16, 70);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px Arial, sans-serif';
    ctx.fillText('FROM:', 20, 25);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(fromName, 20, 40);
    ctx.font = '11px Arial, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`${fromAddr}, ${fromCity}, ${fromState} ${fromZip}`, 20, 55);
    ctx.fillText(fromCountry, 20, 68);

    // Service badge
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    const serviceText = service.toUpperCase();
    const stW = ctx.measureText(serviceText).width + 20;
    ctx.roundRect(W - stW - 16, 18, stW, 22, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(serviceText, W - 16, 33);

    // TO section (large, prominent)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.fillText('SHIP TO:', 20, 100);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText(toName, 20, 125);

    ctx.font = '14px Arial, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(toAddr, 20, 148);
    ctx.fillText(`${toCity}, ${toState} ${toZip}`, 20, 166);
    ctx.fillStyle = '#475569';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText(toCountry, 20, 182);

    // Divider
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(8, 200);
    ctx.lineTo(W - 8, 200);
    ctx.stroke();
    ctx.setLineDash([]);

    // Tracking number section
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px Arial, sans-serif';
    ctx.fillText('TRACKING NUMBER', 20, 216);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText(tracking || 'TB000000000000', 20, 232);

    // Weight
    if (weight) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px Arial, sans-serif';
      ctx.fillText('WEIGHT', W - 20, 216);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.fillText(weight, W - 20, 232);
    }

    // Barcode
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, tracking || 'TB000000000000', { format: 'CODE128', displayValue: false, width: 2, height: 50, margin: 0 });
        const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        await new Promise(r => { img.onload = r; img.onerror = r; });
        ctx.drawImage(img, 20, 245, showQr ? W - 150 : W - 40, 60);
      } catch {}
    }

    // QR Code
    if (showQr) {
      try {
        const qrText = `TO:${toName}\n${toAddr}\n${toCity},${toState} ${toZip}\n${toCountry}\nTracking:${tracking}`;
        const qrData = await QRCode.toDataURL(qrText, { width: 90, margin: 1 });
        const qrImg = new Image();
        qrImg.src = qrData;
        await new Promise(r => { qrImg.onload = r; qrImg.onerror = r; });
        ctx.drawImage(qrImg, W - 115, 248, 90, 90);
      } catch {}
    }

    // Footer
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(8, H - 26, W - 16, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ToolBox Hub · Free Online Shipping Label Generator · toolboxhub.io', W / 2, H - 13);
  }, [fromName, fromAddr, fromCity, fromState, fromZip, fromCountry, toName, toAddr, toCity, toState, toZip, toCountry, tracking, weight, service, showQr]);

  useEffect(() => { draw(); }, [draw]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `shipping-label-${(toName || 'label').replace(/\s+/g, '-').toLowerCase()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Shipping Label</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;}img{width:100%;max-width:600px;}</style></head><body><img src="${canvas.toDataURL()}" /></body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full py-10 px-4 text-white text-center" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex justify-center mb-3"><Package className="w-10 h-10 opacity-90" /></div>
        <h1 className="text-3xl font-bold mb-2">Shipping Label Generator</h1>
        <p className="text-blue-100 max-w-xl mx-auto">Create professional shipping labels with sender, receiver, barcode, and tracking number. Print-ready PNG download.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 mb-1">From (Sender)</h2>
            {[
              { label: 'Name / Company', value: fromName, set: setFromName },
              { label: 'Address', value: fromAddr, set: setFromAddr },
              { label: 'City', value: fromCity, set: setFromCity },
              { label: 'State / Province', value: fromState, set: setFromState },
              { label: 'ZIP / Postal Code', value: fromZip, set: setFromZip },
              { label: 'Country', value: fromCountry, set: setFromCountry },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 mb-1">To (Receiver)</h2>
            {[
              { label: 'Name / Company', value: toName, set: setToName },
              { label: 'Address', value: toAddr, set: setToAddr },
              { label: 'City', value: toCity, set: setToCity },
              { label: 'State / Province', value: toState, set: setToState },
              { label: 'ZIP / Postal Code', value: toZip, set: setToZip },
              { label: 'Country', value: toCountry, set: setToCountry },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 mb-1">Shipment Details</h2>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Tracking Number</label>
              <div className="flex gap-2">
                <input value={tracking} onChange={e => setTracking(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
                <button onClick={() => setTracking(randTracking())} title="Generate random tracking number"
                  className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-colors">
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Service Type</label>
              <select value={service} onChange={e => setService(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                {['Priority Mail', 'Express Mail', 'Standard Mail', 'Economy', 'Overnight', 'Same Day', 'International'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Weight (optional)</label>
              <input value={weight} onChange={e => setWeight(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={showQr} onChange={e => setShowQr(e.target.checked)} className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-slate-700">Include QR Code</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Live Preview</h2>
              <button onClick={draw} className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <canvas ref={canvasRef} className="max-w-full rounded-xl shadow-md border border-slate-100" style={{ maxHeight: '400px' }} />
            </div>
            {/* Hidden barcode SVG */}
            <svg ref={barcodeRef} className="hidden" />
            <div className="flex gap-3">
              <button onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                <Download className="w-4 h-4" /> Download PNG
              </button>
              <button onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-medium text-slate-700 transition-colors">
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><h3 className="font-semibold text-blue-900 text-sm">Pro Tips</h3></div>
            <ul className="space-y-1.5 text-sm text-blue-800">
              <li>• Print on 4×6 inch thermal label paper for the best fit.</li>
              <li>• Double-check the ZIP code and country — incorrect labels cause delivery failures.</li>
              <li>• The CODE128 barcode works with any carrier's scanner for tracking.</li>
              <li>• Add the QR code for extra scanability — useful for fragile or important parcels.</li>
              <li>• This tool generates the label design only; actual carrier booking is done separately.</li>
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
                <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_shipping-label-generator', v); }}
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
