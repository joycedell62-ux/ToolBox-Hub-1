import React, { useState, useCallback } from 'react';
import { Download, QrCode as QrCodeIcon, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const SIZES = [
  { label: 'Small (128px)', value: 128 },
  { label: 'Medium (256px)', value: 256 },
  { label: 'Large (512px)', value: 512 },
];

export default function QrCodeGenerator() {
  const [input, setInput] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [size, setSize] = useState(256);
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { toast } = useToast();

  const qrUrl = qrValue
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrValue)}&margin=10`
    : '';

  const handleGenerate = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setImgLoaded(false);
    setQrValue(trimmed);
    setCopied(false);
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleGenerate();
  };

  // Draw image to canvas and return blob — bypasses CORS fetch issues
  const getQrBlob = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!qrUrl) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      };
      img.onerror = () => resolve(null);
      // Cache-bust to avoid stale cached response blocking crossOrigin
      img.src = qrUrl + '&cb=' + Date.now();
    });
  };

  const handleDownload = async () => {
    const blob = await getQrBlob();
    if (!blob) {
      toast({ title: 'Download failed', description: 'Could not load QR code image.', variant: 'destructive' });
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded!', description: 'qrcode.png saved to your device.', duration: 2000 });
  };

  const handleCopy = async () => {
    if (!qrUrl) return;
    try {
      const blob = await getQrBlob();
      if (!blob) throw new Error('No blob');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      toast({ title: 'Copied!', description: 'QR code image copied to clipboard.', duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Your browser may not support copying images. Try downloading instead.', variant: 'destructive' });
    }
  };

  const handleClear = () => {
    setInput('');
    setQrValue('');
    setImgLoaded(false);
    setCopied(false);
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">QR Code Generator</h1>
        <p className="text-muted-foreground">Turn any URL or text into a scannable QR code</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-8">

        {/* QR Output Area */}
        <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 flex flex-col items-center gap-6 min-h-[320px] justify-center">
          {qrUrl ? (
            <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300 w-full">
              {/* QR Image */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 inline-flex">
                <img
                  key={qrUrl}
                  src={qrUrl}
                  alt="Generated QR Code"
                  width={size}
                  height={size}
                  className="block"
                  style={{ width: Math.min(size, 220), height: Math.min(size, 220) }}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgLoaded(false)}
                />
              </div>

              {/* Action buttons — match Password Generator's row layout */}
              {imgLoaded && (
                <div className="flex items-center gap-2 pt-4 border-t border-blue-200/50 w-full justify-between">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleClear}
                    title="Clear and start over"
                    className="hover:bg-blue-100 hover:text-blue-700 hover:border-blue-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCopy}
                      className="gap-2 hover:bg-blue-100 hover:text-blue-700 hover:border-blue-200"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy Image'}
                    </Button>
                    <Button onClick={handleDownload} className="gap-2">
                      <Download className="w-4 h-4" />
                      Download PNG
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground flex flex-col items-center gap-3">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-300">
                <QrCodeIcon className="w-10 h-10" />
              </div>
              <p className="font-medium text-gray-500">Enter text or a URL below</p>
              <p className="text-sm text-gray-400">Your QR code will appear here</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Text input */}
          <div className="space-y-2">
            <Label htmlFor="qr-input" className="text-base font-semibold">
              Text or URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="qr-input"
                type="text"
                placeholder="https://example.com"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-base flex-1"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <Button
                onClick={handleGenerate}
                disabled={!input.trim()}
                className="shrink-0 px-6"
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Press Enter or click Generate</p>
          </div>

          {/* Size selector */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold block">Image Size</Label>
            <div className="grid grid-cols-3 gap-3">
              {SIZES.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => {
                    setSize(value);
                    if (qrValue) setImgLoaded(false);
                  }}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                    size === value
                      ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : 'hover:bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
