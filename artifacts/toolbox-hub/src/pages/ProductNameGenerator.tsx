import React, { useState } from 'react';
import { Tag, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'How are the names generated?', a: 'Every name is assembled offline from curated word banks (prefixes, suffixes, roots, adjectives) blended with your keywords. No network calls — it all runs in your browser.' },
  { q: 'Are these names trademark-safe?', a: 'No. These are creative starting points. Always run a trademark and domain-availability search before committing to any name.' },
  { q: 'What does each style do?', a: 'Blends fuse your keywords with roots, Suffixes attach modern endings like -ly or -ify, Alliteration pairs same-letter words, and Compound joins two evocative words.' },
  { q: 'Can I regenerate for more ideas?', a: 'Yes — hit Generate again for a fresh batch. Combine several batches, then shortlist your favorites.' },
  { q: 'Does it save my inputs?', a: 'Your feedback vote is stored locally. Nothing is uploaded — the tool is fully offline.' },
];

const PREFIXES = ['Neo', 'Uni', 'Omni', 'Meta', 'Hyper', 'Prime', 'Aero', 'Lumo', 'Vivo', 'Nexo', 'Zen', 'Evo', 'Flux', 'Nova', 'Astra', 'Cova', 'Duro', 'Ecko', 'Fyra', 'Glo'];
const SUFFIXES = ['ly', 'ify', 'io', 'ora', 'ora', 'hub', 'lab', 'ify', 'ora', 'wise', 'edge', 'peak', 'flow', 'wave', 'spark', 'boost', 'craft', 'works', 'space', 'verse', 'nest', 'kit', 'go', 'able'];
const ROOTS = ['bright', 'swift', 'clear', 'true', 'core', 'pulse', 'mint', 'bloom', 'orbit', 'ember', 'drift', 'north', 'crest', 'grove', 'quill', 'ridge', 'sage', 'tidal', 'zeal', 'atlas'];
const ADJECTIVES = ['Bold', 'Bright', 'Clever', 'Fresh', 'Golden', 'Happy', 'Keen', 'Lively', 'Mighty', 'Noble', 'Prime', 'Quick', 'Radiant', 'Sharp', 'True', 'Vivid', 'Warm', 'Zesty', 'Crisp', 'Pure'];
const NOUNS = ['Fox', 'Owl', 'Peak', 'Harbor', 'Compass', 'Anchor', 'Beacon', 'Forge', 'Meadow', 'River', 'Summit', 'Willow', 'Falcon', 'Cedar', 'Aurora', 'Lantern', 'Voyage', 'Trail', 'Haven', 'Maple'];

const CATEGORIES = ['App / SaaS', 'Fashion', 'Food & Drink', 'Beauty', 'Tech Gadget', 'Coffee Shop', 'Consulting', 'Fitness', 'Toy / Game', 'Home & Decor'];
const STYLES = ['Blend', 'Suffix', 'Alliteration', 'Compound', 'Mixed'] as const;
type Style = typeof STYLES[number];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function buildName(style: Style, keywords: string[]): string {
  const kw = keywords.length ? cap(pick(keywords).replace(/[^a-zA-Z]/g, '')) : cap(pick(ROOTS));
  const s: Style = style === 'Mixed' ? (pick(['Blend', 'Suffix', 'Alliteration', 'Compound']) as Style) : style;
  switch (s) {
    case 'Blend': {
      const root = cap(pick(ROOTS));
      return Math.random() > 0.5 ? kw + root.toLowerCase() : pick(PREFIXES) + kw.toLowerCase();
    }
    case 'Suffix':
      return kw + pick(SUFFIXES);
    case 'Alliteration': {
      const letter = kw.charAt(0).toLowerCase();
      const adj = ADJECTIVES.filter(a => a.toLowerCase().startsWith(letter));
      const nouns = NOUNS.filter(n => n.toLowerCase().startsWith(letter));
      const a = adj.length ? pick(adj) : cap(pick(ADJECTIVES));
      const n = nouns.length ? pick(nouns) : kw;
      return `${a} ${n}`;
    }
    case 'Compound':
    default:
      return `${cap(pick(ADJECTIVES))}${pick(NOUNS)}`;
  }
}

export default function ProductNameGenerator() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [keywords, setKeywords] = useState('');
  const [style, setStyle] = useState<Style>('Mixed');
  const [count, setCount] = useState(12);
  const [names, setNames] = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedOne, setCopiedOne] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => {
    const kws = keywords.split(/[,\s]+/).map(k => k.trim()).filter(Boolean);
    const set = new Set<string>();
    let guard = 0;
    while (set.size < count && guard < count * 20) {
      set.add(buildName(style, kws));
      guard++;
    }
    setNames(Array.from(set));
  };

  React.useEffect(() => { generate(); /* eslint-disable-next-line */ }, []);

  const copyOne = async (name: string, i: number) => { await navigator.clipboard.writeText(name); setCopiedOne(i); setTimeout(() => setCopiedOne(null), 2000); };
  const copyAll = async () => { await navigator.clipboard.writeText(names.join('\n')); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Tag className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Product Name Generator</h1><p className="text-blue-200 text-sm">category + keywords + style · blends · suffixes · alliteration</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Brainstorm memorable product and brand names from curated word banks. Pick a style, add keywords, and generate dozens of ideas — all offline in your browser.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="pn-cat" className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
              <select id="pn-cat" value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="pn-kw" className="block text-xs font-semibold text-gray-500 mb-1">Keywords (comma separated)</label>
              <input id="pn-kw" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. cloud, fast, secure" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label htmlFor="pn-style" className="block text-xs font-semibold text-gray-500 mb-1">Style</label>
              <select id="pn-style" value={style} onChange={e => setStyle(e.target.value as Style)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">How many? ({count})</label>
              <input type="range" min="4" max="30" value={count} onChange={e => setCount(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>4</span><span>30</span></div>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Names
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Shortlist names you can pronounce and spell after hearing them once.</li>
              <li>• Check the <code className="bg-blue-100 px-1 rounded text-xs">.com</code> domain and social handles before deciding.</li>
              <li>• Add 2–3 keywords for names that hint at what you actually do.</li>
              <li>• Say each name out loud — the best ones are easy to say and remember.</li>
              <li>• Run a trademark search for your industry class before you commit.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Name Ideas</h2>
              <button onClick={copyAll} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                {copiedAll ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied All</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
              </button>
            </div>
            {names.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">Click Generate to see name ideas.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto">
                {names.map((name, i) => (
                  <div key={name + i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 hover:border-blue-200 transition-all group">
                    <span className="flex-1 text-sm font-semibold text-gray-800 select-all">{name}</span>
                    <button onClick={() => copyOne(name, i)} aria-label={`Copy ${name}`} className="shrink-0 text-gray-300 hover:text-blue-600 group-hover:text-gray-400 transition-colors">
                      {copiedOne === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Ad Copy Generator', href: '/ad-copy-generator' }, { label: 'Product Description', href: '/product-description-generator' }, { label: 'CTA Generator', href: '/cta-generator' }, { label: 'Email Subject Lines', href: '/email-subject-line-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_product-name', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
