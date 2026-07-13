import React, { useState } from 'react';
import { ArrowUpDown, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, Shuffle } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What sorting options are available?', a: 'A→Z (alphabetical), Z→A (reverse), by length (shortest/longest first), and random shuffle.' },
  { q: 'Is it case-sensitive?', a: 'Toggle "Case-insensitive" to sort ignoring capitalisation differences.' },
  { q: 'Can I sort numbers correctly?', a: 'Enable "Numeric sort" to sort numbers by value rather than alphabetically (so 10 comes after 9, not after 1).' },
  { q: 'Can I reverse the order without sorting?', a: 'Yes — choose Z→A mode on an unsorted list to simply reverse the existing order.' },
];

type SortMode = 'az' | 'za' | 'shortest' | 'longest' | 'random';

export default function TextSorter() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<SortMode>('az');
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [numeric, setNumeric] = useState(false);
  const [copied, setCopied] = useState(false);
  const [seed, setSeed] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const process = () => {
    let lines = text.split('\n');
    if (trimLines) lines = lines.map(l => l.trim());
    if (removeEmpty) lines = lines.filter(l => l !== '');
    const cmp = (a: string, b: string) => {
      const ka = caseInsensitive ? a.toLowerCase() : a;
      const kb = caseInsensitive ? b.toLowerCase() : b;
      if (numeric) {
        const na = parseFloat(ka), nb = parseFloat(kb);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
      }
      return ka.localeCompare(kb);
    };
    switch (mode) {
      case 'az': return [...lines].sort(cmp);
      case 'za': return [...lines].sort((a, b) => -cmp(a, b));
      case 'shortest': return [...lines].sort((a, b) => a.length - b.length || cmp(a, b));
      case 'longest': return [...lines].sort((a, b) => b.length - a.length || cmp(a, b));
      case 'random': { const arr = [...lines]; for (let i = arr.length - 1; i > 0; i--) { const j = (seed * 1664525 + 1013904223 + i) % (i + 1); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
    }
  };

  const output = text ? process().join('\n') : '';
  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const taCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none leading-relaxed';
  const modes: { val: SortMode; label: string }[] = [
    { val: 'az', label: 'A → Z' }, { val: 'za', label: 'Z → A' },
    { val: 'shortest', label: 'Shortest' }, { val: 'longest', label: 'Longest' }, { val: 'random', label: '🎲 Random' },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><ArrowUpDown className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Text Sorter</h1><p className="text-blue-200 text-sm">A→Z · Z→A · by length · random shuffle · instant</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Sort any list of lines alphabetically, by length, or randomly — with case and numeric options.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-bold text-gray-900 text-sm">Sort Mode</h2>
            <div className="flex flex-wrap gap-2">
              {modes.map(({ val, label }) => (
                <button key={val} onClick={() => setMode(val)} className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${mode === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{label}</button>
              ))}
            </div>
            <div className="space-y-2 pt-1">
              {[
                { label: 'Case-insensitive', val: caseInsensitive, set: setCaseInsensitive },
                { label: 'Trim whitespace', val: trimLines, set: setTrimLines },
                { label: 'Remove empty lines', val: removeEmpty, set: setRemoveEmpty },
                { label: 'Numeric sort', val: numeric, set: setNumeric },
              ].map(({ label, val, set }) => (
                <label key={label} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} className="rounded w-4 h-4 accent-blue-600" />
                  {label}
                </label>
              ))}
            </div>
            {mode === 'random' && (
              <button onClick={() => setSeed(s => s + 1)} className="w-full py-2 text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors flex items-center justify-center gap-2">
                <Shuffle className="w-4 h-4" /> Reshuffle
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Input (one item per line)</label>
            <textarea className={taCls} rows={8} value={text} onChange={e => setText(e.target.value)} placeholder={"Zebra\nApple\nMango\nBanana\nCherry"} />
          </div>
          {output && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-500">Sorted Result</label>
                <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <textarea className={taCls + ' bg-blue-50 border-blue-200'} rows={8} value={output} readOnly />
            </div>
          )}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Sort CSV columns by pasting one column at a time (one value per line).</li>
              <li>• Use "Numeric sort" for lists containing numbers like prices or quantities.</li>
              <li>• "By length" is great for sorting words in a wordlist from short to long.</li>
              <li>• Random shuffle is perfect for randomising raffle entries or team assignments.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Remove Duplicates', href: '/remove-duplicates' }, { label: 'Find & Replace', href: '/find-replace' }, { label: 'Text Case Converter', href: '/text-case-converter' }, { label: 'Word Counter', href: '/word-counter' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_sorter', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
