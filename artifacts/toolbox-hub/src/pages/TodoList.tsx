import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Check, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

interface Task { id: number; text: string; priority: 'High' | 'Medium' | 'Low'; done: boolean; created: number; }
const PRIORITIES = ['High', 'Medium', 'Low'] as const;
const PCOLORS = { High: 'bg-red-100 text-red-700 border-red-200', Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200', Low: 'bg-green-100 text-green-700 border-green-200' };
const FAQS = [
  { q: 'Is my list saved?', a: 'Yes — auto-saved to browser local storage.' },
  { q: 'Can I filter by priority?', a: 'Use the filter buttons to show All, High, Medium, or Low priority tasks.' },
  { q: 'How do I reorder tasks?', a: 'Tasks are shown in priority order. Change the priority to reorder.' },
];

let nid = 1;
export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [filter, setFilter] = useState<'All' | Task['priority'] | 'Done'>('All');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => { const s = localStorage.getItem('todo_tasks'); if (s) { try { const p = JSON.parse(s); setTasks(p); nid = p.length ? Math.max(...p.map((t: Task) => t.id)) + 1 : 1; } catch {} } }, []);
  useEffect(() => { localStorage.setItem('todo_tasks', JSON.stringify(tasks)); }, [tasks]);

  const add = () => {
    if (!text.trim()) return;
    setTasks(prev => [...prev, { id: nid++, text: text.trim(), priority, done: false, created: Date.now() }]);
    setText('');
  };

  const toggle = (id: number) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: number) => setTasks(prev => prev.filter(t => t.id !== id));
  const clearDone = () => setTasks(prev => prev.filter(t => !t.done));

  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const filtered = tasks.filter(t => filter === 'All' || (filter === 'Done' ? t.done : t.priority === filter && !t.done))
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const inputCls = 'border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm';

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><CheckSquare className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Daily To-Do List</h1><p className="text-blue-200 text-sm">Add tasks · prioritise · track progress · auto-save</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Stay on top of your day with a prioritised task list that saves automatically.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-bold text-gray-900 text-sm">Add Task</h2>
            <input className={`w-full ${inputCls}`} placeholder="What needs to be done?" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button key={p} onClick={() => setPriority(p)} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${priority === p ? PCOLORS[p] : 'bg-gray-50 text-gray-500 border-gray-200'}`}>{p}</button>
              ))}
            </div>
            <button onClick={add} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="text-xs font-bold text-gray-500 mb-2">STATS</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[{ label: 'Total', val: tasks.length }, { label: 'Done', val: tasks.filter(t => t.done).length }, { label: 'Left', val: tasks.filter(t => !t.done).length }].map(({ label, val }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3"><div className="font-bold text-blue-600 text-xl">{val}</div><div className="text-xs text-gray-400 mt-0.5">{label}</div></div>
              ))}
            </div>
            <button onClick={clearDone} className="w-full py-2 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors">Clear Completed</button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex gap-2 mb-4 flex-wrap">
              {(['All', 'High', 'Medium', 'Low', 'Done'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">{filter === 'All' ? 'No tasks yet — add one above!' : `No ${filter} tasks`}</p></div>
            ) : (
              <div className="space-y-2">
                {filtered.map(task => (
                  <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${task.done ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                    <button onClick={() => toggle(task.id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-blue-400'}`}>
                      {task.done && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.text}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg border font-semibold ${PCOLORS[task.priority]}`}>{task.priority}</span>
                    <button onClick={() => remove(task.id)} className="text-gray-300 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Limit yourself to 3 "High" priority tasks per day — decision fatigue is real.</li>
              <li>• Start each morning by reviewing and prioritising your list, not your inbox.</li>
              <li>• If a task is on your list for 3+ days, either schedule it or delete it.</li>
              <li>• Write tasks as specific actions: "Call dentist" not "dentist".</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Weekly Planner', href: '/weekly-planner' }, { label: 'Monthly Planner', href: '/monthly-planner' }, { label: 'Shopping List', href: '/shopping-list' }, { label: 'Notes Pad', href: '/notes-pad' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_todo', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
