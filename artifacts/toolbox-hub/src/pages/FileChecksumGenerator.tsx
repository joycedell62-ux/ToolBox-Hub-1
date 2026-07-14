import React, { useState, useRef } from 'react';
import { FileDigit, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, Upload, X } from 'lucide-react';
import { Link } from 'wouter';
import SparkMD5 from 'spark-md5';
import { sha256 } from 'js-sha256';
import { sha1 } from 'js-sha1';

const FAQS = [
  { q: 'What is a checksum?', a: 'A checksum (or hash) is a short fixed-length fingerprint of a file. If even one byte changes, the checksum changes completely — making it perfect for verifying downloads and detecting corruption.' },
  { q: 'Which algorithms are supported?', a: 'SHA-256 and SHA-1 via the browser’s built-in Web Crypto API, plus MD5 via SparkMD5. SHA-256 is recommended for integrity verification.' },
  { q: 'Are big files handled well?', a: 'Yes. Files are read in chunks so even large files hash without exhausting memory, and a progress bar shows how far along it is.' },
  { q: 'How do I verify a download?', a: 'Paste the checksum published by the source into the "Compare against" box. A green match means the file is intact; a red mismatch means it differs.' },
  { q: 'Is my file uploaded?', a: 'No. Everything is computed locally in your browser using Web Crypto and FileReader — your file never leaves your device.' },
];

type Algo = 'SHA-256' | 'SHA-1' | 'MD5';
const CHUNK = 2 * 1024 * 1024;

interface FileResult {
  name: string;
  size: number;
  hashes: Record<Algo, string>;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function md5File(file: File, onProgress: (p: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer();
    const chunks = Math.ceil(file.size / CHUNK);
    let current = 0;
    const reader = new FileReader();
    reader.onload = (e) => {
      spark.append(e.target!.result as ArrayBuffer);
      current++;
      onProgress(current / Math.max(chunks, 1));
      if (current < chunks) loadNext();
      else resolve(spark.end());
    };
    reader.onerror = () => reject(new Error('Could not read file for MD5.'));
    const loadNext = () => {
      const start = current * CHUNK;
      reader.readAsArrayBuffer(file.slice(start, Math.min(start + CHUNK, file.size)));
    };
    if (file.size === 0) resolve(spark.end());
    else loadNext();
  });
}

/** Chunked, incremental SHA hashing so large files never load fully into memory. */
async function shaFile(file: File, algo: 'SHA-256' | 'SHA-1'): Promise<string> {
  const hasher = algo === 'SHA-256' ? sha256.create() : sha1.create();
  let offset = 0;
  while (offset < file.size) {
    const buf = await file.slice(offset, Math.min(offset + CHUNK, file.size)).arrayBuffer();
    hasher.update(buf);
    offset += CHUNK;
  }
  return hasher.hex();
}

export default function FileChecksumGenerator() {
  const [results, setResults] = useState<FileResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusName, setStatusName] = useState('');
  const [error, setError] = useState('');
  const [expected, setExpected] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const process = async (files: FileList | File[]) => {
    setError('');
    setBusy(true);
    const list = Array.from(files);
    const out: FileResult[] = [];
    try {
      for (const file of list) {
        setStatusName(file.name);
        setProgress(0);
        const md5 = await md5File(file, setProgress);
        const sha256 = await shaFile(file, 'SHA-256');
        const sha1 = await shaFile(file, 'SHA-1');
        out.push({ name: file.name, size: file.size, hashes: { 'SHA-256': sha256, 'SHA-1': sha1, MD5: md5 } });
      }
      setResults(prev => [...out, ...prev]);
    } catch (e) {
      setError('Failed to process file: ' + ((e as Error).message || 'unknown error'));
    } finally {
      setBusy(false);
      setStatusName('');
      setProgress(0);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) process(e.dataTransfer.files);
  };

  const copy = async (val: string, key: string) => { await navigator.clipboard.writeText(val); setCopied(key); setTimeout(() => setCopied(null), 2000); };

  const expectedTrim = expected.trim().toLowerCase();
  const fmtSize = (n: number) => n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`;

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><FileDigit className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">File Checksum Generator</h1><p className="text-blue-200 text-sm">SHA-256 · SHA-1 · MD5 · verify downloads · offline</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Compute SHA-256, SHA-1 and MD5 checksums for any file to verify integrity. Everything runs in your browser — your files are never uploaded.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Choose files to hash, or drop them here"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
              className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
            >
              <Upload className="w-6 h-6 text-blue-600 mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm font-semibold text-gray-700">Drop file(s) here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">Multiple files supported · large files hashed in chunks</p>
              <input ref={inputRef} type="file" multiple className="hidden" onChange={e => { if (e.target.files?.length) process(e.target.files); e.target.value = ''; }} aria-label="Choose files" />
            </div>
            {busy && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500"><span className="truncate max-w-[70%]">Hashing {statusName}…</span><span>{Math.round(progress * 100)}%</span></div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-blue-600 transition-all" style={{ width: `${progress * 100}%` }} /></div>
              </div>
            )}
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>}
            <div>
              <label htmlFor="cs-expected" className="block text-xs font-semibold text-gray-500 mb-1">Compare against expected checksum</label>
              <input id="cs-expected" type="text" value={expected} onChange={e => setExpected(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Paste a hash to verify a match" />
            </div>
            {results.length > 0 && (
              <button onClick={() => setResults([])} className="w-full py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-red-300 transition-colors text-sm flex items-center justify-center gap-2"><X className="w-4 h-4" /> Clear results</button>
            )}
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Use SHA-256 to verify downloads — it’s the modern standard.</li>
              <li>• MD5 and SHA-1 are fine for detecting accidental corruption, not security.</li>
              <li>• Paste the publisher’s hash into "Compare against" for an instant match check.</li>
              <li>• Large files are read in chunks, so memory stays low.</li>
              <li>• Nothing is uploaded — hashing happens entirely on your device.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Checksums</h2>
            {results.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {results.map((r, ri) => (
                  <div key={r.name + ri} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-gray-800 text-sm truncate">{r.name}</span>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">{fmtSize(r.size)}</span>
                    </div>
                    <div className="space-y-2">
                      {(['SHA-256', 'SHA-1', 'MD5'] as Algo[]).map(algo => {
                        const val = r.hashes[algo];
                        const matches = expectedTrim.length > 0 && expectedTrim === val.toLowerCase();
                        const mismatch = expectedTrim.length > 0 && !matches;
                        const key = r.name + ri + algo;
                        return (
                          <div key={algo} className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-gray-500">{algo}</span>
                              <div className="flex items-center gap-2">
                                {matches && <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Match</span>}
                                {mismatch && <span className="text-xs font-semibold text-red-500 flex items-center gap-1"><X className="w-3.5 h-3.5" /> No match</span>}
                                <button onClick={() => copy(val, key)} className="text-gray-300 hover:text-blue-600 transition-colors" aria-label={`Copy ${algo} checksum`}>
                                  {copied === key ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            <code className={`block text-xs font-mono break-all select-all ${matches ? 'text-green-700' : mismatch ? 'text-red-600' : 'text-gray-700'}`}>{val}</code>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Drop or choose a file to compute its checksums.</p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Hash Generator', href: '/hash-generator' }, { label: 'Password Strength', href: '/password-strength-checker' }, { label: 'UUID Generator', href: '/uuid-generator' }, { label: 'Barcode Scanner', href: '/barcode-scanner' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_file-checksum-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
