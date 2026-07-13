import React, { useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import {
  FileText, Download, Loader2, X, Lightbulb, ThumbsUp, ThumbsDown,
  AlertTriangle, CheckCircle2, Star, Upload, Info,
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = 'idle' | 'extracting' | 'done' | 'error';
type RatingVal = 'up' | 'down' | null;

interface FBState {
  rating: RatingVal;
  reports: { type: string; text: string; at: number }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FB_KEY = 'tbh-pdf-to-word-feedback';

function loadFeedback(): FBState {
  try { return JSON.parse(localStorage.getItem(FB_KEY) || 'null') ?? { rating: null, reports: [] }; }
  catch { return { rating: null, reports: [] }; }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

const RELATED = [
  { label: 'Word to PDF', href: '/word-to-pdf', emoji: '📄' },
  { label: 'PDF Merge', href: '/pdf-merge', emoji: '📎' },
  { label: 'PDF Split', href: '/pdf-split', emoji: '✂️' },
  { label: 'PDF Compressor', href: '/pdf-compressor', emoji: '🗜️' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PdfToWord() {
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>('idle');
  const [extractedText, setExtractedText] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [progress, setProgress] = useState(0);

  const [feedback, setFeedback] = useState<FBState>(loadFeedback);
  const [fbForm, setFbForm] = useState(false);
  const [fbType, setFbType] = useState('Bug Report');
  const [fbText, setFbText] = useState('');

  const wordCount = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
  const charCount = extractedText.length;

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.name.endsWith('.pdf')) {
      toast({ title: 'Please upload a PDF file', variant: 'destructive' });
      return;
    }
    setFile(f);
    setExtractedText('');
    setStatus('idle');
    setPageCount(0);
    setProgress(0);
  }, [toast]);

  const handleExtract = async () => {
    if (!file) return;
    setStatus('extracting');
    setExtractedText('');
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const numPages = pdf.numPages;
      setPageCount(numPages);

      const pageTexts: string[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        pageTexts.push(`--- Page ${pageNum} ---\n${pageText}`);
        setProgress(pageNum);
      }

      const fullText = pageTexts.join('\n\n');
      setExtractedText(fullText);
      setStatus('done');
      toast({ title: `✅ Extracted text from ${numPages} page(s)!` });
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast({ title: 'Extraction failed', description: String(err), variant: 'destructive' });
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const baseName = file?.name.replace('.pdf', '') ?? 'document';
    downloadBlob(blob, `${baseName}.txt`);
  };

  const downloadDoc = () => {
    const htmlContent = `<html><body>${extractedText.split('\n').map(l => `<p>${l}</p>`).join('')}</body></html>`;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const baseName = file?.name.replace('.pdf', '') ?? 'document';
    downloadBlob(blob, `${baseName}.doc`);
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

  const isExtracting = status === 'extracting';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 rounded-xl p-2">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">PDF to Word</h1>
        </div>
        <p className="text-blue-100 max-w-xl">
          Extract text from PDF and download as an editable document — entirely in your browser.
        </p>
      </div>

      {/* Note Banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> PDF to Word conversion extracts text content. Complex layouts, tables,
          and images may not convert perfectly — this is a browser limitation.
        </p>
      </div>

      {/* Main 2-column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
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
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{fmtBytes(file.size)}</p>
                </div>
                <button onClick={() => { setFile(null); setExtractedText(''); setStatus('idle'); }} className="text-gray-400 hover:text-red-500 ml-2 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <Button onClick={handleExtract} disabled={!file || isExtracting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isExtracting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Extracting…</>
                : <><FileText className="w-4 h-4" />Extract Text</>}
            </Button>

            {isExtracting && pageCount > 0 && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Extracting pages</span>
                  <span>{progress} / {pageCount}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${(progress / pageCount) * 100}%` }} />
                </div>
              </div>
            )}

            {status === 'done' && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="font-bold text-gray-800 text-base">{pageCount}</p>
                    <p className="text-gray-500">Pages</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-base">{wordCount.toLocaleString()}</p>
                    <p className="text-gray-500">Words</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-base">{charCount.toLocaleString()}</p>
                    <p className="text-gray-500">Chars</p>
                  </div>
                </div>

                <Button onClick={downloadTxt} variant="outline"
                  className="w-full gap-2 border-blue-300 text-blue-600 hover:bg-blue-50">
                  <Download className="w-4 h-4" />Download as .txt
                </Button>
                <Button onClick={downloadDoc} variant="outline"
                  className="w-full gap-2 border-blue-300 text-blue-600 hover:bg-blue-50">
                  <Download className="w-4 h-4" />Download as .doc
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4" />
                Extraction failed. Try another PDF.
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-white shadow-sm p-6 min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Extracted Text</h2>
              {status === 'done' && (
                <span className="text-xs text-gray-400">{pageCount} pages · {wordCount.toLocaleString()} words</span>
              )}
            </div>

            {!extractedText && !isExtracting && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                <FileText className="w-16 h-16 mb-3" />
                <p className="text-sm">Extracted text will appear here</p>
                <p className="text-xs mt-1">You can edit it before downloading</p>
              </div>
            )}

            {isExtracting && !extractedText && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Loader2 className="w-12 h-12 animate-spin mb-3 text-blue-400" />
                <p className="text-sm">Extracting text from PDF…</p>
              </div>
            )}

            {extractedText && (
              <>
                <p className="text-xs text-gray-400 mb-2">You can edit the text below before downloading.</p>
                <textarea
                  value={extractedText}
                  onChange={e => setExtractedText(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                  style={{ minHeight: '480px' }}
                />
              </>
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
            '💡 You can edit the extracted text in the preview before downloading.',
            '💡 Use .txt for pure plain text; .doc for Word-compatible editing.',
            '💡 Scanned PDFs (images) won\'t yield text — they need OCR software.',
            '💡 Page markers ("--- Page X ---") help you locate content from specific pages.',
            '💡 All text extraction runs locally — your PDF never leaves your browser.',
            '💡 Combine with Word to PDF to round-trip your document editing workflow.',
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
            { q: 'Is my PDF sent to a server?', a: 'No. All text extraction uses PDF.js running entirely in your browser. Your file stays on your device.' },
            { q: 'Why is the extracted text garbled or incomplete?', a: 'Some PDFs use custom fonts or embed text as vector paths, making text extraction unreliable. Scanned PDFs require OCR software.' },
            { q: 'What is the difference between .txt and .doc download?', a: '.txt is plain text with no formatting. .doc is an HTML-based Word-compatible file that opens in Microsoft Word and LibreOffice.' },
            { q: 'Can I extract text from password-protected PDFs?', a: 'No. Remove the password first using a PDF tool, then upload the unlocked file.' },
            { q: 'Will tables and images be extracted?', a: 'Only text content is extracted. Tables become plain text and images are not included. For full fidelity, use dedicated desktop software.' },
            { q: 'Can I edit the extracted text before downloading?', a: 'Yes! The preview area is fully editable — clean up spacing, remove unwanted characters, and then download.' },
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
    </div>
  );
}
