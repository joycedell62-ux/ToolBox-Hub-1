import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Printer, RotateCcw } from 'lucide-react';
import { Link } from 'wouter';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;
type MealType = typeof MEALS[number];
type Plan = Record<string, Record<MealType, string>>;

const FAQS = [
  { q: 'Is my meal plan saved?', a: 'Yes — your plan auto-saves to local storage and persists across visits.' },
  { q: 'Can I print my meal plan?', a: 'Use the Print button for a clean printable version.' },
  { q: 'How do I clear a week?', a: 'Click Reset Week to clear all meals and start fresh.' },
  { q: 'Can I plan more than one week?', a: 'This tool plans one week at a time. Use your browser\'s bookmark/notes to save past plans before resetting.' },
];

const defaultPlan = (): Plan => {
  const plan: Plan = {};
  DAYS.forEach(d => { plan[d] = { Breakfast: '', Lunch: '', Dinner: '', Snack: '' }; });
  return plan;
};

export default function MealPlanner() {
  const [plan, setPlan] = useState<Plan>(defaultPlan);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('meal_plan');
    if (saved) { try { setPlan(JSON.parse(saved)); } catch {} }
  }, []);
  useEffect(() => { localStorage.setItem('meal_plan', JSON.stringify(plan)); }, [plan]);

  const update = (day: string, meal: MealType, value: string) => {
    setPlan(prev => ({ ...prev, [day]: { ...prev[day], [meal]: value } }));
  };

  const mealColors: Record<MealType, string> = { Breakfast: 'bg-amber-50 border-amber-200', Lunch: 'bg-green-50 border-green-200', Dinner: 'bg-blue-50 border-blue-200', Snack: 'bg-purple-50 border-purple-200' };
  const mealLabel: Record<MealType, string> = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎' };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><UtensilsCrossed className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Meal Planner</h1><p className="text-blue-200 text-sm">Plan breakfast, lunch, dinner & snacks · auto-save · print</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Plan your entire week's meals in one place. Automatically saved to your browser.</p>
      </div>

      <div className="flex justify-end gap-3 -mt-4">
        <button onClick={() => { if (confirm('Reset the week?')) { setPlan(defaultPlan()); } }} className="flex items-center gap-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors font-semibold">
          <RotateCcw className="w-4 h-4" /> Reset Week
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors font-semibold">
          <Printer className="w-4 h-4" /> Print Plan
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {DAYS.map(day => (
          <div key={day} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="text-center font-bold text-gray-800 text-sm pb-2 border-b border-gray-100">{day.slice(0, 3).toUpperCase()}</div>
            {MEALS.map(meal => (
              <div key={meal}>
                <div className="text-xs text-gray-400 mb-1">{mealLabel[meal]} {meal}</div>
                <textarea
                  value={plan[day]?.[meal] ?? ''}
                  onChange={e => update(day, meal, e.target.value)}
                  placeholder={`Add ${meal.toLowerCase()}…`}
                  rows={2}
                  className={`w-full text-xs rounded-lg border px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 ${mealColors[meal]}`}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Plan around proteins first — choose 3–4 proteins for the week and build meals from there.</li>
            <li>• Batch cook grains and proteins on Sunday to make weekday meals faster.</li>
            <li>• Theme nights (Taco Tuesday, Pasta Thursday) reduce decision fatigue.</li>
            <li>• Plan one new recipe and 2–3 trusted favourites to keep things fresh without stress.</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Grocery List', href: '/grocery-list' }, { label: 'Weekly Planner', href: '/weekly-planner' }, { label: 'Daily To-Do List', href: '/todo-list' }, { label: 'Calorie Calculator', href: '/calorie-calculator' }].map(r => (
              <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
        <div className="flex gap-2">
          {(['up', 'down'] as const).map(v => (
            <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_mealplanner', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>
              {v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
            </button>
          ))}
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
