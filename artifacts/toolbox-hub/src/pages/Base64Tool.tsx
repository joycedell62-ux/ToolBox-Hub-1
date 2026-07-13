import React, { useState } from 'react';
import { Binary, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What is Base64?', a: 'A binary-to-text encoding scheme that represents binary data as ASCII characters. Used in emails, data URLs, JWTs, and APIs.' },
  { q: 'Is it encryption?', a: 'No — Base64 is encoding, not encryption. Anyone can decode it instantly. Never use it to hide sensitive data.' },
  { q: 'What characters are used?', a: 'A-Z, a-z, 0-9, +, /, and = for padding. URL-safe Base64 replaces + with - and / with _.' },
  { q: 'Can I encode files?', a: 'Currently this tool encodes text. For file encoding, a separate file Base64 tool would be needed.' },
];

export default function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const process = () => {
    setError('');
    if (!input) return '';
    try {
      if (mode === 'encode') {
        let result = btoa(unescape(encodeURIComponent(input)));
        if (urlSafe) result = result.replace(/\+/g, '-').replace(/\//g, '_');
        return result;
      } else {
        let inp = input;
        if (urlSafe) inp = inp.replace(/-/g, '+').replace(/_/g, '/');
        return decodeURIComponent(escape(atob(inp)));
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid input');
      return '';
    }
  };

  const output = process();
  const copy = async () => { if (!output) return; await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const taCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none leading-relaxed';

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Binary className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Base64 Encoder / Decoder</h1><p className="text-blue-200 text-sm">Encode & decode · URL-safe mode · instant · offline</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Encode text to Base64 or decode Base64 back to plain text — with URL-safe variant support.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex gap-2">
              {(['encode', 'decode'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{m}</button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={urlSafe} onChange={e => setUrlSafe(e.target.checked)} className="rounded w-4 h-4 accent-blue-600" />
              URL-safe mode (- and _ instead of + and /)
            </label>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Use URL-safe mode when embedding Base64 in URLs or JWT tokens.</li>
              <li>• Base64 adds ~33% overhead — a 3-byte input becomes 4 characters.</li>
              <li>• Data URLs for images use Base64: <code className="bg-blue-100 px-1 rounded text-xs">data:image/png;base64,...</code></li>
              <li>• JWT tokens are Base64url-encoded JSON — decode the payload to inspect them.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}</label>
            <textarea className={taCls} rows={7} value={input} onChange={e => setInput(e.target.value)} placeholder={mode === 'encode' ? 'Enter text to encode…' : 'Enter Base64 string to decode…'} />
          </div>
          {error && <div className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</div>}
          {output && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-500">{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</label>
                <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">{copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}</button>
              </div>
              <textarea className={taCls + ' bg-gray-900 text-green-300 border-gray-700'} rows={7} value={output} readOnly />
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'JSON Formatter', href: '/json-formatter' }, { label: 'URL Encoder', href: '/url-encoder' }, { label: 'Hash Generator', href: '/hash-generator' }, { label: 'UUID Generator', href: '/uuid-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_base64', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
