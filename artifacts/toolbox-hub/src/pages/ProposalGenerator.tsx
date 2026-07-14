import React, { useState } from 'react';
import { Briefcase, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What does this generate?', a: 'A complete business/project proposal draft — executive summary, objectives, scope, deliverables, timeline, budget, and terms — assembled from your company, client, scope, and budget inputs.' },
  { q: 'Is it offline and private?', a: 'Yes. The proposal is built entirely in your browser from curated templates; none of your details are uploaded.' },
  { q: 'Can I use it for real clients?', a: 'It is a strong starting draft. Review the scope, pricing, and terms carefully and adapt them to your actual agreement before sending.' },
  { q: 'What are the proposal types?', a: 'Project, Service/Retainer, Consulting, and Marketing — each adjusts the objectives and deliverables framing.' },
  { q: 'Can I regenerate?', a: 'Yes — regenerate to vary the summary and objective phrasing while keeping your inputs.' },
];

const TYPES = ['Project Proposal', 'Service / Retainer', 'Consulting', 'Marketing'] as const;
type PType = typeof TYPES[number];

const SUMMARIES = [
  '{company} is pleased to present this proposal to {client}. We understand your goals and have designed a focused plan to deliver measurable results.',
  'Thank you for the opportunity to partner with {client}. {company} brings the experience and process needed to make this engagement a success.',
  'This proposal outlines how {company} will help {client} achieve its objectives on time and within budget.',
  '{company} has prepared this tailored proposal for {client}, grounded in a clear understanding of your priorities.',
];
const OBJECTIVES: Record<PType, string[]> = {
  'Project Proposal': ['Deliver the defined scope on schedule and within budget.', 'Establish clear milestones and acceptance criteria.', 'Minimize risk through phased delivery and regular check-ins.'],
  'Service / Retainer': ['Provide reliable, ongoing support under a predictable monthly retainer.', 'Maintain agreed response times and service levels.', 'Continuously improve outcomes through monthly reviews.'],
  Consulting: ['Diagnose the core challenge through a structured discovery phase.', 'Deliver actionable recommendations backed by data.', 'Enable your team to execute confidently after the engagement.'],
  Marketing: ['Grow qualified reach and engagement for the target audience.', 'Increase conversions through a tested, iterative approach.', 'Report clearly on ROI against agreed KPIs.'],
};

function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

export default function ProposalGenerator() {
  const [type, setType] = useState<PType>('Project Proposal');
  const [company, setCompany] = useState('Northwind Studio');
  const [client, setClient] = useState('Acme Corp');
  const [scope, setScope] = useState('a redesigned marketing website with a CMS and analytics');
  const [budget, setBudget] = useState('24,000');
  const [weeks, setWeeks] = useState('8');
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const build = () => {
    const seed = Math.floor(Math.random() * 9999) + tick;
    const co = company.trim() || 'Our Company';
    const cl = client.trim() || 'the Client';
    const sc = scope.trim() || 'the agreed scope of work';
    const bud = budget.trim() || 'TBD';
    const wk = weeks.trim() || 'TBD';
    const fill = (s: string) => s.replace(/\{company\}/g, co).replace(/\{client\}/g, cl);
    const objs = OBJECTIVES[type].map(o => `\u2022 ${o}`).join('\n');
    const header = `${type.toUpperCase()}\nPrepared by ${co} for ${cl}\n${'='.repeat(40)}`;
    const summary = `\n1. EXECUTIVE SUMMARY\n${fill(pick(SUMMARIES, seed))}`;
    const objectives = `\n\n2. OBJECTIVES\n${objs}`;
    const scopeSec = `\n\n3. SCOPE OF WORK\n${co} will deliver ${sc}. All work will meet the standards agreed with ${cl} and be reviewed at each milestone.`;
    const deliverables = `\n\n4. DELIVERABLES\n\u2022 Kickoff & discovery documentation\n\u2022 Milestone deliverables per the timeline below\n\u2022 Final handover with documentation and a wrap-up review`;
    const timeline = `\n\n5. TIMELINE\nEstimated duration: ${wk} weeks from signed agreement.\n\u2022 Week 1: Discovery & planning\n\u2022 Middle weeks: Execution & review cycles\n\u2022 Final week: Delivery, QA, and handover`;
    const budgetSec = `\n\n6. INVESTMENT\nTotal: $${bud}\nBilling: 50% deposit to begin, balance on completion (adjust as agreed).`;
    const terms = `\n\n7. TERMS\nThis proposal is valid for 30 days. Scope changes will be quoted separately. Both parties agree to the milestones and payment schedule above.\n\nApproved by: ______________________  Date: __________`;
    return header + summary + objectives + scopeSec + deliverables + timeline + budgetSec + terms;
  };

  const [proposal, setProposal] = useState(() => build());
  const generate = () => { setTick(x => x + 1); setProposal(build()); };
  const copy = async () => { await navigator.clipboard.writeText(proposal); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Briefcase className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Proposal Generator</h1><p className="text-blue-200 text-sm">summary · objectives · scope · timeline · budget · terms</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Draft a professional business or project proposal in seconds. Fill in your company, client, scope, and budget, and get a complete, sectioned document ready to review and send.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="pr-type" className="block text-xs font-semibold text-gray-500 mb-1">Proposal type</label>
              <select id="pr-type" value={type} onChange={e => setType(e.target.value as PType)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pr-company" className="block text-xs font-semibold text-gray-500 mb-1">Your company</label>
                <input id="pr-company" type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Company" />
              </div>
              <div>
                <label htmlFor="pr-client" className="block text-xs font-semibold text-gray-500 mb-1">Client</label>
                <input id="pr-client" type="text" value={client} onChange={e => setClient(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Client" />
              </div>
            </div>
            <div>
              <label htmlFor="pr-scope" className="block text-xs font-semibold text-gray-500 mb-1">Scope of work</label>
              <textarea id="pr-scope" value={scope} onChange={e => setScope(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none" placeholder="What will be delivered?" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pr-budget" className="block text-xs font-semibold text-gray-500 mb-1">Budget ($)</label>
                <input id="pr-budget" type="text" value={budget} onChange={e => setBudget(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="24,000" />
              </div>
              <div>
                <label htmlFor="pr-weeks" className="block text-xs font-semibold text-gray-500 mb-1">Duration (weeks)</label>
                <input id="pr-weeks" type="text" value={weeks} onChange={e => setWeeks(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="8" />
              </div>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Proposal
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• 💼 Lead with the client\u2019s outcome, not your process.</li>
              <li>• Be specific in scope to prevent scope creep later.</li>
              <li>• Offer clear milestones and a payment schedule to build trust.</li>
              <li>• Always double-check the numbers before sending.</li>
              <li>• A tight, skimmable proposal beats a long one.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Proposal Draft</h2>
              <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-[520px] overflow-y-auto bg-gray-50 rounded-xl p-4 border border-gray-100">{proposal}</pre>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Press Release', href: '/press-release-generator' }, { label: 'Essay Generator', href: '/essay-generator' }, { label: 'Speech Generator', href: '/speech-generator' }, { label: 'Script Generator', href: '/script-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_proposal', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
