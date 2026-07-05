import { useState, useCallback, useRef } from 'react';
import { Shuffle, Copy, Check, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// ─── constants ────────────────────────────────────────────────────────────────

const MAX_HISTORY = 100;

// ─── helpers ──────────────────────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

// Avoid spread-operator stack overflow on large arrays
function arrayMin(arr: number[]) {
  return arr.reduce((a, b) => Math.min(a, b));
}
function arrayMax(arr: number[]) {
  return arr.reduce((a, b) => Math.max(a, b));
}
function arrayAvg(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function parseWholeNumber(s: string): number | null {
  const n = Number(s);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

// ─── sub-components ───────────────────────────────────────────────────────────

interface NumFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  placeholder?: string;
}

function NumField({ id, label, value, onChange, onEnter, placeholder }: NumFieldProps) {
  return (
    <div className="space-y-1.5 flex-1">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onEnter(); } }}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all bg-white placeholder:text-gray-300"
      />
    </div>
  );
}

interface HistoryChipProps {
  num: number;
  isLatest: boolean;
  onRemove: () => void;
  onCopy: () => void;
  copied: boolean;
}

function HistoryChip({ num, isLatest, onRemove, onCopy, copied }: HistoryChipProps) {
  return (
    <div
      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-semibold tabular-nums transition-all ${
        isLatest
          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
          : 'bg-white text-gray-800 border-gray-200 hover:border-blue-300'
      }`}
    >
      <span>{fmt(num)}</span>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copy ${num}`}
        className={`opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 ${
          isLatest
            ? 'hover:bg-blue-500 text-blue-100'
            : 'hover:bg-blue-50 text-gray-400 hover:text-blue-600'
        }`}
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${num} from history`}
        className={`opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 ${
          isLatest
            ? 'hover:bg-blue-500 text-blue-100'
            : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'
        }`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function RandomNumberGenerator() {
  const [minVal, setMinVal] = useState('1');
  const [maxVal, setMaxVal] = useState('100');
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [history, setHistory] = useState<number[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [shake, setShake] = useState(false);
  const [latestResult, setLatestResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dedicated tracking set for no-duplicates mode — separate from capped history
  // so it correctly reflects every number ever generated in the current range.
  const generatedSet = useRef<Set<number>>(new Set());

  const { toast } = useToast();

  // ── range change resets the no-duplicates pool ───────────────────────────

  const handleMinChange = (v: string) => {
    setMinVal(v);
    setError(null);
    generatedSet.current.clear();
  };

  const handleMaxChange = (v: string) => {
    setMaxVal(v);
    setError(null);
    generatedSet.current.clear();
  };

  // ── validation ────────────────────────────────────────────────────────────

  function validate(): { min: number; max: number } | null {
    const min = parseWholeNumber(minVal);
    const max = parseWholeNumber(maxVal);

    if (min === null || max === null) {
      setError('Please enter whole numbers (no decimals) for Min and Max.');
      return null;
    }
    if (min > max) {
      setError('Minimum must be less than or equal to Maximum.');
      return null;
    }
    if (!allowDuplicates) {
      const range = max - min + 1;
      if (generatedSet.current.size >= range) {
        setError(
          `All ${fmt(range)} number${range === 1 ? '' : 's'} in this range have been generated. Clear history or enable duplicates to continue.`
        );
        return null;
      }
    }
    setError(null);
    return { min, max };
  }

  // ── generate ──────────────────────────────────────────────────────────────

  const generate = useCallback(() => {
    // validate() reads state directly — no stale-closure risk since it's not
    // inside useCallback's dependency array (it is re-declared each render).
    const validated = validate();
    if (!validated) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    const { min, max } = validated;

    let num: number;

    if (!allowDuplicates) {
      const range = max - min + 1;
      if (range <= 10_000) {
        // Build an explicit pool for small ranges — O(range)
        const pool: number[] = [];
        for (let i = min; i <= max; i++) {
          if (!generatedSet.current.has(i)) pool.push(i);
        }
        num = pool[Math.floor(Math.random() * pool.length)];
      } else {
        // Rejection sampling for large ranges — efficient while density is low
        do {
          num = randomInt(min, max);
        } while (generatedSet.current.has(num));
      }
      generatedSet.current.add(num);
    } else {
      num = randomInt(min, max);
    }

    setLatestResult(num);
    setHistory((prev) => [num, ...prev].slice(0, MAX_HISTORY));
    setCopiedIndex(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minVal, maxVal, allowDuplicates]);
  // Note: validate() captures latest state via closure on each render;
  // generate() is re-created whenever inputs change, so no stale reads occur.

  // ── copy helpers ──────────────────────────────────────────────────────────

  const copyOne = async (num: number, index: number) => {
    try {
      await navigator.clipboard.writeText(String(num));
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  const copyAll = async () => {
    if (!history.length) return;
    try {
      await navigator.clipboard.writeText(history.join(', '));
      setCopiedAll(true);
      toast({ title: 'Copied!', description: `${history.length} numbers copied to clipboard.`, duration: 2000 });
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  const removeOne = (index: number) => {
    setHistory((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // Keep latestResult in sync when the most-recent chip is removed
      if (index === 0) setLatestResult(next[0] ?? null);
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    setLatestResult(null);
    setCopiedIndex(null);
    setError(null);
    generatedSet.current.clear();
  };

  // ── derived stats (safe for large arrays — no spread) ────────────────────

  const histMin   = history.length ? arrayMin(history) : null;
  const histMax   = history.length ? arrayMax(history) : null;
  const avg       = history.length ? arrayAvg(history) : null;

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

      {/* ── Header ── */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Random Number Generator</h1>
        <p className="text-muted-foreground">Generate random numbers within any range — instantly</p>
      </div>

      {/* ── Main card ── */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-7">

        {/* Range inputs */}
        <div className="flex gap-4">
          <NumField
            id="min-val"
            label="Minimum"
            value={minVal}
            onChange={handleMinChange}
            onEnter={generate}
            placeholder="1"
          />
          <NumField
            id="max-val"
            label="Maximum"
            value={maxVal}
            onChange={handleMaxChange}
            onEnter={generate}
            placeholder="100"
          />
        </div>

        {/* Duplicates toggle */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <button
            type="button"
            role="switch"
            aria-checked={allowDuplicates}
            onClick={() => {
              setAllowDuplicates((v) => !v);
              setError(null);
              generatedSet.current.clear();
            }}
            className="flex items-center gap-3 w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg"
          >
            <span
              aria-hidden="true"
              className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ${
                allowDuplicates ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 mt-0.5 ${
                  allowDuplicates ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </span>
            <div>
              <span className="text-sm font-semibold text-gray-800">Allow Duplicates</span>
              <p className="text-xs text-gray-400 mt-0.5">
                {allowDuplicates
                  ? 'The same number can appear more than once.'
                  : 'Each number will only appear once per session — like drawing without replacement.'}
              </p>
            </div>
          </button>
        </div>

        {/* Error message — announced to screen readers */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700"
          >
            <span className="flex-shrink-0 mt-0.5" aria-hidden="true">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Generate button + latest result */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <Button
            onClick={generate}
            className={`flex-1 h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-3 transition-all ${
              shake ? 'animate-[shake_0.4s_ease-in-out]' : ''
            }`}
          >
            <Shuffle className="w-5 h-5" />
            Generate
          </Button>

          {latestResult !== null && (
            <div className="flex-1 flex items-center justify-center bg-blue-50/60 border border-blue-100 rounded-xl h-14 px-6">
              <span className="text-3xl font-extrabold text-blue-700 tabular-nums tracking-tight">
                {fmt(latestResult)}
              </span>
            </div>
          )}
        </div>

        {/* Stats — shown once there are at least 2 results */}
        {history.length > 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Generated', value: fmt(history.length) },
              { label: 'Lowest',    value: fmt(histMin!) },
              { label: 'Highest',   value: fmt(histMax!) },
              { label: 'Average',   value: parseFloat(avg!.toFixed(1)).toLocaleString('en-US') },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-blue-600 tabular-nums">{value}</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {history.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                History ({history.length}{history.length === MAX_HISTORY ? ' max' : ''})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyAll}
                  className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                >
                  {copiedAll ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedAll ? 'Copied' : 'Copy all'}
                </button>
                <span className="text-gray-200">|</span>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              {history.map((num, i) => (
                <HistoryChip
                  key={`${num}-${i}`}
                  num={num}
                  isLatest={i === 0}
                  onCopy={() => copyOne(num, i)}
                  onRemove={() => removeOne(i)}
                  copied={copiedIndex === i}
                />
              ))}
            </div>

            {history.length >= MAX_HISTORY && (
              <p className="text-xs text-amber-600">
                History is capped at {MAX_HISTORY} entries — oldest numbers are dropped automatically. The no-duplicates pool is unaffected.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-blue-50/60 rounded-xl border border-blue-100 px-5 py-6 text-center text-gray-400 text-sm">
            Hit <strong className="text-gray-500">Generate</strong> to start — your numbers will appear here
          </div>
        )}
      </div>

      {/* ── Explainer ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">What is a Random Number Generator?</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            A random number generator (RNG) produces a number from a defined range with no predictable pattern. Every result is independent — past outputs have zero influence on future ones. Random numbers are essential in games, statistics, simulations, raffles, and anywhere you need fair, unbiased selection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: 'How it works',
              body: "Your browser's built-in pseudo-random engine produces a uniformly distributed float, then scales it to your chosen range — giving every integer an equal chance of appearing.",
            },
            {
              title: 'No-duplicates mode',
              body: 'When duplicates are off the generator tracks every number it has produced and only picks from the remaining pool — like drawing cards from a shuffled deck without replacement.',
            },
            {
              title: 'Common uses',
              body: 'Picking a raffle winner, rolling virtual dice, randomising a playlist, choosing a fair order, generating test data, or making any decision where bias must be eliminated.',
            },
          ].map(({ title, body }) => (
            <div key={title} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-1.5">
              <div className="font-semibold text-gray-800 text-sm">{title}</div>
              <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">Quick tips</h3>
          <ul className="space-y-1.5 text-sm text-gray-600 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold flex-shrink-0">→</span>
              <span><strong className="text-gray-700">Press Enter</strong> from either Min or Max field to generate instantly — no mouse needed.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold flex-shrink-0">→</span>
              <span><strong className="text-gray-700">Negative ranges work</strong> — set Min to −50 and Max to 50 for a signed range centred on zero.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold flex-shrink-0">→</span>
              <span><strong className="text-gray-700">Hover any chip</strong> in history to copy or remove that individual number without clearing everything.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Shake keyframe */}
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
