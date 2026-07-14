import React, { useState } from 'react';
import { AtSign, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'How are usernames generated?', a: 'The tool blends your name, interests, and keywords with a built-in bank of adjectives and nouns, then applies your chosen options (numbers, underscores, length) with randomized combination logic.' },
  { q: 'Are these usernames available on social platforms?', a: 'This tool only generates ideas. It does not check availability on any platform — you will need to try them where you want to sign up.' },
  { q: 'What do the number and underscore options do?', a: 'Numbers append a random digit run to add uniqueness; underscores replace the space between word parts, a common style on many platforms.' },
  { q: 'Do I have to enter anything?', a: 'No. With empty inputs the generator uses its built-in word banks, so you always get fresh ideas.' },
  { q: 'Why do results change each time?', a: 'Each Generate press randomly samples words and patterns, so you get a new set of 12 usernames every round.' },
];

const RELATED = [
  { label: 'Business Name Generator', href: '/business-name-generator' },
  { label: 'Brand Name Generator', href: '/brand-name-generator' },
  { label: 'Slogan Generator', href: '/slogan-generator' },
  { label: 'Mission Statement Generator', href: '/mission-statement-generator' },
];

const ADJECTIVES = [
  'swift', 'brave', 'lunar', 'solar', 'mighty', 'silent', 'cosmic', 'wild', 'happy', 'chill',
  'epic', 'royal', 'shadow', 'golden', 'crimson', 'frost', 'blazing', 'mystic', 'noble', 'rapid',
  'clever', 'stealth', 'radiant', 'fierce', 'gentle', 'daring', 'lucky', 'vivid', 'sonic', 'turbo',
  'quiet', 'bold', 'neon', 'atomic', 'iron', 'jade', 'velvet', 'amber', 'electric', 'quantum',
  'primal', 'zen', 'stormy', 'sunny', 'frozen', 'hollow', 'grand', 'urban', 'feral', 'prime',
];

const NOUNS = [
  'wolf', 'tiger', 'phoenix', 'falcon', 'raven', 'dragon', 'panda', 'otter', 'fox', 'hawk',
  'comet', 'nova', 'nomad', 'ranger', 'pilot', 'ninja', 'wizard', 'knight', 'rider', 'sage',
  'ember', 'storm', 'pixel', 'byte', 'echo', 'drift', 'blaze', 'frost', 'ghost', 'spark',
  'viper', 'lynx', 'orca', 'cobra', 'moth', 'crane', 'bison', 'gecko', 'heron', 'ibex',
  'atlas', 'orbit', 'zenith', 'vortex', 'quasar', 'summit', 'harbor', 'meadow', 'canyon', 'delta',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function cleanTokens(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[\s,]+/)
    .map(w => w.replace(/[^a-z0-9]/g, ''))
    .filter(w => w.length >= 2);
}

interface Options {
  useNumbers: boolean;
  useUnderscores: boolean;
  maxLength: number;
}

function generateUsernames(name: string, interests: string, opts: Options): string[] {
  const nameTokens = cleanTokens(name);
  const interestTokens = cleanTokens(interests);
  const personalWords = [...nameTokens, ...interestTokens];
  const results = new Set<string>();
  let guard = 0;

  const grabPersonal = () => (personalWords.length ? pick(personalWords) : pick(ADJECTIVES));

  while (results.size < 12 && guard < 600) {
    guard++;
    const pattern = Math.floor(Math.random() * 5);
    let parts: string[] = [];
    switch (pattern) {
      case 0: parts = [grabPersonal(), pick(NOUNS)]; break;
      case 1: parts = [pick(ADJECTIVES), grabPersonal()]; break;
      case 2: parts = [pick(ADJECTIVES), pick(NOUNS)]; break;
      case 3: parts = [grabPersonal(), pick(ADJECTIVES)]; break;
      case 4: parts = [pick(ADJECTIVES), pick(NOUNS), grabPersonal()]; break;
    }

    const sep = opts.useUnderscores ? '_' : '';
    let username = opts.useUnderscores
      ? parts.map(p => p.toLowerCase()).join(sep)
      : parts.map(cap).join('');

    if (opts.useNumbers) {
      const num = Math.floor(Math.random() * 900 + 10).toString();
      username += (opts.useUnderscores ? '_' : '') + num;
    }

    if (username.length <= opts.maxLength && username.length >= 3) {
      results.add(username);
    }
  }
  return Array.from(results);
}

export default function UsernameGenerator() {
  const [name, setName] = useState('');
  const [interests, setInterests] = useState('');
  const [useNumbers, setUseNumbers] = useState(true);
  const [useUnderscores, setUseUnderscores] = useState(false);
  const [maxLength, setMaxLength] = useState(16);
  const [usernames, setUsernames] = useState<string[]>(() => generateUsernames('', '', { useNumbers: true, useUnderscores: false, maxLength: 16 }));
  const [copiedOne, setCopiedOne] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => setUsernames(generateUsernames(name, interests, { useNumbers, useUnderscores, maxLength }));

  const copyOne = async (u: string, i: number) => {
    await navigator.clipboard.writeText(u);
    setCopiedOne(i);
    setTimeout(() => setCopiedOne(null), 2000);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><AtSign className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Username Generator</h1><p className="text-blue-200 text-sm">name + interests · numbers · underscores · length · 12 ideas</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Create unique, catchy usernames from your name, interests, and keywords. Tune numbers, underscores, and length, then regenerate for a fresh batch — all offline in your browser.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-gray-500 mb-1">Name or nickname (optional)</label>
              <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="interests" className="block text-xs font-semibold text-gray-500 mb-1">Interests / keywords (optional)</label>
              <input id="interests" type="text" value={interests} onChange={e => setInterests(e.target.value)} placeholder="e.g. gaming, music, coffee" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="maxlen" className="block text-xs font-semibold text-gray-500 mb-1">Max length ({maxLength})</label>
              <input id="maxlen" type="range" min="8" max="24" value={maxLength} onChange={e => setMaxLength(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>8</span><span>24</span></div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={useNumbers} onChange={e => setUseNumbers(e.target.checked)} className="rounded w-4 h-4 accent-blue-600" />
                Include numbers
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={useUnderscores} onChange={e => setUseUnderscores(e.target.checked)} className="rounded w-4 h-4 accent-blue-600" />
                Use underscores
              </label>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Usernames
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Keep a username under 15 characters so it fits most platforms.</li>
              <li>• Add interests to get usernames that reflect your personality.</li>
              <li>• Numbers help you grab a unique handle when your favorite is taken.</li>
              <li>• Reuse the same handle everywhere to build a recognizable identity.</li>
              <li>• Avoid personal info like birth years in public usernames for privacy.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Username Ideas</h2>
              <span className="text-xs text-gray-400">{usernames.length} ideas</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {usernames.map((u, i) => (
                <div key={u + i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 hover:border-blue-200 transition-all group">
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">{u}</span>
                  <button onClick={() => copyOne(u, i)} aria-label={`Copy ${u}`} className="shrink-0 text-gray-300 hover:text-blue-600 group-hover:text-gray-400 transition-colors">
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
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_username-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
