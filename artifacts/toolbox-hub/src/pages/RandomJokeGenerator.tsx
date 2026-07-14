import React, { useState } from 'react';
import { Laugh, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Eye } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Are these jokes family-friendly?', a: 'Yes! Every joke in the bank is clean and suitable for all ages — perfect for kids, classrooms, and family game nights.' },
  { q: 'How does the reveal work?', a: 'For setup/punchline jokes, the punchline is hidden until you click "Reveal Punchline" — so you can build suspense or guess first.' },
  { q: 'Can I pick a category?', a: 'Absolutely. Choose Puns, Dad Jokes, One-liners, or Programming, or leave it on "All" for a random mix.' },
  { q: 'Will I get the same joke twice in a row?', a: 'The generator avoids repeating the joke you just saw, so consecutive draws feel fresh.' },
  { q: 'Does this need the internet?', a: 'No. All jokes are built into the app and run offline. Nothing is sent anywhere.' },
];

type Category = 'puns' | 'dad' | 'oneliner' | 'programming';
interface Joke { setup?: string; punchline: string; category: Category; }

const JOKES: Joke[] = [
  { category: 'dad', setup: 'Why don\'t scientists trust atoms?', punchline: 'Because they make up everything!' },
  { category: 'dad', setup: 'What do you call a fake noodle?', punchline: 'An impasta.' },
  { category: 'dad', setup: 'Why did the scarecrow win an award?', punchline: 'Because he was outstanding in his field.' },
  { category: 'dad', setup: 'What do you call cheese that isn\'t yours?', punchline: 'Nacho cheese!' },
  { category: 'dad', setup: 'Why did the bicycle fall over?', punchline: 'Because it was two-tired.' },
  { category: 'dad', setup: 'How do you organize a space party?', punchline: 'You planet.' },
  { category: 'dad', setup: 'Why can\'t you give Elsa a balloon?', punchline: 'Because she will let it go.' },
  { category: 'dad', setup: 'What did the ocean say to the beach?', punchline: 'Nothing, it just waved.' },
  { category: 'dad', setup: 'Why did the coffee file a police report?', punchline: 'It got mugged.' },
  { category: 'dad', setup: 'How does a penguin build its house?', punchline: 'Igloos it together.' },
  { category: 'dad', setup: 'What do you call a bear with no teeth?', punchline: 'A gummy bear.' },
  { category: 'dad', setup: 'Why did the golfer bring two pairs of pants?', punchline: 'In case he got a hole in one.' },
  { category: 'dad', setup: 'What do you call a factory that makes okay products?', punchline: 'A satisfactory.' },
  { category: 'dad', setup: 'Why don\'t eggs tell jokes?', punchline: 'They\'d crack each other up.' },
  { category: 'dad', setup: 'What did one wall say to the other wall?', punchline: 'I\'ll meet you at the corner.' },

  { category: 'puns', setup: 'I used to be a banker,', punchline: 'but I lost interest.' },
  { category: 'puns', setup: 'I\'m reading a book about anti-gravity.', punchline: 'It\'s impossible to put down.' },
  { category: 'puns', setup: 'I wondered why the baseball kept getting bigger.', punchline: 'Then it hit me.' },
  { category: 'puns', setup: 'The math book looked so sad because', punchline: 'it had too many problems.' },
  { category: 'puns', setup: 'I tried to catch some fog earlier.', punchline: 'I mist.' },
  { category: 'puns', setup: 'Time flies like an arrow.', punchline: 'Fruit flies like a banana.' },
  { category: 'puns', setup: 'I don\'t trust stairs.', punchline: 'They\'re always up to something.' },
  { category: 'puns', setup: 'A boiled egg every morning', punchline: 'is hard to beat.' },
  { category: 'puns', setup: 'I once got fired from the calendar factory.', punchline: 'I just took a day off.' },
  { category: 'puns', setup: 'Broken pencils', punchline: 'are pointless.' },
  { category: 'puns', setup: 'I used to hate facial hair,', punchline: 'but then it grew on me.' },
  { category: 'puns', setup: 'What\'s the best thing about Switzerland?', punchline: 'I don\'t know, but the flag is a big plus.' },
  { category: 'puns', setup: 'I\'m on a seafood diet.', punchline: 'I see food and I eat it.' },
  { category: 'puns', setup: 'The shovel was a groundbreaking invention,', punchline: 'but everyone digs it.' },
  { category: 'puns', setup: 'I wasn\'t going to make a sodium joke,', punchline: 'but then I thought, Na.' },

  { category: 'oneliner', punchline: 'I told my suitcase we\'re not going on vacation. Now I\'m dealing with emotional baggage.' },
  { category: 'oneliner', punchline: 'My wallet is like an onion — opening it makes me cry.' },
  { category: 'oneliner', punchline: 'I have a lot of growing up to do. I realized that the other day inside my fort.' },
  { category: 'oneliner', punchline: 'The early bird can have the worm, because worms are gross and mornings are hard.' },
  { category: 'oneliner', punchline: 'I named my dog "5 Miles" so I can tell people I walk 5 Miles every day.' },
  { category: 'oneliner', punchline: 'I only know 25 letters of the alphabet. I don\'t know y.' },
  { category: 'oneliner', punchline: 'I\'m great at multitasking. I can waste time, be unproductive, and procrastinate all at once.' },
  { category: 'oneliner', punchline: 'My bed is a magical place where I suddenly remember everything I forgot to do.' },
  { category: 'oneliner', punchline: 'I put my phone on airplane mode, but it\'s not flying anywhere.' },
  { category: 'oneliner', punchline: 'Parallel lines have so much in common. It\'s a shame they\'ll never meet.' },
  { category: 'oneliner', punchline: 'I can resist everything except temptation... and cookies.' },
  { category: 'oneliner', punchline: 'Autocorrect can go straight to he\'ll.' },
  { category: 'oneliner', punchline: 'I\'m not lazy, I\'m on energy-saving mode.' },
  { category: 'oneliner', punchline: 'Common sense is like deodorant. The people who need it most never use it.' },
  { category: 'oneliner', punchline: 'I used to think I was indecisive, but now I\'m not so sure.' },

  { category: 'programming', setup: 'Why do programmers prefer dark mode?', punchline: 'Because light attracts bugs.' },
  { category: 'programming', setup: 'How many programmers does it take to change a light bulb?', punchline: 'None — that\'s a hardware problem.' },
  { category: 'programming', setup: 'Why do Java developers wear glasses?', punchline: 'Because they don\'t C#.' },
  { category: 'programming', setup: 'Why was the JavaScript developer sad?', punchline: 'Because they didn\'t Node how to Express themselves.' },
  { category: 'programming', setup: 'How do you comfort a JavaScript bug?', punchline: 'You console it.' },
  { category: 'programming', setup: 'Why did the developer go broke?', punchline: 'Because they used up all their cache.' },
  { category: 'programming', setup: 'What\'s a programmer\'s favorite hangout spot?', punchline: 'The Foo Bar.' },
  { category: 'programming', setup: 'Why do Python programmers wear glasses?', punchline: 'Because they can\'t C.' },
  { category: 'programming', setup: 'There are 10 types of people in the world:', punchline: 'those who understand binary and those who don\'t.' },
  { category: 'programming', setup: 'Why did the programmer quit their job?', punchline: 'They didn\'t get arrays.' },
  { category: 'programming', setup: 'What do you call a programmer from Finland?', punchline: 'Nerdic.' },
  { category: 'programming', setup: 'A SQL query walks into a bar, approaches two tables and asks:', punchline: '"Can I join you?"' },
  { category: 'programming', setup: 'Why was the function so clingy?', punchline: 'It had too many dependencies.' },
  { category: 'programming', setup: 'Why did the developer stay calm during the outage?', punchline: 'They knew it was just a temporary state.' },
  { category: 'programming', setup: 'What\'s the object-oriented way to become wealthy?', punchline: 'Inheritance.' },
];

