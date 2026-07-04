import { useState } from 'react';
import { Copy, Check, Trash2, CaseSensitive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// ─── helpers ──────────────────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  // Lowercase small words unless they're the first/last actual word
  const small = new Set(['a','an','the','and','but','or','nor','for','so','yet','at','by','in','of','on','to','up','as','if']);
  // Split on whitespace runs, preserving delimiters so output spacing is unchanged
  const tokens = str.toLowerCase().split(/(\s+)/);
  const wordIndices = tokens.reduce<number[]>((acc, tok, i) => {
    if (tok.trim().length > 0) acc.push(i);
    return acc;
  }, []);
  return tokens.map((tok, i) => {
    if (!tok.trim()) return tok; // whitespace token — keep as-is
    const pos = wordIndices.indexOf(i);
    const isFirst = pos === 0;
    const isLast = pos === wordIndices.length - 1;
    if (isFirst || isLast || !small.has(tok)) {
      return tok.charAt(0).toUpperCase() + tok.slice(1);
    }
    return tok;
  }).join('');
}

function toSentenceCase(str: string): string {
  // Capitalise the first letter of each sentence
  return str
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
}

function toCapitalizeWords(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}

type CaseMode = 'uppercase' | 'lowercase' | 'titleCase' | 'sentenceCase' | 'capitalizeWords';

interface ModeConfig {
  key: CaseMode;
  label: string;
  shortDesc: string;
  example: string;
  transform: (s: string) => string;
}

const MODES: ModeConfig[] = [
  {
    key: 'uppercase',
    label: 'UPPERCASE',
    shortDesc: 'ALL CAPS',
    example: 'HELLO WORLD',
    transform: (s) => s.toUpperCase(),
  },
  {
    key: 'lowercase',
    label: 'lowercase',
    shortDesc: 'all lowercase',
    example: 'hello world',
    transform: (s) => s.toLowerCase(),
  },
  {
    key: 'titleCase',
    label: 'Title Case',
    shortDesc: 'Smart title capitalisation',
    example: 'Hello World',
    transform: toTitleCase,
  },
  {
    key: 'sentenceCase',
    label: 'Sentence case',
    shortDesc: 'First letter of each sentence',
    example: 'Hello world. New sentence.',
    transform: toSentenceCase,
  },
  {
    key: 'capitalizeWords',
    label: 'Capitalize Each Word',
    shortDesc: 'Every word capitalised',
    example: 'Hello World',
    transform: toCapitalizeWords,
  },
];

// ─── sub-components ───────────────────────────────────────────────────────────

interface CasePillProps {
  mode: ModeConfig;
  active: boolean;
  onClick: () => void;
}

