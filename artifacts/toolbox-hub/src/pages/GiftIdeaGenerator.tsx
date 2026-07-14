import React, { useState } from 'react';
import { Gift, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

type AgeRange = 'kid' | 'teen' | 'adult' | 'senior';
type Budget = 'low' | 'mid' | 'high';
type Relationship = 'partner' | 'friend' | 'family' | 'coworker';
type Occasion = 'birthday' | 'anniversary' | 'holiday' | 'thankyou' | 'justbecause';

const AGE_OPTIONS: { id: AgeRange; label: string }[] = [
  { id: 'kid', label: 'Kid (0-12)' },
  { id: 'teen', label: 'Teen (13-19)' },
  { id: 'adult', label: 'Adult (20-59)' },
  { id: 'senior', label: 'Senior (60+)' },
];
const BUDGET_OPTIONS: { id: Budget; label: string }[] = [
  { id: 'low', label: 'Under $25' },
  { id: 'mid', label: '$25 - $100' },
  { id: 'high', label: '$100+' },
];
const RELATIONSHIP_OPTIONS: { id: Relationship; label: string }[] = [
  { id: 'partner', label: 'Partner' },
  { id: 'friend', label: 'Friend' },
  { id: 'family', label: 'Family' },
  { id: 'coworker', label: 'Coworker' },
];
const OCCASION_OPTIONS: { id: Occasion; label: string }[] = [
  { id: 'birthday', label: 'Birthday' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'holiday', label: 'Holiday' },
  { id: 'thankyou', label: 'Thank You' },
  { id: 'justbecause', label: 'Just Because' },
];

interface Idea {
  text: string;
  ages: AgeRange[];
  budgets: Budget[];
  relationships: Relationship[];
  occasions: Occasion[];
}

const ALL: AgeRange[] = ['kid', 'teen', 'adult', 'senior'];
const ALL_B: Budget[] = ['low', 'mid', 'high'];
const ALL_R: Relationship[] = ['partner', 'friend', 'family', 'coworker'];
const ALL_O: Occasion[] = ['birthday', 'anniversary', 'holiday', 'thankyou', 'justbecause'];

const IDEAS: Idea[] = [
  { text: 'A personalized photo book of shared memories', ages: ['adult', 'senior'], budgets: ['low', 'mid'], relationships: ['partner', 'friend', 'family'], occasions: ['anniversary', 'birthday', 'holiday'] },
  { text: 'A cozy weighted blanket', ages: ['teen', 'adult', 'senior'], budgets: ['mid'], relationships: ['partner', 'friend', 'family'], occasions: ['birthday', 'holiday', 'justbecause'] },
  { text: 'A subscription box for their favorite hobby', ages: ['teen', 'adult'], budgets: ['mid'], relationships: ['partner', 'friend', 'family'], occasions: ['birthday', 'holiday', 'justbecause'] },
  { text: 'A high-quality reusable water bottle', ages: ['kid', 'teen', 'adult', 'senior'], budgets: ['low'], relationships: ['friend', 'family', 'coworker'], occasions: ['birthday', 'thankyou', 'justbecause'] },
  { text: 'A set of gourmet coffee or tea samplers', ages: ['adult', 'senior'], budgets: ['low', 'mid'], relationships: ['friend', 'family', 'coworker'], occasions: ['thankyou', 'holiday', 'justbecause'] },
  { text: 'A build-your-own model or LEGO set', ages: ['kid', 'teen', 'adult'], budgets: ['low', 'mid'], relationships: ['friend', 'family'], occasions: ['birthday', 'holiday', 'justbecause'] },
  { text: 'A pair of wireless earbuds', ages: ['teen', 'adult'], budgets: ['mid', 'high'], relationships: ['partner', 'friend', 'family'], occasions: ['birthday', 'holiday', 'anniversary'] },
  { text: 'A scented candle gift set', ages: ['adult', 'senior'], budgets: ['low'], relationships: ['friend', 'family', 'coworker'], occasions: ['thankyou', 'holiday', 'justbecause'] },
  { text: 'A hardcover book by their favorite author', ages: ['teen', 'adult', 'senior'], budgets: ['low'], relationships: ['friend', 'family', 'coworker'], occasions: ['birthday', 'thankyou', 'justbecause'] },
  { text: 'A cooking class experience for two', ages: ['adult'], budgets: ['mid', 'high'], relationships: ['partner', 'friend'], occasions: ['anniversary', 'birthday', 'holiday'] },
  { text: 'A stylish leather wallet or cardholder', ages: ['adult', 'senior'], budgets: ['mid'], relationships: ['partner', 'family', 'coworker'], occasions: ['birthday', 'holiday', 'anniversary'] },
  { text: 'A plush stuffed animal', ages: ['kid'], budgets: ['low'], relationships: ['family', 'friend'], occasions: ['birthday', 'holiday', 'justbecause'] },
  { text: 'An art and craft supply kit', ages: ['kid', 'teen'], budgets: ['low', 'mid'], relationships: ['family', 'friend'], occasions: ['birthday', 'holiday'] },
  { text: 'A smartwatch or fitness tracker', ages: ['teen', 'adult'], budgets: ['high'], relationships: ['partner', 'family'], occasions: ['birthday', 'holiday', 'anniversary'] },
  { text: 'A houseplant with a decorative pot', ages: ['adult', 'senior'], budgets: ['low'], relationships: ['friend', 'coworker', 'family'], occasions: ['thankyou', 'justbecause', 'holiday'] },
  { text: 'A board game for family game night', ages: ['kid', 'teen', 'adult'], budgets: ['low', 'mid'], relationships: ['family', 'friend'], occasions: ['birthday', 'holiday', 'justbecause'] },
  { text: 'A spa or massage gift certificate', ages: ['adult', 'senior'], budgets: ['mid', 'high'], relationships: ['partner', 'friend', 'family'], occasions: ['anniversary', 'birthday', 'thankyou'] },
  { text: 'A custom engraved piece of jewelry', ages: ['teen', 'adult', 'senior'], budgets: ['high'], relationships: ['partner', 'family'], occasions: ['anniversary', 'birthday'] },
  { text: 'A gourmet chocolate or snack hamper', ages: ['teen', 'adult', 'senior'], budgets: ['low', 'mid'], relationships: ['friend', 'family', 'coworker'], occasions: ['thankyou', 'holiday', 'justbecause'] },
  { text: 'A desk organizer or planner set', ages: ['teen', 'adult'], budgets: ['low'], relationships: ['coworker', 'friend'], occasions: ['thankyou', 'holiday', 'justbecause'] },
  { text: 'A remote-control car or drone', ages: ['kid', 'teen'], budgets: ['mid'], relationships: ['family', 'friend'], occasions: ['birthday', 'holiday'] },
  { text: 'A cozy pair of premium slippers', ages: ['adult', 'senior'], budgets: ['low', 'mid'], relationships: ['partner', 'family'], occasions: ['holiday', 'birthday', 'justbecause'] },
  { text: 'A wireless charging stand', ages: ['teen', 'adult'], budgets: ['low', 'mid'], relationships: ['friend', 'coworker', 'family'], occasions: ['birthday', 'holiday', 'thankyou'] },
  { text: 'A picnic set for outdoor adventures', ages: ['adult'], budgets: ['mid'], relationships: ['partner', 'friend'], occasions: ['anniversary', 'birthday', 'justbecause'] },
  { text: 'A grow-your-own herb garden kit', ages: ['teen', 'adult', 'senior'], budgets: ['low'], relationships: ['friend', 'family', 'coworker'], occasions: ['thankyou', 'justbecause', 'holiday'] },
  { text: 'A stargazing telescope for beginners', ages: ['kid', 'teen', 'adult'], budgets: ['mid', 'high'], relationships: ['family', 'friend'], occasions: ['birthday', 'holiday'] },
  { text: 'A monogrammed bathrobe', ages: ['adult', 'senior'], budgets: ['mid'], relationships: ['partner', 'family'], occasions: ['anniversary', 'holiday', 'birthday'] },
  { text: 'A puzzle featuring a favorite place or artwork', ages: ['teen', 'adult', 'senior'], budgets: ['low'], relationships: ['family', 'friend'], occasions: ['holiday', 'justbecause', 'birthday'] },
  { text: 'A high-end pen and notebook set', ages: ['adult', 'senior'], budgets: ['mid'], relationships: ['coworker', 'family', 'friend'], occasions: ['thankyou', 'holiday', 'birthday'] },
  { text: 'A star map printed for a special date', ages: ['adult'], budgets: ['low', 'mid'], relationships: ['partner'], occasions: ['anniversary', 'justbecause'] },
  { text: 'A picture frame with a heartfelt note', ages: ['teen', 'adult', 'senior'], budgets: ['low'], relationships: ['family', 'friend', 'partner'], occasions: ['thankyou', 'justbecause', 'birthday'] },
  { text: 'A cozy hoodie or oversized sweater', ages: ['teen', 'adult'], budgets: ['mid'], relationships: ['partner', 'friend', 'family'], occasions: ['birthday', 'holiday', 'justbecause'] },
  { text: 'A collection of classic children\u2019s storybooks', ages: ['kid'], budgets: ['low', 'mid'], relationships: ['family', 'friend'], occasions: ['birthday', 'holiday'] },
  { text: 'A premium Bluetooth speaker', ages: ['teen', 'adult'], budgets: ['high'], relationships: ['partner', 'friend', 'family'], occasions: ['birthday', 'holiday', 'anniversary'] },
  { text: 'A handwritten letter paired with their favorite treat', ages: ['teen', 'adult', 'senior'], budgets: ['low'], relationships: ['partner', 'friend', 'family', 'coworker'], occasions: ['thankyou', 'justbecause', 'anniversary'] },
  { text: 'A cozy tea-and-book bundle', ages: ['adult', 'senior'], budgets: ['low', 'mid'], relationships: ['friend', 'family'], occasions: ['thankyou', 'holiday', 'justbecause'] },
  { text: 'A science experiment or STEM kit', ages: ['kid', 'teen'], budgets: ['low', 'mid'], relationships: ['family', 'friend'], occasions: ['birthday', 'holiday'] },
  { text: 'A gift card to their favorite store or app', ages: ['teen', 'adult', 'senior'], budgets: ['low', 'mid', 'high'], relationships: ['friend', 'family', 'coworker'], occasions: ['birthday', 'holiday', 'thankyou'] },
  { text: 'A weekend getaway experience', ages: ['adult'], budgets: ['high'], relationships: ['partner'], occasions: ['anniversary', 'birthday', 'holiday'] },
  { text: 'A comfy travel neck pillow and eye mask set', ages: ['teen', 'adult', 'senior'], budgets: ['low'], relationships: ['friend', 'family', 'coworker'], occasions: ['holiday', 'justbecause', 'thankyou'] },
  { text: 'A quality apron for the home chef', ages: ['adult', 'senior'], budgets: ['low'], relationships: ['family', 'friend'], occasions: ['thankyou', 'holiday', 'justbecause'] },
  { text: 'A colorful building blocks set', ages: ['kid'], budgets: ['mid'], relationships: ['family', 'friend'], occasions: ['birthday', 'holiday'] },
  { text: 'A pair of premium noise-cancelling headphones', ages: ['teen', 'adult'], budgets: ['high'], relationships: ['partner', 'family', 'friend'], occasions: ['birthday', 'holiday', 'anniversary'] },
  { text: 'A cheese and charcuterie tasting board', ages: ['adult', 'senior'], budgets: ['mid'], relationships: ['friend', 'family', 'coworker'], occasions: ['holiday', 'thankyou', 'anniversary'] },
  { text: 'A daily gratitude or wellness journal', ages: ['teen', 'adult', 'senior'], budgets: ['low'], relationships: ['friend', 'family'], occasions: ['justbecause', 'thankyou', 'holiday'] },
  { text: 'A colorful kite for outdoor fun', ages: ['kid', 'teen'], budgets: ['low'], relationships: ['family', 'friend'], occasions: ['birthday', 'justbecause'] },
  { text: 'A luxury hand cream and skincare set', ages: ['adult', 'senior'], budgets: ['mid'], relationships: ['partner', 'friend', 'family'], occasions: ['thankyou', 'holiday', 'birthday'] },
  { text: 'A framed motivational print for their workspace', ages: ['adult'], budgets: ['low'], relationships: ['coworker', 'friend'], occasions: ['thankyou', 'justbecause', 'holiday'] },
  { text: 'A beginner\u2019s musical instrument like a ukulele', ages: ['kid', 'teen', 'adult'], budgets: ['mid'], relationships: ['family', 'friend'], occasions: ['birthday', 'holiday'] },
  { text: 'A luxury throw pillow set for the couch', ages: ['adult', 'senior'], budgets: ['mid'], relationships: ['family', 'partner'], occasions: ['holiday', 'anniversary', 'justbecause'] },
  { text: 'A funny mug paired with quality coffee', ages: ['teen', 'adult', 'senior'], budgets: ['low'], relationships: ['coworker', 'friend', 'family'], occasions: ['thankyou', 'justbecause', 'holiday'] },
  { text: 'A cozy set of premium socks', ages: ['kid', 'teen', 'adult', 'senior'], budgets: ['low'], relationships: ['friend', 'family', 'coworker'], occasions: ['holiday', 'justbecause', 'thankyou'] },
];

const FAQS = [
  { q: 'How does the tool pick gift ideas?', a: 'It filters a curated bank of ideas by the age range, budget, relationship, and occasion you choose, then shows a fresh set of matches. No internet or account needed.' },
  { q: 'What if no ideas match my filters?', a: 'The tool tells you clearly and suggests loosening a filter (for example, a wider budget). Try adjusting one option at a time.' },
  { q: 'Are these real products?', a: 'They are gift categories and thoughtful directions rather than specific store links — use them as inspiration for your own search or shopping trip.' },
  { q: 'Why do I see different ideas each time?', a: 'Matching ideas are shuffled and a batch of six is shown, so hitting Regenerate surfaces new suggestions.' },
  { q: 'Does this work offline?', a: 'Yes — the entire idea bank is built into the app and works with no connection.' },
];

const RELATED = [
  { label: 'Bucket List Generator', href: '/bucket-list-generator' },
  { label: 'Thank You Letter', href: '/thank-you-letter-generator' },
  { label: 'Birthday Message', href: '/birthday-message-generator' },
  { label: 'Anniversary Message', href: '/anniversary-message-generator' },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function GiftIdeaGenerator() {
  const [age, setAge] = useState<AgeRange>('adult');
  const [budget, setBudget] = useState<Budget>('mid');
  const [relationship, setRelationship] = useState<Relationship>('friend');
  const [occasion, setOccasion] = useState<Occasion>('birthday');

  const match = (a: AgeRange, b: Budget, r: Relationship, o: Occasion): Idea[] =>
    IDEAS.filter(idea => idea.ages.includes(a) && idea.budgets.includes(b) && idea.relationships.includes(r) && idea.occasions.includes(o));

  const [results, setResults] = useState<string[]>(() => shuffle(match('adult', 'mid', 'friend', 'birthday')).slice(0, 6).map(i => i.text));
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => {
    setResults(shuffle(match(age, budget, relationship, occasion)).slice(0, 6).map(i => i.text));
  };

  const copyList = async () => {
    if (results.length === 0) return;
    await navigator.clipboard.writeText(results.map((r, i) => `${i + 1}. ${r}`).join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Segmented = <T extends string>({ label, options, value, onChange }: { label: string; options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            aria-pressed={value === o.id}
            className={`text-sm font-medium rounded-xl px-3 py-2 border transition-all ${value === o.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Gift className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Gift Idea Generator</h1><p className="text-blue-200 text-sm">age · budget · relationship · occasion</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Stuck on what to give? Set who it's for and the occasion, and get six thoughtful, budget-matched gift ideas in a click.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <Segmented label="Age range" options={AGE_OPTIONS} value={age} onChange={(v) => setAge(v as AgeRange)} />
            <Segmented label="Budget" options={BUDGET_OPTIONS} value={budget} onChange={(v) => setBudget(v as Budget)} />
            <Segmented label="Relationship" options={RELATIONSHIP_OPTIONS} value={relationship} onChange={(v) => setRelationship(v as Relationship)} />
            <Segmented label="Occasion" options={OCCASION_OPTIONS} value={occasion} onChange={(v) => setOccasion(v as Occasion)} />
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Find Gift Ideas
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Match the gift to their hobbies for an instant thoughtful win.</li>
              <li>• Experiences often beat objects — think classes or getaways.</li>
              <li>• Add a handwritten note to make any gift feel personal.</li>
              <li>• When unsure, a quality version of something they use daily rarely misses.</li>
              <li>• Widen your budget filter if you want more options to appear.</li>
              <li>• Presentation matters — nice wrapping elevates a simple gift.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Gift Ideas {results.length > 0 && <span className="text-gray-400 font-normal">({results.length})</span>}</h2>
              <button onClick={copyList} disabled={results.length === 0} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied List</> : <><Copy className="w-3.5 h-3.5" /> Copy List</>}
              </button>
            </div>
            {results.length === 0 ? (
              <div className="rounded-xl bg-amber-50 border border-amber-100 px-6 py-10 text-center">
                <p className="text-sm text-amber-800 font-medium">No ideas match all four filters.</p>
                <p className="text-sm text-amber-700 mt-1">Try loosening one — a wider budget or a broader occasion usually helps.</p>
              </div>
            ) : (
              <ol className="space-y-2 animate-in fade-in duration-200">
                {results.map((r, i) => (
                  <li key={r + i} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                    <span className="text-sm text-gray-800 leading-relaxed">{r}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {RELATED.map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_gift-idea', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
