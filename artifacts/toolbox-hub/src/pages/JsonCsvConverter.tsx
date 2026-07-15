import React, { useState, useMemo } from 'react';
import { ArrowLeftRight, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, Download } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What JSON format is accepted?', a: 'An array of objects where every object has the same keys — e.g. [{"name":"Alice","age":30},{"name":"Bob","age":25}]. Nested objects are flattened to a string.' },
  { q: 'What CSV format is accepted for CSV → JSON?', a: 'Standard comma-separated values with a header row. Values containing commas or quotes should be wrapped in double quotes.' },
  { q: 'Is my data sent anywhere?', a: 'No. All conversion runs entirely in your browser. Nothing is uploaded or stored.' },
  { q: 'How are special characters handled?', a: 'Commas, quotes, and newlines inside values are automatically escaped with RFC 4180 quoting so the CSV stays valid.' },
  { q: 'Can I convert back from CSV to JSON?', a: 'Yes — switch to CSV → JSON mode, paste your CSV, and download the resulting JSON array.' },
];

// ─── JSON → CSV ────────────────────────────────────────────────────────────

function jsonToCsv(jsonText: string): { csv: string; error: string } {
  try {
    const data = JSON.parse(jsonText.trim());
    if (!Array.isArray(data)) return { csv: '', error: 'Input must be a JSON array of objects.' };
    if (data.length === 0) return { csv: '', error: 'The array is empty.' };
    const headers = Array.from(new Set(data.flatMap(row => Object.keys(row))));
    const escape = (val: unknown): string => {
      const s = val === null || val === undefined ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const rows = [headers.join(','), ...data.map(row => headers.map(h => escape(row[h])).join(','))];
    return { csv: rows.join('\n'), error: '' };
  } catch (e) {
    return { csv: '', error: 'Invalid JSON: ' + (e as Error).message };
  }
}

// ─── CSV → JSON ────────────────────────────────────────────────────────────

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      i++;
      let val = '';
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { val += '"'; i += 2; }
        else if (line[i] === '"') { i++; break; }
        else { val += line[i++]; }
      }
      fields.push(val);
      if (line[i] === ',') i++;
    } else {
      const end = line.indexOf(',', i);
      if (end === -1) { fields.push(line.slice(i)); break; }
      fields.push(line.slice(i, end));
      i = end + 1;
    }
  }
  return fields;
}

function csvToJson(csvText: string): { json: string; error: string } {
  try {
    const lines = csvText.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return { json: '', error: 'CSV needs at least a header row and one data row.' };
    const headers = parseCsvLine(lines[0]);
    const rows = lines.slice(1).map(line => {
      const vals = parseCsvLine(line);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
      return obj;
    });
    return { json: JSON.stringify(rows, null, 2), error: '' };
  } catch (e) {
    return { json: '', error: 'Parse error: ' + (e as Error).message };
  }
}

// ─── Defaults ──────────────────────────────────────────────────────────────

const SAMPLE_JSON = `[
  {"name": "Alice", "age": 30, "city": "New York"},
  {"name": "Bob", "age": 25, "city": "London"},
  {"name": "Carol", "age": 35, "city": "Tokyo"}
]`;

const SAMPLE_CSV = `name,age,city
Alice,30,New York
Bob,25,London
Carol,35,Tokyo`;

export default function JsonCsvConverter() {
  const [mode, setMode] = useState<'json-to-csv' | 'csv-to-json'>('json-to-csv');
  const [input, setInput] = useState(SAMPLE_JSON);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' };
    if (mode === 'json-to-csv') {
      const { csv, error } = jsonToCsv(input);
      return { output: csv, error };
    } else {
      const { json, error } = csvToJson(input);
      return { output: json, error };
    }
  }, [input, mode]);

  const switchMode = () => {
    const next = mode === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv';
    setMode(next);
    setInput(next === 'json-to-csv' ? SAMPLE_JSON : SAMPLE_CSV);
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    if (!output) return;
    const ext  = mode === 'json-to-csv' ? 'csv' : 'json';
    const mime = mode === 'json-to-csv' ? 'text/csv' : 'application/json';
    const blob = new Blob([output], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `converted.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  const inputLabel = mode === 'json-to-csv' ? 'JSON Input' : 'CSV Input';
  const outputLabel = mode === 'json-to-csv' ? 'CSV Output' : 'JSON Output';

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><ArrowLeftRight className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-extrabold">JSON ↔ CSV Converter</h1>
            <p className="text-blue-200 text-sm">bidirectional · real-time · download · 100% private</p>
          </div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Convert JSON arrays to CSV spreadsheets and back — instantly, in your browser, with no data ever leaving your device.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button onClick={() => { setMode('json-to-csv'); setInput(SAMPLE_JSON); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'json-to-csv' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            JSON → CSV
          </button>
          <button onClick={() => { setMode('csv-to-json'); setInput(SAMPLE_CSV); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'csv-to-json' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            CSV → JSON
          </button>
        </div>
        <button onClick={switchMode}
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors">
          <ArrowLeftRight className="w-4 h-4" /> Swap & flip
        </button>
      </div>

      {/* Editor + output */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Input */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{inputLabel}</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={14}
            className="w-full text-sm font-mono text-gray-800 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
            placeholder={mode === 'json-to-csv' ? '[{"key":"value"}]' : 'col1,col2\nval1,val2'}
          />
        </div>

        {/* Output */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{outputLabel}</label>
            <div className="flex gap-2">
              <button onClick={copy} disabled={!output}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                {copied ? <><Check className="w-3 h-3 text-emerald-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
              <button onClick={download} disabled={!output}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          </div>
          {error ? (
            <div className="flex-1 bg-red-50 border border-red-200 rounded-xl px-3 py-4 text-sm text-red-700 font-mono">{error}</div>
          ) : output ? (
            <textarea
              readOnly
              value={output}
              rows={14}
              className="w-full flex-1 text-sm font-mono text-gray-800 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none resize-y select-all"
            />
          ) : (
            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-4 text-sm text-gray-400">
              Output will appear here as you type…
            </div>
          )}
        </div>
      </div>

      {/* Tips + Related */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• JSON must be an <strong>array of objects</strong> — not a single object or nested array.</li>
            <li>• Keys become column headers; missing values in a row become empty cells.</li>
            <li>• Use "Swap & flip" to convert the output back and round-trip check accuracy.</li>
            <li>• Open the downloaded CSV directly in Excel, Google Sheets, or Numbers.</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'JSON Formatter', href: '/json-formatter' },
              { label: 'Base64 Encode/Decode', href: '/base64-tool' },
              { label: 'Text Diff Checker', href: '/text-diff' },
              { label: 'URL Encoder', href: '/url-encoder' },
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
            <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_json-csv', v); }}
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
