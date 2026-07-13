import React, { useState, useEffect } from 'react';
import { CalendarDays, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Is my planner saved?', a: 'Yes — notes for every day are saved automatically in your browser.' },
  { q: 'Can I navigate between months?', a: 'Use the left/right arrows to move between months.' },
  { q: 'Can I add multiple notes per day?', a: 'Click any date cell and type your notes. Each cell is a freeform text area.' },
];

export default function MonthlyPlanner() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => { const s = localStorage.getItem('monthly_notes'); if (s) { try { setNotes(JSON.parse(s)); } catch {} } }, []);
  useEffect(() => { localStorage.setItem('monthly_notes', JSON.stringify(notes)); }, [notes]);

  const key = (d: number) => `${year}-${month + 1}-${d}`;
  const updateNote = (d: number, val: string) => setNotes(prev => ({ ...prev, [key(d)]: val }));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const today = new Date();
  const isToday = (d: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const monthName = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><CalendarDays className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Monthly Planner</h1><p className="text-blue-200 text-sm">Calendar view · click any day to add notes · auto-save</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Plan your month with a full calendar view. Click any date to add notes and reminders.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prev} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
          <h2 className="text-lg font-extrabold text-gray-900">{monthName}</h2>
          <button onClick={next} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map(d => <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={'e' + i} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
            const k = key(d); const hasNote = !!notes[k]?.trim();
            return (
              <button key={d} onClick={() => setSelected(selected === k ? null : k)}
                className={`min-h-[56px] p-1.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${isToday(d) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'} ${selected === k ? 'ring-2 ring-blue-400' : ''}`}>
                <span className={`text-xs font-bold ${isToday(d) ? 'text-blue-600' : 'text-gray-700'}`}>{d}</span>
                {hasNote && <span className="text-[9px] text-blue-500 leading-tight truncate">{notes[k]}</span>}
              </button>
            );
          })}
        </div>
        {selected && (
          <div className="mt-5 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="text-sm font-bold text-blue-800 mb-2">Notes for {new Date(year, month, parseInt(selected.split('-')[2])).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            <textarea
              autoFocus rows={3} value={notes[selected] || ''} onChange={e => updateNote(parseInt(selected.split('-')[2]), e.target.value)}
              placeholder="Add your notes, events, or reminders…"
              className="w-full text-sm border border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white resize-none"
            />
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Review last month's notes at the start of each new month to track progress.</li>
            <li>• Mark recurring events at the start of the month so you never forget.</li>
            <li>• Use colour-coding in your notes (★ for urgent, → for follow-up) to scan quickly.</li>
            <li>• Block buffer time between important commitments — things always run over.</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Weekly Planner', href: '/weekly-planner' }, { label: 'Daily To-Do List', href: '/todo-list' }, { label: 'Birthday Reminder', href: '/birthday-reminder' }, { label: 'Anniversary Reminder', href: '/anniversary-reminder' }].map(r => (
              <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
        <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_monthly', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
