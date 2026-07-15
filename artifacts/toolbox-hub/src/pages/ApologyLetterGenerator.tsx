import React, { useState } from 'react';
import { HeartHandshake, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { Link } from 'wouter';

type Tone = 'Formal' | 'Friendly' | 'Heartfelt';

const FAQS = [
  { q: 'How do I make an apology sincere?', a: 'Name what happened specifically, own it without excuses, and say how you will do better. Add those details in the fields for the most genuine result.' },
  { q: 'Is Formal tone right for work apologies?', a: 'Yes. Use Formal for professional or written business apologies; Friendly and Heartfelt suit personal relationships.' },
  { q: 'Is my apology private?', a: 'Completely \u2014 everything is generated locally in your browser and never uploaded.' },
  { q: 'Can I edit the letter before sending?', a: 'Yes, the output is fully editable. Always personalize it so it sounds like you.' },
  { q: 'Can I save the letter?', a: 'Use Download .txt to keep a copy, or Copy to paste it into a message or email.' },
];

const OPENERS: Record<Tone, string[]> = {
  Formal: [
    'I am writing to offer my sincere apology.',
    'Please accept my earnest apology.',
    'I wish to express my genuine regret.',
    'I owe you a heartfelt and overdue apology.',
    'It is important to me that I formally apologize to you.',
    'I write to acknowledge my mistake and to apologize.',
  ],
  Friendly: [
    'I owe you a real apology, and I mean it.',
    'I messed up, and I am truly sorry.',
    'Hey, I need to say I am sorry \u2014 properly.',
    'I have been meaning to say this: I am sorry.',
    'I got it wrong, and I want to make it right.',
    'I am sorry \u2014 no excuses, just an honest apology.',
  ],
  Heartfelt: [
    'From the depths of my heart, I am so sorry.',
    'I have carried the weight of what happened, and I need to say I am sorry.',
    'Please know how deeply I regret hurting you.',
    'My heart aches over this, and I owe you a true apology.',
    'I am more sorry than these words can hold.',
    'I have replayed it a hundred times, wishing I could take it back.',
  ],
};

const OWN: Record<Tone, string[]> = {
  Formal: [
    'I take full responsibility for my actions and their impact.',
    'I recognize that the fault was entirely mine.',
    'I understand the difficulty my actions caused, and I do not take it lightly.',
    'There is no excuse, and I will not offer one.',
    'I accept that I fell short of what you deserved.',
    'The responsibility rests with me, and I acknowledge it fully.',
  ],
  Friendly: [
    'That one is on me, plain and simple.',
    'I should have known better, and I own that completely.',
    'No excuses \u2014 I dropped the ball and I know it.',
    'I get why you were upset, and you had every right to be.',
    'I let you down, and that is not okay.',
    'I am not going to make excuses \u2014 I was wrong.',
  ],
  Heartfelt: [
    'I never meant to cause you pain, but I know that I did.',
    'Your feelings matter to me more than my pride ever could.',
    'I would give anything to undo the hurt I caused.',
    'I see now how much this affected you, and it breaks my heart.',
    'You deserved so much better from me.',
    'The last thing I ever wanted was to let you down.',
  ],
};

const AMENDS: Record<Tone, string[]> = {
  Formal: [
    'I am committed to ensuring this does not happen again.',
    'I will take concrete steps to make things right going forward.',
    'You have my assurance that I have learned from this.',
    'I hope, in time, to rebuild your trust through my actions.',
    'I intend to do better, and I will show it, not just say it.',
    'Please allow me the chance to demonstrate my sincerity.',
  ],
  Friendly: [
    'I promise to do better \u2014 and I will prove it.',
    'Let me make it up to you however I can.',
    'I have learned my lesson, honestly.',
    'I want us to be good again, and I will earn that.',
    'Give me a chance to show you I mean this.',
    'I will be paying closer attention from now on.',
  ],
  Heartfelt: [
    'I will spend the effort it takes to earn back your trust.',
    'You mean too much to me for me to let this go unaddressed.',
    'I want to grow from this and become someone you can rely on.',
    'Please give me the chance to show you the love and respect you deserve.',
    'I am ready to listen, to change, and to make it right.',
    'Whatever it takes to heal this, I am willing to do it.',
  ],
};

const CLOSERS: Record<Tone, string[]> = {
  Formal: ['With sincere regret and respect.', 'I hope you can accept my apology.', 'Thank you for taking the time to read this.'],
  Friendly: ['I am really sorry \u2014 truly.', 'Hope we can move past this.', 'Thanks for hearing me out.'],
  Heartfelt: ['With all my heart, I am sorry.', 'I hope, in time, you can forgive me.', 'You matter to me, now and always.'],
};

function seededPick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seed) % arr.length];
}

