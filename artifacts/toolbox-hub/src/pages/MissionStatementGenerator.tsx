import React, { useState } from 'react';
import { Target, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'How are mission statements generated?', a: 'Your company name, audience, what you do, and selected core values are woven into curated sentence templates, then randomly combined so each draft reads differently.' },
  { q: 'What makes a good mission statement?', a: 'It is clear, concise, and states who you serve, what you do, and why it matters — usually in one or two sentences. Use these drafts as a starting point to refine.' },
  { q: 'How many core values should I pick?', a: 'Two to four works best. Too many values dilute focus and make the statement harder to remember.' },
  { q: 'Can I edit the results?', a: 'Absolutely. Copy any draft and tailor the wording to your exact voice — the drafts are meant to inspire, not to be final.' },
  { q: 'Why do I get different drafts each time?', a: 'The generator samples randomly from multiple templates and value phrasings, so Generate again produces a fresh set of five.' },
];

const RELATED = [
  { label: 'Business Name Generator', href: '/business-name-generator' },
  { label: 'Slogan Generator', href: '/slogan-generator' },
  { label: 'Brand Name Generator', href: '/brand-name-generator' },
  { label: 'Username Generator', href: '/username-generator' },
];

const CORE_VALUES = [
  'Integrity', 'Innovation', 'Quality', 'Sustainability', 'Community', 'Excellence',
  'Trust', 'Creativity', 'Diversity', 'Passion', 'Simplicity', 'Empowerment',
  'Transparency', 'Collaboration', 'Reliability', 'Growth',
];

const VALUE_PHRASES: Record<string, string> = {
  Integrity: 'unwavering integrity',
  Innovation: 'relentless innovation',
  Quality: 'uncompromising quality',
  Sustainability: 'lasting sustainability',
  Community: 'a strong sense of community',
  Excellence: 'a commitment to excellence',
  Trust: 'genuine trust',
  Creativity: 'bold creativity',
  Diversity: 'inclusive diversity',
  Passion: 'heartfelt passion',
  Simplicity: 'thoughtful simplicity',
  Empowerment: 'true empowerment',
  Transparency: 'honest transparency',
  Collaboration: 'open collaboration',
  Reliability: 'dependable reliability',
  Growth: 'meaningful growth',
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

function joinValues(values: string[]): string {
  const phrases = values.map(v => VALUE_PHRASES[v] || v.toLowerCase());
  if (phrases.length === 0) return 'our core values';
  if (phrases.length === 1) return phrases[0];
  if (phrases.length === 2) return `${phrases[0]} and ${phrases[1]}`;
  return `${phrases.slice(0, -1).join(', ')}, and ${phrases[phrases.length - 1]}`;
}

interface Inputs {
  company: string;
  audience: string;
  doWhat: string;
  values: string[];
}

// {c} company, {a} audience, {d} what you do, {v} values phrase
const TEMPLATES = [
  'At {c}, our mission is to {d} for {a}, guided by {v}.',
  '{c} exists to {d}, helping {a} thrive through {v}.',
  'We believe {a} deserve the best. That is why {c} works to {d}, driven by {v}.',
  'Our purpose at {c} is simple: to {d} for {a} while championing {v}.',
  '{c} is dedicated to {d}, empowering {a} with {v}.',
  'Every day, {c} strives to {d} so that {a} can flourish — rooted in {v}.',
  'The mission of {c} is to {d} for {a}, always upholding {v}.',
  'At {c}, we {d} to make life better for {a}, powered by {v}.',
];

function generateMissions(inputs: Inputs): string[] {
  const c = inputs.company.trim() || 'our company';
  const a = inputs.audience.trim() || 'our customers';
  const d = inputs.doWhat.trim() || 'deliver outstanding products and services';
  const v = joinValues(inputs.values);
  const templates = shuffle(TEMPLATES);
  const results = new Set<string>();
  let idx = 0;
  let guard = 0;
  while (results.size < 5 && guard < 100) {
    guard++;
    const t = templates[idx % templates.length];
    idx++;
    const s = t.replace(/\{c\}/g, c).replace(/\{a\}/g, a).replace(/\{d\}/g, d).replace(/\{v\}/g, v);
    results.add(s);
  }
  return Array.from(results);
}

export default function MissionStatementGenerator() {
  const [company, setCompany] = useState('');
  const [audience, setAudience] = useState('');
  const [doWhat, setDoWhat] = useState('');
  const [values, setValues] = useState<string[]>(['Integrity', 'Innovation']);
  const [missions, setMissions] = useState<string[]>(() => generateMissions({ company: '', audience: '', doWhat: '', values: ['Integrity', 'Innovation'] }));
  const [copiedOne, setCopiedOne] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const toggleValue = (v: string) => {
    setValues(prev => prev.includes(v) ? prev.filter(x => x !== v) : (prev.length >= 4 ? prev : [...prev, v]));
  };

  const generate = () => setMissions(generateMissions({ company, audience, doWhat, values }));

  const copyOne = async (m: string, i: number) => {
    await navigator.clipboard.writeText(m);
    setCopiedOne(i);
    setTimeout(() => setCopiedOne(null), 2000);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Target className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Mission Statement Generator</h1><p className="text-blue-200 text-sm">company + audience + purpose + values · 5 drafts · copy each</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Turn your company details into polished mission statement drafts. Enter who you serve, what you do, and your core values to get five ready-to-refine options — all offline in your browser.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="company" className="block text-xs font-semibold text-gray-500 mb-1">Company name</label>
              <input id="company" type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Nova Labs" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="audience" className="block text-xs font-semibold text-gray-500 mb-1">Who you serve (audience)</label>
              <input id="audience" type="text" value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. small business owners" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="dowhat" className="block text-xs font-semibold text-gray-500 mb-1">What you do</label>
              <input id="dowhat" type="text" value={doWhat} onChange={e => setDoWhat(e.target.value)} placeholder="e.g. simplify accounting" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 mb-2">Core values (pick up to 4) — {values.length} selected</span>
              <div className="flex flex-wrap gap-2">
                {CORE_VALUES.map(v => {
                  const active = values.includes(v);
                  return (
                    <button key={v} type="button" aria-pressed={active} onClick={() => toggleValue(v)} className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}>{v}</button>
                  );
                })}
              </div>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Statements
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Keep it to one or two sentences — brevity makes it memorable.</li>
              <li>• Focus on the value you create for your audience, not just what you sell.</li>
              <li>• Pick two to four core values; too many blur your focus.</li>
              <li>• Use plain, confident language your whole team can repeat.</li>
              <li>• Treat these drafts as a starting point and refine them in your own voice.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Mission Statement Drafts</h2>
              <span className="text-xs text-gray-400">{missions.length} drafts</span>
            </div>
            <div className="space-y-3">
              {missions.map((m, i) => (
                <div key={m + i} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 hover:border-blue-200 transition-all group">
                  <p className="flex-1 text-sm text-gray-800 leading-relaxed">{m}</p>
                  <button onClick={() => copyOne(m, i)} aria-label={`Copy draft ${i + 1}`} className="shrink-0 mt-0.5 text-gray-300 hover:text-blue-600 group-hover:text-gray-400 transition-colors">
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
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_mission-statement-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
