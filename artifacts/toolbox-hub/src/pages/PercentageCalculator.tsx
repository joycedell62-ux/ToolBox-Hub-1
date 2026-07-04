import { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// ─── types ───────────────────────────────────────────────────────────────────

type Mode = 'whatIsXofY' | 'xIsWhatOf' | 'increase' | 'decrease';

interface CalcState {
  a: string;
  b: string;
}

const EMPTY: CalcState = { a: '', b: '' };

// ─── helpers ─────────────────────────────────────────────────────────────────

function round(n: number, dp = 4) {
  return parseFloat(n.toFixed(dp));
}

function fmt(n: number) {
  // Show up to 4 decimal places but strip trailing zeros
  return n.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

function compute(mode: Mode, a: string, b: string): string | null {
  const x = parseFloat(a);
  const y = parseFloat(b);
  if (isNaN(x) || isNaN(y)) return null;

  switch (mode) {
    case 'whatIsXofY': {
      const result = round((x / 100) * y);
      return `${fmt(x)}% of ${fmt(y)} = ${fmt(result)}`;
    }
    case 'xIsWhatOf': {
      if (y === 0) return 'Cannot divide by zero';
      const result = round((x / y) * 100);
      return `${fmt(x)} is ${fmt(result)}% of ${fmt(y)}`;
    }
    case 'increase': {
      if (y === 0) return 'Cannot divide by zero';
      const result = round(((x - y) / y) * 100);
      const sign = result >= 0 ? '+' : '';
      return `From ${fmt(y)} to ${fmt(x)} = ${sign}${fmt(result)}% change`;
    }
    case 'decrease': {
      const result = round(y * (1 - x / 100));
      return `${fmt(y)} decreased by ${fmt(x)}% = ${fmt(result)}`;
    }
  }
}

// ─── sub-components ──────────────────────────────────────────────────────────

interface TabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function Tab({ active, onClick, children }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

interface NumInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
}

function NumInput({ id, label, value, onChange, placeholder = '0', suffix }: NumInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all bg-white placeholder:text-gray-300 pr-14"
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── mode configs ─────────────────────────────────────────────────────────────

const MODES: { key: Mode; label: string; shortLabel: string; aLabel: string; bLabel: string; aSuffix?: string; bSuffix?: string; aPlaceholder?: string; bPlaceholder?: string }[] = [
  {
    key: 'whatIsXofY',
    label: 'What is X% of Y?',
    shortLabel: 'X% of Y',
    aLabel: 'Percentage (X)',
    bLabel: 'Value (Y)',
    aSuffix: '%',
  },
  {
    key: 'xIsWhatOf',
    label: 'X is what % of Y?',
    shortLabel: 'X of Y (%)',
    aLabel: 'Value (X)',
    bLabel: 'Total (Y)',
  },
  {
    key: 'increase',
    label: 'Percentage Change',
    shortLabel: '% Change',
    aLabel: 'New Value',
    bLabel: 'Original Value',
  },
  {
    key: 'decrease',
    label: 'Percentage Decrease',
    shortLabel: '% Decrease',
    aLabel: 'Decrease by',
    bLabel: 'Original Value',
    aSuffix: '%',
  },
];

// ─── main component ───────────────────────────────────────────────────────────

export default function PercentageCalculator() {
  const [activeMode, setActiveMode] = useState<Mode>('whatIsXofY');
  const [inputs, setInputs] = useState<Record<Mode, CalcState>>({
    whatIsXofY: EMPTY,
    xIsWhatOf: EMPTY,
    increase: EMPTY,
    decrease: EMPTY,
  });
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const current = inputs[activeMode];
  const config = MODES.find((m) => m.key === activeMode)!;
  const result = compute(activeMode, current.a, current.b);

  const setField = (field: 'a' | 'b') => (val: string) => {
    setInputs((prev) => ({ ...prev, [activeMode]: { ...prev[activeMode], [field]: val } }));
  };

  const handleReset = () => {
    setInputs((prev) => ({ ...prev, [activeMode]: EMPTY }));
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Result copied to clipboard.', duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  const hasValues = current.a !== '' || current.b !== '';

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Percentage Calculator</h1>
        <p className="text-muted-foreground">Four calculators for every percentage problem</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-7">

        {/* Mode tabs — scrollable on mobile */}
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="flex gap-1.5 min-w-max p-1 bg-gray-100 rounded-xl">
            {MODES.map((m) => (
              <Tab
                key={m.key}
                active={activeMode === m.key}
                onClick={() => { setActiveMode(m.key); setCopied(false); }}
              >
                {m.shortLabel}
              </Tab>
            ))}
          </div>
        </div>

        {/* Active mode title */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{config.label}</h2>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumInput
            id="field-a"
            label={config.aLabel}
            value={current.a}
            onChange={setField('a')}
            suffix={config.aSuffix}
            placeholder={config.aPlaceholder}
          />
          <NumInput
            id="field-b"
            label={config.bLabel}
            value={current.b}
            onChange={setField('b')}
            suffix={config.bSuffix}
            placeholder={config.bPlaceholder}
          />
        </div>

        {/* Result panel */}
        <div className="bg-blue-50/60 rounded-xl border border-blue-100 p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">
            Result
          </div>
          {result ? (
            <div className="text-xl sm:text-2xl font-bold text-blue-800 break-words leading-snug">
              {result}
            </div>
          ) : (
            <div className="text-base text-gray-400">
              Fill in both fields above to see the answer
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!hasValues}
            className="gap-2 hover:bg-gray-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!result}
            className="gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Result'}
          </Button>
        </div>
      </div>

      {/* ── Explainer ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">What is a Percentage Calculator?</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            A percentage is simply a way of expressing a number as a fraction of 100. The word comes from the Latin <em>per centum</em> — "by the hundred." Every percentage problem is really just multiplication or division in disguise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: 'X% of Y',
              formula: '(X ÷ 100) × Y',
              example: '20% of 250 = 50',
              desc: 'Find a portion of any number — discounts, tips, tax.',
            },
            {
              title: 'X is what % of Y?',
              formula: '(X ÷ Y) × 100',
              example: '50 is 20% of 250',
              desc: 'Express one value as a share of another — scores, ratios.',
            },
            {
              title: 'Percentage Change',
              formula: '((New − Old) ÷ Old) × 100',
              example: '250 → 300 = +20%',
              desc: 'Measure growth or decline between two values.',
            },
            {
              title: 'Percentage Decrease',
              formula: 'Value × (1 − X ÷ 100)',
              example: '250 − 20% = 200',
              desc: 'Apply a reduction — sale prices, depreciation.',
            },
          ].map(({ title, formula, example, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-1.5"
            >
              <div className="font-semibold text-gray-800 text-sm">{title}</div>
              <div className="font-mono text-xs text-blue-600 bg-blue-50 rounded-md px-2 py-1 inline-block">
                {formula}
              </div>
              <div className="text-xs font-medium text-green-700 bg-green-50 rounded-md px-2 py-1 inline-block ml-1">
                {example}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed pt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed border-t border-gray-100 pt-4">
          <strong className="text-gray-700">Quick tip:</strong> To convert a percentage to a decimal, divide by 100 (25% → 0.25). To go the other way, multiply by 100 (0.25 → 25%). Once you see percentages as plain fractions, every calculation becomes straightforward.
        </p>
      </div>
    </div>
  );
}
