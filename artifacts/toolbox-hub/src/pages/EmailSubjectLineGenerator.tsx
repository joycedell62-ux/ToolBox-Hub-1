import React, { useState } from 'react';
import { Mail, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What subject line length is best?', a: 'Aim for 30–50 characters. Many mobile inboxes cut off around 40, so front-load the important words. The live character count helps you stay on target.' },
  { q: 'Do emojis help open rates?', a: 'They can boost visibility when used sparingly and relevantly. Toggle emojis on to preview them — but never rely on an emoji to carry the message.' },
  { q: 'What does the goal setting change?', a: 'Each goal (opens, sale, newsletter) pulls from a different template bank tuned for curiosity, urgency, or informative framing respectively.' },
  { q: 'Will these avoid spam filters?', a: 'They avoid the most common triggers, but always test. Skip ALL CAPS, excessive punctuation, and misleading claims to stay out of spam.' },
  { q: 'Is anything sent to a server?', a: 'No. Every subject line is built offline from local template banks. Nothing leaves your browser.' },
];

const GOALS = { Opens: 'maximize opens', Sale: 'drive a sale', Newsletter: 'newsletter update' } as const;
type Goal = keyof typeof GOALS;
const TONES = ['Curious', 'Urgent', 'Friendly', 'Professional', 'Playful'] as const;
type Tone = typeof TONES[number];

const TEMPLATES: Record<Goal, string[]> = {
  Opens: ['You won\'t believe what we did with {T}', 'The truth about {T}', 'Quick question about {T}', 'Is {T} really worth it?', 'We need to talk about {T}', '{T}: what nobody tells you', 'The {T} secret we finally cracked', 'Wait — you\'re still doing {T} like this?', 'A better way to {T}', 'This changed how we think about {T}', 'Psst... {T} inside', 'Your {T} could be so much easier'],
  Sale: ['{T} — 24 hours only', 'Last chance for {T} savings', 'Your {T} discount expires tonight', 'Grab {T} before it\'s gone', 'Flash sale: {T} today only', 'Save big on {T} this week', 'The {T} deal you asked for', 'Only a few {T} spots left', 'Ends soon: {T} offer inside', 'Don\'t miss out on {T}', '{T} just dropped in price', 'Hurry — {T} sale ends at midnight'],
  Newsletter: ['This week in {T}', 'Your {T} roundup is here', '5 things to know about {T}', 'The latest on {T}', '{T} news you can use', 'Fresh {T} updates inside', 'What\'s new with {T}', 'Your monthly {T} digest', 'Handpicked {T} reads', 'Catching you up on {T}', '{T} highlights from this month', 'A few {T} things we\'re loving'],
};

const EMOJIS: Record<Goal, string[]> = {
  Opens: ['👀', '🤔', '✨', '💡'],
  Sale: ['🔥', '⏰', '💸', '🎉'],
  Newsletter: ['📬', '📰', '✅', '🗞️'],
};

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;

export default function EmailSubjectLineGenerator() {
  const [topic, setTopic] = useState('your new dashboard');
  const [goal, setGoal] = useState<Goal>('Opens');
  const [tone, setTone] = useState<Tone>('Curious');
  const [useEmoji, setUseEmoji] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedOne, setCopiedOne] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => {
    const T = topic.trim() || 'this';
    const seen = new Set<string>();
    const out: string[] = [];
    let guard = 0;
    while (out.length < 8 && guard < 100) {
      let s = pick(TEMPLATES[goal]).replace(/\{T\}/g, T);
      if (useEmoji) s = `${pick(EMOJIS[goal])} ${s}`;
      if (!seen.has(s)) { seen.add(s); out.push(s); }
      guard++;
    }
    setLines(out);
  };

  React.useEffect(() => { generate(); /* eslint-disable-next-line */ }, [useEmoji]);

  const copyOne = async (s: string, i: number) => { await navigator.clipboard.writeText(s); setCopiedOne(i); setTimeout(() => setCopiedOne(null), 2000); };
  const copyAll = async () => { await navigator.clipboard.writeText(lines.join('\n')); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Mail className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Email Subject Line Generator</h1><p className="text-blue-200 text-sm">topic + goal + tone · char count · emoji toggle</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Craft subject lines that get opened. Pick a goal and tone, add your topic, and generate a batch with live character counts and an optional emoji.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="es-topic" className="block text-xs font-semibold text-gray-500 mb-1">Topic</label>
              <input id="es-topic" value={topic} onChange={e => setTopic(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label htmlFor="es-goal" className="block text-xs font-semibold text-gray-500 mb-1">Goal</label>
              <select id="es-goal" value={goal} onChange={e => setGoal(e.target.value as Goal)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                {(Object.keys(GOALS) as Goal[]).map(g => <option key={g} value={g}>{GOALS[g]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="es-tone" className="block text-xs font-semibold text-gray-500 mb-1">Tone</label>
              <select id="es-tone" value={tone} onChange={e => setTone(e.target.value as Tone)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={useEmoji} onChange={e => setUseEmoji(e.target.checked)} className="rounded w-4 h-4 accent-blue-600" />
              Add an emoji
            </label>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Subject Lines
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Keep it under 50 characters so it doesn't get cut off on mobile.</li>
              <li>• Front-load the most compelling word — inbox previews are short.</li>
              <li>• One emoji max; more can look like spam.</li>
              <li>• Personalize with a name or topic where you can.</li>
              <li>• A/B test two subject lines on a small segment first.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Subject Lines</h2>
              <button onClick={copyAll} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                {copiedAll ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied All</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
              </button>
            </div>
            {lines.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">Click Generate to create subject lines.</p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {lines.map((s, i) => (
                  <div key={s + i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 hover:border-blue-200 transition-all group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 select-all">{s}</p>
                      <span className={`text-xs font-medium ${s.length > 50 ? 'text-orange-500' : 'text-gray-400'}`}>{s.length} chars</span>
                    </div>
                    <button onClick={() => copyOne(s, i)} aria-label="Copy subject line" className="shrink-0 text-gray-300 hover:text-blue-600 group-hover:text-gray-400 transition-colors">
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
              {[{ label: 'Ad Copy Generator', href: '/ad-copy-generator' }, { label: 'CTA Generator', href: '/cta-generator' }, { label: 'Content Calendar', href: '/content-calendar-generator' }, { label: 'Product Name', href: '/product-name-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_email-subject', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
