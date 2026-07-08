import { useState, useRef, useCallback } from 'react';
import {
  Shuffle, Copy, Check, RotateCcw, Download, Trophy,
  Star, Dice1, Settings2, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// ─── types ────────────────────────────────────────────────────────────────────

type Mode = 'custom' | 'dice' | 'lottery';
type LotteryKey = '6/49' | '6/59' | 'powerball' | 'mega';

interface Batch {
  id: number;
  main: number[];
  bonus: number[];   // Powerball / Mega Ball only
  mode: Mode;
  label: string;     // e.g. "1–100 · 5 numbers"
}

const LOTTERY_PRESETS: Record<LotteryKey, { label: string; pick: number; from: number; bonusPick?: number; bonusFrom?: number }> = {
  '6/49':      { label: 'Classic 6/49',    pick: 6, from: 49 },
  '6/59':      { label: 'UK 6/59',         pick: 6, from: 59 },
  'powerball': { label: 'Powerball',        pick: 5, from: 69, bonusPick: 1, bonusFrom: 26 },
  'mega':      { label: 'Mega Millions',    pick: 5, from: 70, bonusPick: 1, bonusFrom: 25 },
};

const DICE_DOTS: [number, number][][] = [
  [],                                                              // placeholder for index 0
  [[50, 50]],                                                      // 1
  [[25, 25], [75, 75]],                                           // 2
  [[25, 25], [50, 50], [75, 75]],                                  // 3
  [[25, 25], [75, 25], [25, 75], [75, 75]],                       // 4
  [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],             // 5
  [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],  // 6
];

// ─── helpers ──────────────────────────────────────────────────────────────────

let batchCounter = 0;
function uid() { return ++batchCounter; }

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickUnique(count: number, min: number, max: number, exclude: Set<number>): number[] {
  const range = max - min + 1;
  const available = range - exclude.size;
  if (count > available) throw new Error('Not enough unique numbers available.');

  const result: number[] = [];
  const used = new Set<number>(exclude);

  if (count / available < 0.3) {
    // Rejection sampling — efficient when picking a small fraction of the range
    while (result.length < count) {
      const n = randomInt(min, max);
      if (!used.has(n)) { used.add(n); result.push(n); }
    }
  } else {
    // Build explicit pool
    const pool: number[] = [];
    for (let i = min; i <= max; i++) if (!used.has(i)) pool.push(i);
    // Fisher–Yates partial shuffle
    for (let i = 0; i < count; i++) {
      const j = i + Math.floor(Math.random() * (pool.length - i));
      [pool[i], pool[j]] = [pool[j], pool[i]];
      result.push(pool[i]);
    }
  }
  return result.sort((a, b) => a - b);
}

function fmt(n: number) { return n.toLocaleString('en-US'); }

function downloadFile(content: string, name: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function parseWholeNumber(s: string): number | null {
  const n = Number(s);
  return Number.isFinite(n) && Number.isInteger(n) ? n : null;
}

// ─── sub-components ───────────────────────────────────────────────────────────

function DiceFace({ n, size = 56, highlight = false, winner = false }: {
  n: number; size?: number; highlight?: boolean; winner?: boolean;
}) {
  const dots = DICE_DOTS[n] ?? [];
  const bg = winner ? '#f59e0b' : highlight ? '#3b82f6' : '#1e293b';
  const dot = winner || highlight ? '#fff' : '#f8fafc';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
      <rect width="100" height="100" rx="18" fill={bg} />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={9} fill={dot} />
      ))}
      {winner && (
        <text x="50" y="97" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">🏆</text>
      )}
    </svg>
  );
}

