import React, { useState } from 'react';
import { Gift, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { Link } from 'wouter';

type Tone = 'Formal' | 'Friendly' | 'Heartfelt';

const FAQS = [
  { q: 'What occasions does this cover?', a: 'Anything \u2014 gifts, help, job interviews, hospitality, support, mentorship, and more. Pick a preset or type your own.' },
  { q: 'Is this suitable for professional thank-you notes?', a: 'Yes. Use the Formal tone for interviews, business gifts, or professional favors.' },
  { q: 'Can I personalize it?', a: 'Add the recipient name and a specific detail, then generate. The occasion is woven right into the message.' },
  { q: 'Is anything sent to a server?', a: 'No. Everything runs locally in your browser \u2014 private and fully offline.' },
  { q: 'Can I download the note?', a: 'Yes, use Download .txt to save a plain text copy for printing or emailing.' },
];

const OPENERS: Record<Tone, string[]> = {
  Formal: [
    'I am writing to express my sincere gratitude.',
    'Please accept my heartfelt thanks.',
    'I wish to convey my deep appreciation to you.',
    'It is with genuine gratitude that I write to you today.',
    'I would like to formally thank you.',
    'Allow me to express how truly grateful I am.',
  ],
  Friendly: [
    'I just had to say a huge thank you!',
    'Thank you so much \u2014 you really came through!',
    'I cannot thank you enough for this.',
    'You are the best, and I owe you a massive thank you.',
    'Just wanted to send some serious gratitude your way.',
    'Thank you, thank you, thank you \u2014 seriously!',
  ],
  Heartfelt: [
    'From the bottom of my heart, thank you.',
    'Words feel too small for the gratitude I feel toward you.',
    'You have touched my heart in a way I will never forget.',
    'I am overwhelmed with gratitude, and I had to tell you.',
    'Thank you does not begin to capture what I feel.',
    'My heart is full of appreciation for you.',
  ],
};

const OCCASION_LINES: Record<string, Record<Tone, string>> = {
  gift: {
    Formal: 'The thoughtful gift you gave was both generous and greatly appreciated.',
    Friendly: 'The gift was absolutely perfect \u2014 you clearly know me so well!',
    Heartfelt: 'Your gift meant more to me than you could ever know.',
  },
  help: {
    Formal: 'Your assistance made a meaningful difference, and I am truly grateful for it.',
    Friendly: 'You totally saved the day, and I could not have done it without you.',
    Heartfelt: 'The help you gave me came exactly when I needed it most.',
  },
  interview: {
    Formal: 'I appreciate the time you took to meet with me and discuss the opportunity.',
    Friendly: 'Thanks so much for the great conversation during the interview!',
    Heartfelt: 'I am deeply grateful for the chance to share my story with you.',
  },
  hospitality: {
    Formal: 'Your warm hospitality made my visit both comfortable and memorable.',
    Friendly: 'Staying with you was such a treat \u2014 thanks for having me!',
    Heartfelt: 'The warmth of your home wrapped around me like a hug.',
  },
  support: {
    Formal: 'Your steadfast support has been invaluable to me.',
    Friendly: 'Having you in my corner meant everything, honestly.',
    Heartfelt: 'Your unwavering support carried me through, and I will never forget it.',
  },
};

const CLOSERS: Record<Tone, string[]> = {
  Formal: ['With sincere appreciation and warm regards.', 'I remain most grateful for your kindness.', 'Thank you again for your generosity.'],
  Friendly: ['Thanks again \u2014 you rock!', 'I owe you one, big time!', 'Sending all the good vibes your way!'],
  Heartfelt: ['With heartfelt thanks and endless appreciation.', 'Forever grateful for you.', 'Thank you, truly, from the bottom of my heart.'],
};

function seededPick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seed) % arr.length];
}

export default function ThankYouLetterGenerator() {
  const [tone, setTone] = useState<Tone>('Formal');
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('gift');
  const [detail, setDetail] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => {
    const seed = Math.random() * 100000;
    const to = name.trim() || 'friend';
    const opener = seededPick(OPENERS[tone], seed);
    const closer = seededPick(CLOSERS[tone], seed * 2.7);

    const occKey = occasion.trim().toLowerCase();
    const occLine = OCCASION_LINES[occKey]
      ? OCCASION_LINES[occKey][tone]
      : `I am so thankful for the ${occasion.trim() || 'kindness'} you shared with me.`;

    const detailLine = detail.trim() ? ` In particular, ${detail.trim()} truly stood out to me.` : '';

    const body = `Dear ${to},\n\n${opener} ${occLine}${detailLine}\n\nYour kindness will not be forgotten, and it has genuinely made a difference in my life. I hope I can return the same thoughtfulness one day.\n\n${closer}`;
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
    a.download = 'thank-you-letter.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tones: Tone[] = ['Formal', 'Friendly', 'Heartfelt'];
  const occasions = ['gift', 'help', 'interview', 'hospitality', 'support'];

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Gift className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Thank You Letter Generator</h1><p className="text-blue-200 text-sm">any occasion · 3 tones · copy &amp; download · offline</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Say thank you the right way. Pick an occasion, choose a tone, and generate a polished, heartfelt note in seconds.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
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
              <label htmlFor="ty-name" className="block text-xs font-semibold text-gray-500 mb-1">Their name</label>
              <input id="ty-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ms. Rivera" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="ty-occasion" className="block text-xs font-semibold text-gray-500 mb-1">Occasion</label>
              <input id="ty-occasion" list="ty-occasion-list" value={occasion} onChange={e => setOccasion(e.target.value)} placeholder="e.g. gift, help, interview" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <datalist id="ty-occasion-list">
                {occasions.map(o => <option key={o} value={o} />)}
              </datalist>
            </div>
            <div>
              <label htmlFor="ty-detail" className="block text-xs font-semibold text-gray-500 mb-1">A specific detail (optional)</label>
              <input id="ty-detail" value={detail} onChange={e => setDetail(e.target.value)} placeholder="e.g. your advice on my resume" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Letter
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Send interview thank-yous within 24 hours for the best impression. 🙏</li>
              <li>• Add a specific detail so the note feels genuine, not generic.</li>
              <li>• Use the Formal tone for professional and business relationships.</li>
              <li>• A handwritten copy of a heartfelt note leaves a lasting impact.</li>
              <li>• Type any occasion in the box \u2014 it is not limited to the presets.</li>
              <li>• Download the .txt to paste into an email or print for mailing.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Your Thank You Letter</h2>
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
              <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full min-h-[360px] rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed font-serif focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap" aria-label="Generated thank you letter" />
            ) : (
              <div className="min-h-[360px] flex items-center justify-center text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl p-8">
                <span>Choose a tone and occasion, add a name, then press <span className="font-semibold text-gray-500">Generate Letter</span>.</span>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Apology Letter', href: '/apology-letter-generator' }, { label: 'Love Letter', href: '/love-letter-generator' }, { label: 'Birthday Message', href: '/birthday-message-generator' }, { label: 'Anniversary Message', href: '/anniversary-message-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_thank-you-letter', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
