import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import {
  FileText, Upload, Download, Lightbulb, ThumbsUp, ThumbsDown,
  RotateCw, CheckCircle2, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument, degrees } from 'pdf-lib';

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

function parsePageList(input: string, max: number): number[] {
  const result: number[] = [];
  const parts = input.split(',');
  for (const part of parts) {
    const n = parseInt(part.trim(), 10);
    if (!isNaN(n) && n >= 1 && n <= max) result.push(n - 1); // convert to 0-indexed
  }
  return [...new Set(result)];
}

const FB_KEY = 'tbh-rotate-pdf-feedback';

const RELATED = [
  { label: 'PDF Merge', href: '/pdf-merge', emoji: '🔗' },
  { label: 'PDF Split', href: '/pdf-split', emoji: '✂️' },
  { label: 'PDF Compressor', href: '/pdf-compressor', emoji: '📦' },
  { label: 'Unlock PDF', href: '/unlock-pdf', emoji: '🔓' },
];

const FAQS = [
  { q: 'Does this upload my PDF anywhere?', a: 'No. All rotation is performed locally in your browser using pdf-lib. Your file never leaves your device.' },
  { q: 'What does "clockwise" mean for rotation?', a: '90° clockwise turns a portrait page into landscape (rotated right). 180° flips it upside-down. 270° clockwise is equivalent to 90° counter-clockwise.' },
  { q: 'Can I rotate just one page?', a: 'Yes — uncheck "All pages" and enter the specific page numbers separated by commas, e.g. "1, 3, 5".' },
  { q: 'Will rotation affect text selection and copy-paste?', a: 'Yes — the rotation is applied to the actual PDF page metadata, so text and content rotate correctly and remain selectable.' },
  { q: 'Can I rotate password-protected PDFs?', a: 'Password-protected PDFs cannot be loaded without the password. Unlock them first, then apply rotation.' },
  { q: 'Is there a limit on file size or page count?', a: 'There is no enforced limit — but very large PDFs may take a moment to process. The output quality is identical to the input.' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function RotatePdf() {
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [allPages, setAllPages] = useState(true);
  const [pageInput, setPageInput] = useState('');
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
      setFile(f);
      setPageCount(doc.getPageCount());
      setPageInput('');
      toast({ title: 'PDF loaded', description: `${f.name} — ${doc.getPageCount()} pages, ${fmtSize(f.size)}` });
    } catch {
      toast({ title: 'Error reading PDF', description: 'File may be password-protected or corrupted.', variant: 'destructive' });
    }
  }, [toast]);

  const applyRotation = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const total = doc.getPageCount();
      let targetIndices: number[];
      if (allPages) {
        targetIndices = Array.from({ length: total }, (_, i) => i);
      } else {
        targetIndices = parsePageList(pageInput, total);
        if (targetIndices.length === 0) {
          toast({ title: 'No valid pages', description: 'Enter valid page numbers separated by commas.', variant: 'destructive' });
          setLoading(false);
          return;
        }
      }
      for (const idx of targetIndices) {
        const page = doc.getPage(idx);
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + rotation) % 360));
      }
      const outBytes = await doc.save();
      const baseName = file.name.replace(/\.pdf$/i, '');
      downloadBlob(new Blob([outBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }), `${baseName}-rotated.pdf`);
      toast({ title: 'Rotation applied!', description: `Rotated ${targetIndices.length} page(s) by ${rotation}°` });
    } catch {
      toast({ title: 'Rotation failed', description: 'Could not process the PDF.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const affectedPages = !file ? '—' : allPages
    ? `All ${pageCount} pages`
    : pageInput.trim()
      ? `Pages: ${pageInput}`
      : 'None selected';

  const giveFeedback = (v: 'up' | 'down') => {
    setFeedback(v);
    try { localStorage.setItem(FB_KEY, v); } catch {}
    toast({ title: v === 'up' ? 'Thanks for the feedback! 🎉' : 'Thanks! We\'ll keep improving.' });
  };

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl p-8 text-white mb-6">
        <div className="flex items-center gap-3 mb-2">
          <RotateCw className="w-8 h-8 text-blue-100" />
          <h1 className="text-2xl sm:text-3xl font-bold">Rotate PDF</h1>
        </div>
        <p className="text-blue-100 text-lg">Rotate selected pages or all pages of your PDF — 90°, 180°, or 270°.</p>
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
                <span className="truncate"><strong>{file.name}</strong> — {pageCount} pages</span>
              </div>
            )}
          </div>

          {/* Rotation controls */}
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-gray-800">Rotation Angle (clockwise)</h2>
            <div className="flex gap-2">
              {([90, 180, 270] as const).map(deg => (
                <button
                  key={deg}
                  onClick={() => setRotation(deg)}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition-colors flex flex-col items-center gap-1 ${rotation === deg ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}
                >
                  <RotateCw className={`w-5 h-5 ${deg === 180 ? 'rotate-90' : deg === 270 ? 'rotate-180' : ''}`} />
                  {deg}°
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allPages}
                  onChange={e => setAllPages(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="font-medium text-gray-700">Apply to all pages</span>
              </Label>

              {!allPages && (
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Page numbers (comma-separated)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. 1,3,5"
                    value={pageInput}
                    onChange={e => setPageInput(e.target.value)}
                    disabled={!file}
                  />
                  {file && <p className="text-xs text-gray-500 mt-1">Valid range: 1 – {pageCount}</p>}
                </div>
              )}
            </div>

            <Button
              onClick={applyRotation}
              disabled={!file || loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${!file || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Rotating…' : <><Download className="w-4 h-4 mr-2" />Apply & Download</>}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl border bg-white shadow-sm p-6 min-h-[300px]">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Info className="w-4 h-4 text-blue-600" /> Rotation Summary</h2>
            {!file ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <RotateCw className="w-12 h-12 mb-3 opacity-40" />
                <p>Upload a PDF to see rotation details here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Info card */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-sm text-gray-500">File name</span>
                    <span className="text-sm font-medium text-gray-800 truncate max-w-[180px]">{file.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-sm text-gray-500">File size</span>
                    <span className="text-sm font-medium text-gray-800">{fmtSize(file.size)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-sm text-gray-500">Total pages</span>
                    <span className="text-sm font-medium text-gray-800">{pageCount}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-sm text-gray-500">Rotation</span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-700">
                      <RotateCw className="w-4 h-4" /> {rotation}° clockwise
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-500">Affected pages</span>
                    <span className="text-sm font-medium text-gray-800 text-right max-w-[200px] break-words">{affectedPages}</span>
                  </div>
                </div>

                {/* Visual rotation indicator */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 rounded border-2 border-gray-400 bg-white flex items-center justify-center text-xs text-gray-500">A</div>
                    <span className="text-gray-400">→</span>
                    <div
                      className="w-10 h-14 rounded border-2 border-blue-500 bg-blue-50 flex items-center justify-center text-xs text-blue-700 font-bold transition-transform"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >A</div>
                  </div>
                  <p className="text-sm text-blue-700 flex-1">
                    Pages will be rotated <strong>{rotation}°</strong> clockwise when downloaded.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-blue-800 flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Pro Tips</h2>
        <ul className="space-y-2 text-sm text-blue-900">
          <li>💡 Use <strong>90°</strong> to switch a page between portrait and landscape orientation.</li>
          <li>💡 <strong>Uncheck "All pages"</strong> to enter specific page numbers like <code>1,3,5</code>.</li>
          <li>💡 Rotation is <strong>additive</strong> — if a page is already rotated 90°, adding another 90° gives 180°.</li>
          <li>💡 The output file is saved as <strong>[original-name]-rotated.pdf</strong>.</li>
          <li>💡 All processing happens <strong>in your browser</strong> — your file is never uploaded anywhere.</li>
          <li>💡 To undo a rotation, rotate by the complementary angle (e.g., rotate 270° to undo a 90° rotation).</li>
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
