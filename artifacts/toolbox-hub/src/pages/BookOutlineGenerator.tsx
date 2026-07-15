import React, { useState } from 'react';
import { Library, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What kind of outline does this produce?', a: 'A chapter-by-chapter breakdown with a one-line purpose for each chapter, shaped by your genre and premise. It gives structure so you can start drafting immediately.' },
  { q: 'Which genres are supported?', a: 'Fantasy, thriller, romance, literary fiction, mystery, and non-fiction — each follows a genre-appropriate arc.' },
  { q: 'Is it offline and private?', a: 'Yes. Outlines are assembled in your browser from bundled beat banks. Nothing is sent anywhere.' },
  { q: 'How many chapters can I get?', a: 'Choose anywhere from 8 to 30 chapters with the slider; the arc scales to fit.' },
  { q: 'Can I regenerate?', a: 'Yes — each Generate press remixes the chapter purposes for fresh structural ideas.' },
];

const GENRES = ['Fantasy', 'Thriller', 'Romance', 'Literary Fiction', 'Mystery', 'Non-Fiction'] as const;
type Genre = typeof GENRES[number];

const ARCS: Record<Genre, string[]> = {
  Fantasy: ['Introduce the hero in their ordinary world and hint at {premise}.', 'The call to adventure disrupts everything.', 'Meet the mentor and gain a first taste of the wider magic.', 'Cross into the unknown; the stakes of {premise} become clear.', 'Trials, allies, and enemies test the hero.', 'A hard-won victory reveals a deeper threat.', 'The midpoint reversal changes the mission entirely.', 'Enemies close in; loyalties fracture.', 'The darkest hour \u2014 the hero loses everything.', 'A new resolve and a bold final plan form.', 'The climactic confrontation over {premise}.', 'Resolution and a transformed world.'],
  Thriller: ['A gripping cold open establishes the threat behind {premise}.', 'The protagonist is pulled in against their will.', 'First clue \u2014 and first sign they\u2019re being watched.', 'A false lead costs precious time.', 'The stakes escalate to something personal.', 'Betrayal from an unexpected ally.', 'Midpoint: the true scope of {premise} is revealed.', 'On the run with the evidence.', 'The trap springs; capture or near-death.', 'A desperate gambit to turn the tables.', 'The final showdown with the mastermind.', 'Aftermath \u2014 the cost of the truth.'],
  Romance: ['Meet the lead and the ache that {premise} represents.', 'The meet-cute with the love interest.', 'Forced proximity sparks friction and attraction.', 'A shared vulnerability deepens the bond.', 'First real connection \u2014 and the fear that follows.', 'External pressure threatens the relationship.', 'Midpoint: a moment of true intimacy.', 'The misunderstanding that drives them apart.', 'The dark moment \u2014 all seems lost.', 'A grand realization about {premise}.', 'The grand gesture and reconciliation.', 'The happily-ever-after (or bittersweet close).'],
  'Literary Fiction': ['Establish voice, place, and the quiet weight of {premise}.', 'A small disruption unsettles the routine.', 'Backstory surfaces through memory.', 'A relationship strains under unspoken truths.', 'The protagonist makes a revealing choice.', 'Consequences ripple outward.', 'Midpoint: an epiphany reframes {premise}.', 'Old wounds reopen.', 'A reckoning the character has long avoided.', 'Acceptance begins to take shape.', 'A final, understated turning point.', 'An ambiguous, resonant close.'],
  Mystery: ['The crime and its discovery set against {premise}.', 'The investigator takes the case.', 'Interview the suspects; establish alibis.', 'A crucial clue hides in plain sight.', 'A red herring sends everyone astray.', 'A second incident raises the stakes.', 'Midpoint: a hidden connection emerges.', 'The investigator is warned off \u2014 or threatened.', 'The pieces begin to align.', 'A trap to draw out the culprit.', 'The reveal and confrontation.', 'Loose ends tied; the true cost weighed.'],
  'Non-Fiction': ['Hook the reader with the promise of {premise}.', 'Frame the problem and why it matters now.', 'The foundational concept, plainly explained.', 'Evidence and the core case study.', 'A counterargument, fairly addressed.', 'The turning-point insight.', 'A practical framework the reader can apply.', 'Common pitfalls and how to avoid them.', 'Advanced applications and edge cases.', 'Stories of transformation.', 'A step-by-step action plan.', 'The call to action and lasting takeaway.'],
};

