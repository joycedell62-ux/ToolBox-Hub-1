import React, { useState } from 'react';
import { Wand2, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Does this design the logo for me?', a: 'It gives you concrete creative direction — icon ideas, color pairings, and typography suggestions — that you or a designer can turn into a finished logo.' },
  { q: 'How are the ideas generated?', a: 'They come from a curated offline library of design conventions matched to your industry and chosen style. Nothing is sent to a server.' },
  { q: 'Can I use these color codes directly?', a: 'Yes. Every palette lists usable HEX values you can paste into any design tool.' },
  { q: 'What should I do with a concept I like?', a: 'Take the icon idea and colors into the Logo Generator, or hand the brief to a designer as a starting point.' },
  { q: 'Are these ideas unique?', a: 'They are curated combinations, not AI-original art. Always add your own twist and check for existing trademarks before launching a brand.' },
];

const INDUSTRIES = ['Technology', 'Food & Drink', 'Health & Wellness', 'Finance', 'Fashion', 'Real Estate', 'Education', 'Creative Studio', 'Fitness', 'Travel', 'Beauty', 'Construction'];
const STYLES = ['Modern & Minimal', 'Bold & Playful', 'Elegant & Luxury', 'Friendly & Approachable', 'Tech & Futuristic', 'Natural & Organic'];

const ICON_IDEAS: Record<string, string[]> = {
  Technology: ['abstract circuit node', 'stylized hexagon cluster', 'upward chevron / signal bars', 'interlocking cubes', 'orbiting dot ring', 'geometric letterform'],
  'Food & Drink': ['leaf-topped fork', 'steaming bowl silhouette', 'wheat sprig', 'coffee bean loop', 'rolling pin arc', 'cheerful spoon smile'],
  'Health & Wellness': ['soft heartbeat line', 'lotus petal mark', 'cross + leaf blend', 'droplet with pulse', 'balanced pebble stack', 'open-hand cradle'],
  Finance: ['ascending bar trio', 'shield + arrow', 'coin with motion lines', 'abstract graph peak', 'interlocked rings', 'pillar / column mark'],
  Fashion: ['single elegant thread loop', 'minimalist hanger', 'monogram serif initial', 'abstract fabric fold', 'diamond outline', 'brushstroke swoosh'],
  'Real Estate': ['roofline chevron', 'key + house blend', 'window grid square', 'abstract skyline', 'door arch', 'location pin house'],
  Education: ['open book fan', 'graduation tassel', 'lightbulb + pencil', 'stacked blocks', 'owl silhouette', 'rising sun over book'],
  'Creative Studio': ['paint splash dot', 'overlapping color shapes', 'pen nib triangle', 'aperture bloom', 'playful spark', 'abstract eye mark'],
  Fitness: ['dynamic swoosh', 'flexed arc', 'kettlebell circle', 'lightning bolt', 'mountain peak', 'heartbeat + dumbbell'],
  Travel: ['paper plane', 'compass rose', 'globe with orbit', 'suitcase + wing', 'mountain + sun', 'route dotted line'],
  Beauty: ['petal rosette', 'mirror oval', 'dewdrop shimmer', 'soft leaf pair', 'lipstick line mark', 'abstract face profile'],
  Construction: ['bold chevron beam', 'hard-hat silhouette', 'crane arm', 'brick stack', 'wrench + gear', 'triangle framework'],
};

const PALETTES: Record<string, { name: string; colors: string[] }[]> = {
  'Modern & Minimal': [
    { name: 'Slate & Sky', colors: ['#0f172a', '#2563eb', '#e2e8f0'] },
    { name: 'Ink & Mint', colors: ['#111827', '#10b981', '#f3f4f6'] },
    { name: 'Charcoal & Coral', colors: ['#1f2937', '#f97316', '#ffffff'] },
  ],
  'Bold & Playful': [
    { name: 'Pop Trio', colors: ['#ef4444', '#facc15', '#3b82f6'] },
    { name: 'Sunset Fun', colors: ['#f97316', '#ec4899', '#8b5cf6'] },
    { name: 'Fresh Burst', colors: ['#22c55e', '#eab308', '#06b6d4'] },
  ],
  'Elegant & Luxury': [
    { name: 'Black Gold', colors: ['#0b0b0b', '#c9a227', '#f5f5f0'] },
    { name: 'Deep Emerald', colors: ['#052e26', '#9caf88', '#e8e6df'] },
    { name: 'Royal Plum', colors: ['#2d1b3d', '#b8860b', '#faf7f2'] },
  ],
  'Friendly & Approachable': [
    { name: 'Warm Welcome', colors: ['#f59e0b', '#0ea5e9', '#fef3c7'] },
    { name: 'Soft Berry', colors: ['#e11d48', '#14b8a6', '#fff1f2'] },
    { name: 'Sunny Sky', colors: ['#38bdf8', '#fbbf24', '#f0f9ff'] },
  ],
  'Tech & Futuristic': [
    { name: 'Neon Grid', colors: ['#0a0f1f', '#22d3ee', '#a855f7'] },
    { name: 'Electric Blue', colors: ['#020617', '#3b82f6', '#818cf8'] },
    { name: 'Cyber Lime', colors: ['#0f172a', '#84cc16', '#06b6d4'] },
  ],
  'Natural & Organic': [
    { name: 'Forest Floor', colors: ['#3f6212', '#a16207', '#f7fee7'] },
    { name: 'Earth & Sky', colors: ['#57534e', '#0d9488', '#fafaf9'] },
    { name: 'Terracotta', colors: ['#9a3412', '#65a30d', '#fff7ed'] },
  ],
};

