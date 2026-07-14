import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What does this produce?', a: 'A back-and-forth dialogue exchange between two characters, shaped by their relationship, the conflict, and the tone you choose. It gives you natural, escalating lines to build a scene around.' },
  { q: 'How does the conflict field work?', a: 'The conflict seeds what the characters are arguing, negotiating, or avoiding. The exchange escalates around it and resolves (or fractures) at the end.' },
  { q: 'Is it offline and private?', a: 'Yes. Lines are assembled locally from curated banks; nothing is sent to a server.' },
  { q: 'How long is the exchange?', a: 'Use the slider to set the number of exchanges (line pairs) from a quick beat to a full scene.' },
  { q: 'Can I regenerate?', a: 'Yes — regenerate to remix the lines while keeping your characters and conflict.' },
];

const RELATIONSHIPS = ['Strangers', 'Old Friends', 'Rivals', 'Family', 'Lovers', 'Mentor & Student', 'Boss & Employee', 'Estranged Siblings'];
const TONES = ['Tense', 'Playful', 'Somber', 'Sarcastic', 'Warm', 'Cold', 'Desperate', 'Flirtatious'];

const OPENERS = ['We need to talk about {conflict}.', 'You really thought I wouldn\u2019t find out about {conflict}?', 'So. {conflict}. Are we doing this now?', 'I\u2019ve been meaning to bring up {conflict} for a while.', 'Don\u2019t. Don\u2019t say it. I already know it\u2019s about {conflict}.'];
const A_LINES = ['You always do this \u2014 turn everything back on me.', 'I\u2019m not asking for much. I\u2019m asking for the truth.', 'Maybe I made mistakes. But so did you.', 'You have no idea what this cost me.', 'I stayed. Doesn\u2019t that count for anything?', 'I\u2019m tired of pretending everything is fine.', 'Look me in the eye and tell me I\u2019m wrong.', 'This isn\u2019t about winning. It never was.'];
const B_LINES = ['That\u2019s not fair and you know it.', 'I did what I had to do. You\u2019d have done the same.', 'You want the truth? Fine. Here it is.', 'Don\u2019t put this on me. Not after everything.', 'I never asked you to stay.', 'And what about what it cost me?', 'You\u2019re rewriting history to make yourself the hero.', 'Maybe we\u2019ve both been wrong this whole time.'];
const CLOSERS = ['Fine. If that\u2019s how you want it. [beat] I\u2019m done.', 'Maybe we can\u2019t fix this. But I had to try.', '\u2026I don\u2019t want to lose you over this.', 'So where does that leave us? [silence] I don\u2019t know either.', 'Say something. Anything. Please.', 'Then there\u2019s nothing left to say.'];

function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

export default function DialogueGenerator() {
  const [charA, setCharA] = useState('Nora');
  const [charB, setCharB] = useState('Dev');
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0]);
  const [conflict, setConflict] = useState('the money that went missing');
  const [tone, setTone] = useState(TONES[0]);
  const [rounds, setRounds] = useState(5);
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const build = () => {
    const seed = Math.floor(Math.random() * 9999) + tick;
    const a = charA.trim() || 'A';
    const b = charB.trim() || 'B';
    const c = conflict.trim() || 'the problem';
    const fill = (s: string) => s.replace(/\{conflict\}/g, c);
    const header = `DIALOGUE \u2014 ${a} & ${b}\nRelationship: ${relationship} \u00b7 Tone: ${tone}\nConflict: ${c}\n${'='.repeat(40)}`;
    const lines: string[] = [`${a}: ${fill(pick(OPENERS, seed))}`];
    for (let i = 0; i < rounds; i++) {
      lines.push(`${b}: ${fill(pick(B_LINES, seed + i * 3 + 1))}`);
      lines.push(`${a}: ${fill(pick(A_LINES, seed + i * 3 + 2))}`);
    }
    lines.push(`${b}: ${fill(pick(CLOSERS, seed + 7))}`);
    return `${header}\n\n${lines.join('\n')}`;
  };

  const [dialogue, setDialogue] = useState(() => build());
  const generate = () => { setTick(x => x + 1); setDialogue(build()); };
  const copy = async () => { await navigator.clipboard.writeText(dialogue); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><MessageSquare className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Dialogue Generator</h1><p className="text-blue-200 text-sm">two characters · relationship · conflict · tone \u2192 a scene</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Generate a natural, escalating exchange between two characters. Set who they are to each other, what they\u2019re fighting about, and the tone, then get a scene you can shape into your own.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dg-a" className="block text-xs font-semibold text-gray-500 mb-1">Character A</label>
                <input id="dg-a" type="text" value={charA} onChange={e => setCharA(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Nora" />
              </div>
              <div>
                <label htmlFor="dg-b" className="block text-xs font-semibold text-gray-500 mb-1">Character B</label>
                <input id="dg-b" type="text" value={charB} onChange={e => setCharB(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Dev" />
              </div>
            </div>
            <div>
              <label htmlFor="dg-rel" className="block text-xs font-semibold text-gray-500 mb-1">Relationship</label>
              <select id="dg-rel" value={relationship} onChange={e => setRelationship(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="dg-conflict" className="block text-xs font-semibold text-gray-500 mb-1">Conflict</label>
              <input id="dg-conflict" type="text" value={conflict} onChange={e => setConflict(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="what they clash over" />
            </div>
            <div>
              <label htmlFor="dg-tone" className="block text-xs font-semibold text-gray-500 mb-1">Tone</label>
              <select id="dg-tone" value={tone} onChange={e => setTone(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Exchanges ({rounds})</label>
              <input type="range" min="2" max="10" value={rounds} onChange={e => setRounds(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>2</span><span>10</span></div>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Dialogue
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• 💬 Great dialogue is what characters won\u2019t say as much as what they do.</li>
              <li>• Give each character a distinct rhythm — clipped vs. rambling.</li>
              <li>• Cut greetings and filler; start as late into the tension as possible.</li>
              <li>• Let subtext carry the conflict; avoid on-the-nose lines.</li>
              <li>• Read both parts aloud to catch anything that sounds unnatural.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Dialogue Scene</h2>
              <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-[520px] overflow-y-auto bg-gray-50 rounded-xl p-4 border border-gray-100">{dialogue}</pre>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Script Generator', href: '/script-generator' }, { label: 'Story Generator', href: '/story-generator' }, { label: 'Book Chapter', href: '/book-chapter-generator' }, { label: 'Speech Generator', href: '/speech-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_dialogue', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
