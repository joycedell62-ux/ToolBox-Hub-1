import React, { useState } from 'react';
import { Cookie, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, Sparkles, Info } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Why is my fortune the same all day?', a: 'Your fortune is deterministically chosen from today\'s date, so it stays the same until midnight. Come back tomorrow for a fresh one!' },
  { q: 'Is this a real prediction?', a: 'Not at all. It\'s a light-hearted cookie for a smile. Fortunes are for entertainment and inspiration only — never real advice.' },
  { q: 'Does everyone see the same fortune?', a: 'Yes — the fortune is based purely on the calendar date, so anyone opening it on the same day gets the same message. It\'s a fun shared experience!' },
  { q: 'How are the lucky number and color chosen?', a: 'They\'re derived from the same date seed as your fortune, so they also stay consistent throughout the day.' },
  { q: 'Does this use the internet?', a: 'No. Everything runs offline in your browser. Nothing is sent anywhere and nothing is stored about you.' },
];

const FORTUNES = [
  'A pleasant surprise is waiting for you around the corner.',
  'Your smile today will brighten someone else\'s whole week.',
  'A small act of kindness will return to you tenfold.',
  'The best time to plant a tree was 20 years ago; the second best is today.',
  'An old friend has been thinking of you fondly.',
  'Your creativity is about to open a surprising door.',
  'Good things come to those who tidy their desk.',
  'A quiet moment today will bring a big idea.',
  'You are closer to a goal than you realize — keep going.',
  'Someone admires your patience more than they say.',
  'A little curiosity today leads to a delightful discovery.',
  'Fortune favors the one who dares to ask.',
  'Your generosity will echo far beyond what you can see.',
  'The stars suggest laughter is your best medicine this week.',
  'A gentle "no" today makes room for a wonderful "yes" tomorrow.',
  'Trust your first instinct — it knows the way.',
  'A cup of tea and a deep breath solve more than you\'d think.',
  'Your hard work is quietly building something beautiful.',
  'Adventure is closer than the horizon suggests.',
  'A kind word you speak today will be remembered for years.',
  'The path becomes clear to those who take the first step.',
  'You will soon find joy in an unexpected place.',
  'Let go of one worry today; it was never yours to carry.',
  'A new opportunity is drawn to your positive energy.',
  'The music of the universe plays sweeter when you slow down.',
  'Your courage today plants seeds for tomorrow\'s harvest.',
  'A small win today deserves a big celebration.',
  'Someone is grateful for you in ways they haven\'t expressed.',
  'The answer you seek is simpler than you fear.',
  'Kindness is a language the whole world understands — speak it often.',
  'A door you thought was closed is quietly opening.',
  'Your patience will be rewarded sooner than you think.',
  'Today is a great day to try the thing you\'ve been putting off.',
  'A burst of inspiration is heading your way — keep a pen handy.',
  'The warmth you give returns as sunshine on a cloudy day.',
  'You have exactly what it takes; trust the journey.',
  'A happy coincidence will make you smile this week.',
  'Rest is not laziness; it is how great ideas are born.',
  'Your honesty will earn you a loyal ally.',
  'The universe is nudging you toward something wonderful.',
  'Curiosity today, mastery tomorrow.',
  'A forgotten dream is asking for a second chance.',
  'Someone will surprise you with unexpected kindness.',
  'Your calm in the storm inspires those around you.',
  'A tiny change in routine sparks a big change in mood.',
  'Good fortune follows a grateful heart.',
  'The best conversations happen when you truly listen.',
  'A challenge today is a hidden gift in disguise.',
  'You are the author of a story that gets better each chapter.',
  'Believe in the quiet strength you carry every day.',
  'A moment of stillness will reveal your next bold move.',
  'Your laughter is contagious — spread it generously.',
];

const COLORS = ['Ocean Blue', 'Sunset Orange', 'Emerald Green', 'Royal Purple', 'Golden Yellow', 'Rose Pink', 'Sky Blue', 'Ruby Red', 'Mint Green', 'Lavender', 'Coral', 'Teal', 'Amber', 'Crimson', 'Turquoise', 'Silver', 'Warm Gold', 'Deep Indigo'];
const COLOR_HEX: Record<string, string> = { 'Ocean Blue': '#2563eb', 'Sunset Orange': '#f97316', 'Emerald Green': '#059669', 'Royal Purple': '#7c3aed', 'Golden Yellow': '#eab308', 'Rose Pink': '#ec4899', 'Sky Blue': '#0ea5e9', 'Ruby Red': '#dc2626', 'Mint Green': '#10b981', 'Lavender': '#a78bfa', 'Coral': '#fb7185', 'Teal': '#14b8a6', 'Amber': '#f59e0b', 'Crimson': '#e11d48', 'Turquoise': '#06b6d4', 'Silver': '#94a3b8', 'Warm Gold': '#d97706', 'Deep Indigo': '#4f46e5' };

