import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, Check, Lightbulb, HelpCircle, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Printer } from 'lucide-react';
import { Link } from 'wouter';

interface GroceryItem { id: number; name: string; qty: string; category: string; checked: boolean; }

const CATEGORIES = ['Produce', 'Dairy', 'Meat & Seafood', 'Bakery', 'Frozen', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Other'];
const FAQS = [
  { q: 'Is my list saved?', a: 'Yes — your list is automatically saved to your browser\'s local storage and will persist across page reloads.' },
  { q: 'Can I print my list?', a: 'Click the Print button to open a printer-friendly version of your grocery list.' },
  { q: 'Can I sort by category?', a: 'Items are grouped by category automatically so you can shop aisle-by-aisle.' },
  { q: 'How do I clear the list?', a: 'Use the "Clear All" button at the bottom to reset. Checked items can be removed individually.' },
];

let nextId = 1;

export default function GroceryList() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [category, setCategory] = useState('Produce');
  const [groupBy, setGroupBy] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('grocery_list');
    if (saved) { try { const parsed = JSON.parse(saved); setItems(parsed); nextId = parsed.length ? Math.max(...parsed.map((i: GroceryItem) => i.id)) + 1 : 1; } catch {} }
  }, []);

  useEffect(() => { localStorage.setItem('grocery_list', JSON.stringify(items)); }, [items]);

  const add = () => {
    if (!name.trim()) return;
    setItems(prev => [...prev, { id: nextId++, name: name.trim(), qty, category, checked: false }]);
    setName(''); setQty('1');
  };

  const toggle = (id: number) => setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const remove = (id: number) => setItems(prev => prev.filter(i => i.id !== id));
  const clearChecked = () => setItems(prev => prev.filter(i => !i.checked));
  const clearAll = () => setItems([]);

  const grouped = groupBy
    ? CATEGORIES.reduce<Record<string, GroceryItem[]>>((acc, cat) => { const its = items.filter(i => i.category === cat); if (its.length) acc[cat] = its; return acc; }, {})
    : { All: items };

  const inputCls = 'border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm';

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><ShoppingCart className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Grocery List Builder</h1><p className="text-blue-200 text-sm">Add items · group by aisle · auto-save · print</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Build your grocery list, group by category, check off as you shop, and print when you're ready.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-bold text-gray-900 text-sm">Add Item</h2>
            <input className={`w-full ${inputCls}`} placeholder="Item name (e.g. Apples)" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="Qty" value={qty} onChange={e => setQty(e.target.value)} />
              <select className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={add} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add to List
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">Group by category</span>
              <button onClick={() => setGroupBy(g => !g)} className={`w-10 h-5 rounded-full transition-colors ${groupBy ? 'bg-blue-600' : 'bg-gray-200'} relative`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${groupBy ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={clearChecked} className="flex-1 py-2 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors">Clear Checked</button>
              <button onClick={() => window.print()} className="flex-1 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center justify-center gap-1"><Printer className="w-3.5 h-3.5" /> Print</button>
            </div>
            <button onClick={clearAll} className="w-full py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">Clear All</button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">My List <span className="text-gray-400 font-normal text-sm">({items.length} items)</span></h2>
              <span className="text-sm text-emerald-600 font-semibold">{items.filter(i => i.checked).length}/{items.length} checked</span>
            </div>
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Your list is empty — add some items!</p>
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(grouped).map(([cat, its]) => (
                  <div key={cat}>
                    {groupBy && <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">{cat}</div>}
                    <div className="space-y-1.5">
                      {its.map(item => (
                        <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.checked ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                          <button onClick={() => toggle(item.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-blue-400'}`}>
                            {item.checked && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <span className={`flex-1 text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.name}</span>
                          <span className="text-xs text-gray-400 font-medium">{item.qty}</span>
                          <button onClick={() => remove(item.id)} className="text-gray-300 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Shop the perimeter first (produce, dairy, meat) — it's usually healthier and faster.</li>
              <li>• Group by category to follow a single path through the store.</li>
              <li>• Add quantities so you don't under-buy for recipes.</li>
              <li>• Shop after eating — it reduces impulse purchases by 20–30%.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Meal Planner', href: '/meal-planner' }, { label: 'Shopping List', href: '/shopping-list' }, { label: 'Daily To-Do List', href: '/todo-list' }, { label: 'Monthly Planner', href: '/monthly-planner' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">
              {(['up', 'down'] as const).map(v => (
                <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_grocery', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>
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
