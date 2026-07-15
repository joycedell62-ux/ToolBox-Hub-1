import React, { useState } from 'react';
import { BookOpen, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Does this write a whole story?', a: 'It generates a complete short-story draft assembled from curated template banks based on your genre, characters, setting, and twist. Use it as a first draft to revise and expand.' },
  { q: 'Which genres are available?', a: 'Fantasy, science fiction, mystery, romance, horror, and adventure — each with its own openings, conflicts, and turning points.' },
  { q: 'Is it private and offline?', a: 'Completely. The story is built in your browser from bundled banks; nothing is uploaded.' },
  { q: 'What does the twist field do?', a: 'It seeds a reversal near the climax. Leave it blank and the generator picks a genre-appropriate surprise for you.' },
  { q: 'Can I get a different story?', a: 'Yes — press Generate again to remix openings, midpoints, and endings.' },
];

const GENRES = ['Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Horror', 'Adventure'] as const;
type Genre = typeof GENRES[number];

const OPENINGS: Record<Genre, string[]> = {
  Fantasy: ['In the kingdom of {setting}, where magic hummed beneath every stone, {hero} woke to a sky the color of old bruises.', 'They said no one returned from {setting}. {hero} intended to prove them wrong.', 'The prophecy named {hero}, though {hero} had never wanted to be named at all.'],
  'Science Fiction': ['The station clock read 03:00 when {hero} first heard the signal echo through {setting}.', 'Earth was a memory. {setting} was home now, and {hero} was its reluctant keeper.', 'The AI had gone silent for exactly nine hours before {hero} noticed.'],
  Mystery: ['The letter arrived without a stamp, and {hero} knew {setting} would never be the same.', 'Everyone in {setting} had an alibi. That was the first thing that bothered {hero}.', 'It began, as these things do, with a locked door in {setting} and no key.'],
  Romance: ['{hero} had sworn off love the same week they moved to {setting}. Then the rain started.', 'Of all the cafes in {setting}, {villain} had to walk into that one.', 'They met once, briefly, in {setting} \u2014 and {hero} never quite recovered.'],
  Horror: ['The house in {setting} had been empty for years. It was not empty now.', '{hero} should have listened to the warnings about {setting}. By midnight, it was too late.', 'Something in {setting} was breathing, and it was not {hero}.'],
  Adventure: ['The map was half-burned, but {hero} could still make out one word: {setting}.', '{hero} had exactly one rule about {setting}: never go alone. Today, {hero} broke it.', 'The expedition to {setting} was supposed to take three days. It was day nine.'],
};
const MIDS: Record<Genre, string[]> = {
  Fantasy: ['The ancient door yielded, and with it came a truth {hero} was not ready to carry.', 'Allies became enemies as the old magic demanded a terrible price.'],
  'Science Fiction': ['The data didn\u2019t lie: the mission had been compromised from the start.', 'The signal was not a message. It was a countdown.'],
  Mystery: ['Every clue pointed one direction \u2014 which is exactly why {hero} looked the other way.', 'The witness changed their story, and the whole case tilted on its axis.'],
  Romance: ['One misread text, and everything they\u2019d built began to unravel.', 'The choice was impossible: the safe life, or the one that made their heart race.'],
  Horror: ['The lights failed. In the dark, the whispering grew closer.', '{hero} found the others \u2014 or what the house had left of them.'],
  Adventure: ['The bridge collapsed behind them; there was no going back now.', 'The treasure was real. So was the guardian standing between them and it.'],
};
const TWISTS = ['But the true enemy had been standing beside them the entire time.', 'The rescuer they trusted was the one who set the trap.', 'What they sought had been inside them all along.', 'The map led not to riches, but to a mirror.', 'The dead were not as dead as everyone believed.', 'Victory came at the cost of the one thing they swore to protect.'];
const ENDINGS: Record<Genre, string[]> = {
  Fantasy: ['And so {hero} laid down the crown they never asked for, and the kingdom of {setting} breathed again.', 'The magic faded, but the legend of {hero} would outlast every stone of {setting}.'],
  'Science Fiction': ['{hero} sent the final transmission, and {setting} drifted quietly into the dark.', 'Humanity would never know how close it came. {hero} preferred it that way.'],
  Mystery: ['{hero} closed the file. {setting} could sleep again \u2014 for now.', 'The truth, once spoken, cost more than the lie ever had.'],
  Romance: ['In the end, {hero} chose the thundering heart over the quiet one, and never looked back.', 'Love, it turned out, was not a place in {setting} \u2014 it was a person.'],
  Horror: ['{hero} escaped {setting}. The house simply waited for the next set of headlights.', 'They never spoke of {setting} again. But some nights, the walls still breathed.'],
  Adventure: ['{hero} returned from {setting} changed \u2014 richer in scars than in gold.', 'The journey ended, but {hero} already felt the pull of the next horizon.'],
};

