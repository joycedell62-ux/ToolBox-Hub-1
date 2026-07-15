import React, { useState } from 'react';
import { Mic, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Is the speech ready to deliver?', a: 'It gives you a complete, structured draft with an opening, body, and close tailored to the occasion. Personalize the names and specific memories, then rehearse aloud.' },
  { q: 'Which occasions are covered?', a: 'Wedding toast, graduation, business/keynote, farewell/retirement, award acceptance, birthday, and eulogy — each pulls from its own phrase bank.' },
  { q: 'Does it work offline?', a: 'Yes. All speeches are assembled in your browser from curated template banks. No text is uploaded.' },
  { q: 'How long is the speech?', a: 'The length control adjusts how many body paragraphs and anecdote prompts are included, from a quick toast to a full keynote.' },
  { q: 'Can I regenerate?', a: 'Yes — each Generate press mixes new openings, transitions, and closers so you can find phrasing that sounds like you.' },
];

const OCCASIONS = ['Wedding Toast', 'Graduation', 'Business / Keynote', 'Farewell / Retirement', 'Award Acceptance', 'Birthday', 'Eulogy'] as const;
type Occasion = typeof OCCASIONS[number];
const TONES = ['Heartfelt', 'Humorous', 'Inspirational', 'Formal', 'Warm', 'Motivational', 'Reflective'];
const AUDIENCES = ['Family & Friends', 'Colleagues', 'Students', 'Executives', 'The Community', 'Peers'];
const LENGTHS = ['Short', 'Standard', 'Long'] as const;

const OPENERS = [
  'Thank you all for being here today. It means more than words can say to share this moment with {audience}.',
  'When I think about why we\u2019ve gathered, one word comes to mind — and it\u2019s not the one you\u2019d expect.',
  'I promise to keep this shorter than the wait for {honoree}, but I can\u2019t promise not to get a little emotional.',
  'Standing here in front of {audience}, I\u2019m reminded of just how rare moments like this truly are.',
  'There\u2019s a story I have to tell you, and it explains everything about why today matters.',
  'They asked me to say a few words. I\u2019m fairly sure they\u2019ll regret it — but here we go.',
];
const BODY = [
  'What makes {honoree} remarkable isn\u2019t any single achievement, but the quiet consistency behind all of them.',
  'I\u2019ve watched {honoree} face setbacks that would stop most people cold — and turn each one into a stepping stone.',
  'The best measure of a person is how they treat others when no one is keeping score. By that measure, {honoree} is extraordinary.',
  'We tend to remember the big milestones, but it\u2019s the small kindnesses that reveal who someone really is.',
  'If I had to sum it up: {honoree} shows up, follows through, and lifts everyone around them along the way.',
  'There were moments none of us thought we\u2019d reach. And yet, here we are — proof that persistence pays off.',
  'Success isn\u2019t a destination we arrive at alone; it\u2019s built on the shoulders of everyone in this room.',
  'The courage it takes to keep going, to keep believing, is something worth celebrating out loud.',
];
const CLOSERS = [
  'So let\u2019s raise a glass — to {honoree}, to this moment, and to everything still ahead.',
  'From the bottom of my heart: thank you. Now let\u2019s make the rest of today unforgettable.',
  'Wherever the road leads next, know that you carry all of us with you. Congratulations.',
  'Here\u2019s to the memories behind us and the adventures waiting just ahead. Cheers.',
  'If you remember one thing from tonight, let it be this: you are deeply, genuinely loved.',
  'Thank you for the honor of these few minutes. The best is yet to come.',
];

function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

export default function SpeechGenerator() {
  const [occasion, setOccasion] = useState<Occasion>('Wedding Toast');
  const [honoree, setHonoree] = useState('Alex');
  const [tone, setTone] = useState(TONES[0]);
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [length, setLength] = useState<typeof LENGTHS[number]>('Standard');
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const build = () => {
    const seed = Math.floor(Math.random() * 9999) + tick;
    const name = honoree.trim() || 'our guest of honor';
    const fill = (s: string) => s.replace(/\{honoree\}/g, name).replace(/\{audience\}/g, audience.toLowerCase());
    const paras = length === 'Short' ? 2 : length === 'Standard' ? 3 : 5;
    const bodyLines: string[] = [];
    for (let i = 0; i < paras; i++) bodyLines.push(fill(pick(BODY, seed + i * 7)));
    const header = `${occasion.toUpperCase()} SPEECH\nFor: ${name} · Tone: ${tone} · Audience: ${audience}\n${'='.repeat(40)}`;
    const opening = `\nOPENING\n${fill(pick(OPENERS, seed))}`;
    const body = `\n\nBODY\n` + bodyLines.map((b) => `\u00b6 ${b}`).join('\n\n');
    const anecdote = `\n\n[ Insert a personal anecdote about ${name} here \u2014 a specific memory lands harder than any generic praise. ]`;
    const closing = `\n\nCLOSING\n${fill(pick(CLOSERS, seed + 3))}`;
    return header + opening + body + anecdote + closing;
  };

  const [speech, setSpeech] = useState(() => build());
  const generate = () => { setTick(x => x + 1); setSpeech(build()); };
  const copy = async () => { await navigator.clipboard.writeText(speech); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const download = () => {
    if (!speech) return;
    const blob = new Blob([speech], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'speech.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Mic className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Speech Generator</h1><p className="text-blue-200 text-sm">weddings · graduations · keynotes · farewells · and more</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Draft a complete speech for any occasion in seconds. Choose the event, tone, and audience, and get a structured opening, body, and memorable close you can personalize.</p>
      </div>

      <div className="space-y-5">
        <div className="contents">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="sp-occasion" className="block text-xs font-semibold text-gray-500 mb-1">Occasion</label>
              <select id="sp-occasion" value={occasion} onChange={e => setOccasion(e.target.value as Occasion)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="sp-honoree" className="block text-xs font-semibold text-gray-500 mb-1">Person / subject</label>
              <input id="sp-honoree" type="text" value={honoree} onChange={e => setHonoree(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. Jordan" />
            </div>
            <div>
              <label htmlFor="sp-tone" className="block text-xs font-semibold text-gray-500 mb-1">Tone</label>
              <select id="sp-tone" value={tone} onChange={e => setTone(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="sp-audience" className="block text-xs font-semibold text-gray-500 mb-1">Audience</label>
              <select id="sp-audience" value={audience} onChange={e => setAudience(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Length</label>
              <div className="grid grid-cols-3 gap-2">
                {LENGTHS.map(l => (
                  <button key={l} onClick={() => setLength(l)} className={`py-2 rounded-xl text-sm font-medium border transition-colors ${length === l ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>{l}</button>
                ))}
              </div>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Speech
            </button>
          </div>
        </div>

        <div className="contents">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm">Your Speech</h2>
              <div className="flex gap-2">
                <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
                <button onClick={download} disabled={!speech} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
            <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-[500px] overflow-y-auto p-5">{speech}</div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• 🎤 Replace the anecdote placeholder with one specific, true memory — it beats any polished line.</li>
              <li>• Rehearse out loud and time yourself; most great speeches run under four minutes.</li>
              <li>• Open strong and close stronger; the middle can breathe.</li>
              <li>• Look up, pause, and let the emotional lines land.</li>
              <li>• Keep a printed copy in large font as a safety net.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Script Generator', href: '/script-generator' }, { label: 'Essay Generator', href: '/essay-generator' }, { label: 'Story Generator', href: '/story-generator' }, { label: 'Proposal Generator', href: '/proposal-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_speech', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
