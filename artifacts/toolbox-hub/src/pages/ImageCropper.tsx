import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Upload, Download, Image as ImageIcon, Lightbulb, ThumbsUp, ThumbsDown, Crop,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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

type AspectRatio = 'free' | '1:1' | '4:3' | '16:9' | '3:2' | '2:3' | '9:16';

const ASPECT_RATIOS: { label: string; value: AspectRatio }[] = [
  { label: 'Free', value: 'free' },
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '16:9', value: '16:9' },
  { label: '3:2', value: '3:2' },
  { label: '2:3', value: '2:3' },
  { label: '9:16', value: '9:16' },
];

function getRatio(ar: AspectRatio): number | null {
  if (ar === 'free') return null;
  const [a, b] = ar.split(':').map(Number);
  return a / b;
}

const RELATED = [
  { label: 'Image Resizer', href: '/image-resizer', emoji: '📐' },
  { label: 'Image Compressor', href: '/image-compressor', emoji: '🗜️' },
  { label: 'Watermark Image', href: '/watermark-image', emoji: '💧' },
  { label: 'Image Converter', href: '/image-converter', emoji: '🔄' },
];

const FAQ = [
  { q: 'Does cropping happen in my browser?', a: 'Yes — all processing uses the HTML5 Canvas API locally. Nothing is uploaded to any server.' },
  { q: 'Can I crop to an exact aspect ratio?', a: 'Yes — choose from Free, 1:1, 4:3, 16:9, and more. The crop box resizes to maintain the selected ratio.' },
  { q: 'How do I use the crop box?', a: 'Click and drag inside the image area to set a new crop region. Drag corners to resize while maintaining aspect ratio.' },
  { q: 'What format is the cropped image?', a: 'The cropped image is downloaded as JPEG by default. It preserves your original image quality.' },
  { q: 'Can I enter exact crop coordinates?', a: 'Yes — use the X, Y, Width, Height inputs below the image for precise pixel-level control.' },
];

interface CropBox { x: number; y: number; w: number; h: number; }

