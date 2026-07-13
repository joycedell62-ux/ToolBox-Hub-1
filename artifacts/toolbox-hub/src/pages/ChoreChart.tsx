import React, { useState, useEffect } from 'react';
import { Home, Plus, Trash2, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import { Link } from 'wouter';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
interface Chore { id: number; name: string; assignee: string; days: string[]; }
let nid = 1;
const FAQS = [{ q: 'Is the chart saved?', a: 'Yes — auto-saved to browser storage.' }, { q: 'Can I print it?', a: 'Click Print for a printable version.' }];

export default function ChoreChart() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [name, setName] = useState('');
  const [assignee, setAssignee] = useState('');
  const [selDays, setSelDays] = useState<string[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => { const s = localStorage.getItem('chore_chart'); if (s) { try { const d = JSON.parse(s); setChores(d.chores || []); setChecked(d.checked || {}); nid = d.chores?.length ? Math.max(...d.chores.map((c: Chore) => c.id)) + 1 : 1; } catch {} } }, []);
  useEffect(() => { localStorage.setItem('chore_chart', JSON.stringify({ chores, checked })); }, [chores, checked]);

  const toggleDay = (d: string) => setSelDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const add = () => { if (!name.trim() || selDays.length === 0) return; setChores(prev => [...prev, { id: nid++, name: name.trim(), assignee, days: selDays }]); setName(''); setAssignee(''); setSelDays([]); };
  const remove = (id: number) => setChores(prev => prev.filter(c => c.id !== id));
  const toggleCheck = (choreId: number, day: string) => { const k = `${choreId}-${day}`; setChecked(prev => ({ ...prev, [k]: !prev[k] })); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Home className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Chore Chart Generator</h1><p className="text-blue-200 text-sm">Assign chores · track daily · print & share</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Create a weekly chore chart, assign tasks to family members, and track completion day by day.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-bold text-gray-900 text-sm">Add Chore</h2>
            <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Chore name (e.g. Wash dishes)" value={name} onChange={e => setName(e.target.value)} />
            <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Assigned to (e.g. Alex)" value={assignee} onChange={e => setAssignee(e.target.value)} />
            <div>
              <div className="text-xs text-gray-500 font-semibold mb-2">Days</div>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS.map(d => (
                  <button key={d} onClick={() => toggleDay(d)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selDays.includes(d) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{d}</button>
                ))}
              </div>
            </div>
            <button onClick={add} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Chore
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Chore Chart</h2>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"><Printer className="w-3.5 h-3.5" /> Print</button>
            </div>
            {chores.length === 0 ? (
              <div className="text-center py-10 text-gray-400"><Home className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No chores yet — add one!</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100"><th className="text-left py-2 pr-3 text-xs text-gray-500 font-semibold">Chore</th><th className="text-left py-2 pr-3 text-xs text-gray-500 font-semibold">Who</th>{DAYS.map(d => <th key={d} className="text-center py-2 px-1 text-xs text-gray-500 font-semibold">{d}</th>)}<th /></tr></thead>
                  <tbody>
                    {chores.map(chore => (
                      <tr key={chore.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 pr-3 font-medium text-gray-800">{chore.name}</td>
                        <td className="py-2 pr-3 text-gray-500 text-xs">{chore.assignee || '—'}</td>
                        {DAYS.map(d => (
                          <td key={d} className="py-2 px-1 text-center">
                            {chore.days.includes(d) ? (
                              <button onClick={() => toggleCheck(chore.id, d)} className={`w-6 h-6 rounded border-2 mx-auto flex items-center justify-center transition-all ${checked[`${chore.id}-${d}`] ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-blue-400'}`}>
                                {checked[`${chore.id}-${d}`] && <span className="text-white text-[9px] font-bold">✓</span>}
                              </button>
                            ) : <span className="text-gray-200">—</span>}
                          </td>
                        ))}
                        <td className="py-2 pl-2"><button onClick={() => remove(chore.id)} className="text-gray-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Age-appropriate chores for kids build responsibility — start small and consistent.</li>
              <li>• Rotate chores monthly to prevent resentment and build new skills.</li>
              <li>• Pair a less-liked chore with a preferred one for motivation.</li>
              <li>• Post the printed chart where everyone can see it — the fridge works great.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Weekly Planner', href: '/weekly-planner' }, { label: 'Daily To-Do', href: '/todo-list' }, { label: 'Grocery List', href: '/grocery-list' }, { label: 'Monthly Planner', href: '/monthly-planner' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_chore', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
