import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import {
  Upload, Download, Image as ImageIcon, Lightbulb, ThumbsUp, ThumbsDown,
  ArrowLeftRight, Sliders, FileImage,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

type OutputFormat = 'same' | 'image/jpeg' | 'image/webp' | 'image/png';

const FORMAT_OPTIONS: { label: string; value: OutputFormat }[] = [
  { label: 'Same as input', value: 'same' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'WebP', value: 'image/webp' },
  { label: 'PNG', value: 'image/png' },
];

const RELATED = [
  { label: 'Image Resizer', href: '/image-resizer', emoji: '📐' },
  { label: 'Image Converter', href: '/image-converter', emoji: '🔄' },
  { label: 'JPG to PDF', href: '/jpg-to-pdf', emoji: '📄' },
  { label: 'Image to PDF', href: '/image-to-pdf', emoji: '🖼️' },
];

const FAQ = [
  { q: 'Will compression reduce image quality?', a: 'Lossy formats (JPEG, WebP) reduce quality at lower settings. PNG is lossless — quality slider affects file optimisation only.' },
  { q: 'What quality setting should I use?', a: '80% is a great balance — visually near-identical but significantly smaller. For web thumbnails, 60–70% works well.' },
  { q: 'Is my image uploaded to a server?', a: 'No. Everything happens locally in your browser using the Canvas API. Your image never leaves your device.' },
  { q: 'Which format gives the best compression?', a: 'WebP generally produces the smallest files while maintaining quality, followed by JPEG. PNG is best for images with transparency.' },
  { q: 'Can I compress PNG files?', a: 'Yes, but PNG is lossless so the quality slider has little effect. Converting a PNG to WebP or JPEG will achieve much larger reductions.' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageCompressor() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [compressedUrl, setCompressedUrl] = useState('');
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('same');
  const [processing, setProcessing] = useState(false);
  const [mobileView, setMobileView] = useState<'before' | 'after'>('before');
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() => {
    try { return localStorage.getItem('feedback_image-compressor') as 'up' | 'down' | null; } catch { return null; }
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload a JPEG, PNG, or WebP image.', variant: 'destructive' });
      return;
    }
    setFile(f);
    setOriginalSize(f.size);
    setOriginalUrl(URL.createObjectURL(f));
    setCompressedUrl('');
    setCompressedBlob(null);
    setCompressedSize(0);
  }, [toast]);

  const handleCompress = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const mime = outputFormat === 'same' ? (file.type || 'image/jpeg') : outputFormat;
      const q = mime === 'image/png' ? 1 : quality / 100;

      canvas.toBlob((blob) => {
        if (!blob) { setProcessing(false); return; }
        const url = URL.createObjectURL(blob);
        setCompressedUrl(url);
        setCompressedBlob(blob);
        setCompressedSize(blob.size);
        setProcessing(false);
        toast({ title: 'Compression complete!', description: `Reduced from ${formatBytes(file.size)} to ${formatBytes(blob.size)}` });
      }, mime, q);
    } catch {
      setProcessing(false);
      toast({ title: 'Error', description: 'Failed to compress image.', variant: 'destructive' });
    }
  }, [file, quality, outputFormat, toast]);

  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const mime = outputFormat === 'same' ? (file.type || 'image/jpeg') : outputFormat;
    const ext = mime.split('/')[1] ?? 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '');
    downloadBlob(compressedBlob, `${baseName}-compressed.${ext}`);
  };

  const pct = originalSize && compressedSize ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

  const handleFeedback = (v: 'up' | 'down') => {
    setFeedback(v);
    try { localStorage.setItem('feedback_image-compressor', v); } catch {}
    toast({ title: v === 'up' ? '🎉 Thanks!' : '🙏 Thanks for the feedback!', description: 'We appreciate your input.' });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-white/20 p-2"><Sliders className="h-6 w-6" /></div>
          <h1 className="text-2xl sm:text-3xl font-bold">Image Compressor</h1>
        </div>
        <p className="text-blue-100 max-w-xl">Reduce image file size with adjustable compression — before &amp; after preview.</p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Controls */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-gray-800">Upload Image</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}`}
            >
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium">Drop image here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP supported</p>
            </div>

            {file && (
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                <span className="font-medium">{file.name}</span>
                <span className="ml-2 text-gray-400">({formatBytes(originalSize)})</span>
              </div>
            )}

            {/* Quality Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Quality</Label>
                <span className="text-sm font-semibold text-blue-600">{quality}%</span>
              </div>
              <input
                type="range" min={10} max={100} value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>10% (smallest)</span><span>100% (best quality)</span>
              </div>
            </div>

            {/* Output Format */}
            <div className="space-y-2">
              <Label>Output Format</Label>
              <div className="grid grid-cols-2 gap-2">
                {FORMAT_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setOutputFormat(f.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${outputFormat === f.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-700'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCompress}
              disabled={!file || processing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {processing ? 'Compressing…' : 'Compress Image'}
            </Button>

            {compressedSize > 0 && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Original:</span><span className="font-medium">{formatBytes(originalSize)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Compressed:</span><span className="font-medium">{formatBytes(compressedSize)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Reduction:</span><span className="font-bold text-green-700">{pct}%</span></div>
              </div>
            )}

            {compressedBlob && (
              <Button onClick={handleDownload} variant="outline" className="w-full border-blue-300 text-blue-700">
                <Download className="mr-2 h-4 w-4" /> Download Compressed
              </Button>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Preview</h2>
              {originalUrl && (
                <div className="flex rounded-lg border border-gray-200 overflow-hidden sm:hidden">
                  {(['before', 'after'] as const).map((v) => (
                    <button key={v} onClick={() => setMobileView(v)}
                      className={`px-3 py-1 text-xs font-medium capitalize ${mobileView === v ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                    >{v}</button>
                  ))}
                </div>
              )}
            </div>

            {!originalUrl ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
                <p className="text-sm">Upload an image to see preview</p>
              </div>
            ) : (
              <>
                {/* Desktop side-by-side */}
                <div className="hidden sm:grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2 text-center">Before</p>
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={originalUrl} alt="Original" className="w-full object-contain max-h-64" />
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-1">{formatBytes(originalSize)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2 text-center">After</p>
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center min-h-[80px]">
                      {compressedUrl
                        ? <img src={compressedUrl} alt="Compressed" className="w-full object-contain max-h-64" />
                        : <p className="text-xs text-gray-400 p-4">Click "Compress Image" to see result</p>
                      }
                    </div>
                    {compressedSize > 0 && <p className="text-xs text-center text-gray-500 mt-1">{formatBytes(compressedSize)}</p>}
                  </div>
                </div>
                {/* Mobile toggle */}
                <div className="sm:hidden">
                  {mobileView === 'before' ? (
                    <div>
                      <img src={originalUrl} alt="Original" className="w-full rounded-lg object-contain max-h-64 border" />
                      <p className="text-xs text-center text-gray-500 mt-1">{formatBytes(originalSize)}</p>
                    </div>
                  ) : (
                    <div>
                      {compressedUrl
                        ? <img src={compressedUrl} alt="Compressed" className="w-full rounded-lg object-contain max-h-64 border" />
                        : <div className="flex items-center justify-center h-32 text-gray-400 text-sm border rounded-lg">Compress to see result</div>
                      }
                      {compressedSize > 0 && <p className="text-xs text-center text-gray-500 mt-1">{formatBytes(compressedSize)}</p>}
                    </div>
                  )}
                </div>

                {compressedSize > 0 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold text-green-700">{pct}% size reduction</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-blue-800">Pro Tips</h2>
        </div>
        <ul className="space-y-2 text-sm text-blue-900">
          <li>• Use <strong>80% quality</strong> for a great balance between file size and visual quality.</li>
          <li>• <strong>WebP</strong> format gives the best compression — supported in all modern browsers.</li>
          <li>• For web use, aim for images under <strong>200 KB</strong> to improve page load speed.</li>
          <li>• Converting <strong>PNG → JPEG</strong> or <strong>PNG → WebP</strong> can cut file size by 60–80%.</li>
          <li>• Use <strong>60–70% quality</strong> for thumbnails — they look identical at small sizes.</li>
          <li>• PNG images with transparency should stay as PNG or WebP to preserve the alpha channel.</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
              <button
                className="w-full text-left px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 flex justify-between items-center"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {item.q}
                <span className="text-gray-400 ml-2">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <div className="px-4 pb-3 text-sm text-gray-600">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {RELATED.map((r) => (
            <Link key={r.href} href={r.href}>
              <div className="rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 p-3 text-center transition-colors cursor-pointer">
                <div className="text-2xl mb-1">{r.emoji}</div>
                <div className="text-xs font-medium text-gray-700">{r.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div className="rounded-xl border bg-white shadow-sm p-6 text-center">
        <h2 className="font-semibold text-gray-800 mb-1">Was this tool helpful?</h2>
        <p className="text-sm text-gray-500 mb-3">Your feedback helps us improve.</p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => handleFeedback('up')}
            className={feedback === 'up' ? 'border-green-500 bg-green-50 text-green-700' : ''}>
            <ThumbsUp className="mr-2 h-4 w-4" /> Yes
          </Button>
          <Button variant="outline" onClick={() => handleFeedback('down')}
            className={feedback === 'down' ? 'border-red-400 bg-red-50 text-red-700' : ''}>
            <ThumbsDown className="mr-2 h-4 w-4" /> No
          </Button>
        </div>
        {feedback && <p className="text-xs text-gray-400 mt-2">{feedback === 'up' ? '🎉 Thanks for the positive feedback!' : '🙏 Thanks — we\'ll work to improve!'}</p>}
      </div>
    </div>
  );
}
