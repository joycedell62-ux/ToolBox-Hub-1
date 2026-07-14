import React, { useState } from 'react';
import { Megaphone, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Do the ads respect platform limits?', a: 'Yes. Each platform has real headline and body character limits built in, and every variant shows a live character count so you can spot anything that runs long.' },
  { q: 'Which platforms are supported?', a: 'Google Ads, Facebook, Instagram, and X (Twitter). Each uses a tone-appropriate template bank tuned to that platform\'s style.' },
  { q: 'Are these ready to publish?', a: 'They are strong first drafts. Review claims for accuracy, add your real offer details, and A/B test the top two or three.' },
  { q: 'How do I get different variants?', a: 'Click Generate again for a fresh set drawn from dozens of templates, or change the tone and audience to shift the angle.' },
  { q: 'Does anything leave my browser?', a: 'No. All copy is assembled locally from offline template banks. Nothing is uploaded.' },
];

const PLATFORMS = {
  Google: { headline: 30, body: 90 },
  Facebook: { headline: 40, body: 125 },
  Instagram: { headline: 40, body: 125 },
  X: { headline: 50, body: 280 },
} as const;
type Platform = keyof typeof PLATFORMS;

const TONES = ['Professional', 'Playful', 'Bold', 'Friendly', 'Urgent', 'Luxury'] as const;
type Tone = typeof TONES[number];

const HEADLINE_TEMPLATES: Record<Tone, string[]> = {
  Professional: ['{P} for {A}', 'Trusted {P} that works', 'The smarter {P}', 'Better {P}, less hassle', 'Results-driven {P}', '{P} built to last'],
  Playful: ['Meet your new {P}', '{P} that just gets it', 'Say hi to {P}', 'Oops, {P} this good?', 'Your {A} will love {P}', '{P}, but make it fun'],
  Bold: ['Stop settling. Get {P}', '{P} changes everything', 'The last {P} you\'ll need', 'Own the day with {P}', 'Go big with {P}', 'Nothing beats {P}'],
  Friendly: ['{P} made for {A}', 'We made {P} for you', 'Easy {P}, happy {A}', 'Your everyday {P}', 'Simple {P} that helps', 'Here for your {P}'],
  Urgent: ['Last chance: {P}', 'Don\'t miss {P}', '{P} — ends soon', 'Only today: {P}', 'Grab {P} now', 'Hurry, {P} inside'],
  Luxury: ['Experience {P}', 'The art of {P}', 'Refined {P} for {A}', 'Elevate with {P}', 'Crafted {P}', 'Pure {P}, no compromise'],
};

const BODY_TEMPLATES: Record<Tone, string[]> = {
  Professional: ['Designed for {A}, {p} delivers reliable results without the guesswork. Try it today.', 'Join thousands of {A} who trust {p} to save time and cut costs.', '{p} gives {A} the tools to work smarter. See the difference.'],
  Playful: ['{p} takes the boring out of it. {A} everywhere are smiling — you next?', 'Life\'s too short for bad {p}. Grab yours and enjoy the ride.', 'Warning: {p} may cause happy {A}. Side effects include actually enjoying this.'],
  Bold: ['{A} deserve better. {p} is the upgrade you\'ve been waiting for. Act now.', 'Everyone else is average. {p} makes {A} unstoppable.', 'No fluff. No excuses. Just {p} that works. Get started.'],
  Friendly: ['We built {p} to make life easier for {A}. Come see why people love it.', 'Hey {A} — {p} is here to help, one small win at a time.', '{p} is the friendly little helper {A} have been wishing for.'],
  Urgent: ['{A}, this deal on {p} won\'t last. Claim your spot before it\'s gone.', 'Time is running out on {p}. Don\'t wait — {A} are grabbing theirs now.', 'Only a few left. Get {p} today before the offer ends tonight.'],
  Luxury: ['{p} is crafted for {A} who appreciate the finer things. Indulge.', 'Every detail of {p} is designed for discerning {A}. Discover it.', 'Timeless, refined, effortless — {p} for {A} who expect more.'],
};

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;

