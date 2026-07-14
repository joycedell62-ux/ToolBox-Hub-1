import React, { useState } from 'react';
import { Scale, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Are these questions family-friendly?', a: 'Yes. Every "would you rather" is clean and suitable for all ages — great for kids, classrooms, and family gatherings.' },
  { q: 'Do my votes get saved or shared?', a: 'Your vote simply highlights an option locally for fun. Nothing is uploaded, tracked, or shared — it all stays in your browser.' },
  { q: 'Can I choose a category?', a: 'Absolutely. Pick Silly, Food, Superpowers, Travel, or leave it on "All" for a random mix.' },
  { q: 'Will questions repeat?', a: 'The generator avoids showing the same question you just saw, so each "Next" feels fresh.' },
  { q: 'Does this need the internet?', a: 'No. All questions are built into the app and work fully offline.' },
];

type Category = 'silly' | 'food' | 'powers' | 'travel';
interface WYR { a: string; b: string; category: Category; }

const QUESTIONS: WYR[] = [
  { category: 'silly', a: 'have fingers as long as your legs', b: 'have legs as short as your fingers' },
  { category: 'silly', a: 'always have to hop instead of walk', b: 'always have to sing instead of talk' },
  { category: 'silly', a: 'sneeze glitter every time you sneeze', b: 'burp bubbles every time you burp' },
  { category: 'silly', a: 'have a permanent clown nose', b: 'have permanently rainbow hair' },
  { category: 'silly', a: 'wear shoes on the wrong feet forever', b: 'wear your shirt backwards forever' },
  { category: 'silly', a: 'speak only in rhymes', b: 'speak only in questions' },
  { category: 'silly', a: 'have a pet dragon the size of a cat', b: 'have a pet cat the size of a dragon' },
  { category: 'silly', a: 'be able to talk to animals', b: 'be able to talk to plants' },
  { category: 'silly', a: 'have hiccups for a year', b: 'feel like you need to sneeze for a year' },
  { category: 'silly', a: 'have a tail that wags when you\'re happy', b: 'have ears that flap when you\'re excited' },
  { category: 'silly', a: 'always be 10 minutes late', b: 'always be 20 minutes early' },
  { category: 'silly', a: 'have spaghetti for hair', b: 'have marshmallows for teeth' },

  { category: 'food', a: 'only eat pizza for the rest of your life', b: 'only eat tacos for the rest of your life' },
  { category: 'food', a: 'give up chocolate forever', b: 'give up ice cream forever' },
  { category: 'food', a: 'have unlimited free pizza', b: 'have unlimited free sushi' },
  { category: 'food', a: 'eat only sweet foods', b: 'eat only salty foods' },
  { category: 'food', a: 'never eat cheese again', b: 'never eat bread again' },
  { category: 'food', a: 'have a kitchen that cooks any meal instantly', b: 'have a fridge that\'s always fully stocked' },
  { category: 'food', a: 'drink only smoothies', b: 'drink only soup' },
  { category: 'food', a: 'have breakfast foods for every meal', b: 'have dessert for every meal' },
  { category: 'food', a: 'eat a giant cookie every day', b: 'eat a giant donut every day' },
  { category: 'food', a: 'be a world-famous chef', b: 'be a world-famous food critic' },
  { category: 'food', a: 'always have spicy food', b: 'always have super mild food' },
  { category: 'food', a: 'have popcorn that never runs out', b: 'have candy that never runs out' },

  { category: 'powers', a: 'be able to fly', b: 'be able to turn invisible' },
  { category: 'powers', a: 'have super strength', b: 'have super speed' },
  { category: 'powers', a: 'be able to teleport anywhere', b: 'be able to time travel' },
  { category: 'powers', a: 'read minds', b: 'see the future' },
  { category: 'powers', a: 'breathe underwater', b: 'survive in outer space' },
  { category: 'powers', a: 'control the weather', b: 'control plants' },
  { category: 'powers', a: 'have a photographic memory', b: 'be able to learn any skill instantly' },
  { category: 'powers', a: 'be able to talk to any animal', b: 'be able to speak every human language' },
  { category: 'powers', a: 'freeze time for everyone but you', b: 'rewind time by one minute anytime' },
  { category: 'powers', a: 'shrink to the size of an ant', b: 'grow as tall as a building' },
  { category: 'powers', a: 'have laser vision', b: 'have super hearing' },
  { category: 'powers', a: 'be able to heal any injury', b: 'never feel tired' },

  { category: 'travel', a: 'explore outer space', b: 'explore the deep ocean' },
  { category: 'travel', a: 'visit every country once', b: 'live in one amazing city forever' },
  { category: 'travel', a: 'travel to the past', b: 'travel to the future' },
  { category: 'travel', a: 'go on a safari in Africa', b: 'go on a hike through the Amazon' },
  { category: 'travel', a: 'take a road trip', b: 'take a cruise' },
  { category: 'travel', a: 'always travel by train', b: 'always travel by hot air balloon' },
  { category: 'travel', a: 'spend a week on a tropical beach', b: 'spend a week in a snowy mountain cabin' },
  { category: 'travel', a: 'visit the Great Wall of China', b: 'visit the pyramids of Egypt' },
  { category: 'travel', a: 'live on a houseboat', b: 'live in a treehouse' },
  { category: 'travel', a: 'travel the world for free but alone', b: 'travel to one place with all your friends' },
  { category: 'travel', a: 'camp under the stars', b: 'stay in a fancy hotel' },
  { category: 'travel', a: 'explore ancient ruins', b: 'explore modern megacities' },
];

