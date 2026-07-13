import React, { useState } from 'react';
import { Filter, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What counts as a duplicate?', a: 'Lines that are exactly the same (after optional trimming) are treated as duplicates. Only the first occurrence is kept.' },
  { q: 'Can I make it case-insensitive?', a: 'Yes — enable "Case-insensitive" to treat "Apple" and "apple" as duplicates.' },
  { q: 'Is whitespace ignored?', a: 'Enable "Trim whitespace" to ignore leading/trailing spaces when comparing lines.' },
  { q: 'Can I sort the result?', a: 'Yes — enable "Sort result" to alphabetically sort the de-duplicated lines.' },
];

export default function RemoveDuplicates() {
  const [text, setText] = useState('');
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [trim, setTrim] = useState(true);
  const [sort, setSort] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const process = () => {
    let lines = text.split('\n');
    if (removeEmpty) lines = lines.filter(l => l.trim() !== '');
    const seen = new Set<string>();
    const unique = lines.filter(line => {
      const key = (trim ? line.trim() : line);
      const cmp = caseInsensitive ? key.toLowerCase() : key;
      if (seen.has(cmp)) return false;
      seen.add(cmp);
      return true;
    });
    if (sort) unique.sort((a, b) => (trim ? a.trim() : a).localeCompare(trim ? b.trim() : b, undefined, { sensitivity: caseInsensitive ? 'base' : 'variant' }));
    return unique;
  };

  const lines = text.split('\n');
  const result = process();
  const dupes = lines.length - result.length;
  const output = result.join('\n');

  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const taCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none leading-relaxed';

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Filter className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Remove Duplicate Lines</h1><p className="text-blue-200 text-sm">De-duplicate · sort · trim · case options · instant</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Paste any list or text and instantly remove duplicate lines with flexible comparison options.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-bold text-gray-900 text-sm">Options</h2>
            {[
              { label: 'Case-insensitive comparison', val: caseInsensitive, set: setCaseInsensitive },
              { label: 'Trim whitespace', val: trim, set: setTrim },
              { label: 'Sort result A→Z', val: sort, set: setSort },
              { label: 'Remove empty lines', val: removeEmpty, set: setRemoveEmpty },
            ].map(({ label, val, set }) => (
              <label key={label} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} className="rounded w-4 h-4 accent-blue-600" />
                {label}
              </label>
            ))}
          </div>
          {text && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
              {[
                { label: 'Total lines', value: lines.length },
                { label: 'Unique lines', value: result.length, color: 'text-emerald-600' },
                { label: 'Duplicates removed', value: dupes, color: 'text-red-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className={`font-bold ${color || 'text-gray-900'}`}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Input (one item per line)</label>
            <textarea className={taCls} rows={9} value={text} onChange={e => setText(e.target.value)} placeholder={"apple\nbanana\napple\ncherry\nbanana"} />
          </div>
          {text && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-500">Result — {result.length} unique lines</label>
                <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <textarea className={taCls + ' bg-emerald-50 border-emerald-200'} rows={9} value={output} readOnly />
            </div>
          )}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Perfect for cleaning up email lists, keyword lists, or CSV columns.</li>
              <li>• Enable "Sort result" to get an alphabetical unique list in one step.</li>
              <li>• Use "Case-insensitive" when source data mixes capitalisation.</li>
              <li>• Paste from Excel or Google Sheets — each row becomes a line.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Text Sorter', href: '/text-sorter' }, { label: 'Find & Replace', href: '/find-replace' }, { label: 'Text Case Converter', href: '/text-case-converter' }, { label: 'Word Counter', href: '/word-counter' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_dedup', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
