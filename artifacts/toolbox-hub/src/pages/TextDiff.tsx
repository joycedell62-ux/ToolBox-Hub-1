import React, { useState, useMemo } from 'react';
import { GitCompareArrows, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, Download } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Does my text get sent anywhere?', a: 'No. The entire comparison runs in your browser with JavaScript. Nothing is uploaded or stored.' },
  { q: 'What counts as a "change"?', a: 'Lines that exist only in the original are marked red (removed). Lines that exist only in the revised text are marked green (added). Identical lines are shown without colour.' },
  { q: 'Can I compare code?', a: 'Yes — the diff works on any plain text including source code, JSON, Markdown, and log files.' },
  { q: 'How do I use the download?', a: 'Click "Download .diff" to save a unified-diff file you can share, attach to a ticket, or open in any text editor.' },
  { q: 'Is it case-sensitive?', a: 'Yes by default. A line that differs only in capitalisation is treated as a change. Toggle "Ignore case" to change that.' },
];

// ─── Minimal LCS-based diff ────────────────────────────────────────────────

type DiffLine = { type: 'same' | 'removed' | 'added'; text: string };

function diffLines(aLines: string[], bLines: string[]): DiffLine[] {
  const m = aLines.length;
  const n = bLines.length;
  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (aLines[i] === bLines[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }
  // Trace back
  const result: DiffLine[] = [];
  let i = 0, j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && aLines[i] === bLines[j]) {
      result.push({ type: 'same', text: aLines[i] });
      i++; j++;
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      result.push({ type: 'added', text: bLines[j] });
      j++;
    } else {
      result.push({ type: 'removed', text: aLines[i] });
      i++;
    }
  }
  return result;
}

function buildUnifiedDiff(diff: DiffLine[], aLabel: string, bLabel: string): string {
  const lines: string[] = [`--- ${aLabel}`, `+++ ${bLabel}`];
  for (const d of diff) {
    if (d.type === 'same')    lines.push(' ' + d.text);
    else if (d.type === 'removed') lines.push('-' + d.text);
    else                           lines.push('+' + d.text);
  }
  return lines.join('\n');
}

export default function TextDiff() {
  const [original, setOriginal] = useState('The quick brown fox\njumps over the lazy dog.\nThis line is the same.\nOld line that will be removed.');
  const [revised, setRevised]   = useState('The quick brown fox\nleaps over the lazy dog.\nThis line is the same.\nNew line that was added.');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [copied, setCopied]    = useState(false);
  const [openFaq, setOpenFaq]  = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const diff = useMemo(() => {
    const a = original.split('\n').map(l => ignoreCase ? l.toLowerCase() : l);
    const b = revised.split('\n').map(l => ignoreCase ? l.toLowerCase() : l);
    const rawDiff = diffLines(a, b);
    // Re-attach original-case text for display
    const aOrig = original.split('\n');
    const bOrig = revised.split('\n');
    let ai = 0, bi = 0;
    return rawDiff.map(d => {
      if (d.type === 'removed') return { ...d, text: aOrig[ai++] };
      if (d.type === 'added')   return { ...d, text: bOrig[bi++] };
      ai++; bi++;
      return d;
    });
  }, [original, revised, ignoreCase]);

  const stats = useMemo(() => ({
    added:   diff.filter(d => d.type === 'added').length,
    removed: diff.filter(d => d.type === 'removed').length,
    same:    diff.filter(d => d.type === 'same').length,
  }), [diff]);

  const unified = useMemo(() => buildUnifiedDiff(diff, 'original.txt', 'revised.txt'), [diff]);

  const copyDiff = async () => {
    await navigator.clipboard.writeText(unified);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadDiff = () => {
    const blob = new Blob([unified], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'changes.diff'; a.click();
    URL.revokeObjectURL(url);
  };

  const lineStyle = (type: DiffLine['type']) => {
    if (type === 'added')   return 'bg-emerald-50 text-emerald-900 border-l-4 border-emerald-400';
    if (type === 'removed') return 'bg-red-50 text-red-900 border-l-4 border-red-400';
    return 'text-gray-700';
  };
  const prefix = (type: DiffLine['type']) => {
    if (type === 'added')   return <span className="select-none text-emerald-500 font-bold w-4 inline-block">+</span>;
    if (type === 'removed') return <span className="select-none text-red-400 font-bold w-4 inline-block">−</span>;
    return <span className="select-none text-gray-300 w-4 inline-block"> </span>;
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><GitCompareArrows className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-extrabold">Text Diff Checker</h1>
            <p className="text-blue-200 text-sm">line-by-line · colour-coded · download .diff · 100% private</p>
          </div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Paste two blocks of text and instantly see what changed — added lines in green, removed lines in red. Works for code, documents, and anything else.</p>
      </div>

      {/* Inputs */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Original</label>
          <textarea
            value={original}
            onChange={e => setOriginal(e.target.value)}
            rows={10}
            className="w-full text-sm font-mono text-gray-800 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
            placeholder="Paste the original text here…"
          />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Revised</label>
          <textarea
            value={revised}
            onChange={e => setRevised(e.target.value)}
            rows={10}
            className="w-full text-sm font-mono text-gray-800 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
            placeholder="Paste the revised text here…"
          />
        </div>
      </div>

      {/* Options + Stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
          <input type="checkbox" checked={ignoreCase} onChange={e => setIgnoreCase(e.target.checked)}
            className="w-4 h-4 rounded accent-blue-600" />
          Ignore case
        </label>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">+{stats.added} added</span>
          <span className="flex items-center gap-1 text-red-500 bg-red-50 px-3 py-1.5 rounded-xl">−{stats.removed} removed</span>
          <span className="flex items-center gap-1 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">{stats.same} unchanged</span>
        </div>
      </div>

      {/* Diff output */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <span className="font-bold text-gray-900 text-sm">Diff Result</span>
          <div className="flex gap-2">
            <button onClick={copyDiff}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
              {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy diff</>}
            </button>
            <button onClick={downloadDiff}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" /> Download .diff
            </button>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          {diff.length === 0 ? (
            <p className="text-sm text-gray-400 p-5">Paste text in both boxes to see the diff.</p>
          ) : (
            <table className="w-full text-sm font-mono border-collapse">
              <tbody>
                {diff.map((line, i) => (
                  <tr key={i} className={lineStyle(line.type)}>
                    <td className="pl-3 pr-1 py-0.5 w-6 align-top">{prefix(line.type)}</td>
                    <td className="px-2 py-0.5 whitespace-pre-wrap break-all">{line.text || ' '}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Tips + Related */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Paste code from two versions of a file to find exactly what changed.</li>
            <li>• Toggle "Ignore case" when capitalisation differences don't matter.</li>
            <li>• The downloaded <code className="bg-blue-100 px-1 rounded">.diff</code> file can be attached to code reviews or tickets.</li>
            <li>• Use this before sending a revised document to highlight what you changed.</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Find & Replace', href: '/find-replace' },
              { label: 'Text Case Converter', href: '/text-case-converter' },
              { label: 'Word Counter', href: '/word-counter' },
              { label: 'Remove Duplicates', href: '/remove-duplicates' },
            ].map(r => (
              <Link key={r.href} href={r.href}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">
                → {r.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
        <div className="flex gap-2">
          {(['up', 'down'] as const).map(v => (
            <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_text-diff', v); }}
              className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>
              {v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
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
