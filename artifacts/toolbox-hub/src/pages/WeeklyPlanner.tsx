import React, { useState, useEffect } from 'react';
import { CalendarDays, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Plus, Trash2, Printer } from 'lucide-react';
import { Link } from 'wouter';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PRIORITIES = ['High', 'Medium', 'Low'] as const;
type Priority = typeof PRIORITIES[number];
interface Task { id: number; text: string; priority: Priority; done: boolean; }
type WeekPlan = Record<string, Task[]>;

const FAQS = [
  { q: 'Is my planner saved?', a: 'Yes — your weekly plan auto-saves to local storage.' },
  { q: 'Can I prioritise tasks?', a: 'Yes — each task has High, Medium, or Low priority with colour coding.' },
  { q: 'Does it reset automatically?', a: 'No — click Reset Week to clear all tasks and start fresh.' },
];

let nid = 1;
const defaultPlan = (): WeekPlan => DAYS.reduce((a, d) => ({ ...a, [d]: [] }), {});

const priorityColors: Record<Priority, string> = { High: 'bg-red-100 text-red-700', Medium: 'bg-yellow-100 text-yellow-700', Low: 'bg-green-100 text-green-700' };

export default function WeeklyPlanner() {
  const [plan, setPlan] = useState<WeekPlan>(defaultPlan);
  const [inputs, setInputs] = useState<Record<string, string>>(DAYS.reduce((a, d) => ({ ...a, [d]: '' }), {}));
  const [priorities, setPriorities] = useState<Record<string, Priority>>(DAYS.reduce((a, d) => ({ ...a, [d]: 'Medium' }), {}));
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => { const s = localStorage.getItem('weekly_plan'); if (s) { try { setPlan(JSON.parse(s)); } catch {} } }, []);
  useEffect(() => { localStorage.setItem('weekly_plan', JSON.stringify(plan)); }, [plan]);

  const addTask = (day: string) => {
    const text = inputs[day]?.trim();
    if (!text) return;
    setPlan(prev => ({ ...prev, [day]: [...(prev[day] || []), { id: nid++, text, priority: priorities[day], done: false }] }));
    setInputs(prev => ({ ...prev, [day]: '' }));
  };

  const toggleTask = (day: string, id: number) => setPlan(prev => ({ ...prev, [day]: prev[day].map(t => t.id === id ? { ...t, done: !t.done } : t) }));
  const removeTask = (day: string, id: number) => setPlan(prev => ({ ...prev, [day]: prev[day].filter(t => t.id !== id) }));

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><CalendarDays className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Weekly Planner</h1><p className="text-blue-200 text-sm">Plan your week · prioritise tasks · auto-save</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Organise your week day by day with prioritised tasks that auto-save to your browser.</p>
      </div>
      <div className="flex justify-end gap-3 -mt-4">
        <button onClick={() => window.print()} className="flex items-center gap-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl font-semibold transition-colors"><Printer className="w-4 h-4" /> Print</button>
        <button onClick={() => { if (confirm('Reset week?')) setPlan(defaultPlan()); }} className="text-sm text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl font-semibold transition-colors">Reset Week</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {DAYS.map(day => (
          <div key={day} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 flex flex-col">
            <div className="font-bold text-gray-800 text-sm text-center border-b border-gray-100 pb-2">{day.slice(0, 3)}</div>
            <div className="flex gap-1">
              <input className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400" placeholder="Add task…" value={inputs[day] || ''} onChange={e => setInputs(p => ({ ...p, [day]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addTask(day)} />
              <button onClick={() => addTask(day)} className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shrink-0"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none w-full bg-white" value={priorities[day] || 'Medium'} onChange={e => setPriorities(p => ({ ...p, [day]: e.target.value as Priority }))}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="flex-1 space-y-1.5 min-h-[60px]">
              {(plan[day] || []).map(task => (
                <div key={task.id} className={`flex items-start gap-1.5 p-1.5 rounded-lg border ${task.done ? 'opacity-50' : ''}`}>
                  <button onClick={() => toggleTask(day, task.id)} className={`w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center ${task.done ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                    {task.done && <span className="text-white text-[8px] font-bold">✓</span>}
                  </button>
                  <span className={`text-xs flex-1 ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.text}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${priorityColors[task.priority]}`}>{task.priority[0]}</span>
                  <button onClick={() => removeTask(day, task.id)} className="text-gray-300 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              {(plan[day] || []).length === 0 && <p className="text-xs text-gray-300 text-center pt-2">No tasks</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Plan your week on Sunday evening — it takes 15 minutes and saves hours.</li>
            <li>• Assign "High" only to tasks that truly can't wait. Three highs a day max.</li>
            <li>• Block time on your heaviest days to avoid overloading Mondays and Fridays.</li>
            <li>• Review your previous week before planning — move unfinished tasks forward.</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Daily To-Do List', href: '/todo-list' }, { label: 'Monthly Planner', href: '/monthly-planner' }, { label: 'Meal Planner', href: '/meal-planner' }, { label: 'Grocery List', href: '/grocery-list' }].map(r => (
              <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
        <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_weekly', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
