import React, { useState } from 'react';
import { Heart, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

const TRIMESTERS = [
  { name: 'First Trimester', weeks: '1–12', desc: 'Major organs develop; morning sickness common.' },
  { name: 'Second Trimester', weeks: '13–26', desc: 'Baby moves, energy often returns.' },
  { name: 'Third Trimester', weeks: '27–40', desc: 'Rapid growth, preparing for birth.' },
];

const FAQS = [
  { q: 'How is the due date calculated?', a: 'Naegele\'s Rule: add 280 days (40 weeks) to the first day of your last menstrual period (LMP).' },
  { q: 'How accurate is this?', a: 'Only about 5% of babies are born on their exact due date. Most births occur within 2 weeks before or after.' },
  { q: 'What if my cycle is not 28 days?', a: 'Adjust the cycle length input — the calculator corrects the due date accordingly.' },
  { q: 'What is the gestational age?', a: 'Gestational age counts from the first day of your last period, not conception. Conception typically occurs ~14 days in.' },
  { q: 'When should I see a doctor?', a: 'As soon as you suspect pregnancy. Early prenatal care significantly improves outcomes.' },
];

export default function PregnancyCalculator() {
  const [lmp, setLmp] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [result, setResult] = useState<{ dueDate: string; conception: string; currentWeek: number; trimester: string; daysLeft: number } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const calculate = () => {
    if (!lmp) return;
    const lmpDate = new Date(lmp);
    const cycle = parseInt(cycleLength) || 28;
    const adjustment = cycle - 28;
    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280 + adjustment);
    const conception = new Date(lmpDate);
    conception.setDate(conception.getDate() + 14 + adjustment);
    const today = new Date();
    const diffMs = today.getTime() - lmpDate.getTime();
    const currentWeek = Math.max(0, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)));
    const daysLeft = Math.max(0, Math.round((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)));
    let trimester = 'Third Trimester';
    if (currentWeek <= 12) trimester = 'First Trimester';
    else if (currentWeek <= 26) trimester = 'Second Trimester';
    setResult({
      dueDate: dueDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      conception: conception.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      currentWeek: Math.min(currentWeek, 40),
      trimester,
      daysLeft,
    });
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm';
  const labelCls = 'block text-xs font-semibold text-gray-500 mb-1';

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Heart className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Pregnancy Due Date Calculator</h1><p className="text-blue-200 text-sm">Estimated due date · gestational age · trimesters</p></div>
        </div>
        <p className="text-blue-100 text-sm leading-relaxed max-w-xl">Calculate your estimated due date, conception date, and current gestational week from your last menstrual period.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div><label className={labelCls}>First day of last menstrual period</label><input type="date" value={lmp} onChange={e => setLmp(e.target.value)} className={inputCls} /></div>
            <div>
              <label className={labelCls}>Average cycle length (days)</label>
              <select value={cycleLength} onChange={e => setCycleLength(e.target.value)} className={inputCls}>
                {Array.from({ length: 21 }, (_, i) => i + 20).map(d => <option key={d} value={d}>{d} days{d === 28 ? ' (average)' : ''}</option>)}
              </select>
            </div>
            <button onClick={calculate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm">Calculate Due Date</button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Trimester Guide</h3>
            <div className="space-y-3">
              {TRIMESTERS.map(t => (
                <div key={t.name} className="flex gap-3 items-start">
                  <div className="w-16 text-xs font-bold text-blue-600 shrink-0 pt-0.5">{t.weeks}w</div>
                  <div><div className="text-xs font-semibold text-gray-800">{t.name}</div><div className="text-xs text-gray-500">{t.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {result ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-900">Your Pregnancy Timeline</h2>
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-5 text-center border border-pink-100">
                <div className="text-xs text-pink-600 font-semibold mb-1">Estimated Due Date</div>
                <div className="text-xl font-extrabold text-gray-900">{result.dueDate}</div>
                <div className="text-sm text-gray-500 mt-1">{result.daysLeft > 0 ? `${result.daysLeft} days to go` : 'Your due date has passed'}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-extrabold text-blue-600">{result.currentWeek}</div>
                  <div className="text-xs text-gray-500 mt-1">Week of Pregnancy</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-sm font-bold text-emerald-600">{result.trimester}</div>
                  <div className="text-xs text-gray-500 mt-1">Current Stage</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">Estimated conception around: <strong>{result.conception}</strong></div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
              <Heart className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">Enter your LMP date above to get started</p>
            </div>
          )}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Schedule your first prenatal appointment as early as possible — ideally by week 8.</li>
              <li>• Start prenatal vitamins with folic acid before or immediately after a positive test.</li>
              <li>• An ultrasound scan between weeks 8–12 gives the most accurate due date.</li>
              <li>• Track symptoms weekly — they change significantly between trimesters.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Ovulation Calculator', href: '/ovulation-calculator' }, { label: 'Age Calculator', href: '/age-calculator' }, { label: 'BMI Calculator', href: '/bmi-calculator' }, { label: 'Calorie Calculator', href: '/calorie-calculator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">
              {(['up', 'down'] as const).map(v => (
                <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_pregnancy', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>
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
