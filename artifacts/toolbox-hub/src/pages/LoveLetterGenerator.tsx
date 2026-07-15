import React, { useState } from 'react';
import { Heart, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { Link } from 'wouter';

type Tone = 'Formal' | 'Friendly' | 'Heartfelt';

const FAQS = [
  { q: 'Is my letter private?', a: 'Completely. Everything runs in your browser — no text is ever sent to a server. Write freely.' },
  { q: 'Can I edit the generated letter?', a: 'Yes. The output is fully editable — treat it as a starting draft and personalize the details before sending.' },
  { q: 'What is the difference between the tones?', a: 'Formal is elegant and reserved, Friendly is warm and casual, and Heartfelt is deeply emotional and romantic.' },
  { q: 'How do I make it feel more personal?', a: 'Add a specific memory or trait in the context field, and hit Generate a few times to find phrasing you love.' },
  { q: 'Can I download the letter?', a: 'Yes — use the Download .txt button to save it as a plain text file you can print or keep.' },
];

const OPENERS: Record<Tone, string[]> = {
  Formal: [
    'I have long wished to put into words what my heart has quietly known.',
    'It is with great sincerity that I write to you today.',
    'There are sentiments I can no longer keep unspoken.',
    'Allow me a moment to express what you have come to mean to me.',
    'I find myself compelled to share the depth of my regard for you.',
    'With every passing day my esteem for you grows more certain.',
    'I write to you not out of obligation, but out of genuine devotion.',
    'Permit me to be candid about the affection I hold for you.',
  ],
  Friendly: [
    'I just had to sit down and tell you how much you mean to me.',
    'You crossed my mind again today, and I could not stop smiling.',
    'I keep finding little reasons to be grateful you are in my life.',
    'Honestly, life got a whole lot brighter the day you showed up in it.',
    'I was thinking about us and figured I would put it in writing.',
    'There is something I have been meaning to say, so here it goes.',
    'You make ordinary days feel like the good kind of adventure.',
    'I could not keep this bottled up any longer — you are wonderful.',
  ],
  Heartfelt: [
    'From the very first moment, something in me knew you were extraordinary.',
    'My heart has a language, and every word of it spells your name.',
    'There are not enough hours in the day to hold all that I feel for you.',
    'You are the quiet miracle I never knew I was waiting for.',
    'When I close my eyes, it is your smile that lights the darkness.',
    'Loving you feels like coming home to a place I never want to leave.',
    'You have rewritten the meaning of happiness for me.',
    'Every heartbeat of mine seems to whisper a promise toward you.',
  ],
};

const MIDDLES: Record<Tone, string[]> = {
  Formal: [
    'Your kindness and grace have left an impression upon me that time cannot fade.',
    'In your company I have found a rare and steadying comfort.',
    'You possess a character I admire more deeply than words can convey.',
    'The manner in which you carry yourself has earned my complete devotion.',
    'I have come to rely upon the warmth and wisdom you so freely give.',
    'Your presence lends a quiet dignity to even the simplest of moments.',
    'I hold our connection in the highest and most sincere regard.',
    'There is a steadiness in you that I have grown to cherish profoundly.',
  ],
  Friendly: [
    'You have this way of making me laugh even on the roughest days.',
    'Every little adventure with you turns into a favorite memory.',
    'I love how easy it is to just be myself around you.',
    'You get me in a way that honestly feels rare and lucky.',
    'The way your eyes light up when you talk about what you love — I adore it.',
    'You are my favorite person to share the small stuff with.',
    'Being around you feels like my favorite song on repeat.',
    'You make the good times better and the hard times bearable.',
  ],
  Heartfelt: [
    'Your laughter is the sound my soul had been searching for all along.',
    'In your arms I have found the shelter I did not know I needed.',
    'Every dream I dream now somehow has you woven through it.',
    'You see the truest parts of me and love them without hesitation.',
    'With you, even silence feels like the most beautiful conversation.',
    'You are the poem I will spend a lifetime learning to read.',
    'My whole world grew softer and brighter the moment you loved me back.',
    'I carry your love with me like sunlight I can never lose.',
  ],
};

const CLOSERS: Record<Tone, string[]> = {
  Formal: [
    'It is my sincere hope that these words find a place in your heart.',
    'With the deepest respect and affection, I remain devotedly yours.',
    'I look forward to every moment we are yet to share.',
    'Please know that my regard for you is both genuine and enduring.',
    'Yours, with heartfelt and unwavering devotion.',
    'I shall count myself fortunate for as long as you remain in my life.',
  ],
  Friendly: [
    'So there you have it — you are pretty amazing and I am glad you know it now.',
    'Thanks for being exactly who you are. I would not change a thing.',
    'Here is to many more laughs, adventures, and lazy afternoons together.',
    'You are stuck with me, and I could not be happier about it.',
    'Consider this my little way of saying you mean the world to me.',
    'Now go smile that smile I love so much.',
  ],
  Heartfelt: [
    'Today, tomorrow, and always — my heart belongs entirely to you.',
    'I will love you through every season, quietly and completely.',
    'You are, and will forever remain, the best part of my story.',
    'Come find me in every sunrise; I will be loving you there.',
    'Forever is not long enough, but I intend to spend it all with you.',
    'With all that I am and all that I hope to be, I love you.',
  ],
};

function seededPick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seed) % arr.length];
}

