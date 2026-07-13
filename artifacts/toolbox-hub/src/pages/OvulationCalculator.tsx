import React, { useState } from 'react';
import { Heart, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'How is ovulation calculated?', a: 'Ovulation typically occurs 14 days before the next period. We subtract 14 from your cycle length, then add that to your LMP date.' },
  { q: 'What is the fertile window?', a: 'The 5 days before ovulation plus the day of ovulation — sperm can survive up to 5 days and eggs live 12–24 hours.' },
  { q: 'How accurate is this calculator?', a: 'It is an estimate based on average cycles. Stress, illness, and hormonal changes can shift ovulation by several days.' },
  { q: 'Can I get pregnant outside the fertile window?', a: 'It is much less likely, but cycle lengths can vary. Track multiple cycles for more accuracy.' },
  { q: 'What if my cycle is irregular?', a: 'This tool works best with regular cycles (21–35 days). See a healthcare provider for irregular cycles.' },
];

export default function OvulationCalculator() {
  const [lmp, setLmp] = useState('');
  const [cycle, setCycle] = useState('28');
  const [result, setResult] = useState<{ ovulation: string; windowStart: string; windowEnd: string; nextPeriod: string } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const calculate = () => {
    if (!lmp) return;
    const base = new Date(lmp);
    const c = parseInt(cycle) || 28;
    const ovDay = c - 14;
    const ov = new Date(base); ov.setDate(base.getDate() + ovDay);
    const ws = new Date(ov); ws.setDate(ov.getDate() - 5);
    const we = new Date(ov); we.setDate(ov.getDate() + 1);
    const np = new Date(base); np.setDate(base.getDate() + c);
    setResult({ ovulation: fmt(ov), windowStart: fmt(ws), windowEnd: fmt(we), nextPeriod: fmt(np) });
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm';
  const labelCls = 'block text-xs font-semibold text-gray-500 mb-1';

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Heart className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Ovulation Calculator</h1><p className="text-blue-200 text-sm">Fertile window · ovulation date · next period</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Predict your fertile window and ovulation date from your last period and average cycle length.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div><label className={labelCls}>First day of last period</label><input type="date" value={lmp} onChange={e => setLmp(e.target.value)} className={inputCls} /></div>
            <div>
              <label className={labelCls}>Average cycle length (days)</label>
              <select value={cycle} onChange={e => setCycle(e.target.value)} className={inputCls}>
                {Array.from({ length: 15 }, (_, i) => i + 21).map(d => <option key={d} value={d}>{d} days{d === 28 ? ' (avg)' : ''}</option>)}
              </select>
            </div>
            <button onClick={calculate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm">Calculate Fertile Window</button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {result ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-gray-900">Your Fertility Forecast</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Fertile Window Starts', value: result.windowStart, color: 'text-pink-600', bg: 'bg-pink-50' },
                  { label: 'Fertile Window Ends', value: result.windowEnd, color: 'text-pink-600', bg: 'bg-pink-50' },
                  { label: 'Ovulation Day', value: result.ovulation, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'Next Period Expected', value: result.nextPeriod, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                    <div className={`font-bold text-base ${color}`}>{value}</div>
                    <div className="text-xs text-gray-500 mt-1">{label}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">Dates are estimates. Actual ovulation can vary. Track basal body temperature for confirmation.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
              <Heart className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">Enter your cycle information to see your fertile window</p>
            </div>
          )}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Track basal body temperature (BBT) for a more accurate ovulation signal.</li>
              <li>• Cervical mucus becomes clear and stretchy close to ovulation.</li>
              <li>• LH surge tests (OPKs) detect the hormone spike 24–36h before ovulation.</li>
              <li>• Log at least 3 cycles before relying on cycle-length predictions.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Pregnancy Calculator', href: '/pregnancy-calculator' }, { label: 'Age Calculator', href: '/age-calculator' }, { label: 'BMI Calculator', href: '/bmi-calculator' }, { label: 'Calorie Calculator', href: '/calorie-calculator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">
              {(['up', 'down'] as const).map(v => (
                <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_ovulation', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>
                  {v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="font-semibold text-gray-800 text-sm">{faq.q}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
