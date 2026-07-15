import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import {
  Upload, Download, Lightbulb, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type Algorithm = 'unsharp' | 'edge';

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

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const binary = atob(b64);
  const u8 = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) u8[i] = binary.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

function applyConvolution(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  kernel: number[]
) {
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let v = 0;
        for (let ky = -1; ky <= 1; ky++)
          for (let kx = -1; kx <= 1; kx++)
            v += src.data[((y + ky) * w + (x + kx)) * 4 + c] * kernel[(ky + 1) * 3 + (kx + 1)];
        dst.data[(y * w + x) * 4 + c] = Math.min(255, Math.max(0, v));
      }
      dst.data[(y * w + x) * 4 + 3] = src.data[(y * w + x) * 4 + 3];
    }
  }
  // Copy border pixels as-is
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (y === 0 || y === h - 1 || x === 0 || x === w - 1) {
        for (let c = 0; c < 4; c++) {
          dst.data[(y * w + x) * 4 + c] = src.data[(y * w + x) * 4 + c];
        }
      }
    }
  }
  ctx.putImageData(dst, 0, 0);
}

function getKernel(algorithm: Algorithm, amount: number): number[] {
  if (algorithm === 'unsharp') {
    return [
      0, -amount, 0,
      -amount, 1 + 4 * amount, -amount,
      0, -amount, 0,
    ];
  } else {
    // Edge enhance: stronger edge detection kernel
    const s = amount * 2;
    return [
      -s, -s, -s,
      -s, 1 + 8 * s, -s,
      -s, -s, -s,
    ];
  }
}

