import React, { useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What styles of brand names does this create?', a: 'It builds modern names using portmanteaus (blended words), dropped vowels, and trendy suffixes like -ly, -ify, and -io — the patterns behind many startup names.' },
  { q: 'Does the ".com idea" mean the domain is available?', a: 'No. The ".com idea" label is only a suggestion of how the name might look as a domain. Availability is NOT checked or claimed — you must verify it with a registrar yourself.' },
  { q: 'Do I need to enter keywords?', a: 'Keywords make names more relevant, but the generator ships with a large built-in word bank, so it works without any input.' },
  { q: 'Are these names trademark-free?', a: 'The tool cannot check trademarks. Always run a trademark and business-name search before adopting any name commercially.' },
  { q: 'Why are the results different each time?', a: 'Names are assembled from randomized word pairs and suffix patterns, so each Generate press produces a fresh batch.' },
];

const RELATED = [
  { label: 'Business Name Generator', href: '/business-name-generator' },
  { label: 'Slogan Generator', href: '/slogan-generator' },
  { label: 'Username Generator', href: '/username-generator' },
  { label: 'Mission Statement Generator', href: '/mission-statement-generator' },
];

const ROOTS = [
  'spark', 'flux', 'nova', 'lumen', 'pulse', 'orbit', 'zen', 'echo', 'vera', 'lyra',
  'aero', 'volt', 'pixel', 'byte', 'core', 'wave', 'drift', 'bloom', 'glow', 'peak',
  'sol', 'luna', 'nimbus', 'zephyr', 'ember', 'crest', 'vibe', 'motia', 'quill', 'flare',
  'brisk', 'clarity', 'motif', 'haven', 'summit', 'atlas', 'delta', 'vertex', 'prism', 'halo',
  'craft', 'forge', 'gleam', 'kite', 'loop', 'mint', 'nook', 'opal', 'quest', 'rove',
  'sable', 'tide', 'unity', 'verve', 'zeal', 'onyx', 'jade', 'aura', 'lush', 'nexus',
];

const MODIFIERS = [
  'get', 'go', 'my', 'try', 'use', 'up', 'on', 'in', 'the', 'we',
  'able', 'super', 'hyper', 'meta', 'neo', 'omni', 'pro', 'true', 'well', 'bright',
];

const SUFFIXES = ['ly', 'ify', 'io', 'ai', 'r', 'io', 'ly', 'sy', 'zy', 'ora', 'ify', 'io'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function dropVowels(s: string): string {
  // drop internal vowels but keep first char and any leading vowel
  const chars = s.split('');
  let out = chars[0];
  for (let i = 1; i < chars.length; i++) {
    if (!'aeiou'.includes(chars[i]) || i === chars.length - 1) out += chars[i];
  }
  return out.length >= 3 ? out : s;
}

function normalizeRoots(keywords: string): string[] {
  const kw = keywords
    .toLowerCase()
    .split(/[\s,]+/)
    .map(w => w.replace(/[^a-z]/g, ''))
    .filter(w => w.length >= 2);
  return kw.length ? [...kw, ...kw, ...ROOTS] : ROOTS;
}

function generateBrands(keywords: string): { name: string; domain: string }[] {
  const roots = normalizeRoots(keywords);
  const results = new Map<string, string>();
  let guard = 0;
  while (results.size < 12 && guard < 500) {
    guard++;
    const pattern = Math.floor(Math.random() * 5);
    let name = '';
    switch (pattern) {
      case 0: name = cap(pick(roots) + pick(SUFFIXES)); break; // suffix style
      case 1: name = cap(pick(MODIFIERS) + pick(roots)); break; // modifier prefix
      case 2: { // portmanteau
        const a = pick(roots);
        const b = pick(roots);
        name = cap(a.slice(0, Math.ceil(a.length / 2)) + b.slice(Math.floor(b.length / 2)));
        break;
      }
      case 3: name = cap(dropVowels(pick(roots)) + (Math.random() > 0.5 ? pick(SUFFIXES) : '')); break; // dropped vowels
      case 4: name = cap(pick(roots)) + cap(pick(roots)); break; // compound
    }
    name = name.replace(/[^A-Za-z]/g, '');
    if (name.length >= 4 && name.length <= 14 && !results.has(name)) {
      results.set(name, name.toLowerCase() + '.com');
    }
  }
  return Array.from(results.entries()).map(([name, domain]) => ({ name, domain }));
}

export default function BrandNameGenerator() {
  const [keywords, setKeywords] = useState('');
  const [brands, setBrands] = useState(() => generateBrands(''));
  const [copiedOne, setCopiedOne] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => setBrands(generateBrands(keywords));

  const copyOne = async (name: string, i: number) => {
    await navigator.clipboard.writeText(name);
    setCopiedOne(i);
    setTimeout(() => setCopiedOne(null), 2000);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Sparkles className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Brand Name Generator</h1><p className="text-blue-200 text-sm">portmanteaus · dropped vowels · -ly / -ify / -io · 12 ideas</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Generate modern, startup-style brand names with blended words, trimmed vowels, and trendy suffixes. Add optional keywords and regenerate endlessly — everything runs offline in your browser.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="keywords" className="block text-xs font-semibold text-gray-500 mb-1">Keywords (optional)</label>
              <input id="keywords" type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. cloud, fast, learn" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-gray-400 mt-1">Separate multiple keywords with spaces or commas.</p>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Brand Names
            </button>
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-amber-800">The ".com idea" labels are suggestions only. Domain, trademark, and business-name availability are <strong>not checked or claimed</strong> — verify before use.</p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Short, punchy names (5-9 letters) are easier to say and remember.</li>
              <li>• Suffixes like <code className="bg-blue-100 px-1 rounded text-xs">-ly</code> and <code className="bg-blue-100 px-1 rounded text-xs">-ify</code> read as modern and tech-friendly.</li>
              <li>• Avoid awkward letter clusters — if it is hard to pronounce, skip it.</li>
              <li>• Check social handle availability, not just domains, for a consistent brand.</li>
              <li>• Always run a trademark search before committing to a name.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Brand Ideas</h2>
              <span className="text-xs text-gray-400">{brands.length} ideas</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {brands.map((b, i) => (
                <div key={b.name + i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 hover:border-blue-200 transition-all group">
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-gray-800 truncate">{b.name}</span>
                    <span className="block text-xs text-gray-400 truncate">{b.domain} idea</span>
                  </div>
                  <button onClick={() => copyOne(b.name, i)} aria-label={`Copy ${b.name}`} className="shrink-0 text-gray-300 hover:text-blue-600 group-hover:text-gray-400 transition-colors">
                    {copiedOne === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {RELATED.map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_brand-name-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
