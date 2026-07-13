import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Upload, Download, Image as ImageIcon, Lightbulb, ThumbsUp, ThumbsDown,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

function formatBytes(bytes: number): string {
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

type ResizeMode = 'pixels' | 'percentage' | 'presets';
type OutputFormat = 'original' | 'image/jpeg' | 'image/png' | 'image/webp';

const PRESETS = [
  { label: 'Instagram Square', w: 1080, h: 1080 },
  { label: 'Instagram Story', w: 1080, h: 1920 },
  { label: 'Facebook Cover', w: 820, h: 312 },
  { label: 'Twitter Header', w: 1500, h: 500 },
  { label: 'LinkedIn Banner', w: 1584, h: 396 },
  { label: 'YouTube Thumbnail', w: 1280, h: 720 },
  { label: 'WhatsApp DP', w: 800, h: 800 },
  { label: 'A4 Print', w: 2480, h: 3508 },
];

const FORMAT_OPTIONS: { label: string; value: OutputFormat }[] = [
  { label: 'Original', value: 'original' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'PNG', value: 'image/png' },
  { label: 'WebP', value: 'image/webp' },
];

const RELATED = [
  { label: 'Image Compressor', href: '/image-compressor', emoji: '🗜️' },
  { label: 'Image Cropper', href: '/image-cropper', emoji: '✂️' },
  { label: 'Image Converter', href: '/image-converter', emoji: '🔄' },
  { label: 'Image to PDF', href: '/image-to-pdf', emoji: '📄' },
];

const FAQ = [
  { q: 'Will resizing reduce image quality?', a: 'Enlarging an image beyond its original size may reduce quality. Shrinking typically looks fine. Use PNG to preserve sharpness.' },
  { q: 'What is aspect ratio lock?', a: 'When enabled, changing width automatically adjusts height proportionally, preventing distortion.' },
  { q: 'Can I resize to exact social media dimensions?', a: 'Yes! Use the Presets tab to pick common social media sizes like Instagram Square (1080×1080) or YouTube Thumbnail (1280×720).' },
  { q: 'Is there a file size limit?', a: 'No server-side limit — everything runs in your browser. Very large images (50MB+) may be slow to process.' },
  { q: 'Which format should I choose?', a: 'JPEG for photos, PNG for graphics/transparency, WebP for smallest file size with good quality.' },
];

export default function ImageResizer() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [mode, setMode] = useState<ResizeMode>('pixels');
  const [newW, setNewW] = useState(0);
  const [newH, setNewH] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [percentage, setPercentage] = useState(100);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('original');
  const [previewUrl, setPreviewUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() => {
    try { return localStorage.getItem('feedback_image-resizer') as 'up' | 'down' | null; } catch { return null; }
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file.', variant: 'destructive' });
      return;
    }
    setFile(f);
    const img = await loadImageFromFile(f);
    setOrigW(img.naturalWidth);
    setOrigH(img.naturalHeight);
    setNewW(img.naturalWidth);
    setNewH(img.naturalHeight);
    setPreviewUrl('');
    setSelectedPreset(null);
  }, [toast]);

  const handleWidthChange = (val: number) => {
    setNewW(val);
    if (lockAspect && origW) setNewH(Math.round(val * origH / origW));
  };
  const handleHeightChange = (val: number) => {
    setNewH(val);
    if (lockAspect && origH) setNewW(Math.round(val * origW / origH));
  };

  const getTargetDimensions = (): { w: number; h: number } => {
    if (mode === 'pixels') return { w: newW, h: newH };
    if (mode === 'percentage') return { w: Math.round(origW * percentage / 100), h: Math.round(origH * percentage / 100) };
    if (mode === 'presets' && selectedPreset !== null) {
      const p = PRESETS[selectedPreset];
      return { w: p.w, h: p.h };
    }
    return { w: origW, h: origH };
  };

  const handleResize = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = await loadImageFromFile(file);
      const { w, h } = getTargetDimensions();
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      const mime = outputFormat === 'original' ? (file.type || 'image/jpeg') : outputFormat;
      const dataUrl = canvas.toDataURL(mime, 0.92);
      setPreviewUrl(dataUrl);

      canvas.toBlob((blob) => {
        if (!blob) { setProcessing(false); return; }
        const ext = mime.split('/')[1] ?? 'jpg';
        const baseName = file.name.replace(/\.[^.]+$/, '');
        downloadBlob(blob, `${baseName}-resized.${ext}`);
        setProcessing(false);
        toast({ title: 'Resized!', description: `Image resized to ${w}×${h}` });
      }, mime, 0.92);
    } catch {
      setProcessing(false);
      toast({ title: 'Error', description: 'Failed to resize image.', variant: 'destructive' });
    }
  }, [file, mode, newW, newH, percentage, selectedPreset, outputFormat, origW, origH, toast]);

  const dims = getTargetDimensions();

  const handleFeedback = (v: 'up' | 'down') => {
    setFeedback(v);
    try { localStorage.setItem('feedback_image-resizer', v); } catch {}
    toast({ title: v === 'up' ? '🎉 Thanks!' : '🙏 Thanks for the feedback!' });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-white/20 p-2"><Maximize2 className="h-6 w-6" /></div>
          <h1 className="text-2xl sm:text-3xl font-bold">Image Resizer</h1>
        </div>
        <p className="text-blue-100 max-w-xl">Resize images by pixels, percentage, or social media presets.</p>
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
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium">Drop image here or click to browse</p>
            </div>

            {origW > 0 && (
              <div className="text-sm text-gray-500">Original: <span className="font-semibold text-gray-700">{origW} × {origH} px</span></div>
            )}

            {/* Mode Tabs */}
            <div>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-4">
                {(['pixels', 'percentage', 'presets'] as ResizeMode[]).map((m) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >{m}</button>
                ))}
              </div>

              {mode === 'pixels' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Width (px)</Label>
                      <Input type="number" value={newW} onChange={(e) => handleWidthChange(Number(e.target.value))} min={1} />
                    </div>
                    <div className="space-y-1">
                      <Label>Height (px)</Label>
                      <Input type="number" value={newH} onChange={(e) => handleHeightChange(Number(e.target.value))} min={1} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} className="accent-blue-600" />
                    Lock aspect ratio
                  </label>
                </div>
              )}

              {mode === 'percentage' && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Scale</Label>
                    <span className="text-sm font-semibold text-blue-600">{percentage}%</span>
                  </div>
                  <input type="range" min={1} max={400} value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className="w-full accent-blue-600" />
                  <div className="text-xs text-gray-500">Result: {Math.round(origW * percentage / 100)} × {Math.round(origH * percentage / 100)} px</div>
                </div>
              )}

              {mode === 'presets' && (
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {PRESETS.map((p, i) => (
                    <button key={i} onClick={() => setSelectedPreset(i)}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${selectedPreset === i ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-700'}`}
                    >
                      <span className="font-medium">{p.label}</span>
                      <span className="ml-2 text-xs text-gray-400">{p.w}×{p.h}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Output Format */}
            <div className="space-y-2">
              <Label>Output Format</Label>
              <div className="grid grid-cols-2 gap-2">
                {FORMAT_OPTIONS.map((f) => (
                  <button key={f.value} onClick={() => setOutputFormat(f.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${outputFormat === f.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-700'}`}
                  >{f.label}</button>
                ))}
              </div>
            </div>

            {file && dims.w > 0 && (
              <div className="text-sm text-gray-500">New size: <span className="font-semibold text-blue-700">{dims.w} × {dims.h} px</span></div>
            )}

            <Button onClick={handleResize} disabled={!file || processing} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {processing ? 'Processing…' : <><Download className="mr-2 h-4 w-4" />Resize &amp; Download</>}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Preview</h2>
            {!file ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
                <p className="text-sm">Upload an image to preview</p>
              </div>
            ) : previewUrl ? (
              <div>
                <img src={previewUrl} alt="Resized preview" className="w-full rounded-lg object-contain max-h-72 border border-gray-200" />
                <p className="text-xs text-center text-gray-500 mt-2">{dims.w} × {dims.h} px</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
                <p className="text-sm">Click "Resize &amp; Download" to preview</p>
              </div>
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
          <li>• Always use <strong>Lock Aspect Ratio</strong> to avoid stretching your image.</li>
          <li>• Use the <strong>Presets tab</strong> for perfect social media dimensions every time.</li>
          <li>• For web images, keep width under <strong>1200px</strong> to balance quality and speed.</li>
          <li>• Upscaling beyond the original size will reduce sharpness — try AI upscalers for better results.</li>
          <li>• Use <strong>WebP</strong> format for smaller file sizes without noticeable quality loss.</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
              <button className="w-full text-left px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 flex justify-between items-center"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
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
