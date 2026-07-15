import React, { useState } from 'react';
import { GraduationCap, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What does this generate?', a: 'A structured essay draft with an introduction, several body paragraphs, and a conclusion, shaped by your topic, essay type, and target length. Use it as a scaffold to research and refine.' },
  { q: 'Which essay types are supported?', a: 'Argumentative, expository, narrative, and persuasive — each changes the framing, the body-paragraph purpose, and the conclusion strategy.' },
  { q: 'Is it offline and private?', a: 'Yes. Everything is assembled locally from curated sentence banks; nothing is uploaded.' },
  { q: 'Should I submit this as-is?', a: 'No — treat it as a first draft and planning aid. Add your own evidence, citations, and voice, and always follow your assignment guidelines.' },
  { q: 'Can I regenerate?', a: 'Yes — regenerate for different phrasings and paragraph angles.' },
];

const TYPES = ['Argumentative', 'Expository', 'Narrative', 'Persuasive'] as const;
type EType = typeof TYPES[number];
const LENGTHS = ['Short', 'Standard', 'Long'] as const;

const INTROS: Record<EType, string[]> = {
  Argumentative: ['The debate over {topic} has never been more urgent, and the evidence points clearly in one direction.', 'Few issues divide opinion like {topic}, yet a careful look at the facts reveals a compelling case.'],
  Expository: ['To understand {topic}, we must first examine its origins, mechanics, and lasting impact.', '{topic} is often misunderstood; this essay breaks it down into its essential parts.'],
  Narrative: ['I still remember the moment {topic} changed the way I saw everything.', 'Some lessons arrive quietly. Mine came through {topic}, and it stayed with me.'],
  Persuasive: ['Imagine a world where {topic} was taken seriously by everyone. It is closer than you think.', 'We can no longer afford to ignore {topic} \u2014 and here is why you should act today.'],
};
const BODIES: Record<EType, string[]> = {
  Argumentative: ['First, consider the strongest evidence supporting this position on {topic}.', 'Opponents argue the opposite, but their reasoning overlooks a critical flaw.', 'A second line of evidence reinforces the central claim about {topic}.', 'Even accounting for exceptions, the overall pattern holds firm.'],
  Expository: ['The first key aspect of {topic} is its underlying structure.', 'Next, it helps to understand how {topic} works in practice.', 'A closer look reveals the causes and effects at play.', 'Finally, real-world examples show {topic} in action.'],
  Narrative: ['It began ordinarily enough, before {topic} entered the picture.', 'Then came the turning point that changed everything.', 'In the aftermath, I began to see {topic} differently.', 'Looking back, the meaning of that experience became clear.'],
  Persuasive: ['The problem with the status quo around {topic} is impossible to ignore.', 'The benefits of acting on {topic} far outweigh the costs.', 'Consider what others have achieved by embracing this change.', 'The only thing standing between us and progress is inaction.'],
};
const CONCLUSIONS: Record<EType, string[]> = {
  Argumentative: ['Weighing all the evidence, the conclusion about {topic} is difficult to dispute.', 'The case is clear: on {topic}, reason and evidence align.'],
  Expository: ['Taken together, these elements paint a full picture of {topic}.', 'Understanding {topic} in this way equips us to think about it more clearly.'],
  Narrative: ['That experience with {topic} shaped who I am today.', 'Some moments define us; {topic} was one of mine.'],
  Persuasive: ['The choice is ours \u2014 and the time to act on {topic} is now.', 'Join the movement on {topic}, and be part of the change.'],
};

function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

export default function EssayGenerator() {
  const [topic, setTopic] = useState('the importance of public libraries');
  const [type, setType] = useState<EType>('Argumentative');
  const [length, setLength] = useState<typeof LENGTHS[number]>('Standard');
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const build = () => {
    const seed = Math.floor(Math.random() * 9999) + tick;
    const t = topic.trim() || 'the topic';
    const fill = (s: string) => s.replace(/\{topic\}/g, t);
    const bodyCount = length === 'Short' ? 2 : length === 'Standard' ? 3 : 4;
    const bodyBank = BODIES[type];
    const bodies: string[] = [];
    for (let i = 0; i < bodyCount; i++) {
      const lead = fill(bodyBank[i % bodyBank.length]);
      bodies.push(`Body Paragraph ${i + 1}\n${lead} Support this point with specific evidence and a concrete example, then explain how it connects back to your thesis on ${t}.`);
    }
    const header = `${type.toUpperCase()} ESSAY\nTopic: ${t} \u00b7 Length: ${length}\n${'='.repeat(40)}`;
    const intro = `\nIntroduction\n${fill(pick(INTROS[type], seed))} Thesis: this essay will show why ${t} deserves our attention.`;
    const body = `\n\n${bodies.join('\n\n')}`;
    const conclusion = `\n\nConclusion\n${fill(pick(CONCLUSIONS[type], seed + 1))} Restate the thesis in fresh words and leave the reader with a final thought about ${t}.`;
    return header + intro + body + conclusion;
  };

  const [essay, setEssay] = useState(() => build());
  const generate = () => { setTick(x => x + 1); setEssay(build()); };
  const copy = async () => { await navigator.clipboard.writeText(essay); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const download = () => {
    if (!essay) return;
    const blob = new Blob([essay], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'essay.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><GraduationCap className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Essay Generator</h1><p className="text-blue-200 text-sm">argumentative · expository · narrative · persuasive</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Build a structured essay scaffold with a clear introduction, body paragraphs, and conclusion. Pick your topic, essay type, and length, then refine it with your own research and voice.</p>
      </div>

      <div className="space-y-5">
        <div className="contents">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="es-topic" className="block text-xs font-semibold text-gray-500 mb-1">Topic</label>
              <input id="es-topic" type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. renewable energy" />
            </div>
            <div>
              <label htmlFor="es-type" className="block text-xs font-semibold text-gray-500 mb-1">Essay type</label>
              <select id="es-type" value={type} onChange={e => setType(e.target.value as EType)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
              <RefreshCw className="w-4 h-4" /> Generate Essay
            </button>
          </div>
        </div>

        <div className="contents">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm">Essay Draft</h2>
              <div className="flex gap-2">
                <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
                <button onClick={download} disabled={!essay} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
            <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-[500px] overflow-y-auto p-5">{essay}</div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• 🎓 Nail your thesis first — every paragraph should serve it.</li>
              <li>• One idea per body paragraph; lead with the point, then prove it.</li>
              <li>• Argumentative essays are stronger when you address the counterargument.</li>
              <li>• Always add real evidence and citations; this scaffold is a starting point.</li>
              <li>• End with insight, not just a summary.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Speech Generator', href: '/speech-generator' }, { label: 'Proposal Generator', href: '/proposal-generator' }, { label: 'Story Generator', href: '/story-generator' }, { label: 'Press Release', href: '/press-release-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_essay', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
