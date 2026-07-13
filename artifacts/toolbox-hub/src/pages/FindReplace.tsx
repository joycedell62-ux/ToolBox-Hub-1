import React, { useState } from 'react';
import { Search, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Does this support regex?', a: 'Yes — enable "Regex" mode to use full JavaScript regular expressions as your search pattern.' },
  { q: 'Is the search case-sensitive?', a: 'You can toggle case sensitivity. By default it is case-insensitive.' },
  { q: 'Is my text stored anywhere?', a: 'No — all processing happens in your browser. Nothing is sent to any server.' },
  { q: 'Can I undo a replacement?', a: 'Use the "Reset" button to restore your original text.' },
];

export default function FindReplace() {
  const [text, setText] = useState('');
  const [original, setOriginal] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [result, setResult] = useState('');
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const doReplace = () => {
    if (!text) return;
    setError('');
    try {
      let pattern: RegExp;
      const flags = caseSensitive ? 'g' : 'gi';
      if (useRegex) {
        pattern = new RegExp(find, flags);
      } else {
        pattern = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      }
      const matches = text.match(pattern);
      const c = matches ? matches.length : 0;
      setCount(c);
      setResult(text.replace(pattern, replace));
      setOriginal(text);
    } catch (e: unknown) {
      setError('Invalid regex: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const copy = async () => { await navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const reset = () => { setText(original); setResult(''); setCount(null); };

  const taCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none leading-relaxed';
  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm font-mono';

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Search className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Find & Replace</h1><p className="text-blue-200 text-sm">Replace text · case options · regex support · instant</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Find and replace words or patterns in any text — with optional regex and case-sensitivity controls.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Find</label><input className={inputCls} placeholder="Search text or pattern…" value={find} onChange={e => setFind(e.target.value)} /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Replace with</label><input className={inputCls} placeholder="Replacement text…" value={replace} onChange={e => setReplace(e.target.value)} /></div>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={caseSensitive} onChange={e => setCaseSensitive(e.target.checked)} className="rounded" />
                Case-sensitive
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={useRegex} onChange={e => setUseRegex(e.target.checked)} className="rounded" />
                Regex
              </label>
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <button onClick={doReplace} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-sm">Replace All</button>
            {result && <button onClick={reset} className="w-full py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">Reset</button>}
          </div>
          {count !== null && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
              <div className="text-2xl font-extrabold text-emerald-700">{count}</div>
              <div className="text-sm text-emerald-600">{count === 1 ? 'match replaced' : 'matches replaced'}</div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Input Text</label>
            <textarea className={taCls} rows={8} value={text} onChange={e => setText(e.target.value)} placeholder="Paste your text here…" />
          </div>
          {result && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-500">Result</label>
                <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <textarea className={taCls + ' bg-emerald-50 border-emerald-200'} rows={8} value={result} readOnly />
            </div>
          )}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Use regex <code className="bg-blue-100 px-1 rounded">\b</code> word boundaries to match whole words only.</li>
              <li>• Leave the "Replace with" field empty to simply delete all occurrences.</li>
              <li>• Regex capture groups: use <code className="bg-blue-100 px-1 rounded">$1</code>, <code className="bg-blue-100 px-1 rounded">$2</code> in the replacement to reuse matched groups.</li>
              <li>• Toggle off regex mode for plain text search to avoid escaping special characters.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Text Case Converter', href: '/text-case-converter' }, { label: 'Remove Duplicates', href: '/remove-duplicates' }, { label: 'Text Sorter', href: '/text-sorter' }, { label: 'Word Counter', href: '/word-counter' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_findreplace', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
