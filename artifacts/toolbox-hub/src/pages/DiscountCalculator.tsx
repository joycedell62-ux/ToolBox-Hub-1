import { useState } from 'react';
import { Copy, Check, RotateCcw, Tag, Receipt, BadgePercent, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// ─── helpers ──────────────────────────────────────────────────────────────────

function currency(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Result {
  originalPrice: number;
  discountAmount: number;
  priceAfterDiscount: number;
  taxAmount: number | null;
  finalPrice: number;
}

function compute(
  price: string,
  discount: string,
  taxEnabled: boolean,
  tax: string,
): Result | null {
  const p = parseFloat(price);
  const d = parseFloat(discount);
  if (isNaN(p) || isNaN(d) || p < 0 || d < 0 || d > 100) return null;

  const discountAmount = (d / 100) * p;
  const priceAfterDiscount = p - discountAmount;

  let taxAmount: number | null = null;
  let finalPrice = priceAfterDiscount;

  if (taxEnabled) {
    const t = parseFloat(tax);
    if (!isNaN(t) && t >= 0) {
      taxAmount = (t / 100) * priceAfterDiscount;
      finalPrice = priceAfterDiscount + taxAmount;
    }
  }

  return { originalPrice: p, discountAmount, priceAfterDiscount, taxAmount, finalPrice };
}

// ─── sub-components ───────────────────────────────────────────────────────────

interface NumInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
}

function NumInput({ id, label, value, onChange, placeholder = '0', prefix, suffix, min, max }: NumInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          className={`w-full border border-gray-200 rounded-xl py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all bg-white placeholder:text-gray-300 ${prefix ? 'pl-8 pr-4' : 'pl-4'} ${suffix ? 'pr-14' : 'pr-4'}`}
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

interface ResultRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  saving?: boolean;
  muted?: boolean;
}

function ResultRow({ label, value, highlight, saving, muted }: ResultRowProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl px-4 py-3 ${
        highlight
          ? 'bg-blue-600 text-white'
          : saving
          ? 'bg-green-50 border border-green-100'
          : 'bg-white border border-gray-100'
      }`}
    >
      <span className={`text-sm font-medium ${highlight ? 'text-blue-100' : muted ? 'text-gray-500' : 'text-gray-600'}`}>
        {label}
      </span>
      <span className={`text-base font-bold tabular-nums ${highlight ? 'text-white' : saving ? 'text-green-700' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function DiscountCalculator() {
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [tax, setTax] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const result = compute(price, discount, taxEnabled, tax);
  const hasValues = price !== '' || discount !== '';

  const handleReset = () => {
    setPrice('');
    setDiscount('');
    setTax('');
    setTaxEnabled(false);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!result) return;
    const lines = [
      `Original Price:       ${currency(result.originalPrice)}`,
      `Discount (${discount}%):    -${currency(result.discountAmount)}`,
      `Price After Discount:  ${currency(result.priceAfterDiscount)}`,
      ...(result.taxAmount !== null
        ? [
            `Sales Tax (${tax}%):    +${currency(result.taxAmount)}`,
          ]
        : []),
      `Final Price:          ${currency(result.finalPrice)}`,
      `You Save:             ${currency(result.discountAmount)}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      toast({ title: 'Copied!', description: 'Result copied to clipboard.', duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  const savingsPct = result && result.originalPrice > 0
    ? ((result.discountAmount / result.originalPrice) * 100).toFixed(1)
    : null;

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

      {/* ── Header ── */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Discount Calculator</h1>
        <p className="text-muted-foreground">See the final price, savings, and optional tax in seconds</p>
      </div>

      {/* ── Main card ── */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-7">

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumInput
            id="original-price"
            label="Original Price"
            value={price}
            onChange={setPrice}
            placeholder="0.00"
            prefix="$"
            min={0}
          />
          <NumInput
            id="discount-pct"
            label="Discount"
            value={discount}
            onChange={setDiscount}
            placeholder="0"
            suffix="%"
            min={0}
            max={100}
          />
        </div>

        {/* Tax toggle */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <button
            type="button"
            role="switch"
            aria-checked={taxEnabled}
            onClick={() => { setTaxEnabled((v) => !v); if (taxEnabled) setTax(''); }}
            className="flex items-center gap-3 w-full text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg"
          >
            {/* Toggle pill */}
            <span
              aria-hidden="true"
              className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ${
                taxEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 mt-0.5 ${
                  taxEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </span>
            <div>
              <span className="text-sm font-semibold text-gray-800">Include Sales Tax</span>
              <span className="ml-2 text-xs text-gray-400">(optional)</span>
            </div>
          </button>

          {taxEnabled && (
            <div className="mt-4 max-w-xs space-y-1.5">
              <NumInput
                id="tax-rate"
                label="Sales Tax Rate"
                value={tax}
                onChange={setTax}
                placeholder="e.g. 8"
                suffix="%"
                min={0}
              />
              {tax === '' && (
                <p className="text-xs text-amber-600 flex items-center gap-1.5">
                  <span>⚠</span> Enter a tax rate to include tax in the result, or leave 0 for tax-free.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Results panel */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
            Breakdown
          </div>

          {result ? (
            <div className="space-y-2">
              <ResultRow
                label="Original Price"
                value={`$${currency(result.originalPrice)}`}
                muted
              />
              <ResultRow
                label={`Discount (${discount}%)`}
                value={`−$${currency(result.discountAmount)}`}
                muted
              />

              {result.taxAmount !== null ? (
                <>
                  <ResultRow
                    label="Price After Discount"
                    value={`$${currency(result.priceAfterDiscount)}`}
                    muted
                  />
                  <ResultRow
                    label={`Sales Tax (${tax}%)`}
                    value={`+$${currency(result.taxAmount)}`}
                    muted
                  />
                  <ResultRow
                    label="Final Price"
                    value={`$${currency(result.finalPrice)}`}
                    highlight
                  />
                </>
              ) : (
                <ResultRow
                  label="Final Price"
                  value={`$${currency(result.priceAfterDiscount)}`}
                  highlight
                />
              )}

              {/* You save callout */}
              <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-100 px-4 py-3 mt-1">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-1.5">
                  <Tag className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-green-700 font-medium">You save </span>
                  <span className="text-sm font-bold text-green-800">${currency(result.discountAmount)}</span>
                  {savingsPct && (
                    <span className="text-sm text-green-600"> ({savingsPct}% off)</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50/60 rounded-xl border border-blue-100 px-5 py-8 text-center text-gray-400 text-sm">
              Enter an original price and discount to see the breakdown
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

      {/* ── Explainer ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">How Does a Discount Calculator Work?</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            A discount is a percentage reduction from an original price. Whether you're shopping a sale, negotiating a deal, or calculating wholesale margins, three numbers drive every result: the original price, the discount rate, and (when applicable) the sales tax.
          </p>
        </div>

        {/* Formula cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: BadgePercent,
              title: 'Discount Amount',
              formula: 'Price × (Discount ÷ 100)',
              example: '$200 × 25% = $50 saved',
              color: 'blue',
            },
            {
              icon: CircleDollarSign,
              title: 'Final Price',
              formula: 'Price − Discount Amount',
              example: '$200 − $50 = $150',
              color: 'green',
            },
            {
              icon: Receipt,
              title: 'With Tax',
              formula: 'Final × (1 + Tax ÷ 100)',
              example: '$150 × 1.08 = $162',
              color: 'purple',
            },
          ].map(({ icon: Icon, title, formula, example, color }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-2"
            >
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${
                color === 'blue' ? 'bg-blue-100' : color === 'green' ? 'bg-green-100' : 'bg-purple-100'
              }`}>
                <Icon className={`w-4 h-4 ${
                  color === 'blue' ? 'text-blue-600' : color === 'green' ? 'text-green-600' : 'text-purple-600'
                }`} />
              </div>
              <div className="font-semibold text-gray-800 text-sm">{title}</div>
              <div className="font-mono text-xs text-blue-600 bg-blue-50 rounded-md px-2 py-1 inline-block">
                {formula}
              </div>
              <div className="text-xs font-medium text-green-700 bg-green-50 rounded-md px-2 py-1 inline-block">
                {example}
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="space-y-3 border-t border-gray-100 pt-5">
          <h3 className="text-sm font-semibold text-gray-800">Practical Tips</h3>
          <ul className="space-y-2 text-sm text-gray-600 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold flex-shrink-0">→</span>
              <span><strong className="text-gray-700">Stacked discounts aren't additive.</strong> A 20% discount followed by another 10% off gives you 28% total savings — not 30% — because the second discount applies to the already-reduced price.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold flex-shrink-0">→</span>
              <span><strong className="text-gray-700">Tax applies after the discount.</strong> In most jurisdictions, sales tax is calculated on the discounted price, not the original — so your taxable amount is already lower.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold flex-shrink-0">→</span>
              <span><strong className="text-gray-700">Quick mental math:</strong> To find 10% of any price, move the decimal one place left ($85 → $8.50). Double it for 20%, halve it for 5%.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
