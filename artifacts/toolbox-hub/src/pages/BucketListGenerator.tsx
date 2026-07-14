import React, { useState, useEffect } from 'react';
import { ListChecks, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Plus, X } from 'lucide-react';
import { Link } from 'wouter';

type Category = 'travel' | 'adventure' | 'skills' | 'food' | 'giving';

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { id: 'skills', label: 'Skills', emoji: '🎯' },
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'giving', label: 'Giving Back', emoji: '💛' },
];

const IDEAS: Record<Category, string[]> = {
  travel: [
    'Watch the northern lights in Iceland or Norway',
    'Ride a train across a whole country',
    'Spend a night in an overwater bungalow',
    'Visit all seven continents',
    'See the pyramids of Egypt in person',
    'Take a road trip along a legendary coastal highway',
    'Explore the temples of Kyoto during cherry blossom season',
    'Go on a safari in the African savanna',
    'Stay in a castle for a night',
    'Hike part of the Camino de Santiago',
    'Float in the Dead Sea',
    'Visit a country where you don\u2019t speak the language',
    'See the Grand Canyon at sunrise',
    'Sail through the Greek islands',
    'Ride a hot air balloon over Cappadocia',
    'Experience a full moon party or lantern festival abroad',
    'Walk along the Great Wall of China',
    'Visit Machu Picchu',
    'Spend New Year\u2019s Eve in a different country',
    'Take an overnight sleeper train through the mountains',
    'Explore the canals of Venice by gondola',
    'See the Taj Mahal at dawn',
    'Visit a place where you can see zero light pollution',
    'Take a solo trip somewhere completely new',
    'Drive Route 66 end to end',
  ],
  adventure: [
    'Go skydiving',
    'Try scuba diving on a coral reef',
    'Climb to the summit of a mountain',
    'Go white-water rafting',
    'Try surfing a real wave',
    'Ride in a hot air balloon',
    'Go bungee jumping',
    'Sleep under the stars in the wilderness',
    'Try rock climbing outdoors',
    'Swim with dolphins or sharks (ethically)',
    'Go zip-lining through a forest canopy',
    'Take a paragliding flight',
    'Complete a triathlon or marathon',
    'Try snowboarding or skiing a black run',
    'Go on a multi-day backpacking trek',
    'Ride a horse along a beach',
    'Kayak through sea caves',
    'Try cave exploring or spelunking',
    'Go on a whale-watching expedition',
    'Camp beside a glacier or waterfall',
    'Learn to sail a small boat',
    'Try indoor or outdoor skydiving',
    'Do a polar plunge in icy water',
    'Ride a motorcycle across open country',
    'Go sandboarding down a desert dune',
  ],
  skills: [
    'Learn to play a musical instrument',
    'Become conversational in a new language',
    'Learn to cook a signature dish from scratch',
    'Take a pottery or ceramics class',
    'Learn basic self-defense',
    'Master a card or magic trick',
    'Learn to code a small app or website',
    'Take a photography course',
    'Learn to dance a specific style',
    'Write and finish a short story or book',
    'Learn calligraphy or hand lettering',
    'Take a public speaking class',
    'Learn to swim confidently',
    'Master the art of baking bread',
    'Learn to juggle',
    'Take an improv or acting workshop',
    'Learn to knit, crochet, or sew',
    'Build something with your own hands',
    'Learn to play chess well',
    'Take a mixology or barista course',
    'Learn to grow your own vegetables',
    'Master a yoga or meditation practice',
    'Learn to change a tire and basic car care',
    'Take an art class in painting or drawing',
    'Learn to whistle a tune or play the harmonica',
  ],
  food: [
    'Eat authentic street food in a bustling night market',
    'Take a cooking class in another country',
    'Try a tasting menu at a renowned restaurant',
    'Learn to make fresh pasta by hand',
    'Attend a food festival',
    'Try a cuisine you\u2019ve never had before',
    'Go on a wine, cheese, or coffee tasting tour',
    'Forage for wild mushrooms or berries with a guide',
    'Eat sushi in Japan',
    'Try authentic tacos from a street vendor',
    'Bake a cake completely from scratch',
    'Grow and cook with your own herbs',
    'Try the spiciest dish you can handle',
    'Host a themed dinner party for friends',
    'Learn to make homemade ice cream',
    'Visit a working farm and eat farm-to-table',
    'Try a traditional afternoon tea',
    'Sample chocolate at its country of origin',
    'Make your own pizza in a wood-fired oven',
    'Try a multi-course tasting at a food market',
    'Learn to brew your own coffee or tea properly',
    'Eat fresh seafood right by the ocean',
    'Try a dish cooked over an open fire',
    'Ferment your own kombucha, kimchi, or bread starter',
    'Recreate a dish from your favorite childhood memory',
  ],
  giving: [
    'Volunteer at a local shelter or food bank',
    'Plant a tree or start a small garden for others',
    'Mentor someone learning a skill you have',
    'Donate blood',
    'Organize a community clean-up day',
    'Sponsor a child or family in need',
    'Teach a free class in something you\u2019re good at',
    'Leave a generous, unexpected tip',
    'Foster or adopt a rescue animal',
    'Pay for a stranger\u2019s coffee or meal',
    'Start a monthly donation to a cause you care about',
    'Write thank-you notes to people who shaped you',
    'Help build homes with a volunteer organization',
    'Donate clothes, books, and things you no longer use',
    'Run or walk for a charity fundraiser',
    'Visit or call an elderly neighbor regularly',
    'Give blood or register as an organ donor',
    'Support a small local business intentionally',
    'Tutor a student for free',
    'Cook a meal for someone going through a hard time',
    'Create care packages for people in need',
    'Spend a day helping at an animal rescue',
    'Leave positive reviews for hardworking small businesses',
    'Teach a child to read or ride a bike',
    'Pass on a skill or family recipe to the next generation',
  ],
};

