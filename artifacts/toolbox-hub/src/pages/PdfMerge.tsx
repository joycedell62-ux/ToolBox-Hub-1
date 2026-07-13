import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import {
  FileText, Upload, Trash2, Download, Lightbulb, ThumbsUp, ThumbsDown,
  GripVertical, Layers, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PdfFile {
  id: string;
  file: File;
  name: string;
  pageCount: number;
  sizeBytes: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _uid = 0;
const uid = () => `pdf-${++_uid}`;

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const FB_KEY = 'tbh-pdf-merge-feedback';

const RELATED = [
  { label: 'PDF Split', href: '/pdf-split', emoji: '✂️' },
  { label: 'Rotate PDF', href: '/rotate-pdf', emoji: '🔄' },
  { label: 'JPG to PDF', href: '/jpg-to-pdf', emoji: '🖼️' },
  { label: 'Image to PDF', href: '/image-to-pdf', emoji: '📷' },
];

const FAQS = [
  { q: 'Is there a limit on how many PDFs I can merge?', a: 'There is no hard limit — you can merge as many PDFs as your browser can handle in memory. For very large files, merging may take a few seconds.' },
  { q: 'Are my files uploaded to any server?', a: 'No. All processing happens entirely in your browser using pdf-lib. Your files never leave your device.' },
  { q: 'Will the merged PDF preserve bookmarks and links?', a: 'Page content, images, and text are preserved. Complex interactive features like form fields or bookmarks may not fully transfer across all PDF types.' },
  { q: 'Can I merge password-protected PDFs?', a: 'Password-protected PDFs cannot be opened without the password. Remove the password protection first using an unlock tool, then merge.' },
  { q: 'What order will the pages appear in?', a: 'Pages appear in the exact order of your file list. Drag the grip handle to reorder files before merging.' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PdfMerge() {
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() => {
    try { return localStorage.getItem(FB_KEY) as 'up' | 'down' | null; } catch { return null; }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOver2 = useRef<number | null>(null);

  const loadPdf = async (file: File): Promise<PdfFile> => {
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    return { id: uid(), file, name: file.name, pageCount: doc.getPageCount(), sizeBytes: file.size };
  };

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return;
    const pdfs = Array.from(fileList).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (!pdfs.length) { toast({ title: 'No valid PDFs', description: 'Please select .pdf files only.', variant: 'destructive' }); return; }
    try {
      const loaded = await Promise.all(pdfs.map(loadPdf));
      setFiles(prev => [...prev, ...loaded]);
      toast({ title: `${loaded.length} file(s) added`, description: `${loaded.reduce((s, f) => s + f.pageCount, 0)} pages total` });
    } catch {
      toast({ title: 'Error reading PDF', description: 'One or more files could not be read.', variant: 'destructive' });
    }
  }, [toast]);

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  // Drag-to-reorder
  const onDragStart = (i: number) => { dragItem.current = i; };
  const onDragEnter = (i: number) => { dragOver2.current = i; };
  const onDragEnd = () => {
    if (dragItem.current === null || dragOver2.current === null) return;
    const copy = [...files];
    const [moved] = copy.splice(dragItem.current, 1);
    copy.splice(dragOver2.current, 0, moved);
    setFiles(copy);
    dragItem.current = null;
    dragOver2.current = null;
  };

  const merge = async () => {
    if (files.length < 2) { toast({ title: 'Add at least 2 PDFs', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const merged = await PDFDocument.create();
      for (const pf of files) {
        const bytes = await pf.file.arrayBuffer();
        const src = await PDFDocument.load(bytes);
        const copied = await merged.copyPages(src, src.getPageIndices());
        copied.forEach(p => merged.addPage(p));
      }
      const outBytes = await merged.save();
      const blob = new Blob([outBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      downloadBlob(blob, 'merged.pdf');
      toast({ title: 'Merge complete!', description: `Downloaded merged.pdf (${merged.getPageCount()} pages)` });
    } catch {
      toast({ title: 'Merge failed', description: 'Could not merge PDFs. Ensure files are not password-protected.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const totalPages = files.reduce((s, f) => s + f.pageCount, 0);
  const totalSize = files.reduce((s, f) => s + f.sizeBytes, 0);

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
          <Layers className="w-8 h-8 text-blue-100" />
          <h1 className="text-2xl sm:text-3xl font-bold">PDF Merge</h1>
        </div>
        <p className="text-blue-100 text-lg">Combine multiple PDF files into one — drag, reorder, and download.</p>
      </div>

      {/* Main grid */}
      <div className="lg:grid lg:grid-cols-5 gap-6 space-y-6 lg:space-y-0">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drop zone */}
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Upload className="w-4 h-4 text-blue-600" /> Upload PDFs</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <FileText className="w-10 h-10 mx-auto text-gray-400 mb-3" />
              <p className="font-medium text-gray-700">Drop PDFs here or <span className="text-blue-600">click to browse</span></p>
              <p className="text-sm text-gray-500 mt-1">Multiple .pdf files supported</p>
            </div>
          </div>

          {/* Stats */}
          {files.length > 0 && (
            <div className="rounded-xl border bg-white shadow-sm p-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Files: <strong className="text-gray-900">{files.length}</strong></span>
                <span>Total pages: <strong className="text-gray-900">{totalPages}</strong></span>
              </div>
              <div className="text-sm text-gray-600">Total size: <strong className="text-gray-900">{fmtSize(totalSize)}</strong></div>
            </div>
          )}

          {/* Merge button */}
          <Button
            onClick={merge}
            disabled={files.length < 2 || loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${files.length < 2 || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Merging…' : <><Download className="w-4 h-4 mr-2" />Merge & Download</>}
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl border bg-white shadow-sm p-6 min-h-[300px]">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" /> Merge Order</h2>
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Layers className="w-12 h-12 mb-3 opacity-40" />
                <p>Upload PDFs to see them listed here</p>
                <p className="text-sm mt-1">Drag to reorder before merging</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {files.map((f, i) => (
                  <li
                    key={f.id}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDragEnter={() => onDragEnter(i)}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors"
                  >
                    <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0 font-bold">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                      <p className="text-xs text-gray-500">{f.pageCount} page{f.pageCount !== 1 ? 's' : ''} · {fmtSize(f.sizeBytes)}</p>
                    </div>
                    <button onClick={() => removeFile(f.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0" title="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {files.length >= 2 && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Ready to merge {files.length} files into {totalPages} pages
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-blue-800 flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Pro Tips</h2>
        <ul className="space-y-2 text-sm text-blue-900">
          <li>💡 Drag the <strong>grip handle</strong> on the left of each file to reorder before merging.</li>
          <li>💡 All merging happens <strong>in your browser</strong> — no files are sent to any server.</li>
          <li>💡 Remove individual files using the <strong>trash icon</strong> without re-uploading the rest.</li>
          <li>💡 Large PDFs may take a moment — the button will show <em>Merging…</em> while processing.</li>
          <li>💡 Password-protected PDFs must be unlocked first before they can be merged.</li>
          <li>💡 The output file is named <strong>merged.pdf</strong> by default.</li>
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