function LotteryBall({ n, bonus = false, winner = false, flash = false }: {
  n: number; bonus?: boolean; winner?: boolean; flash?: boolean;
}) {
  const bg = winner
    ? 'linear-gradient(135deg,#f59e0b,#d97706)'
    : flash
    ? 'linear-gradient(135deg,#3b82f6,#2563eb)'
    : bonus
    ? 'linear-gradient(135deg,#ef4444,#dc2626)'
    : 'linear-gradient(135deg,#6366f1,#4f46e5)';
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: n >= 100 ? 13 : 15,
      boxShadow: winner ? '0 0 0 3px #fde68a,0 4px 12px rgba(245,158,11,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
      transition: 'background 0.15s',
      flexShrink: 0,
      position: 'relative',
    }}>
      {n}
    </div>
  );
}

function NumberChip({ n, winner = false, flash = false }: {
  n: number; winner?: boolean; flash?: boolean;
}) {
  return (
    <div className={`
      flex items-center justify-center rounded-xl px-4 py-2.5 text-lg font-bold tabular-nums transition-all
      ${winner
        ? 'bg-amber-400 text-white shadow-lg shadow-amber-200 ring-2 ring-amber-300'
        : flash
        ? 'bg-blue-600 text-white scale-110'
        : 'bg-blue-50 border border-blue-100 text-blue-700'}
    `}>
      {winner && <Trophy className="w-4 h-4 mr-1.5 shrink-0" />}
      {fmt(n)}
    </div>
  );
}

