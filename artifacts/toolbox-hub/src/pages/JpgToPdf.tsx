import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import {
  Image, Upload, Download, Lightbulb, ThumbsUp, ThumbsDown,
  ArrowRight, X, GripVertical, FileImage,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

type PageSize = 'a4' | 'letter' | 'a3';
type Orientation = 'portrait' | 'landscape';

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

let _idCounter = 0;
const uid = () => `img-${++_idCounter}`;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function JpgToPdf() {
  const [dragOver, setDragOver] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [margin, setMargin] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() => {
    try { return localStorage.getItem('feedback_jpg-to-pdf') as 'up' | 'down' | null; } catch { return null; }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: ImageItem[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid file', description: `${file.name} is not an image.`, variant: 'destructive' });
        continue;
      }
      const preview = await readFileAsDataUrl(file);
      newItems.push({ id: uid(), file, preview });
    }
    setImages(prev => [...prev, ...newItems]);
  }, [toast]);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // Drag-to-reorder
  const handleDragStart = (id: string) => setDragItemId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!dragItemId || dragItemId === id) return;
    setImages(prev => {
      const from = prev.findIndex(i => i.id === dragItemId);
      const to = prev.findIndex(i => i.id === id);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };
  const handleDragEnd = () => setDragItemId(null);

  const handleCreate = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    try {
      const fmt = pageSize === 'a3' ? 'a3' : pageSize === 'letter' ? 'letter' : 'a4';
      const doc = new jsPDF({ orientation, unit: 'mm', format: fmt });
      const marginMm = margin;

      for (let i = 0; i < images.length; i++) {
        if (i > 0) doc.addPage(fmt, orientation);
        const imgData = images[i].preview;
        const htmlImg = await loadImage(imgData);
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const maxW = pageW - 2 * marginMm;
        const maxH = pageH - 2 * marginMm;
        const ratio = Math.min(maxW / htmlImg.width, maxH / htmlImg.height);
        const w = htmlImg.width * ratio;
        const h = htmlImg.height * ratio;
        const x = marginMm + (maxW - w) / 2;
        const y = marginMm + (maxH - h) / 2;
        // Determine format hint
        const mimeType = images[i].file.type;
        const fmt2 = mimeType === 'image/png' ? 'PNG' : mimeType === 'image/webp' ? 'WEBP' : 'JPEG';
        doc.addImage(imgData, fmt2, x, y, w, h);
      }

      const pdfBlob = doc.output('blob');
      downloadBlob(pdfBlob, 'images.pdf');
      toast({ title: 'PDF created!', description: `${images.length} image(s) combined into a PDF.` });
    } catch (err) {
      toast({ title: 'Failed to create PDF', description: String(err), variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleFeedback = (val: 'up' | 'down') => {
    setFeedback(val);
    try { localStorage.setItem('feedback_jpg-to-pdf', val); } catch {}
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-8 text-white flex items-center gap-4">
        <div className="bg-white/20 rounded-xl p-3">
          <FileImage className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">JPG to PDF</h1>
          <p className="text-blue-100 mt-1">Combine one or more images into a single PDF — drag to reorder.</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload */}
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Upload Images</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}`}
            >
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">Drop images here or click to browse</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP, GIF, BMP supported</p>
            </div>
          </div>

          {/* Settings */}
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 text-lg">PDF Settings</h2>

            {/* Page size */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Page Size</Label>
              <div className="flex gap-2">
                {(['a4', 'letter', 'a3'] as PageSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setPageSize(s)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${pageSize === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-700'}`}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Orientation */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Orientation</Label>
              <div className="flex gap-2">
                {(['portrait', 'landscape'] as Orientation[]).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrientation(o)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${orientation === o ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-700'}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Margin */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm font-medium">Margin</Label>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{margin} mm</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0 mm</span>
                <span>40 mm</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleCreate}
            disabled={images.length === 0 || processing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            {processing ? 'Creating PDF…' : `Create PDF (${images.length} image${images.length !== 1 ? 's' : ''})`}
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl border bg-white shadow-sm p-6 min-h-[320px] flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-lg">Images ({images.length})</h2>
              {images.length > 0 && (
                <button onClick={() => setImages([])} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear all</button>
              )}
            </div>

            {images.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-12">
                <Image className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Upload images to see them here</p>
                <p className="text-xs mt-1">Drag to reorder before creating PDF</p>
              </div>
            )}

            {images.length > 0 && (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => handleDragStart(img.id)}
                    onDragOver={(e) => handleDragOver(e, img.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 rounded-lg border p-2 bg-white transition-all cursor-grab active:cursor-grabbing ${dragItemId === img.id ? 'opacity-50 border-blue-400' : 'hover:border-blue-200'}`}
                  >
                    <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-400 font-bold w-5 text-center">{idx + 1}</span>
                    <img
                      src={img.preview}
                      alt={img.file.name}
                      className="w-14 h-14 object-cover rounded-md border flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{img.file.name}</p>
                      <p className="text-xs text-gray-500">{(img.file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-2 border-t">
                {images.slice(0, 8).map((img) => (
                  <div key={img.id} className="aspect-square rounded-lg overflow-hidden border bg-gray-50">
                    <img src={img.preview} alt={img.file.name} className="w-full h-full object-cover" />
                  </div>
                ))}
                {images.length > 8 && (
                  <div className="aspect-square rounded-lg border bg-gray-50 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-500">+{images.length - 8}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Pro Tips</h3>
        </div>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Drag the handle icon (⠿) on any image row to reorder pages before creating the PDF.</li>
          <li>• Use the A4 format for standard documents and Letter for US letter-size printing.</li>
          <li>• Set margin to 0 for full-bleed images that fill the entire page.</li>
          <li>• PNG images preserve transparency; JPEG images are smaller but use lossy compression.</li>
          <li>• You can add more images after uploading — they'll be appended to the end of the list.</li>
          <li>• For best results, use images with similar aspect ratios when creating multi-page PDFs.</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 text-lg">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            { q: 'Which image formats are supported?', a: 'JPG, PNG, WEBP, GIF, and BMP are all supported. Each image becomes a separate page in the PDF.' },
            { q: 'Is there a limit to how many images I can add?', a: 'There is no hard limit, but very large numbers of high-resolution images may slow down your browser. We recommend batches of 50 or fewer.' },
            { q: 'Will my images be uploaded to a server?', a: 'No. All processing happens entirely in your browser using jsPDF. Your images never leave your device.' },
            { q: 'How do I change the page order?', a: 'Simply drag any image row up or down using the grip handle on the left side of each row.' },
            { q: 'Can I mix portrait and landscape images?', a: 'Yes. Each image is automatically scaled to fit within its page while maintaining its original aspect ratio.' },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-lg border p-4">
              <p className="font-medium text-gray-900 text-sm">{q}</p>
              <p className="text-sm text-gray-600 mt-1">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 text-lg">Related Tools</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { to: '/pdf-merge', label: 'PDF Merge', desc: 'Combine multiple PDFs into one' },
            { to: '/image-to-pdf', label: 'Image to PDF', desc: 'Convert any image to PDF' },
            { to: '/pdf-compressor', label: 'PDF Compressor', desc: 'Reduce PDF file size' },
            { to: '/image-compressor', label: 'Image Compressor', desc: 'Compress images before converting' },
          ].map(({ to, label, desc }) => (
            <Link key={to} href={to}>
              <div className="rounded-lg border p-4 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm group-hover:text-blue-700">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div className="rounded-xl border bg-white shadow-sm p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <p className="font-medium text-gray-700">Was this tool helpful?</p>
        <div className="flex gap-3">
          <Button
            variant={feedback === 'up' ? 'default' : 'outline'}
            onClick={() => handleFeedback('up')}
            className={feedback === 'up' ? 'bg-blue-600 text-white' : ''}
          >
            <ThumbsUp className="w-4 h-4 mr-1" /> Yes
          </Button>
          <Button
            variant={feedback === 'down' ? 'default' : 'outline'}
            onClick={() => handleFeedback('down')}
            className={feedback === 'down' ? 'bg-blue-600 text-white' : ''}
          >
            <ThumbsDown className="w-4 h-4 mr-1" /> No
          </Button>
        </div>
        {feedback && <p className="text-sm text-green-600 font-medium">Thanks for your feedback!</p>}
      </div>
    </div>
  );
}
