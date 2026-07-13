import React, { useState } from 'react';
import { BookOpen, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What reading speed is used?', a: 'The average adult reads 200–250 WPM silently. You can customise the WPM to match your own speed.' },
  { q: 'How do I find my reading speed?', a: 'Read a passage for exactly 1 minute and count the words. That\'s your WPM.' },
  { q: 'What is speaking time used for?', a: 'Useful for speeches, podcasts, and presentations — average speaking pace is 130 WPM.' },
  { q: 'Does it count punctuation?', a: 'No — only words (sequences of non-space characters) are counted.' },
];

export default function ReadingTimeCalculator() {
  const [text, setText] = useState('');
  const [wpm, setWpm] = useState('238');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length;
  const readWpm = parseInt(wpm) || 238;
  const speakWpm = 130;
  const readMin = words / readWpm;
  const speakMin = words / speakWpm;

  const formatTime = (min: number) => {
    if (min < 1) return '< 1 min';
    const m = Math.floor(min);
    const s = Math.round((min - m) * 60);
    return s > 0 ? `${m} min ${s} sec` : `${m} min`;
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><BookOpen className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Reading Time Calculator</h1><p className="text-blue-200 text-sm">Word count · reading time · speaking time · stats</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Paste any text to instantly see word count, reading time, speaking time, and more.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Reading Speed (WPM)</label>
              <input type="number" value={wpm} onChange={e => setWpm(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[['Slow', '150'], ['Average', '238'], ['Fast', '350']].map(([label, val]) => (
                <button key={val} onClick={() => setWpm(val)} className={`py-2 rounded-lg font-semibold transition-all ${wpm === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{label}</button>
              ))}
            </div>
          </div>
          {words > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Text Statistics</h3>
              {[
                { label: 'Words', value: words.toLocaleString() },
                { label: 'Characters', value: chars.toLocaleString() },
                { label: 'Sentences', value: sentences.toLocaleString() },
                { label: 'Paragraphs', value: paragraphs.toLocaleString() },
                { label: 'Avg Word Length', value: words > 0 ? ((chars - text.split(/\s+/).length + 1) / words).toFixed(1) + ' chars' : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-bold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-xs font-semibold text-gray-500 mb-2">Paste your text here</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={10} placeholder="Paste an article, essay, speech, or any text…" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-mono leading-relaxed" />
          </div>
          {words > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-600 rounded-2xl p-5 text-white text-center">
                <div className="text-3xl font-extrabold">{formatTime(readMin)}</div>
                <div className="text-blue-200 text-xs mt-1">Reading Time ({wpm} WPM)</div>
              </div>
              <div className="bg-purple-600 rounded-2xl p-5 text-white text-center">
                <div className="text-3xl font-extrabold">{formatTime(speakMin)}</div>
                <div className="text-purple-200 text-xs mt-1">Speaking Time (130 WPM)</div>
              </div>
            </div>
          )}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• A 5-minute read is approximately 1,000–1,200 words at average speed.</li>
              <li>• Blog posts perform best at 1,500–2,500 words for SEO.</li>
              <li>• A 10-minute presentation is roughly 1,300 words at speaking pace.</li>
              <li>• Speed reading techniques can push comprehension above 400 WPM.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Word Counter', href: '/word-counter' }, { label: 'Text Case Converter', href: '/text-case-converter' }, { label: 'Find & Replace', href: '/find-replace' }, { label: 'Text Sorter', href: '/text-sorter' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_readtime', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
