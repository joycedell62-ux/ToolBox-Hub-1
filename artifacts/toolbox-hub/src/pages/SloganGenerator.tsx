import React, { useState } from 'react';
import { Megaphone, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'How are slogans generated?', a: 'Your brand name and industry are dropped into curated slogan templates chosen to match your selected tone, then randomly shuffled so each round feels fresh.' },
  { q: 'Do I need to enter an industry?', a: 'An industry helps templates pick relevant themes, but slogans still work with just a brand name.' },
  { q: 'Can I use a slogan commercially?', a: 'The phrasing is generic, but you should confirm a slogan is not already trademarked before using it publicly.' },
  { q: 'What does the tone setting do?', a: 'It steers which template set is used — bold, friendly, professional, playful, or luxury — so the voice matches your brand.' },
  { q: 'Why do results change each time?', a: 'The generator samples randomly from dozens of templates and phrase fragments, so pressing Generate reshuffles them.' },
];

const RELATED = [
  { label: 'Business Name Generator', href: '/business-name-generator' },
  { label: 'Brand Name Generator', href: '/brand-name-generator' },
  { label: 'Mission Statement Generator', href: '/mission-statement-generator' },
  { label: 'Username Generator', href: '/username-generator' },
];

const INDUSTRY_WORDS: Record<string, string[]> = {
  general: ['quality', 'value', 'excellence', 'trust', 'results', 'experience', 'success', 'moments'],
  tech: ['innovation', 'the future', 'smart solutions', 'progress', 'technology', 'possibility', 'connection', 'speed'],
  food: ['flavor', 'freshness', 'every bite', 'taste', 'comfort', 'goodness', 'the table', 'craving'],
  fashion: ['style', 'confidence', 'your look', 'elegance', 'trends', 'self-expression', 'beauty', 'the runway'],
  health: ['wellness', 'vitality', 'a better you', 'balance', 'health', 'energy', 'care', 'strength'],
  finance: ['your future', 'security', 'growth', 'trust', 'wealth', 'peace of mind', 'smart money', 'stability'],
  fitness: ['strength', 'your goals', 'the grind', 'progress', 'energy', 'performance', 'power', 'results'],
  travel: ['adventure', 'the journey', 'new horizons', 'discovery', 'the world', 'escape', 'wanderlust', 'memories'],
};

const INDUSTRY_LABELS: { value: string; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'tech', label: 'Technology' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'finance', label: 'Finance' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'travel', label: 'Travel' },
];

type Tone = 'bold' | 'friendly' | 'professional' | 'playful' | 'luxury';

const TONE_LABELS: { value: Tone; label: string }[] = [
  { value: 'bold', label: 'Bold' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'playful', label: 'Playful' },
  { value: 'luxury', label: 'Luxury' },
];