const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'silly', label: 'Silly' },
  { id: 'food', label: 'Food' },
  { id: 'powers', label: 'Superpowers' },
  { id: 'travel', label: 'Travel' },
];

export default function WouldYouRatherGenerator() {
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [lastIndex, setLastIndex] = useState(-1);
  const [current, setCurrent] = useState<WYR | null>(null);
  const [vote, setVote] = useState<'a' | 'b' | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const next = () => {
    const pool = QUESTIONS.map((q, i) => ({ q, i })).filter(x => category === 'all' || x.q.category === category);
    let choices = pool.filter(x => x.i !== lastIndex);
    if (choices.length === 0) choices = pool;
    const chosen = choices[Math.floor(Math.random() * choices.length)];
    setLastIndex(chosen.i);
    setCurrent(chosen.q);
    setVote(null);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Scale className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Would You Rather</h1><p className="text-blue-200 text-sm">silly · food · superpowers · travel</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Tricky, fun choices with two tempting options. Tap the one you\'d pick, then hit next. Family-friendly and 100% offline.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id)} className={`text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors ${category === c.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>{c.label}</button>
                ))}
              </div>
            </div>
            <button onClick={next} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> {current ? 'Next Question' : 'Start'}
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Tap the option you\'d choose — it lights up to mark your pick.</li>
              <li>• Ask friends to vote too and compare answers.</li>
              <li>• Filter by category to match the mood of your group.</li>
              <li>• Explain your reasoning for extra debate and laughs.</li>
              <li>• No repeats back-to-back, so keep hitting next.</li>
              <li>• Perfect for parties, car rides, and classrooms. ⚖️</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[300px] flex flex-col items-center justify-center">
            {!current ? (
              <div className="text-gray-400 flex flex-col items-center gap-3 text-center">
                <Scale className="w-16 h-16 text-blue-300" aria-hidden="true" />
                <p className="text-sm">Press "Start" for your first tough choice!</p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300 w-full flex flex-col items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wide text-blue-500">{CATEGORIES.find(c => c.id === current.category)?.label} · Would you rather…</span>
                <div className="grid sm:grid-cols-2 gap-4 w-full">
                  {(['a', 'b'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setVote(opt)}
                      aria-pressed={vote === opt}
                      className={`rounded-2xl border-2 p-6 text-center transition-all min-h-[140px] flex flex-col items-center justify-center gap-3 ${vote === opt ? 'border-blue-600 bg-blue-50 scale-[1.02] shadow-sm' : vote ? 'border-gray-100 bg-white opacity-60 hover:opacity-100' : 'border-gray-100 bg-white hover:border-blue-300'}`}
                    >
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${vote === opt ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{opt === 'a' ? 'Option A' : 'Option B'}</span>
                      <span className="text-base font-bold text-gray-900 leading-snug">{opt === 'a' ? current.a : current.b}</span>
                    </button>
                  ))}
                </div>
                {vote && <p className="text-sm text-blue-600 font-semibold animate-in fade-in duration-200">Nice pick! Tap "Next Question" for another.</p>}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Word & Meaning', href: '/word-meaning-generator' }, { label: 'Random Joke', href: '/random-joke-generator' }, { label: 'Conversation Starters', href: '/conversation-starter-generator' }, { label: 'Icebreaker Questions', href: '/icebreaker-questions' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_would-you-rather', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
