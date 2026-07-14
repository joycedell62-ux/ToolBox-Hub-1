import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CalendarDays, ThumbsUp, ThumbsDown, Lightbulb, ChevronDown, Download, Printer, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import QRCode from 'qrcode';
import { getRelatedTools } from '@/lib/tools';

const related = getRelatedTools('/appointment-card-generator', 4);

type CardType = 'Hospital' | 'Salon' | 'Business' | 'Clinic' | 'Consultation';
type Template = 'clean' | 'bordered' | 'gradient';

const CARD_TYPES: CardType[] = ['Hospital', 'Salon', 'Business', 'Clinic', 'Consultation'];
const TEMPLATES: { id: Template; label: string }[] = [
  { id: 'clean', label: 'Clean' },
  { id: 'bordered', label: 'Bordered' },
  { id: 'gradient', label: 'Gradient' },
];

const SCHEMES: Record<CardType, string> = {
  Hospital: '#0369a1',
  Salon: '#be185d',
  Business: '#1e40af',
  Clinic: '#065f46',
  Consultation: '#7c3aed',
};

const FAQS = [
  { q: 'What card types can I create?', a: 'Hospital, Salon, Business, Clinic, and Consultation appointment cards — each with a fitting colour scheme.' },
  { q: 'Can I include a QR code?', a: 'Yes. The QR code encodes the appointment details so the patient/client can scan to save it.' },
  { q: 'What size is the card?', a: 'Standard business card size (3.5 × 2 inches). The PNG exports at 2× resolution for crisp printing.' },
  { q: 'Does anything upload to a server?', a: 'No. Everything renders locally in your browser.' },
  { q: 'Can I print multiple cards?', a: "Click Print to open a print-ready page. Use your printer's layout options to print multiple per sheet." },
];

