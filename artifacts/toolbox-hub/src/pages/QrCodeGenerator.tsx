import React, { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import {
  Download, QrCode as QrIcon, Copy, Check, RefreshCw, AlertCircle, CheckCircle2,
  FileImage, Share2, Printer, Loader2, Trash2, Clock, Lightbulb, LayoutGrid,
  Upload, Eye, ZoomIn, X, ChevronDown, ChevronUp, FileText, Star,
  ThumbsUp, ThumbsDown, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type QrType = 'website'|'email'|'phone'|'sms'|'location'|'wifi'|'contact'|'whatsapp';
type ModStyle = 'square'|'rounded';
type ECL = 'L'|'M'|'Q'|'H';

interface QrCfg {
  type: QrType;
  // Website
  url: string;
  // Email
  emailTo: string; emailSubject: string; emailBody: string;
  // Phone
  phone: string;
  // SMS
  smsPhone: string; smsMessage: string;
  // Location
  lat: string; lng: string;
  // WiFi
  wifiSsid: string; wifiPassword: string; wifiSecurity: 'WPA'|'WEP'|'nopass'; wifiHidden: boolean;
  // Contact
  vName: string; vPhone: string; vEmail: string; vOrg: string; vTitle: string; vAddress: string;
  // WhatsApp
  waPhone: string; waMessage: string;
  // Customization
  fgColor: string; bgColor: string; moduleStyle: ModStyle; margin: number; size: number;
  logoDataUrl: string; errorCorrection: ECL;
}

interface HistItem {
  id: string;
  type: QrType;
  content: string;
  label: string;
  dataUrl: string;
  createdAt: number;
  size: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const QR_TYPES: { id: QrType; label: string; emoji: string }[] = [
  { id: 'website',   label: 'Website',   emoji: '🌐' },
  { id: 'email',     label: 'Email',     emoji: '📧' },
  { id: 'phone',     label: 'Phone',     emoji: '📞' },
  { id: 'sms',       label: 'SMS',       emoji: '💬' },
  { id: 'location',  label: 'Location',  emoji: '📍' },
  { id: 'wifi',      label: 'Wi-Fi',     emoji: '📶' },
  { id: 'contact',   label: 'Contact',   emoji: '👤' },
  { id: 'whatsapp',  label: 'WhatsApp',  emoji: '🟢' },
];

const SIZES = [
  { label: 'Small',  value: 128 },
  { label: 'Medium', value: 256 },
  { label: 'Large',  value: 512 },
  { label: 'Custom', value: 0   },
];

const RELATED = [
  { label: 'Password Generator', href: '/password-generator', emoji: '🔐' },
  { label: 'Certificate Generator', href: '/certificate-generator', emoji: '🏆' },
  { label: 'Resume Builder', href: '/resume-builder', emoji: '📄' },
  { label: 'Invoice Generator', href: '/invoice-generator', emoji: '🧾' },
];

const HIST_KEY = 'tbh-qr-history';
const FB_KEY   = 'tbh-qr-feedback';
const MAX_HIST = 5;

const DEFAULT_CFG: QrCfg = {
  type: 'website',
  url: '', emailTo: '', emailSubject: '', emailBody: '',
  phone: '', smsPhone: '', smsMessage: '',
  lat: '', lng: '',
  wifiSsid: '', wifiPassword: '', wifiSecurity: 'WPA', wifiHidden: false,
  vName: '', vPhone: '', vEmail: '', vOrg: '', vTitle: '', vAddress: '',
  waPhone: '', waMessage: '',
  fgColor: '#1e3a8a', bgColor: '#ffffff', moduleStyle: 'rounded', margin: 2, size: 256,
  logoDataUrl: '', errorCorrection: 'H',
};

// ─── Content builder ──────────────────────────────────────────────────────────

function buildContent(c: QrCfg): string {
  switch (c.type) {
    case 'website':   return c.url.trim();
    case 'email': {
      const p: string[] = [];
      if (c.emailSubject) p.push(`subject=${encodeURIComponent(c.emailSubject)}`);
      if (c.emailBody)    p.push(`body=${encodeURIComponent(c.emailBody)}`);
      return `mailto:${c.emailTo}${p.length ? '?' + p.join('&') : ''}`;
    }
    case 'phone':     return `tel:${c.phone.replace(/\s/g, '')}`;
    case 'sms':       return `smsto:${c.smsPhone.replace(/\s/g, '')}:${c.smsMessage}`;
    case 'location':  return (c.lat && c.lng) ? `geo:${c.lat},${c.lng}` : '';
    case 'wifi':      return `WIFI:T:${c.wifiSecurity};S:${c.wifiSsid};P:${c.wifiPassword};${c.wifiHidden ? 'H:true;' : ''};`;
    case 'contact':
      return ['BEGIN:VCARD','VERSION:3.0',
        c.vName    ? `FN:${c.vName}` : '',
        c.vName    ? `N:${c.vName}` : '',
        c.vPhone   ? `TEL:${c.vPhone}` : '',
        c.vEmail   ? `EMAIL:${c.vEmail}` : '',
        c.vOrg     ? `ORG:${c.vOrg}` : '',
        c.vTitle   ? `TITLE:${c.vTitle}` : '',
        c.vAddress ? `ADR:${c.vAddress}` : '',
        'END:VCARD',
      ].filter(Boolean).join('\n');
    case 'whatsapp': {
      const num = c.waPhone.replace(/\D/g, '');
      return `https://wa.me/${num}${c.waMessage ? `?text=${encodeURIComponent(c.waMessage)}` : ''}`;
    }
    default: return '';
  }
}

function getTypeName(type: QrType) {
  return QR_TYPES.find(t => t.id === type)?.label ?? type;
}

// ─── Canvas renderer ──────────────────────────────────────────────────────────

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function renderQr(
  canvas: HTMLCanvasElement, content: string,
  cfg: Pick<QrCfg, 'fgColor'|'bgColor'|'moduleStyle'|'margin'|'size'|'logoDataUrl'|'errorCorrection'>
): Promise<void> {
  const qr = QRCode.create(content, { errorCorrectionLevel: cfg.errorCorrection });
  const mc  = qr.modules.size;
  const px  = cfg.size;
  const mgn = Math.round((px / mc) * cfg.margin);
  const mp  = (px - 2 * mgn) / mc;

  canvas.width  = px;
  canvas.height = px;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = cfg.bgColor;
  ctx.fillRect(0, 0, px, px);
  ctx.fillStyle = cfg.fgColor;

  for (let r = 0; r < mc; r++) {
    for (let c = 0; c < mc; c++) {
      if (!qr.modules.get(r, c)) continue;
      const x = mgn + c * mp;
      const y = mgn + r * mp;
      const w = mp * 0.92;
      if (cfg.moduleStyle === 'rounded') { rr(ctx, x, y, w, w, w * 0.36); ctx.fill(); }
      else ctx.fillRect(x, y, w, w);
    }
  }

  if (cfg.logoDataUrl) {
    const img = new Image();
    await new Promise<void>(res => { img.onload = () => res(); img.onerror = () => res(); img.src = cfg.logoDataUrl; });
    const ls  = px * 0.22;
    const lx  = (px - ls) / 2;
    const ly  = (px - ls) / 2;
    const pad = 8;
    ctx.fillStyle = cfg.bgColor;
    rr(ctx, lx - pad, ly - pad, ls + pad * 2, ls + pad * 2, 10);
    ctx.fill();
    ctx.drawImage(img, lx, ly, ls, ls);
  }
}

// ─── History helpers ──────────────────────────────────────────────────────────

function loadHistory(): HistItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(HIST_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function saveHistory(items: HistItem[]) {
  try { localStorage.setItem(HIST_KEY, JSON.stringify(items)); } catch {}
}

// ─── Feedback helpers ─────────────────────────────────────────────────────────

interface FBState { rating: 'up'|'down'|null; reports: { id:string; type:string; text:string; ts:number }[] }
function loadFeedback(): FBState {
  try {
    const p = JSON.parse(localStorage.getItem(FB_KEY) ?? 'null');
    if (!p || typeof p !== 'object' || Array.isArray(p)) return { rating: null, reports: [] };
    return { rating: p.rating ?? null, reports: Array.isArray(p.reports) ? p.reports : [] };
  } catch { return { rating: null, reports: [] }; }
}

// ─── Form field helper ────────────────────────────────────────────────────────

function F({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-gray-600">
        {label}{optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}
      </Label>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QrCodeGenerator() {
  const [cfg, setCfg]           = useState<QrCfg>(DEFAULT_CFG);
  const [customSize, setCS]     = useState(512);
  const [sizeMode, setSMode]    = useState<number>(256); // 0 = custom
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);   // live preview active
  const [error, setError]       = useState('');
  const [copied, setCopied]     = useState<string>('');
  const [history, setHistory]   = useState<HistItem[]>(loadHistory);
  const [feedback, setFeedback] = useState<FBState>(loadFeedback);
  const [fbForm, setFbForm]     = useState(false);
  const [fbType, setFbType]     = useState('Bug Report');
  const [fbText, setFbText]     = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [zoom, setZoom]         = useState(false);
  const [genCreatedAt, setGCA]  = useState('');

  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const logoInputRef  = useRef<HTMLInputElement>(null);
  const resultRef     = useRef<HTMLDivElement>(null);
  const { toast }     = useToast();

  const content = buildContent(cfg);
  const isValid = content.trim().length > 0;

  // ── Live canvas update ────────────────────────────────────────────────────

  useEffect(() => {
    if (!isValid || !canvasRef.current) { setHasDraft(false); return; }
    const timer = setTimeout(async () => {
      try {
        await renderQr(canvasRef.current!, content, cfg);
        setHasDraft(true);
      } catch { setHasDraft(false); }
    }, 200);
    return () => clearTimeout(timer);
  }, [content, cfg.fgColor, cfg.bgColor, cfg.moduleStyle, cfg.margin, cfg.size, cfg.logoDataUrl, cfg.errorCorrection]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const set = <K extends keyof QrCfg>(key: K, val: QrCfg[K]) => setCfg(p => ({ ...p, [key]: val }));
  const setType = (t: QrType) => { setCfg(p => ({ ...p, type: t })); setGenerated(false); setError(''); };

  const handleSizeBtn = (val: number) => {
    setSMode(val);
    if (val > 0) set('size', val);
  };

  const handleGenerate = useCallback(async () => {
    if (!isValid) { setError('Please fill in the required fields.'); return; }
    setError('');
    setGenerating(true);
    try {
      const size = sizeMode > 0 ? sizeMode : customSize;
      const actualCfg = { ...cfg, size };
      await renderQr(canvasRef.current!, content, actualCfg);
      setGenerated(true);
      const ts = new Date().toLocaleString();
      setGCA(ts);
      // Save to history
      const dataUrl = canvasRef.current!.toDataURL('image/png');
      const item: HistItem = {
        id: `${Date.now()}`, type: cfg.type,
        content, label: content.slice(0, 50),
        dataUrl, createdAt: Date.now(), size,
      };
      const next = [item, ...history.filter(h => h.content !== content)].slice(0, MAX_HIST);
      setHistory(next);
      saveHistory(next);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    } catch (e) {
      setError('Failed to generate QR code. Please check your input.');
    } finally { setGenerating(false); }
  }, [cfg, content, customSize, sizeMode, history, isValid]);

  const downloadPng = () => {
    if (!canvasRef.current) return;
    const a = document.createElement('a');
    a.href = canvasRef.current.toDataURL('image/png');
    a.download = `qrcode-${cfg.type}.png`;
    a.click();
    toast({ title: 'PNG Downloaded!', duration: 2000 });
  };

  const downloadSvg = async () => {
    try {
      const svg = await QRCode.toString(content, {
        type: 'svg', margin: cfg.margin,
        color: { dark: cfg.fgColor, light: cfg.bgColor },
        errorCorrectionLevel: cfg.errorCorrection,
        width: sizeMode > 0 ? sizeMode : customSize,
      });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `qrcode-${cfg.type}.svg`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'SVG Downloaded!', duration: 2000 });
    } catch { toast({ title: 'Export failed', variant: 'destructive' }); }
  };

  const downloadPdf = () => {
    if (!canvasRef.current) return;
    const img  = canvasRef.current.toDataURL('image/png');
    const pdf  = new jsPDF({ unit: 'mm', format: 'a4' });
    const qSz  = 150;
    const x    = (210 - qSz) / 2;
    const y    = 30;
    pdf.setFontSize(18); pdf.setTextColor(30, 58, 138);
    pdf.text('QR Code', 105, 20, { align: 'center' });
    pdf.addImage(img, 'PNG', x, y, qSz, qSz);
    pdf.setFontSize(9); pdf.setTextColor(100, 100, 100);
    pdf.text(`Type: ${getTypeName(cfg.type)}`, 105, y + qSz + 10, { align: 'center' });
    const preview = content.length > 60 ? content.slice(0, 60) + '…' : content;
    pdf.text(preview, 105, y + qSz + 16, { align: 'center' });
    pdf.text('📱 Scan with your phone camera', 105, y + qSz + 24, { align: 'center' });
    pdf.save(`qrcode-${cfg.type}.pdf`);
    toast({ title: 'PDF Downloaded!', duration: 2000 });
  };

  const copyImage = async () => {
    if (!canvasRef.current) return;
    try {
      const blob: Blob = await new Promise((res, rej) =>
        canvasRef.current!.toBlob(b => b ? res(b) : rej(), 'image/png'));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied('img'); toast({ title: 'Image copied!', duration: 2000 });
      setTimeout(() => setCopied(''), 2000);
    } catch { toast({ title: 'Copy not supported in this browser', variant: 'destructive' }); }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied('link'); toast({ title: 'Copied to clipboard!', duration: 2000 });
      setTimeout(() => setCopied(''), 2000);
    } catch {}
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    try {
      const blob: Blob = await new Promise((res, rej) =>
        canvasRef.current!.toBlob(b => b ? res(b) : rej(), 'image/png'));
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'QR Code', text: content });
      } else if (navigator.share) {
        await navigator.share({
          title: 'QR Code', text: content,
          ...(cfg.type === 'website' && cfg.url ? { url: cfg.url } : {}),
        });
      } else {
        toast({ title: 'Sharing not supported', description: 'Use Download instead.', variant: 'destructive' });
      }
    } catch {}
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const win = window.open('', '_blank');
    if (!win) { toast({ title: 'Allow popups for printing', variant: 'destructive' }); return; }
    win.document.write(`<html><head><title>QR Code</title><style>*{margin:0;padding:0;box-sizing:border-box}body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#fff;gap:16px;font-family:sans-serif;color:#374151}p{font-size:12px;color:#6b7280}@media print{body{padding:0}}</style></head><body><img src="${url}" style="max-width:80vmin"/><p>${content.slice(0, 80)}</p></body></html>`);
    win.document.close();
    win.onload = () => { win.print(); setTimeout(() => win.close(), 500); };
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('logoDataUrl', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setCfg(DEFAULT_CFG); setGenerated(false); setError(''); setHasDraft(false); setSMode(256);
    if (canvasRef.current) { const ctx = canvasRef.current.getContext('2d'); ctx?.clearRect(0, 0, 9999, 9999); }
  };

  const regenerateFromHistory = (item: HistItem) => {
    setCfg(p => ({ ...p, type: item.type, url: item.content }));
    setGenerated(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteHistory = (id: string) => {
    const next = history.filter(h => h.id !== id);
    setHistory(next); saveHistory(next);
  };

  const submitFeedback = () => {
    if (!fbText.trim()) return;
    const rep = { id: `${Date.now()}`, type: fbType, text: fbText, ts: Date.now() };
    const next: FBState = { ...feedback, reports: [rep, ...feedback.reports] };
    setFeedback(next);
    try { localStorage.setItem(FB_KEY, JSON.stringify(next)); } catch {}
    setFbText(''); setFbForm(false);
    toast({ title: 'Thank you for your feedback!', duration: 2500 });
  };

  const setRating = (r: 'up'|'down') => {
    const next: FBState = { ...feedback, rating: r };
    setFeedback(next);
    try { localStorage.setItem(FB_KEY, JSON.stringify(next)); } catch {}
    toast({ title: r === 'up' ? '🎉 Glad it helped!' : 'Thanks for letting us know', duration: 2000 });
  };

  // ── QR Info ───────────────────────────────────────────────────────────────

  const qrSize = sizeMode > 0 ? sizeMode : customSize;
  const contentLen = content.length;

  return (
    <div className="max-w-screen-xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">QR Code Generator</h1>
        <p className="text-muted-foreground">Generate premium QR codes for websites, contacts, Wi-Fi, and more — free, in your browser</p>
      </div>

      {/* ── Workflow indicator ── */}
      <div className="flex items-center justify-center gap-1 mb-8 flex-wrap text-xs font-semibold text-gray-400">
        {['1 Enter Data','2 Customize','3 Generate','4 Download / Share'].map((s, i) => (
          <React.Fragment key={s}>
            <span className={`px-3 py-1.5 rounded-full border transition-colors ${
              (i === 0 && isValid) || (i === 1) || (i === 2 && generated) || (i === 3 && generated)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-gray-200 text-gray-400'
            }`}>{s}</span>
            {i < 3 && <span className="text-gray-300">›</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-6 items-start">

        {/* ════════════════ LEFT PANEL — FORM ════════════════ */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-5 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">

          {/* Type tabs */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700 block">QR Code Type</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {QR_TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 text-xs font-semibold border transition-all cursor-pointer ${
                    cfg.type === t.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}>
                  <span className="text-lg leading-none">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t" />

          {/* ── Type-specific fields ── */}
          {cfg.type === 'website' && (
            <F label="Website URL">
              <Input placeholder="https://example.com" value={cfg.url}
                onChange={e => set('url', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()} autoFocus />
            </F>
          )}

          {cfg.type === 'email' && (
            <div className="space-y-3">
              <F label="Email Address"><Input placeholder="hello@example.com" value={cfg.emailTo} onChange={e => set('emailTo', e.target.value)} /></F>
              <F label="Subject" optional><Input placeholder="Hello!" value={cfg.emailSubject} onChange={e => set('emailSubject', e.target.value)} /></F>
              <F label="Message" optional>
                <textarea rows={3} placeholder="Write your message here…" value={cfg.emailBody} onChange={e => set('emailBody', e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </F>
            </div>
          )}

          {cfg.type === 'phone' && (
            <F label="Phone Number"><Input placeholder="+1 555 000 0000" value={cfg.phone} onChange={e => set('phone', e.target.value)} /></F>
          )}

          {cfg.type === 'sms' && (
            <div className="space-y-3">
              <F label="Phone Number"><Input placeholder="+1 555 000 0000" value={cfg.smsPhone} onChange={e => set('smsPhone', e.target.value)} /></F>
              <F label="Message" optional>
                <textarea rows={2} placeholder="Your SMS message…" value={cfg.smsMessage} onChange={e => set('smsMessage', e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </F>
            </div>
          )}

          {cfg.type === 'location' && (
            <div className="space-y-3">
              <F label="Latitude"><Input placeholder="40.7128" value={cfg.lat} onChange={e => set('lat', e.target.value)} /></F>
              <F label="Longitude"><Input placeholder="-74.0060" value={cfg.lng} onChange={e => set('lng', e.target.value)} /></F>
              <p className="text-xs text-gray-400">💡 Find coordinates on Google Maps → right-click a location.</p>
            </div>
          )}

          {cfg.type === 'wifi' && (
            <div className="space-y-3">
              <F label="Network Name (SSID)"><Input placeholder="MyWiFiNetwork" value={cfg.wifiSsid} onChange={e => set('wifiSsid', e.target.value)} /></F>
              <F label="Password"><Input type="password" placeholder="••••••••" value={cfg.wifiPassword} onChange={e => set('wifiPassword', e.target.value)} /></F>
              <F label="Security">
                <select value={cfg.wifiSecurity} onChange={e => set('wifiSecurity', e.target.value as QrCfg['wifiSecurity'])}
                  className="w-full border rounded-md px-3 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                  <option value="WPA">WPA / WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">No Password</option>
                </select>
              </F>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={cfg.wifiHidden} onChange={e => set('wifiHidden', e.target.checked)} className="rounded" />
                Hidden network
              </label>
            </div>
          )}

          {cfg.type === 'contact' && (
            <div className="space-y-3">
              <F label="Full Name"><Input placeholder="Jane Smith" value={cfg.vName} onChange={e => set('vName', e.target.value)} /></F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Phone" optional><Input placeholder="+1 555 0000" value={cfg.vPhone} onChange={e => set('vPhone', e.target.value)} /></F>
                <F label="Email" optional><Input placeholder="jane@example.com" value={cfg.vEmail} onChange={e => set('vEmail', e.target.value)} /></F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label="Organization" optional><Input placeholder="Company Inc." value={cfg.vOrg} onChange={e => set('vOrg', e.target.value)} /></F>
                <F label="Job Title" optional><Input placeholder="Designer" value={cfg.vTitle} onChange={e => set('vTitle', e.target.value)} /></F>
              </div>
              <F label="Address" optional><Input placeholder="123 Main St, City" value={cfg.vAddress} onChange={e => set('vAddress', e.target.value)} /></F>
            </div>
          )}

          {cfg.type === 'whatsapp' && (
            <div className="space-y-3">
              <F label="WhatsApp Number"><Input placeholder="+1 555 000 0000" value={cfg.waPhone} onChange={e => set('waPhone', e.target.value)} /></F>
              <F label="Pre-filled Message" optional>
                <textarea rows={2} placeholder="Hello! I'd like to…" value={cfg.waMessage} onChange={e => set('waMessage', e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </F>
            </div>
          )}

          {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </p>
          )}

          <div className="border-t" />

          {/* ── Customization ── */}
          <div>
            <button type="button" onClick={() => setShowCustom(v => !v)}
              className="flex items-center gap-2 w-full text-sm font-bold text-gray-700 pb-2 hover:text-blue-600 transition-colors">
              <LayoutGrid className="w-4 h-4 text-blue-500" />
              Customize QR Code
              {showCustom ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
            </button>

            {showCustom && (
              <div className="space-y-4 pt-2">
                {/* Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <F label="Foreground Color">
                    <div className="flex items-center gap-2 border rounded-md px-3 h-9 bg-white">
                      <input type="color" value={cfg.fgColor} onChange={e => set('fgColor', e.target.value)} className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent" />
                      <span className="text-xs font-mono text-gray-600">{cfg.fgColor}</span>
                    </div>
                  </F>
                  <F label="Background Color">
                    <div className="flex items-center gap-2 border rounded-md px-3 h-9 bg-white">
                      <input type="color" value={cfg.bgColor} onChange={e => set('bgColor', e.target.value)} className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent" />
                      <span className="text-xs font-mono text-gray-600">{cfg.bgColor}</span>
                    </div>
                  </F>
                </div>

                {/* Module style */}
                <F label="Module Style">
                  <div className="grid grid-cols-2 gap-2">
                    {(['square','rounded'] as ModStyle[]).map(s => (
                      <button key={s} onClick={() => set('moduleStyle', s)}
                        className={`py-2 rounded-lg border text-sm font-medium capitalize transition-all cursor-pointer ${
                          cfg.moduleStyle === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}>
                        {s === 'square' ? '▪ Square' : '● Rounded'}
                      </button>
                    ))}
                  </div>
                </F>

                {/* Size */}
                <F label="Image Size">
                  <div className="grid grid-cols-4 gap-1.5">
                    {SIZES.map(sz => (
                      <button key={sz.label} onClick={() => handleSizeBtn(sz.value)}
                        className={`py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          sizeMode === sz.value ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}>
                        {sz.label}
                        {sz.value > 0 && <div className="text-[10px] opacity-70">{sz.value}px</div>}
                      </button>
                    ))}
                  </div>
                  {sizeMode === 0 && (
                    <Input type="number" min={64} max={2048} step={64} value={customSize}
                      onChange={e => setCS(Math.max(64, Math.min(2048, Number(e.target.value))))}
                      className="mt-2 text-sm" placeholder="Custom size (px)" />
                  )}
                </F>

                {/* Margin */}
                <F label={`Margin: ${cfg.margin} modules`}>
                  <input type="range" min={0} max={5} step={1} value={cfg.margin}
                    onChange={e => set('margin', Number(e.target.value))}
                    className="w-full accent-blue-600" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>None</span><span>Max</span>
                  </div>
                </F>

                {/* Error correction */}
                <F label="Error Correction Level">
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['L','M','Q','H'] as ECL[]).map(l => (
                      <button key={l} onClick={() => set('errorCorrection', l)}
                        className={`py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          cfg.errorCorrection === l ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}>
                        {l}
                        <div className={`text-[9px] font-normal mt-0.5 ${cfg.errorCorrection === l ? 'text-blue-100' : 'text-gray-400'}`}>
                          {l==='L'?'7%':l==='M'?'15%':l==='Q'?'25%':'30%'}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Higher = more data, more scannable if damaged</p>
                </F>

                {/* Logo */}
                <F label="Center Logo" optional>
                  <div className="flex items-center gap-2">
                    {cfg.logoDataUrl
                      ? <img src={cfg.logoDataUrl} alt="logo" className="w-10 h-10 object-contain rounded-lg border p-1" />
                      : <div className="w-10 h-10 rounded-lg border border-dashed flex items-center justify-center text-gray-300"><Upload className="w-4 h-4" /></div>
                    }
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => logoInputRef.current?.click()}>
                      <Upload className="w-3 h-3" />Upload Logo
                    </Button>
                    {cfg.logoDataUrl && (
                      <button className="text-xs text-red-500 hover:text-red-700" onClick={() => set('logoDataUrl', '')}>Remove</button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Use H error correction with a logo for best scan rate.</p>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                </F>
              </div>
            )}
          </div>

          <div className="border-t" />

          {/* Generate + Reset */}
          <div className="space-y-2">
            <Button onClick={handleGenerate} disabled={generating || !isValid} size="lg" className="w-full gap-2 text-base">
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrIcon className="w-5 h-5" />}
              {generating ? 'Generating…' : 'Generate QR Code'}
            </Button>
            <Button variant="outline" onClick={handleReset} size="sm" className="w-full gap-2 text-gray-500 hover:text-red-600 hover:border-red-200">
              <RefreshCw className="w-4 h-4" />Reset
            </Button>
          </div>
        </div>

        {/* ════════════════ RIGHT PANEL — PREVIEW & RESULT ════════════════ */}
        <div className="space-y-5">

          {/* Live preview card */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-sm">Live Preview</span>
                <span className="text-xs text-muted-foreground">— updates as you type</span>
              </div>
              {hasDraft && (
                <button onClick={() => setZoom(true)}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-2.5 py-1.5 hover:bg-blue-50">
                  <ZoomIn className="w-3.5 h-3.5" />Zoom
                </button>
              )}
            </div>

            <div className="flex justify-center">
              <div className={`transition-all duration-300 ${hasDraft ? 'opacity-100' : 'opacity-40'}`}>
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 inline-flex">
                  <canvas ref={canvasRef} style={{ display:'block', maxWidth:'100%', height:'auto', maxHeight:280 }} />
                </div>
              </div>
            </div>

            {!hasDraft && (
              <div className="text-center mt-4 text-sm text-gray-400">
                <QrIcon className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                Fill in the fields on the left to see a preview
              </div>
            )}

            {hasDraft && (
              <p className="text-center text-xs text-gray-400 mt-3">
                📱 Scan this QR code with your phone camera to verify it works before sharing.
              </p>
            )}
          </div>

          {/* Result card — shown after Generate */}
          {generated && (
            <div ref={resultRef} className="bg-white rounded-2xl shadow-sm border overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-400">
              {/* Success header */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1.5">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">✅ QR Code Ready</div>
                  <div className="text-blue-200 text-xs">Generated successfully · {genCreatedAt}</div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Download row */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Download</p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={downloadPng} className="gap-2 flex-1 min-w-[80px]">
                      <FileImage className="w-4 h-4" />PNG
                    </Button>
                    <Button variant="outline" onClick={downloadSvg} className="gap-2 flex-1 min-w-[80px]">
                      <FileText className="w-4 h-4" />SVG
                    </Button>
                    <Button variant="outline" onClick={downloadPdf} className="gap-2 flex-1 min-w-[80px]">
                      <Download className="w-4 h-4" />PDF
                    </Button>
                  </div>
                </div>

                {/* Actions row */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Actions</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={copyImage} className="gap-2">
                      {copied === 'img' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      Copy Image
                    </Button>
                    <Button variant="outline" onClick={copyLink} className="gap-2">
                      {copied === 'link' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      Copy Link
                    </Button>
                    <Button variant="outline" onClick={handleShare} className="gap-2">
                      <Share2 className="w-4 h-4" />Share
                    </Button>
                    <Button variant="outline" onClick={handlePrint} className="gap-2">
                      <Printer className="w-4 h-4" />Print
                    </Button>
                  </div>
                </div>

                {/* Info panel */}
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><div className="text-xs text-gray-400 font-medium mb-0.5">QR Type</div><div className="text-sm font-semibold text-gray-800">{getTypeName(cfg.type)}</div></div>
                  <div><div className="text-xs text-gray-400 font-medium mb-0.5">Image Size</div><div className="text-sm font-semibold text-gray-800">{qrSize}×{qrSize}px</div></div>
                  <div><div className="text-xs text-gray-400 font-medium mb-0.5">Content Length</div><div className="text-sm font-semibold text-gray-800">{contentLen} chars</div></div>
                  <div><div className="text-xs text-gray-400 font-medium mb-0.5">Error Correction</div><div className="text-sm font-semibold text-gray-800">{cfg.errorCorrection} ({cfg.errorCorrection==='L'?'7%':cfg.errorCorrection==='M'?'15%':cfg.errorCorrection==='Q'?'25%':'30%'})</div></div>
                  <div><div className="text-xs text-gray-400 font-medium mb-0.5">Module Style</div><div className="text-sm font-semibold text-gray-800 capitalize">{cfg.moduleStyle}</div></div>
                  <div><div className="text-xs text-gray-400 font-medium mb-0.5">Logo</div><div className="text-sm font-semibold text-gray-800">{cfg.logoDataUrl ? 'Yes' : 'None'}</div></div>
                </div>

                {/* Content preview */}
                <div className="bg-gray-50 rounded-xl p-3 border">
                  <div className="text-xs text-gray-400 font-medium mb-1">Content</div>
                  <div className="text-sm text-gray-700 font-mono break-all">{content.slice(0, 120)}{content.length > 120 ? '…' : ''}</div>
                </div>

                <p className="text-center text-xs text-gray-400">
                  📱 Scan this QR code with your phone camera to verify it works before sharing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Zoom modal ── */}
      {zoom && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setZoom(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">QR Code Preview</span>
              <button onClick={() => setZoom(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            {canvasRef.current && (
              <img src={canvasRef.current.toDataURL('image/png')} alt="QR" className="w-full rounded-xl" />
            )}
            <p className="text-xs text-gray-400 text-center mt-3">📱 Scan with your phone camera</p>
          </div>
        </div>
      )}

      {/* ── Recent History ── */}
      {history.length > 0 && (
        <section className="mt-10 bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-gray-800">Recent QR Codes</h2>
            <span className="text-xs text-gray-400 ml-auto">Stored locally on your device</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {history.map(item => (
              <div key={item.id} className="border rounded-xl p-3 space-y-2 hover:border-blue-200 hover:bg-blue-50/30 transition-colors group">
                <img src={item.dataUrl} alt="QR" className="w-full aspect-square object-contain rounded-lg bg-gray-50 p-1" />
                <div>
                  <div className="text-xs font-semibold text-blue-600">{getTypeName(item.type)}</div>
                  <div className="text-xs text-gray-500 truncate">{item.label}</div>
                  <div className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => regenerateFromHistory(item)} title="Regenerate"
                    className="flex-1 text-xs py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors font-medium">
                    Regenerate
                  </button>
                  <button onClick={() => {
                    const a = document.createElement('a');
                    a.href = item.dataUrl; a.download = `qr-${item.type}.png`; a.click();
                    toast({ title: 'Downloaded!', duration: 2000 });
                  }} title="Download" className="p-1.5 rounded-lg border hover:bg-gray-50 text-gray-500">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteHistory(item.id)} title="Delete"
                    className="p-1.5 rounded-lg border hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Pro Tips ── */}
      <section className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h2 className="font-bold text-gray-800">Pro Tips</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            '💡 Use larger sizes (512px+) for printing on flyers, posters, or merchandise.',
            '💡 Always test every QR code by scanning it with your phone before sharing.',
            '💡 High contrast colours (dark on light) improve scanning reliability.',
            '💡 Shorter URLs generate less dense QR codes — easier to scan.',
            '💡 Use H error correction if adding a logo to the centre.',
            '💡 Rounded modules look great but square modules scan slightly better in poor lighting.',
          ].map(tip => (
            <div key={tip} className="bg-white/70 rounded-xl px-4 py-3 text-sm text-gray-700 border border-blue-100">{tip}</div>
          ))}
        </div>
      </section>

      {/* ── Related Tools ── */}
      <section className="mt-8 bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="font-bold text-gray-800 mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {RELATED.map(t => (
            <a key={t.label} href={t.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-blue-300 hover:bg-blue-50 transition-colors text-center group cursor-pointer">
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">{t.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Feedback ── */}
      <section className="mt-8 mb-4 bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="font-bold text-gray-800 mb-1">Was this tool helpful?</h2>
        <p className="text-sm text-gray-400 mb-4">Your feedback helps us improve ToolBox Hub.</p>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <button onClick={() => setRating('up')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-medium text-sm ${
              feedback.rating === 'up' ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50'
            }`}>
            <ThumbsUp className="w-4 h-4" /> Yes, it helped!
          </button>
          <button onClick={() => setRating('down')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-medium text-sm ${
              feedback.rating === 'down' ? 'bg-red-500 text-white border-red-500' : 'border-gray-200 text-gray-600 hover:border-red-200 hover:bg-red-50'
            }`}>
            <ThumbsDown className="w-4 h-4" /> Not really
          </button>
          <button onClick={() => setFbForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50 transition-all font-medium text-sm">
            <AlertTriangle className="w-4 h-4" /> Report an Issue
          </button>
        </div>

        {feedback.rating && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            {feedback.rating === 'up' ? 'Thanks! Glad it helped 🎉' : "We'll work to make it better. Thanks for letting us know."}
          </div>
        )}

        {fbForm && (
          <div className="bg-gray-50 border rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-sm text-gray-800">Submit Feedback</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Bug Report','Feature Request','Suggestion'].map(t => (
                <button key={t} onClick={() => setFbType(t)}
                  className={`py-1.5 rounded-lg border text-xs font-medium transition-colors ${fbType === t ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                  {t}
                </button>
              ))}
            </div>
            <textarea rows={3} placeholder={`Describe your ${fbType.toLowerCase()}…`} value={fbText}
              onChange={e => setFbText(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <div className="flex gap-2">
              <Button size="sm" onClick={submitFeedback} disabled={!fbText.trim()} className="gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />Submit
              </Button>
              <Button size="sm" variant="outline" onClick={() => setFbForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {feedback.reports.length > 0 && (
          <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            {feedback.reports.length} report{feedback.reports.length !== 1 ? 's' : ''} submitted — thank you!
          </div>
        )}
      </section>
    </div>
  );
}
