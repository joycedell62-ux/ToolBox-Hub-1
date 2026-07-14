import React, { useState, useMemo } from 'react';
import { ShieldCheck, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Eye, EyeOff, Check, X, Lock } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Is my password sent anywhere?', a: 'No — never. All analysis happens locally in your browser. Nothing is transmitted, logged, or stored. You can even disconnect from the internet and it still works.' },
  { q: 'What is entropy?', a: 'Entropy measures how unpredictable a password is, in bits. Each extra bit doubles the guessing effort. Roughly, under 40 bits is weak, 60+ is strong, 80+ is excellent.' },
  { q: 'How is crack time estimated?', a: 'We estimate the number of possible combinations from the character set and length, then divide by a fast offline guessing rate (~10 billion guesses/sec). It’s an approximation, not a guarantee.' },
  { q: 'Why is my long password still weak?', a: 'Length helps only if the password isn’t predictable. Common passwords, dictionary words, and simple patterns are cracked instantly regardless of length.' },
  { q: 'What makes a strong password?', a: 'Length above all — 16+ characters — mixing upper, lower, digits and symbols, with no dictionary words or reused patterns. A passphrase of random words also works well.' },
];

const COMMON = new Set([
  'password', 'password1', 'password123', '123456', '12345678', '123456789', '1234567890', 'qwerty', 'qwerty123',
  'abc123', 'letmein', 'welcome', 'admin', 'admin123', 'iloveyou', 'monkey', 'dragon', 'sunshine', 'princess',
  '111111', '000000', '123123', '654321', 'football', 'baseball', 'superman', 'batman', 'trustno1', 'master',
  'login', 'passw0rd', 'starwars', 'whatever', 'freedom', 'ninja', 'azerty', 'shadow', 'michael', 'jennifer',
]);

function estimateEntropy(pw: string): number {
  if (!pw) return 0;
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  if (pool === 0) return 0;
  return +(pw.length * Math.log2(pool)).toFixed(1);
}

function formatTime(seconds: number): string {
  if (seconds < 1) return 'instantly';
  const units: [number, string][] = [
    [60, 'second'], [60, 'minute'], [24, 'hour'], [365, 'day'], [100, 'year'], [Infinity, 'century'],
  ];
  let val = seconds;
  let name = 'second';
  for (const [factor, label] of units) {
    if (val < factor) { name = label; break; }
    val /= factor;
    name = label;
  }
  const rounded = val >= 100 ? Math.round(val) : +val.toFixed(1);
  if (rounded > 1e6) return 'millions of ' + name + 's';
  return `${rounded} ${name}${rounded === 1 ? '' : 's'}`;
}

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const analysis = useMemo(() => {
    const pw = password;
    const criteria = {
      length: pw.length >= 12,
      lower: /[a-z]/.test(pw),
      upper: /[A-Z]/.test(pw),
      digit: /[0-9]/.test(pw),
      symbol: /[^a-zA-Z0-9]/.test(pw),
      notCommon: pw.length > 0 && !COMMON.has(pw.toLowerCase()),
    };
    let entropy = estimateEntropy(pw);
    const isCommon = pw.length > 0 && COMMON.has(pw.toLowerCase());
    if (isCommon) entropy = Math.min(entropy, 8);

    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/[0-9]/.test(pw)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
    const guesses = pool > 0 ? Math.pow(pool, pw.length) / 2 : 0;
    const crackSeconds = isCommon ? 0 : guesses / 1e10;

    let score = 0;
    if (entropy >= 28) score = 1;
    if (entropy >= 40) score = 2;
    if (entropy >= 60) score = 3;
    if (entropy >= 80) score = 4;
    if (isCommon) score = 0;

    return { criteria, entropy, isCommon, crackSeconds, score };
  }, [password]);

  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['#dc2626', '#f97316', '#eab308', '#16a34a', '#15803d'];
  const meterColor = password ? colors[analysis.score] : '#e5e7eb';

  const checklist: { key: keyof typeof analysis.criteria; label: string }[] = [
    { key: 'length', label: 'At least 12 characters' },
    { key: 'lower', label: 'Lowercase letters (a–z)' },
    { key: 'upper', label: 'Uppercase letters (A–Z)' },
    { key: 'digit', label: 'Numbers (0–9)' },
    { key: 'symbol', label: 'Symbols (!@#$…)' },
    { key: 'notCommon', label: 'Not a common password' },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><ShieldCheck className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Password Strength Checker</h1><p className="text-blue-200 text-sm">entropy · criteria · crack time · 100% private</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Check how strong your password really is. Analysis runs entirely in your browser — your password is never sent, logged, or stored anywhere.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="pw-input" className="block text-xs font-semibold text-gray-500 mb-1">Enter a password to test</label>
              <div className="relative">
                <input id="pw-input" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type or paste a password" autoComplete="off" spellCheck={false} />
                <button onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 p-1" aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">
              <Lock className="w-4 h-4 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-green-800">Your password never leaves this device. All checks run offline in your browser — nothing is transmitted or stored.</p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Length beats complexity — aim for 16+ characters when you can.</li>
              <li>• A random passphrase (4–5 unrelated words) is strong and memorable.</li>
              <li>• Never reuse passwords across sites; use a password manager.</li>
              <li>• Avoid names, dates, and dictionary words — they’re guessed first.</li>
              <li>• This tool is safe to paste into: it runs entirely offline.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-sm">Strength</h2>
              <span className="text-sm font-bold" style={{ color: password ? meterColor : '#9ca3af' }}>{password ? labels[analysis.score] : '—'}</span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: password ? `${((analysis.score + 1) / 5) * 100}%` : '0%', background: meterColor }} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <span className="text-xs text-gray-500 block">Entropy</span>
                <span className="font-bold text-gray-800">{analysis.entropy} bits</span>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <span className="text-xs text-gray-500 block">Est. offline crack time</span>
                <span className="font-bold text-gray-800">{password ? formatTime(analysis.crackSeconds) : '—'}</span>
              </div>
            </div>
            {analysis.isCommon && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">⚠ This is a very common password and would be cracked instantly. Choose something unique.</div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Criteria Checklist</h2>
            <ul className="space-y-2">
              {checklist.map(c => {
                const ok = analysis.criteria[c.key];
                return (
                  <li key={c.key} className="flex items-center gap-3 text-sm">
                    <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${ok ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </span>
                    <span className={ok ? 'text-gray-800' : 'text-gray-500'}>{c.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Password Generator', href: '/password-generator' }, { label: 'Hash Generator', href: '/hash-generator' }, { label: 'File Checksum', href: '/file-checksum-generator' }, { label: 'UUID Generator', href: '/uuid-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_password-strength-checker', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
