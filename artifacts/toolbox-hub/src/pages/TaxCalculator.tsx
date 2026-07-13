import React, { useState } from 'react';
import { DollarSign, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

// 2024 US Federal tax brackets (single filer)
const SINGLE_BRACKETS = [
  { limit: 11600, rate: 0.10 },
  { limit: 47150, rate: 0.12 },
  { limit: 100525, rate: 0.22 },
  { limit: 191950, rate: 0.24 },
  { limit: 243725, rate: 0.32 },
  { limit: 609350, rate: 0.35 },
  { limit: Infinity, rate: 0.37 },
];

const MARRIED_BRACKETS = [
  { limit: 23200, rate: 0.10 },
  { limit: 94300, rate: 0.12 },
  { limit: 201050, rate: 0.22 },
  { limit: 383900, rate: 0.24 },
  { limit: 487450, rate: 0.32 },
  { limit: 731200, rate: 0.35 },
  { limit: Infinity, rate: 0.37 },
];

const STANDARD_DEDUCTION: Record<string, number> = { single: 14600, married: 29200, hoh: 21900 };

const FAQS = [
  { q: 'What year are these brackets from?', a: '2024 US federal income tax brackets. State taxes vary widely and are applied as a simple percentage.' },
  { q: 'What is a standard deduction?', a: 'The IRS lets you reduce taxable income by a standard amount before calculating tax. For 2024: $14,600 (single), $29,200 (married filing jointly).' },
  { q: 'What is effective vs marginal tax rate?', a: 'Marginal is the rate on your last dollar earned. Effective is the average rate across all brackets — usually much lower.' },
  { q: 'Are self-employment taxes included?', a: 'No — this covers federal income tax only. Self-employed individuals also owe 15.3% SECA taxes on net earnings.' },
  { q: 'Is FICA (Social Security/Medicare) included?', a: 'Not in this calculator. FICA is 7.65% of wages up to the SS wage base ($168,600 in 2024).' },
];

export default function TaxCalculator() {
  const [income, setIncome] = useState('');
  const [filingStatus, setFilingStatus] = useState<'single' | 'married' | 'hoh'>('single');
  const [stateRate, setStateRate] = useState('5');
  const [extraDeductions, setExtraDeductions] = useState('');
  const [result, setResult] = useState<{ taxable: number; federalTax: number; stateTax: number; totalTax: number; effectiveRate: number; marginalRate: number; takeHome: number; brackets: { rate: number; taxable: number; tax: number }[] } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const calculate = () => {
    const gross = parseFloat(income.replace(/,/g, ''));
    if (isNaN(gross) || gross <= 0) return;
    const stdDed = STANDARD_DEDUCTION[filingStatus] || 14600;
    const extraDed = parseFloat(extraDeductions) || 0;
    const taxable = Math.max(0, gross - stdDed - extraDed);
    const brackets = filingStatus === 'married' ? MARRIED_BRACKETS : SINGLE_BRACKETS;

    let federalTax = 0;
    let prev = 0;
    let marginalRate = 0.10;
    const bracketBreakdown: { rate: number; taxable: number; tax: number }[] = [];

    for (const bracket of brackets) {
      if (taxable <= prev) break;
      const taxableInBracket = Math.min(taxable, bracket.limit) - prev;
      const tax = taxableInBracket * bracket.rate;
      if (taxableInBracket > 0) bracketBreakdown.push({ rate: bracket.rate, taxable: taxableInBracket, tax });
      federalTax += tax;
      marginalRate = bracket.rate;
      prev = bracket.limit;
      if (taxable <= bracket.limit) break;
    }

    const stateTax = gross * (parseFloat(stateRate) / 100 || 0);
    const totalTax = federalTax + stateTax;
    setResult({
      taxable,
      federalTax,
      stateTax,
      totalTax,
      effectiveRate: (totalTax / gross) * 100,
      marginalRate: marginalRate * 100,
      takeHome: gross - totalTax,
      brackets: bracketBreakdown,
    });
  };

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString();
  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm';
  const labelCls = 'block text-xs font-semibold text-gray-500 mb-1';

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><DollarSign className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Tax Calculator</h1><p className="text-blue-200 text-sm">US federal income tax · bracket breakdown · take-home pay</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Estimate your 2024 federal and state income tax with a full bracket breakdown and take-home pay calculation.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div><label className={labelCls}>Annual Gross Income (USD)</label><input type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="e.g. 85000" className={inputCls} /></div>
            <div>
              <label className={labelCls}>Filing Status</label>
              <select value={filingStatus} onChange={e => setFilingStatus(e.target.value as typeof filingStatus)} className={inputCls}>
                <option value="single">Single</option>
                <option value="married">Married Filing Jointly</option>
                <option value="hoh">Head of Household</option>
              </select>
            </div>
            <div><label className={labelCls}>State Tax Rate (%)</label><input type="number" value={stateRate} onChange={e => setStateRate(e.target.value)} placeholder="e.g. 5" min="0" max="15" className={inputCls} /></div>
            <div><label className={labelCls}>Additional Deductions (optional)</label><input type="number" value={extraDeductions} onChange={e => setExtraDeductions(e.target.value)} placeholder="e.g. 5000" className={inputCls} /></div>
            <button onClick={calculate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm">Calculate Tax</button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {result ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-900">Tax Summary</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Taxable Income', value: fmt(result.taxable), color: 'text-gray-800' },
                  { label: 'Take-Home Pay', value: fmt(result.takeHome), color: 'text-emerald-600' },
                  { label: 'Federal Tax', value: fmt(result.federalTax), color: 'text-red-500' },
                  { label: 'State Tax', value: fmt(result.stateTax), color: 'text-orange-500' },
                  { label: 'Effective Rate', value: result.effectiveRate.toFixed(1) + '%', color: 'text-blue-600' },
                  { label: 'Marginal Rate', value: result.marginalRate.toFixed(0) + '%', color: 'text-purple-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className={`font-bold text-lg ${color}`}>{value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              {result.brackets.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-2">Federal Bracket Breakdown</h3>
                  <div className="space-y-1.5">
                    {result.brackets.map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-gray-600">{(b.rate * 100).toFixed(0)}% bracket</span>
                        <span className="text-gray-500">{fmt(b.taxable)} taxable</span>
                        <span className="font-semibold text-red-500">{fmt(b.tax)} tax</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
              <DollarSign className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">Enter your income to see your tax breakdown</p>
            </div>
          )}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Contributing to a 401k or IRA reduces taxable income dollar-for-dollar.</li>
              <li>• Your effective rate is always lower than your marginal (top bracket) rate.</li>
              <li>• Itemizing deductions (mortgage interest, charity) can beat the standard deduction.</li>
              <li>• HSA contributions are triple tax-advantaged — pre-tax in, grows tax-free, tax-free withdrawal for medical.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Salary Calculator', href: '/salary-calculator' }, { label: 'Loan Calculator', href: '/loan-calculator' }, { label: 'Percentage Calculator', href: '/percentage-calculator' }, { label: 'Discount Calculator', href: '/discount-calculator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">
              {(['up', 'down'] as const).map(v => (
                <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_tax', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>
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
