import React, { useState } from 'react';
import { CalendarDays, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, Download, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'How is the calendar built?', a: 'It maps your posts-per-week across four weeks, rotating through content pillars (educational, behind-the-scenes, promotional, engagement) and platform-appropriate formats — all offline in your browser.' },
  { q: 'Can I export it?', a: 'Yes. Copy the whole calendar as plain text, or download it as a CSV you can open in any spreadsheet and share with your team.' },
  { q: 'What do the post ideas give me?', a: 'Each cell is a prompt: a format plus an angle tied to your niche. Flesh it out with your specifics — they\'re starting points, not finished captions.' },
  { q: 'How many posts should I schedule?', a: 'Consistency beats volume. Start with a number you can sustain (often 3–5/week) and scale up once it\'s a habit.' },
  { q: 'Is my data saved anywhere?', a: 'Only your feedback vote is stored locally. The calendar is generated in your browser and never uploaded.' },
];

const PLATFORMS = ['Instagram', 'TikTok', 'LinkedIn', 'X', 'Facebook', 'YouTube'] as const;
type Platform = typeof PLATFORMS[number];

const FORMATS: Record<Platform, string[]> = {
  Instagram: ['Carousel', 'Reel', 'Story poll', 'Photo post', 'Guide'],
  TikTok: ['Trend clip', 'Tutorial', 'Duet', 'Behind-the-scenes', 'Q&A'],
  LinkedIn: ['Text post', 'Document', 'Poll', 'Case study', 'Article'],
  X: ['Thread', 'Hot take', 'Poll', 'Tip', 'Question'],
  Facebook: ['Photo post', 'Live', 'Event', 'Poll', 'Link post'],
  YouTube: ['Short', 'Long video', 'Tutorial', 'Vlog', 'Live stream'],
};

const ANGLES = [
  'a beginner tip about {N}', 'a common myth about {N}', 'behind the scenes of your {N} process', 'a quick how-to for {N}', 'a customer win with {N}',
  'answering a top {N} question', 'a mistake to avoid in {N}', 'your favorite {N} tool or resource', 'a before-and-after in {N}', 'a hot take on {N}',
  'a day-in-the-life around {N}', 'a checklist for {N}', 'trends shaping {N} right now', 'a mini case study on {N}', 'a poll about {N} habits',
  'a myth vs. fact on {N}', 'a step-by-step {N} walkthrough', 'lessons learned from {N}', 'a quick {N} win to try today', 'reacting to {N} news',
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;

type Cell = { platform: Platform; idea: string };

export default function ContentCalendarGenerator() {
  const [niche, setNiche] = useState('home fitness');
  const [selected, setSelected] = useState<Platform[]>(['Instagram', 'TikTok']);
  const [perWeek, setPerWeek] = useState(4);
  const [weeks, setWeeks] = useState<Cell[][]>([]);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const toggle = (p: Platform) => setSelected(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const generate = () => {
    const N = niche.trim() || 'your niche';
    const plats = selected.length ? selected : (['Instagram'] as Platform[]);
    const out: Cell[][] = [];
    for (let w = 0; w < 4; w++) {
      const week: Cell[] = [];
      const anglePool = [...ANGLES];
      for (let d = 0; d < perWeek; d++) {
        const platform = plats[(w * perWeek + d) % plats.length] as Platform;
        const format = pick(FORMATS[platform]);
        if (anglePool.length === 0) anglePool.push(...ANGLES);
        const angle = pick(anglePool);
        anglePool.splice(anglePool.indexOf(angle), 1);
        week.push({ platform, idea: `${format}: ${angle.replace(/\{N\}/g, N)}` });
      }
      out.push(week);
    }
    setWeeks(out);
  };

  React.useEffect(() => { generate(); /* eslint-disable-next-line */ }, []);

  const asText = () => {
    let t = `CONTENT CALENDAR — ${niche}\n`;
    weeks.forEach((week, w) => {
      t += `\nWeek ${w + 1}\n`;
      week.forEach((c, i) => { t += `  Post ${i + 1} [${c.platform}] ${c.idea}\n`; });
    });
    return t;
  };

  const asCsv = () => {
    const rows = [['Week', 'Post', 'Platform', 'Idea']];
    weeks.forEach((week, w) => week.forEach((c, i) => {
      rows.push([`Week ${w + 1}`, `${i + 1}`, c.platform, `"${c.idea.replace(/"/g, '""')}"`]);
    }));
    return rows.map(r => r.join(',')).join('\n');
  };

  const copyText = async () => { await navigator.clipboard.writeText(asText()); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const downloadCsv = () => {
    const blob = new Blob([asCsv()], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'content-calendar.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><CalendarDays className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Content Calendar Generator</h1><p className="text-blue-200 text-sm">niche + platforms + posts/week · 4-week plan · copy or CSV</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Plan a full month of social content in seconds. Get a 4-week calendar of post ideas tailored to your niche and platforms — export as text or CSV.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="cc-niche" className="block text-xs font-semibold text-gray-500 mb-1">Niche / topic</label>
              <input id="cc-niche" value={niche} onChange={e => setNiche(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 mb-2">Platforms</span>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map(p => (
                  <label key={p} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={selected.includes(p)} onChange={() => toggle(p)} className="rounded w-4 h-4 accent-blue-600" />
                    {p === 'X' ? 'X (Twitter)' : p}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Posts per week ({perWeek})</label>
              <input type="range" min="1" max="7" value={perWeek} onChange={e => setPerWeek(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1</span><span>7</span></div>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Calendar
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Batch-create content on one day to stay consistent all month.</li>
              <li>• Mix educational, promotional, and personal posts — don't only sell.</li>
              <li>• Repurpose one idea across formats and platforms.</li>
              <li>• Leave room to react to trends; the calendar is a guide, not a cage.</li>
              <li>• Export to CSV and drop it into your team's scheduler.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
              <h2 className="font-bold text-gray-900 text-sm">4-Week Calendar</h2>
              <div className="flex gap-2">
                <button onClick={copyText} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Text</>}
                </button>
                <button onClick={downloadCsv} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
              </div>
            </div>
            {weeks.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">Click Generate to build your calendar.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left">
                      <th className="text-xs font-bold uppercase tracking-wide text-gray-400 pb-2 pr-3">Week</th>
                      <th className="text-xs font-bold uppercase tracking-wide text-gray-400 pb-2">Post Ideas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.map((week, w) => (
                      <tr key={w} className="border-t border-gray-100 align-top">
                        <td className="py-3 pr-3 font-semibold text-blue-600 whitespace-nowrap">Week {w + 1}</td>
                        <td className="py-3">
                          <ul className="space-y-1.5">
                            {week.map((c, i) => (
                              <li key={i} className="text-gray-700">
                                <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 rounded px-1.5 py-0.5 mr-1.5">{c.platform === 'X' ? 'X' : c.platform}</span>
                                {c.idea}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Marketing Plan', href: '/marketing-plan-generator' }, { label: 'Email Subject Lines', href: '/email-subject-line-generator' }, { label: 'Ad Copy Generator', href: '/ad-copy-generator' }, { label: 'CTA Generator', href: '/cta-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_content-calendar', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
