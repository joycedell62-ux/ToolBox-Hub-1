import React, { useState } from 'react';
import { Target, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'How complete is this plan?', a: 'It gives you a structured skeleton — goals, channel actions, a 90-day timeline, and KPIs. Treat it as a starting framework and fill in your real numbers and specifics.' },
  { q: 'What does budget level change?', a: 'It scales the recommended tactics: Low leans on organic and low-cost channels, Medium mixes organic and paid, and High adds larger paid campaigns and testing budget.' },
  { q: 'Can I choose my own channels?', a: 'Yes. Select any combination of channels and the plan builds tailored action items and KPIs for each one you pick.' },
  { q: 'Is this saved anywhere?', a: 'Only your feedback vote is stored locally. The plan is generated in your browser and never uploaded.' },
  { q: 'How do I use the KPIs?', a: 'Pick two or three KPIs to focus on each quarter. Track them weekly and adjust tactics based on what the numbers tell you.' },
];

const BUDGETS = ['Low', 'Medium', 'High'] as const;
type Budget = typeof BUDGETS[number];
const CHANNELS = ['SEO', 'Social Media', 'Email', 'Paid Ads', 'Content', 'Partnerships'] as const;
type Channel = typeof CHANNELS[number];

const GOALS_BANK = [
  'Grow monthly {A} traffic by 30% in the next quarter',
  'Convert 5% more {A} into paying customers',
  'Build brand awareness with {A} through consistent content',
  'Generate a steady pipeline of qualified {A} leads',
  'Increase repeat purchases from existing {A}',
  'Establish {B} as a trusted name among {A}',
];

const CHANNEL_ACTIONS: Record<Channel, Record<Budget, string>> = {
  SEO: { Low: 'Publish 2 keyword-focused blog posts/month; fix on-page basics.', Medium: 'Add link outreach and a monthly technical audit to content.', High: 'Scale to weekly content plus a dedicated link-building budget.' },
  'Social Media': { Low: 'Post organically 3×/week on your top platform.', Medium: 'Add short-form video and light boosting of top posts.', High: 'Run an always-on organic + paid social calendar with creator collabs.' },
  Email: { Low: 'Launch a welcome sequence and monthly newsletter.', Medium: 'Add segmentation and behavior-triggered flows.', High: 'Run full lifecycle automation with A/B tested campaigns.' },
  'Paid Ads': { Low: 'Test a small search or retargeting campaign.', Medium: 'Run search + social ads with weekly optimization.', High: 'Scale multi-channel paid campaigns with creative testing.' },
  Content: { Low: 'Repurpose one pillar piece into 4 smaller assets.', Medium: 'Build a monthly content theme across formats.', High: 'Produce gated assets, webinars, and a resource hub.' },
  Partnerships: { Low: 'Line up 2 relevant cross-promotions.', Medium: 'Set up an affiliate or referral program.', High: 'Run co-marketing campaigns with aligned brands.' },
};

const CHANNEL_KPI: Record<Channel, string> = {
  SEO: 'Organic sessions & keyword rankings',
  'Social Media': 'Follower growth & engagement rate',
  Email: 'Open rate, click rate & list growth',
  'Paid Ads': 'CPA, ROAS & click-through rate',
  Content: 'Content leads & time on page',
  Partnerships: 'Referral traffic & partner-sourced revenue',
};

const TIMELINE: Record<Budget, string[]> = {
  Low: ['Month 1 — Set up foundations, define messaging, launch first channel.', 'Month 2 — Publish consistently, gather baseline data.', 'Month 3 — Review what worked, double down on the best channel.'],
  Medium: ['Month 1 — Foundations + launch 2 channels, set tracking.', 'Month 2 — Add paid testing, refine messaging from data.', 'Month 3 — Scale winners, cut underperformers, report on KPIs.'],
  High: ['Month 1 — Full multi-channel launch, analytics + attribution set up.', 'Month 2 — Aggressive testing across creative and audiences.', 'Month 3 — Scale proven campaigns, formalize reporting cadence.'],
};

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;

