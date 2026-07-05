import React, { useState, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  Download, QrCode as QrCodeIcon, Copy, Check,
  RefreshCw, AlertCircle, CheckCircle2, FileImage,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const SIZES = [
  { label: 'Small', sub: '128 px', value: 128 },
  { label: 'Medium', sub: '256 px', value: 256 },
  { label: 'Large', sub: '512 px', value: 512 },
];

type Status = 'idle' | 'success' | 'error';

export default function QrCodeGenerator() {
  const [input, setInput] = useState('');
  const [size, setSize] = useState(256);
  const [hasQr, setHasQr] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [inputTouched, setInputTouched] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<string>('');          // stores raw SVG string
  const { toast } = useToast();

  // ── Generate ──────────────────────────────────────────────────────────────
  const generate = useCallback(async (overrideSize?: number) => {
    setInputTouched(true);
    const text = input.trim();

    if (!text) {
      setErrorMsg('Please enter some text or a URL first.');
      setStatus('error');
      return;
    }

    const px = overrideSize ?? size;

    try {
      // 1. Canvas (PNG)
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, text, {
          width: px,
          margin: 2,
          color: { dark: '#1e3a8a', light: '#ffffff' },
          errorCorrectionLevel: 'H',
        });
      }

      // 2. SVG string
      svgRef.current = await QRCode.toString(text, {
        type: 'svg',
        margin: 2,
        color: { dark: '#1e3a8a', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      });

      setHasQr(true);
      setStatus('success');
      setErrorMsg('');
      setCopied(false);
    } catch {
      setHasQr(false);
      setStatus('error');
      setErrorMsg('Failed to generate QR code. Please try again.');
    }
  }, [input, size]);

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    if (hasQr) generate(newSize);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') generate();
  };

  // ── Download PNG ──────────────────────────────────────────────────────────
  const downloadPng = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.png';
    a.click();
    toast({ title: 'Downloaded!', description: 'qrcode.png saved to your device.', duration: 2000 });
  };

  // ── Download SVG ──────────────────────────────────────────────────────────
  const downloadSvg = () => {
    if (!svgRef.current) return;
    const blob = new Blob([svgRef.current], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.svg';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded!', description: 'qrcode.svg saved to your device.', duration: 2000 });
  };

  // ── Copy image ────────────────────────────────────────────────────────────
  const copyImage = async () => {
    if (!canvasRef.current) return;
    try {
      const blob: Blob = await new Promise((res, rej) =>
        canvasRef.current!.toBlob((b) => b ? res(b) : rej(), 'image/png')
      );
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      toast({ title: 'Copied!', description: 'QR code image copied to clipboard.', duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy not supported',
        description: 'Your browser does not support copying images. Use Download PNG instead.',
        variant: 'destructive',
      });
    }
  };

  // ── Clear ─────────────────────────────────────────────────────────────────
  const handleClear = () => {
    setInput('');
    setSize(256);
    setHasQr(false);
    setStatus('idle');
    setErrorMsg('');
    setCopied(false);
    setInputTouched(false);
    svgRef.current = '';
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const showInputError = inputTouched && !input.trim() && status === 'error';

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">QR Code Generator</h1>
        <p className="text-muted-foreground">Turn any URL or text into a scannable QR code — instantly, in your browser</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-8">

        {/* ── Preview Area ────────────────────────────────────────────────── */}
        <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 flex flex-col items-center gap-5 min-h-[300px] justify-center">
          {/* Canvas — always mounted so the ref is available; hidden when empty */}
          <div className={hasQr ? 'flex flex-col items-center gap-5 w-full animate-in zoom-in-95 duration-300' : 'hidden'}>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 inline-flex">
              <canvas
                ref={canvasRef}
                style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
              />
            </div>

            {/* Success banner */}
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-sm font-medium w-full justify-center">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              QR Code generated successfully!
            </div>

            {/* Action row */}
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-blue-200/50 w-full">
              {/* Clear — left */}
              <Button
                variant="outline"
                onClick={handleClear}
                className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-500"
              >
                <RefreshCw className="w-4 h-4" />
                Clear
              </Button>

              {/* Downloads + Copy — right */}
              <div className="flex flex-wrap gap-2 ml-auto">
                <Button
                  variant="outline"
                  onClick={copyImage}
                  className="gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Image'}
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadSvg}
                  className="gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                >
                  <FileImage className="w-4 h-4" />
                  SVG
                </Button>
                <Button onClick={downloadPng} className="gap-2">
                  <Download className="w-4 h-4" />
                  PNG
                </Button>
              </div>
            </div>
          </div>

          {/* Empty placeholder */}
          {!hasQr && (
            <div className="text-center text-muted-foreground flex flex-col items-center gap-3">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-300">
                <QrCodeIcon className="w-10 h-10" />
              </div>
              <p className="font-medium text-gray-500">Enter text or a URL below</p>
              <p className="text-sm text-gray-400">Your QR code will appear here</p>
            </div>
          )}
        </div>

        {/* ── Controls ────────────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Input */}
          <div className="space-y-2">
            <Label htmlFor="qr-input" className="text-base font-semibold">
              Text or URL
            </Label>
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <Input
                  id="qr-input"
                  type="text"
                  placeholder="https://example.com or any text…"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (status === 'error') { setStatus('idle'); setErrorMsg(''); }
                  }}
                  onKeyDown={handleKeyDown}
                  className={`text-base ${showInputError ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-describedby={showInputError ? 'qr-error' : undefined}
                />
                {showInputError && (
                  <p id="qr-error" className="flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errorMsg}
                  </p>
                )}
              </div>
              <Button
                onClick={() => generate()}
                className="shrink-0 px-6 self-start"
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Press Enter or click Generate — no internet needed</p>
          </div>

          {/* Size selector */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold block">Image Size</Label>
            <div className="grid grid-cols-3 gap-3">
              {SIZES.map(({ label, sub, value }) => (
                <button
                  key={value}
                  onClick={() => handleSizeChange(value)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                    size === value
                      ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
                      : 'hover:bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`text-xs font-normal ${size === value ? 'text-blue-500' : 'text-gray-400'}`}>{sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
