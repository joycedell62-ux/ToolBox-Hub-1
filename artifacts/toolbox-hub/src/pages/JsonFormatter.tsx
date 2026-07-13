import React, { useState } from 'react';
import { Code, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What does "format" do?', a: 'It parses the JSON and re-outputs it with proper indentation (2 spaces by default), making it human-readable.' },
  { q: 'What does "minify" do?', a: 'Removes all whitespace to produce the smallest possible JSON string — ideal for APIs and storage.' },
  { q: 'Is my data sent anywhere?', a: 'No — all processing happens in your browser. Nothing leaves your device.' },
  { q: 'Can it fix broken JSON?', a: 'It will highlight where the first syntax error is. It cannot auto-fix broken JSON.' },
];

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [copiedIn, setCopiedIn] = useState(false);
  const [copiedOut, setCopiedOut] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const format = () => { setError(''); try { const parsed = JSON.parse(input); setOutput(JSON.stringify(parsed, null, indent)); } catch (e: unknown) { setError((e instanceof Error ? e.message : String(e))); setOutput(''); } };
  const minify = () => { setError(''); try { setOutput(JSON.stringify(JSON.parse(input))); } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); setOutput(''); } };
  const validate = () => { setError(''); try { JSON.parse(input); setError('✅ Valid JSON!'); setOutput(''); } catch (e: unknown) { setError('❌ ' + (e instanceof Error ? e.message : String(e))); setOutput(''); } };

  const copyIn = async () => { await navigator.clipboard.writeText(input); setCopiedIn(true); setTimeout(() => setCopiedIn(false), 2000); };
  const copyOut = async () => { await navigator.clipboard.writeText(output); setCopiedOut(true); setTimeout(() => setCopiedOut(false), 2000); };

  const taCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none leading-relaxed';

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Code className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">JSON Formatter</h1><p className="text-blue-200 text-sm">Format · minify · validate · browser-only</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Paste JSON to format with indentation, minify for production, or validate syntax — all offline.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Indent Spaces</label>
              <div className="flex gap-2">
                {[2, 4].map(n => <button key={n} onClick={() => setIndent(n)} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${indent === n ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{n} spaces</button>)}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={format} className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-sm">Format / Beautify</button>
              <button onClick={minify} className="py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition-all text-sm">Minify</button>
              <button onClick={validate} className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all text-sm">Validate Only</button>
            </div>
            {error && <div className={`text-xs rounded-xl px-3 py-2 ${error.startsWith('✅') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{error}</div>}
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Minify before embedding JSON in environment variables or config files.</li>
              <li>• Validate first to catch syntax errors before debugging logic.</li>
              <li>• JSON keys must be in double quotes — single quotes are invalid.</li>
              <li>• Trailing commas are not allowed in strict JSON.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-500">Input JSON</label>
              <button onClick={copyIn} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">{copiedIn ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}</button>
            </div>
            <textarea className={taCls} rows={10} value={input} onChange={e => setInput(e.target.value)} placeholder={'{"name":"ToolBox Hub","free":true,"tools":33}'} />
          </div>
          {output && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-500">Result</label>
                <button onClick={copyOut} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">{copiedOut ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}</button>
              </div>
              <textarea className={taCls + ' bg-gray-900 text-green-300 border-gray-700'} rows={10} value={output} readOnly />
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Base64 Encoder', href: '/base64' }, { label: 'URL Encoder', href: '/url-encoder' }, { label: 'Hash Generator', href: '/hash-generator' }, { label: 'UUID Generator', href: '/uuid-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_json', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
