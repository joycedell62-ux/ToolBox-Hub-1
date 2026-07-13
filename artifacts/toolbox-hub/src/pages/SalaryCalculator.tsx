import React, { useState } from 'react';
import { DollarSign, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'How are the pay periods calculated?', a: 'We convert your entered salary to an annual figure, then divide by the appropriate number of periods (weekly=52, bi-weekly=26, semi-monthly=24, monthly=12).' },
  { q: 'Are taxes deducted?', a: 'The gross breakdown shows pre-tax amounts. The net section applies your chosen tax rate as a rough estimate — actual take-home depends on your country, filing status, and deductions.' },
  { q: 'What is bi-weekly vs semi-monthly?', a: 'Bi-weekly = every 2 weeks (26 paychecks/year). Semi-monthly = twice a month on set dates like the 1st and 15th (24 paychecks/year).' },
  { q: 'Can I enter an hourly rate?', a: 'Yes — select "Hourly" and enter your rate. We assume 40 hours/week and 52 weeks/year for the annual figure.' },
  { q: 'What about overtime?', a: 'This calculator uses standard 40h/week. For overtime earnings, add them separately to the annual estimate.' },
];

const PAY_TYPE = ['Hourly', 'Weekly', 'Bi-Weekly', 'Semi-Monthly', 'Monthly', 'Annual'] as const;
type PT = typeof PAY_TYPE[number];

function toAnnual(amount: number, type: PT): number {
  switch (type) {
    case 'Hourly': return amount * 40 * 52;
    case 'Weekly': return amount * 52;
    case 'Bi-Weekly': return amount * 26;
    case 'Semi-Monthly': return amount * 24;
    case 'Monthly': return amount * 12;
    case 'Annual': return amount;
  }
}

export default function SalaryCalculator() {
  const [amount, setAmount] = useState('');
  const [payType, setPayType] = useState<PT>('Annual');
  const [taxRate, setTaxRate] = useState('25');
  const [result, setResult] = useState<{ annual: number; monthly: number; biWeekly: number; weekly: number; daily: number; hourly: number; netAnnual: number; netMonthly: number } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const calculate = () => {
    const a = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(a) || a <= 0) return;
    const annual = toAnnual(a, payType);
    const tax = parseFloat(taxRate) / 100 || 0;
    setResult({
      annual,
      monthly: annual / 12,
      biWeekly: annual / 26,
      weekly: annual / 52,
      daily: annual / 260,
      hourly: annual / 2080,
      netAnnual: annual * (1 - tax),
      netMonthly: (annual / 12) * (1 - tax),
    });
  };

  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const fmt2 = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm';
  const labelCls = 'block text-xs font-semibold text-gray-500 mb-1';

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><DollarSign className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Salary Calculator</h1><p className="text-blue-200 text-sm">Convert any pay period · gross & net estimates</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Convert hourly, weekly, or monthly pay to annual salary and see your estimated take-home after taxes.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className={labelCls}>Pay Type</label>
              <select value={payType} onChange={e => setPayType(e.target.value as PT)} className={inputCls}>
                {PAY_TYPE.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Amount (USD)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={payType === 'Hourly' ? 'e.g. 25' : 'e.g. 75000'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Estimated Tax Rate (%)</label>
              <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} placeholder="e.g. 25" min="0" max="60" className={inputCls} />
            </div>
            <button onClick={calculate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm">Calculate Salary</button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {result ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-900">Salary Breakdown</h2>
              <div className="space-y-2">
                {[
                  { label: 'Annual', gross: result.annual, net: result.netAnnual },
                  { label: 'Monthly', gross: result.monthly, net: result.netMonthly },
                  { label: 'Bi-Weekly', gross: result.biWeekly, net: result.biWeekly * (1 - parseFloat(taxRate) / 100) },
                  { label: 'Weekly', gross: result.weekly, net: result.weekly * (1 - parseFloat(taxRate) / 100) },
                  { label: 'Daily', gross: result.daily, net: result.daily * (1 - parseFloat(taxRate) / 100) },
                  { label: 'Hourly', gross: result.hourly, net: result.hourly * (1 - parseFloat(taxRate) / 100) },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm font-semibold text-gray-600 w-24">{row.label}</span>
                    <div className="flex gap-8 text-right">
                      <div><div className="text-xs text-gray-400">Gross</div><div className="font-bold text-gray-900 text-sm">{fmt2(row.gross)}</div></div>
                      <div><div className="text-xs text-gray-400">Est. Net</div><div className="font-bold text-emerald-600 text-sm">{fmt2(row.net)}</div></div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">Net estimates use a flat {taxRate}% tax rate. Actual take-home depends on deductions, state/local taxes, and benefits.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
              <DollarSign className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">Enter your pay details to see the full breakdown</p>
            </div>
          )}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• When comparing job offers, always convert to annual salary first.</li>
              <li>• Don't forget benefits — health insurance, 401k matching, and PTO add 20–30% to total compensation.</li>
              <li>• In most of the US, effective tax rates are lower than marginal rates.</li>
              <li>• Use your W-2 or last pay stub for an accurate real-world comparison.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Tax Calculator', href: '/tax-calculator' }, { label: 'Loan Calculator', href: '/loan-calculator' }, { label: 'Percentage Calculator', href: '/percentage-calculator' }, { label: 'Discount Calculator', href: '/discount-calculator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">
              {(['up', 'down'] as const).map(v => (
                <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_salary', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>
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
