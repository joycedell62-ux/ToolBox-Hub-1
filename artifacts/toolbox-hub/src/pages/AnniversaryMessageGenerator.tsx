import React, { useState } from 'react';
import { Gem, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { Link } from 'wouter';

type Tone = 'Formal' | 'Friendly' | 'Heartfelt';

const FAQS = [
  { q: 'How does the years input change the message?', a: 'The number of years is woven into the text naturally, and certain milestones (1, 5, 10, 25, 50) trigger a special line.' },
  { q: 'Can I use this for a friends\u2019 or parents\u2019 anniversary?', a: 'Yes. Set a Friendly or Formal tone and mention the relationship in the context field to fit any celebration.' },
  { q: 'Are the messages private?', a: 'Yes \u2014 everything is generated in your browser and never sent anywhere.' },
  { q: 'Can I keep editing the result?', a: 'The output is a fully editable text box. Adjust anything before you copy or download.' },
  { q: 'Will repeated generates repeat?', a: 'Each generate mixes from a large word bank, so you will see fresh combinations every time.' },
];

const OPENERS: Record<Tone, string[]> = {
  Formal: [
    'On the occasion of your anniversary, I offer my sincerest congratulations.',
    'It is a privilege to acknowledge this meaningful milestone with you.',
    'Please accept my warmest wishes on this cherished anniversary.',
    'I write to honor the enduring commitment your anniversary represents.',
    'On this significant day, I extend my respectful and heartfelt regards.',
    'It is with genuine admiration that I mark your anniversary today.',
  ],
  Friendly: [
    'Happy anniversary! Time really does fly when you are having fun together.',
    'Cheers to you two \u2014 another year of putting up with each other beautifully!',
    'Happy anniversary to my favorite pair of lovebirds!',
    'Look at you two still going strong \u2014 happy anniversary!',
    'Another year down and still adorable \u2014 happy anniversary!',
    'Raise a glass \u2014 it is your anniversary and you have earned the celebration!',
  ],
  Heartfelt: [
    'On our anniversary, my heart overflows with everything you are to me.',
    'Today I celebrate the love that continues to shape my whole world.',
    'Happy anniversary to the one who makes every day feel like a gift.',
    'Another year of loving you, and still it feels like the beginning.',
    'Our anniversary reminds me how lucky I am to walk this life beside you.',
    'Today I honor us \u2014 the love we built and the love we keep choosing.',
  ],
};

const MIDDLES: Record<Tone, string[]> = {
  Formal: [
    'The devotion you have shown one another stands as a model of true partnership.',
    'Such lasting commitment is a rare and admirable achievement.',
    'Your union reflects patience, respect, and genuine care.',
    'May the bond you have nurtured continue to grow ever stronger.',
    'It is inspiring to witness a partnership built on such steady foundations.',
    'Your enduring togetherness is a testament to love done well.',
  ],
  Friendly: [
    'You two are proof that the right person makes everything more fun.',
    'Here is to more inside jokes, shared snacks, and adventures ahead.',
    'You make being in love look easy \u2014 and pretty enviable, honestly.',
    'May your next year hold even more laughter and even fewer arguments about the thermostat.',
    'You are basically relationship goals, and everyone knows it.',
    'Keep being the couple everyone secretly wants to be.',
  ],
  Heartfelt: [
    'Every shared sunrise, every quiet night \u2014 they have made me who I am.',
    'Through every season, your love has been my steadiest home.',
    'I would choose you again in a heartbeat, and every heartbeat after.',
    'The years have only deepened how completely I adore you.',
    'You are my favorite hello and my hardest goodbye, always.',
    'With you, forever finally feels like it might not be long enough.',
  ],
};

const CLOSERS: Record<Tone, string[]> = {
  Formal: ['With warm regards and sincere congratulations.', 'Wishing you many more happy years together.', 'Respectfully and warmly yours.'],
  Friendly: ['Here is to many more years of you two being wonderful!', 'Now go celebrate \u2014 you have definitely earned it!', 'Cheers to the happy couple!'],
  Heartfelt: ['Forever and always, with all my love.', 'Yours today, tomorrow, and every year after.', 'Loving you more with each passing year.'],
};

const MILESTONES: Record<string, string> = {
  '1': 'One whole year together \u2014 and what a beautiful beginning it has been.',
  '5': 'Five years strong! A milestone that deserves to be celebrated loudly.',
  '10': 'A decade of love \u2014 ten years of building something truly lasting.',
  '25': 'Twenty-five years! A silver milestone that shines as bright as your bond.',
  '50': 'Fifty golden years together \u2014 an extraordinary and inspiring achievement.',
};

function seededPick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seed) % arr.length];
}

