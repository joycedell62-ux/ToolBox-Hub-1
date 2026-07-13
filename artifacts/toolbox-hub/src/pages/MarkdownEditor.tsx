import React, { useState, useEffect } from 'react';
import { FileText, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, Download } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What is Markdown?', a: 'Markdown is a lightweight text formatting language. Use # for headings, **bold**, *italic*, - for lists, and more.' },
  { q: 'Is my content saved?', a: 'Yes — your markdown is auto-saved to local storage and restored on your next visit.' },
  { q: 'Can I download the result?', a: 'Yes — download as .md (raw markdown) or the rendered HTML.' },
  { q: 'Does it support tables and code blocks?', a: 'Yes — standard markdown features including code blocks (```), tables (|col|), and blockquotes (>) are supported.' },
];

// Simple markdown-to-HTML parser (no external deps)
function mdToHtml(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^#{6}\s(.+)$/gm, '<h6>$1</h6>')
    .replace(/^#{5}\s(.+)$/gm, '<h5>$1</h5>')
    .replace(/^#{4}\s(.+)$/gm, '<h4>$1</h4>')
    .replace(/^#{3}\s(.+)$/gm, '<h3>$1</h3>')
    .replace(/^#{2}\s(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#{1}\s(.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`{3}[\s\S]*?`{3}/g, (m) => `<pre><code>${m.slice(3, -3).trim()}</code></pre>`)
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^\> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img alt="$1" src="$2" style="max-width:100%" />')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/^(?!<[h|u|o|b|l|p|h|i|c|a|p])/gm, '')
    .replace(/^(.+)$/gm, (line) => line.startsWith('<') ? line : `<p>${line}</p>`);
}

const SAMPLE = `# Welcome to Markdown Editor

Write **bold**, *italic*, or \`inline code\` text.

## Features

- Live preview as you type
- Auto-saves to browser storage
- Download as .md or .html

## Code Example

\`\`\`
const hello = "world";
console.log(hello);
\`\`\`

> Tip: Use # for headings, - for lists, **text** for bold.

[ToolBox Hub](/) — Free online tools for everyone.
`;

export default function MarkdownEditor() {
  const [md, setMd] = useState(SAMPLE);
  const [view, setView] = useState<'split' | 'editor' | 'preview'>('split');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => { const s = localStorage.getItem('markdown_content'); if (s) setMd(s); }, []);
  useEffect(() => { localStorage.setItem('markdown_content', md); }, [md]);

  const html = mdToHtml(md);
  const copy = async () => { await navigator.clipboard.writeText(md); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const downloadMd = () => { const b = new Blob([md], { type: 'text/markdown' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'document.md'; a.click(); URL.revokeObjectURL(u); };
  const downloadHtml = () => { const b = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6}h1,h2,h3{border-bottom:1px solid #eee;padding-bottom:.3em}code{background:#f4f4f4;padding:.2em .4em;border-radius:3px}pre{background:#f4f4f4;padding:1em;overflow:auto}blockquote{border-left:4px solid #ddd;margin:0;padding-left:1em;color:#666}a{color:#2563eb}img{max-width:100%}</style></head><body>${html}</body></html>`], { type: 'text/html' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'document.html'; a.click(); URL.revokeObjectURL(u); };
  const words = md.trim() ? md.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><FileText className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Markdown Editor</h1><p className="text-blue-200 text-sm">Live preview · auto-save · download .md & .html</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Write and preview Markdown in real time. Auto-saves locally. Export as .md or .html.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-1">
            {(['split', 'editor', 'preview'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${view === v ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>{v}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{words} words</span>
            <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1.5 rounded-lg hover:bg-blue-50">
              {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy MD</>}
            </button>
            <button onClick={downloadMd} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-lg hover:bg-gray-100"><Download className="w-3.5 h-3.5" /> .md</button>
            <button onClick={downloadHtml} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-lg hover:bg-gray-100"><Download className="w-3.5 h-3.5" /> .html</button>
          </div>
        </div>
        <div className={`${view === 'split' ? 'grid grid-cols-2 divide-x divide-gray-100' : 'flex'}`}>
          {(view === 'editor' || view === 'split') && (
            <textarea value={md} onChange={e => setMd(e.target.value)}
              className={`${view === 'split' ? '' : 'w-full'} p-4 text-sm font-mono text-gray-800 focus:outline-none resize-none bg-white min-h-[500px] leading-relaxed`}
              placeholder="Write your Markdown here…" />
          )}
          {(view === 'preview' || view === 'split') && (
            <div className={`${view === 'split' ? '' : 'w-full'} p-6 prose prose-blue prose-sm max-w-none min-h-[500px] overflow-y-auto`}
              style={{ fontFamily: 'sans-serif', lineHeight: '1.7' }}
              dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Use <code className="bg-blue-100 px-1 rounded"># H1</code>, <code className="bg-blue-100 px-1 rounded">## H2</code>, <code className="bg-blue-100 px-1 rounded">### H3</code> for headings.</li>
            <li>• <code className="bg-blue-100 px-1 rounded">**bold**</code> and <code className="bg-blue-100 px-1 rounded">*italic*</code> for emphasis.</li>
            <li>• Three backticks for code blocks, one for inline <code className="bg-blue-100 px-1 rounded">`code`</code>.</li>
            <li>• <code className="bg-blue-100 px-1 rounded">[Link text](url)</code> for hyperlinks.</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Notes Pad', href: '/notes-pad' }, { label: 'Word Counter', href: '/word-counter' }, { label: 'Find & Replace', href: '/find-replace' }, { label: 'Text Case Converter', href: '/text-case-converter' }].map(r => (
              <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
        <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_markdown', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
