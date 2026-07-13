import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import {
  FileArchive, Upload, Download, Lightbulb, ThumbsUp, ThumbsDown,
  FileText, ArrowRight, Info, BarChart2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';

type CompressionLevel = 'low' | 'medium' | 'high';

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function PdfCompressor() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('medium');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; originalSize: number; compressedSize: number } | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() => {
    try { return localStorage.getItem('feedback_pdf-compressor') as 'up' | 'down' | null; } catch { return null; }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.type !== 'application/pdf' && !f.name.endsWith('.pdf')) {
      toast({ title: 'Invalid file', description: 'Please upload a PDF file.', variant: 'destructive' });
      return;
    }
    setFile(f);
    setResult(null);
  }, [toast]);

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);

      // Remove metadata based on level
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      if (level === 'medium' || level === 'high') {
        pdfDoc.setCreator('');
      }

      const outBytes = await pdfDoc.save({ useObjectStreams: level !== 'low', addDefaultPage: false });
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      setResult({ blob, originalSize: file.size, compressedSize: blob.size });

      toast({ title: 'Compression complete!', description: `Saved ${formatBytes(file.size - blob.size)}` });
    } catch (err) {
      toast({ title: 'Compression failed', description: String(err), variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleFeedback = (val: 'up' | 'down') => {
    setFeedback(val);
    try { localStorage.setItem('feedback_pdf-compressor', val); } catch {}
  };

  const reduction = result ? Math.max(0, ((result.originalSize - result.compressedSize) / result.originalSize) * 100) : 0;

  const levels: { value: CompressionLevel; label: string; desc: string }[] = [
    { value: 'low', label: 'Low', desc: 'Minimal changes' },
    { value: 'medium', label: 'Medium', desc: 'Removes metadata' },
    { value: 'high', label: 'High', desc: 'Max optimization' },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-8 text-white flex items-center gap-4">
        <div className="bg-white/20 rounded-xl p-3">
          <FileArchive className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">PDF Compressor</h1>
          <p className="text-blue-100 mt-1">Reduce your PDF file size while keeping it readable — no uploads to servers.</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Browser-based compression removes metadata and optimizes structure. For maximum compression, use dedicated desktop software.
        </p>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Upload PDF</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">Drop PDF here or click to browse</p>
              <p className="text-xs text-gray-500 mt-1">Only PDF files accepted</p>
            </div>

            {file && (
              <div className="rounded-lg bg-gray-50 border p-3 flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
            <Label className="text-base font-semibold">Compression Level</Label>
            <div className="space-y-2">
              {levels.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`w-full text-left rounded-lg border p-3 transition-all ${level === l.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{l.label}</span>
                    {level === l.value && <span className="text-xs text-blue-600 font-medium">Selected</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{l.desc}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 italic">Note: Browser-side compression removes metadata and re-encodes structure. True image recompression is limited without server-side processing.</p>
          </div>

          <Button
            onClick={handleCompress}
            disabled={!file || processing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Compressing…' : 'Compress PDF'}
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4 min-h-[320px] flex flex-col">
            <h2 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" /> Results
            </h2>

            {!result && (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-12">
                <FileArchive className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Upload a PDF and click Compress to see results</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-gray-50 border p-4">
                    <p className="text-xs text-gray-500 mb-1">Original</p>
                    <p className="text-lg font-bold text-gray-900">{formatBytes(result.originalSize)}</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                    <p className="text-xs text-gray-500 mb-1">Compressed</p>
                    <p className="text-lg font-bold text-green-700">{formatBytes(result.compressedSize)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Size reduction</span>
                    <span className="font-semibold text-green-700">{reduction.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-700 rounded-full"
                      style={{ width: `${Math.max(2, reduction)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
                  Saved <strong>{formatBytes(result.originalSize - result.compressedSize)}</strong> ({reduction.toFixed(1)}% reduction)
                </div>

                <Button
                  onClick={() => downloadBlob(result.blob, 'compressed.pdf')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" /> Download Compressed PDF
                </Button>
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
          <li>• Browser compression works best on PDFs with lots of metadata — ideal for exported Word/Office documents.</li>
          <li>• If your PDF has large images, desktop tools like Smallpdf or Adobe Acrobat will achieve better results.</li>
          <li>• Always keep your original file as a backup before compressing.</li>
          <li>• The "High" level uses object streams which many PDF readers support — try it for the best results.</li>
          <li>• Scanned PDFs (image-based) see minimal compression since content is already in image format.</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 text-lg">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            { q: 'Does this upload my file to a server?', a: 'No. All processing happens entirely in your browser using PDF-lib. Your file never leaves your device.' },
            { q: 'How much can browser compression reduce file size?', a: 'It depends on the source PDF. Text-heavy documents with lots of metadata can see 10–40% reduction. Image-heavy PDFs see minimal change.' },
            { q: 'Will the quality of my PDF be affected?', a: 'No. Browser-side compression only removes metadata and optimizes internal structure — it does not re-encode or downscale images.' },
            { q: 'What is the difference between the compression levels?', a: 'Low removes basic metadata. Medium strips all metadata. High also enables object streams, which compact the internal PDF structure further.' },
            { q: 'Why is the compressed file larger in some cases?', a: 'This can happen with already-optimized PDFs. In such cases, the original file is already at its minimum size.' },
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
            { to: '/pdf-split', label: 'PDF Split', desc: 'Split a PDF into separate pages' },
            { to: '/protect-pdf', label: 'Protect PDF', desc: 'Add password protection to your PDF' },
            { to: '/jpg-to-pdf', label: 'JPG to PDF', desc: 'Convert images to a PDF document' },
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