export default function MarketingPlanGenerator() {
  const [business, setBusiness] = useState('an online coaching service');
  const [audience, setAudience] = useState('busy professionals');
  const [budget, setBudget] = useState<Budget>('Medium');
  const [selected, setSelected] = useState<Channel[]>(['SEO', 'Social Media', 'Email']);
  const [plan, setPlan] = useState<{ goals: string[]; channels: { name: Channel; action: string; kpi: string }[]; timeline: string[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const toggle = (c: Channel) => setSelected(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const generate = () => {
    const A = audience.trim() || 'your audience';
    const B = business.trim() || 'your business';
    const goalPool = [...GOALS_BANK];
    const goals: string[] = [];
    while (goals.length < 3 && goalPool.length) {
      const g = pick(goalPool);
      goalPool.splice(goalPool.indexOf(g), 1);
      goals.push(g.replace(/\{A\}/g, A).replace(/\{B\}/g, B));
    }
    const chans = (selected.length ? selected : CHANNELS.slice(0, 3) as unknown as Channel[]).map(name => ({
      name,
      action: CHANNEL_ACTIONS[name][budget],
      kpi: CHANNEL_KPI[name],
    }));
    setPlan({ goals, channels: chans, timeline: TIMELINE[budget] });
  };

  React.useEffect(() => { generate(); /* eslint-disable-next-line */ }, []);

  const asText = () => {
    if (!plan) return '';
    let t = `MARKETING PLAN — ${business}\nAudience: ${audience} | Budget: ${budget}\n\nGOALS\n`;
    plan.goals.forEach((g, i) => { t += `${i + 1}. ${g}\n`; });
    t += `\nCHANNELS\n`;
    plan.channels.forEach(c => { t += `• ${c.name}: ${c.action} (KPI: ${c.kpi})\n`; });
    t += `\nTIMELINE\n`;
    plan.timeline.forEach(x => { t += `• ${x}\n`; });
    return t;
  };

  const copyPlan = async () => { await navigator.clipboard.writeText(asText()); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Target className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Marketing Plan Generator</h1><p className="text-blue-200 text-sm">business + audience + budget + channels · goals · timeline · KPIs</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Build a structured 90-day marketing plan in seconds. Pick your channels and budget level to get tailored goals, action items, a timeline, and KPIs.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="mp-biz" className="block text-xs font-semibold text-gray-500 mb-1">Business / product</label>
              <input id="mp-biz" value={business} onChange={e => setBusiness(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label htmlFor="mp-aud" className="block text-xs font-semibold text-gray-500 mb-1">Target audience</label>
              <input id="mp-aud" value={audience} onChange={e => setAudience(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label htmlFor="mp-budget" className="block text-xs font-semibold text-gray-500 mb-1">Budget level</label>
              <select id="mp-budget" value={budget} onChange={e => setBudget(e.target.value as Budget)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 mb-2">Channels</span>
              <div className="grid grid-cols-2 gap-2">
                {CHANNELS.map(c => (
                  <label key={c} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={selected.includes(c)} onChange={() => toggle(c)} className="rounded w-4 h-4 accent-blue-600" />
                    {c}
                  </label>
                ))}
              </div>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Plan
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Start with 2–3 channels you can do well, not all six at once.</li>
              <li>• Make goals measurable — attach a number and a deadline.</li>
              <li>• Review KPIs weekly; adjust tactics, keep the strategy steady.</li>
              <li>• Low budget? Lean hard on organic content and email.</li>
              <li>• Revisit the plan each quarter and roll winners forward.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Your Marketing Plan</h2>
              <button onClick={copyPlan} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Plan</>}
              </button>
            </div>
            {!plan ? (
              <p className="text-sm text-gray-400 py-8 text-center">Click Generate to build your plan.</p>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-blue-600 mb-2">Goals</h3>
                  <ul className="space-y-1.5">{plan.goals.map((g, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="font-bold text-blue-600">{i + 1}.</span> {g}</li>)}</ul>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-blue-600 mb-2">Channels & Actions</h3>
                  <div className="space-y-2">
                    {plan.channels.length === 0 ? <p className="text-sm text-gray-400">Select at least one channel.</p> : plan.channels.map(c => (
                      <div key={c.name} className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                        <p className="text-sm text-gray-700">{c.action}</p>
                        <p className="text-xs text-gray-400 mt-0.5">KPI: {c.kpi}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-blue-600 mb-2">90-Day Timeline</h3>
                  <ul className="space-y-1.5">{plan.timeline.map((x, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-blue-600">•</span> {x}</li>)}</ul>
                </div>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Content Calendar', href: '/content-calendar-generator' }, { label: 'Ad Copy Generator', href: '/ad-copy-generator' }, { label: 'Email Subject Lines', href: '/email-subject-line-generator' }, { label: 'CTA Generator', href: '/cta-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_marketing-plan', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