export default function LoveLetterGenerator() {
  const [tone, setTone] = useState<Tone>('Heartfelt');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [memory, setMemory] = useState('');
  const [letter, setLetter] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => {
    const seed = Math.random() * 100000;
    const to = name.trim() || 'my love';
    const opener = seededPick(OPENERS[tone], seed);
    const middle1 = seededPick(MIDDLES[tone], seed * 1.7);
    const middle2 = seededPick(MIDDLES[tone], seed * 2.9 + 3);
    const closer = seededPick(CLOSERS[tone], seed * 3.3);

    const reasonLine = reason.trim()
      ? ` What I treasure most is ${reason.trim()}.`
      : '';
    const memoryLine = memory.trim()
      ? `\n\nI still think about ${memory.trim()} — a memory I hold close whenever I miss you.`
      : '';

    const body = `My dearest ${to},\n\n${opener}${reasonLine}\n\n${middle1} ${middle2}${memoryLine}\n\n${closer}\n\nWith all my love,`;
    setLetter(body);
  };

  const copy = async () => {
    if (!letter) return;
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    if (!letter) return;
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'love-letter.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tones: Tone[] = ['Formal', 'Friendly', 'Heartfelt'];

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Heart className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Love Letter Generator</h1><p className="text-blue-200 text-sm">romantic letters · 3 tones · copy &amp; download · fully offline</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Craft a heartfelt, multi-paragraph love letter in seconds. Choose a tone, add a name and a personal detail, and let the words flow.</p>
      </div>

      <div className="space-y-5">
        <div className="contents">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {tones.map(t => (
                  <button key={t} onClick={() => setTone(t)} className={`py-2 text-xs font-semibold rounded-xl border transition-all ${tone === t ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="ll-name" className="block text-xs font-semibold text-gray-500 mb-1">Their name</label>
              <input id="ll-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="ll-reason" className="block text-xs font-semibold text-gray-500 mb-1">What you love about them (optional)</label>
              <input id="ll-reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. your endless patience" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="ll-memory" className="block text-xs font-semibold text-gray-500 mb-1">A favorite memory (optional)</label>
              <input id="ll-memory" value={memory} onChange={e => setMemory(e.target.value)} placeholder="e.g. our first road trip" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Letter
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Add a specific memory to make the letter feel unmistakably yours. 💙</li>
              <li>• Generate a few times — each draft mixes fresh phrasing for you to choose from.</li>
              <li>• Handwrite the final version on nice paper for extra impact.</li>
              <li>• Read it aloud once; if it sounds like you, it will land.</li>
              <li>• The Heartfelt tone works best for anniversaries and reunions.</li>
              <li>• Download the .txt to keep a private copy or print it later.</li>
            </ul>
          </div>
        </div>

        <div className="contents">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Your Love Letter</h2>
              <div className="flex gap-2">
                <button onClick={copy} disabled={!letter} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
                <button onClick={download} disabled={!letter} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                  <Download className="w-3.5 h-3.5" /> Download .txt
                </button>
              </div>
            </div>
            {letter ? (
              <textarea value={letter} onChange={e => setLetter(e.target.value)} className="w-full min-h-[360px] rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed font-serif focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap" aria-label="Generated love letter" />
            ) : (
              <div className="min-h-[360px] flex items-center justify-center text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl p-8">
                <span>Pick a tone, add a name, and press <span className="font-semibold text-gray-500">Generate Letter</span> to see your romantic message here.</span>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Anniversary Message', href: '/anniversary-message-generator' }, { label: 'Birthday Message', href: '/birthday-message-generator' }, { label: 'Thank You Letter', href: '/thank-you-letter-generator' }, { label: 'Apology Letter', href: '/apology-letter-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_love-letter', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
