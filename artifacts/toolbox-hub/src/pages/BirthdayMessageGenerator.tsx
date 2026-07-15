import React, { useState } from 'react';
import { Cake, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { Link } from 'wouter';

type Tone = 'Formal' | 'Friendly' | 'Heartfelt';
type Mode = 'Full letter' | 'Short card';

const FAQS = [
  { q: 'What is short-card mode?', a: 'Short-card mode produces a punchy one-to-two line wish that fits perfectly on a greeting card or a text message.' },
  { q: 'Can I add their age?', a: 'Yes — enter the age and it will be woven naturally into the message. Leave it blank to keep things age-neutral.' },
  { q: 'Are the messages reusable?', a: 'Each generate mixes fresh phrasing from a large word bank, so you can produce many unique wishes.' },
  { q: 'Is anything sent online?', a: 'No. Everything is generated locally in your browser — completely private and offline.' },
  { q: 'Can I edit the result?', a: 'Absolutely. The output is editable text — tweak it before you copy or download.' },
];

const OPENERS: Record<Tone, string[]> = {
  Formal: [
    'On the occasion of your birthday, I extend my warmest and most sincere wishes.',
    'It is a pleasure to celebrate this special day alongside you.',
    'Please accept my heartfelt congratulations on your birthday.',
    'May I be among the first to wish you a truly wonderful birthday.',
    'On this remarkable day, I offer you my genuine and respectful good wishes.',
    'It is with great warmth that I mark the occasion of your birthday.',
  ],
  Friendly: [
    'Happy birthday! I hope your day is as awesome as you are.',
    'Another year, another reason to celebrate the amazing you!',
    'It is your big day — time to eat cake and enjoy every second!',
    'Hey birthday star, this one is all about you today!',
    'Cheers to you on your birthday — let the good times roll!',
    'Wishing you the happiest of birthdays, my friend!',
  ],
  Heartfelt: [
    'On your birthday, I want you to know just how deeply you are loved.',
    'Today the world celebrates the day it became a brighter place — the day you were born.',
    'Happy birthday to someone who means more to me than words can say.',
    'Every year with you is a gift, and today I get to celebrate you.',
    'My heart is full as I wish the most beautiful soul a happy birthday.',
    'Today I am grateful for you, now and every single day.',
  ],
};

const WISHES: Record<Tone, string[]> = {
  Formal: [
    'May the year ahead bring you continued success, good health, and quiet contentment.',
    'I trust this new chapter will be filled with achievement and prosperity.',
    'May all your endeavors flourish in the year to come.',
    'It is my hope that this year rewards you richly for your many fine qualities.',
    'May you be surrounded by the respect and affection you so clearly deserve.',
    'I wish you a year marked by opportunity and well-earned joy.',
  ],
  Friendly: [
    'May your day be packed with laughter, presents, and way too much cake.',
    'Here is to a year full of adventures, good vibes, and zero Mondays.',
    'Hope you get spoiled rotten today — you totally deserve it!',
    'Wishing you sunshine, good friends, and plenty of reasons to smile this year.',
    'May this year bring you everything on your wish list and then some.',
    'Get ready for your best year yet — I can feel it!',
  ],
  Heartfelt: [
    'May this year hold every dream your heart is quietly wishing for.',
    'I hope you feel wrapped in love today and all the days that follow.',
    'May your path ahead shine as brightly as the light you bring to others.',
    'Wishing you a year overflowing with peace, joy, and moments that take your breath away.',
    'May you always know how treasured and irreplaceable you truly are.',
    'Here is to another year of you being wonderfully, beautifully you.',
  ],
};

const CLOSERS: Record<Tone, string[]> = {
  Formal: ['With warm regards and sincere best wishes.', 'Wishing you all the very best on your special day.', 'Respectfully and warmly yours.'],
  Friendly: ['Have the best day ever — you earned it!', 'Now go enjoy your day, birthday legend!', 'Cheers to you, always!'],
  Heartfelt: ['With all my love, today and always.', 'Forever grateful for you.', 'Loving you a little more with every year.'],
};

const SHORT: Record<Tone, string[]> = {
  Formal: [
    'Wishing you a joyful birthday and a year of continued success.',
    'Warmest birthday wishes for health, happiness, and prosperity.',
    'May your birthday mark the beginning of a truly rewarding year.',
    'Sincere best wishes on your birthday and always.',
    'Happy birthday — may the year ahead treat you kindly.',
    'A very happy birthday to you, with genuine good wishes.',
  ],
  Friendly: [
    'Happy birthday! Eat cake, make wishes, and have a blast!',
    'Another year cooler — happy birthday, superstar!',
    'Hope your birthday is as fun and fabulous as you are!',
    'Cheers to you! Have the happiest of birthdays!',
    'Party time! Wishing you an amazing birthday!',
    'Happy birthday — go celebrate like you mean it!',
  ],
  Heartfelt: [
    'Happy birthday to someone who fills my life with joy.',
    'So grateful the world has you in it — happy birthday.',
    'Wishing all the love in the world to you today.',
    'Happy birthday, dear one — you are deeply loved.',
    'May your heart be as full today as you make mine.',
    'Celebrating you today and every day. Happy birthday.',
  ],
};

function seededPick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seed) % arr.length];
}

