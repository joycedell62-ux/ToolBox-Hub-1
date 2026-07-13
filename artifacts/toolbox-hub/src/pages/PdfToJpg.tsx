import React, { useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import JSZip from 'jszip';
import {
  FileImage, Download, Loader2, X, Lightbulb, ThumbsUp, ThumbsDown,
  AlertTriangle, CheckCircle2, Star, Upload, ZoomIn,
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageResult {
  pageNum: number;
  dataUrl: string;
  blob: Blob;
}

type RatingVal = 'up' | 'down' | null;

interface FBState {
  rating: RatingVal;
  reports: { type: string; text: string; at: number }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const FB_KEY = 'tbh-pdf-to-jpg-feedback';

function loadFeedback(): FBState {
  try { return JSON.parse(localStorage.getItem(FB_KEY) || 'null') ?? { rating: null, reports: [] }; }
  catch { return { rating: null, reports: [] }; }
}

const RELATED = [
  { label: 'PDF Merge', href: '/pdf-merge', emoji: '📎' },
  { label: 'PDF Split', href: '/pdf-split', emoji: '✂️' },
  { label: 'Rotate PDF', href: '/rotate-pdf', emoji: '🔄' },
  { label: 'Image Compressor', href: '/image-compressor', emoji: '🗜️' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PdfToJpg() {
  const { toast } = useToast();

  // File
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings
  const [quality, setQuality] = useState(92);
  const [scale, setScale] = useState(2);
  const [pageMode, setPageMode] = useState<'all' | 'range'>('all');
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);

  // State
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pages, setPages] = useState<PageResult[]>([]);

  // Feedback
  const [feedback, setFeedback] = useState<FBState>(loadFeedback);
  const [fbForm, setFbForm] = useState(false);
  const [fbType, setFbType] = useState('Bug Report');
  const [fbText, setFbText] = useState('');

  // Preview modal
  const [previewPage, setPreviewPage] = useState<PageResult | null>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.name.endsWith('.pdf')) {
      toast({ title: 'Please upload a PDF file', variant: 'destructive' });
      return;
    }
    setFile(f);
    setPages([]);
    setProgress(0);
    setTotalPages(0);
  }, [toast]);

  const handleConvert = async () => {
    if (!file) return;
    setConverting(true);
    setPages([]);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const numPages = pdf.numPages;
      setTotalPages(numPages);

      const start = pageMode === 'range' ? Math.max(1, fromPage) : 1;
      const end = pageMode === 'range' ? Math.min(numPages, toPage) : numPages;

      const results: PageResult[] = [];

      for (let pageNum = start; pageNum <= end; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', quality / 100);
        });
        const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);

        const result: PageResult = { pageNum, dataUrl, blob };
        results.push(result);
        setPages(prev => [...prev, result]);
        setProgress(pageNum - start + 1);
      }

      toast({ title: `✅ Converted ${results.length} page(s) to JPG!` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Conversion failed', description: String(err), variant: 'destructive' });
    } finally {
      setConverting(false);
    }
  };

  const downloadAll = async () => {
    if (pages.length === 0) return;
    const zip = new JSZip();
    pages.forEach((p, i) => zip.file(`page-${p.pageNum}.jpg`, p.blob));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `${file?.name.replace('.pdf', '') ?? 'pdf'}-pages.zip`);
  };

  const setRating = (r: RatingVal) => {
    const next: FBState = { ...feedback, rating: r };
    setFeedback(next);
    localStorage.setItem(FB_KEY, JSON.stringify(next));
  };

  const submitFeedback = () => {
    if (!fbText.trim()) return;
    const rep = { type: fbType, text: fbText, at: Date.now() };
    const next: FBState = { ...feedback, reports: [rep, ...feedback.reports] };
    setFeedback(next);
    localStorage.setItem(FB_KEY, JSON.stringify(next));
    setFbText('');
    setFbForm(false);
    toast({ title: 'Thank you for your feedback!', duration: 2500 });
  };

  const convertedRange = pages.length > 0
    ? `${pages[0].pageNum}–${pages[pages.length - 1].pageNum}`
    : '';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 rounded-xl p-2">
            <FileImage className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">PDF to JPG</h1>
        </div>
        <p className="text-blue-100 max-w-xl">
          Convert PDF pages into high-quality JPG images — entirely in your browser.
          No uploads, no servers, fully private.
        </p>
      </div>

      {/* Main 2-column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload */}
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-800">Upload PDF</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                onChange={(e) => handleFiles(e.target.files)} />
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium text-gray-600">Drop PDF here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">PDF files only</p>
            </div>
            {file && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileImage className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                </div>
                <button onClick={() => { setFile(null); setPages([]); }} className="text-gray-400 hover:text-red-500 ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-5">
            <h2 className="font-bold text-gray-800">Settings</h2>

            <div>
              <Label className="mb-1 block">Quality: {quality}%</Label>
              <input type="range" min={60} max={100} value={quality}
                onChange={e => setQuality(Number(e.target.value))}
                className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>60% (smaller)</span><span>100% (best)</span>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Scale (resolution)</Label>
              <div className="flex gap-2">
                {[1, 1.5, 2].map(s => (
                  <button key={s} onClick={() => setScale(s)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${scale === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                    {s}×
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Page Range</Label>
              <div className="flex gap-2 mb-2">
                {(['all', 'range'] as const).map(m => (
                  <button key={m} onClick={() => setPageMode(m)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors capitalize ${pageMode === m ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                    {m === 'all' ? 'All Pages' : 'Custom Range'}
                  </button>
                ))}
              </div>
              {pageMode === 'range' && (
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Label className="text-xs">From</Label>
                    <Input type="number" min={1} value={fromPage} onChange={e => setFromPage(Number(e.target.value))} className="mt-1" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">To</Label>
                    <Input type="number" min={1} value={toPage} onChange={e => setToPage(Number(e.target.value))} className="mt-1" />
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleConvert} disabled={!file || converting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {converting ? <><Loader2 className="w-4 h-4 animate-spin" />Converting…</> : <><FileImage className="w-4 h-4" />Convert to JPG</>}
            </Button>

            {converting && totalPages > 0 && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{progress} / {totalPages} pages</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${(progress / totalPages) * 100}%` }} />
                </div>
              </div>
            )}

            {pages.length > 0 && (
              <Button onClick={downloadAll} variant="outline" className="w-full gap-2 border-blue-300 text-blue-600 hover:bg-blue-50">
                <Download className="w-4 h-4" />Download All as ZIP
              </Button>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-white shadow-sm p-6 min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">
                {pages.length > 0 ? `Converted Pages (${pages.length})` : 'Preview'}
              </h2>
              {pages.length > 0 && (
                <span className="text-xs text-gray-400">Pages {convertedRange}</span>
              )}
            </div>

            {pages.length === 0 && !converting && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                <FileImage className="w-16 h-16 mb-3" />
                <p className="text-sm">Converted pages will appear here</p>
              </div>
            )}

            {pages.length === 0 && converting && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Loader2 className="w-12 h-12 animate-spin mb-3 text-blue-400" />
                <p className="text-sm">Rendering pages…</p>
              </div>
            )}

            {pages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
                {pages.map((p) => (
                  <div key={p.pageNum} className="group relative border rounded-lg overflow-hidden bg-gray-50">
                    <img src={p.dataUrl} alt={`Page ${p.pageNum}`} className="w-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button onClick={() => setPreviewPage(p)}
                        className="bg-white text-gray-800 rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1 hover:bg-blue-50">
                        <ZoomIn className="w-3 h-3" />Preview
                      </button>
                      <button onClick={() => downloadBlob(p.blob, `page-${p.pageNum}.jpg`)}
                        className="bg-blue-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1 hover:bg-blue-700">
                        <Download className="w-3 h-3" />Download
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
                      Page {p.pageNum}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <section className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h2 className="font-bold text-gray-800">Pro Tips</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            '💡 Use 2× scale for crisp, high-resolution images suitable for printing.',
            '💡 Quality 92% is the sweet spot — great detail with manageable file sizes.',
            '💡 Convert specific page ranges to save time on large PDFs.',
            '💡 Download all pages as a ZIP to keep them organised together.',
            '💡 For web use, scale 1× and quality 80% keeps files small without visible loss.',
            '💡 All processing happens in your browser — your PDF never leaves your device.',
          ].map(tip => (
            <div key={tip} className="bg-white/70 rounded-xl px-4 py-3 text-sm text-gray-700 border border-blue-100">{tip}</div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-6 bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Is my PDF sent to a server?', a: 'No. Everything runs entirely in your browser using PDF.js. Your file never leaves your device.' },
            { q: 'What does the scale setting do?', a: 'Scale controls the rendering resolution. 2× produces images at twice the native PDF resolution, ideal for printing and high-quality use.' },
            { q: 'Can I convert just a few pages?', a: 'Yes — choose "Custom Range" and enter the start and end page numbers. Only those pages will be converted.' },
            { q: 'What quality should I choose?', a: '92% is the recommended default. Use 100% for archival quality or 60–80% for smaller web-optimised images.' },
            { q: 'How large can the PDF be?', a: 'Since processing is in-browser, very large PDFs may be slow. For PDFs over 50 pages, consider converting in batches using the range feature.' },
            { q: 'Can I convert password-protected PDFs?', a: 'Password-protected PDFs are not currently supported. Remove the password first using a PDF tool before uploading.' },
          ].map(({ q, a }) => (
            <div key={q} className="border rounded-xl p-4">
              <p className="font-semibold text-gray-800 text-sm mb-1">{q}</p>
              <p className="text-sm text-gray-600">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-6 bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="font-bold text-gray-800 mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {RELATED.map(t => (
            <Link key={t.label} href={t.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-blue-300 hover:bg-blue-50 transition-colors text-center group cursor-pointer">
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">{t.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Feedback */}
      <section className="mt-6 mb-4 bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="font-bold text-gray-800 mb-1">Was this tool helpful?</h2>
        <p className="text-sm text-gray-400 mb-4">Your feedback helps us improve ToolBox Hub.</p>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <button onClick={() => setRating('up')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-medium text-sm ${feedback.rating === 'up' ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50'}`}>
            <ThumbsUp className="w-4 h-4" /> Yes, it helped!
          </button>
          <button onClick={() => setRating('down')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-medium text-sm ${feedback.rating === 'down' ? 'bg-red-500 text-white border-red-500' : 'border-gray-200 text-gray-600 hover:border-red-200 hover:bg-red-50'}`}>
            <ThumbsDown className="w-4 h-4" /> Not really
          </button>
          <button onClick={() => setFbForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50 transition-all font-medium text-sm">
            <AlertTriangle className="w-4 h-4" /> Report an Issue
          </button>
        </div>
        {feedback.rating && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            {feedback.rating === 'up' ? 'Thanks! Glad it helped 🎉' : "We'll work to make it better. Thanks for letting us know."}
          </div>
        )}
        {fbForm && (
          <div className="bg-gray-50 border rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-sm text-gray-800">Submit Feedback</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Bug Report', 'Feature Request', 'Suggestion'].map(t => (
                <button key={t} onClick={() => setFbType(t)}
                  className={`py-1.5 rounded-lg border text-xs font-medium transition-colors ${fbType === t ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                  {t}
                </button>
              ))}
            </div>
            <textarea rows={3} placeholder={`Describe your ${fbType.toLowerCase()}…`} value={fbText}
              onChange={e => setFbText(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <div className="flex gap-2">
              <Button size="sm" onClick={submitFeedback} disabled={!fbText.trim()} className="gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />Submit
              </Button>
              <Button size="sm" variant="outline" onClick={() => setFbForm(false)}>Cancel</Button>
            </div>
          </div>
        )}
        {feedback.reports.length > 0 && (
          <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            {feedback.reports.length} report{feedback.reports.length !== 1 ? 's' : ''} submitted — thank you!
          </div>
        )}
      </section>

      {/* Preview Modal */}
      {previewPage && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreviewPage(null)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewPage(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300">
              <X className="w-6 h-6" />
            </button>
            <img src={previewPage.dataUrl} alt={`Page ${previewPage.pageNum}`} className="w-full rounded-xl shadow-2xl" />
            <div className="text-center mt-3">
              <Button size="sm" onClick={() => downloadBlob(previewPage.blob, `page-${previewPage.pageNum}.jpg`)}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Download className="w-4 h-4" />Download Page {previewPage.pageNum}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
