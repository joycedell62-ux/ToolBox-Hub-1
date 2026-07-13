import React, { useState } from 'react';
import { Flame, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What method is used?', a: 'The U.S. Navy body fat formula — one of the most accessible and reasonably accurate methods that only requires a tape measure.' },
  { q: 'What are healthy body fat ranges?', a: 'For men: Essential 2–5%, Athletic 6–13%, Fit 14–17%, Acceptable 18–24%, Obese 25%+. For women: Essential 10–13%, Athletic 14–20%, Fit 21–24%, Acceptable 25–31%, Obese 32%+.' },
  { q: 'Is the result 100% accurate?', a: 'No tape-measure method is perfectly accurate. For clinical accuracy, use DEXA scans or hydrostatic weighing. This gives a solid estimate.' },
  { q: 'Where do I measure waist?', a: 'Measure at your navel level for men, and at the narrowest point for women.' },
  { q: 'What is lean mass?', a: 'Lean mass is everything that is not fat — muscles, bones, water, organs. It is your total weight minus fat weight.' },
];

export default function BodyFatCalculator() {
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [weightLbs, setWeightLbs] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [waistIn, setWaistIn] = useState('');
  const [neckIn, setNeckIn] = useState('');
  const [hipIn, setHipIn] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [neckCm, setNeckCm] = useState('');
  const [hipCm, setHipCm] = useState('');
  const [result, setResult] = useState<{ bf: number; category: string; fatMass: number; leanMass: number } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const toIn = (cm: string) => parseFloat(cm) / 2.54;

  const getCategory = (bf: number, isMale: boolean) => {
    if (isMale) {
      if (bf < 6) return 'Essential Fat';
      if (bf < 14) return 'Athletic';
      if (bf < 18) return 'Fit';
      if (bf < 25) return 'Acceptable';
      return 'Obese';
    } else {
      if (bf < 14) return 'Essential Fat';
      if (bf < 21) return 'Athletic';
      if (bf < 25) return 'Fit';
      if (bf < 32) return 'Acceptable';
      return 'Obese';
    }
  };

  const calculate = () => {
    let w: number, h: number, wa: number, ne: number, hi: number;
    if (unit === 'imperial') {
      w = parseFloat(weightLbs); h = parseFloat(heightIn);
      wa = parseFloat(waistIn); ne = parseFloat(neckIn); hi = parseFloat(hipIn);
    } else {
      w = parseFloat(weightKg) * 2.20462;
      h = toIn(heightCm); wa = toIn(waistCm); ne = toIn(neckCm); hi = toIn(hipCm);
    }
    if ([w, h, wa, ne].some(isNaN) || w <= 0 || h <= 0) return;
    let bf: number;
    if (sex === 'male') {
      bf = 86.010 * Math.log10(wa - ne) - 70.041 * Math.log10(h) + 36.76;
    } else {
      if (isNaN(hi)) return;
      bf = 163.205 * Math.log10(wa + hi - ne) - 97.684 * Math.log10(h) - 78.387;
    }
    bf = Math.max(0, Math.min(60, parseFloat(bf.toFixed(1))));
    const fatMass = parseFloat(((bf / 100) * w).toFixed(1));
    const leanMass = parseFloat((w - fatMass).toFixed(1));
    setResult({ bf, category: getCategory(bf, sex === 'male'), fatMass, leanMass });
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm';
  const labelCls = 'block text-xs font-semibold text-gray-500 mb-1';
  const catColor: Record<string, string> = { 'Essential Fat': 'text-red-600', Athletic: 'text-emerald-600', Fit: 'text-blue-600', Acceptable: 'text-yellow-600', Obese: 'text-red-700' };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Flame className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-extrabold">Body Fat Calculator</h1>
            <p className="text-blue-200 text-sm">U.S. Navy tape-measure method</p>
          </div>
        </div>
        <p className="text-blue-100 text-sm leading-relaxed max-w-xl">Estimate your body fat percentage using body measurements — no equipment other than a measuring tape required.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex gap-2">
              {(['imperial', 'metric'] as const).map(u => (
                <button key={u} onClick={() => setUnit(u)} className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${unit === u ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{u}</button>
              ))}
            </div>
            <div className="flex gap-2">
              {(['male', 'female'] as const).map(s => (
                <button key={s} onClick={() => setSex(s)} className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${sex === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s === 'male' ? '♂ Male' : '♀ Female'}</button>
              ))}
            </div>
            {unit === 'imperial' ? (
              <>
                <div><label className={labelCls}>Weight (lbs)</label><input type="number" value={weightLbs} onChange={e => setWeightLbs(e.target.value)} placeholder="e.g. 175" className={inputCls} /></div>
                <div><label className={labelCls}>Height (inches)</label><input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} placeholder="e.g. 70" className={inputCls} /></div>
                <div><label className={labelCls}>Waist circumference (in)</label><input type="number" value={waistIn} onChange={e => setWaistIn(e.target.value)} placeholder="e.g. 34" className={inputCls} /></div>
                <div><label className={labelCls}>Neck circumference (in)</label><input type="number" value={neckIn} onChange={e => setNeckIn(e.target.value)} placeholder="e.g. 15" className={inputCls} /></div>
                {sex === 'female' && <div><label className={labelCls}>Hip circumference (in)</label><input type="number" value={hipIn} onChange={e => setHipIn(e.target.value)} placeholder="e.g. 38" className={inputCls} /></div>}
              </>
            ) : (
              <>
                <div><label className={labelCls}>Weight (kg)</label><input type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="e.g. 79" className={inputCls} /></div>
                <div><label className={labelCls}>Height (cm)</label><input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="e.g. 178" className={inputCls} /></div>
                <div><label className={labelCls}>Waist (cm)</label><input type="number" value={waistCm} onChange={e => setWaistCm(e.target.value)} placeholder="e.g. 86" className={inputCls} /></div>
                <div><label className={labelCls}>Neck (cm)</label><input type="number" value={neckCm} onChange={e => setNeckCm(e.target.value)} placeholder="e.g. 38" className={inputCls} /></div>
                {sex === 'female' && <div><label className={labelCls}>Hip (cm)</label><input type="number" value={hipCm} onChange={e => setHipCm(e.target.value)} placeholder="e.g. 96" className={inputCls} /></div>}
              </>
            )}
            <button onClick={calculate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-100 shadow-sm">Calculate Body Fat</button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {result ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-900">Your Results</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-5 text-center col-span-2">
                  <div className={`text-5xl font-extrabold ${catColor[result.category] || 'text-blue-600'}`}>{result.bf}%</div>
                  <div className="text-sm text-gray-500 mt-1">Body Fat</div>
                  <div className={`text-sm font-bold mt-2 ${catColor[result.category] || 'text-blue-600'}`}>{result.category}</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500">{result.fatMass} lbs</div>
                  <div className="text-xs text-gray-400 mt-1">Fat Mass</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{result.leanMass} lbs</div>
                  <div className="text-xs text-gray-400 mt-1">Lean Mass</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
              <Flame className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">Enter your measurements to see results</p>
            </div>
          )}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Measure in the morning before eating for most consistent results.</li>
              <li>• Use a flexible tape and measure the same spot each time.</li>
              <li>• Track trends over weeks, not day-to-day fluctuations.</li>
              <li>• Muscle gain and fat loss can happen simultaneously — scale weight alone is misleading.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'BMI Calculator', href: '/bmi-calculator' }, { label: 'Calorie Calculator', href: '/calorie-calculator' }, { label: 'Age Calculator', href: '/age-calculator' }, { label: 'Percentage Calculator', href: '/percentage-calculator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">
              {(['up', 'down'] as const).map(v => (
                <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_bodyfat', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>
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