export default function ApologyLetterGenerator() {
  const [tone, setTone] = useState<Tone>('Heartfelt');
  const [name, setName] = useState('');
  const [situation, setSituation] = useState('');
  const [amends, setAmends] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => {
    const seed = Math.random() * 100000;
    const to = name.trim() || 'friend';
    const opener = seededPick(OPENERS[tone], seed);
    const own = seededPick(OWN[tone], seed * 1.7);
    const amendLine = seededPick(AMENDS[tone], seed * 2.3 + 2);
    const closer = seededPick(CLOSERS[tone], seed * 3.1);

    const sitLine = situation.trim()
      ? ` I know that ${situation.trim()} caused you real hurt, and for that I am truly sorry.`
      : '';
    const amendsLine = amends.trim()
      ? ` To make things right, ${amends.trim()}.`
      : '';

    const body = `Dear ${to},\n\n${opener}${sitLine}\n\n${own} ${amendLine}${amendsLine}\n\n${closer}`;
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
    a.download = 'apology-letter.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tones: Tone[] = ['Formal', 'Friendly', 'Heartfelt'];

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><HeartHandshake className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Apology Letter Generator</h1><p className="text-blue-200 text-sm">sincere apologies · 3 tones · copy &amp; download · offline</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Find the right words to say sorry. Describe the situation, pick a tone, and generate a genuine, well-structured apology.</p>
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
              <label htmlFor="ap-name" className="block text-xs font-semibold text-gray-500 mb-1">Their name</label>
              <input id="ap-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Taylor" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="ap-situation" className="block text-xs font-semibold text-gray-500 mb-1">What happened (optional)</label>
              <input id="ap-situation" value={situation} onChange={e => setSituation(e.target.value)} placeholder="e.g. I missed your event" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="ap-amends" className="block text-xs font-semibold text-gray-500 mb-1">How you'll make it right (optional)</label>
              <input id="ap-amends" value={amends} onChange={e => setAmends(e.target.value)} placeholder="e.g. I'll be there next time" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Letter
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• A great apology names the mistake, owns it, and offers to make amends. 🤝</li>
              <li>• Avoid "sorry if" or "sorry but" \u2014 they weaken sincerity.</li>
              <li>• Fill in what happened so the letter feels specific, not vague.</li>
              <li>• Use Formal for professional apologies, Heartfelt for close relationships.</li>
              <li>• Give it a day before sending, then reread with fresh eyes.</li>
              <li>• Download the .txt to save a draft or print a handwritten version.</li>
            </ul>
          </div>
        </div>

        <div className="contents">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Your Apology Letter</h2>
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
              <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full min-h-[360px] rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed font-serif focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap" aria-label="Generated apology letter" />
            ) : (
              <div className="min-h-[360px] flex items-center justify-center text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl p-8">
                <span>Pick a tone, describe what happened, then press <span className="font-semibold text-gray-500">Generate Letter</span>.</span>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Thank You Letter', href: '/thank-you-letter-generator' }, { label: 'Love Letter', href: '/love-letter-generator' }, { label: 'Anniversary Message', href: '/anniversary-message-generator' }, { label: 'Birthday Message', href: '/birthday-message-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_apology-letter', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
