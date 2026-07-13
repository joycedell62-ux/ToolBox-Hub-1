import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Upload, Download, Image as ImageIcon, Type, Lightbulb,
  ThumbsUp, ThumbsDown, RotateCcw, Grid3X3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type WatermarkType = 'text' | 'image';
type Position =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

const POSITIONS: Position[] = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

const FONTS = ['Arial', 'Georgia', 'Courier', 'Impact'];

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

function getPositionCoords(
  pos: Position, imgW: number, imgH: number,
  wmW: number, wmH: number, margin = 20
): { x: number; y: number } {
  const map: Record<Position, { x: number; y: number }> = {
    'top-left':      { x: margin, y: margin + wmH },
    'top-center':    { x: (imgW - wmW) / 2, y: margin + wmH },
    'top-right':     { x: imgW - wmW - margin, y: margin + wmH },
    'center-left':   { x: margin, y: (imgH + wmH) / 2 },
    'center':        { x: (imgW - wmW) / 2, y: (imgH + wmH) / 2 },
    'center-right':  { x: imgW - wmW - margin, y: (imgH + wmH) / 2 },
    'bottom-left':   { x: margin, y: imgH - margin },
    'bottom-center': { x: (imgW - wmW) / 2, y: imgH - margin },
    'bottom-right':  { x: imgW - wmW - margin, y: imgH - margin },
  };
  return map[pos];
}