export default function AppointmentCardGenerator() {
  const [cardType, setCardType] = useState<CardType>('Hospital');
  const [template, setTemplate] = useState<Template>('clean');
  const [accentColor, setAccentColor] = useState(SCHEMES['Hospital']);
  const [clientName, setClientName] = useState('Jane Smith');
  const [practitioner, setPractitioner] = useState('Dr. Amara Osei');
  const [date, setDate] = useState('Monday, 14 July 2026');
  const [time, setTime] = useState('10:30 AM');
  const [location, setLocation] = useState('Suite 201, City Medical Centre');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [notes, setNotes] = useState('Please arrive 10 minutes early.');
  const [showQr, setShowQr] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1050; const H = 600;
    canvas.width = W * 2; canvas.height = H * 2;
    ctx.scale(2, 2);

    const accent = accentColor;
    const px = (v: number) => v;

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

    // Border
    if (template === 'bordered') {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, W - 12, H - 12);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      ctx.strokeRect(18, 18, W - 36, H - 36);
    }

    // Header
    if (template !== 'gradient') {
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, W, 110);
    }

    // Header text
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 18px Arial, sans-serif`;
    ctx.fillText(`${cardType.toUpperCase()} APPOINTMENT`, 40, 38);
    ctx.font = `12px Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('Please keep this card for your records', 40, 58);

    // Client name
    ctx.font = `bold 26px Arial, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(clientName, 40, 95);

    const textColor = template === 'gradient' ? '#f0f9ff' : '#1e293b';
    const mutedColor = template === 'gradient' ? 'rgba(255,255,255,0.7)' : '#64748b';

    // Details grid
    const rows = [
      { label: 'Practitioner', value: practitioner },
      { label: 'Date', value: date },
      { label: 'Time', value: time },
      { label: 'Location', value: location },
      { label: 'Phone', value: phone },
    ];
    let y = 145;
    const col1 = 40; const col2 = 200;
    rows.forEach(r => {
      ctx.font = `10px Arial, sans-serif`;
      ctx.fillStyle = mutedColor;
      ctx.textAlign = 'left';
      ctx.fillText(r.label.toUpperCase(), col1, y);
      ctx.font = `bold 13px Arial, sans-serif`;
      ctx.fillStyle = textColor;
      ctx.fillText(r.value, col2, y);
      // Subtle divider
      y += 28;
      if (template !== 'gradient') {
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(col1, y - 10);
        ctx.lineTo(showQr ? W - 180 : W - 40, y - 10);
        ctx.stroke();
      }
    });

    // Notes
    if (notes) {
      ctx.font = `italic 11px Arial, sans-serif`;
      ctx.fillStyle = mutedColor;
      ctx.fillText(notes, 40, y + 10);
    }

    // QR Code
    if (showQr) {
      try {
        const qrText = `${cardType} Appointment\nPatient: ${clientName}\nDoctor: ${practitioner}\nDate: ${date}\nTime: ${time}\nLocation: ${location}`;
        const qrData = await QRCode.toDataURL(qrText, { width: 120, margin: 1, color: { dark: template === 'gradient' ? '#ffffff' : '#0f172a', light: '#00000000' } });
        const qrImg = new Image();
        qrImg.src = qrData;
        await new Promise(r => { qrImg.onload = r; qrImg.onerror = r; });
        ctx.drawImage(qrImg, W - 150, 130, 120, 120);
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = mutedColor;
        ctx.fillText('Scan to save', W - 90, 260);
      } catch {}
    }

    // Footer
    if (template !== 'gradient') {
      ctx.fillStyle = accent;
      ctx.fillRect(0, H - 30, W, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${cardType} Appointment Card · Generated by ToolBox Hub`, W / 2, H - 10);
    }
  }, [cardType, template, accentColor, clientName, practitioner, date, time, location, phone, notes, showQr]);

  useEffect(() => { draw(); }, [draw]);

  // Sync accent when card type changes
  const handleCardTypeChange = (t: CardType) => {
    setCardType(t);
    setAccentColor(SCHEMES[t]);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `appointment-card-${clientName.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Appointment Card</title><style>body{margin:20px;display:flex;justify-content:center;}img{max-width:700px;width:100%;}</style></head><body><img src="${canvas.toDataURL()}" /></body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full py-10 px-4 text-white text-center" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex justify-center mb-3"><CalendarDays className="w-10 h-10 opacity-90" /></div>
        <h1 className="text-3xl font-bold mb-2">Appointment Card Generator</h1>
        <p className="text-blue-100 max-w-xl mx-auto">Create professional appointment cards for hospitals, salons, clinics, and businesses. Download as PNG or print.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Card Type</h2>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {CARD_TYPES.map(t => (
                <button key={t} onClick={() => handleCardTypeChange(t)}
                  className={`py-2 rounded-lg text-sm font-medium border transition-all ${cardType === t ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-700 hover:border-blue-300'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Template</label>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    className={`py-2 rounded-lg text-xs font-medium border transition-all ${template === t.id ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-700 hover:border-blue-300'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs text-slate-500 mb-1">Accent Color</label>
              <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 cursor-pointer" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 mb-1">Appointment Details</h2>
            {[
              { label: 'Client / Patient Name', value: clientName, set: setClientName },
              { label: 'Doctor / Practitioner', value: practitioner, set: setPractitioner },
              { label: 'Date', value: date, set: setDate },
              { label: 'Time', value: time, set: setTime },
              { label: 'Location / Address', value: location, set: setLocation },
              { label: 'Phone', value: phone, set: setPhone },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Notes / Instructions</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
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
              <canvas ref={canvasRef} className="max-w-full rounded-xl shadow-md" style={{ maxHeight: '360px' }} />
            </div>
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
              <li>• Include a phone number so clients can reschedule easily.</li>
              <li>• The QR code lets patients/clients scan and save details to their phone.</li>
              <li>• Print on card stock (glossy or matte) for a professional feel.</li>
              <li>• Business card size (3.5×2 in) fits standard wallets perfectly.</li>
              <li>• Add "Please bring this card to your appointment" in the notes field.</li>
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
                <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_appointment-card-generator', v); }}
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
