import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Upload, Download, Lightbulb, ThumbsUp, ThumbsDown, Trash2, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type BlurMode = 'full' | 'region';

interface BlurRegion {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  intensity: number;
}

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

let _rid = 0;
const uid = () => `region-${++_rid}`;

export default function BlurImage() {
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [mode, setMode] = useState<BlurMode>('full');
  const [fullBlur, setFullBlur] = useState(5);
  const [regions, setRegions] = useState<BlurRegion[]>([]);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const drawStart = useRef<{ x: number; y: number } | null>(null);
  const currentRect = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() =>
    localStorage.getItem('feedback_blur-image') as 'up' | 'down' | null
  );

  const handleFeedback = (val: 'up' | 'down') => {
    setFeedback(val);
    localStorage.setItem('feedback_blur-image', val);
    toast({ title: val === 'up' ? 'Thanks for your feedback! 😊' : "Thanks! We'll improve." });
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please upload an image file', variant: 'destructive' });
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = await loadImageFromFile(file);
    imgRef.current = img;
    setRegions([]);
    setPreviewDataUrl('');
  }, [toast]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || !imgRef.current) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = imgRef.current.width / rect.width;
    const scaleY = imgRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const drawOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw existing regions
    regions.forEach(r => {
      ctx.fillStyle = 'rgba(59,130,246,0.25)';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = 'rgba(59,130,246,0.9)';
      ctx.lineWidth = 3;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    });
    // Draw current rect being drawn
    if (currentRect.current) {
      const r = currentRect.current;
      ctx.fillStyle = 'rgba(239,68,68,0.2)';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = 'rgba(239,68,68,0.9)';
      ctx.lineWidth = 2;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }
  }, [regions]);

  useEffect(() => { drawOverlay(); }, [drawOverlay]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'region') return;
    const coords = getCanvasCoords(e);
    if (!coords) return;
    setIsDrawing(true);
    drawStart.current = coords;
    currentRect.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart.current || mode !== 'region') return;
    const coords = getCanvasCoords(e);
    if (!coords) return;
    const x = Math.min(drawStart.current.x, coords.x);
    const y = Math.min(drawStart.current.y, coords.y);
    const w = Math.abs(coords.x - drawStart.current.x);
    const h = Math.abs(coords.y - drawStart.current.y);
    currentRect.current = { x, y, w, h };
    drawOverlay();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart.current || mode !== 'region') return;
    setIsDrawing(false);
    const coords = getCanvasCoords(e);
    if (!coords) return;
    const x = Math.min(drawStart.current.x, coords.x);
    const y = Math.min(drawStart.current.y, coords.y);
    const w = Math.abs(coords.x - drawStart.current.x);
    const h = Math.abs(coords.y - drawStart.current.y);
    if (w > 5 && h > 5) {
      setRegions(prev => [...prev, { id: uid(), x, y, w, h, intensity: 15 }]);
    }
    currentRect.current = null;
    drawStart.current = null;
  };

  const applyBlur = useCallback(async () => {
    if (!imageFile || !imgRef.current) {
      toast({ title: 'Please upload an image first', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    try {
      const img = imgRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      if (mode === 'full') {
        ctx.filter = `blur(${fullBlur}px)`;
        ctx.drawImage(img, 0, 0);
        ctx.filter = 'none';
      } else {
        // Draw original
        ctx.drawImage(img, 0, 0);
        // Apply blur for each region using offscreen canvas technique
        for (const region of regions) {
          const offscreen = document.createElement('canvas');
          offscreen.width = img.width;
          offscreen.height = img.height;
          const offCtx = offscreen.getContext('2d')!;
          offCtx.filter = `blur(${region.intensity}px)`;
          offCtx.drawImage(img, 0, 0);
          offCtx.filter = 'none';
          ctx.save();
          ctx.beginPath();
          ctx.rect(region.x, region.y, region.w, region.h);
          ctx.clip();
          ctx.drawImage(offscreen, 0, 0);
          ctx.restore();
        }
      }

      const dataUrl = canvas.toDataURL('image/png');
      setPreviewDataUrl(dataUrl);
      toast({ title: 'Blur applied! Click Download to save.' });
    } catch {
      toast({ title: 'Error applying blur', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  }, [imageFile, mode, fullBlur, regions, toast]);

  const handleDownload = useCallback(async () => {
    if (!previewDataUrl) {
      toast({ title: 'Apply blur first', variant: 'destructive' });
      return;
    }
    const res = await fetch(previewDataUrl);
    const blob = await res.blob();
    downloadBlob(blob, `blurred-${imageFile?.name ?? 'image.png'}`);
    toast({ title: 'Blurred image downloaded!' });
  }, [previewDataUrl, imageFile, toast]);

  const updateRegionIntensity = (id: string, intensity: number) => {
    setRegions(prev => prev.map(r => r.id === id ? { ...r, intensity } : r));
  };

  const removeRegion = (id: string) => {
    setRegions(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-lg">🌫️</div>
          <h1 className="text-2xl sm:text-3xl font-bold">Blur Image</h1>
        </div>
        <p className="text-blue-100 max-w-2xl">
          Apply Gaussian blur to an entire image or selected regions — live preview, processed in your browser.
        </p>
      </div>

      {/* Main */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Upload */}
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Upload Image</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}`}
            >
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleFiles(e.target.files)} />
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              {imageFile ? (
                <p className="text-sm font-medium text-blue-600">{imageFile.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-600">Drop image here or click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP supported</p>
                </>
              )}
            </div>
          </div>

          {/* Mode tabs */}
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <div className="flex rounded-lg border overflow-hidden mb-4">
              <button onClick={() => setMode('full')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'full' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                Full Image
              </button>
              <button onClick={() => setMode('region')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'region' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                Region Blur
              </button>
            </div>

            {mode === 'full' ? (
              <div>
                <Label>Blur Intensity: {fullBlur}px</Label>
                <input type="range" min={1} max={50} value={fullBlur}
                  onChange={(e) => setFullBlur(Number(e.target.value))}
                  className="w-full mt-1 accent-blue-600" />
                <p className="text-xs text-gray-400 mt-1">1px = subtle, 50px = heavy blur</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-100">
                  📌 Click and drag on the image to draw blur regions
                </p>
                {regions.length === 0 ? (
                  <p className="text-xs text-gray-400">No regions drawn yet</p>
                ) : (
                  <div className="space-y-2">
                    {regions.map((r, i) => (
                      <div key={r.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Region {i + 1}</span>
                          <button onClick={() => removeRegion(r.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <Label className="text-xs">Intensity: {r.intensity}px</Label>
                        <input type="range" min={1} max={50} value={r.intensity}
                          onChange={(e) => updateRegionIntensity(r.id, Number(e.target.value))}
                          className="w-full mt-1 accent-blue-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={applyBlur} disabled={!imageFile || isProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              {isProcessing ? 'Processing…' : 'Apply Blur'}
            </Button>
            <Button onClick={handleDownload} disabled={!previewDataUrl} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-3">
              {previewDataUrl ? 'Blurred Result' : imageUrl ? (mode === 'region' ? 'Draw regions on image' : 'Original Image') : 'Preview'}
            </h2>

            {previewDataUrl ? (
              <img src={previewDataUrl} alt="Blurred result" className="w-full rounded-lg border object-contain max-h-[500px]" />
            ) : imageUrl ? (
              <div className="relative">
                <img src={imageUrl} alt="Original"
                  className="w-full rounded-lg border object-contain max-h-[500px]"
                  style={{ filter: mode === 'full' ? `blur(${Math.min(fullBlur, 10)}px)` : 'none' }} />
                {mode === 'region' && (
                  <canvas
                    ref={overlayCanvasRef}
                    className="absolute inset-0 w-full h-full rounded-lg"
                    style={{ cursor: 'crosshair' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-5xl mb-3">🌫️</div>
                <p className="text-gray-500 text-sm">Upload an image to start</p>
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
        <ul className="space-y-2 text-sm text-blue-700">
          <li>• Use Region Blur to blur faces, license plates, or sensitive information selectively.</li>
          <li>• Full image blur at 5–10px creates a gentle soft-focus effect for backgrounds.</li>
          <li>• Each region can have its own intensity — blur faces heavily while subtly blurring backgrounds.</li>
          <li>• You can draw multiple overlapping regions for complex blurring needs.</li>
          <li>• The live CSS preview (full mode) is approximate — click Apply Blur for the accurate result.</li>
          <li>• Download as PNG to preserve transparency if your original image has it.</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4 text-lg">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Is my image uploaded to a server?', a: 'No. All processing is done in your browser using the Canvas API. Your image stays on your device.' },
            { q: 'Can I blur multiple regions at once?', a: 'Yes! In Region Blur mode, draw as many rectangles as you need, each with its own blur intensity.' },
            { q: 'What is the maximum blur intensity?', a: 'Up to 50px of Gaussian blur. For very high values, edges may show artifacts due to canvas boundary behavior.' },
            { q: 'Will quality be preserved?', a: 'The output is rendered at the original image resolution. Minor quality differences may occur at very high blur levels.' },
            { q: 'Can I undo a region?', a: 'Yes — each drawn region appears in the list below the canvas with a delete button.' },
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
            { label: 'Sharpen Image', href: '/sharpen-image', icon: '✨' },
            { label: 'Watermark Image', href: '/watermark-image', icon: '🔏' },
            { label: 'Image Compressor', href: '/image-compressor', icon: '🗜️' },
            { label: 'Color Picker', href: '/color-picker', icon: '🎨' },
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