const STORAGE_KEY = 'bucketlist_saved';

const FAQS = [
  { q: 'How do I build my bucket list?', a: 'Pick a category, generate suggestions, then tap the plus on any idea to add it to your personal list. Your list is saved automatically on this device.' },
  { q: 'Is my list private?', a: 'Yes. It is stored only in your browser\u2019s local storage — nothing is uploaded and no account is needed.' },
  { q: 'Will I lose my list if I refresh?', a: 'No. Your saved items persist across refreshes and visits until you remove them or clear your browser data.' },
  { q: 'Can I copy my whole list?', a: 'Yes — use "Copy List" to grab your saved goals as a numbered list to paste into notes, docs, or a journal.' },
  { q: 'Does this work offline?', a: 'Completely. All 100+ ideas ship inside the app and saving works with no connection.' },
];

const RELATED = [
  { label: 'Gift Idea Generator', href: '/gift-idea-generator' },
  { label: 'Conversation Starters', href: '/conversation-starter-generator' },
  { label: 'Would You Rather', href: '/would-you-rather' },
  { label: 'Random Fact Generator', href: '/random-fact-generator' },
];

function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export default function BucketListGenerator() {
  const [category, setCategory] = useState<Category>('travel');
  const [suggestions, setSuggestions] = useState<string[]>(() => sample(IDEAS.travel, 6));
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // storage unavailable — list simply won't persist
    }
  }, [saved]);

  const generate = (c: Category = category) => setSuggestions(sample(IDEAS[c], 6));

  const changeCategory = (c: Category) => {
    setCategory(c);
    generate(c);
  };

  const addItem = (item: string) => {
    setSaved(prev => (prev.includes(item) ? prev : [...prev, item]));
  };

  const removeItem = (item: string) => {
    setSaved(prev => prev.filter(i => i !== item));
  };

  const copyList = async () => {
    if (saved.length === 0) return;
    await navigator.clipboard.writeText(saved.map((s, i) => `${i + 1}. ${s}`).join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><ListChecks className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Bucket List Generator</h1><p className="text-blue-200 text-sm">travel · adventure · skills · food · giving back</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Get inspired with fresh life-goal ideas, then build your own bucket list that saves right in your browser — no account required.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => changeCategory(c.id)}
                    aria-pressed={category === c.id}
                    className={`flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2.5 border transition-all ${category === c.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'}`}
                  >
                    <span aria-hidden="true">{c.emoji}</span> {c.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => generate()} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Ideas
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-3">Suggestions</h2>
            <div className="space-y-2 animate-in fade-in duration-200">
              {suggestions.map((s, i) => {
                const already = saved.includes(s);
                return (
                  <div key={s + i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 hover:border-blue-200 transition-all">
                    <span className="flex-1 text-sm text-gray-700 leading-snug">{s}</span>
                    <button
                      onClick={() => addItem(s)}
                      disabled={already}
                      aria-label={already ? 'Already added' : `Add "${s}" to your list`}
                      className={`shrink-0 p-1.5 rounded-lg transition-colors ${already ? 'text-emerald-500' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                    >
                      {already ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Mix big dreams with small, doable goals to keep momentum.</li>
              <li>• Add a rough date or year to a goal to make it feel real.</li>
              <li>• Revisit your list every few months and celebrate what you've done.</li>
              <li>• Share a goal with a friend so you'll hold each other to it.</li>
              <li>• Balance the fun stuff with meaningful "giving back" goals.</li>
              <li>• Copy your list into a journal or planner to track progress.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">My Bucket List {saved.length > 0 && <span className="text-gray-400 font-normal">({saved.length})</span>}</h2>
              <button onClick={copyList} disabled={saved.length === 0} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied List</> : <><Copy className="w-3.5 h-3.5" /> Copy List</>}
              </button>
            </div>
            {saved.length === 0 ? (
              <div className="rounded-xl bg-gray-50 border border-dashed border-gray-200 px-6 py-12 text-center">
                <p className="text-sm text-gray-500">Your bucket list is empty. Tap the <Plus className="w-3.5 h-3.5 inline text-blue-600" aria-hidden="true" /> on any suggestion to add it here.</p>
              </div>
            ) : (
              <ol className="space-y-2">
                {saved.map((item, i) => (
                  <li key={item + i} className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="flex-1 text-sm text-gray-800 leading-snug">{item}</span>
                    <button onClick={() => removeItem(item)} aria-label={`Remove "${item}"`} className="shrink-0 text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {RELATED.map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_bucket-list', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