function CasePill({ mode, active, onClick }: CasePillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
        active
          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50'
      }`}
    >
      {mode.label}
    </button>
  );
}

interface StatBadgeProps {
  label: string;
  value: number;
}

function StatBadge({ label, value }: StatBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg">
      <span className="text-base font-bold text-blue-600 tabular-nums">{value.toLocaleString()}</span>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function TextCaseConverter() {
  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState<CaseMode>('titleCase');
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [copiedInput, setCopiedInput] = useState(false);
  const { toast } = useToast();

  const currentMode = MODES.find((m) => m.key === activeMode)!;
  const output = input ? currentMode.transform(input) : '';

  // Stats derived from OUTPUT text
  const wordCount = output.trim() === '' ? 0 : output.trim().split(/\s+/).length;
  const charCount = output.length;
  const charNoSpaces = output.replace(/\s/g, '').length;
  const sentenceCount = output.trim() === '' ? 0 : (output.match(/[^.!?]*[.!?]+/g) || [output.trim()]).length;

  const handleCopyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopiedOutput(true);
      toast({ title: 'Copied!', description: 'Converted text copied to clipboard.', duration: 2000 });
      setTimeout(() => setCopiedOutput(false), 2000);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  const handleClear = () => {
    setInput('');
    setCopiedOutput(false);
    setCopiedInput(false);
  };

  const handleCopyInput = async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopiedInput(true);
      toast({ title: 'Copied!', description: 'Original text copied to clipboard.', duration: 2000 });
      setTimeout(() => setCopiedInput(false), 2000);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

      {/* ── Header ── */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Text Case Converter</h1>
        <p className="text-muted-foreground">Instantly convert any text to the case you need</p>
      </div>

      {/* ── Main card ── */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-6">

        {/* Case mode picker */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Conversion Mode</p>
          <div className="flex flex-wrap gap-2">
            {MODES.map((mode) => (
              <CasePill
                key={mode.key}
                mode={mode}
                active={activeMode === mode.key}
                onClick={() => setActiveMode(mode.key)}
              />
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="text-input" className="text-sm font-semibold text-gray-700">
              Your Text
            </label>
            <button
              type="button"
              onClick={handleCopyInput}
              disabled={!input}
              className="text-xs text-gray-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
            >
              {copiedInput ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedInput ? 'Copied' : 'Copy original'}
            </button>
          </div>
          <textarea
            id="text-input"
            rows={5}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste your text here…"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all bg-white placeholder:text-gray-300 resize-y min-h-[100px]"
          />
        </div>

        {/* Output */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">
              Result
              <span className="ml-2 text-xs font-medium text-blue-500 bg-blue-50 rounded-md px-2 py-0.5">
                {currentMode.label}
              </span>
            </label>
          </div>
          <div className="bg-blue-50/60 rounded-xl border border-blue-100 px-4 py-4 min-h-[100px] text-base text-gray-900 whitespace-pre-wrap leading-relaxed break-words">
            {output || (
              <span className="text-gray-400">Converted text will appear here</span>
            )}
          </div>
        </div>

        {/* Stats row */}
        {output && (
          <div className="flex flex-wrap gap-2">
            <StatBadge label="words" value={wordCount} />
            <StatBadge label="characters" value={charCount} />
            <StatBadge label="chars (no spaces)" value={charNoSpaces} />
            <StatBadge label="sentences" value={sentenceCount} />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={!input}
            className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleCopyOutput}
            disabled={!output}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {copiedOutput ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedOutput ? 'Copied!' : 'Copy Text'}
          </Button>
        </div>
      </div>

      {/* ── Explainer ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">What is a Text Case Converter?</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            A text case converter is a tool that automatically changes the capitalisation of letters in a piece of text. Instead of retyping or manually editing each letter, you paste your text and choose the style you need — the tool transforms it instantly. It's widely used in writing, programming, design, and content creation.
          </p>
        </div>

        {/* Mode reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MODES.map(({ key, label, shortDesc, example }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveMode(key)}
              aria-pressed={activeMode === key}
              className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-1.5 text-left cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 w-full"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-sm">{label}</span>
                {activeMode === key && (
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 rounded-full px-2 py-0.5">Active</span>
                )}
              </div>
              <div className="font-mono text-xs text-blue-600 bg-blue-50 rounded-md px-2 py-1 inline-block">
                {example}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{shortDesc}</p>
            </button>
          ))}
        </div>

        {/* Tips */}
        <div className="border-t border-gray-100 pt-5 space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">When to use each case</h3>
          <ul className="space-y-1.5 text-sm text-gray-600 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold flex-shrink-0">→</span>
              <span><strong className="text-gray-700">UPPERCASE</strong> — headlines, acronyms, labels, and emphasis.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold flex-shrink-0">→</span>
              <span><strong className="text-gray-700">lowercase</strong> — email addresses, URLs, informal writing, and code identifiers.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold flex-shrink-0">→</span>
              <span><strong className="text-gray-700">Title Case</strong> — book titles, article headlines, and navigation menus. Small words like "a", "the", and "of" stay lowercase per style guides.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold flex-shrink-0">→</span>
              <span><strong className="text-gray-700">Sentence case</strong> — paragraphs, UI messages, descriptions, and anywhere natural prose is expected.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold flex-shrink-0">→</span>
              <span><strong className="text-gray-700">Capitalize Each Word</strong> — names, product titles, and table headers where every word deserves equal prominence.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