export default function BirthdayMessageGenerator() {
  const [tone, setTone] = useState<Tone>('Friendly');
  const [mode, setMode] = useState<Mode>('Full letter');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [relationship, setRelationship] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => {
    const seed = Math.random() * 100000;
    const to = name.trim() || 'friend';
    const ageStr = age.trim();

    if (mode === 'Short card') {
      const short = seededPick(SHORT[tone], seed);
      const ageLine = ageStr ? ` Happy ${ageStr}th! 🎉` : '';
      setMessage(`Dear ${to},\n\n${short}${ageLine}`);
      return;
    }

    const opener = seededPick(OPENERS[tone], seed);
    const wish1 = seededPick(WISHES[tone], seed * 1.7);
    const wish2 = seededPick(WISHES[tone], seed * 2.4 + 5);
    const closer = seededPick(CLOSERS[tone], seed * 3.1);
    const relLine = relationship.trim() ? ` Having you as my ${relationship.trim()} is one of life's great blessings.` : '';
    const ageLine = ageStr ? `\n\nTurning ${ageStr} looks wonderful on you — this milestone deserves a real celebration.` : '';

    const body = `Dear ${to},\n\n${opener}${relLine}${ageLine}\n\n${wish1} ${wish2}\n\n${closer}`;
    setMessage(body);
  };

  const copy = async () => {
    if (!message) return;
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    if (!message) return;
    const blob = new Blob([message], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'birthday-message.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tones: Tone[] = ['Formal', 'Friendly', 'Heartfelt'];
  const modes: Mode[] = ['Full letter', 'Short card'];

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Cake className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Birthday Message Generator</h1><p className="text-blue-200 text-sm">full letters or short cards · 3 tones · copy &amp; download</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Write the perfect birthday wish in seconds. Choose a full heartfelt letter or a snappy card-length message, pick a tone, and personalize it.</p>
      </div>

      <div className="space-y-5">
        <div className="contents">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Length</label>
              <div className="grid grid-cols-2 gap-2">
                {modes.map(m => (
                  <button key={m} onClick={() => setMode(m)} className={`py-2 text-xs font-semibold rounded-xl border transition-all ${mode === m ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>{m}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {tones.map(t => (
                  <button key={t} onClick={() => setTone(t)} className={`py-2 text-xs font-semibold rounded-xl border transition-all ${tone === t ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="bd-name" className="block text-xs font-semibold text-gray-500 mb-1">Their name</label>
              <input id="bd-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sam" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="bd-age" className="block text-xs font-semibold text-gray-500 mb-1">Age (optional)</label>
              <input id="bd-age" value={age} onChange={e => setAge(e.target.value)} inputMode="numeric" placeholder="e.g. 30" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="bd-rel" className="block text-xs font-semibold text-gray-500 mb-1">Relationship (optional)</label>
              <input id="bd-rel" value={relationship} onChange={e => setRelationship(e.target.value)} placeholder="e.g. best friend, sister" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Message
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Use short-card mode for texts, Instagram captions, or greeting cards. 🎂</li>
              <li>• Add the relationship for a more personal, from-the-heart touch.</li>
              <li>• Milestone birthday? Add the age to highlight the big number.</li>
              <li>• Generate a few times and pick the phrasing you like best.</li>
              <li>• Pair a Friendly message with an inside joke for the win.</li>
              <li>• Download the .txt if you want to print it inside a card.</li>
            </ul>
          </div>
        </div>

        <div className="contents">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Your Birthday Message</h2>
              <div className="flex gap-2">
                <button onClick={copy} disabled={!message} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
                <button onClick={download} disabled={!message} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                  <Download className="w-3.5 h-3.5" /> Download .txt
                </button>
              </div>
            </div>
            {message ? (
              <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full min-h-[360px] rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed font-serif focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap" aria-label="Generated birthday message" />
            ) : (
              <div className="min-h-[360px] flex items-center justify-center text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl p-8">
                <span>Choose length &amp; tone, add a name, and press <span className="font-semibold text-gray-500">Generate Message</span> to see your birthday wish here.</span>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Anniversary Message', href: '/anniversary-message-generator' }, { label: 'Love Letter', href: '/love-letter-generator' }, { label: 'Thank You Letter', href: '/thank-you-letter-generator' }, { label: 'Gift Idea Generator', href: '/gift-idea-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_birthday-message', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
