import React, { useState } from 'react';
import { Clapperboard, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Does this write a full script?', a: 'It generates a structured outline with beats and scene directions tailored to your format. You then flesh out dialogue and detail — it gives you the skeleton to beat the blank page.' },
  { q: 'Which formats are supported?', a: 'YouTube video, movie/short film, podcast episode, and stage play. Each uses a different structure — three-act for film, hook-content-CTA for YouTube, segment-based for podcasts, and act/scene for stage plays.' },
  { q: 'Is my topic sent anywhere?', a: 'No. Everything runs entirely in your browser using built-in template banks. Nothing is uploaded or stored on a server.' },
  { q: 'Can I regenerate for new ideas?', a: 'Yes — hit Generate again for a fresh combination of beats and phrasings from the curated template banks.' },
  { q: 'How long should my script be?', a: 'The length selector adjusts how many beats and segments are produced, from a tight short to a feature-length breakdown.' },
];

const FORMATS = ['YouTube Video', 'Movie / Short Film', 'Podcast Episode', 'Stage Play'] as const;
type Format = typeof FORMATS[number];
const TONES = ['Inspirational', 'Comedic', 'Dramatic', 'Suspenseful', 'Educational', 'Casual', 'Epic', 'Heartfelt'];
const LENGTHS = ['Short', 'Standard', 'Long'] as const;

const HOOKS = [
  'Open cold on a bold, unexpected statement that reframes {topic}.',
  'Start with a striking question the audience secretly asks about {topic}.',
  'Drop the viewer into the middle of the action, then rewind.',
  'Tease the payoff first: show the result, promise the how.',
  'Lead with a surprising statistic or myth about {topic}.',
  'Open on a relatable frustration your audience feels around {topic}.',
];
const YT_BEATS = [
  'Hook (0–15s): grab attention and promise clear value.',
  'Intro: introduce yourself and the exact outcome of this video.',
  'Context: why {topic} matters right now.',
  'Main point 1: the foundational idea, with a quick example.',
  'Main point 2: the practical step, demonstrated on screen.',
  'Main point 3: the advanced tip most people miss.',
  'Pattern interrupt: quick recap or B-roll montage to reset attention.',
  'Payoff: the finished result / transformation revealed.',
  'Call to action: subscribe, comment prompt tied to {topic}.',
  'Outro: tease the next video and end card.',
];
const MOVIE_BEATS = [
  'ACT I — Setup: establish the ordinary world and the protagonist chasing {topic}.',
  'Inciting incident: an event disrupts the status quo.',
  'Debate: the hero hesitates before committing.',
  'Break into Act II: the hero crosses the threshold.',
  'ACT II — Rising action: escalating obstacles and a new ally.',
  'Midpoint: a false victory or devastating twist raises the stakes.',
  'Bad guys close in: pressure mounts, allies waver.',
  'All is lost: the lowest point, the dark night of the soul.',
  'Break into Act III: a fresh insight sparks the final plan.',
  'ACT III — Climax: the decisive confrontation over {topic}.',
  'Resolution: the new normal and emotional payoff.',
];
const PODCAST_BEATS = [
  'Cold open: a compelling teaser clip about {topic}.',
  'Intro music + show branding.',
  'Welcome & episode framing: what listeners will learn.',
  'Guest / co-host introduction and quick rapport.',
  'Segment 1: the backstory and why {topic} is timely.',
  'Segment 2: the core discussion, deepest insights.',
  'Ad / sponsor break placeholder.',
  'Segment 3: hot takes, listener questions, or a debate.',
  'Actionable takeaways the audience can use today.',
  'Wrap-up: recap, guest plugs, and next episode tease.',
];
const PLAY_BEATS = [
  'ACT I, Scene 1 — Setting the stage: introduce the world of {topic}.',
  'Establish the protagonist and their want.',
  'Scene 2 — Introduce the opposing force / conflict.',
  'Rising tension between the central characters.',
  'ACT II, Scene 1 — Complication deepens; a secret surfaces.',
  'Confrontation: the emotional core of {topic} is exposed.',
  'A turning point that changes every relationship.',
  'ACT III, Scene 1 — The reckoning approaches.',
  'Climactic scene: everything comes to a head on stage.',
  'Denouement: the final tableau and closing line.',
];