const TYPOGRAPHY: Record<string, string[]> = {
  'Modern & Minimal': ['Geometric sans (Poppins / Montserrat), tight tracking', 'Neutral grotesque (Inter / Helvetica), medium weight', 'Thin sans headline + regular body'],
  'Bold & Playful': ['Rounded sans (Quicksand / Baloo), heavy weight', 'Chunky display + friendly sans body', 'Hand-drawn accent + clean sans'],
  'Elegant & Luxury': ['High-contrast serif (Playfair / Cormorant)', 'Refined sans-serif with wide letter-spacing', 'Thin serif headline, small-caps subtext'],
  'Friendly & Approachable': ['Humanist sans (Nunito / Open Sans)', 'Soft rounded display + readable body', 'Warm slab-serif accent'],
  'Tech & Futuristic': ['Monospace or techno sans (Space Grotesk / JetBrains Mono)', 'Wide condensed uppercase headline', 'Sharp geometric sans, uppercase tracking'],
  'Natural & Organic': ['Warm humanist serif + earthy sans', 'Hand-lettered logotype + simple sans', 'Soft slab-serif with organic curves'],
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

interface Concept { icon: string; palette: { name: string; colors: string[] }; typography: string; note: string; }

const NOTES = [
  'Aim for a mark that still reads clearly at 32px favicon size.',
  'Pair the icon with your name for at least one lockup variant.',
  'Reserve the darkest color for text, brightest for accents only.',
  'Test the concept in pure black and white before committing.',
  'Keep negative space generous — clarity beats detail.',
  'Design a horizontal and a stacked version for flexibility.',
];

export default function LogoIdeaGenerator() {
  const [industry, setIndustry] = useState('Technology');
  const [style, setStyle] = useState('Modern & Minimal');
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => {
    const icons = ICON_IDEAS[industry] || ICON_IDEAS.Technology;
    const palettes = PALETTES[style] || PALETTES['Modern & Minimal'];
    const typos = TYPOGRAPHY[style] || TYPOGRAPHY['Modern & Minimal'];
    const usedIcons = [...icons].sort(() => Math.random() - 0.5);
    const list: Concept[] = Array.from({ length: 4 }, (_, i) => ({
      icon: usedIcons[i % usedIcons.length],
      palette: pick(palettes),
      typography: pick(typos),
      note: pick(NOTES),
    }));
    setConcepts(list);
  };

  React.useEffect(() => { generate(); /* eslint-disable-next-line */ }, []);

  const copyHex = async (hex: string) => { await navigator.clipboard.writeText(hex); setCopied(hex); setTimeout(() => setCopied(null), 1500); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Wand2 className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Logo Idea Generator</h1><p className="text-blue-200 text-sm">industry + style → icon, color & type direction</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Stuck on where to start? Choose your industry and a style, and get four curated logo concepts complete with icon ideas, ready-to-use color palettes, and typography direction.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="industry" className="block text-xs font-semibold text-gray-500 mb-1">Industry</label>
              <select id="industry" value={industry} onChange={e => setIndustry(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none">
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="style" className="block text-xs font-semibold text-gray-500 mb-1">Style</label>
              <select id="style" value={style} onChange={e => setStyle(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none">
                {STYLES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Ideas
            </button>
          </div>

          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Regenerate a few times and screenshot the combinations you like.</li>
              <li>• Combine an icon idea from one concept with a palette from another.</li>
              <li>• A memorable logo works in one color — start there, add color later.</li>
              <li>• Match your icon to a real brand attribute, not just a trend.</li>
              <li>• Take your favorite palette into the Color Palette Generator to expand it.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {concepts.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Concept {i + 1}</span>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">{c.palette.name}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Icon idea</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{c.icon}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Palette</p>
                  <div className="flex gap-2">
                    {c.palette.colors.map(col => (
                      <button key={col} onClick={() => copyHex(col)} aria-label={`Copy ${col}`} className="flex-1 rounded-lg h-10 border border-gray-100 relative group" style={{ background: col }}>
                        <span className="absolute inset-x-0 bottom-0 text-[9px] font-mono bg-black/40 text-white rounded-b-lg py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{copied === col ? 'Copied' : col}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Typography</p>
                  <p className="text-sm text-gray-700">{c.typography}</p>
                </div>
                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">💡 {c.note}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Logo Generator', href: '/logo-generator' }, { label: 'Color Palette Generator', href: '/color-palette-generator' }, { label: 'Font Pairing Generator', href: '/font-pairing-generator' }, { label: 'Brand Style Guide', href: '/brand-style-guide-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_logo-idea-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
