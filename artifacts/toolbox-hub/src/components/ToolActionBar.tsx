import React, { useState } from 'react';
import { Star, Link2, Share2, Flag, Check, Loader2 } from 'lucide-react';
import { useFavorites } from '../lib/toolPrefs';
import TrustBadges from './TrustBadges';

interface ToolActionBarProps {
  href: string;
  title: string;
}

/** Uniform action strip on every tool page: favorite, copy link, share, report issue. */
export default function ToolActionBar({ href, title }: ToolActionBarProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(href);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState<'idle' | 'busy' | 'done'>('idle');

  const pageUrl = () => (typeof window !== 'undefined' ? window.location.href : href);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const handleShare = async () => {
    setSharing('busy');
    try {
      if (navigator.share) {
        await navigator.share({ title: `${title} — ToolBox Hub`, url: pageUrl() });
        setSharing('done');
      } else {
        await navigator.clipboard.writeText(pageUrl());
        setSharing('done');
      }
    } catch {
      setSharing('idle');
      return;
    }
    setTimeout(() => setSharing('idle'), 2000);
  };

  const reportHref = `mailto:hello@toolboxhub.app?subject=${encodeURIComponent(`Issue report: ${title}`)}&body=${encodeURIComponent(`Tool: ${title}\nPage: ${pageUrl()}\n\nWhat went wrong?\n`)}`;

  const btn =
    'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-xs font-semibold transition-colors';

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <TrustBadges />
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => toggleFavorite(href)}
          aria-pressed={fav}
          aria-label={fav ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
          className={`${btn} ${
            fav
              ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
              : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${fav ? 'fill-amber-400 text-amber-400' : ''}`} />
          <span className="hidden sm:inline">{fav ? 'Favorited' : 'Favorite'}</span>
        </button>

        <button
          onClick={handleCopy}
          aria-label={copied ? 'Link copied' : 'Copy link to this tool'}
          className={`${btn} ${
            copied
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy link'}</span>
        </button>

        <button
          onClick={handleShare}
          disabled={sharing === 'busy'}
          aria-label={sharing === 'done' ? 'Shared' : `Share ${title}`}
          className={`${btn} ${
            sharing === 'done'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
          } disabled:opacity-60`}
        >
          {sharing === 'busy' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : sharing === 'done' ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Share2 className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{sharing === 'done' ? 'Shared!' : 'Share'}</span>
        </button>

        <a
          href={reportHref}
          aria-label={`Report an issue with ${title}`}
          className={`${btn} bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Report issue</span>
        </a>
      </div>
    </div>
  );
}