export default function WatermarkImage() {
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [wmDragOver, setWmDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wmFileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [wmImageFile, setWmImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<WatermarkType>('text');
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  // Text watermark state
  const [text, setText] = useState('© My Brand');
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [color, setColor] = useState('#ffffff');
  const [textOpacity, setTextOpacity] = useState(50);
  const [position, setPosition] = useState<Position>('bottom-right');
  const [rotation, setRotation] = useState(0);
  const [tileMode, setTileMode] = useState(false);

  // Image watermark state
  const [imgOpacity, setImgOpacity] = useState(50);
  const [imgSize, setImgSize] = useState(30);
  const [imgPosition, setImgPosition] = useState<Position>('bottom-right');

  // Feedback
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() => {
    return localStorage.getItem('feedback_watermark-image') as 'up' | 'down' | null;
  });

  const handleFeedback = (val: 'up' | 'down') => {
    setFeedback(val);
    localStorage.setItem('feedback_watermark-image', val);
    toast({ title: val === 'up' ? 'Thanks for your feedback! 😊' : 'Thanks! We\'ll improve.' });
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please upload an image file', variant: 'destructive' });
      return;
    }
    setBaseFile(file);
  }, [toast]);

  const handleWmFiles = useCallback((files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please upload an image file', variant: 'destructive' });
      return;
    }
    setWmImageFile(file);
  }, [toast]);

  const renderWatermark = useCallback(async () => {
    if (!baseFile) return;
    try {
      const baseImg = await loadImageFromFile(baseFile);
      const canvas = document.createElement('canvas');
      canvas.width = baseImg.width;
      canvas.height = baseImg.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(baseImg, 0, 0);

      if (activeTab === 'text' && text) {
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;

        if (tileMode) {
          const stepX = textWidth + 60;
          const stepY = textHeight + 60;
          for (let y = 0; y < baseImg.height + stepY; y += stepY) {
            for (let x = 0; x < baseImg.width + stepX; x += stepX) {
              ctx.globalAlpha = textOpacity / 100;
              ctx.save();
              ctx.translate(x + textWidth / 2, y + textHeight / 2);
              ctx.rotate((rotation * Math.PI) / 180);
              ctx.fillText(text, -textWidth / 2, 0);
              ctx.restore();
            }
          }
          ctx.globalAlpha = 1;
        } else {
          const coords = getPositionCoords(position, baseImg.width, baseImg.height, textWidth, textHeight);
          ctx.globalAlpha = textOpacity / 100;
          ctx.save();
          ctx.translate(coords.x + textWidth / 2, coords.y);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.fillText(text, -textWidth / 2, 0);
          ctx.restore();
          ctx.globalAlpha = 1;
        }
      } else if (activeTab === 'image' && wmImageFile) {
        const wmImg = await loadImageFromFile(wmImageFile);
        const wmW = (baseImg.width * imgSize) / 100;
        const wmH = (wmImg.height / wmImg.width) * wmW;
        const coords = getPositionCoords(imgPosition, baseImg.width, baseImg.height, wmW, wmH);
        ctx.globalAlpha = imgOpacity / 100;
        ctx.drawImage(wmImg, coords.x, coords.y - wmH, wmW, wmH);
        ctx.globalAlpha = 1;
      }

      setPreviewDataUrl(canvas.toDataURL('image/png'));
    } catch {
      toast({ title: 'Error rendering watermark', variant: 'destructive' });
    }
  }, [baseFile, activeTab, text, fontSize, fontFamily, color, textOpacity, position, rotation, tileMode, wmImageFile, imgOpacity, imgSize, imgPosition, toast]);

  useEffect(() => {
    renderWatermark();
  }, [renderWatermark]);

  const handleDownload = useCallback(async () => {
    if (!baseFile || !previewDataUrl) {
      toast({ title: 'Please upload an image first', variant: 'destructive' });
      return;
    }
    const res = await fetch(previewDataUrl);
    const blob = await res.blob();
    downloadBlob(blob, `watermarked-${baseFile.name}`);
    toast({ title: 'Watermarked image downloaded!' });
  }, [baseFile, previewDataUrl, toast]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <ImageIcon className="h-8 w-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">Watermark Image</h1>
        </div>
        <p className="text-blue-100 max-w-2xl">
          Add text or image watermarks with full control over opacity, size, and position — all processed locally in your browser.
        </p>
      </div>

      {/* Main area */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Upload base image */}
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Upload Base Image</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}`}
            >
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              {baseFile ? (
                <p className="text-sm font-medium text-blue-600">{baseFile.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-600">Drop image here or click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP supported</p>
                </>
              )}
            </div>
          </div>

          {/* Watermark type tabs */}
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <div className="flex rounded-lg border overflow-hidden mb-4">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'text' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Type className="inline h-4 w-4 mr-1" /> Text
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'image' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <ImageIcon className="inline h-4 w-4 mr-1" /> Image
              </button>
            </div>

            {activeTab === 'text' ? (
              <div className="space-y-4">
                <div>
                  <Label>Watermark Text</Label>
                  <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="© My Brand" className="mt-1" />
                </div>
                <div>
                  <Label>Font Size: {fontSize}px</Label>
                  <input type="range" min={12} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full mt-1 accent-blue-600" />
                </div>
                <div>
                  <Label>Font Family</Label>
                  <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label>Color</Label>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                      className="mt-1 h-9 w-full rounded border cursor-pointer" />
                  </div>
                  <div className="flex-1">
                    <Label>Opacity: {textOpacity}%</Label>
                    <input type="range" min={10} max={100} value={textOpacity} onChange={(e) => setTextOpacity(Number(e.target.value))}
                      className="w-full mt-3 accent-blue-600" />
                  </div>
                </div>
                <div>
                  <Label>Rotation: {rotation}°</Label>
                  <input type="range" min={-90} max={90} value={rotation} onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full mt-1 accent-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="tileMode" checked={tileMode} onChange={(e) => setTileMode(e.target.checked)}
                    className="accent-blue-600" />
                  <Label htmlFor="tileMode" className="cursor-pointer">Tile mode (repeat across image)</Label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setWmDragOver(true); }}
                  onDragLeave={() => setWmDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setWmDragOver(false); handleWmFiles(e.dataTransfer.files); }}
                  onClick={() => wmFileInputRef.current?.click()}
                  className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${wmDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}`}
                >
                  <input ref={wmFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleWmFiles(e.target.files)} />
                  <Upload className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                  {wmImageFile ? (
                    <p className="text-sm font-medium text-blue-600">{wmImageFile.name}</p>
                  ) : (
                    <p className="text-sm text-gray-600">Upload watermark image</p>
                  )}
                </div>
                <div>
                  <Label>Size: {imgSize}% of image width</Label>
                  <input type="range" min={10} max={80} value={imgSize} onChange={(e) => setImgSize(Number(e.target.value))}
                    className="w-full mt-1 accent-blue-600" />
                </div>
                <div>
                  <Label>Opacity: {imgOpacity}%</Label>
                  <input type="range" min={10} max={100} value={imgOpacity} onChange={(e) => setImgOpacity(Number(e.target.value))}
                    className="w-full mt-1 accent-blue-600" />
                </div>
              </div>
            )}

            {/* Position grid */}
            <div className="mt-4">
              <Label>Position</Label>
              <div className="mt-2 grid grid-cols-3 gap-1">
                {POSITIONS.map(pos => (
                  <button
                    key={pos}
                    onClick={() => activeTab === 'text' ? setPosition(pos) : setImgPosition(pos)}
                    className={`rounded p-2 text-xs transition-colors border ${
                      (activeTab === 'text' ? position : imgPosition) === pos
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50'
                    }`}
                  >
                    {pos.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={handleDownload} disabled={!baseFile || !previewDataUrl}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="mr-2 h-4 w-4" /> Download Watermarked Image
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Live Preview</h2>
            {previewDataUrl ? (
              <img src={previewDataUrl} alt="Watermarked preview" className="w-full rounded-lg border object-contain max-h-[500px]" />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <ImageIcon className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">Upload an image to see the preview</p>
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
          <li>• Use 40–60% opacity for a professional, non-intrusive watermark.</li>
          <li>• Tile mode repeats the watermark across the entire image — great for copyright protection.</li>
          <li>• White or semi-transparent text works well on most photo backgrounds.</li>
          <li>• Rotate at -45° for a diagonal watermark effect across the image.</li>
          <li>• Impact font is bold and highly visible — good for assertive branding.</li>
          <li>• For image watermarks, PNG with transparency works best to blend smoothly.</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4 text-lg">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Is my image uploaded to a server?', a: 'No. Everything runs entirely in your browser. Your images never leave your device.' },
            { q: 'What image formats are supported?', a: 'PNG, JPG, WebP, GIF, and most other common browser-supported image formats.' },
            { q: 'Can I add multiple watermarks?', a: 'Currently one watermark at a time is supported. For multiple, download and re-upload the result.' },
            { q: 'Will the watermark quality be preserved?', a: 'Yes — the output is rendered at the full original resolution on a canvas element.' },
            { q: 'Can I use a transparent PNG as a watermark?', a: 'Yes! PNG images with transparency blend naturally using the opacity control.' },
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
            { label: 'Image Compressor', href: '/image-compressor', icon: '🗜️' },
            { label: 'Image Resizer', href: '/image-resizer', icon: '📐' },
            { label: 'Photo Collage Maker', href: '/photo-collage-maker', icon: '🖼️' },
            { label: 'Blur Image', href: '/blur-image', icon: '🌫️' },
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
