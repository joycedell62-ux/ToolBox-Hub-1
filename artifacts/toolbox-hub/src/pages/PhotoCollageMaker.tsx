import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import {
  Upload, Download, Image as ImageIcon, Lightbulb,
  ThumbsUp, ThumbsDown, Grid3X3, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type LayoutId = 'h2' | 'v2' | '1l2r' | '2t1b' | 'g4' | '1l4r' | 'g6' | 'g9';
type SizePreset = 'square' | 'wide' | 'tall';

interface Layout {
  id: LayoutId;
  label: string;
  minPhotos: number;
  maxPhotos: number;
  diagram: string;
  cells: (w: number, h: number, gap: number) => { x: number; y: number; w: number; h: number }[];
}

const LAYOUTS: Layout[] = [
  {
    id: 'h2', label: '2 Side by Side', minPhotos: 2, maxPhotos: 2, diagram: '▐▌',
    cells: (w, h, g) => [
      { x: 0, y: 0, w: (w - g) / 2, h },
      { x: (w - g) / 2 + g, y: 0, w: (w - g) / 2, h },
    ],
  },
  {
    id: 'v2', label: '2 Top/Bottom', minPhotos: 2, maxPhotos: 2, diagram: '▀▄',
    cells: (w, h, g) => [
      { x: 0, y: 0, w, h: (h - g) / 2 },
      { x: 0, y: (h - g) / 2 + g, w, h: (h - g) / 2 },
    ],
  },
  {
    id: '1l2r', label: '1 Left + 2 Right', minPhotos: 3, maxPhotos: 3, diagram: '▐╥',
    cells: (w, h, g) => [
      { x: 0, y: 0, w: (w - g) / 2, h },
      { x: (w - g) / 2 + g, y: 0, w: (w - g) / 2, h: (h - g) / 2 },
      { x: (w - g) / 2 + g, y: (h - g) / 2 + g, w: (w - g) / 2, h: (h - g) / 2 },
    ],
  },
  {
    id: '2t1b', label: '2 Top + 1 Bottom', minPhotos: 3, maxPhotos: 3, diagram: '╤▄',
    cells: (w, h, g) => [
      { x: 0, y: 0, w: (w - g) / 2, h: (h - g) / 2 },
      { x: (w - g) / 2 + g, y: 0, w: (w - g) / 2, h: (h - g) / 2 },
      { x: 0, y: (h - g) / 2 + g, w, h: (h - g) / 2 },
    ],
  },
  {
    id: 'g4', label: '4-Photo Grid (2×2)', minPhotos: 4, maxPhotos: 4, diagram: '▚▚',
    cells: (w, h, g) => [
      { x: 0, y: 0, w: (w - g) / 2, h: (h - g) / 2 },
      { x: (w - g) / 2 + g, y: 0, w: (w - g) / 2, h: (h - g) / 2 },
      { x: 0, y: (h - g) / 2 + g, w: (w - g) / 2, h: (h - g) / 2 },
      { x: (w - g) / 2 + g, y: (h - g) / 2 + g, w: (w - g) / 2, h: (h - g) / 2 },
    ],
  },
  {
    id: '1l4r', label: '1 Large + 4 Small', minPhotos: 5, maxPhotos: 5, diagram: '▐▚',
    cells: (w, h, g) => {
      const lw = (w - g) * 0.6;
      const rw = w - lw - g;
      const rh = (h - g * 3) / 4;
      return [
        { x: 0, y: 0, w: lw, h },
        { x: lw + g, y: 0, w: rw, h: rh },
        { x: lw + g, y: rh + g, w: rw, h: rh },
        { x: lw + g, y: (rh + g) * 2, w: rw, h: rh },
        { x: lw + g, y: (rh + g) * 3, w: rw, h: rh },
      ];
    },
  },
  {
    id: 'g6', label: '6-Photo Grid (2×3)', minPhotos: 6, maxPhotos: 6, diagram: '▚▚▚',
    cells: (w, h, g) => {
      const cw = (w - g) / 2;
      const rh = (h - g * 2) / 3;
      return [0, 1, 2].flatMap(row => [0, 1].map(col => ({
        x: col * (cw + g),
        y: row * (rh + g),
        w: cw,
        h: rh,
      })));
    },
  },
  {
    id: 'g9', label: '9-Photo Grid (3×3)', minPhotos: 9, maxPhotos: 9, diagram: '▚▚▚×3',
    cells: (w, h, g) => {
      const cw = (w - g * 2) / 3;
      const rh = (h - g * 2) / 3;
      return [0, 1, 2].flatMap(row => [0, 1, 2].map(col => ({
        x: col * (cw + g),
        y: row * (rh + g),
        w: cw,
        h: rh,
      })));
    },
  },
];

const SIZE_PRESETS: { id: SizePreset; label: string; w: number; h: number }[] = [
  { id: 'square', label: 'Square 1080×1080', w: 1080, h: 1080 },
  { id: 'wide', label: 'Wide 1920×1080', w: 1920, h: 1080 },
  { id: 'tall', label: 'Tall 1080×1350', w: 1080, h: 1350 },
];

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

export default function PhotoCollageMaker() {
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [layoutId, setLayoutId] = useState<LayoutId>('g4');
  const [gap, setGap] = useState(8);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [sizePreset, setSizePreset] = useState<SizePreset>('square');
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);

  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() =>
    localStorage.getItem('feedback_photo-collage-maker') as 'up' | 'down' | null
  );

  const handleFeedback = (val: 'up' | 'down') => {
    setFeedback(val);
    localStorage.setItem('feedback_photo-collage-maker', val);
    toast({ title: val === 'up' ? 'Thanks for your feedback! 😊' : 'Thanks! We\'ll improve.' });
  };

  const handleFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...newFiles].slice(0, 9));
  }, []);

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const selectedLayout = useMemo(() => LAYOUTS.find(l => l.id === layoutId)!, [layoutId]);
  const size = useMemo(() => SIZE_PRESETS.find(s => s.id === sizePreset)!, [sizePreset]);

  const renderCollage = useCallback(async () => {
    if (files.length < selectedLayout.minPhotos) return;
    setIsRendering(true);
    try {
      const imgs = await Promise.all(files.slice(0, selectedLayout.maxPhotos).map(loadImageFromFile));
      const canvas = document.createElement('canvas');
      canvas.width = size.w;
      canvas.height = size.h;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size.w, size.h);

      const cells = selectedLayout.cells(size.w, size.h, gap);
      imgs.forEach((img, i) => {
        if (!cells[i]) return;
        const cell = cells[i];
        ctx.save();
        ctx.beginPath();
        ctx.rect(cell.x, cell.y, cell.w, cell.h);
        ctx.clip();
        drawImageCover(ctx, img, cell.x, cell.y, cell.w, cell.h);
        ctx.restore();
      });

      setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.92));
    } catch {
      toast({ title: 'Error rendering collage', variant: 'destructive' });
    } finally {
      setIsRendering(false);
    }
  }, [files, selectedLayout, size, gap, bgColor, toast]);

  useEffect(() => {
    if (files.length >= selectedLayout.minPhotos) {
      renderCollage();
    }
  }, [files, selectedLayout, renderCollage]);

  const handleDownload = async (format: 'jpg' | 'png') => {
    if (!previewDataUrl) {
      toast({ title: 'Please add images first', variant: 'destructive' });
      return;
    }
    const imgs = await Promise.all(files.slice(0, selectedLayout.maxPhotos).map(loadImageFromFile));
    const canvas = document.createElement('canvas');
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size.w, size.h);
    const cells = selectedLayout.cells(size.w, size.h, gap);
    imgs.forEach((img, i) => {
      if (!cells[i]) return;
      const cell = cells[i];
      ctx.save();
      ctx.beginPath();
      ctx.rect(cell.x, cell.y, cell.w, cell.h);
      ctx.clip();
      drawImageCover(ctx, img, cell.x, cell.y, cell.w, cell.h);
      ctx.restore();
    });
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `collage.${format}`);
    }, format === 'jpg' ? 'image/jpeg' : 'image/png', 0.92);
    toast({ title: `Collage downloaded as ${format.toUpperCase()}!` });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Grid3X3 className="h-8 w-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">Photo Collage Maker</h1>
        </div>
        <p className="text-blue-100 max-w-2xl">
          Create beautiful photo collages with multiple layouts — free, instant, and fully in your browser.
        </p>
      </div>

      {/* Main */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Upload */}
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Upload Photos</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}`}
            >
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => handleFiles(e.target.files)} />
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-600">Drop images here or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">Up to 9 images</p>
            </div>
            {files.length > 0 && (
              <div className="mt-3 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-1">
                    <span className="truncate text-gray-700 max-w-[180px]">{f.name}</span>
                    <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 ml-2">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Layout picker */}
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Layout</h2>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUTS.map(l => (
                <button key={l.id} onClick={() => setLayoutId(l.id)}
                  className={`rounded-lg border p-3 text-left transition-colors ${layoutId === l.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <div className="text-lg mb-1">{l.diagram}</div>
                  <div className="text-xs text-gray-600">{l.label}</div>
                  <div className="text-xs text-gray-400">{l.minPhotos} photo{l.minPhotos !== 1 ? 's' : ''}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
            <div>
              <Label>Canvas Size</Label>
              <div className="mt-2 space-y-1">
                {SIZE_PRESETS.map(s => (
                  <button key={s.id} onClick={() => setSizePreset(s.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${sizePreset === s.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Gap/Border: {gap}px</Label>
              <input type="range" min={0} max={20} value={gap} onChange={(e) => setGap(Number(e.target.value))}
                className="w-full mt-1 accent-blue-600" />
            </div>
            <div className="flex items-center gap-3">
              <Label>Background Color</Label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                className="h-9 w-20 rounded border cursor-pointer" />
            </div>
          </div>

          {/* Download buttons */}
          <div className="flex gap-3">
            <Button onClick={() => handleDownload('jpg')} disabled={!previewDataUrl}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="mr-2 h-4 w-4" /> JPG
            </Button>
            <Button onClick={() => handleDownload('png')} disabled={!previewDataUrl}
              variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" /> PNG
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Collage Preview</h2>
            {previewDataUrl ? (
              <img src={previewDataUrl} alt="Collage preview" className="w-full rounded-lg border object-contain max-h-[500px]" />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <Grid3X3 className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">Upload photos and select a layout to preview your collage</p>
                {files.length > 0 && files.length < selectedLayout.minPhotos && (
                  <p className="text-orange-500 text-xs mt-2">Need at least {selectedLayout.minPhotos} photos for this layout</p>
                )}
              </div>
            )}
            {isRendering && <p className="text-xs text-gray-400 mt-2 text-center">Rendering…</p>}
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-blue-800">Pro Tips</h2>
        </div>
        <ul className="space-y-2 text-sm text-blue-700">
          <li>• Use photos with similar color palettes for a cohesive look.</li>
          <li>• A small gap (4–8px) with a contrasting background color adds a clean border effect.</li>
          <li>• Square 1080×1080 is perfect for Instagram posts.</li>
          <li>• Wide 1920×1080 works great for Facebook covers and desktop wallpapers.</li>
          <li>• Images are automatically cropped to fill each cell — portrait and landscape photos both work.</li>
          <li>• Download as PNG for lossless quality, or JPG for smaller file sizes.</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4 text-lg">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Are my photos uploaded anywhere?', a: 'No. All processing happens client-side in your browser. Your photos never leave your device.' },
            { q: 'Can I use photos with different orientations?', a: 'Yes! Photos are automatically cropped and scaled to fill their cell using cover-mode fitting.' },
            { q: 'What if I have fewer photos than the layout needs?', a: 'The preview only renders when you have enough photos for the selected layout. Add more photos or switch to a smaller layout.' },
            { q: 'What resolution will the output be?', a: 'Output resolution depends on the selected canvas size — up to 1920×1080 or 1080×1350 pixels.' },
            { q: 'Can I reorder photos?', a: 'Remove and re-add photos in the desired order — they are placed in the collage in upload sequence.' },
          ].map(({ q, a }) => (
            <div key={q} className="border-b pb-3 last:border-0 last:pb-0">
              <p className="font-medium text-gray-700 mb-1">{q}</p>
              <p className="text-sm text-gray-500">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Watermark Image', href: '/watermark-image', icon: '🔏' },
            { label: 'Image Resizer', href: '/image-resizer', icon: '📐' },
            { label: 'Image Compressor', href: '/image-compressor', icon: '🗜️' },
            { label: 'Image to PDF', href: '/image-to-pdf', icon: '📄' },
          ].map(({ label, href, icon }) => (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div className="rounded-xl border bg-white shadow-sm p-6 text-center">
        <p className="font-medium text-gray-700 mb-3">Was this tool helpful?</p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => handleFeedback('up')}
            className={feedback === 'up' ? 'border-green-500 text-green-600' : ''}>
            <ThumbsUp className="mr-2 h-4 w-4" /> Yes
          </Button>
          <Button variant="outline" onClick={() => handleFeedback('down')}
            className={feedback === 'down' ? 'border-red-400 text-red-500' : ''}>
            <ThumbsDown className="mr-2 h-4 w-4" /> No
          </Button>
        </div>
        {feedback && <p className="text-sm text-gray-500 mt-2">Thanks for your feedback!</p>}
      </div>
    </div>
  );
}
