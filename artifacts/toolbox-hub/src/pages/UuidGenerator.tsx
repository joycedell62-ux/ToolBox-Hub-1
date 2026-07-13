import React, { useState } from 'react';
import { Fingerprint, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What is a UUID?', a: 'A Universally Unique Identifier — a 128-bit number used to uniquely identify things in computing. The v4 format is randomly generated.' },
  { q: 'How unique are UUIDs?', a: 'The probability of generating two identical UUIDs is astronomically small — roughly 1 in 5.3 × 10^36.' },
  { q: 'What is the difference between v4 and v1?', a: 'v4 is randomly generated. v1 is based on the current timestamp and machine MAC address. This tool generates v4 (the most common).' },
  { q: 'Can I use these in production?', a: 'Yes — browser crypto.randomUUID() uses a cryptographically secure random number generator, safe for production use.' },
];

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>(() => Array.from({ length: 5 }, generateUUID));
  const [uppercase, setUppercase] = useState(false);
  const [noBraces, setNoBraces] = useState(true);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedOne, setCopiedOne] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => setUuids(Array.from({ length: count }, generateUUID));

  const format = (u: string) => {
    let s = uppercase ? u.toUpperCase() : u;
    if (!noBraces) s = `{${s}}`;
    return s;
  };

  const copyOne = async (uuid: string, i: number) => { await navigator.clipboard.writeText(format(uuid)); setCopiedOne(i); setTimeout(() => setCopiedOne(null), 2000); };
  const copyAll = async () => { await navigator.clipboard.writeText(uuids.map(format).join('\n')); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Fingerprint className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">UUID Generator</h1><p className="text-blue-200 text-sm">v4 UUIDs · bulk generate · copy all · format options</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Generate cryptographically random UUIDs (v4) using the browser's native crypto API. Generate 1 to 100 at a time.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">How many? ({count})</label>
              <input type="range" min="1" max="100" value={count} onChange={e => setCount(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1</span><span>100</span></div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)} className="rounded w-4 h-4 accent-blue-600" />
                Uppercase
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={!noBraces} onChange={e => setNoBraces(!e.target.checked)} className="rounded w-4 h-4 accent-blue-600" />
                Add curly braces {'{ }'}
              </label>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate {count} UUID{count > 1 ? 's' : ''}
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• UUIDs are ideal as primary keys in distributed systems where auto-increment would conflict.</li>
              <li>• Use lowercase (default) for database IDs; uppercase for Windows GUID compatibility.</li>
              <li>• curly-brace format <code className="bg-blue-100 px-1 rounded text-xs">{'{uuid}'}</code> is expected by some Windows/COM APIs.</li>
              <li>• Generate in bulk and paste directly into a SQL script or fixture file.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Generated UUIDs</h2>
              <button onClick={copyAll} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                {copiedAll ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied All</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
              </button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {uuids.map((uuid, i) => (
                <div key={uuid + i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 hover:border-blue-200 transition-all group">
                  <code className="flex-1 text-xs font-mono text-gray-700 select-all">{format(uuid)}</code>
                  <button onClick={() => copyOne(uuid, i)} className="shrink-0 text-gray-300 hover:text-blue-600 group-hover:text-gray-400 transition-colors">
                    {copiedOne === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Hash Generator', href: '/hash-generator' }, { label: 'Password Generator', href: '/password-generator' }, { label: 'Base64 Encoder', href: '/base64' }, { label: 'JSON Formatter', href: '/json-formatter' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_uuid', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
