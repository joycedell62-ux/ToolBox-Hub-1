import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import {
  FileText, Upload, Download, Lightbulb, ThumbsUp, ThumbsDown,
  Scissors, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

// ─── Types ───────────────────────────────────────────────────────────────────

type Mode = 'range' | 'split';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const FB_KEY = 'tbh-pdf-split-feedback';

const RELATED = [
  { label: 'PDF Merge', href: '/pdf-merge', emoji: '🔗' },
  { label: 'Rotate PDF', href: '/rotate-pdf', emoji: '🔄' },
  { label: 'PDF to JPG', href: '/pdf-to-jpg', emoji: '🖼️' },
  { label: 'PDF Compressor', href: '/pdf-compressor', emoji: '📦' },
];

const FAQS = [
  { q: 'Does this upload my PDF to a server?', a: 'No. Everything runs entirely in your browser using pdf-lib and JSZip. Your files never leave your device.' },
  { q: 'What is "Extract Page Range"?', a: 'It lets you pick a start and end page number and download just those pages as a new PDF.' },
  { q: 'What is "Split Every N Pages"?', a: 'It divides your PDF into multiple smaller PDFs, each containing N pages, and bundles them into a ZIP file for download.' },
  { q: 'Can I select non-contiguous pages?', a: 'The checkbox list updates the From/To range to cover your selection. For non-contiguous pages, use the Extract Range mode and merge the results.' },
  { q: 'What happens if I enter a page number larger than the PDF?', a: 'The tool automatically clamps the range to the valid page count so you always get a valid output.' },
  { q: 'Will the split PDFs keep the original formatting?', a: 'Yes — text, images, and layout are fully preserved in each split output.' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PdfSplit() {
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<Mode>('range');
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  const [splitN, setSplitN] = useState(1);
  const [checkedPages, setCheckedPages] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() => {
    try { return localStorage.getItem(FB_KEY) as 'up' | 'down' | null; } catch { return null; }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || !fileList[0]) return;
    const f = fileList[0];
    if (!f.name.endsWith('.pdf') && f.type !== 'application/pdf') {
      toast({ title: 'Invalid file', description: 'Please select a .pdf file.', variant: 'destructive' }); return;
    }
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();
      setFile(f);
      setPageCount(count);
      setFromPage(1);
      setToPage(count);
      setCheckedPages(new Set());
      toast({ title: `PDF loaded`, description: `${f.name} — ${count} pages, ${fmtSize(f.size)}` });
    } catch {
      toast({ title: 'Error reading PDF', description: 'File may be password-protected or corrupted.', variant: 'destructive' });
    }
  }, [toast]);

  const togglePage = (p: number) => {
    setCheckedPages(prev => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      if (next.size > 0) {
        const sorted = [...next].sort((a, b) => a - b);
        setFromPage(sorted[0]);
        setToPage(sorted[sorted.length - 1]);
      }
      return next;
    });
  };

  const clamp = (v: number) => Math.max(1, Math.min(v, pageCount));

  const handleExtract = async () => {
    if (!file) return;
    const from = clamp(fromPage) - 1; // 0-indexed
    const to = clamp(toPage) - 1;
    if (from > to) { toast({ title: 'Invalid range', description: '"From" must be ≤ "To".', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const out = await PDFDocument.create();
      const indices = Array.from({ length: to - from + 1 }, (_, i) => from + i);
      const pages = await out.copyPages(src, indices);
      pages.forEach(p => out.addPage(p));
      const outBytes = await out.save();
      downloadBlob(new Blob([outBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }), `pages-${fromPage}-${toPage}.pdf`);
      toast({ title: 'Extracted!', description: `Downloaded pages ${fromPage}–${toPage}` });
    } catch {
      toast({ title: 'Extraction failed', description: 'Could not extract pages.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSplitZip = async () => {
    if (!file) return;
    const n = Math.max(1, splitN);
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const total = src.getPageCount();
      const zip = new JSZip();
      let part = 1;
      for (let start = 0; start < total; start += n) {
        const end = Math.min(start + n - 1, total - 1);
        const out = await PDFDocument.create();
        const indices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        const pages = await out.copyPages(src, indices);
        pages.forEach(p => out.addPage(p));
        const partBytes = await out.save();
        zip.file(`part-${String(part).padStart(3, '0')}.pdf`, partBytes);
        part++;
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, 'split-pdfs.zip');
      toast({ title: 'Split complete!', description: `Downloaded ${part - 1} PDF parts as ZIP` });
    } catch {
      toast({ title: 'Split failed', description: 'Could not split PDF.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const giveFeedback = (v: 'up' | 'down') => {
    setFeedback(v);
    try { localStorage.setItem(FB_KEY, v); } catch {}
    toast({ title: v === 'up' ? 'Thanks for the feedback! 🎉' : 'Thanks! We\'ll keep improving.' });
  };

  const selectedRange = pageCount > 0 ? `Pages ${clamp(fromPage)}–${clamp(toPage)} (${clamp(toPage) - clamp(fromPage) + 1} page${clamp(toPage) - clamp(fromPage) + 1 !== 1 ? 's' : ''})` : '';

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl p-8 text-white mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Scissors className="w-8 h-8 text-blue-100" />
          <h1 className="text-2xl sm:text-3xl font-bold">PDF Split</h1>
        </div>
        <p className="text-blue-100 text-lg">Extract pages or split a PDF into multiple files — no upload to servers.</p>
      </div>

      {/* Main grid */}
      <div className="lg:grid lg:grid-cols-5 gap-6 space-y-6 lg:space-y-0">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drop zone */}
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Upload className="w-4 h-4 text-blue-600" /> Upload PDF</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <FileText className="w-10 h-10 mx-auto text-gray-400 mb-3" />
              <p className="font-medium text-gray-700">Drop a PDF here or <span className="text-blue-600">click to browse</span></p>
              <p className="text-sm text-gray-500 mt-1">Single .pdf file</p>
            </div>
            {file && (
              <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate"><strong>{file.name}</strong> — {pageCount} pages, {fmtSize(file.size)}</span>
              </div>
            )}
          </div>

          {/* Mode selector */}
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Split Mode</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('range')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${mode === 'range' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-300'}`}
              >
                Extract Range
              </button>
              <button
                onClick={() => setMode('split')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${mode === 'split' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-300'}`}
              >
                Split Every N Pages
              </button>
            </div>

            {mode === 'range' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">From page</Label>
                    <Input
                      type="number" min={1} max={pageCount || 1}
                      value={fromPage}
                      onChange={e => setFromPage(Number(e.target.value))}
                      disabled={!file}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">To page</Label>
                    <Input
                      type="number" min={1} max={pageCount || 1}
                      value={toPage}
                      onChange={e => setToPage(Number(e.target.value))}
                      disabled={!file}
                    />
                  </div>
                </div>
                {file && <p className="text-xs text-gray-500">Valid range: 1 – {pageCount}</p>}
                <Button
                  onClick={handleExtract}
                  disabled={!file || loading}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${!file || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Extracting…' : <><Download className="w-4 h-4 mr-2" />Extract Pages</>}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Pages per part</Label>
                  <Input
                    type="number" min={1} max={pageCount || 999}
                    value={splitN}
                    onChange={e => setSplitN(Number(e.target.value))}
                    disabled={!file}
                  />
                </div>
                {file && (
                  <p className="text-xs text-gray-500">
                    Will create {Math.ceil(pageCount / Math.max(1, splitN))} part(s) — downloaded as ZIP
                  </p>
                )}
                <Button
                  onClick={handleSplitZip}
                  disabled={!file || loading}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${!file || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Splitting…' : <><Download className="w-4 h-4 mr-2" />Split & Download ZIP</>}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl border bg-white shadow-sm p-6 min-h-[300px]">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" /> Page Preview</h2>
            {!file ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Scissors className="w-12 h-12 mb-3 opacity-40" />
                <p>Upload a PDF to see its pages here</p>
                <p className="text-sm mt-1">Select pages using checkboxes</p>
              </div>
            ) : (
              <>
                {mode === 'range' && selectedRange && (
                  <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Output: <strong>{selectedRange}</strong>
                  </div>
                )}
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6 gap-2 max-h-80 overflow-y-auto pr-1">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => {
                    const inRange = mode === 'range'
                      ? p >= clamp(fromPage) && p <= clamp(toPage)
                      : Math.floor((p - 1) / Math.max(1, splitN)) < Math.ceil(pageCount / Math.max(1, splitN));
                    const checked = checkedPages.has(p);
                    return (
                      <button
                        key={p}
                        onClick={() => togglePage(p)}
                        className={`relative rounded-lg border-2 p-2 text-center text-xs font-medium transition-colors ${
                          checked ? 'border-blue-500 bg-blue-100 text-blue-800' :
                          inRange ? 'border-blue-300 bg-blue-50 text-blue-700' :
                          'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                        }`}
                        title={`Page ${p}`}
                      >
                        <FileText className="w-4 h-4 mx-auto mb-1 opacity-60" />
                        {p}
                        {checked && (
                          <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white text-[6px]">✓</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  {mode === 'range'
                    ? `Highlighted pages will be included in the extracted PDF`
                    : `Each group of ${Math.max(1, splitN)} page(s) will become a separate PDF`}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-blue-800 flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Pro Tips</h2>
        <ul className="space-y-2 text-sm text-blue-900">
          <li>💡 Use <strong>Extract Range</strong> to pull specific chapters or sections from a large PDF.</li>
          <li>💡 <strong>Split Every N Pages</strong> is perfect for creating individual page PDFs or equal-sized chunks.</li>
          <li>💡 Click page boxes in the preview to <strong>select them</strong> — this updates the From/To range automatically.</li>
          <li>💡 Split ZIP output files are named <strong>part-001.pdf, part-002.pdf</strong>, etc. for easy sorting.</li>
          <li>💡 All processing is <strong>client-side</strong> — no data ever leaves your browser.</li>
          <li>💡 To extract non-consecutive pages, extract each range separately and then merge them.</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 text-lg">Frequently Asked Questions</h2>
        {FAQS.map((faq, i) => (
          <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
            <p className="font-medium text-gray-800 mb-1">{faq.q}</p>
            <p className="text-sm text-gray-600">{faq.a}</p>
          </div>
        ))}
      </div>

      {/* Related Tools */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {RELATED.map(r => (
            <Link key={r.href} href={r.href} className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 p-4 text-center transition-colors">
              <span className="text-2xl">{r.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{r.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div className="rounded-xl border bg-white shadow-sm p-6 text-center">
        <p className="font-medium text-gray-700 mb-3">Was this tool helpful?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => giveFeedback('up')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg border transition-colors ${feedback === 'up' ? 'bg-green-50 border-green-400 text-green-700' : 'border-gray-300 hover:border-green-400 hover:bg-green-50 text-gray-600'}`}
          >
            <ThumbsUp className="w-4 h-4" /> Yes
          </button>
          <button
            onClick={() => giveFeedback('down')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg border transition-colors ${feedback === 'down' ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-300 hover:border-red-400 hover:bg-red-50 text-gray-600'}`}
          >
            <ThumbsDown className="w-4 h-4" /> No
          </button>
        </div>
        {feedback && <p className="text-sm text-gray-500 mt-3">{feedback === 'up' ? 'Thanks for the positive feedback! 🎉' : 'Thanks! We\'ll keep working to improve.'}</p>}
      </div>
    </>
  );
}
