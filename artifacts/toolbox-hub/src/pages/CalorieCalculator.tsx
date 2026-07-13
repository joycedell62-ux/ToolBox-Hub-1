import React, { useState } from 'react';
import { Flame, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

const ACTIVITY_LEVELS = [
  { label: 'Sedentary (little or no exercise)', multiplier: 1.2 },
  { label: 'Lightly active (1–3 days/week)', multiplier: 1.375 },
  { label: 'Moderately active (3–5 days/week)', multiplier: 1.55 },
  { label: 'Very active (6–7 days/week)', multiplier: 1.725 },
  { label: 'Super active (physical job + exercise)', multiplier: 1.9 },
];

const GOALS = [
  { label: 'Lose weight (−500 cal/day)', delta: -500 },
  { label: 'Lose weight fast (−1000 cal/day)', delta: -1000 },
  { label: 'Maintain weight', delta: 0 },
  { label: 'Gain weight (mild) (+300 cal/day)', delta: 300 },
  { label: 'Gain weight (fast) (+500 cal/day)', delta: 500 },
];

const FAQS = [
  { q: 'What formula does this use?', a: 'We use the Mifflin-St Jeor equation, the most accurate formula for estimating basal metabolic rate (BMR) for most people.' },
  { q: 'What is TDEE?', a: 'Total Daily Energy Expenditure — the total calories your body burns per day including all activity, not just at rest.' },
  { q: 'How accurate is this?', a: 'It is a clinical estimate accurate within ±10%. Individual metabolism, muscle mass, and health conditions affect the real figure.' },
  { q: 'Can I use metric units?', a: 'Yes — toggle to metric mode and enter your weight in kg and height in cm.' },
  { q: 'How many calories should I cut to lose 1 lb/week?', a: 'Roughly 500 calories per day below TDEE equals approximately 1 lb (0.45 kg) of fat lost per week.' },
];

export default function CalorieCalculator() {
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [activity, setActivity] = useState(0);
  const [goal, setGoal] = useState(2);
  const [result, setResult] = useState<{ bmr: number; tdee: number; target: number } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const calculate = () => {
    const a = parseFloat(age);
    let weightInKg: number, heightInCm: number;
    if (unit === 'imperial') {
      weightInKg = parseFloat(weightLbs) * 0.453592;
      heightInCm = (parseFloat(heightFt) * 30.48) + (parseFloat(heightIn || '0') * 2.54);
    } else {
      weightInKg = parseFloat(weightKg);
      heightInCm = parseFloat(heightCm);
    }
    if (isNaN(a) || isNaN(weightInKg) || isNaN(heightInCm) || a <= 0 || weightInKg <= 0 || heightInCm <= 0) return;
    let bmr: number;
    if (sex === 'male') {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * a + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * a - 161;
    }
    const tdee = bmr * ACTIVITY_LEVELS[activity].multiplier;
    const target = tdee + GOALS[goal].delta;
    setResult({ bmr: Math.round(bmr), tdee: Math.round(tdee), target: Math.round(target) });
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm';
  const labelCls = 'block text-xs font-semibold text-gray-500 mb-1';

  return (
    <>
      <div className="flex flex-col gap-10">
        {/* Hero */}
        <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2.5 rounded-xl"><Flame className="w-6 h-6" /></div>
            <div>
              <h1 className="text-2xl font-extrabold">Calorie Calculator</h1>
              <p className="text-blue-200 text-sm">BMR · TDEE · Daily calorie targets</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed max-w-xl">
            Find out how many calories your body needs based on your age, sex, size, and activity level using the Mifflin-St Jeor formula.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Controls */}
          <div className="lg:col-span-2 space-y-5">
            {/* Unit toggle */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex gap-2">
                {(['imperial', 'metric'] as const).map(u => (
                  <button key={u} onClick={() => setUnit(u)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${unit === u ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {u}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {(['male', 'female'] as const).map(s => (
                  <button key={s} onClick={() => setSex(s)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${sex === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {s === 'male' ? '♂ Male' : '♀ Female'}
                  </button>
                ))}
              </div>
              <div>
                <label className={labelCls}>Age (years)</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 28" className={inputCls} />
              </div>
              {unit === 'imperial' ? (
                <>
                  <div>
                    <label className={labelCls}>Weight (lbs)</label>
                    <input type="number" value={weightLbs} onChange={e => setWeightLbs(e.target.value)} placeholder="e.g. 160" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Height (ft)</label>
                      <input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} placeholder="5" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Height (in)</label>
                      <input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} placeholder="8" className={inputCls} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={labelCls}>Weight (kg)</label>
                    <input type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="e.g. 72" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Height (cm)</label>
                    <input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="e.g. 175" className={inputCls} />
                  </div>
                </>
              )}
              <div>
                <label className={labelCls}>Activity Level</label>
                <select value={activity} onChange={e => setActivity(Number(e.target.value))} className={inputCls}>
                  {ACTIVITY_LEVELS.map((al, i) => <option key={i} value={i}>{al.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Goal</label>
                <select value={goal} onChange={e => setGoal(Number(e.target.value))} className={inputCls}>
                  {GOALS.map((g, i) => <option key={i} value={i}>{g.label}</option>)}
                </select>
              </div>
              <button onClick={calculate}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-100 shadow-sm">
                Calculate Calories
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-5">
            {result ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="font-bold text-gray-900">Your Daily Calorie Needs</h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'BMR', value: result.bmr, sub: 'Basal Metabolic Rate', color: 'text-violet-600' },
                    { label: 'TDEE', value: result.tdee, sub: 'Total Daily Expenditure', color: 'text-blue-600' },
                    { label: 'Target', value: result.target, sub: GOALS[goal].label.split('(')[0].trim(), color: 'text-emerald-600' },
                  ].map(({ label, value, sub, color }) => (
                    <div key={label} className="bg-gray-50 rounded-2xl p-4 text-center">
                      <div className={`text-3xl font-extrabold ${color}`}>{value.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 mt-1">cal/day</div>
                      <div className="text-[11px] font-semibold text-gray-400 mt-1">{label}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                  <strong>What this means:</strong> Your body burns <strong>{result.bmr.toLocaleString()} cal</strong> at rest and <strong>{result.tdee.toLocaleString()} cal</strong> total per day. Eating <strong>{result.target.toLocaleString()} cal/day</strong> will help you reach your goal.
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
                <Flame className="w-12 h-12 text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium">Fill in your details and click Calculate</p>
                <p className="text-sm text-gray-400 mt-1">Your calorie breakdown will appear here</p>
              </div>
            )}

            {/* Pro Tips */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-blue-900 text-sm">Pro Tips</span>
              </div>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Never eat below your BMR for extended periods — it slows metabolism.</li>
                <li>• A deficit of 500 cal/day ≈ 1 lb fat lost per week.</li>
                <li>• Protein intake (0.7–1g per lb of bodyweight) helps preserve muscle while cutting.</li>
                <li>• Recalculate every 10–15 lbs of weight change as your TDEE shifts.</li>
                <li>• Tracking food for just 2 weeks builds lasting calorie awareness.</li>
              </ul>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'BMI Calculator', href: '/bmi-calculator' },
                  { label: 'Body Fat Calculator', href: '/body-fat-calculator' },
                  { label: 'Fuel Cost Calculator', href: '/fuel-cost-calculator' },
                  { label: 'Age Calculator', href: '/age-calculator' },
                ].map(r => (
                  <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
              <div className="flex gap-2">
                {(['up', 'down'] as const).map(v => (
                  <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_calorie', v); }}
                    className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>
                    {v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
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
    </>
  );
}
