import React, { useState, useEffect } from 'react';
import { Gift, Plus, Trash2, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

interface Birthday { id: number; name: string; date: string; note: string; }
let nid = 1;
const FAQS = [{ q: 'Is this saved?', a: 'Yes — auto-saved to browser local storage.' }, { q: 'Does it send notifications?', a: 'Not currently — this is a visual reminder tool. Bookmark it and check regularly.' }];

export default function BirthdayReminder() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => { const s = localStorage.getItem('birthdays'); if (s) { try { const p = JSON.parse(s); setBirthdays(p); nid = p.length ? Math.max(...p.map((b: Birthday) => b.id)) + 1 : 1; } catch {} } }, []);
  useEffect(() => { localStorage.setItem('birthdays', JSON.stringify(birthdays)); }, [birthdays]);

  const add = () => {
    if (!name.trim() || !date) return;
    setBirthdays(prev => [...prev, { id: nid++, name: name.trim(), date, note }]);
    setName(''); setDate(''); setNote('');
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const [, month, day] = dateStr.split('-').map(Number);
    let next = new Date(today.getFullYear(), month - 1, day);
    if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day);
    return Math.round((next.getTime() - today.getTime()) / 86400000);
  };

  const getAge = (dateStr: string) => {
    const [year] = dateStr.split('-').map(Number);
    if (!year || year < 1900) return null;
    return new Date().getFullYear() - year;
  };

  const sorted = [...birthdays].sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));

  const urgencyColor = (days: number) => {
    if (days === 0) return 'bg-red-100 border-red-300 text-red-800';
    if (days <= 7) return 'bg-orange-50 border-orange-200 text-orange-800';
    if (days <= 30) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    return 'bg-white border-gray-100 text-gray-800';
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm';

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Gift className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Birthday Reminder</h1><p className="text-blue-200 text-sm">Track birthdays · days until · auto-save</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Never forget a birthday again. Add names and dates — see who's coming up next.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-bold text-gray-900 text-sm">Add Birthday</h2>
            <input className={inputCls} placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <div>
              <div className="text-xs text-gray-500 mb-1">Date of Birth (year optional)</div>
              <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <input className={inputCls} placeholder="Note (optional, e.g. gift idea)" value={note} onChange={e => setNote(e.target.value)} />
            <button onClick={add} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Birthday
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-3">
          {sorted.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <Gift className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No birthdays added yet</p>
            </div>
          ) : sorted.map(b => {
            const days = getDaysUntil(b.date);
            const age = getAge(b.date);
            return (
              <div key={b.id} className={`flex items-center gap-4 p-4 rounded-xl border ${urgencyColor(days)}`}>
                <div className="text-center min-w-[56px]">
                  <div className="text-2xl font-extrabold">{days === 0 ? '🎂' : days}</div>
                  <div className="text-[10px] font-semibold">{days === 0 ? 'TODAY!' : days === 1 ? 'tomorrow' : 'days'}</div>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{b.name}</div>
                  <div className="text-xs opacity-70">{new Date(b.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: b.date.split('-')[0] !== '0000' ? 'numeric' : undefined })}{age !== null ? ` · turning ${age}` : ''}</div>
                  {b.note && <div className="text-xs mt-1 opacity-60 italic">{b.note}</div>}
                </div>
                <button onClick={() => setBirthdays(prev => prev.filter(x => x.id !== b.id))} className="text-gray-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            );
          })}

          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 mt-4">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Add a gift idea in the notes field so you're never caught unprepared.</li>
              <li>• Check in weekly — birthdays in the next 7 days are highlighted orange.</li>
              <li>• Add your own birthday to remember how old you're turning 😄</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Anniversary Reminder', href: '/anniversary-reminder' }, { label: 'Gift Idea Generator', href: '/gift-idea-generator' }, { label: 'Monthly Planner', href: '/monthly-planner' }, { label: 'Age Calculator', href: '/age-calculator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_birthday', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