const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'puns', label: 'Puns' },
  { id: 'dad', label: 'Dad Jokes' },
  { id: 'oneliner', label: 'One-liners' },
  { id: 'programming', label: 'Programming' },
];

export default function RandomJokeGenerator() {
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [lastIndex, setLastIndex] = useState(-1);
  const [current, setCurrent] = useState<Joke | null>(null);
  const [showPunchline, setShowPunchline] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const tellJoke = () => {
    const pool = JOKES.map((j, i) => ({ j, i })).filter(x => category === 'all' || x.j.category === category);
    let choices = pool.filter(x => x.i !== lastIndex);
    if (choices.length === 0) choices = pool;
    const chosen = choices[Math.floor(Math.random() * choices.length)];
    setLastIndex(chosen.i);
    setCurrent(chosen.j);
    setShowPunchline(!chosen.j.setup);
  };

  const jokeText = current ? (current.setup ? `${current.setup}\n${current.punchline}` : current.punchline) : '';
  const copy = async () => {
    if (!current) return;
    try { await navigator.clipboard.writeText(jokeText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Laugh className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Random Joke Generator</h1><p className="text-blue-200 text-sm">puns · dad jokes · one-liners · programming</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">A big bank of clean, family-friendly jokes with a hide-the-punchline reveal. Pick a category or get a random mix — 100% offline.</p>
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
            <button onClick={tellJoke} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Tell Me a Joke
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Guess the punchline before you reveal it for extra fun.</li>
              <li>• Filter by "Programming" for the coder crowd.</li>
              <li>• All jokes are clean — great for kids and classrooms.</li>
              <li>• Use the Copy button to share a joke in chat.</li>
              <li>• Keep tapping — you won\'t get the same joke twice in a row.</li>
              <li>• Dad jokes are best delivered with a straight face. 😄</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 min-h-[240px] flex flex-col items-center justify-center text-center">
            {!current ? (
              <div className="text-gray-400 flex flex-col items-center gap-3">
                <Laugh className="w-16 h-16 text-blue-300" aria-hidden="true" />
                <p className="text-sm">Hit "Tell Me a Joke" to get started!</p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300 w-full flex flex-col items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wide text-blue-500">{CATEGORIES.find(c => c.id === current.category)?.label}</span>
                {current.setup && <p className="text-lg font-bold text-gray-900 max-w-lg leading-relaxed">{current.setup}</p>}
                {showPunchline ? (
                  <p className="text-lg font-semibold text-blue-700 max-w-lg leading-relaxed animate-in fade-in zoom-in duration-300">{current.punchline}</p>
                ) : (
                  <button onClick={() => setShowPunchline(true)} className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors">
                    <Eye className="w-4 h-4" /> Reveal Punchline
                  </button>
                )}
                {showPunchline && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={copy} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors">
                      {copied ? <><Check className="w-4 h-4 text-emerald-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                    </button>
                    <button onClick={tellJoke} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors">
                      <RefreshCw className="w-4 h-4" /> Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Truth or Dare', href: '/truth-or-dare' }, { label: 'Would You Rather', href: '/would-you-rather' }, { label: 'Ask Abigail', href: '/ask-abigail' }, { label: 'Random Fact', href: '/random-fact-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_random-joke-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