// Templates use {b} = brand, {w} = industry word
const TEMPLATES: Record<Tone, string[]> = {
  bold: [
    '{b}. No limits.',
    'Own {w} with {b}.',
    '{b}: Built for {w}.',
    'Dare to lead — {b}.',
    '{b}. Nothing less.',
    'Break through with {b}.',
    '{b}: Where {w} begins.',
    'Rise above. Choose {b}.',
    '{b}. Made to win.',
    'Unleash {w}. {b}.',
    '{b}: Bold by design.',
    'Go all in with {b}.',
  ],
  friendly: [
    '{b} — {w} made simple.',
    'Your friend in {w}: {b}.',
    'Life is better with {b}.',
    '{b}. Here for you.',
    'Feel good with {b}.',
    '{b}: {w}, the easy way.',
    'Say hello to {b}.',
    'We bring {w} closer — {b}.',
    '{b}. Always by your side.',
    'Everyday {w}, with {b}.',
    '{b}: Small touches, big smiles.',
    'Together for {w}. {b}.',
  ],
  professional: [
    '{b}: Excellence in {w}.',
    'Trusted for {w}. {b}.',
    '{b} — {w} you can rely on.',
    'The standard in {w}: {b}.',
    '{b}. Proven results.',
    'Delivering {w}, every time — {b}.',
    '{b}: Committed to {w}.',
    'Precision meets {w}. {b}.',
    '{b} — expertise you deserve.',
    'Setting the bar for {w}: {b}.',
    '{b}. Quality without compromise.',
    'Your partner in {w} — {b}.',
  ],
  playful: [
    '{b}: {w} just got fun!',
    'Oops, you found {b}!',
    '{b} — because {w} rocks.',
    'Get your {w} on with {b}!',
    '{b}. Seriously good, not too serious.',
    'Wink, wink — it is {b}.',
    '{b}: {w} with a smile.',
    'Life is short. Enjoy {b}.',
    '{b} — the fun side of {w}.',
    'Warning: {b} is addictive.',
    '{b}. Let the good times roll.',
    'Say yes to {b}!',
  ],
  luxury: [
    '{b}. The art of {w}.',
    'Redefining {w}: {b}.',
    '{b} — {w}, elevated.',
    'Indulge in {w}. {b}.',
    '{b}: Crafted for the few.',
    'Where {w} meets perfection — {b}.',
    '{b}. Timeless by nature.',
    'The essence of {w}: {b}.',
    '{b} — luxury, effortlessly.',
    'Experience {w} in full. {b}.',
    '{b}: Beyond expectation.',
    'A world of {w}. {b}.',
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateSlogans(brand: string, industry: string, tone: Tone): string[] {
  const b = brand.trim() || 'Your Brand';
  const words = INDUSTRY_WORDS[industry] || INDUSTRY_WORDS.general;
  const templates = shuffle(TEMPLATES[tone]);
  const results = new Set<string>();
  let idx = 0;
  let guard = 0;
  while (results.size < 10 && guard < 200) {
    guard++;
    const t = templates[idx % templates.length];
    idx++;
    const s = t.replace(/\{b\}/g, b).replace(/\{w\}/g, pick(words));
    results.add(s);
  }
  return Array.from(results);
}

export default function SloganGenerator() {
  const [brand, setBrand] = useState('');
  const [industry, setIndustry] = useState('general');
  const [tone, setTone] = useState<Tone>('bold');
  const [slogans, setSlogans] = useState<string[]>(() => generateSlogans('Your Brand', 'general', 'bold'));
  const [copiedOne, setCopiedOne] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => setSlogans(generateSlogans(brand, industry, tone));

  const copyOne = async (s: string, i: number) => {
    await navigator.clipboard.writeText(s);
    setCopiedOne(i);
    setTimeout(() => setCopiedOne(null), 2000);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Megaphone className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Slogan Generator</h1><p className="text-blue-200 text-sm">brand + industry + tone · 10 slogans · copy each</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Craft catchy, memorable slogans in seconds. Enter your brand name, pick an industry and tone, and generate ten template-based taglines — regenerate any time for fresh ideas, fully offline.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="brand" className="block text-xs font-semibold text-gray-500 mb-1">Brand name</label>
              <input id="brand" type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Nova Coffee" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="industry" className="block text-xs font-semibold text-gray-500 mb-1">Industry</label>
              <select id="industry" value={industry} onChange={e => setIndustry(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {INDUSTRY_LABELS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="tone" className="block text-xs font-semibold text-gray-500 mb-1">Tone</label>
              <select id="tone" value={tone} onChange={e => setTone(e.target.value as Tone)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {TONE_LABELS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Slogans
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• The best slogans are short — aim for under 7 words.</li>
              <li>• Match the tone to your audience: playful for youth, professional for B2B.</li>
              <li>• Read it aloud; a good slogan has rhythm and rolls off the tongue.</li>
              <li>• Try each tone to hear your brand in a different voice.</li>
              <li>• Shortlist favorites, then test them with a few real customers.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Slogan Ideas</h2>
              <span className="text-xs text-gray-400">{slogans.length} ideas</span>
            </div>
            <div className="space-y-2 max-h-[440px] overflow-y-auto">
              {slogans.map((s, i) => (
                <div key={s + i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 hover:border-blue-200 transition-all group">
                  <span className="flex-1 text-sm font-medium text-gray-800">{s}</span>
                  <button onClick={() => copyOne(s, i)} aria-label={`Copy slogan ${i + 1}`} className="shrink-0 text-gray-300 hover:text-blue-600 group-hover:text-gray-400 transition-colors">
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
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_slogan-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