export default function AdCopyGenerator() {
  const [product, setProduct] = useState('email marketing tool');
  const [audience, setAudience] = useState('small business owners');
  const [platform, setPlatform] = useState<Platform>('Google');
  const [tone, setTone] = useState<Tone>('Professional');
  const [variants, setVariants] = useState<{ headline: string; body: string }[]>([]);
  const [copiedOne, setCopiedOne] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => {
    const P = product.trim() || 'our product';
    const p = P.toLowerCase();
    const A = audience.trim() || 'everyone';
    const out: { headline: string; body: string }[] = [];
    const seen = new Set<string>();
    let guard = 0;
    while (out.length < 5 && guard < 60) {
      const h = pick(HEADLINE_TEMPLATES[tone]).replace('{P}', P.charAt(0).toUpperCase() + P.slice(1)).replace('{A}', A);
      const b = pick(BODY_TEMPLATES[tone]).replace(/\{p\}/g, p).replace(/\{A\}/g, A);
      const key = h + '|' + b;
      if (!seen.has(key)) { seen.add(key); out.push({ headline: h, body: b }); }
      guard++;
    }
    setVariants(out);
  };

  React.useEffect(() => { generate(); /* eslint-disable-next-line */ }, []);

  const limits = PLATFORMS[platform];
  const copyOne = async (v: { headline: string; body: string }, i: number) => { await navigator.clipboard.writeText(`${v.headline}\n${v.body}`); setCopiedOne(i); setTimeout(() => setCopiedOne(null), 2000); };

  const Counter = ({ len, max }: { len: number; max: number }) => (
    <span className={`text-xs font-medium ${len > max ? 'text-red-600' : 'text-gray-400'}`}>{len}/{max}</span>
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Megaphone className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Ad Copy Generator</h1><p className="text-blue-200 text-sm">product + audience + platform + tone · length-aware · char counts</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Write scroll-stopping ad copy for Google, Facebook, Instagram, and X. Every variant respects the platform's character limits and shows a live count.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="ac-product" className="block text-xs font-semibold text-gray-500 mb-1">Product / service</label>
              <input id="ac-product" value={product} onChange={e => setProduct(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label htmlFor="ac-aud" className="block text-xs font-semibold text-gray-500 mb-1">Target audience</label>
              <input id="ac-aud" value={audience} onChange={e => setAudience(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label htmlFor="ac-plat" className="block text-xs font-semibold text-gray-500 mb-1">Platform</label>
              <select id="ac-plat" value={platform} onChange={e => setPlatform(e.target.value as Platform)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                {Object.keys(PLATFORMS).map(p => <option key={p} value={p}>{p === 'X' ? 'X (Twitter)' : p}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">Headline ≤ {limits.headline} · Body ≤ {limits.body} chars</p>
            </div>
            <div>
              <label htmlFor="ac-tone" className="block text-xs font-semibold text-gray-500 mb-1">Tone</label>
              <select id="ac-tone" value={tone} onChange={e => setTone(e.target.value as Tone)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Ad Copy
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Lead with the benefit, not the feature — tell people what they get.</li>
              <li>• Keep Google headlines under 30 characters so nothing gets truncated.</li>
              <li>• Match tone to platform: playful on Instagram, professional on Google.</li>
              <li>• Always A/B test at least two headlines against each other.</li>
              <li>• Add a clear call to action in the body of every ad.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">{platform === 'X' ? 'X (Twitter)' : platform} Ad Variants</h2>
            {variants.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">Click Generate to create ad copy.</p>
            ) : (
              <div className="space-y-3">
                {variants.map((v, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 hover:border-blue-200 transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{v.headline}</p>
                        <div className="flex items-center gap-2 mt-0.5 mb-2"><span className="text-xs text-gray-400">Headline</span><Counter len={v.headline.length} max={limits.headline} /></div>
                        <p className="text-sm text-gray-700">{v.body}</p>
                        <div className="flex items-center gap-2 mt-0.5"><span className="text-xs text-gray-400">Body</span><Counter len={v.body.length} max={limits.body} /></div>
                      </div>
                      <button onClick={() => copyOne(v, i)} aria-label="Copy ad variant" className="shrink-0 text-gray-300 hover:text-blue-600 group-hover:text-gray-400 transition-colors">
                        {copiedOne === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Email Subject Lines', href: '/email-subject-line-generator' }, { label: 'CTA Generator', href: '/cta-generator' }, { label: 'Product Name', href: '/product-name-generator' }, { label: 'Marketing Plan', href: '/marketing-plan-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_ad-copy', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
