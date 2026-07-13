import React, { useState } from 'react';
import { Car, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What units does this support?', a: 'Imperial (miles, gallons, USD) and metric (km, litres, your local currency).' },
  { q: 'How do I find my fuel efficiency?', a: 'Fill up completely, drive normally, fill up again. Divide the miles driven by gallons used.' },
  { q: 'Can I compare two vehicles?', a: 'Enter the details for each vehicle separately and compare the total cost and per-km/mile figures.' },
  { q: 'What is the average US fuel economy?', a: 'About 27–30 MPG for new cars. SUVs/trucks average 18–22 MPG.' },
  { q: 'How much does 1 MPG improvement save?', a: 'On a 15,000-mile/year average driver at $3.50/gallon, each 1 MPG improvement saves roughly $50–80/year.' },
];

export default function FuelCostCalculator() {
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [distance, setDistance] = useState('');
  const [efficiency, setEfficiency] = useState('');
  const [fuelPrice, setFuelPrice] = useState('');
  const [result, setResult] = useState<{ fuelUsed: number; totalCost: number; costPer100: number } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const calculate = () => {
    const d = parseFloat(distance); const e = parseFloat(efficiency); const p = parseFloat(fuelPrice);
    if ([d, e, p].some(isNaN) || e <= 0) return;
    let fuelUsed: number, costPer100: number;
    if (unit === 'imperial') {
      fuelUsed = d / e; // gallons
      costPer100 = (100 / e) * p; // per 100 miles
    } else {
      fuelUsed = (d / 100) * e; // litres (L/100km format)
      costPer100 = e * p; // cost per 100km
    }
    setResult({ fuelUsed: parseFloat(fuelUsed.toFixed(2)), totalCost: parseFloat((fuelUsed * p).toFixed(2)), costPer100: parseFloat(costPer100.toFixed(2)) });
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm';
  const labelCls = 'block text-xs font-semibold text-gray-500 mb-1';
  const distUnit = unit === 'imperial' ? 'miles' : 'km';
  const effUnit = unit === 'imperial' ? 'MPG' : 'L/100km';
  const fuelUnit = unit === 'imperial' ? 'gallon' : 'litre';

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Car className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Fuel Cost Calculator</h1><p className="text-blue-200 text-sm">Trip cost · fuel usage · cost per 100 {distUnit}</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Calculate how much a trip will cost in fuel based on distance, vehicle efficiency, and fuel price.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex gap-2">
              {(['imperial', 'metric'] as const).map(u => (
                <button key={u} onClick={() => setUnit(u)} className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${unit === u ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{u}</button>
              ))}
            </div>
            <div><label className={labelCls}>Distance ({distUnit})</label><input type="number" value={distance} onChange={e => setDistance(e.target.value)} placeholder={unit === 'imperial' ? 'e.g. 300' : 'e.g. 480'} className={inputCls} /></div>
            <div><label className={labelCls}>Fuel Efficiency ({effUnit})</label><input type="number" value={efficiency} onChange={e => setEfficiency(e.target.value)} placeholder={unit === 'imperial' ? 'e.g. 28' : 'e.g. 8.5'} className={inputCls} /></div>
            <div><label className={labelCls}>Fuel Price (per {fuelUnit})</label><input type="number" value={fuelPrice} onChange={e => setFuelPrice(e.target.value)} placeholder={unit === 'imperial' ? 'e.g. 3.50' : 'e.g. 1.80'} step="0.01" className={inputCls} /></div>
            <button onClick={calculate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm">Calculate Fuel Cost</button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {result ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-gray-900">Trip Cost Breakdown</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Cost', value: `$${result.totalCost}`, color: 'text-blue-700' },
                  { label: `Fuel Used (${fuelUnit}s)`, value: result.fuelUsed.toString(), color: 'text-orange-500' },
                  { label: `Per 100 ${distUnit}`, value: `$${result.costPer100}`, color: 'text-emerald-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-50 rounded-2xl p-4 text-center">
                    <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
                    <div className="text-xs text-gray-400 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
              <Car className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">Enter trip details to calculate fuel cost</p>
            </div>
          )}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Maintaining proper tire pressure can improve fuel economy by up to 3%.</li>
              <li>• Driving at 55–60 mph uses up to 20% less fuel than 75 mph.</li>
              <li>• Removing 100 lbs of unnecessary weight improves MPG by ~1–2%.</li>
              <li>• Regular air filter replacements keep fuel efficiency optimal.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Electricity Bill', href: '/electricity-bill-calculator' }, { label: 'Currency Converter', href: '/currency-converter' }, { label: 'Salary Calculator', href: '/salary-calculator' }, { label: 'Percentage Calculator', href: '/percentage-calculator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">
              {(['up', 'down'] as const).map(v => (
                <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_fuel', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>
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
