import React, { useState, useEffect } from 'react';
import { Receipt, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'How does the counter remember my last number?', a: 'The last used number is saved to your browser’s localStorage. When you return, the tool resumes from where you left off — nothing is stored on a server.' },
  { q: 'What date placeholders can I use?', a: 'The date format supports YYYY (4-digit year), YY (2-digit year), MM (month) and DD (day). They are replaced with today’s date.' },
  { q: 'Can I generate a whole batch at once?', a: 'Yes. Set the batch size and the tool produces a sequential list you can copy in one click.' },
  { q: 'How does padding work?', a: 'Padding sets the minimum digit count for the number portion. With padding 5, number 42 becomes 00042.' },
  { q: 'Is this suitable for real invoices?', a: 'Yes — sequential, non-repeating numbers with a consistent prefix and date are exactly what accounting systems expect.' },
];

const STORE_KEY = 'invoice-number-generator';

function formatDate(fmt: string, d: Date): string {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return fmt.replace(/YYYY/g, yyyy).replace(/YY/g, yyyy.slice(2)).replace(/MM/g, mm).replace(/DD/g, dd);
}

function buildNumber(prefix: string, dateFmt: string, sep: string, num: number, padding: number, now: Date): string {
  const parts: string[] = [];
  if (prefix) parts.push(prefix);
  if (dateFmt) parts.push(formatDate(dateFmt, now));
  parts.push(String(num).padStart(padding, '0'));
  return parts.join(sep);
}

export default function InvoiceNumberGenerator() {
  const [prefix, setPrefix] = useState('INV');
  const [dateFmt, setDateFmt] = useState('YYYY');
  const [separator, setSeparator] = useState('-');
  const [start, setStart] = useState(1);
  const [padding, setPadding] = useState(4);
  const [batch, setBatch] = useState(5);
  const [numbers, setNumbers] = useState<string[]>([]);
  const [lastCounter, setLastCounter] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedOne, setCopiedOne] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { last?: number; prefix?: string; dateFmt?: string; separator?: string; padding?: number };
        if (typeof saved.last === 'number') { setLastCounter(saved.last); setStart(saved.last + 1); }
        if (saved.prefix !== undefined) setPrefix(saved.prefix);
        if (saved.dateFmt !== undefined) setDateFmt(saved.dateFmt);
        if (saved.separator !== undefined) setSeparator(saved.separator);
        if (typeof saved.padding === 'number') setPadding(saved.padding);
      }
    } catch { /* ignore corrupt storage */ }
  }, []);

  const generate = () => {
    const base = now || new Date();
    const list: string[] = [];
    for (let i = 0; i < batch; i++) list.push(buildNumber(prefix, dateFmt, separator, start + i, padding, base));
    setNumbers(list);
    const last = start + batch - 1;
    setLastCounter(last);
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ last, prefix, dateFmt, separator, padding })); } catch { /* ignore */ }
  };

  const continueNext = () => { if (lastCounter !== null) setStart(lastCounter + 1); };

  const copyOne = async (val: string, i: number) => { await navigator.clipboard.writeText(val); setCopiedOne(i); setTimeout(() => setCopiedOne(null), 2000); };
  const copyAll = async () => { await navigator.clipboard.writeText(numbers.join('\n')); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000); };

  const preview = buildNumber(prefix, dateFmt, separator, start, padding, now || new Date());

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Receipt className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Invoice Number Generator</h1><p className="text-blue-200 text-sm">prefix · date · padding · batch · remembers counter</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Generate clean, sequential invoice numbers with a custom prefix, date, and padding. The last counter is remembered in your browser so you never reuse a number.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="inv-prefix" className="block text-xs font-semibold text-gray-500 mb-1">Prefix</label>
              <input id="inv-prefix" type="text" value={prefix} onChange={e => setPrefix(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="INV" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="inv-date" className="block text-xs font-semibold text-gray-500 mb-1">Date format</label>
                <select id="inv-date" value={dateFmt} onChange={e => setDateFmt(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">None</option>
                  <option value="YYYY">YYYY</option>
                  <option value="YYYYMM">YYYYMM</option>
                  <option value="YYYY-MM">YYYY-MM</option>
                  <option value="YYYYMMDD">YYYYMMDD</option>
                  <option value="YYMM">YYMM</option>
                </select>
              </div>
              <div>
                <label htmlFor="inv-sep" className="block text-xs font-semibold text-gray-500 mb-1">Separator</label>
                <select id="inv-sep" value={separator} onChange={e => setSeparator(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="-">Dash ( - )</option>
                  <option value="/">Slash ( / )</option>
                  <option value="_">Underscore ( _ )</option>
                  <option value="">None</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="inv-start" className="block text-xs font-semibold text-gray-500 mb-1">Start number</label>
                <input id="inv-start" type="number" min="0" value={start} onChange={e => setStart(Math.max(0, Number(e.target.value)))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Padding ({padding})</label>
                <input type="range" min="1" max="8" value={padding} onChange={e => setPadding(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Batch size ({batch})</label>
              <input type="range" min="1" max="100" value={batch} onChange={e => setBatch(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
              <span className="text-xs text-gray-500">Preview: </span>
              <code className="text-sm font-mono text-gray-800">{preview}</code>
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate {batch} Number{batch > 1 ? 's' : ''}
            </button>
            {lastCounter !== null && (
              <button onClick={continueNext} className="w-full py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-300 transition-colors text-sm">
                Continue from last counter ({lastCounter} → {lastCounter + 1})
              </button>
            )}
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Keep one consistent format for all invoices so they sort and search cleanly.</li>
              <li>• Including the year (YYYY) makes it easy to archive by fiscal period.</li>
              <li>• Padding keeps numbers the same width — great for spreadsheets.</li>
              <li>• The last counter is saved locally, so refreshing won’t reuse a number.</li>
              <li>• Everything runs offline in your browser.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Generated Numbers</h2>
              {numbers.length > 0 && (
                <button onClick={copyAll} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  {copiedAll ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied All</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
                </button>
              )}
            </div>
            {numbers.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {numbers.map((n, i) => (
                  <div key={n + i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 hover:border-blue-200 transition-all group">
                    <code className="flex-1 text-sm font-mono text-gray-700 select-all">{n}</code>
                    <button onClick={() => copyOne(n, i)} className="shrink-0 text-gray-300 hover:text-blue-600 group-hover:text-gray-400 transition-colors" aria-label={`Copy ${n}`}>
                      {copiedOne === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Configure your format and click Generate to produce a batch of invoice numbers.</p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Barcode Generator', href: '/barcode-generator' }, { label: 'Signature Generator', href: '/signature-generator' }, { label: 'UUID Generator', href: '/uuid-generator' }, { label: 'QR Generator', href: '/qr-code-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_invoice-number-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
