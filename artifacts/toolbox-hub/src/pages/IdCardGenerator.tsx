import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CreditCard, ThumbsUp, ThumbsDown, Lightbulb, ChevronDown, Download, Printer, RotateCcw, Upload, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { getRelatedTools } from '@/lib/tools';

type CardType = 'Employee' | 'Student' | 'Teacher' | 'Visitor' | 'Event Pass' | 'Church' | 'Membership' | 'Hospital Staff';
type Orientation = 'portrait' | 'landscape';
type Template = 'modern' | 'classic' | 'gradient' | 'minimal';

const CARD_TYPES: CardType[] = ['Employee', 'Student', 'Teacher', 'Visitor', 'Event Pass', 'Church', 'Membership', 'Hospital Staff'];
const TEMPLATES: { id: Template; label: string }[] = [
  { id: 'modern', label: 'Modern' },
  { id: 'classic', label: 'Classic' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'minimal', label: 'Minimal' },
];
const FAQS = [
  { q: 'What card types can I generate?', a: 'Employee ID, Student ID, Teacher ID, Visitor Badge, Event Pass, Church ID, Membership Card, and Hospital Staff ID.' },
  { q: 'Can I upload a photo?', a: 'Yes — click the photo upload area to add a portrait photo. It renders directly on the card.' },
  { q: 'Does anything get uploaded to a server?', a: 'No. Everything is generated locally in your browser. Photos and logos never leave your device.' },
  { q: 'Can I print the card?', a: 'Yes. Click Print to open a print-ready layout sized to the card dimensions.' },
  { q: 'What is the downloaded resolution?', a: 'The PNG is exported at 2× the canvas resolution for crisp printing.' },
];

const related = getRelatedTools('/id-card-generator', 4);

