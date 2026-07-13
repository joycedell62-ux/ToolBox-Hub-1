import React, { useState } from 'react';
import { Link2, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What is URL encoding?', a: 'Percent-encoding converts characters that are not allowed in URLs into %XX sequences where XX is the hexadecimal ASCII value.' },
  { q: 'What is the difference between full and component encoding?', a: '"Component" mode encodes everything including /, ?, &, and = — use when encoding a single query value. "Full" preserves URL structure characters.' },
  { q: 'When do I need URL encoding?', a: 'Whenever you include user-supplied text, spaces, or special characters in a URL — for example, building query strings in code.' },
  { q: 'Is this the same as HTML encoding?', a: 'No — HTML encoding converts < to &lt;, etc. URL encoding converts characters to %XX percent sequences.' },
];

export default function UrlEncoder() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encType, setEncType] = useState<'component' | 'full'>('component');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const process = () => {
    setError('');
    if (!input) return '';
    try {
      if (mode === 'encode') {
        return encType === 'component' ? encodeURIComponent(input) : encodeURI(input);
      } else {
        return encType === 'component' ? decodeURIComponent(input) : decodeURI(input);
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
          <div className="bg-white/20 p-2.5 rounded-xl"><Link2 className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">URL Encoder / Decoder</h1><p className="text-blue-200 text-sm">Percent-encode · decode · full URL or component mode</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Encode and decode URL strings — choose between full URL and component (query parameter) modes.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex gap-2">
              {(['encode', 'decode'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{m}</button>
              ))}
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">Mode</div>
              {[
                { val: 'component', label: 'Component', desc: 'Encodes /, ?, &, = too — use for single values' },
                { val: 'full', label: 'Full URL', desc: 'Preserves URL structure characters' },
              ].map(({ val, label, desc }) => (
                <label key={val} className="flex items-start gap-2 cursor-pointer mb-2">
                  <input type="radio" name="encType" value={val} checked={encType === val} onChange={() => setEncType(val as typeof encType)} className="mt-0.5 accent-blue-600" />
                  <div><div className="text-sm font-semibold text-gray-800">{label}</div><div className="text-xs text-gray-400">{desc}</div></div>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Use "Component" mode when encoding a single query parameter value like a search term.</li>
              <li>• Spaces become <code className="bg-blue-100 px-1 rounded">%20</code> or <code className="bg-blue-100 px-1 rounded">+</code> depending on context.</li>
              <li>• Always encode user input before appending to query strings to prevent injection.</li>
              <li>• Browser address bars auto-encode many characters — but code doesn't do this automatically.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{mode === 'encode' ? 'Plain Text / URL Input' : 'Encoded URL Input'}</label>
            <textarea className={taCls} rows={6} value={input} onChange={e => setInput(e.target.value)} placeholder={mode === 'encode' ? 'https://example.com/search?q=hello world&lang=en' : 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world'} />
          </div>
          {error && <div className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</div>}
          {output && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-500">{mode === 'encode' ? 'Encoded Output' : 'Decoded Output'}</label>
                <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">{copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}</button>
              </div>
              <textarea className={taCls + ' bg-gray-900 text-green-300 border-gray-700'} rows={6} value={output} readOnly />
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Base64 Encoder', href: '/base64' }, { label: 'JSON Formatter', href: '/json-formatter' }, { label: 'Hash Generator', href: '/hash-generator' }, { label: 'UUID Generator', href: '/uuid-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_urlenc', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
