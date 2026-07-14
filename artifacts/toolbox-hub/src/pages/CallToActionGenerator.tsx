import React, { useState } from 'react';
import { MousePointerClick, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What makes a strong CTA?', a: 'Clarity and a verb. Start with an action word, promise a benefit, and keep it short. "Start my free trial" beats "Submit" every time.' },
  { q: 'When should I add urgency?', a: 'Use urgency for limited offers, deadlines, or scarcity. Turn it off for evergreen actions so the copy stays honest and doesn\'t fatigue readers.' },
  { q: 'Where do I use these?', a: 'Buttons, banners, popups, email footers, and landing-page hero sections. Pair the short button text with the longer supporting line.' },
  { q: 'How many variants should I test?', a: 'Test two or three at a time. Change one thing — the verb or the benefit — so you know what actually moved the needle.' },
  { q: 'Does it work offline?', a: 'Yes. Every CTA is built from local template banks in your browser. Nothing is uploaded.' },
];

const GOALS = ['Sign up', 'Buy', 'Download', 'Contact'] as const;
type Goal = typeof GOALS[number];
const TONES = ['Friendly', 'Bold', 'Professional', 'Playful'] as const;
type Tone = typeof TONES[number];

const BUTTONS: Record<Goal, string[]> = {
  'Sign up': ['Get started', 'Sign me up', 'Create free account', 'Join now', 'Start free trial', 'Claim your spot', 'Try it free', 'Get access', 'Start for free', 'Count me in'],
  Buy: ['Buy now', 'Add to cart', 'Get yours', 'Shop the sale', 'Order today', 'Grab the deal', 'Checkout now', 'Treat yourself', 'Own it now', 'Get the offer'],
  Download: ['Download free', 'Get the app', 'Download now', 'Grab the guide', 'Get instant access', 'Download the PDF', 'Save your copy', 'Get it now', 'Unlock the download', 'Start downloading'],
  Contact: ['Talk to us', 'Get in touch', 'Book a call', 'Request a demo', 'Contact sales', 'Say hello', 'Schedule a chat', 'Reach out', 'Ask a question', 'Let\'s talk'],
};

const SUPPORT: Record<Tone, string[]> = {
  Friendly: ['No pressure — you can cancel anytime.', 'It only takes a minute, promise.', 'We\'re here to help every step of the way.', 'Join thousands of happy customers.', 'Simple, quick, and totally free to start.'],
  Bold: ['Don\'t settle for less. Take the leap today.', 'Your competitors already have. Your move.', 'Stop waiting. Start winning.', 'This is the upgrade you\'ve been avoiding.', 'Go all in — the results speak for themselves.'],
  Professional: ['Trusted by teams at leading companies.', 'Enterprise-grade, no credit card required.', 'Backed by a 30-day money-back guarantee.', 'Onboard your team in under five minutes.', 'Secure, reliable, and built to scale.'],
  Playful: ['Warning: may cause excessive smiling.', 'Your future self will high-five you.', 'C\'mon, you know you want to.', 'Blink and you might miss it.', 'It\'s basically the best decision of your Tuesday.'],
};

const URGENCY = ['Limited time only.', 'Offer ends soon.', 'Only a few spots left.', 'Today only!', 'Don\'t miss out.', 'While supplies last.'];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;

export default function CallToActionGenerator() {
  const [goal, setGoal] = useState<Goal>('Sign up');
  const [tone, setTone] = useState<Tone>('Friendly');
  const [urgency, setUrgency] = useState(false);
  const [ctas, setCtas] = useState<{ button: string; support: string }[]>([]);
  const [copiedOne, setCopiedOne] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => {
    const seen = new Set<string>();
    const out: { button: string; support: string }[] = [];
    let guard = 0;
    while (out.length < 8 && guard < 100) {
      const button = pick(BUTTONS[goal]);
      let support = pick(SUPPORT[tone]);
      if (urgency) support = `${pick(URGENCY)} ${support}`;
      const key = button + '|' + support;
      if (!seen.has(key)) { seen.add(key); out.push({ button, support }); }
      guard++;
    }
    setCtas(out);
  };

  React.useEffect(() => { generate(); /* eslint-disable-next-line */ }, [urgency]);

  const copyOne = async (c: { button: string; support: string }, i: number) => { await navigator.clipboard.writeText(`${c.button} — ${c.support}`); setCopiedOne(i); setTimeout(() => setCopiedOne(null), 2000); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><MousePointerClick className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Call-to-Action Generator</h1><p className="text-blue-200 text-sm">goal + urgency + tone · button text + supporting line</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Generate high-converting CTA button text and supporting copy. Choose your goal, dial in the tone, and add urgency when you need it.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="cta-goal" className="block text-xs font-semibold text-gray-500 mb-1">Goal</label>
              <select id="cta-goal" value={goal} onChange={e => setGoal(e.target.value as Goal)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="cta-tone" className="block text-xs font-semibold text-gray-500 mb-1">Tone</label>
              <select id="cta-tone" value={tone} onChange={e => setTone(e.target.value as Tone)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={urgency} onChange={e => setUrgency(e.target.checked)} className="rounded w-4 h-4 accent-blue-600" />
              Add urgency
            </label>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate CTAs
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Start with an action verb — "Get", "Start", "Grab".</li>
              <li>• Write from the user's view: "Start my trial" beats "Start your trial".</li>
              <li>• Keep button text to 2–4 words; put detail in the supporting line.</li>
              <li>• Use one primary CTA per screen so the choice is obvious.</li>
              <li>• Only use urgency when it's genuine — false scarcity erodes trust.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">CTA Variants</h2>
            {ctas.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">Click Generate to create CTAs.</p>
            ) : (
              <div className="space-y-3">
                {ctas.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 hover:border-blue-200 transition-all group">
                    <div className="flex-1 min-w-0">
                      <span className="inline-block bg-blue-600 text-white text-sm font-bold rounded-lg px-3 py-1.5 mb-1.5">{c.button}</span>
                      <p className="text-sm text-gray-600">{c.support}</p>
                    </div>
                    <button onClick={() => copyOne(c, i)} aria-label="Copy CTA" className="shrink-0 text-gray-300 hover:text-blue-600 group-hover:text-gray-400 transition-colors">
                      {copiedOne === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Ad Copy Generator', href: '/ad-copy-generator' }, { label: 'Email Subject Lines', href: '/email-subject-line-generator' }, { label: 'Product Description', href: '/product-description-generator' }, { label: 'Marketing Plan', href: '/marketing-plan-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_cta', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
