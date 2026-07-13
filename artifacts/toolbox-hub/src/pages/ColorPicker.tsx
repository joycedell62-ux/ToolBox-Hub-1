import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Upload, Copy, Check, Lightbulb, ThumbsUp, ThumbsDown, Pipette, ZoomIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface PickedColor {
  hex: string;
  r: number;
  g: number;
  b: number;
  timestamp: number;
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return [0, 0, 0, 100];
  return [
    Math.round((1 - r - k) / (1 - k) * 100),
    Math.round((1 - g - k) / (1 - k) * 100),
    Math.round((1 - b - k) / (1 - k) * 100),
    Math.round(k * 100),
  ];
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const EXAMPLE_COLORS = [
  { hex: '#e74c3c', label: 'Red' },
  { hex: '#3498db', label: 'Blue' },
  { hex: '#2ecc71', label: 'Green' },
  { hex: '#f39c12', label: 'Orange' },
  { hex: '#9b59b6', label: 'Purple' },
  { hex: '#1abc9c', label: 'Teal' },
];

export default function ColorPicker() {
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const magnifierCanvasRef = useRef<HTMLCanvasElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [currentColor, setCurrentColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [pickedColors, setPickedColors] = useState<PickedColor[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() =>
    localStorage.getItem('feedback_color-picker') as 'up' | 'down' | null
  );

  const handleFeedback = (val: 'up' | 'down') => {
    setFeedback(val);
    localStorage.setItem('feedback_color-picker', val);
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
    const img = await loadImageFromFile(file);
    imgRef.current = img;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    setImageLoaded(true);
  }, [toast]);

  const samplePixel = useCallback((clientX: number, clientY: number, click: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;

    const ctx = canvas.getContext('2d')!;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const color = { r: pixel[0], g: pixel[1], b: pixel[2] };
    setCurrentColor(color);
    setMousePos({ x, y });

    // Draw magnifier
    const magCanvas = magnifierCanvasRef.current;
    if (magCanvas) {
      const ZOOM = 8;
      const REGION = 5;
      magCanvas.width = REGION * ZOOM;
      magCanvas.height = REGION * ZOOM;
      const magCtx = magCanvas.getContext('2d')!;
      magCtx.imageSmoothingEnabled = false;
      magCtx.drawImage(canvas,
        x - Math.floor(REGION / 2), y - Math.floor(REGION / 2), REGION, REGION,
        0, 0, REGION * ZOOM, REGION * ZOOM
      );
      // Draw crosshair center pixel
      magCtx.strokeStyle = 'rgba(255,255,255,0.8)';
      magCtx.lineWidth = 1;
      const cx = Math.floor(REGION / 2) * ZOOM;
      const cy = Math.floor(REGION / 2) * ZOOM;
      magCtx.strokeRect(cx, cy, ZOOM, ZOOM);
    }

    if (click) {
      const hex = rgbToHex(color.r, color.g, color.b);
      setPickedColors(prev => [{ hex, ...color, timestamp: Date.now() }, ...prev].slice(0, 10));
    }
  }, [imageLoaded]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    samplePixel(e.clientX, e.clientY, false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    samplePixel(e.clientX, e.clientY, true);
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
    toast({ title: 'Copied to clipboard!' });
  };

  const hex = currentColor ? rgbToHex(currentColor.r, currentColor.g, currentColor.b) : null;
  const hsl = currentColor ? rgbToHsl(currentColor.r, currentColor.g, currentColor.b) : null;
  const cmyk = currentColor ? rgbToCmyk(currentColor.r, currentColor.g, currentColor.b) : null;

  function CopyBtn({ value, label }: { value: string; label: string }) {
    const key = `${label}-${value}`;
    return (
      <button onClick={() => copyToClipboard(value, key)}
        className="ml-auto flex items-center gap-1 rounded px-2 py-0.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
        {copiedKey === key ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        Copy
      </button>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Pipette className="h-8 w-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">Color Picker</h1>
        </div>
        <p className="text-blue-100 max-w-2xl">
          Pick any color from an uploaded image — get HEX, RGB, HSL, and CMYK values instantly.
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
                  <p className="text-xs text-gray-400 mt-1">Then click any pixel to pick its color</p>
                </>
              )}
            </div>
          </div>

          {/* Color info */}
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Color Values</h2>
            {currentColor ? (
              <div className="space-y-3">
                <div className="rounded-lg h-20 border" style={{ backgroundColor: hex! }} />
                {[
                  { label: 'HEX', value: hex! },
                  { label: 'RGB', value: `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})` },
                  { label: 'HSL', value: hsl ? `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` : '' },
                  { label: 'CMYK', value: cmyk ? `cmyk(${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${cmyk[3]}%)` : '' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase">{label}</span>
                      <p className="text-sm font-mono text-gray-800">{value}</p>
                    </div>
                    <CopyBtn value={value} label={label} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="flex gap-2 justify-center mb-3">
                  {EXAMPLE_COLORS.map(c => (
                    <div key={c.hex} className="h-8 w-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: c.hex }}
                      title={c.label} />
                  ))}
                </div>
                <p className="text-sm text-gray-500">Upload an image and hover/click to pick colors</p>
              </div>
            )}
          </div>

          {/* Magnifier */}
          {imageLoaded && (
            <div className="rounded-xl border bg-white shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <ZoomIn className="h-4 w-4 text-blue-600" />
                <h2 className="font-semibold text-gray-800">Magnifier (8×)</h2>
              </div>
              <canvas ref={magnifierCanvasRef} className="w-full rounded-lg border image-rendering-pixelated"
                style={{ imageRendering: 'pixelated', maxHeight: 160 }} />
            </div>
          )}

          {/* Picked colors history */}
          {pickedColors.length > 0 && (
            <div className="rounded-xl border bg-white shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-3">Picked Colors History</h2>
              <div className="flex flex-wrap gap-2">
                {pickedColors.map((c, i) => (
                  <button key={`${c.timestamp}-${i}`} onClick={() => copyToClipboard(c.hex, `hist-${i}`)}
                    title={`Click to copy ${c.hex}`}
                    className="h-8 w-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.hex }} />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Click a swatch to copy its HEX value</p>
            </div>
          )}
        </div>

        {/* Canvas preview */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-3">
              {imageLoaded ? 'Click or hover to pick a color' : 'Image Preview'}
            </h2>
            {imageLoaded ? (
              <canvas
                ref={canvasRef}
                className="w-full rounded-lg border max-h-[500px] object-contain"
                style={{ cursor: 'crosshair' }}
                onMouseMove={handleCanvasMouseMove}
                onClick={handleCanvasClick}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <Pipette className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm text-center">Upload an image to start picking colors</p>
                <div className="flex gap-3 mt-4">
                  {EXAMPLE_COLORS.map(c => (
                    <div key={c.hex} className="flex flex-col items-center gap-1">
                      <div className="h-10 w-10 rounded-lg shadow" style={{ backgroundColor: c.hex }} />
                      <span className="text-xs text-gray-500">{c.label}</span>
                    </div>
                  ))}
                </div>
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
          <li>• Hover slowly over gradients to see color transitions in real time.</li>
          <li>• The magnifier shows an 8× zoomed view of the 5×5 pixel area around your cursor.</li>
          <li>• Click a pixel to save it to your picked colors history for easy reference.</li>
          <li>• CMYK values are useful for print design; HEX and RGB are for digital/web use.</li>
          <li>• Your color history keeps the last 10 picked colors — click any swatch to copy the HEX.</li>
          <li>• For precise picking, zoom in on the canvas and hover over the exact pixel you need.</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4 text-lg">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Is my image uploaded to a server?', a: 'No. Everything runs locally in your browser. Your image is never sent anywhere.' },
            { q: 'How accurate are the color values?', a: 'Exact — they are sampled directly from the pixel data of the original image at full resolution.' },
            { q: 'What is CMYK used for?', a: 'CMYK (Cyan, Magenta, Yellow, Key/Black) is the color model used in printing. Useful when matching digital colors to printed designs.' },
            { q: 'Can I pick colors from any image format?', a: 'Yes — PNG, JPG, WebP, and most browser-supported formats work.' },
            { q: 'What does the magnifier show?', a: 'It shows a 5×5 pixel region around your cursor, zoomed in 8× so you can see individual pixels clearly.' },
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
            { label: 'Image Compressor', href: '/image-compressor', icon: '🗜️' },
            { label: 'Blur Image', href: '/blur-image', icon: '🌫️' },
            { label: 'Sharpen Image', href: '/sharpen-image', icon: '✨' },
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