export default function IdCardGenerator() {
  const [cardType, setCardType] = useState<CardType>('Employee');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [template, setTemplate] = useState<Template>('modern');
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [name, setName] = useState('Alex Johnson');
  const [idNumber, setIdNumber] = useState('EMP-2024-001');
  const [department, setDepartment] = useState('Engineering');
  const [organization, setOrganization] = useState('ToolBox Corp');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(true);
  const [showBarcode, setShowBarcode] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setter(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isPortrait = orientation === 'portrait';
    const W = isPortrait ? 400 : 640;
    const H = isPortrait ? 640 : 400;
    canvas.width = W * 2;
    canvas.height = H * 2;
    ctx.scale(2, 2);

    const accent = accentColor;
    const light = '#f0f4ff';
    const dark = '#0f172a';

    // Background
    if (template === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, accent);
      grad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.fillRect(0, 0, W, H);

    // Header band
    if (template !== 'gradient') {
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, W, isPortrait ? 120 : 80);
    }

    // Org name
    ctx.textAlign = 'center';
    ctx.fillStyle = template === 'gradient' ? 'rgba(255,255,255,0.9)' : '#ffffff';
    ctx.font = `bold ${isPortrait ? 18 : 15}px Arial, sans-serif`;
    ctx.fillText(organization, W / 2, isPortrait ? 35 : 25);

    // Card type badge
    ctx.fillStyle = template === 'gradient' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.25)';
    const badgeY = isPortrait ? 45 : 32;
    const badgeW = Math.min(ctx.measureText(cardType.toUpperCase()).width + 24, W - 40);
    ctx.roundRect(W / 2 - badgeW / 2, badgeY, badgeW, 24, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 11px Arial, sans-serif`;
    ctx.fillText(cardType.toUpperCase(), W / 2, badgeY + 16);

    // Logo
    const logoY = isPortrait ? 72 : 45;
    if (logoUrl) {
      const img = new Image();
      img.src = logoUrl;
      await new Promise(r => { img.onload = r; img.onerror = r; });
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, logoY + 18, 18, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, W / 2 - 18, logoY, 36, 36);
      ctx.restore();
    }

    // Photo area
    if (isPortrait) {
      const photoX = W / 2 - 50;
      const photoY = 130;
      const photoSize = 100;
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.stroke();
      if (photoUrl) {
        const img = new Image();
        img.src = photoUrl;
        await new Promise(r => { img.onload = r; img.onerror = r; });
        ctx.clip();
        ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
      } else {
        ctx.fillStyle = light;
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '28px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👤', W / 2, photoY + photoSize / 2 + 10);
      }
      ctx.restore();

      // Name & details
      ctx.textAlign = 'center';
      ctx.fillStyle = template === 'gradient' ? '#ffffff' : dark;
      ctx.font = `bold 22px Arial, sans-serif`;
      ctx.fillText(name, W / 2, 258);

      ctx.fillStyle = template === 'gradient' ? 'rgba(255,255,255,0.8)' : accent;
      ctx.font = `14px Arial, sans-serif`;
      ctx.fillText(department, W / 2, 278);

      // Divider
      ctx.strokeStyle = template === 'gradient' ? 'rgba(255,255,255,0.2)' : '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 295);
      ctx.lineTo(W - 40, 295);
      ctx.stroke();

      // ID Number
      ctx.fillStyle = template === 'gradient' ? 'rgba(255,255,255,0.6)' : '#64748b';
      ctx.font = '11px Arial, sans-serif';
      ctx.fillText('ID NUMBER', W / 2, 315);
      ctx.fillStyle = template === 'gradient' ? '#ffffff' : dark;
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillText(idNumber, W / 2, 333);

      // QR Code
      if (showQr) {
        try {
          const qrData = await QRCode.toDataURL(`${organization} | ${name} | ${idNumber}`, { width: 80, margin: 1, color: { dark: template === 'gradient' ? '#ffffff' : '#0f172a', light: '#00000000' } });
          const qrImg = new Image();
          qrImg.src = qrData;
          await new Promise(r => { qrImg.onload = r; qrImg.onerror = r; });
          ctx.drawImage(qrImg, W / 2 - 40, 350, 80, 80);
        } catch {}
      }

      // Barcode
      if (showBarcode && barcodeRef.current) {
        const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        await new Promise(r => { img.onload = r; img.onerror = r; });
        ctx.drawImage(img, 40, showQr ? 445 : 355, W - 80, 36);
      }

      // Footer
      ctx.fillStyle = template === 'gradient' ? 'rgba(0,0,0,0.3)' : accent;
      ctx.fillRect(0, H - 28, W, 28);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('If found, please return to ' + organization, W / 2, H - 10);
    } else {
      // Landscape layout
      // Photo on left
      if (photoUrl) {
        const img = new Image();
        img.src = photoUrl;
        await new Promise(r => { img.onload = r; img.onerror = r; });
        ctx.save();
        ctx.beginPath();
        ctx.arc(100, 200, 60, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, 40, 140, 120, 120);
        ctx.restore();
      } else {
        ctx.fillStyle = light;
        ctx.beginPath();
        ctx.arc(100, 200, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '36px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👤', 100, 213);
      }
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(100, 200, 60, 0, Math.PI * 2);
      ctx.stroke();

      // Details
      ctx.textAlign = 'left';
      ctx.fillStyle = template === 'gradient' ? '#ffffff' : dark;
      ctx.font = 'bold 26px Arial, sans-serif';
      ctx.fillText(name, 185, 155);
      ctx.fillStyle = template === 'gradient' ? 'rgba(255,255,255,0.7)' : accent;
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText(department, 185, 178);
      ctx.fillStyle = template === 'gradient' ? 'rgba(255,255,255,0.5)' : '#64748b';
      ctx.font = '11px Arial, sans-serif';
      ctx.fillText('ID: ' + idNumber, 185, 200);

      if (showQr) {
        try {
          const qrData = await QRCode.toDataURL(`${organization} | ${name} | ${idNumber}`, { width: 70, margin: 1 });
          const qrImg = new Image();
          qrImg.src = qrData;
          await new Promise(r => { qrImg.onload = r; qrImg.onerror = r; });
          ctx.drawImage(qrImg, W - 100, 140, 70, 70);
        } catch {}
      }

      // Footer
      ctx.fillStyle = template === 'gradient' ? 'rgba(0,0,0,0.3)' : accent;
      ctx.fillRect(0, H - 28, W, 28);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('If found, please return to ' + organization, W / 2, H - 10);
    }
  }, [orientation, template, accentColor, name, idNumber, department, organization, photoUrl, logoUrl, showQr, showBarcode]);

  useEffect(() => {
    if (showBarcode && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, idNumber || 'ID-000', { format: 'CODE128', displayValue: false, width: 2, height: 40, margin: 0 });
      } catch {}
    }
  }, [showBarcode, idNumber]);

  useEffect(() => { draw(); }, [draw]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `id-card-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>ID Card</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff}img{max-width:100%}</style></head><body><img src="${canvas.toDataURL()}" /></body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="w-full py-10 px-4 text-white text-center" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex justify-center mb-3"><CreditCard className="w-10 h-10 opacity-90" /></div>
        <h1 className="text-3xl font-bold mb-2">Professional ID Card Generator</h1>
        <p className="text-blue-100 max-w-xl mx-auto">Create employee, student, visitor, and more ID cards with photo, QR code, and barcode. Download as PNG or print.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-5">
          {/* Card Type */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Card Type</h2>
            <div className="grid grid-cols-2 gap-2">
              {CARD_TYPES.map(t => (
                <button key={t} onClick={() => setCardType(t)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${cardType === t ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-700 hover:border-blue-300'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Orientation & Template */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
            <div>
              <h2 className="font-semibold text-slate-800 mb-2">Orientation</h2>
              <div className="flex gap-2">
                {(['portrait', 'landscape'] as Orientation[]).map(o => (
                  <button key={o} onClick={() => setOrientation(o)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border capitalize transition-all ${orientation === o ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-700 hover:border-blue-300'}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 mb-2">Template</h2>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    className={`py-2 rounded-lg text-sm font-medium border transition-all ${template === t.id ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-700 hover:border-blue-300'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-2">Accent Color</label>
              <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 cursor-pointer" />
            </div>
          </div>

          {/* Card Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 mb-1">Card Details</h2>
            {[
              { label: 'Full Name', value: name, set: setName },
              { label: 'ID Number', value: idNumber, set: setIdNumber },
              { label: 'Department / Title', value: department, set: setDepartment },
              { label: 'Organization', value: organization, set: setOrganization },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            ))}
          </div>

          {/* Photo & Logo Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 mb-1">Photo & Logo</h2>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, setPhotoUrl)} />
            <button onClick={() => photoInputRef.current?.click()}
              className="w-full flex items-center gap-2 justify-center py-3 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors">
              <Upload className="w-4 h-4" /> {photoUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, setLogoUrl)} />
            <button onClick={() => logoInputRef.current?.click()}
              className="w-full flex items-center gap-2 justify-center py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
              <Upload className="w-4 h-4" /> {logoUrl ? 'Change Logo' : 'Upload Logo'}
            </button>
          </div>

          {/* Options */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 mb-1">Options</h2>
            {[
              { label: 'Include QR Code', value: showQr, set: setShowQr },
              { label: 'Include Barcode', value: showBarcode, set: setShowBarcode },
            ].map(o => (
              <label key={o.label} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={o.value} onChange={e => o.set(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                <span className="text-sm text-slate-700">{o.label}</span>
              </label>
            ))}
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
              <canvas ref={canvasRef} className="max-w-full rounded-xl shadow-md" style={{ maxHeight: '500px', objectFit: 'contain' }} />
            </div>
            {/* Hidden barcode SVG for rendering */}
            <svg ref={barcodeRef} className="hidden" />
            <div className="flex gap-3 flex-wrap">
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

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-blue-900 text-sm">Pro Tips</h3>
            </div>
            <ul className="space-y-1.5 text-sm text-blue-800">
              <li>• Use a clear, front-facing photo with good lighting for best results.</li>
              <li>• The QR code encodes the org name, name, and ID number for quick scanning.</li>
              <li>• Portrait works best for standard ID card wallets; landscape for lanyards.</li>
              <li>• Use the Gradient template for a more premium look.</li>
              <li>• Print on CR80 card stock (3.375 × 2.125 in) for a professional finish.</li>
            </ul>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Frequently Asked Questions</h3>
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-slate-100 last:border-0">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center py-3 text-left text-sm font-medium text-slate-700 hover:text-blue-600">
                  {faq.q}
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="pb-3 text-sm text-slate-600">{faq.a}</p>}
              </div>
            ))}
          </div>

          {/* Related Tools */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {related.map(t => (
                <Link key={t.href} href={t.href}
                  className="p-3 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all">
                  <p className="font-medium text-sm text-slate-800">{t.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{t.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-center">
            <p className="text-sm text-slate-600 mb-3">Was this tool helpful?</p>
            <div className="flex justify-center gap-3">
              {(['up', 'down'] as const).map(v => (
                <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_id-card-generator', v); }}
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