export default function SharpenImage() {
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string>('');
  const [sharpenedDataUrl, setSharpenedDataUrl] = useState<string>('');
  const [showOriginal, setShowOriginal] = useState(false);
  const [intensity, setIntensity] = useState(0.5);
  const [algorithm, setAlgorithm] = useState<Algorithm>('unsharp');
  const [isProcessing, setIsProcessing] = useState(false);

  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() =>
    localStorage.getItem('feedback_sharpen-image') as 'up' | 'down' | null
  );

  const handleFeedback = (val: 'up' | 'down') => {
    setFeedback(val);
    localStorage.setItem('feedback_sharpen-image', val);
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
    setSharpenedDataUrl('');
    const img = await loadImageFromFile(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    setOriginalDataUrl(canvas.toDataURL('image/png'));
  }, [toast]);

  const applySharpen = useCallback(async () => {
    if (!imageFile) {
      toast({ title: 'Please upload an image first', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    try {
      const img = await loadImageFromFile(imageFile);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const kernel = getKernel(algorithm, intensity);
      applyConvolution(ctx, canvas.width, canvas.height, kernel);
      setSharpenedDataUrl(canvas.toDataURL('image/png'));
      setShowOriginal(false);
      toast({ title: 'Sharpening applied! Click Download to save.' });
    } catch {
      toast({ title: 'Error applying sharpening', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  }, [imageFile, intensity, algorithm, toast]);

  const handleDownload = useCallback(async () => {
    if (!sharpenedDataUrl) {
      toast({ title: 'Apply sharpening first', variant: 'destructive' });
      return;
    }
    const blob = dataUrlToBlob(sharpenedDataUrl);
    downloadBlob(blob, `sharpened-${imageFile?.name ?? 'image.png'}`);
    toast({ title: 'Sharpened image downloaded!' });
  }, [sharpenedDataUrl, imageFile, toast]);

  const previewUrl = showOriginal ? originalDataUrl : (sharpenedDataUrl || originalDataUrl);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-lg">✨</div>
          <h1 className="text-2xl sm:text-3xl font-bold">Sharpen Image</h1>
        </div>
        <p className="text-blue-100 max-w-2xl">
          Enhance image sharpness with adjustable controls — processed entirely in your browser using convolution kernels.
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

          {/* Controls */}
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-gray-800">Sharpening Controls</h2>

            <div>
              <Label>Algorithm</Label>
              <div className="mt-2 flex rounded-lg border overflow-hidden">
                <button onClick={() => setAlgorithm('unsharp')}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${algorithm === 'unsharp' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  Unsharp Mask
                </button>
                <button onClick={() => setAlgorithm('edge')}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${algorithm === 'edge' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  Edge Enhance
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {algorithm === 'unsharp'
                  ? 'Natural sharpening — best for photos and portraits.'
                  : 'Aggressive edge detection — best for graphics and text.'}
              </p>
            </div>

            <div>
              <Label>Intensity: {intensity.toFixed(1)}</Label>
              <input type="range" min={0.1} max={2.0} step={0.1} value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full mt-1 accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0.1 (subtle)</span>
                <span>2.0 (strong)</span>
              </div>
            </div>

            <Button onClick={applySharpen} disabled={!imageFile || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {isProcessing ? 'Processing…' : 'Apply Sharpening'}
            </Button>
          </div>

          {/* Before/After toggle */}
          {sharpenedDataUrl && (
            <div className="rounded-xl border bg-white shadow-sm p-4">
              <h2 className="font-semibold text-gray-800 mb-3 text-sm">Before / After</h2>
              <div className="flex rounded-lg border overflow-hidden">
                <button onClick={() => setShowOriginal(true)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${showOriginal ? 'bg-gray-700 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  Original
                </button>
                <button onClick={() => setShowOriginal(false)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${!showOriginal ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  Sharpened
                </button>
              </div>
            </div>
          )}

          <Button onClick={handleDownload} disabled={!sharpenedDataUrl} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" /> Download Sharpened Image
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-1">
              {sharpenedDataUrl
                ? (showOriginal ? '📷 Original' : '✨ Sharpened')
                : 'Preview'}
            </h2>
            {sharpenedDataUrl && (
              <p className="text-xs text-gray-400 mb-3">
                {showOriginal ? 'Showing original image' : `Algorithm: ${algorithm === 'unsharp' ? 'Unsharp Mask' : 'Edge Enhance'} | Intensity: ${intensity.toFixed(1)}`}
              </p>
            )}
            {previewUrl ? (
              <img src={previewUrl} alt={showOriginal ? 'Original' : 'Sharpened'} className="w-full rounded-lg border object-contain max-h-[500px]" />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-5xl mb-3">✨</div>
                <p className="text-gray-500 text-sm">Upload an image to start sharpening</p>
              </div>
            )}
          </div>

          {/* Side-by-side on desktop if both available */}
          {sharpenedDataUrl && originalDataUrl && (
            <div className="hidden lg:grid grid-cols-2 gap-4 mt-4">
              <div className="rounded-xl border bg-white shadow-sm p-4">
                <p className="text-xs font-medium text-gray-500 mb-2">📷 Original</p>
                <img src={originalDataUrl} alt="Original" className="w-full rounded-lg border object-contain max-h-48" />
              </div>
              <div className="rounded-xl border bg-white shadow-sm p-4">
                <p className="text-xs font-medium text-blue-600 mb-2">✨ Sharpened</p>
                <img src={sharpenedDataUrl} alt="Sharpened" className="w-full rounded-lg border object-contain max-h-48" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-blue-800">Pro Tips</h2>
        </div>
        <ul className="space-y-2 text-sm text-blue-700">
          <li>• Start with intensity 0.3–0.5 for natural-looking sharpness on photos.</li>
          <li>• Unsharp Mask is the gold-standard algorithm used in professional photo editors.</li>
          <li>• Edge Enhance is great for making text, logos, and line-art crisper.</li>
          <li>• Too much sharpening (above 1.5) can introduce visible halos around edges.</li>
          <li>• Use the Before/After toggle or the side-by-side comparison to evaluate results.</li>
          <li>• Apply sharpening as the last step in your editing workflow for best results.</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4 text-lg">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Is my image uploaded to a server?', a: 'No. All processing happens locally in your browser using the Canvas API and pixel-level convolution.' },
            { q: 'What is Unsharp Mask?', a: 'Unsharp Mask is a classic sharpening technique that enhances contrast at edges, making images appear crisper without looking artificial.' },
            { q: 'What is Edge Enhance?', a: 'Edge Enhance uses a stronger kernel to amplify all detected edges — ideal for illustrations, text, and logos.' },
            { q: 'Why does over-sharpening look bad?', a: 'Very high intensity values amplify noise and create "halos" — white/dark rings around edges. Keep intensity below 1.0 for natural results.' },
            { q: 'What output format is used?', a: 'Output is PNG to preserve full quality. You can re-compress it afterwards with the Image Compressor tool.' },
            { q: 'Can I sharpen after blurring?', a: 'Yes! Apply blur first, download, then re-upload the blurred image to this tool to selectively re-sharpen.' },
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
            { label: 'Blur Image', href: '/blur-image', icon: '🌫️' },
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
