import React, { useState } from 'react';
import { Type, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Will these fonts look the same on my site?', a: 'Previews use CSS font stacks with safe fallbacks. If a Google font isn\'t installed locally, a similar system font shows instead. Load the actual web font on your site for an exact match.' },
  { q: 'How do I use a Google font?', a: 'Add its <link> from fonts.google.com to your page head, then set the font-family in CSS. Copy the CSS stack from this tool as a starting point.' },
  { q: 'What makes a good pairing?', a: 'Contrast with harmony — pair a distinctive heading font with a clean, readable body font. Same-family superfamilies also pair reliably.' },
  { q: 'Why filter by vibe?', a: 'Vibe narrows the list to pairings that match a feeling (elegant, modern, playful), so you spend less time scrolling.' },
  { q: 'Does this need the internet?', a: 'No. Pairings and previews are bundled and run offline; only loading the live web fonts needs a connection.' },
];

type Vibe = 'All' | 'Modern' | 'Elegant' | 'Playful' | 'Classic' | 'Tech';

interface Pairing {
  vibe: Exclude<Vibe, 'All'>;
  headingName: string;
  bodyName: string;
  headingStack: string;
  bodyStack: string;
  note: string;
}

const PAIRINGS: Pairing[] = [
  { vibe: 'Modern', headingName: 'Montserrat', bodyName: 'Open Sans', headingStack: '"Montserrat", "Segoe UI", Arial, sans-serif', bodyStack: '"Open Sans", "Segoe UI", Arial, sans-serif', note: 'Geometric heading, humanist body — a startup favorite.' },
  { vibe: 'Modern', headingName: 'Poppins', bodyName: 'Inter', headingStack: '"Poppins", "Trebuchet MS", sans-serif', bodyStack: '"Inter", "Helvetica Neue", Arial, sans-serif', note: 'Rounded geometric headline with a neutral, screen-friendly body.' },
  { vibe: 'Modern', headingName: 'Raleway', bodyName: 'Roboto', headingStack: '"Raleway", "Century Gothic", sans-serif', bodyStack: '"Roboto", "Segoe UI", Arial, sans-serif', note: 'Elegant thin headline paired with Google\'s dependable body.' },
  { vibe: 'Elegant', headingName: 'Playfair Display', bodyName: 'Source Sans Pro', headingStack: '"Playfair Display", Georgia, "Times New Roman", serif', bodyStack: '"Source Sans Pro", "Segoe UI", Arial, sans-serif', note: 'High-contrast serif — editorial and luxurious.' },
  { vibe: 'Elegant', headingName: 'Cormorant Garamond', bodyName: 'Lato', headingStack: '"Cormorant Garamond", Garamond, Georgia, serif', bodyStack: '"Lato", "Helvetica Neue", Arial, sans-serif', note: 'Refined display serif with a warm, calm sans body.' },
  { vibe: 'Elegant', headingName: 'Libre Baskerville', bodyName: 'Nunito Sans', headingStack: '"Libre Baskerville", Baskerville, Georgia, serif', bodyStack: '"Nunito Sans", "Segoe UI", Arial, sans-serif', note: 'Classic book serif softened by a rounded sans.' },
  { vibe: 'Playful', headingName: 'Fredoka', bodyName: 'Nunito', headingStack: '"Fredoka", "Comic Sans MS", "Trebuchet MS", sans-serif', bodyStack: '"Nunito", "Trebuchet MS", sans-serif', note: 'Friendly rounded headline for approachable brands.' },
  { vibe: 'Playful', headingName: 'Baloo 2', bodyName: 'Quicksand', headingStack: '"Baloo 2", "Trebuchet MS", sans-serif', bodyStack: '"Quicksand", "Century Gothic", sans-serif', note: 'Chunky and cheerful — great for kids and lifestyle.' },
  { vibe: 'Playful', headingName: 'Pacifico', bodyName: 'Muli', headingStack: '"Pacifico", "Brush Script MT", cursive', bodyStack: '"Muli", "Segoe UI", Arial, sans-serif', note: 'Script accent headline balanced by a plain sans body.' },
  { vibe: 'Classic', headingName: 'Merriweather', bodyName: 'Georgia', headingStack: '"Merriweather", Georgia, "Times New Roman", serif', bodyStack: 'Georgia, "Times New Roman", serif', note: 'All-serif pairing — trustworthy and highly readable.' },
  { vibe: 'Classic', headingName: 'PT Serif', bodyName: 'PT Sans', headingStack: '"PT Serif", Georgia, serif', bodyStack: '"PT Sans", "Segoe UI", Arial, sans-serif', note: 'A designed-together superfamily — effortless harmony.' },
  { vibe: 'Classic', headingName: 'Lora', bodyName: 'Arial', headingStack: '"Lora", Georgia, serif', bodyStack: 'Arial, "Helvetica Neue", sans-serif', note: 'Calligraphic serif heading over a universal sans body.' },
  { vibe: 'Tech', headingName: 'Space Grotesk', bodyName: 'IBM Plex Sans', headingStack: '"Space Grotesk", "Courier New", monospace', bodyStack: '"IBM Plex Sans", "Segoe UI", Arial, sans-serif', note: 'Distinctive techno headline with a corporate-neutral body.' },
  { vibe: 'Tech', headingName: 'Orbitron', bodyName: 'Rubik', headingStack: '"Orbitron", "Courier New", monospace', bodyStack: '"Rubik", "Segoe UI", Arial, sans-serif', note: 'Futuristic geometric heading for products and gaming.' },
  { vibe: 'Tech', headingName: 'JetBrains Mono', bodyName: 'Work Sans', headingStack: '"JetBrains Mono", "Courier New", monospace', bodyStack: '"Work Sans", "Segoe UI", Arial, sans-serif', note: 'Monospaced heading signals a developer-first brand.' },
  { vibe: 'Modern', headingName: 'Oswald', bodyName: 'Merriweather Sans', headingStack: '"Oswald", "Arial Narrow", sans-serif', bodyStack: '"Merriweather Sans", "Segoe UI", Arial, sans-serif', note: 'Tall condensed headline with an open, readable body.' },
  { vibe: 'Elegant', headingName: 'Bodoni Moda', bodyName: 'Karla', headingStack: '"Bodoni Moda", "Didot", Georgia, serif', bodyStack: '"Karla", "Segoe UI", Arial, sans-serif', note: 'Fashion-magazine serif with a grotesque body.' },
];

