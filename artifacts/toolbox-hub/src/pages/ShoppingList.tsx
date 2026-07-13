import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Trash2, Check, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

interface Item { id: number; name: string; qty: string; price: string; done: boolean; }
let nid = 1;
const FAQS = [
  { q: 'Is my list saved?', a: 'Yes — auto-saved to your browser.' },
  { q: 'Can I track prices?', a: 'Yes — enter a price per item to see your estimated total.' },
  { q: 'Can I share the list?', a: 'Use the print button for a printable version.' },
];

export default function ShoppingList() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => { const s = localStorage.getItem('shopping_list'); if (s) { try { const p = JSON.parse(s); setItems(p); nid = p.length ? Math.max(...p.map((i: Item) => i.id)) + 1 : 1; } catch {} } }, []);
  useEffect(() => { localStorage.setItem('shopping_list', JSON.stringify(items)); }, [items]);

  const add = () => {
    if (!name.trim()) return;
    setItems(prev => [...prev, { id: nid++, name: name.trim(), qty, price, done: false }]);
    setName(''); setQty('1'); setPrice('');
  };
  const toggle = (id: number) => setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const remove = (id: number) => setItems(prev => prev.filter(i => i.id !== id));
  const total = items.reduce((s, i) => s + (parseFloat(i.price) || 0) * (parseFloat(i.qty) || 1), 0);

  const inputCls = 'border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm';

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><ShoppingBag className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Shopping List</h1><p className="text-blue-200 text-sm">Add items · track prices · estimated total · auto-save</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Build your shopping list with quantities and prices — see your estimated total before you go.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-bold text-gray-900 text-sm">Add Item</h2>
            <input className={`w-full ${inputCls}`} placeholder="Item name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
            <div className="grid grid-cols-2 gap-2">
              <div><div className="text-xs text-gray-400 mb-1">Qty</div><input className={inputCls} type="number" placeholder="1" value={qty} onChange={e => setQty(e.target.value)} /></div>
              <div><div className="text-xs text-gray-400 mb-1">Price ($)</div><input className={inputCls} type="number" placeholder="0.00" step="0.01" value={price} onChange={e => setPrice(e.target.value)} /></div>
            </div>
            <button onClick={add} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
          {total > 0 && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 text-center">
              <div className="text-xs text-emerald-600 font-semibold mb-1">Estimated Total</div>
              <div className="text-3xl font-extrabold text-emerald-700">${total.toFixed(2)}</div>
              <div className="text-xs text-emerald-500 mt-1">{items.filter(i => !i.done).length} items remaining</div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">My Shopping List</h2>
              <div className="flex gap-2">
                <button onClick={() => setItems(prev => prev.filter(i => !i.done))} className="text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">Clear Done</button>
                <button onClick={() => setItems([])} className="text-xs text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">Clear All</button>
              </div>
            </div>
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">Your list is empty</p></div>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.done ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                    <button onClick={() => toggle(item.id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${item.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                      {item.done && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`flex-1 text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.name}</span>
                    <span className="text-xs text-gray-400">×{item.qty}</span>
                    {item.price && <span className="text-xs font-semibold text-emerald-600">${(parseFloat(item.price) * parseFloat(item.qty || '1')).toFixed(2)}</span>}
                    <button onClick={() => remove(item.id)} className="text-gray-300 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Enter prices to see your running total and stay within budget.</li>
              <li>• Add items right when you think of them — don't rely on memory.</li>
              <li>• Check off as you go to avoid double-buying.</li>
              <li>• Keep a rolling list in the app and add to it throughout the week.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Grocery List', href: '/grocery-list' }, { label: 'Daily To-Do', href: '/todo-list' }, { label: 'Meal Planner', href: '/meal-planner' }, { label: 'Discount Calculator', href: '/discount-calculator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_shopping', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
