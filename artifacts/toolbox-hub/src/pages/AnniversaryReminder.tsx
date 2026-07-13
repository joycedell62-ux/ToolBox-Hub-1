import React, { useState, useEffect } from 'react';
import { Heart, Plus, Trash2, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

interface Anniversary { id: number; name: string; date: string; note: string; }
let nid = 1;
const FAQS = [{ q: 'Is this saved?', a: 'Yes — auto-saved to browser local storage.' }, { q: 'What types of anniversaries can I track?', a: 'Any recurring annual date — weddings, work anniversaries, friendships, sobriety milestones, and more.' }];

export default function AnniversaryReminder() {
  const [items, setItems] = useState<Anniversary[]>([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => { const s = localStorage.getItem('anniversaries'); if (s) { try { const p = JSON.parse(s); setItems(p); nid = p.length ? Math.max(...p.map((a: Anniversary) => a.id)) + 1 : 1; } catch {} } }, []);
  useEffect(() => { localStorage.setItem('anniversaries', JSON.stringify(items)); }, [items]);

  const add = () => { if (!name.trim() || !date) return; setItems(prev => [...prev, { id: nid++, name: name.trim(), date, note }]); setName(''); setDate(''); setNote(''); };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const [, month, day] = dateStr.split('-').map(Number);
    let next = new Date(today.getFullYear(), month - 1, day);
    if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day);
    return Math.round((next.getTime() - today.getTime()) / 86400000);
  };

  const getYears = (dateStr: string) => { const [y] = dateStr.split('-').map(Number); return y > 1900 ? new Date().getFullYear() - y : null; };
  const sorted = [...items].sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));
  const urgencyColor = (d: number) => d === 0 ? 'bg-red-100 border-red-300' : d <= 7 ? 'bg-pink-50 border-pink-200' : d <= 30 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100';
  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm';

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Heart className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Anniversary Reminder</h1><p className="text-blue-200 text-sm">Track anniversaries · days until · years elapsed</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Track wedding anniversaries, work milestones, and other special recurring dates — never miss one again.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-bold text-gray-900 text-sm">Add Anniversary</h2>
            <input className={inputCls} placeholder="Label (e.g. Wedding Anniversary)" value={name} onChange={e => setName(e.target.value)} />
            <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
            <input className={inputCls} placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
            <button onClick={add} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Anniversary
            </button>
          </div>
        </div>
        <div className="lg:col-span-3 space-y-3">
          {sorted.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center"><Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-500 text-sm">No anniversaries yet</p></div>
          ) : sorted.map(item => {
            const days = getDaysUntil(item.date);
            const years = getYears(item.date);
            return (
              <div key={item.id} className={`flex items-center gap-4 p-4 rounded-xl border ${urgencyColor(days)}`}>
                <div className="text-center min-w-[56px]">
                  <div className="text-2xl font-extrabold">{days === 0 ? '💕' : days}</div>
                  <div className="text-[10px] font-semibold text-gray-500">{days === 0 ? 'TODAY!' : days === 1 ? 'tomorrow' : 'days'}</div>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-800">{item.name}</div>
                  <div className="text-xs text-gray-400">{new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}{years !== null ? ` · ${years} years` : ''}</div>
                  {item.note && <div className="text-xs text-gray-400 italic mt-0.5">{item.note}</div>}
                </div>
                <button onClick={() => setItems(prev => prev.filter(x => x.id !== item.id))} className="text-gray-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            );
          })}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 mt-4">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Use the note field to jot gift ideas or plans for each anniversary.</li>
              <li>• Plan celebrations 2–3 weeks ahead — restaurants book up fast on popular dates.</li>
              <li>• Track work anniversaries to plan recognition or gifts for colleagues.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Birthday Reminder', href: '/birthday-reminder' }, { label: 'Gift Idea Generator', href: '/gift-idea-generator' }, { label: 'Monthly Planner', href: '/monthly-planner' }, { label: 'Age Calculator', href: '/age-calculator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_anniversary', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