const VIBES: Vibe[] = ['All', 'Modern', 'Elegant', 'Playful', 'Classic', 'Tech'];

export default function FontPairingGenerator() {
  const [vibe, setVibe] = useState<Vibe>('All');
  const [current, setCurrent] = useState<Pairing>(PAIRINGS[0]);
  const [sampleHeading, setSampleHeading] = useState('The quick brown fox');
  const [sampleBody, setSampleBody] = useState('Pack my box with five dozen liquor jugs. Typography is the craft of arranging type to make written language legible, readable, and appealing.');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const filtered = vibe === 'All' ? PAIRINGS : PAIRINGS.filter(p => p.vibe === vibe);

  const shuffle = () => {
    const pool = filtered.filter(p => p !== current);
    const next = (pool.length ? pool : filtered)[Math.floor(Math.random() * (pool.length ? pool.length : filtered.length))];
    setCurrent(next);
  };

  const changeVibe = (v: Vibe) => {
    setVibe(v);
    const pool = v === 'All' ? PAIRINGS : PAIRINGS.filter(p => p.vibe === v);
    setCurrent(pool[0]);
  };

  const css = `/* Heading */\nfont-family: ${current.headingStack};\n\n/* Body */\nfont-family: ${current.bodyStack};`;
  const copyCss = async () => { await navigator.clipboard.writeText(css); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Type className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Font Pairing Generator</h1><p className="text-blue-200 text-sm">curated pairings · live preview · vibe filter · copy CSS</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Find heading + body font combinations that just work. Filter by vibe, preview with your own text, and copy a ready-to-use CSS font stack.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Vibe</label>
              <div className="flex flex-wrap gap-2">
                {VIBES.map(v => (
                  <button key={v} onClick={() => changeVibe(v)} aria-pressed={vibe === v} className={`text-xs font-semibold py-1.5 px-3 rounded-lg border transition-all ${vibe === v ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>{v}</button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="sh" className="block text-xs font-semibold text-gray-500 mb-1">Sample heading</label>
              <input id="sh" type="text" value={sampleHeading} onChange={e => setSampleHeading(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label htmlFor="sb" className="block text-xs font-semibold text-gray-500 mb-1">Sample body text</label>
              <textarea id="sb" value={sampleBody} onChange={e => setSampleBody(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none" />
            </div>
            <button onClick={shuffle} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Shuffle Pairing
            </button>
          </div>

          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Limit yourself to two font families per project — heading and body.</li>
              <li>• Contrast is key: pair a serif with a sans, or heavy with light.</li>
              <li>• Keep body text between 16–18px for comfortable reading.</li>
              <li>• Superfamily pairs (PT Serif + PT Sans) are the safest bet.</li>
              <li>• Load only the weights you use to keep pages fast.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Live Preview</h2>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">{current.vibe}</span>
            </div>
            <div className="rounded-xl border border-gray-100 p-6 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400 mb-1">Heading — {current.headingName}</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight" style={{ fontFamily: current.headingStack }}>{sampleHeading || 'The quick brown fox'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400 mb-1">Body — {current.bodyName}</p>
                <p className="text-base text-gray-700 leading-relaxed" style={{ fontFamily: current.bodyStack }}>{sampleBody || 'Body preview text.'}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">{current.note}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm">CSS Font Stack</h3>
              <button onClick={copyCss} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy CSS</>}
              </button>
            </div>
            <pre className="bg-gray-50 rounded-xl p-4 text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap">{css}</pre>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Color Palette Generator', href: '/color-palette-generator' }, { label: 'Logo Generator', href: '/logo-generator' }, { label: 'Brand Style Guide', href: '/brand-style-guide-generator' }, { label: 'Business Card Designer', href: '/business-card-designer' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_font-pairing-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
