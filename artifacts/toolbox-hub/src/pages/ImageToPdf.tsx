import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import {
  Upload, Download, Image as ImageIcon, Lightbulb, ThumbsUp, ThumbsDown,
  FileText, X, GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function imageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as string);
    reader.readAsDataURL(file);
  });
}

type PageSize = 'a4' | 'letter' | 'a3';
type Orientation = 'portrait' | 'landscape';
type FitMode = 'fit' | 'fill' | 'original';

const PAGE_SIZES: { label: string; value: PageSize }[] = [
  { label: 'A4', value: 'a4' },
  { label: 'Letter', value: 'letter' },
  { label: 'A3', value: 'a3' },
];

const ORIENTATIONS: { label: string; value: Orientation }[] = [
  { label: 'Portrait', value: 'portrait' },
  { label: 'Landscape', value: 'landscape' },
];

const FIT_MODES: { label: string; value: FitMode; desc: string }[] = [
  { label: 'Fit to Page', value: 'fit', desc: 'Maintain ratio' },
  { label: 'Fill Page', value: 'fill', desc: 'Stretch to fill' },
  { label: 'Original Size', value: 'original', desc: 'No scaling' },
];

const RELATED = [
  { label: 'JPG to PDF', href: '/jpg-to-pdf', emoji: '📷' },
  { label: 'PDF Merge', href: '/pdf-merge', emoji: '📎' },
  { label: 'Image Compressor', href: '/image-compressor', emoji: '🗜️' },
  { label: 'Image Converter', href: '/image-converter', emoji: '🔄' },
];

const FAQ = [
  { q: 'How many images can I add?', a: 'There is no hard limit. Each image becomes one page in the PDF. For large numbers, conversion may take a moment.' },
  { q: 'Can I reorder images?', a: 'Yes — drag images up or down using the grip handle on the left to set the page order.' },
  { q: 'What page sizes are supported?', a: 'A4 (most common), US Letter, and A3. You can set portrait or landscape orientation.' },
  { q: 'What does "Fit to Page" mean?', a: '"Fit to Page" scales the image to fill as much of the page as possible while keeping its aspect ratio. "Fill Page" may distort the image.' },
  { q: 'Is the PDF created on my device?', a: 'Yes — jsPDF runs entirely in your browser. Nothing is sent to a server.' },
  { q: 'What margin setting should I use?', a: 'For clean prints use 10–15mm. For borderless images (full bleed), set margin to 0.' },
];

interface ImageEntry {
  id: string;
  file: File;
  thumbUrl: string;
}

let _id = 0;
const uid = () => `img-${++_id}`;

