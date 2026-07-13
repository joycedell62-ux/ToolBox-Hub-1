import React, { useState, useRef, useCallback } from 'react';
import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  FileText, Download, Loader2, X, Lightbulb, ThumbsUp, ThumbsDown,
  AlertTriangle, CheckCircle2, Star, Upload, Info,
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = 'idle' | 'reading' | 'converting' | 'done' | 'error';
type RatingVal = 'up' | 'down' | null;

interface FBState {
  rating: RatingVal;
  reports: { type: string; text: string; at: number }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FB_KEY = 'tbh-word-to-pdf-feedback';

function loadFeedback(): FBState {
  try { return JSON.parse(localStorage.getItem(FB_KEY) || 'null') ?? { rating: null, reports: [] }; }
  catch { return { rating: null, reports: [] }; }
}

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

const RELATED = [
  { label: 'PDF to Word', href: '/pdf-to-word', emoji: '📝' },
  { label: 'PDF Merge', href: '/pdf-merge', emoji: '📎' },
  { label: 'Image to PDF', href: '/image-to-pdf', emoji: '🖼️' },
  { label: 'Resume Builder', href: '/resume-builder', emoji: '📄' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function WordToPdf() {
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>('idle');
  const [htmlContent, setHtmlContent] = useState('');

  const captureRef = useRef<HTMLDivElement>(null);

  const [feedback, setFeedback] = useState<FBState>(loadFeedback);
  const [fbForm, setFbForm] = useState(false);
  const [fbType, setFbType] = useState('Bug Report');
  const [fbText, setFbText] = useState('');

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.name.endsWith('.docx')) {
      toast({ title: 'Please upload a .docx file', variant: 'destructive' });
      return;
    }
    setFile(f);
    setHtmlContent('');
    setStatus('reading');
    try {
      const arrayBuffer = await f.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setHtmlContent(result.value);
      setStatus('idle');
      toast({ title: '✅ Document loaded. Click Convert to PDF.' });
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast({ title: 'Failed to read DOCX', description: String(err), variant: 'destructive' });
    }
  }, [toast]);

  const handleConvert = async () => {
    if (!htmlContent || !captureRef.current) return;
    setStatus('converting');
    try {
      // Small delay to let the hidden div render
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const canvasH = (canvas.height / canvas.width) * pageW;

      let yOffset = 0;
      while (yOffset < canvasH) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -yOffset, pageW, canvasH);
        yOffset += pageH;
      }

      const fileName = (file?.name.replace('.docx', '') ?? 'document') + '.pdf';
      pdf.save(fileName);
      setStatus('done');
      toast({ title: '✅ PDF downloaded!' });
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast({ title: 'Conversion failed', description: String(err), variant: 'destructive' });
    }
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

  const isConverting = status === 'converting' || status === 'reading';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Hidden capture div — A4 at 96dpi = 794px */}
      <div
        ref={captureRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '794px',
          backgroundColor: '#ffffff',
          padding: '48px',
          fontFamily: 'serif',
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#000',
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 rounded-xl p-2">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Word to PDF</h1>
        </div>
        <p className="text-blue-100 max-w-xl">
          Convert DOCX files to PDF — processed entirely in your browser.
          No uploads, no servers, fully private.
        </p>
      </div>

      {/* Note Banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Formatting accuracy depends on document complexity.
          For exact preservation, use Microsoft Word or LibreOffice.
        </p>
      </div>

      {/* Main 2-column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-800">Upload DOCX</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}`}
            >
              <input ref={fileInputRef} type="file" accept=".docx" className="hidden"
                onChange={(e) => handleFiles(e.target.files)} />
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium text-gray-600">Drop DOCX here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">.docx files only</p>
            </div>

            {file && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{fmtBytes(file.size)}</p>
                </div>
                <button onClick={() => { setFile(null); setHtmlContent(''); setStatus('idle'); }} className="text-gray-400 hover:text-red-500 ml-2 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {status === 'reading' && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Reading document…
              </div>
            )}

            <Button onClick={handleConvert}
              disabled={!htmlContent || isConverting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {status === 'converting'
                ? <><Loader2 className="w-4 h-4 animate-spin" />Converting document…</>
                : <><Download className="w-4 h-4" />Convert &amp; Download PDF</>}
            </Button>

            {status === 'done' && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4" />
                Done! PDF downloaded successfully.
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4" />
                Conversion failed. Try a simpler document.
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-white shadow-sm p-6 min-h-[400px]">
            <h2 className="font-bold text-gray-800 mb-4">Document Preview</h2>

            {!htmlContent && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                <FileText className="w-16 h-16 mb-3" />
                <p className="text-sm">Upload a DOCX to see a preview</p>
              </div>
            )}

            {htmlContent && (
              <div
                className="border rounded-lg overflow-y-auto max-h-[600px] bg-white p-6"
                style={{ fontFamily: 'Georgia, serif', fontSize: '14px', lineHeight: '1.7', color: '#111' }}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
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
            '💡 Simple documents with headings and paragraphs convert best.',
            '💡 Complex multi-column layouts may not render perfectly — this is a browser limitation.',
            '💡 The preview shows how your document will look in the PDF.',
            '💡 For tables and images, results may vary. LibreOffice gives exact results.',
            '💡 Your file never leaves your device — all conversion is local.',
            '💡 Use PDF Merge to combine multiple converted documents into one.',
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
            { q: 'Is my document sent to a server?', a: 'No. Conversion happens entirely in your browser using Mammoth.js and html2canvas. Your file never leaves your device.' },
            { q: 'Will my formatting be preserved?', a: 'Basic formatting like headings, bold, italic, and paragraphs convert well. Complex elements like multi-column layouts or embedded objects may not convert perfectly.' },
            { q: 'Can I convert .doc files (older Word format)?', a: 'Currently only .docx format is supported. Use LibreOffice to save .doc files as .docx first.' },
            { q: 'Why does the PDF look slightly different from Word?', a: 'The conversion renders HTML through a browser canvas, which can differ from Word\'s native rendering engine. Simple documents will look very close.' },
            { q: 'Is there a file size limit?', a: 'No enforced limit, but very large or complex documents may take longer to process since everything runs in-browser.' },
            { q: 'What if the conversion fails?', a: 'Try simplifying the document by removing complex tables or embedded objects. Plain text documents with headings always convert reliably.' },
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
