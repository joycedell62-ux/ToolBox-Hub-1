import React, { useState } from 'react';
import { ArrowLeftRight, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

// Static exchange rates relative to USD (approximate mid-market rates)
const RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.50, CAD: 1.36, AUD: 1.53,
  CHF: 0.90, CNY: 7.24, INR: 83.12, MXN: 17.15, BRL: 4.97, KRW: 1325,
  SGD: 1.34, HKD: 7.82, NOK: 10.54, SEK: 10.38, DKK: 6.89, NZD: 1.63,
  ZAR: 18.63, AED: 3.67, SAR: 3.75, THB: 35.12, MYR: 4.72, IDR: 15735,
  PHP: 56.78, PKR: 278.50, BDT: 110.45, NGN: 1580, EGP: 30.90, KWD: 0.308,
};

const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar', AUD: 'Australian Dollar', CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan', INR: 'Indian Rupee', MXN: 'Mexican Peso',
  BRL: 'Brazilian Real', KRW: 'South Korean Won', SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar', NOK: 'Norwegian Krone', SEK: 'Swedish Krona',
  DKK: 'Danish Krone', NZD: 'New Zealand Dollar', ZAR: 'South African Rand',
  AED: 'UAE Dirham', SAR: 'Saudi Riyal', THB: 'Thai Baht', MYR: 'Malaysian Ringgit',
  IDR: 'Indonesian Rupiah', PHP: 'Philippine Peso', PKR: 'Pakistani Rupee',
  BDT: 'Bangladeshi Taka', NGN: 'Nigerian Naira', EGP: 'Egyptian Pound', KWD: 'Kuwaiti Dinar',
};

const CURRENCIES = Object.keys(RATES);

const FAQS = [
  { q: 'Are these exchange rates live?', a: 'No — this tool uses approximate mid-market rates baked in at build time. For real-time trading or international transfers, always check a live rate source.' },
  { q: 'What is a mid-market rate?', a: 'The midpoint between buy and sell rates — the fairest reference rate. Banks and services add a markup on top of this.' },
  { q: 'Why is my bank rate different?', a: 'Banks and services add a spread (0.5%–3%) on top of the mid-market rate. International wire fees may also apply.' },
  { q: 'Can I convert multiple currencies at once?', a: 'Yes — the comparison table below the converter shows the entered amount in all supported currencies at once.' },
  { q: 'How often are the rates updated?', a: 'Rates in this offline tool are updated with each app deployment. For up-to-the-minute rates, use a live service.' },
];

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [showAll, setShowAll] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const amt = parseFloat(amount) || 0;
  const toUSD = amt / RATES[from];
  const converted = toUSD * RATES[to];
  const rate = RATES[to] / RATES[from];

  const swap = () => { setFrom(to); setTo(from); };

  const fmtCurrency = (val: number, code: string) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: code, maximumFractionDigits: code === 'JPY' || code === 'KRW' || code === 'IDR' ? 0 : 2 }).format(val);
    } catch {
      return val.toFixed(2) + ' ' + code;
    }
  };

  const selectCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm';
  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm';

  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'NGN'];
  const displayCurrencies = showAll ? CURRENCIES : popularCurrencies;

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><ArrowLeftRight className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Currency Converter</h1><p className="text-blue-200 text-sm">30+ currencies · offline · instant conversion</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Convert between 30+ world currencies using approximate mid-market rates. Works fully offline.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Amount</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">From</label>
              <select value={from} onChange={e => setFrom(e.target.value)} className={selectCls}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c} — {CURRENCY_NAMES[c]}</option>)}
              </select>
            </div>
            <button onClick={swap} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
              <ArrowLeftRight className="w-4 h-4" /> Swap Currencies
            </button>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">To</label>
              <select value={to} onChange={e => setTo(e.target.value)} className={selectCls}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c} — {CURRENCY_NAMES[c]}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="text-sm text-gray-500 mb-1">{amt.toLocaleString()} {from} =</div>
              <div className="text-4xl font-extrabold text-blue-700">{fmtCurrency(converted, to)}</div>
              <div className="text-xs text-gray-400 mt-2">1 {from} = {rate.toFixed(4)} {to} &nbsp;·&nbsp; 1 {to} = {(1 / rate).toFixed(4)} {from}</div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700">Compare in other currencies</h3>
                <button onClick={() => setShowAll(s => !s)} className="text-xs text-blue-600 hover:underline">{showAll ? 'Show less' : 'Show all'}</button>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {displayCurrencies.filter(c => c !== from).map(c => (
                  <div key={c} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => setTo(c)}>
                    <span className="text-gray-500 font-medium">{c} — {CURRENCY_NAMES[c]}</span>
                    <span className="font-semibold text-gray-900">{fmtCurrency(toUSD * RATES[c], c)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• For international transfers, compare Wise, Revolut, and your bank — fees vary enormously.</li>
              <li>• Airport exchange booths have the worst rates — use an ATM at your destination instead.</li>
              <li>• Credit cards with no foreign transaction fees are often the best option abroad.</li>
              <li>• Always pay in the local currency abroad (decline "dynamic currency conversion").</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Salary Calculator', href: '/salary-calculator' }, { label: 'Tax Calculator', href: '/tax-calculator' }, { label: 'Discount Calculator', href: '/discount-calculator' }, { label: 'Percentage Calculator', href: '/percentage-calculator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">
              {(['up', 'down'] as const).map(v => (
                <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_currency', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>
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