export default function ImageCropper() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('free');
  const [crop, setCrop] = useState<CropBox>({ x: 0, y: 0, w: 0, h: 0 });
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() => {
    try { return localStorage.getItem('feedback_image-cropper') as 'up' | 'down' | null; } catch { return null; }
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Drag state
  const dragging = useRef(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, cropX: 0, cropY: 0 });

  const getScale = useCallback((): number => {
    if (!imgRef.current || !naturalW) return 1;
    return imgRef.current.getBoundingClientRect().width / naturalW;
  }, [naturalW]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file.', variant: 'destructive' });
      return;
    }
    const img = await loadImageFromFile(f);
    setFile(f);
    setImageUrl(URL.createObjectURL(f));
    setNaturalW(img.naturalWidth);
    setNaturalH(img.naturalHeight);
    const initCrop = { x: Math.round(img.naturalWidth * 0.1), y: Math.round(img.naturalHeight * 0.1), w: Math.round(img.naturalWidth * 0.8), h: Math.round(img.naturalHeight * 0.8) };
    setCrop(initCrop);
  }, [toast]);

  const applyAspectRatio = useCallback((ar: AspectRatio, currentCrop: CropBox) => {
    const ratio = getRatio(ar);
    if (!ratio) return currentCrop;
    const newH = Math.round(currentCrop.w / ratio);
    return { ...currentCrop, h: Math.min(newH, naturalH - currentCrop.y) };
  }, [naturalH]);

  const handleAspectChange = (ar: AspectRatio) => {
    setAspectRatio(ar);
    setCrop(prev => applyAspectRatio(ar, prev));
  };

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const onMouseDown = (e: React.MouseEvent) => {
    if (!imageUrl) return;
    const scale = getScale();
    const rect = imgRef.current!.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;
    dragging.current = true;
    dragStart.current = { mouseX, mouseY, cropX: mouseX, cropY: mouseY };
    e.preventDefault();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current || !imageUrl) return;
    const scale = getScale();
    const rect = imgRef.current!.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    const x = clamp(Math.min(dragStart.current.cropX, mouseX), 0, naturalW);
    const y = clamp(Math.min(dragStart.current.cropY, mouseY), 0, naturalH);
    const rawW = clamp(Math.abs(mouseX - dragStart.current.cropX), 1, naturalW - x);
    const rawH = clamp(Math.abs(mouseY - dragStart.current.cropY), 1, naturalH - y);

    const ratio = getRatio(aspectRatio);
    const h = ratio ? Math.round(rawW / ratio) : rawH;

    setCrop({ x: Math.round(x), y: Math.round(y), w: Math.round(rawW), h: Math.min(Math.round(h), naturalH - Math.round(y)) });
  };

  const onMouseUp = () => { dragging.current = false; };

  const handleCropInput = (field: keyof CropBox, val: number) => {
    setCrop(prev => {
      const next = { ...prev, [field]: val };
      if (aspectRatio !== 'free' && (field === 'w')) {
        const ratio = getRatio(aspectRatio)!;
        next.h = Math.round(val / ratio);
      }
      return next;
    });
  };

  const handleCrop = useCallback(async () => {
    if (!file || !crop.w || !crop.h) return;
    setProcessing(true);
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement('canvas');
      canvas.width = crop.w;
      canvas.height = crop.h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
      canvas.toBlob((blob) => {
        if (!blob) { setProcessing(false); return; }
        downloadBlob(blob, 'cropped.jpg');
        setProcessing(false);
        toast({ title: 'Cropped!', description: `${crop.w}×${crop.h} px saved.` });
      }, 'image/jpeg', 0.92);
    } catch {
      setProcessing(false);
      toast({ title: 'Error', description: 'Failed to crop image.', variant: 'destructive' });
    }
  }, [file, crop, toast]);

  const scale = getScale();
  const boxStyle: React.CSSProperties = imageUrl ? {
    position: 'absolute',
    left: crop.x * scale,
    top: crop.y * scale,
    width: crop.w * scale,
    height: crop.h * scale,
    border: '2px solid #2563eb',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  } : {};

  const handleFeedback = (v: 'up' | 'down') => {
    setFeedback(v);
    try { localStorage.setItem('feedback_image-cropper', v); } catch {}
    toast({ title: v === 'up' ? '🎉 Thanks!' : '🙏 Thanks for the feedback!' });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-white/20 p-2"><Crop className="h-6 w-6" /></div>
          <h1 className="text-2xl sm:text-3xl font-bold">Image Cropper</h1>
        </div>
        <p className="text-blue-100 max-w-xl">Crop images to any size or aspect ratio — right in your browser.</p>
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

            {naturalW > 0 && (
              <div className="text-sm text-gray-500">Original: <span className="font-semibold text-gray-700">{naturalW} × {naturalH} px</span></div>
            )}

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <div className="flex flex-wrap gap-2">
                {ASPECT_RATIOS.map((ar) => (
                  <button key={ar.value} onClick={() => handleAspectChange(ar.value)}
                    className={`rounded-lg border px-3 py-1 text-sm font-medium transition-colors ${aspectRatio === ar.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-700'}`}
                  >{ar.label}</button>
                ))}
              </div>
            </div>

            {/* Manual inputs */}
            {naturalW > 0 && (
              <div className="space-y-2">
                <Label>Crop Coordinates (px)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['x', 'y', 'w', 'h'] as (keyof CropBox)[]).map((f) => (
                    <div key={f} className="space-y-1">
                      <Label className="text-xs text-gray-500">{f === 'w' ? 'Width' : f === 'h' ? 'Height' : f.toUpperCase()}</Label>
                      <Input type="number" min={0} value={crop[f]}
                        onChange={(e) => handleCropInput(f, Number(e.target.value))} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {crop.w > 0 && crop.h > 0 && (
              <div className="text-sm text-gray-500">
                Crop size: <span className="font-semibold text-blue-700">{crop.w} × {crop.h} px</span>
              </div>
            )}

            <Button onClick={handleCrop} disabled={!file || processing || crop.w === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {processing ? 'Cropping…' : <><Download className="mr-2 h-4 w-4" />Crop &amp; Download</>}
            </Button>
          </div>
        </div>

        {/* Visual Crop Preview */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Crop Area <span className="text-xs font-normal text-gray-400">(drag to select)</span></h2>
            {!imageUrl ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
                <p className="text-sm">Upload an image to start cropping</p>
              </div>
            ) : (
              <div
                ref={containerRef}
                className="relative inline-block cursor-crosshair select-none overflow-hidden rounded-lg"
                style={{ display: 'block' }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Crop preview"
                  className="block max-w-full max-h-96 object-contain"
                  draggable={false}
                />
                {/* Dark overlay (4 rects) */}
                {crop.w > 0 && (
                  <>
                    {/* top */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: crop.y * scale, background: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />
                    {/* bottom */}
                    <div style={{ position: 'absolute', top: (crop.y + crop.h) * scale, left: 0, width: '100%', bottom: 0, background: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />
                    {/* left */}
                    <div style={{ position: 'absolute', top: crop.y * scale, left: 0, width: crop.x * scale, height: crop.h * scale, background: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />
                    {/* right */}
                    <div style={{ position: 'absolute', top: crop.y * scale, left: (crop.x + crop.w) * scale, right: 0, height: crop.h * scale, background: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />
                    {/* Crop box border */}
                    <div style={boxStyle} />
                  </>
                )}
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
          <li>• Use <strong>1:1</strong> ratio for profile pictures and social media avatars.</li>
          <li>• Use <strong>16:9</strong> for widescreen thumbnails like YouTube covers.</li>
          <li>• Enter exact pixel values in the inputs below for precise control.</li>
          <li>• <strong>Drag across the image</strong> to define a new crop region interactively.</li>
          <li>• The dark overlay shows what will be <strong>removed</strong>; the clear area is what you keep.</li>
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
