import React, { useState } from 'react';
import { Zap, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Link } from 'wouter';

interface Appliance { id: number; name: string; watts: string; hours: string; days: string; }

const FAQS = [
  { q: 'How is electricity cost calculated?', a: 'Cost = (Watts × Hours × Days) / 1000 × Rate. Power in kWh × your utility rate gives the dollar cost.' },
  { q: 'What is the average electricity rate?', a: 'The US average is about $0.12–$0.16 per kWh. Check your utility bill for your exact rate.' },
  { q: 'What is a kWh?', a: 'Kilowatt-hour — the energy used by a 1,000-watt device running for 1 hour. It\'s the unit on your electricity bill.' },
  { q: 'How do I find an appliance\'s wattage?', a: 'Check the label on the back or bottom of the device, the product manual, or search "[device name] wattage" online.' },
  { q: 'Can I reduce my electricity bill?', a: 'Yes — switch to LED bulbs, unplug vampire devices, use smart power strips, and run heavy appliances during off-peak hours.' },
];

let nextId = 2;

export default function ElectricityBillCalculator() {
  const [rate, setRate] = useState('0.13');
  const [appliances, setAppliances] = useState<Appliance[]>([
    { id: 1, name: 'Refrigerator', watts: '150', hours: '24', days: '30' },
  ]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const addAppliance = () => {
    setAppliances(prev => [...prev, { id: nextId++, name: '', watts: '', hours: '', days: '30' }]);
  };

  const removeAppliance = (id: number) => setAppliances(prev => prev.filter(a => a.id !== id));
  const updateAppliance = (id: number, field: keyof Appliance, value: string) => {
    setAppliances(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const r = parseFloat(rate) || 0;
  const breakdown = appliances.map(a => {
    const w = parseFloat(a.watts) || 0;
    const h = parseFloat(a.hours) || 0;
    const d = parseFloat(a.days) || 0;
    const kwh = (w * h * d) / 1000;
    const cost = kwh * r;
    return { ...a, kwh, cost };
  });
  const totalKwh = breakdown.reduce((s, a) => s + a.kwh, 0);
  const totalCost = totalKwh * r;

  const inputCls = 'border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm w-full';

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Zap className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Electricity Bill Calculator</h1><p className="text-blue-200 text-sm">Calculate cost by appliance · monthly totals</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Add your appliances, enter wattage and usage, and see exactly how much each one costs per month.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Electricity Rate ($/kWh)</label>
              <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="0.13" step="0.01" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm" />
            </div>
            <div className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">Find your rate on your electricity bill or enter the US average of $0.13/kWh.</div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-sm">Appliances</h2>
              <button onClick={addAppliance} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Appliance
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-gray-400 pb-1 border-b border-gray-100">
              <span className="col-span-2">Name</span><span>Watts</span><span>Hours/day</span><span>Days</span>
            </div>
            {appliances.map(a => (
              <div key={a.id} className="grid grid-cols-5 gap-2 items-center">
                <input className={`col-span-2 ${inputCls}`} placeholder="e.g. TV" value={a.name} onChange={e => updateAppliance(a.id, 'name', e.target.value)} />
                <input className={inputCls} type="number" placeholder="100" value={a.watts} onChange={e => updateAppliance(a.id, 'watts', e.target.value)} />
                <input className={inputCls} type="number" placeholder="8" value={a.hours} onChange={e => updateAppliance(a.id, 'hours', e.target.value)} />
                <div className="flex items-center gap-1">
                  <input className={inputCls} type="number" placeholder="30" value={a.days} onChange={e => updateAppliance(a.id, 'days', e.target.value)} />
                  {appliances.length > 1 && <button onClick={() => removeAppliance(a.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>}
                </div>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              {breakdown.filter(a => a.kwh > 0).map(a => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{a.name || 'Unnamed'}</span>
                  <div className="flex gap-4 text-right">
                    <span className="text-gray-400">{a.kwh.toFixed(1)} kWh</span>
                    <span className="font-semibold text-gray-900">${a.cost.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {totalCost > 0 && (
                <div className="flex items-center justify-between text-sm font-bold pt-2 border-t border-gray-100">
                  <span className="text-gray-900">Total</span>
                  <div className="flex gap-4 text-right">
                    <span className="text-gray-600">{totalKwh.toFixed(1)} kWh</span>
                    <span className="text-blue-700 text-base">${totalCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Switching from incandescent to LED bulbs saves ~75% on lighting costs.</li>
              <li>• A smart power strip can eliminate always-on standby draw from TVs and entertainment systems.</li>
              <li>• Refrigerators account for ~15% of a typical home's electricity use.</li>
              <li>• Running dishwashers and washing machines at night avoids peak-rate charges in some areas.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Fuel Cost Calculator', href: '/fuel-cost-calculator' }, { label: 'Currency Converter', href: '/currency-converter' }, { label: 'Salary Calculator', href: '/salary-calculator' }, { label: 'Percentage Calculator', href: '/percentage-calculator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">
              {(['up', 'down'] as const).map(v => (
                <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_electricity', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>
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