function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }
const EXTRA = ['Deepen a subplot that mirrors the main arc.', 'Give a secondary character their own turning point.', 'Slow the pace for a quiet, character-revealing scene.', 'Plant a detail that pays off in the finale.', 'Raise the stakes with a ticking clock.'];

export default function BookOutlineGenerator() {
  const [genre, setGenre] = useState<Genre>('Fantasy');
  const [title, setTitle] = useState('Untitled');
  const [premise, setPremise] = useState('a cartographer who can redraw reality');
  const [chapters, setChapters] = useState(12);
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const build = () => {
    const seed = Math.floor(Math.random() * 9999) + tick;
    const p = premise.trim() || 'the central idea';
    const arc = ARCS[genre];
    const fill = (s: string) => s.replace(/\{premise\}/g, p);
    const lines: string[] = [];
    for (let i = 0; i < chapters; i++) {
      const base = i < arc.length ? arc[i] : pick(EXTRA, seed + i);
      lines.push(`Chapter ${i + 1}: ${fill(base)}`);
    }
    const header = `${genre.toUpperCase()} \u2014 "${title.trim() || 'Untitled'}"\nPremise: ${p}\nChapters: ${chapters}\n${'='.repeat(40)}`;
    return `${header}\n\n${lines.join('\n')}`;
  };

  const [outline, setOutline] = useState(() => build());
  const generate = () => { setTick(x => x + 1); setOutline(build()); };
  const copy = async () => { await navigator.clipboard.writeText(outline); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const download = () => {
    if (!outline) return;
    const blob = new Blob([outline], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'outline.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Library className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Book Outline Generator</h1><p className="text-blue-200 text-sm">genre + premise \u2192 chapter-by-chapter structure</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Turn a premise into a full chapter-by-chapter outline. Choose your genre, describe the core idea, and get a genre-aware arc scaled to the length you want.</p>
      </div>

      <div className="space-y-5">
        <div className="contents">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="bo-genre" className="block text-xs font-semibold text-gray-500 mb-1">Genre</label>
              <select id="bo-genre" value={genre} onChange={e => setGenre(e.target.value as Genre)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="bo-title" className="block text-xs font-semibold text-gray-500 mb-1">Working title</label>
              <input id="bo-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. The Paper Cartographer" />
            </div>
            <div>
              <label htmlFor="bo-premise" className="block text-xs font-semibold text-gray-500 mb-1">Premise</label>
              <textarea id="bo-premise" value={premise} onChange={e => setPremise(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none" placeholder="What is the book about?" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Chapters ({chapters})</label>
              <input type="range" min="8" max="30" value={chapters} onChange={e => setChapters(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>8</span><span>30</span></div>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Outline
            </button>
          </div>
        </div>

        <div className="contents">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm">Chapter Outline</h2>
              <div className="flex gap-2">
                <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
                <button onClick={download} disabled={!outline} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
            <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-[500px] overflow-y-auto p-5">{outline}</div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• 📚 Keep each chapter to a single clear purpose — momentum beats sprawl.</li>
              <li>• Put your biggest reversal near the midpoint to avoid a saggy middle.</li>
              <li>• Non-fiction? Each chapter should answer one reader question.</li>
              <li>• Draft the outline loosely, then let the story reshape it.</li>
              <li>• Save the copied outline and revise it as you write.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Book Chapter', href: '/book-chapter-generator' }, { label: 'Story Generator', href: '/story-generator' }, { label: 'Dialogue Generator', href: '/dialogue-generator' }, { label: 'Script Generator', href: '/script-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_bookoutline', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