function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

export default function StoryGenerator() {
  const [genre, setGenre] = useState<Genre>('Fantasy');
  const [hero, setHero] = useState('Mira');
  const [villain, setVillain] = useState('a hooded stranger');
  const [setting, setSetting] = useState('Ashfell');
  const [twist, setTwist] = useState('');
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const build = () => {
    const seed = Math.floor(Math.random() * 9999) + tick;
    const h = hero.trim() || 'the hero';
    const v = villain.trim() || 'a shadow';
    const s = setting.trim() || 'a distant land';
    const fill = (str: string) => str.replace(/\{hero\}/g, h).replace(/\{villain\}/g, v).replace(/\{setting\}/g, s);
    const twistLine = twist.trim() ? twist.trim() : pick(TWISTS, seed + 5);
    const title = `${genre.toUpperCase()} \u2014 "${s}"\n${'='.repeat(40)}`;
    const p1 = fill(pick(OPENINGS[genre], seed));
    const p2 = `${h} pressed on. ${fill(pick(MIDS[genre], seed + 2))}`;
    const p3 = `Just when the path seemed clear, everything changed. ${fill(twistLine)}`;
    const p4 = `${h} faced ${v} at last. The confrontation would decide the fate of ${s}.`;
    const p5 = fill(pick(ENDINGS[genre], seed + 4));
    return `${title}\n\n${p1}\n\n${p2}\n\n${p3}\n\n${p4}\n\n${p5}`;
  };

  const [story, setStory] = useState(() => build());
  const generate = () => { setTick(x => x + 1); setStory(build()); };
  const copy = async () => { await navigator.clipboard.writeText(story); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const download = () => {
    if (!story) return;
    const blob = new Blob([story], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'story.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><BookOpen className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Story Generator</h1><p className="text-blue-200 text-sm">genre · characters · setting · twist \u2192 a short story</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Spin up a complete short-story draft from a handful of choices. Pick a genre, name your hero and villain, set the scene, and let the curated banks weave a beginning, twist, and ending.</p>
      </div>

      <div className="space-y-5">
        <div className="contents">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="st-genre" className="block text-xs font-semibold text-gray-500 mb-1">Genre</label>
              <select id="st-genre" value={genre} onChange={e => setGenre(e.target.value as Genre)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="st-hero" className="block text-xs font-semibold text-gray-500 mb-1">Protagonist</label>
              <input id="st-hero" type="text" value={hero} onChange={e => setHero(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. Mira" />
            </div>
            <div>
              <label htmlFor="st-villain" className="block text-xs font-semibold text-gray-500 mb-1">Antagonist / other character</label>
              <input id="st-villain" type="text" value={villain} onChange={e => setVillain(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. the Iron Duke" />
            </div>
            <div>
              <label htmlFor="st-setting" className="block text-xs font-semibold text-gray-500 mb-1">Setting</label>
              <input id="st-setting" type="text" value={setting} onChange={e => setSetting(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. a drowned city" />
            </div>
            <div>
              <label htmlFor="st-twist" className="block text-xs font-semibold text-gray-500 mb-1">Twist (optional)</label>
              <input id="st-twist" type="text" value={twist} onChange={e => setTwist(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="leave blank for a surprise" />
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Story
            </button>
          </div>
        </div>

        <div className="contents">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm">Your Story</h2>
              <div className="flex gap-2">
                <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
                <button onClick={download} disabled={!story} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
            <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-[500px] overflow-y-auto p-5">{story}</div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• 📖 Give your hero a clear want in the first paragraph — it drives everything.</li>
              <li>• A great twist recontextualizes what came before, not just what comes next.</li>
              <li>• Use vivid, specific settings; \u201ca drowned cathedral\u201d beats \u201ca city.\u201d</li>
              <li>• Regenerate a few drafts and stitch the best lines together.</li>
              <li>• End on an image, not an explanation.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Book Outline', href: '/book-outline-generator' }, { label: 'Book Chapter', href: '/book-chapter-generator' }, { label: 'Dialogue Generator', href: '/dialogue-generator' }, { label: 'Script Generator', href: '/script-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_story', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
