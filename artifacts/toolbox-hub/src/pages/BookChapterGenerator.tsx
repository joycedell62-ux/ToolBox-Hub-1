import React, { useState } from 'react';
import { FileText, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What does this generate?', a: 'A chapter draft scaffold: an opening line prompt, a sequence of scene beats built around your chapter goal, sensory and emotion cues, and a closing hook — everything you need to start writing.' },
  { q: 'What are POV and style for?', a: 'POV sets the narrative voice (first person, third limited, etc.) and style tunes the prose guidance (lean, lyrical, punchy). The scaffold notes adapt accordingly.' },
  { q: 'Is it offline?', a: 'Yes. The scaffold is assembled locally from curated beat banks; nothing leaves your browser.' },
  { q: 'How is this different from the outline tool?', a: 'The outline tool structures the whole book. This tool zooms into a single chapter and gives you beat-level scaffolding to draft it.' },
  { q: 'Can I regenerate?', a: 'Yes — regenerate to shuffle beats, prompts, and hooks for a fresh approach.' },
];

const POVS = ['First Person', 'Third Person Limited', 'Third Person Omniscient', 'Second Person'];
const STYLES = ['Lean & Punchy', 'Lyrical & Descriptive', 'Tense & Cinematic', 'Warm & Reflective', 'Dry & Witty'];

const OPENERS = [
  'Open in motion \u2014 drop the reader mid-action, then orient them.',
  'Open on a single vivid sensory detail that sets the mood.',
  'Open with a line of dialogue that raises a question.',
  'Open on the character noticing something is wrong.',
  'Open with a short, declarative statement that hooks curiosity.',
  'Open on a contrast between what the character expects and finds.',
];
const BEATS = [
  'Establish where we are and who is present, quickly.',
  'Show the character pursuing the chapter goal: {goal}.',
  'Introduce the first obstacle that complicates {goal}.',
  'Raise the emotional stakes through a small revealing action.',
  'A turn: new information changes the character\u2019s plan.',
  'Escalate \u2014 the obstacle grows or a second one appears.',
  'A quiet beat: let the character react and reflect.',
  'The mini-climax of the chapter around {goal}.',
  'Consequence: what the character gains or loses.',
];
const HOOKS = [
  'End on an unanswered question that pulls into the next chapter.',
  'End on a reversal that changes what the goal even means.',
  'End on an ominous detail the character overlooks.',
  'End on a decision that cannot be taken back.',
  'End on a line of dialogue that lands like a door closing.',
  'End on an image that echoes the chapter\u2019s theme.',
];
const CUES = ['Anchor one strong scent or sound.', 'Track the character\u2019s heartbeat / breath at the tense moment.', 'Use one concrete object as an emotional touchstone.', 'Vary sentence length to control pace.', 'Cut a line of dialogue you love if it slows the scene.'];

function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

export default function BookChapterGenerator() {
  const [goal, setGoal] = useState('the heroine confronts her mentor about the missing ledger');
  const [pov, setPov] = useState(POVS[1]);
  const [style, setStyle] = useState(STYLES[0]);
  const [num, setNum] = useState(6);
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const build = () => {
    const seed = Math.floor(Math.random() * 9999) + tick;
    const g = goal.trim() || 'the chapter goal';
    const fill = (s: string) => s.replace(/\{goal\}/g, g);
    const beatCount = Math.min(num, BEATS.length);
    const beats = BEATS.slice(0, beatCount).map((b, i) => `${i + 1}. ${fill(b)}`);
    const header = `CHAPTER DRAFT SCAFFOLD\nGoal: ${g}\nPOV: ${pov} \u00b7 Style: ${style}\n${'='.repeat(40)}`;
    const opener = `\nOPENING\n${pick(OPENERS, seed)}`;
    const beatBlock = `\n\nSCENE BEATS\n${beats.join('\n')}`;
    const cue = `\n\nCRAFT CUES (${style})\n\u2022 ${pick(CUES, seed)}\n\u2022 ${pick(CUES, seed + 2)}\n\u2022 Keep the ${pov.toLowerCase()} voice consistent throughout.`;
    const hook = `\n\nCLOSING HOOK\n${pick(HOOKS, seed + 1)}`;
    return header + opener + beatBlock + cue + hook;
  };

  const [chapter, setChapter] = useState(() => build());
  const generate = () => { setTick(x => x + 1); setChapter(build()); };
  const copy = async () => { await navigator.clipboard.writeText(chapter); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><FileText className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Book Chapter Generator</h1><p className="text-blue-200 text-sm">goal + POV + style \u2192 a beat-by-beat draft scaffold</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Beat the blank page. Describe a chapter goal, pick your point of view and prose style, and get an opening prompt, ordered scene beats, craft cues, and a closing hook.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="bc-goal" className="block text-xs font-semibold text-gray-500 mb-1">Chapter goal</label>
              <textarea id="bc-goal" value={goal} onChange={e => setGoal(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none" placeholder="What must happen in this chapter?" />
            </div>
            <div>
              <label htmlFor="bc-pov" className="block text-xs font-semibold text-gray-500 mb-1">Point of view</label>
              <select id="bc-pov" value={pov} onChange={e => setPov(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                {POVS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="bc-style" className="block text-xs font-semibold text-gray-500 mb-1">Prose style</label>
              <select id="bc-style" value={style} onChange={e => setStyle(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Scene beats ({num})</label>
              <input type="range" min="3" max="9" value={num} onChange={e => setNum(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>3</span><span>9</span></div>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Scaffold
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• ✍️ Every chapter should change something — a fact, a relationship, or a decision.</li>
              <li>• Draft fast against the beats; fix prose on the next pass.</li>
              <li>• End on the hook, then start the next chapter as late as possible.</li>
              <li>• Keep POV airtight — no head-hopping mid-scene.</li>
              <li>• Read the closing line aloud; it sets the reader\u2019s momentum.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Chapter Scaffold</h2>
              <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-[520px] overflow-y-auto bg-gray-50 rounded-xl p-4 border border-gray-100">{chapter}</pre>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Book Outline', href: '/book-outline-generator' }, { label: 'Story Generator', href: '/story-generator' }, { label: 'Dialogue Generator', href: '/dialogue-generator' }, { label: 'Essay Generator', href: '/essay-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_bookchapter', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
