import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import {
  Upload, Download, Image as ImageIcon, Lightbulb, ThumbsUp, ThumbsDown,
  RefreshCw, X, Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

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

type TargetFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/bmp';

const FORMAT_OPTIONS: { label: string; value: TargetFormat; ext: string }[] = [
  { label: 'JPG', value: 'image/jpeg', ext: 'jpg' },
  { label: 'PNG', value: 'image/png', ext: 'png' },
  { label: 'WebP', value: 'image/webp', ext: 'webp' },
  { label: 'BMP', value: 'image/bmp', ext: 'bmp' },
];

interface ImageItem {
  id: string;
  file: File;
  thumbUrl: string;
  convertedBlob?: Blob;
  convertedUrl?: string;
  status: 'idle' | 'converting' | 'done' | 'error';
}

const RELATED = [
  { label: 'Image Compressor', href: '/image-compressor', emoji: '🗜️' },
  { label: 'Image Resizer', href: '/image-resizer', emoji: '📐' },
  { label: 'Image to PDF', href: '/image-to-pdf', emoji: '📄' },
  { label: 'JPG to PDF', href: '/jpg-to-pdf', emoji: '🖼️' },
];

const FAQ = [
  { q: 'Which formats can I convert to?', a: 'You can convert to JPG, PNG, WebP, and BMP. GIF output is not supported because the Canvas API cannot encode animated GIF frames.' },
  { q: 'Why is GIF output not supported?', a: 'The HTML5 Canvas API encodes images as static frames. Animated GIF encoding requires a specialized library not included here. You can convert GIFs to other formats (they become static).' },
  { q: 'Can I convert multiple images at once?', a: 'Yes! Upload multiple files and click "Convert All" to batch-convert them. Use "Download All as ZIP" to get them in one file.' },
  { q: 'Will the quality slider affect PNG output?', a: 'No — PNG is a lossless format. The quality slider only affects JPG and WebP output.' },
  { q: 'Is my data safe?', a: 'All conversion happens locally in your browser via the Canvas API. Your images are never uploaded to any server.' },
];

let _id = 0;
const uid = () => `img-${++_id}`;

export default function ImageConverter() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [items, setItems] = useState<ImageItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('image/jpeg');
  const [quality, setQuality] = useState(85);
  const [converting, setConverting] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() => {
    try { return localStorage.getItem('feedback_image-converter') as 'up' | 'down' | null; } catch { return null; }
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: ImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('image/')) continue;
      newItems.push({ id: uid(), file: f, thumbUrl: URL.createObjectURL(f), status: 'idle' });
    }
    if (newItems.length === 0) {
      toast({ title: 'No images found', description: 'Please upload image files.', variant: 'destructive' });
      return;
    }
    setItems(prev => [...prev, ...newItems]);
  }, [toast]);

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const convertOne = async (item: ImageItem): Promise<Blob | null> => {
    try {
      const img = await loadImageFromFile(item.file);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      // For JPEG, fill white background first (handles PNG transparency)
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      return new Promise((resolve) => {
        const q = (targetFormat === 'image/jpeg' || targetFormat === 'image/webp') ? quality / 100 : undefined;
        canvas.toBlob((blob) => resolve(blob), targetFormat, q);
      });
    } catch {
      return null;
    }
  };

  const handleConvertAll = async () => {
    if (items.length === 0) return;
    setConverting(true);
    const fmt = FORMAT_OPTIONS.find(f => f.value === targetFormat)!;
    const updated = [...items];

    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: 'converting' };
      setItems([...updated]);
      const blob = await convertOne(updated[i]);
      if (blob) {
        updated[i] = { ...updated[i], status: 'done', convertedBlob: blob, convertedUrl: URL.createObjectURL(blob) };
      } else {
        updated[i] = { ...updated[i], status: 'error' };
      }
      setItems([...updated]);
    }

    setConverting(false);
    toast({ title: 'Conversion complete!', description: `${updated.filter(i => i.status === 'done').length} image(s) converted to ${fmt.label}.` });
  };

  const downloadOne = (item: ImageItem) => {
    if (!item.convertedBlob) return;
    const fmt = FORMAT_OPTIONS.find(f => f.value === targetFormat)!;
    const baseName = item.file.name.replace(/\.[^.]+$/, '');
    downloadBlob(item.convertedBlob, `${baseName}.${fmt.ext}`);
  };

  const downloadAllZip = async () => {
    const ready = items.filter(i => i.convertedBlob);
    if (ready.length === 0) { toast({ title: 'Nothing to download', description: 'Convert images first.' }); return; }
    const fmt = FORMAT_OPTIONS.find(f => f.value === targetFormat)!;
    const zip = new JSZip();
    ready.forEach(item => {
      const baseName = item.file.name.replace(/\.[^.]+$/, '');
      zip.file(`${baseName}.${fmt.ext}`, item.convertedBlob!);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'converted-images.zip');
  };

  const handleFeedback = (v: 'up' | 'down') => {
    setFeedback(v);
    try { localStorage.setItem('feedback_image-converter', v); } catch {}
    toast({ title: v === 'up' ? '🎉 Thanks!' : '🙏 Thanks for the feedback!' });
  };

  const showQuality = targetFormat === 'image/jpeg' || targetFormat === 'image/webp';

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-white/20 p-2"><RefreshCw className="h-6 w-6" /></div>
          <h1 className="text-2xl sm:text-3xl font-bold">Image Converter</h1>
        </div>
        <p className="text-blue-100 max-w-xl">Convert images between JPG, PNG, WebP, and BMP formats — batch process multiple files.</p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Controls */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-gray-800">Upload Images</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}`}
            >
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium">Drop images here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">Multiple files supported</p>
            </div>

            {/* Target Format */}
            <div className="space-y-2">
              <Label>Convert to</Label>
              <div className="grid grid-cols-2 gap-2">
                {FORMAT_OPTIONS.map((f) => (
                  <button key={f.value} onClick={() => setTargetFormat(f.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${targetFormat === f.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-700'}`}
                  >{f.label}</button>
                ))}
              </div>
              <p className="text-xs text-gray-400">GIF output is not supported — the Canvas API cannot encode animated GIFs.</p>
            </div>

            {/* Quality */}
            {showQuality && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Quality</Label>
                  <span className="text-sm font-semibold text-blue-600">{quality}%</span>
                </div>
                <input type="range" min={60} max={100} value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-blue-600" />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleConvertAll} disabled={items.length === 0 || converting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {converting ? 'Converting…' : 'Convert All'}
              </Button>
              <Button variant="outline" onClick={downloadAllZip} disabled={items.filter(i => i.convertedBlob).length === 0}
                className="border-blue-300 text-blue-700">
                <Archive className="h-4 w-4" />
              </Button>
            </div>
            {items.filter(i => i.convertedBlob).length > 0 && (
              <p className="text-xs text-center text-gray-500">Click <Archive className="inline h-3 w-3" /> to download all as ZIP</p>
            )}
          </div>
        </div>

        {/* Image Grid Preview */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Images ({items.length})</h2>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
                <p className="text-sm">Upload images to convert</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {items.map((item) => {
                  const fmt = FORMAT_OPTIONS.find(f => f.value === targetFormat)!;
                  const srcExt = item.file.name.split('.').pop()?.toUpperCase() ?? '?';
                  return (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                      <img src={item.convertedUrl || item.thumbUrl} alt={item.file.name}
                        className="h-14 w-14 rounded object-cover border border-gray-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{item.file.name}</p>
                        <p className="text-xs text-gray-400">{formatBytes(item.file.size)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs bg-gray-100 text-gray-600 rounded px-1">{srcExt}</span>
                          <span className="text-xs text-gray-400">→</span>
                          <span className="text-xs bg-blue-100 text-blue-700 rounded px-1">{fmt.label}</span>
                          {item.status === 'done' && <span className="text-xs text-green-600 ml-1">✓</span>}
                          {item.status === 'converting' && <span className="text-xs text-yellow-600 ml-1">⏳</span>}
                          {item.status === 'error' && <span className="text-xs text-red-600 ml-1">✗</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {item.status === 'done' && (
                          <button onClick={() => downloadOne(item)} title="Download"
                            className="rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-blue-700 hover:bg-blue-100">
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button onClick={() => removeItem(item.id)} title="Remove"
                          className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
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
          <li>• <strong>WebP</strong> gives the best compression — great for web use with wide browser support.</li>
          <li>• Convert <strong>PNG → JPEG</strong> for photos (no transparency) to drastically cut file size.</li>
          <li>• Keep images as <strong>PNG</strong> if they have transparent backgrounds.</li>
          <li>• Use <strong>85–90% quality</strong> for JPG/WebP — visually identical to 100% but much smaller.</li>
          <li>• Use "Download All as ZIP" to batch-download many converted files at once.</li>
          <li>• GIF input files are supported but only the first frame is extracted (no animation).</li>
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
