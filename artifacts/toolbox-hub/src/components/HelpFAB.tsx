import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, MessageCircle, Send, Lightbulb } from 'lucide-react';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Are all tools really free?',
    a: 'Yes — 100% free, forever. No hidden fees, no premium tiers, no ads. Every single tool on Toolbox Hub is completely free to use.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No account needed. Just visit the tool you want and start using it immediately. Nothing to sign up for.',
  },
  {
    q: 'Is my data safe?',
    a: 'Your data never leaves your device. All tools run entirely in your browser — nothing is uploaded to a server or stored anywhere.',
  },
  {
    q: 'Do the tools work offline?',
    a: 'Most tools work offline after the page loads. Since everything runs in your browser, you don\'t need a constant internet connection.',
  },
  {
    q: 'How do I find a specific tool?',
    a: 'Use the search bar at the top of the home page. You can also browse by category using the chips, or use ⌘K / "/" to open the quick search from anywhere.',
  },
  {
    q: 'Can I save my favourite tools?',
    a: 'Yes! Click the ⭐ star on any tool card to save it to your Favourites. Your favourites are stored locally in your browser.',
  },
  {
    q: 'Can I suggest a new tool?',
    a: 'Absolutely! Scroll to the footer and click "Suggest a Tool" to email us your idea. We love hearing from users and regularly add new tools.',
  },
  {
    q: 'How do I report a bug or problem?',
    a: 'Use the "Report issue" button on any tool page, or click "Report a Bug" in the footer. We aim to fix issues within 24–48 hours.',
  },
];

function FAQItem({ item, open, onToggle }: {
  item: typeof FAQS[0];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors group"
      >
        <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
          {item.q}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-blue-500 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
        }
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpFAB() {
  const [open, setOpen]         = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showRequest, setShowRequest] = useState(false);
  const [toolName, setToolName]       = useState('');
  const [toolDesc, setToolDesc]       = useState('');
  const [sent, setSent]               = useState(false);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Tool Request: ${toolName}`);
    const body    = encodeURIComponent(`Tool Name: ${toolName}\n\nDescription:\n${toolDesc}`);
    window.open(`mailto:toolboxhub2@gmail.com?subject=${subject}&body=${body}`);
    setSent(true);
    setTimeout(() => { setSent(false); setShowRequest(false); setToolName(''); setToolDesc(''); }, 3000);
  };

  return (
    <>
      {/* Floating button — sits above Surprise Me */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Need help? View FAQs"
        title="Need Help?"
        className={`fixed bottom-24 right-5 z-50 w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-300
          hover:-translate-y-1 hover:shadow-2xl active:scale-95
          ${open
            ? 'bg-slate-800 text-white shadow-slate-800/30'
            : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
          }`}
      >
        {open
          ? <X className="w-5 h-5" />
          : <MessageCircle className="w-5 h-5" />
        }
      </button>

      {/* FAQ Panel */}
      {open && (
        <div
          className="fixed bottom-40 right-5 z-50 w-[22rem] max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl shadow-2xl shadow-slate-300/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-4 border-b border-slate-100"
            style={{ backgroundImage: 'linear-gradient(135deg,#eff6ff 0%,#f8faff 100%)' }}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm">Need Help?</p>
              <p className="text-[11px] text-slate-400">Frequently asked questions</p>
            </div>
          </div>

          {/* FAQ list — scrollable */}
          <div className="max-h-64 overflow-y-auto">
            {FAQS.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                open={expanded === i}
                onToggle={() => setExpanded(expanded === i ? null : i)}
              />
            ))}
          </div>

          {/* Request a Tool */}
          <div className="border-t border-slate-100">
            <button
              onClick={() => setShowRequest(r => !r)}
              className="w-full flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-800">Request a Tool</span>
              </div>
              {showRequest
                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                : <ChevronDown className="w-4 h-4 text-slate-400" />
              }
            </button>

            {showRequest && (
              <form onSubmit={handleSubmitRequest} className="px-5 pb-4 space-y-3">
                {sent ? (
                  <div className="py-3 text-center">
                    <p className="text-emerald-600 font-semibold text-sm">✅ Request sent! Thank you.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tool Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Markdown to PDF"
                        value={toolName}
                        onChange={e => setToolName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white placeholder:text-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">What should it do?</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Briefly describe the tool..."
                        value={toolDesc}
                        onChange={e => setToolDesc(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white placeholder:text-slate-300 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Request
                    </button>
                  </>
                )}
              </form>
            )}
          </div>

          {/* Footer CTA */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">Still need help?</p>
            <a
              href="mailto:toolboxhub2@gmail.com?subject=Help — ToolBox Hub"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Email us →
            </a>
          </div>
        </div>
      )}
    </>
  );
}