function dateSeed(d: Date): number {
  const key = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  let s = key;
  s = ((s ^ 61) ^ (s >> 16)) >>> 0;
  s = (s + (s << 3)) >>> 0;
  s = (s ^ (s >> 4)) >>> 0;
  s = (s * 0x27d4eb2d) >>> 0;
  s = (s ^ (s >> 15)) >>> 0;
  return s >>> 0;
}

export default function DailyFortune() {
  const today = new Date();
  const seed = dateSeed(today);
  const fortune = FORTUNES[seed % FORTUNES.length];
  const luckyNumber = (seed % 99) + 1;
  const luckyColor = COLORS[(seed >> 8) % COLORS.length];
  const dateStr = today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const shareText = `🥠 My fortune for ${dateStr}:\n"${fortune}"\nLucky number: ${luckyNumber} · Lucky color: ${luckyColor}\n(For fun — from ToolBox Hub)`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Cookie className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Daily Fortune</h1><p className="text-blue-200 text-sm">one fortune a day · lucky number & color · share it</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Crack open your fortune cookie for a little daily sparkle. The same cheerful message stays with you all day and refreshes tomorrow. For entertainment and inspiration only.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-amber-800 font-medium">Fortunes are for entertainment and inspiration only — not real predictions or advice.</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Today</p>
              <p className="text-sm font-bold text-gray-900">{dateStr}</p>
            </div>
            <button onClick={() => setRevealed(true)} disabled={revealed} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <Cookie className="w-4 h-4" /> {revealed ? 'Fortune Revealed!' : 'Crack the Cookie'}
            </button>
            <p className="text-xs text-gray-400 text-center">Your fortune is the same every time you visit today.</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Check in each morning for a fresh daily message.</li>
              <li>• Share your fortune with friends — they get the same one today!</li>
              <li>• Copy the text to paste into a chat or journal.</li>
              <li>• Note your lucky number if you enjoy little rituals.</li>
              <li>• Wear a splash of your lucky color for a fun boost.</li>
              <li>• Take it all with a playful wink. 🥠</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 min-h-[280px] flex flex-col items-center justify-center text-center">
            {!revealed ? (
              <div className="text-gray-400 flex flex-col items-center gap-3">
                <Cookie className="w-16 h-16 text-amber-400" aria-hidden="true" />
                <p className="text-sm">Crack the cookie to reveal today\'s fortune…</p>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center gap-5 w-full">
                <div className="flex items-center gap-2 text-blue-600"><Sparkles className="w-5 h-5" /><span className="text-xs font-bold uppercase tracking-wide">Your Fortune</span><Sparkles className="w-5 h-5" /></div>
                <p className="text-xl font-bold text-gray-900 max-w-md leading-relaxed">"{fortune}"</p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <div className="bg-gray-50 rounded-xl px-5 py-3 border border-gray-100 text-center">
                    <p className="text-xs text-gray-500 font-semibold">Lucky Number</p>
                    <p className="text-2xl font-extrabold text-blue-600">{luckyNumber}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-5 py-3 border border-gray-100 text-center">
                    <p className="text-xs text-gray-500 font-semibold">Lucky Color</p>
                    <div className="flex items-center gap-2 justify-center mt-1">
                      <span className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: COLOR_HEX[luckyColor] }} aria-hidden="true" />
                      <span className="text-sm font-bold text-gray-800">{luckyColor}</span>
                    </div>
                  </div>
                </div>
                <button onClick={copy} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors mt-2">
                  {copied ? <><Check className="w-4 h-4 text-emerald-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy & Share</>}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Ask Abigail', href: '/ask-abigail' }, { label: 'Random Fact', href: '/random-fact-generator' }, { label: 'Random Joke', href: '/random-joke-generator' }, { label: 'Would You Rather', href: '/would-you-rather' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_daily-fortune', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