export default function AnniversaryMessageGenerator() {
  const [tone, setTone] = useState<Tone>('Heartfelt');
  const [name, setName] = useState('');
  const [years, setYears] = useState('');
  const [relationship, setRelationship] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => {
    const seed = Math.random() * 100000;
    const to = name.trim() || 'my love';
    const y = years.trim();
    const opener = seededPick(OPENERS[tone], seed);
    const middle1 = seededPick(MIDDLES[tone], seed * 1.7);
    const middle2 = seededPick(MIDDLES[tone], seed * 2.4 + 4);
    const closer = seededPick(CLOSERS[tone], seed * 3.1);

    let yearsLine = '';
    if (y) {
      yearsLine = MILESTONES[y]
        ? `\n\n${MILESTONES[y]}`
        : `\n\n${y} year${y === '1' ? '' : 's'} together \u2014 and the story only gets better.`;
    }
    const relLine = relationship.trim() ? ` To my wonderful ${relationship.trim()}, this day is truly special.` : '';

    const body = `Dear ${to},\n\n${opener}${relLine}${yearsLine}\n\n${middle1} ${middle2}\n\n${closer}`;
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
    a.download = 'anniversary-message.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tones: Tone[] = ['Formal', 'Friendly', 'Heartfelt'];

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Gem className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Anniversary Message Generator</h1><p className="text-blue-200 text-sm">milestone-aware · 3 tones · copy &amp; download · offline</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Celebrate years of love with a personalized anniversary message. Enter the years together and watch the words adapt to your milestone.</p>
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
              <label htmlFor="an-name" className="block text-xs font-semibold text-gray-500 mb-1">Their name</label>
              <input id="an-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jordan" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="an-years" className="block text-xs font-semibold text-gray-500 mb-1">Years together (optional)</label>
              <input id="an-years" value={years} onChange={e => setYears(e.target.value)} inputMode="numeric" placeholder="e.g. 10" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="an-rel" className="block text-xs font-semibold text-gray-500 mb-1">Relationship (optional)</label>
              <input id="an-rel" value={relationship} onChange={e => setRelationship(e.target.value)} placeholder="e.g. husband, wife, partner" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Message
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Milestone years (1, 5, 10, 25, 50) unlock a special celebratory line. 💎</li>
              <li>• Add the relationship to tailor the tone for a spouse, partner, or friend.</li>
              <li>• Heartfelt suits couples; Formal is great for parents or colleagues.</li>
              <li>• Generate a few drafts and blend your favorite lines together.</li>
              <li>• Pair the message with a shared photo for a keepsake card.</li>
              <li>• Download the .txt to print it or save it for the scrapbook.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Your Anniversary Message</h2>
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
              <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full min-h-[360px] rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed font-serif focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap" aria-label="Generated anniversary message" />
            ) : (
              <div className="min-h-[360px] flex items-center justify-center text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl p-8">
                <span>Pick a tone, add a name and the years together, then press <span className="font-semibold text-gray-500">Generate Message</span>.</span>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Love Letter', href: '/love-letter-generator' }, { label: 'Birthday Message', href: '/birthday-message-generator' }, { label: 'Thank You Letter', href: '/thank-you-letter-generator' }, { label: 'Gift Idea Generator', href: '/gift-idea-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_anniversary-message', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
