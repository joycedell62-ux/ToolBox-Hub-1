import React, { useState } from 'react';
import { PackageOpen, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'How does it turn features into benefits?', a: 'Each feature you enter is paired with a benefit phrase from a curated bank, so the copy tells shoppers what the feature does for them — not just what it is.' },
  { q: 'Can I control the length and tone?', a: 'Yes. Pick a tone and length; the intro paragraph and bullet phrasing adjust to match, from short and punchy to detailed and descriptive.' },
  { q: 'Is this ready for my store?', a: 'It\'s a strong first draft. Fact-check every claim, add real specs and dimensions, and adjust the voice to fit your brand before publishing.' },
  { q: 'Where should I use this?', a: 'Product detail pages, marketplace listings, catalogs, and ad landing pages. The bullet benefits work great as a scannable highlights block.' },
  { q: 'Does it run offline?', a: 'Yes. All copy is assembled locally from offline template banks. Nothing is uploaded.' },
];

const TONES = ['Friendly', 'Professional', 'Luxury', 'Playful', 'Minimal'] as const;
type Tone = typeof TONES[number];
const LENGTHS = ['Short', 'Medium', 'Long'] as const;
type Length = typeof LENGTHS[number];

const INTROS: Record<Tone, string[]> = {
  Friendly: ['Say hello to {P} — the easy little upgrade your {A} will love.', 'Meet {P}, made to fit right into everyday life for {A}.', '{P} is here to make things simpler, better, and a whole lot nicer.'],
  Professional: ['{P} is engineered to deliver dependable performance for {A}.', 'Built to a higher standard, {P} gives {A} results they can count on.', 'Designed for {A}, {P} combines quality and function in one package.'],
  Luxury: ['Introducing {P} — crafted for {A} who appreciate the finer details.', '{P} is where refined design meets everyday indulgence.', 'Elevate the ordinary. {P} is made for discerning {A}.'],
  Playful: ['Ta-da! {P} is the fun little something your {A} didn\'t know they needed.', '{P}: proof that great things come in delightful packages.', 'Warning — {P} may cause spontaneous joy among {A}.'],
  Minimal: ['{P}. Simple. Considered. Made for {A}.', 'Everything you need, nothing you don\'t. That\'s {P}.', '{P} — clean design, honest quality, for {A}.'],
};

const BENEFIT_BANK = [
  'so you get more done with less effort', 'giving you peace of mind every day', 'that saves you time you didn\'t know you had',
  'built to last through years of use', 'making everyday tasks feel effortless', 'so you can focus on what matters',
  'designed to fit seamlessly into your routine', 'delivering consistent results you can trust', 'for comfort you\'ll notice from day one',
  'so quality is never in question', 'keeping things simple and stress-free', 'crafted with care in every detail',
];

const CLOSERS: Record<Tone, string> = {
  Friendly: 'Go ahead — you deserve it.',
  Professional: 'A smart choice you can rely on.',
  Luxury: 'Because you deserve nothing less.',
  Playful: 'Add to cart and thank us later.',
  Minimal: 'Simply better.',
};

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;

export default function ProductDescriptionGenerator() {
  const [product, setProduct] = useState('Bamboo Travel Mug');
  const [features, setFeatures] = useState('leak-proof lid\ndouble-wall insulation\nsustainable bamboo shell');
  const [audience, setAudience] = useState('busy commuters');
  const [tone, setTone] = useState<Tone>('Friendly');
  const [length, setLength] = useState<Length>('Medium');
  const [result, setResult] = useState<{ intro: string; bullets: string[]; closer: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => {
    const P = product.trim() || 'this product';
    const A = audience.trim() || 'you';
    const feats = features.split('\n').map(f => f.trim()).filter(Boolean);
    let intro = pick(INTROS[tone]).replace(/\{P\}/g, P).replace(/\{A\}/g, A);
    if (length === 'Long') intro += ' ' + pick(INTROS[tone]).replace(/\{P\}/g, 'It').replace(/\{A\}/g, A);
    const benefitPool = [...BENEFIT_BANK];
    const bullets = (feats.length ? feats : ['premium build', 'thoughtful design', 'everyday value']).map(f => {
      if (benefitPool.length === 0) benefitPool.push(...BENEFIT_BANK);
      const b = pick(benefitPool);
      benefitPool.splice(benefitPool.indexOf(b), 1);
      const cap = f.charAt(0).toUpperCase() + f.slice(1);
      return length === 'Short' ? cap : `${cap} — ${b}`;
    });
    setResult({ intro, bullets, closer: CLOSERS[tone] });
  };

  React.useEffect(() => { generate(); /* eslint-disable-next-line */ }, []);

  const asText = () => {
    if (!result) return '';
    let t = `${product}\n\n${result.intro}\n\nKey benefits:\n`;
    result.bullets.forEach(b => { t += `• ${b}\n`; });
    if (length !== 'Short') t += `\n${result.closer}`;
    return t;
  };

  const copyAll = async () => { await navigator.clipboard.writeText(asText()); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><PackageOpen className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Product Description Generator</h1><p className="text-blue-200 text-sm">product + features + audience + tone · intro + benefit bullets</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Turn a list of features into polished, benefit-driven product copy. Get a ready-to-edit intro paragraph plus scannable bullet benefits.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="pd-product" className="block text-xs font-semibold text-gray-500 mb-1">Product name</label>
              <input id="pd-product" value={product} onChange={e => setProduct(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label htmlFor="pd-feats" className="block text-xs font-semibold text-gray-500 mb-1">Features (one per line)</label>
              <textarea id="pd-feats" value={features} onChange={e => setFeatures(e.target.value)} rows={4} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-y" />
            </div>
            <div>
              <label htmlFor="pd-aud" className="block text-xs font-semibold text-gray-500 mb-1">Target audience</label>
              <input id="pd-aud" value={audience} onChange={e => setAudience(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pd-tone" className="block text-xs font-semibold text-gray-500 mb-1">Tone</label>
                <select id="pd-tone" value={tone} onChange={e => setTone(e.target.value as Tone)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                  {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="pd-len" className="block text-xs font-semibold text-gray-500 mb-1">Length</label>
                <select id="pd-len" value={length} onChange={e => setLength(e.target.value as Length)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                  {LENGTHS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Description
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• List concrete features — the more specific, the better the benefits.</li>
              <li>• Lead with the benefit shoppers care about most.</li>
              <li>• Keep bullets scannable; most people skim before they read.</li>
              <li>• Add real specs (size, material, weight) after generating.</li>
              <li>• Match the tone to where you'll sell — marketplace vs. own store.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Product Description</h2>
              <button onClick={copyAll} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
              </button>
            </div>
            {!result ? (
              <p className="text-sm text-gray-400 py-8 text-center">Click Generate to write a description.</p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-700 leading-relaxed">{result.intro}</p>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-blue-600 mb-2">Key benefits</h3>
                  <ul className="space-y-1.5">
                    {result.bullets.map((b, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-blue-600">✓</span> {b}</li>)}
                  </ul>
                </div>
                {length !== 'Short' && <p className="text-sm font-semibold text-gray-800">{result.closer}</p>}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Product Name', href: '/product-name-generator' }, { label: 'Ad Copy Generator', href: '/ad-copy-generator' }, { label: 'CTA Generator', href: '/cta-generator' }, { label: 'Email Subject Lines', href: '/email-subject-line-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_product-description', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