function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

export default function ScriptGenerator() {
  const [topic, setTopic] = useState('overcoming procrastination');
  const [format, setFormat] = useState<Format>('YouTube Video');
  const [tone, setTone] = useState(TONES[0]);
  const [length, setLength] = useState<typeof LENGTHS[number]>('Standard');
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const buildScript = () => {
    const t = topic.trim() || 'your idea';
    const seed = Math.floor(Math.random() * 9999) + tick;
    const fill = (s: string) => s.replace(/\{topic\}/g, t);
    let beats: string[];
    if (format === 'YouTube Video') beats = YT_BEATS;
    else if (format === 'Movie / Short Film') beats = MOVIE_BEATS;
    else if (format === 'Podcast Episode') beats = PODCAST_BEATS;
    else beats = PLAY_BEATS;

    const trimTo = length === 'Short' ? Math.ceil(beats.length * 0.6) : length === 'Standard' ? beats.length : beats.length;
    let selected = beats.slice(0, trimTo);
    if (length === 'Long') {
      selected = beats.flatMap((b, i) => i % 3 === 2 ? [b, 'Beat expansion: add an anecdote or sensory detail to sustain momentum here.'] : [b]);
    }

    const header = `${format.toUpperCase()} SCRIPT OUTLINE\nTopic: ${t}\nTone: ${tone} · Length: ${length}\n${'='.repeat(40)}`;
    const hook = `\nOPENING HOOK\n${fill(pick(HOOKS, seed))}`;
    const body = `\n\nSTRUCTURE / BEATS\n` + selected.map((b, i) => `${i + 1}. ${fill(b)}`).join('\n');
    const notes = `\n\nDIRECTION NOTES\n• Keep every beat serving the ${tone.toLowerCase()} tone.\n• Cut anything that does not move ${t} forward.\n• End on the strongest, most memorable line.`;
    return header + hook + body + notes;
  };

  const [script, setScript] = useState(() => buildScript());
  const generate = () => { setTick(x => x + 1); setScript(buildScript()); };

  const copy = async () => { await navigator.clipboard.writeText(script); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Clapperboard className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Script Generator</h1><p className="text-blue-200 text-sm">YouTube · film · podcast · stage play · format-aware beats</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Turn a topic into a structured script outline. Pick a format and the whole beat sheet changes to match — three-act film, hook-driven YouTube, segmented podcast, or act/scene stage play.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="sg-topic" className="block text-xs font-semibold text-gray-500 mb-1">Topic / premise</label>
              <input id="sg-topic" type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. a heist gone wrong" />
            </div>
            <div>
              <label htmlFor="sg-format" className="block text-xs font-semibold text-gray-500 mb-1">Format</label>
              <select id="sg-format" value={format} onChange={e => setFormat(e.target.value as Format)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="sg-tone" className="block text-xs font-semibold text-gray-500 mb-1">Tone</label>
              <select id="sg-tone" value={tone} onChange={e => setTone(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
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
              <RefreshCw className="w-4 h-4" /> Generate Script
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• 🎬 The first beat matters most — YouTube viewers decide in the first 15 seconds.</li>
              <li>• Regenerate a few times and mix the best beats from each pass.</li>
              <li>• For film, make your midpoint reversal hurt — it doubles the tension.</li>
              <li>• Podcasts thrive on a strong cold open clip; record it last once you know the highlight.</li>
              <li>• Read stage-play beats aloud — dialogue rhythm is easier to hear than to read.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Script Outline</h2>
              <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed max-h-[520px] overflow-y-auto bg-gray-50 rounded-xl p-4 border border-gray-100">{script}</pre>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Story Generator', href: '/story-generator' }, { label: 'Dialogue Generator', href: '/dialogue-generator' }, { label: 'Speech Generator', href: '/speech-generator' }, { label: 'Book Outline', href: '/book-outline-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_script', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
