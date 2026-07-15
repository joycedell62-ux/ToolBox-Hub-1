import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import {
  Shield, Upload, Download, Lightbulb, ThumbsUp, ThumbsDown,
  FileText, ArrowRight, Eye, EyeOff, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { protectPdf } from '@/lib/pdfCrypto';

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

function getStrength(pw: string): { label: string; color: string; bars: number } {
  if (!pw) return { label: 'None', color: 'bg-gray-200', bars: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', bars: 1 };
  if (score === 2) return { label: 'Fair', color: 'bg-yellow-500', bars: 2 };
  if (score === 3) return { label: 'Good', color: 'bg-blue-500', bars: 3 };
  if (score === 4) return { label: 'Strong', color: 'bg-green-500', bars: 4 };
  return { label: 'Very Strong', color: 'bg-green-600', bars: 5 };
}

export default function ProtectPdf() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showUser, setShowUser] = useState(false);
  const [showOwner, setShowOwner] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [restrictions, setRestrictions] = useState({
    printing: false,
    copying: false,
    editing: false,
  });
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() => {
    try { return localStorage.getItem('feedback_protect-pdf') as 'up' | 'down' | null; } catch { return null; }
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

  const handleProtect = async () => {
    if (!file) return;
    if (!userPassword) {
      toast({ title: 'Password required', description: 'Please enter a user password.', variant: 'destructive' });
      return;
    }
    if (userPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'User password and confirm password must match.', variant: 'destructive' });
      return;
    }
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const outBytes = await protectPdf(arrayBuffer, userPassword, ownerPassword, restrictions);
      const blob = new Blob([outBytes.slice()], { type: 'application/pdf' });
      setResult(blob);
      toast({ title: 'PDF Protected!', description: 'Password protection applied. Text remains fully selectable.' });
    } catch (err) {
      toast({ title: 'Protection failed', description: String(err), variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleFeedback = (val: 'up' | 'down') => {
    setFeedback(val);
    try { localStorage.setItem('feedback_protect-pdf', val); } catch {}
  };

  const strength = getStrength(userPassword);
  const passwordsMatch = userPassword && confirmPassword && userPassword === confirmPassword;
  const passwordsMismatch = confirmPassword && userPassword !== confirmPassword;

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-8 text-white flex items-center gap-4">
        <div className="bg-white/20 rounded-xl p-3">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Protect PDF</h1>
          <p className="text-blue-100 mt-1">Add password protection to your PDF — secured in your browser.</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload */}
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

          {/* Passwords */}
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Passwords</h2>

            {/* User password */}
            <div className="space-y-1.5">
              <Label htmlFor="user-pw" className="text-sm font-medium">User Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="user-pw"
                  type={showUser ? 'text' : 'password'}
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Required to open PDF"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowUser(!showUser)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showUser ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength indicator */}
              {userPassword && (
                <div className="space-y-1 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Strength</span>
                    <span className={`font-medium ${strength.bars >= 4 ? 'text-green-600' : strength.bars >= 3 ? 'text-blue-600' : strength.bars >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>{strength.label}</span>
                  </div>
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((b) => (
                      <div key={b} className={`flex-1 rounded-full transition-colors ${b <= strength.bars ? strength.color : 'bg-gray-200'}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-pw"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter user password"
                  className={`pr-10 ${passwordsMismatch ? 'border-red-400 focus-visible:ring-red-400' : passwordsMatch ? 'border-green-400 focus-visible:ring-green-400' : ''}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordsMismatch && <p className="text-xs text-red-500">Passwords do not match</p>}
              {passwordsMatch && <p className="text-xs text-green-600">Passwords match ✓</p>}
            </div>

            {/* Owner password */}
            <div className="space-y-1.5">
              <Label htmlFor="owner-pw" className="text-sm font-medium">Owner Password <span className="text-gray-400 font-normal">(optional)</span></Label>
              <div className="relative">
                <Input
                  id="owner-pw"
                  type={showOwner ? 'text' : 'password'}
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="For permissions control"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowOwner(!showOwner)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showOwner ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Used to set permissions. If left blank, a generated owner password will be used.</p>
            </div>
          </div>

          {/* Restrictions */}
          <div className="rounded-xl border bg-white shadow-sm p-6 space-y-3">
            <h2 className="font-semibold text-gray-900 text-lg">Restrictions</h2>
            <p className="text-xs text-gray-500">These are owner-level permissions. Enforcement depends on the PDF reader.</p>
            {([
              { key: 'printing', label: 'Prevent Printing' },
              { key: 'copying', label: 'Prevent Copying' },
              { key: 'editing', label: 'Prevent Editing' },
            ] as const).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={restrictions[key]}
                  onChange={(e) => setRestrictions(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>

          <Button
            onClick={handleProtect}
            disabled={!file || !userPassword || !!passwordsMismatch || processing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Protecting…' : 'Protect PDF'}
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl border bg-white shadow-sm p-6 min-h-[320px] flex flex-col space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Preview</h2>

            {!file && (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-12">
                <Shield className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Upload a PDF and set your password to protect it</p>
              </div>
            )}

            {file && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
                <div className="relative">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${result ? 'bg-green-50 border-2 border-green-300' : 'bg-blue-50 border-2 border-blue-200'}`}>
                    {result ? <Lock className="w-8 h-8 text-green-600" /> : <Shield className="w-8 h-8 text-blue-500" />}
                  </div>
                  {result && (
                    <span className="absolute -bottom-1 -right-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full border border-green-200">Protected</span>
                  )}
                  {!result && userPassword && (
                    <span className="absolute -bottom-1 -right-1 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200">{strength.label}</span>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatBytes(file.size)}</p>
                  {result && <p className="text-sm text-green-600 mt-2">Password protection applied!</p>}
                </div>
                {result && (
                  <Button
                    onClick={() => downloadBlob(result, 'protected.pdf')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download Protected PDF
                  </Button>
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
          <li>• Use a strong user password — mix uppercase, numbers, and symbols for maximum security.</li>
          <li>• The owner password controls permissions (printing, copying, editing) and can be different from the user password.</li>
          <li>• Permission restrictions (printing, copying) are enforced by the PDF reader, not the format — some readers may ignore them.</li>
          <li>• Store your password safely — there is no way to recover it if forgotten.</li>
          <li>• For highly sensitive documents, consider additional encryption tools beyond PDF passwords.</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 text-lg">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            { q: 'What is the difference between user and owner passwords?', a: 'The user password is required to open the PDF. The owner password controls permissions like printing, copying, and editing — it can be different from the user password.' },
            { q: 'Is my file uploaded to any server?', a: 'No. All processing happens in your browser using PDF-lib. Your file and password never leave your device.' },
            { q: 'Will all PDF readers enforce the restrictions?', a: 'Restriction enforcement (no printing, no copying) depends on the PDF reader. Most compliant readers honor them, but some tools may bypass them.' },
            { q: 'What happens if I forget the password?', a: 'There is no recovery option. Always store your PDF password in a secure password manager.' },
            { q: 'Can I re-protect an already protected PDF?', a: 'You would need to unlock it first (using the Unlock PDF tool with the current password), then re-protect it with a new password.' },
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
            { to: '/unlock-pdf', label: 'Unlock PDF', desc: 'Remove password from a PDF' },
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
