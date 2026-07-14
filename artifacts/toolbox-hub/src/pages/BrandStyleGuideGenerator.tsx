import React, { useState } from 'react';
import { BookOpen, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, Printer } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What is a brand style guide?', a: 'A one-page reference that documents your logo usage, colors, fonts, and voice so everyone represents the brand consistently.' },
  { q: 'How do I print it?', a: 'Click Print — your browser opens a clean print dialog. Choose "Save as PDF" to keep a digital copy.' },
  { q: 'Can I copy the guide as text?', a: 'Yes. Use Copy Guide to grab a plain-text version for docs, email, or a wiki.' },
  { q: 'How many brand colors should I use?', a: 'Three to five is ideal: a primary, a secondary, and one or two accents plus neutrals.' },
  { q: 'Does anything leave my device?', a: 'No. The guide is generated entirely in your browser and never uploaded.' },
];

const VOICES = ['Friendly & warm', 'Professional & trustworthy', 'Bold & confident', 'Playful & fun', 'Minimal & modern', 'Luxury & refined'];
const VOICE_DESC: Record<string, string> = {
  'Friendly & warm': 'Speak like a helpful friend. Use plain words, contractions, and an encouraging tone. Avoid jargon.',
  'Professional & trustworthy': 'Be clear, precise, and reassuring. Back claims with substance. Prefer calm confidence over hype.',
  'Bold & confident': 'Short, punchy sentences. Take a stance. Lead with strong verbs and a decisive point of view.',
  'Playful & fun': 'Keep it light and human. A dash of humor and personality is welcome — never at clarity\'s expense.',
  'Minimal & modern': 'Say more with less. Trim adjectives, keep whitespace, let the message breathe.',
  'Luxury & refined': 'Elegant, understated, aspirational. Choose evocative words and let quality speak quietly.',
};

export default function BrandStyleGuideGenerator() {
  const [name, setName] = useState('Northwind');
  const [tagline, setTagline] = useState('Build something great');
  const [primary, setPrimary] = useState('#2563eb');
  const [secondary, setSecondary] = useState('#0f172a');
  const [accent, setAccent] = useState('#f59e0b');
  const [neutral, setNeutral] = useState('#e2e8f0');
  const [headingFont, setHeadingFont] = useState('Montserrat');
  const [bodyFont, setBodyFont] = useState('Open Sans');
  const [voice, setVoice] = useState('Friendly & warm');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const colors = [
    { label: 'Primary', hex: primary }, { label: 'Secondary', hex: secondary },
    { label: 'Accent', hex: accent }, { label: 'Neutral', hex: neutral },
  ];

  const asText = () => {
    return `${name.toUpperCase()} — BRAND STYLE GUIDE\n"${tagline}"\n\nCOLORS\n${colors.map(c => `  ${c.label}: ${c.hex.toUpperCase()}`).join('\n')}\n\nTYPOGRAPHY\n  Headings: ${headingFont}\n  Body: ${bodyFont}\n\nVOICE & TONE — ${voice}\n  ${VOICE_DESC[voice]}\n\nLOGO USAGE\n  Keep clear space around the logo equal to the icon height.\n  Never stretch, recolor, or add effects to the logo.\n  Use the primary color on light backgrounds; reverse to white on dark.`;
  };

  const copyGuide = async () => { await navigator.clipboard.writeText(asText()); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const print = () => window.print();

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><BookOpen className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Brand Style Guide Generator</h1><p className="text-blue-200 text-sm">colors · fonts · voice → one-page guide · copy & print</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Turn your brand basics into a polished one-page style guide. Fill in colors, fonts, and voice, then copy or print a shareable reference in seconds.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="bn" className="block text-xs font-semibold text-gray-500 mb-1">Brand name</label>
              <input id="bn" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label htmlFor="tg" className="block text-xs font-semibold text-gray-500 mb-1">Tagline</label>
              <input id="tg" type="text" value={tagline} onChange={e => setTagline(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Primary', val: primary, set: setPrimary }, { label: 'Secondary', val: secondary, set: setSecondary },
                { label: 'Accent', val: accent, set: setAccent }, { label: 'Neutral', val: neutral, set: setNeutral },
              ].map(c => (
                <div key={c.label}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{c.label}</label>
                  <input type="color" value={c.val} onChange={e => c.set(e.target.value)} aria-label={`${c.label} color`} className="w-full h-9 rounded-lg border border-gray-200 cursor-pointer" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="hf" className="block text-xs font-semibold text-gray-500 mb-1">Heading font</label>
                <input id="hf" type="text" value={headingFont} onChange={e => setHeadingFont(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
              </div>
              <div>
                <label htmlFor="bf" className="block text-xs font-semibold text-gray-500 mb-1">Body font</label>
                <input id="bf" type="text" value={bodyFont} onChange={e => setBodyFont(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
              </div>
            </div>
            <div>
              <label htmlFor="vc" className="block text-xs font-semibold text-gray-500 mb-1">Voice & tone</label>
              <select id="vc" value={voice} onChange={e => setVoice(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none">
                {VOICES.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={copyGuide} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
                {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Guide</>}
              </button>
              <button onClick={print} className="px-4 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl transition-all hover:bg-gray-50 flex items-center justify-center gap-2"><Printer className="w-4 h-4" /> Print</button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Keep your guide to one page — it should be scannable, not exhaustive.</li>
              <li>• Document hex codes exactly so colors never drift across tools.</li>
              <li>• Pair one heading font with one body font for consistency.</li>
              <li>• Write voice guidance as do/don&apos;t examples for your team.</li>
              <li>• Print to PDF and share alongside your logo files.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8" id="style-guide-sheet">
            <div className="border-b border-gray-100 pb-5 mb-5">
              <h2 className="text-3xl font-extrabold" style={{ color: secondary, fontFamily: `"${headingFont}", sans-serif` }}>{name || 'Your Brand'}</h2>
              <p className="text-gray-500 mt-1" style={{ fontFamily: `"${bodyFont}", sans-serif` }}>{tagline || 'Your tagline'}</p>
            </div>

            <section className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Colors</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {colors.map(c => (
                  <div key={c.label}>
                    <div className="h-16 rounded-xl border border-gray-100" style={{ background: c.hex }} />
                    <p className="text-xs font-semibold text-gray-700 mt-1.5">{c.label}</p>
                    <p className="text-xs font-mono text-gray-400">{c.hex.toUpperCase()}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Typography</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">Headings · {headingFont}</p>
                  <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: `"${headingFont}", sans-serif` }}>Aa Bb Cc 123</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">Body · {bodyFont}</p>
                  <p className="text-base text-gray-700" style={{ fontFamily: `"${bodyFont}", sans-serif` }}>The quick brown fox jumps over the lazy dog.</p>
                </div>
              </div>
            </section>

            <section className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Voice & Tone</h3>
              <p className="text-sm font-semibold text-gray-900">{voice}</p>
              <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: `"${bodyFont}", sans-serif` }}>{VOICE_DESC[voice]}</p>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Logo Usage</h3>
              <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-5">
                <li>Keep clear space around the logo equal to the icon height.</li>
                <li>Never stretch, recolor, or add effects to the logo.</li>
                <li>Use the primary color on light backgrounds; reverse to white on dark.</li>
              </ul>
            </section>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Color Palette Generator', href: '/color-palette-generator' }, { label: 'Font Pairing Generator', href: '/font-pairing-generator' }, { label: 'Logo Generator', href: '/logo-generator' }, { label: 'Social Media Brand Kit', href: '/social-media-brand-kit' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_brand-style-guide-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