export default function ImageToPdf() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [fitMode, setFitMode] = useState<FitMode>('fit');
  const [margin, setMargin] = useState(10);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() => {
    try { return localStorage.getItem('feedback_image-to-pdf') as 'up' | 'down' | null; } catch { return null; }
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Drag-to-reorder state
  const dragItemIdx = useRef<number | null>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newEntries: ImageEntry[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('image/')) continue;
      newEntries.push({ id: uid(), file: f, thumbUrl: URL.createObjectURL(f) });
    }
    if (newEntries.length === 0) {
      toast({ title: 'No images found', description: 'Please upload image files.', variant: 'destructive' });
      return;
    }
    setImages(prev => [...prev, ...newEntries]);
  }, [toast]);

  const removeImage = (id: string) => setImages(prev => prev.filter(i => i.id !== id));

  const handleDragStart = (idx: number) => { dragItemIdx.current = idx; };
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragItemIdx.current === null || dragItemIdx.current === idx) return;
    setImages(prev => {
      const arr = [...prev];
      const dragged = arr.splice(dragItemIdx.current!, 1)[0];
      arr.splice(idx, 0, dragged);
      dragItemIdx.current = idx;
      return arr;
    });
  };
  const handleDragEnd = () => { dragItemIdx.current = null; };

  const handleCreatePdf = useCallback(async () => {
    if (images.length === 0) { toast({ title: 'No images', description: 'Add at least one image.', variant: 'destructive' }); return; }
    setCreating(true);
    try {
      // Page dimensions in mm
      const pageDims: Record<PageSize, [number, number]> = {
        a4: [210, 297],
        letter: [215.9, 279.4],
        a3: [297, 420],
      };
      const [pw, ph] = orientation === 'portrait' ? pageDims[pageSize] : [pageDims[pageSize][1], pageDims[pageSize][0]];

      const pdf = new jsPDF({ orientation, unit: 'mm', format: pageSize });

      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage(pageSize, orientation);

        const dataUrl = await imageFileToDataUrl(images[i].file);

        // Get image natural dimensions via a temporary image element
        const imgEl = await new Promise<HTMLImageElement>((res, rej) => {
          const el = new Image();
          el.onload = () => res(el);
          el.onerror = rej;
          el.src = dataUrl;
        });

        const iw = imgEl.naturalWidth;
        const ih = imgEl.naturalHeight;
        // pixels per mm at 72 dpi: 72/25.4
        const pxPerMm = 72 / 25.4;
        const imgWmm = iw / pxPerMm;
        const imgHmm = ih / pxPerMm;

        const availW = pw - 2 * margin;
        const availH = ph - 2 * margin;

        let drawW: number, drawH: number, drawX: number, drawY: number;

        if (fitMode === 'original') {
          drawW = Math.min(imgWmm, availW);
          drawH = Math.min(imgHmm, availH);
          drawX = margin + (availW - drawW) / 2;
          drawY = margin + (availH - drawH) / 2;
        } else if (fitMode === 'fill') {
          drawW = availW;
          drawH = availH;
          drawX = margin;
          drawY = margin;
        } else {
          // fit — maintain aspect ratio
          const scale = Math.min(availW / imgWmm, availH / imgHmm);
          drawW = imgWmm * scale;
          drawH = imgHmm * scale;
          drawX = margin + (availW - drawW) / 2;
          drawY = margin + (availH - drawH) / 2;
        }

        const ext = images[i].file.type.includes('png') ? 'PNG' : images[i].file.type.includes('webp') ? 'WEBP' : 'JPEG';
        pdf.addImage(dataUrl, ext, drawX, drawY, drawW, drawH);
      }

      pdf.save('images.pdf');
      toast({ title: 'PDF created!', description: `${images.length} image(s) combined into images.pdf` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to create PDF.', variant: 'destructive' });
    }
    setCreating(false);
  }, [images, pageSize, orientation, fitMode, margin, toast]);

  const handleFeedback = (v: 'up' | 'down') => {
    setFeedback(v);
    try { localStorage.setItem('feedback_image-to-pdf', v); } catch {}
    toast({ title: v === 'up' ? '🎉 Thanks!' : '🙏 Thanks for the feedback!' });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-white/20 p-2"><FileText className="h-6 w-6" /></div>
          <h1 className="text-2xl sm:text-3xl font-bold">Image to PDF</h1>
        </div>
        <p className="text-blue-100 max-w-xl">Combine multiple images into a professional PDF — drag to reorder.</p>
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
              <p className="text-xs text-gray-400 mt-1">Each image becomes one PDF page</p>
            </div>

            {/* Page Size */}
            <div className="space-y-2">
              <Label>Page Size</Label>
              <div className="flex gap-2">
                {PAGE_SIZES.map((s) => (
                  <button key={s.value} onClick={() => setPageSize(s.value)}
                    className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${pageSize === s.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-700'}`}
                  >{s.label}</button>
                ))}
              </div>
            </div>

            {/* Orientation */}
            <div className="space-y-2">
              <Label>Orientation</Label>
              <div className="flex gap-2">
                {ORIENTATIONS.map((o) => (
                  <button key={o.value} onClick={() => setOrientation(o.value)}
                    className={`flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition-colors ${orientation === o.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-700'}`}
                  >{o.label}</button>
                ))}
              </div>
            </div>

            {/* Fit Mode */}
            <div className="space-y-2">
              <Label>Image Fit</Label>
              <div className="space-y-1">
                {FIT_MODES.map((f) => (
                  <button key={f.value} onClick={() => setFitMode(f.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${fitMode === f.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-700'}`}
                  >
                    <span className="font-medium">{f.label}</span>
                    <span className="ml-2 text-xs text-gray-400">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Margin */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Margin</Label>
                <span className="text-sm font-semibold text-blue-600">{margin} mm</span>
              </div>
              <input type="range" min={0} max={30} value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0 (borderless)</span><span>30mm</span>
              </div>
            </div>

            <Button onClick={handleCreatePdf} disabled={images.length === 0 || creating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {creating ? 'Creating PDF…' : <><Download className="mr-2 h-4 w-4" />Create PDF</>}
            </Button>
          </div>
        </div>

        {/* Image List Preview */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Pages ({images.length})</h2>
              {images.length > 0 && (
                <span className="text-xs text-gray-400">Drag <GripVertical className="inline h-3 w-3" /> to reorder</span>
              )}
            </div>

            {images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
                <p className="text-sm">Upload images to start building your PDF</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-2 bg-white hover:border-blue-200 transition-colors cursor-grab active:cursor-grabbing"
                  >
                    <div className="text-gray-300 cursor-grab flex-shrink-0">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 w-5 text-center flex-shrink-0">{idx + 1}</span>
                    <img src={img.thumbUrl} alt={img.file.name}
                      className="h-14 w-14 rounded object-cover border border-gray-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{img.file.name}</p>
                      <p className="text-xs text-gray-400">{formatBytes(img.file.size)}</p>
                    </div>
                    <button onClick={() => removeImage(img.id)} title="Remove"
                      className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 flex-shrink-0">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
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
          <li>• Use <strong>Fit to Page</strong> for photos — it preserves the original aspect ratio.</li>
          <li>• Set margin to <strong>0</strong> for borderless, full-bleed photo prints.</li>
          <li>• Use <strong>A4 Portrait</strong> for documents, <strong>Landscape</strong> for wide panoramas.</li>
          <li>• Compress images first to reduce the final PDF file size significantly.</li>
          <li>• Drag images by the grip handle ⠿ to set the exact page order before creating the PDF.</li>
          <li>• Use <strong>Letter</strong> size for US-standard printing, <strong>A4</strong> for everywhere else.</li>
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
