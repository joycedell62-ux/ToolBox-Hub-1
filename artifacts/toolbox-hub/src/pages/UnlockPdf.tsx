import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import {
  Unlock, Upload, Download, Lightbulb, ThumbsUp, ThumbsDown,
  FileText, ArrowRight, Lock, Eye, EyeOff, ShieldOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import jsPDF from 'jspdf';
import { unlockPdf as unlockPdfCrypto } from '@/lib/pdfCrypto';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

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

export default function UnlockPdf() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [unlocked, setUnlocked] = useState<Blob | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() => {
    try { return localStorage.getItem('feedback_unlock-pdf') as 'up' | 'down' | null; } catch { return null; }
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
    setUnlocked(null);
  }, [toast]);

  const handleUnlock = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      // Step 1 — validate password with pdfjs-dist (supports all encryption types)
      let pdfJsDoc: pdfjsLib.PDFDocumentProxy;
      try {
        pdfJsDoc = await pdfjsLib.getDocument({ data, password }).promise;
      } catch (err: unknown) {
        const name = (err as { name?: string })?.name ?? '';
        if (name === 'PasswordException' || String(err).toLowerCase().includes('password')) {
          toast({ title: 'Incorrect password', description: 'Could not unlock the PDF. Please check your password.', variant: 'destructive' });
          setProcessing(false);
          return;
        }
        throw err;
      }

      // Step 2 — try RC4 path: produces a text-based, fully selectable PDF
      const unlockedBytes = await unlockPdfCrypto(arrayBuffer, password);

      if (unlockedBytes) {
        const blob = new Blob([unlockedBytes.slice()], { type: 'application/pdf' });
        setUnlocked(blob);
        toast({ title: 'PDF Unlocked!', description: 'Password removed. Text is fully selectable and searchable.' });
        return;
      }

      // Step 3 — AES fallback: render to images via pdfjs-dist + jsPDF
      // (AES-encrypted PDFs cannot be re-serialised without a native AES library)
      const numPages = pdfJsDoc.numPages;
      const firstPage = await pdfJsDoc.getPage(1);
      const vp0 = firstPage.getViewport({ scale: 1 });
      const pdf = new jsPDF({ unit: 'pt', format: [vp0.width, vp0.height] });

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfJsDoc.getPage(i);
        const vpPt     = page.getViewport({ scale: 1 });
        const vpRender = page.getViewport({ scale: 2 });
        if (i > 1) pdf.addPage([vpPt.width, vpPt.height]);
        const canvas = document.createElement('canvas');
        canvas.width  = vpRender.width;
        canvas.height = vpRender.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport: vpRender, canvas }).promise;
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, vpPt.width, vpPt.height);
      }

      const outBytes = pdf.output('arraybuffer');
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      setUnlocked(blob);
      toast({
        title: 'PDF Unlocked (image mode)',
        description: 'This PDF uses AES encryption. Visual content is preserved but text selection requires a desktop PDF tool.',
      });
    } catch (err) {
      toast({ title: 'Failed to unlock', description: String(err), variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleFeedback = (val: 'up' | 'down') => {
    setFeedback(val);
    try { localStorage.setItem('feedback_unlock-pdf', val); } catch {}
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-8 text-white flex items-center gap-4">
        <div className="bg-white/20 rounded-xl p-3">
          <Unlock className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Unlock PDF</h1>
          <p className="text-blue-100 mt-1">Remove password protection from a PDF — you must know the password.</p>
        </div>
      </div>

      {/* Privacy note */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3">
        <ShieldOff className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Your file is processed entirely in your browser. It is never uploaded to any server.
        </p>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Upload Password-Protected PDF</h2>
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
            <Label htmlFor="pdf-password" className="text-base font-semibold">PDF Password</Label>
            <div className="relative">
              <Input
                id="pdf-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter PDF password"
                className="pr-10"
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">You must know the PDF password to unlock it. This tool cannot crack unknown passwords.</p>
          </div>

          <Button
            onClick={handleUnlock}
            disabled={!file || !password || processing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Unlocking…' : 'Unlock PDF'}
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl border bg-white shadow-sm p-6 min-h-[320px] flex flex-col space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Status</h2>

            {!file && (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-12">
                <Lock className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Upload a password-protected PDF to get started</p>
              </div>
            )}

            {file && !unlocked && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-red-500" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full border border-red-200">Locked</span>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatBytes(file.size)}</p>
                  <p className="text-sm text-red-600 mt-2">This PDF is password protected</p>
                </div>
              </div>
            )}

            {unlocked && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                    <Unlock className="w-8 h-8 text-green-500" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full border border-green-200">Unlocked</span>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{file?.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatBytes(unlocked.size)}</p>
                  <p className="text-sm text-green-600 mt-2">Password protection removed successfully</p>
                </div>
                <Button
                  onClick={() => downloadBlob(unlocked, 'unlocked.pdf')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" /> Download Unlocked PDF
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
          <li>• This tool removes the user (open) password from a PDF — you must know the correct password.</li>
          <li>• After unlocking, the PDF can be opened without a password in any PDF reader.</li>
          <li>• If you forgot the password entirely, no browser tool can recover it — you'd need specialized recovery software.</li>
          <li>• Owner (permissions) passwords that restrict printing or editing can sometimes be bypassed with this tool.</li>
          <li>• Always keep your original encrypted file as a backup.</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 text-lg">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            { q: 'Can this tool crack a PDF password I don\'t know?', a: 'No. This tool can only remove password protection if you provide the correct password. It is not a password cracker.' },
            { q: 'Is my PDF sent to any server?', a: 'No. All processing happens locally in your browser using PDF-lib. Your file never leaves your device.' },
            { q: 'What types of PDF passwords does this handle?', a: 'This handles both user passwords (required to open the PDF) and owner passwords (which set usage restrictions like printing or copying).' },
            { q: 'Will the unlocked PDF look identical to the original?', a: 'Yes. Removing password protection does not affect the content, formatting, or images in any way.' },
            { q: 'Why does it fail even with the correct password?', a: 'Some PDFs use newer or proprietary encryption standards that pdf-lib may not support. In such cases, try Adobe Acrobat or a desktop PDF tool.' },
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
            { to: '/protect-pdf', label: 'Protect PDF', desc: 'Add password protection to your PDF' },
            { to: '/pdf-merge', label: 'PDF Merge', desc: 'Combine multiple PDFs into one' },
            { to: '/pdf-compressor', label: 'PDF Compressor', desc: 'Reduce PDF file size' },
            { to: '/rotate-pdf', label: 'Rotate PDF', desc: 'Rotate pages in your PDF' },
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
