import React, { useState } from 'react';
import { Megaphone, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What format does this follow?', a: 'The standard press release format: FOR IMMEDIATE RELEASE header, headline, dateline, lead paragraph, supporting body, an executive quote, a boilerplate About section, media contact, and the ### end mark.' },
  { q: 'Is it offline and private?', a: 'Yes. The release is assembled entirely in your browser from your inputs and curated phrasing; nothing is uploaded.' },
  { q: 'Can I send this to journalists?', a: 'It gives you a polished, correctly formatted draft. Verify every fact, add a real contact, and tailor the quote before distributing.' },
  { q: 'What is a boilerplate?', a: 'The standard "About [Company]" paragraph at the end of every release that describes who you are. This tool builds one from your company description.' },
  { q: 'Can I regenerate?', a: 'Yes — regenerate to vary the lead, body, and quote phrasing while keeping your facts.' },
];

const LEADS = [
  '{company} today announced {news}, marking a significant milestone for the company and its customers.',
  '{company} has unveiled {news}, a move set to reshape how customers experience its offerings.',
  'In a major development, {company} announced {news}, underscoring its commitment to innovation.',
  'Today, {company} revealed {news}, delivering on a long-anticipated promise to its community.',
];
const BODIES = [
  'The announcement reflects months of dedicated work and direct feedback from the people {company} serves.',
  'This step builds on {company}\u2019s track record of putting customers first and moving quickly on what matters.',
  'Industry observers note that {news} arrives at a pivotal moment for the market.',
  'The initiative is expected to expand access, improve outcomes, and set a new benchmark for the category.',
];
const QUOTES = [
  '\u201cThis is a proud moment for our whole team,\u201d said {spokesperson}, {role} at {company}. \u201cIt reflects everything we stand for.\u201d',
  '\u201cWe built this for our customers, and we can\u2019t wait to see the impact,\u201d said {spokesperson}, {role} at {company}.',
  '\u201cToday marks the beginning of an exciting new chapter,\u201d said {spokesperson}, {role} at {company}.',
  '\u201cWe listened, and we delivered,\u201d said {spokesperson}, {role} at {company}. \u201cThis is just the start.\u201d',
];

function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

export default function PressReleaseGenerator() {
  const [company, setCompany] = useState('Brightpath Labs');
  const [news, setNews] = useState('the launch of its new AI-powered scheduling app');
  const [city, setCity] = useState('San Francisco, CA');
  const [date, setDate] = useState('');
  const [spokesperson, setSpokesperson] = useState('Jordan Lee');
  const [role, setRole] = useState('CEO');
  const [about, setAbout] = useState('a technology company building tools that help small teams work smarter');
  const [contact, setContact] = useState('press@brightpathlabs.com');
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const build = () => {
    const seed = Math.floor(Math.random() * 9999) + tick;
    const co = company.trim() || 'The Company';
    const nw = news.trim() || 'a major announcement';
    const dl = `${(city.trim() || 'CITY, ST')} \u2014 ${(date.trim() || 'MONTH DD, YYYY')}`;
    const sp = spokesperson.trim() || 'A spokesperson';
    const rl = role.trim() || 'representative';
    const ab = about.trim() || 'an innovative organization';
    const ct = contact.trim() || 'press@example.com';
    const fill = (s: string) => s.replace(/\{company\}/g, co).replace(/\{news\}/g, nw).replace(/\{spokesperson\}/g, sp).replace(/\{role\}/g, rl);
    const headline = fill(pick(LEADS, seed)).replace(/\.$/, '').toUpperCase();
    const parts = [
      'FOR IMMEDIATE RELEASE',
      '',
      headline,
      '',
      `${dl} \u2014 ${fill(pick(LEADS, seed + 1))}`,
      '',
      fill(pick(BODIES, seed + 2)),
      '',
      fill(pick(QUOTES, seed + 3)),
      '',
      fill(pick(BODIES, seed + 4)),
      '',
      `About ${co}`,
      `${co} is ${ab}. For more information, visit the company\u2019s website.`,
      '',
      'Media Contact',
      `${sp}, ${rl}`,
      ct,
      '',
      '###',
    ];
    return parts.join('\n');
  };

  const [release, setRelease] = useState(() => build());
  const generate = () => { setTick(x => x + 1); setRelease(build()); };
  const copy = async () => { await navigator.clipboard.writeText(release); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Megaphone className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Press Release Generator</h1><p className="text-blue-200 text-sm">headline · dateline · quote · boilerplate · standard format</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Produce a professionally formatted press release from a few fields. Enter your company, news, spokesperson, and boilerplate, and get a media-ready draft with the standard structure journalists expect.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="pr-company" className="block text-xs font-semibold text-gray-500 mb-1">Company</label>
              <input id="pr-company" type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Company name" />
            </div>
            <div>
              <label htmlFor="pr-news" className="block text-xs font-semibold text-gray-500 mb-1">The news</label>
              <textarea id="pr-news" value={news} onChange={e => setNews(e.target.value)} rows={2} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none" placeholder="What are you announcing?" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pr-city" className="block text-xs font-semibold text-gray-500 mb-1">City, State</label>
                <input id="pr-city" type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="City, ST" />
              </div>
              <div>
                <label htmlFor="pr-date" className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                <input id="pr-date" type="text" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Month DD, YYYY" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pr-person" className="block text-xs font-semibold text-gray-500 mb-1">Spokesperson</label>
                <input id="pr-person" type="text" value={spokesperson} onChange={e => setSpokesperson(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Name" />
              </div>
              <div>
                <label htmlFor="pr-role" className="block text-xs font-semibold text-gray-500 mb-1">Role</label>
                <input id="pr-role" type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="CEO" />
              </div>
            </div>
            <div>
              <label htmlFor="pr-about" className="block text-xs font-semibold text-gray-500 mb-1">Boilerplate (About)</label>
              <textarea id="pr-about" value={about} onChange={e => setAbout(e.target.value)} rows={2} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none" placeholder="One sentence about the company" />
            </div>
            <div>
              <label htmlFor="pr-contact" className="block text-xs font-semibold text-gray-500 mb-1">Media contact</label>
              <input id="pr-contact" type="text" value={contact} onChange={e => setContact(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="press@example.com" />
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Press Release
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• 📣 Put the most newsworthy fact in the first sentence.</li>
              <li>• Keep it to one page; journalists skim.</li>
              <li>• A strong, quotable quote gives reporters something to lift directly.</li>
              <li>• Always end with the ### mark to signal the release is complete.</li>
              <li>• Double-check the contact details before sending.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Press Release</h2>
              <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-[520px] overflow-y-auto bg-gray-50 rounded-xl p-4 border border-gray-100">{release}</pre>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Proposal Generator', href: '/proposal-generator' }, { label: 'Essay Generator', href: '/essay-generator' }, { label: 'Speech Generator', href: '/speech-generator' }, { label: 'Script Generator', href: '/script-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_pressrelease', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
