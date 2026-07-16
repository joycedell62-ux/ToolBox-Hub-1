import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

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
  const [open, setOpen]     = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

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
          <div className="max-h-80 overflow-y-auto">
            {FAQS.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                open={expanded === i}
                onToggle={() => setExpanded(expanded === i ? null : i)}
              />
            ))}
          </div>

          {/* Footer CTA */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">Still need help?</p>
            <a
              href="mailto:hello@toolboxhub.app?subject=Help — ToolBox Hub"
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
