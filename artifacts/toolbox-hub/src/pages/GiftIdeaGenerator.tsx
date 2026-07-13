import React, { useState } from 'react';
import { Gift, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Shuffle } from 'lucide-react';
import { Link } from 'wouter';

const GIFT_DB: Record<string, Record<string, string[]>> = {
  child: {
    'Art & Creative': ['Watercolor paint set', 'Lego building kit', 'Kinetic sand set', 'Crayola crayon collection', 'Sketch pad & pencils'],
    'Learning': ['Educational tablet for kids', 'Science experiment kit', 'Kids coding board game', 'World map puzzle', 'Children\'s encyclopedia set'],
    'Outdoor': ['Jump rope', 'Bubble machine', 'Sidewalk chalk set', 'Mini basketball hoop', 'Kite'],
    'Fun': ['Slime-making kit', 'Card game collection', 'Play-Doh mega set', 'Remote control car', 'Magic tricks kit'],
  },
  teen: {
    'Tech': ['Wireless earbuds', 'Phone stand & ring light', 'Portable charger', 'Gaming headset', 'Smart LED strip lights'],
    'Creative': ['Polaroid camera', 'Sketch journal set', 'DIY bracelet kit', 'Bullet journal starter pack', 'Candle-making kit'],
    'Fashion': ['Gift card to favourite store', 'Customisable sneakers', 'Aesthetic phone case set', 'Trendy water bottle', 'Scented lotion gift set'],
    'Entertainment': ['Netflix/Spotify gift card', 'Board game', 'Journaling kit', 'Book from bestseller list', 'Puzzle (1000 piece)'],
  },
  adult: {
    'Home': ['Scented candle set', 'Coffee machine', 'Cozy blanket throw', 'Personalised mug', 'Indoor plant with pot'],
    'Wellness': ['Yoga mat', 'Massage gun', 'Sleep mask & earplugs set', 'Essential oil diffuser', 'Meal delivery subscription'],
    'Experiences': ['Restaurant voucher', 'Spa day voucher', 'Wine tasting experience', 'Cooking class', 'Escape room tickets'],
    'Practical': ['Leather wallet', 'Insulated water bottle', 'Portable bluetooth speaker', 'Cable organiser set', 'Wireless charging pad'],
  },
  senior: {
    'Comfort': ['Heated blanket', 'Memory foam slippers', 'Large-button phone', 'Reclining chair cushion', 'Weighted blanket'],
    'Hobbies': ['Gardening tool set', 'Jigsaw puzzle (500 piece)', 'Knitting starter kit', 'Audiobook subscription', 'Bird feeder & guide book'],
    'Health': ['Pill organiser with alarm', 'Compression socks set', 'Digital blood pressure monitor', 'Step tracker', 'Vitamin supplement basket'],
    'Connection': ['Digital photo frame (with WiFi)', 'Video call tablet setup', 'Family recipe book (custom)', 'Memory journal', 'Prepaid calling card'],
  },
};

const BUDGETS = ['Under $25', '$25–$50', '$50–$100', '$100–$200', '$200+'];
const OCCASIONS = ['Birthday', 'Christmas', 'Anniversary', 'Graduation', 'Valentine\'s Day', 'Mother\'s Day', 'Father\'s Day', 'Just Because'];
const FAQS = [
  { q: 'Are these suggestions personalised?', a: 'They are tailored by age group and interests. The more interests you select, the more targeted the suggestions.' },
  { q: 'Can I shuffle for new ideas?', a: 'Yes — click "New Ideas" to get a fresh set of suggestions from your selected categories.' },
  { q: 'Does budget affect the results?', a: 'Currently budget is noted for context. Future versions will filter by price range.' },
];

export default function GiftIdeaGenerator() {
  const [ageGroup, setAgeGroup] = useState<'child' | 'teen' | 'adult' | 'senior'>('adult');
  const [budget, setBudget] = useState('$25–$50');
  const [occasion, setOccasion] = useState('Birthday');
  const [seed, setSeed] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const categories = GIFT_DB[ageGroup];
  const results = Object.entries(categories).map(([cat, ideas]) => ({
    cat,
    picked: ideas[(seed + ideas.indexOf(ideas[seed % ideas.length])) % ideas.length],
  }));

  // Pick 2 ideas per category deterministically based on seed
  const getIdeas = (ideas: string[]) => {
    const a = ideas[seed % ideas.length];
    const b = ideas[(seed + 2) % ideas.length];
    return [a, b === a ? ideas[(seed + 3) % ideas.length] : b];
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Gift className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Gift Idea Generator</h1><p className="text-blue-200 text-sm">Age group · occasion · budget · instant ideas</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Stuck on gift ideas? Select the recipient's age, occasion, and budget to get curated suggestions instantly.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">Age Group</div>
              <div className="grid grid-cols-2 gap-2">
                {(['child', 'teen', 'adult', 'senior'] as const).map(a => (
                  <button key={a} onClick={() => setAgeGroup(a)} className={`py-2 rounded-xl text-sm font-semibold capitalize transition-all ${ageGroup === a ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {a === 'child' ? '👧 Child' : a === 'teen' ? '🧑 Teen' : a === 'adult' ? '👤 Adult' : '👴 Senior'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">Occasion</div>
              <select value={occasion} onChange={e => setOccasion(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900">
                {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">Budget</div>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map(b => (
                  <button key={b} onClick={() => setBudget(b)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${budget === b ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{b}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setSeed(s => s + 1)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <Shuffle className="w-4 h-4" /> New Ideas
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Gift Ideas for <span className="text-blue-600 capitalize">{ageGroup}</span> — {occasion}</h2>
            <div className="space-y-4">
              {Object.entries(categories).map(([cat, ideas]) => (
                <div key={cat}>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{cat}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {getIdeas(ideas).map(idea => (
                      <div key={idea} className="flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2.5 border border-blue-100">
                        <Gift className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-blue-900 font-medium">{idea}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">Click "New Ideas" for a fresh set of suggestions</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Experience gifts (classes, events, restaurants) often mean more than physical items.</li>
              <li>• Personalised gifts (name, photo, custom text) feel more thoughtful at any budget.</li>
              <li>• When in doubt, a gift card from their favourite store is always welcome.</li>
              <li>• Pair a small personal gift with a gift card for maximum impact.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Birthday Reminder', href: '/birthday-reminder' }, { label: 'Anniversary Reminder', href: '/anniversary-reminder' }, { label: 'Shopping List', href: '/shopping-list' }, { label: 'Discount Calculator', href: '/discount-calculator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_gift', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
