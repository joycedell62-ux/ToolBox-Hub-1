import React from 'react';
import { WifiOff, ShieldCheck, Zap, Gift } from 'lucide-react';

const BADGES = [
  { icon: WifiOff, label: 'Offline Ready', title: 'Works entirely in your browser — no internet needed after loading' },
  { icon: ShieldCheck, label: 'Secure', title: 'Your data never leaves your device' },
  { icon: Zap, label: 'Fast', title: 'Instant results, no waiting' },
  { icon: Gift, label: 'Free', title: 'Free forever, no sign-up' },
] as const;

/** Compact trust pills shown on every tool page. */
export default function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {BADGES.map(({ icon: Icon, label, title }) => (
        <span
          key={label}
          title={title}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-semibold text-gray-600"
        >
          <Icon className="w-3 h-3 text-blue-500" aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  );
}