function ModeTab({ mode, current, icon, label, onClick }: {
  mode: Mode; current: Mode; icon: React.ReactNode; label: string; onClick: () => void;
}) {
  const active = mode === current;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}{label}
    </button>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function RandomNumberGenerator() {
  // ── mode & settings
  const [mode, setMode]               = useState<Mode>('custom');
  const [minVal, setMinVal]           = useState('1');
  const [maxVal, setMaxVal]           = useState('100');
  const [count, setCount]             = useState(1);
  const [noDupes, setNoDupes]         = useState(false);
  const [diceCount, setDiceCount]     = useState(1);
  const [lotteryKey, setLotteryKey]   = useState<LotteryKey>('6/49');

  // ── results & history
  const [batches, setBatches]         = useState<Batch[]>([]);
  const [error, setError]             = useState<string | null>(null);
  const [shake, setShake]             = useState(false);

  // ── winner animation
  const [flashIdx, setFlashIdx]       = useState<number | null>(null);
  const [winnerIdx, setWinnerIdx]     = useState<number | null>(null);
  const [animating, setAnimating]     = useState(false);
  const animRef                       = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── copy / ui state
  const [copiedAll, setCopiedAll]     = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // ── no-duplicates pool (custom mode only — tracks across batches)
  const generatedSet = useRef<Set<number>>(new Set());

  const { toast } = useToast();

  const currentBatch = batches[0] ?? null;

  // ── mode switch ────────────────────────────────────────────────────────────

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setWinnerIdx(null);
    setFlashIdx(null);
    if (animRef.current) clearTimeout(animRef.current);
  };

  // ── range change resets pool ───────────────────────────────────────────────

  const handleMinChange = (v: string) => { setMinVal(v); setError(null); generatedSet.current.clear(); };
  const handleMaxChange = (v: string) => { setMaxVal(v); setError(null); generatedSet.current.clear(); };

  // ── generate ───────────────────────────────────────────────────────────────

  const generate = useCallback(() => {
    setError(null);
    setWinnerIdx(null);
    setFlashIdx(null);
    if (animRef.current) clearTimeout(animRef.current);

    try {
      let batch: Batch;

      if (mode === 'dice') {
        const main: number[] = Array.from({ length: diceCount }, () => randomInt(1, 6));
        batch = { id: uid(), main, bonus: [], mode, label: `${diceCount} ${diceCount === 1 ? 'die' : 'dice'}` };

      } else if (mode === 'lottery') {
        const preset = LOTTERY_PRESETS[lotteryKey];
        const main = pickUnique(preset.pick, 1, preset.from, new Set());
        const bonus = preset.bonusPick
          ? pickUnique(preset.bonusPick, 1, preset.bonusFrom!, new Set())
          : [];
        batch = { id: uid(), main, bonus, mode, label: preset.label };

      } else {
        // custom mode
        const min = parseWholeNumber(minVal);
        const max = parseWholeNumber(maxVal);
        if (min === null || max === null) { setError('Enter whole numbers for Min and Max.'); setShake(true); setTimeout(() => setShake(false), 500); return; }
        if (min > max) { setError('Minimum must be ≤ Maximum.'); setShake(true); setTimeout(() => setShake(false), 500); return; }

        let main: number[];
        if (noDupes) {
          main = pickUnique(count, min, max, generatedSet.current);
          main.forEach(n => generatedSet.current.add(n));
        } else {
          main = Array.from({ length: count }, () => randomInt(min, max));
        }
        batch = { id: uid(), main, bonus: [], mode, label: `${fmt(min)}–${fmt(max)} · ${count} number${count > 1 ? 's' : ''}` };
      }

      setBatches(prev => [batch, ...prev].slice(0, 50));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Generation failed.';
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, minVal, maxVal, count, noDupes, diceCount, lotteryKey]);

  // ── winner picker animation ────────────────────────────────────────────────

  const pickWinner = () => {
    if (!currentBatch || animating) return;
    const all = [...currentBatch.main, ...currentBatch.bonus];
    if (all.length < 2) { setWinnerIdx(0); return; }

    setAnimating(true);
    setWinnerIdx(null);

    const finalIdx = Math.floor(Math.random() * all.length);
    // Build delay schedule: fast → slow
    const delays: number[] = [
      ...Array(12).fill(60),
      ...Array(8).fill(120),
      ...Array(5).fill(220),
      ...Array(3).fill(380),
    ];

    let step = 0;
    const tick = () => {
      if (step < delays.length) {
        setFlashIdx(step % all.length);
        animRef.current = setTimeout(tick, delays[step]);
        step++;
      } else {
        setFlashIdx(finalIdx);
        setWinnerIdx(finalIdx);
        setAnimating(false);
      }
    };
    tick();
  };

  // ── copy / download ────────────────────────────────────────────────────────

  const allNumbers = currentBatch
    ? [...currentBatch.main, ...currentBatch.bonus]
    : [];

  const copyAll = async () => {
    if (!allNumbers.length) return;
    try {
      await navigator.clipboard.writeText(allNumbers.join(', '));
      setCopiedAll(true);
      toast({ title: 'Copied!', description: `${allNumbers.length} numbers copied.`, duration: 2000 });
      setTimeout(() => setCopiedAll(false), 2000);
    } catch { toast({ title: 'Copy failed', variant: 'destructive' }); }
  };

  const downloadTxt = () => {
    if (!batches.length) return;
    const lines = batches.map((b, i) =>
      `Batch ${batches.length - i} [${b.label}]: ${[...b.main, ...b.bonus].join(', ')}`
    );
    downloadFile(lines.join('\n'), 'random-numbers.txt', 'text/plain');
    toast({ title: 'TXT downloaded', duration: 1800 });
  };

  const downloadCsv = () => {
    if (!batches.length) return;
    const maxMain  = Math.max(...batches.map(b => b.main.length));
    const maxBonus = Math.max(...batches.map(b => b.bonus.length));
    const header = [
      'Batch', 'Mode', 'Label',
      ...Array.from({ length: maxMain  }, (_, i) => `Number ${i + 1}`),
      ...Array.from({ length: maxBonus }, (_, i) => `Bonus ${i + 1}`),
    ].join(',');
    const rows = batches.map((b, i) => [
      batches.length - i, b.mode, `"${b.label}"`,
      ...b.main,
      ...Array(maxMain - b.main.length).fill(''),
      ...b.bonus,
      ...Array(maxBonus - b.bonus.length).fill(''),
    ].join(','));
    downloadFile([header, ...rows].join('\n'), 'random-numbers.csv', 'text/csv');
    toast({ title: 'CSV downloaded', duration: 1800 });
  };

  const clearAll = () => {
    setBatches([]);
    setError(null);
    setWinnerIdx(null);
    setFlashIdx(null);
    generatedSet.current.clear();
    if (animRef.current) clearTimeout(animRef.current);
  };

  // ── derived stats ──────────────────────────────────────────────────────────

  const allFlat = batches.flatMap(b => [...b.main, ...b.bonus]);
  const stats = allFlat.length > 1 ? {
    total: allFlat.length,
    low:   allFlat.reduce((a, b) => Math.min(a, b)),
    high:  allFlat.reduce((a, b) => Math.max(a, b)),
    avg:   allFlat.reduce((a, b) => a + b, 0) / allFlat.length,
  } : null;

  // ── render helpers ─────────────────────────────────────────────────────────

  const renderResult = (batch: Batch) => {
    const all = [...batch.main, ...batch.bonus];
    if (batch.mode === 'dice') {
      return (
        <div className="flex flex-wrap gap-3 justify-center">
          {batch.main.map((n, i) => (
            <DiceFace
              key={i} n={n}
              winner={winnerIdx === i}
              highlight={flashIdx === i && winnerIdx === null}
            />
          ))}
        </div>
      );
    }
    if (batch.mode === 'lottery') {
      return (
        <div className="flex flex-wrap gap-3 justify-center items-center">
          {batch.main.map((n, i) => (
            <LotteryBall key={i} n={n}
              winner={winnerIdx === i}
              flash={flashIdx === i && winnerIdx === null}
            />
          ))}
          {batch.bonus.map((n, i) => (
            <LotteryBall key={`b${i}`} n={n} bonus
              winner={winnerIdx === batch.main.length + i}
              flash={flashIdx === batch.main.length + i && winnerIdx === null}
            />
          ))}
        </div>
      );
    }
    // custom
    return (
      <div className={`flex flex-wrap gap-2 justify-center ${all.length === 1 ? 'justify-center' : ''}`}>
        {all.map((n, i) => (
          <NumberChip key={i} n={n}
            winner={winnerIdx === i}
            flash={flashIdx === i && winnerIdx === null}
          />
        ))}
      </div>
    );
  };

  const genLabel = mode === 'dice'
    ? `Roll ${diceCount} ${diceCount === 1 ? 'Die' : 'Dice'}`
    : mode === 'lottery'
    ? `Draw ${LOTTERY_PRESETS[lotteryKey].label}`
    : count === 1 ? 'Generate Number' : `Generate ${count} Numbers`;

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

      {/* ── Header ── */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Random Number Generator</h1>
        <p className="text-muted-foreground">Custom ranges, dice, lottery draws, winner picker & more</p>
      </div>

      {/* ── Main card ── */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">

        {/* Mode tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <ModeTab mode="custom"  current={mode} icon={<Settings2 className="w-4 h-4" />}  label="Custom"  onClick={() => switchMode('custom')} />
          <ModeTab mode="dice"    current={mode} icon={<Dice1 className="w-4 h-4" />}       label="Dice"    onClick={() => switchMode('dice')} />
          <ModeTab mode="lottery" current={mode} icon={<Star className="w-4 h-4" />}        label="Lottery" onClick={() => switchMode('lottery')} />
        </div>

        {/* ── Custom settings ── */}
        {mode === 'custom' && (
          <div className="space-y-5">
            <div className="flex gap-4">
              {/* Min */}
              <div className="space-y-1.5 flex-1">
                <label htmlFor="min-val" className="block text-sm font-semibold text-gray-700">Minimum</label>
                <input id="min-val" type="number" inputMode="numeric"
                  value={minVal} onChange={e => handleMinChange(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generate()}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
              </div>
              {/* Max */}
              <div className="space-y-1.5 flex-1">
                <label htmlFor="max-val" className="block text-sm font-semibold text-gray-700">Maximum</label>
                <input id="max-val" type="number" inputMode="numeric"
                  value={maxVal} onChange={e => handleMaxChange(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generate()}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
              </div>
            </div>

            {/* Count slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="count-slider" className="text-sm font-semibold text-gray-700">
                  How many numbers?
                </label>
                <span className="text-sm font-bold text-blue-600 tabular-nums w-20 text-right">
                  {count} {count === 1 ? 'number' : 'numbers'}
                </span>
              </div>
              <input id="count-slider" type="range" min={1} max={100} value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer" />
              <div className="flex justify-between text-xs text-gray-400">
                <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
              </div>
            </div>

            {/* No duplicates toggle */}
            <button type="button" role="switch" aria-checked={noDupes}
              onClick={() => { setNoDupes(v => !v); setError(null); generatedSet.current.clear(); }}
              className="flex items-center gap-3 w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg bg-gray-50/60 border border-gray-100 rounded-xl p-4">
              <span aria-hidden="true"
                className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ${noDupes ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 mt-0.5 ${noDupes ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
              </span>
              <div>
                <span className="text-sm font-semibold text-gray-800">No Duplicates</span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {noDupes
                    ? 'Each number appears only once — across all batches in this session.'
                    : 'Numbers can repeat between results.'}
                </p>
              </div>
            </button>
          </div>
        )}

        {/* ── Dice settings ── */}
        {mode === 'dice' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="dice-count" className="text-sm font-semibold text-gray-700">Number of dice</label>
                <span className="text-sm font-bold text-blue-600">{diceCount} {diceCount === 1 ? 'die' : 'dice'}</span>
              </div>
              <input id="dice-count" type="range" min={1} max={10} value={diceCount}
                onChange={e => setDiceCount(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer" />
              <div className="flex justify-between text-xs text-gray-400 px-0.5">
                {[1,2,3,4,5,6,7,8,9,10].map(n => <span key={n}>{n}</span>)}
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">Each die rolls 1–6 independently</p>
          </div>
        )}

        {/* ── Lottery settings ── */}
        {mode === 'lottery' && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Pick a lottery format</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(LOTTERY_PRESETS) as LotteryKey[]).map(key => {
                const p = LOTTERY_PRESETS[key];
                return (
                  <button key={key} type="button" onClick={() => setLotteryKey(key)}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      lotteryKey === key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-100 hover:border-blue-200 text-gray-700'
                    }`}>
                    <div className="font-semibold text-sm">{p.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {p.pick} from 1–{p.from}
                      {p.bonusPick ? ` + ${p.bonusPick} bonus from 1–${p.bonusFrom}` : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div role="alert" aria-live="assertive"
            className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
            <span className="shrink-0 mt-0.5" aria-hidden="true">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Generate button */}
        <Button onClick={generate} disabled={animating}
          className={`w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-3 transition-all ${
            shake ? 'animate-[shake_0.4s_ease-in-out]' : ''
          }`}>
          {mode === 'dice' ? <Dice1 className="w-5 h-5" /> : mode === 'lottery' ? <Star className="w-5 h-5" /> : <Shuffle className="w-5 h-5" />}
          {genLabel}
        </Button>

        {/* ── Results panel ── */}
        {currentBatch && (
          <div className="bg-blue-50/60 rounded-xl border border-blue-100 p-5 space-y-4">
            {/* Label */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">{currentBatch.label}</span>
              {currentBatch.bonus.length > 0 && (
                <span className="text-xs text-red-400 font-semibold">
                  ● Bonus number{currentBatch.bonus.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Numbers */}
            <div className="py-1">
              {renderResult(currentBatch)}
            </div>

            {/* Winner announcement */}
            {winnerIdx !== null && (
              <div className="flex items-center justify-center gap-2 text-amber-600 font-bold text-sm animate-in fade-in zoom-in-95 duration-300">
                <Trophy className="w-4 h-4" />
                Winner: {fmt([...currentBatch.main, ...currentBatch.bonus][winnerIdx])}!
                <Trophy className="w-4 h-4" />
              </div>
            )}

            {/* Action row */}
            <div className="flex flex-wrap gap-2 pt-1">
              {/* Pick winner — only show for 2+ numbers */}
              {allNumbers.length > 1 && (
                <Button variant="outline" size="sm" onClick={pickWinner} disabled={animating}
                  className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300">
                  {animating
                    ? <span className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin inline-block" />
                    : <Trophy className="w-3.5 h-3.5" />}
                  {animating ? 'Picking…' : winnerIdx !== null ? 'Pick Again' : 'Pick Winner'}
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={copyAll} className="gap-2 ml-auto">
                {copiedAll ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                Copy All
              </Button>
              <Button variant="outline" size="sm" onClick={downloadTxt} className="gap-2">
                <Download className="w-3.5 h-3.5" />
                TXT
              </Button>
              <Button variant="outline" size="sm" onClick={downloadCsv} className="gap-2">
                <Download className="w-3.5 h-3.5" />
                CSV
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Generated', value: fmt(stats.total) },
              { label: 'Lowest',    value: fmt(stats.low) },
              { label: 'Highest',   value: fmt(stats.high) },
              { label: 'Average',   value: parseFloat(stats.avg.toFixed(1)).toLocaleString('en-US') },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-blue-600 tabular-nums">{value}</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {batches.length > 0 && (
          <div className="space-y-2">
            <button type="button"
              onClick={() => setHistoryOpen(o => !o)}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors w-full">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
              History ({batches.length} batch{batches.length > 1 ? 'es' : ''})
              <span className="ml-auto">
                <button type="button" onClick={e => { e.stopPropagation(); clearAll(); }}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors">
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              </span>
            </button>

            {historyOpen && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {batches.map((b, bi) => (
                  <div key={b.id}
                    className={`rounded-xl border px-4 py-3 text-sm ${bi === 0 ? 'border-blue-200 bg-blue-50/40' : 'border-gray-100 bg-gray-50/40'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-500">{b.label}</span>
                      {bi === 0 && <span className="text-xs text-blue-500 font-semibold">Latest</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[...b.main, ...b.bonus].map((n, i) => (
                        <span key={i}
                          className={`px-2 py-0.5 rounded-lg text-xs font-bold tabular-nums ${
                            i >= b.main.length
                              ? 'bg-red-100 text-red-700'
                              : 'bg-white border border-gray-200 text-gray-700'
                          }`}>
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!currentBatch && !error && (
          <div className="bg-blue-50/60 rounded-xl border border-blue-100 px-5 py-8 text-center text-gray-400 text-sm">
            Hit <strong className="text-gray-500">Generate</strong> to get started — your results will appear here
          </div>
        )}
      </div>

      {/* ── Explainer ── */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">About the modes</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Choose Custom for any range and quantity, Dice for realistic die rolls (1–6), or Lottery to simulate popular draw formats with authentic ball counts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: 'Custom mode',
              body: 'Set any Min and Max (including negatives), pick 1–100 numbers per batch, and toggle No Duplicates to ensure unique results across the entire session.',
            },
            {
              title: 'Dice mode',
              body: 'Roll 1–10 independent dice in one click. Each face is equally likely. Great for board games, RPGs, or teaching probability.',
            },
            {
              title: 'Lottery mode',
              body: 'Simulates 6/49, UK 6/59, Powerball, and Mega Millions draws with correct ball counts. Bonus balls are shown in red. Always picks without replacement.',
            },
          ].map(({ title, body }) => (
            <div key={title} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-1.5">
              <div className="font-semibold text-gray-800 text-sm">{title}</div>
              <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">Tips</h3>
          <ul className="space-y-1.5 text-sm text-gray-600 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold shrink-0">→</span>
              <span><strong className="text-gray-700">Press Enter</strong> in any Custom field to generate instantly.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold shrink-0">→</span>
              <span><strong className="text-gray-700">Pick Winner</strong> appears when 2+ numbers are shown — it animates and picks one at random.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold shrink-0">→</span>
              <span><strong className="text-gray-700">Download CSV</strong> includes all batches with batch number, mode, and each number in its own column.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold shrink-0">→</span>
              <span><strong className="text-gray-700">Negative ranges</strong> work in Custom mode — set Min to −50 and Max to 50 for a signed range.</span>
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
