import React, { useState, useEffect } from 'react';
import { Shield, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What hashing algorithms are supported?', a: 'SHA-1, SHA-256, SHA-384, and SHA-512 — all provided by the browser\'s native Web Crypto API.' },
  { q: 'Is this secure?', a: 'SHA-256 and SHA-512 are cryptographically secure. SHA-1 is outdated and should not be used for security purposes.' },
  { q: 'Is my data sent anywhere?', a: 'No — hashing happens entirely in your browser using the Web Crypto API. Nothing is sent to a server.' },
  { q: 'What is a hash used for?', a: 'Verifying file integrity, storing passwords (with salt), checksums, digital signatures, and deduplication.' },
];

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
type Algo = typeof ALGOS[number];

async function hashText(text: string, algo: Algo): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algo.replace('-', '-') as AlgorithmIdentifier, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [algo, setAlgo] = useState<Algo>('SHA-256');
  const [hashes, setHashes] = useState<Partial<Record<Algo, string>>>({});
  const [genAll, setGenAll] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (!input) { setHashes({}); return; }
    const algoList = genAll ? [...ALGOS] : [algo];
    Promise.all(algoList.map(a => hashText(input, a).then(h => ({ a, h }))))
      .then(results => setHashes(Object.fromEntries(results.map(({ a, h }) => [a, h]))));
  }, [input, algo, genAll]);

  const copy = async (text: string, key: string) => { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Shield className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Hash Generator</h1><p className="text-blue-200 text-sm">SHA-1 · SHA-256 · SHA-384 · SHA-512 · Web Crypto API</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Generate cryptographic hashes of any text using the browser's built-in Web Crypto API — no external libraries, fully offline.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">Algorithm</div>
              <div className="grid grid-cols-2 gap-2">
                {ALGOS.map(a => (
                  <button key={a} onClick={() => { setAlgo(a); setGenAll(false); }} className={`py-2 rounded-xl text-xs font-bold transition-all ${algo === a && !genAll ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{a}</button>
                ))}
              </div>
              <button onClick={() => setGenAll(g => !g)} className={`w-full mt-2 py-2 rounded-xl text-xs font-bold transition-all ${genAll ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Generate All Algorithms</button>
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• SHA-256 is the most commonly required hash in modern systems.</li>
              <li>• Even a single character change produces a completely different hash.</li>
              <li>• Hashes are one-way — you cannot reverse a hash to get the original text.</li>
              <li>• Use SHA-512 for the highest security when storage space is not a concern.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Input Text</label>
              <textarea value={input} onChange={e => setInput(e.target.value)} rows={4} placeholder="Enter any text to hash…" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-mono" />
            </div>
            {Object.entries(hashes).length > 0 && (
              <div className="space-y-3">
                {Object.entries(hashes).map(([a, h]) => (
                  <div key={a} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-500">{a}</span>
                      <button onClick={() => copy(h!, a)} className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                        {copied === a ? <><Check className="w-3 h-3 text-emerald-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                    </div>
                    <div className="text-xs font-mono text-gray-700 break-all bg-white rounded-lg px-2 py-1.5 border border-gray-100">{h}</div>
                  </div>
                ))}
              </div>
            )}
            {!input && <div className="text-center py-6 text-gray-400 text-sm">Type something above to see its hash</div>}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'UUID Generator', href: '/uuid-generator' }, { label: 'Password Generator', href: '/password-generator' }, { label: 'Base64 Encoder', href: '/base64' }, { label: 'JSON Formatter', href: '/json-formatter' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_hash', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
