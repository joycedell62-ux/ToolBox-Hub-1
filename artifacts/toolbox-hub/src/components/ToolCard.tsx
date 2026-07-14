import React from 'react';
import { Link } from 'wouter';
import { LucideIcon, ArrowRight, Star } from 'lucide-react';
import { useFavorites } from '../lib/toolPrefs';

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  badge?: 'Popular' | 'New';
  size?: 'default' | 'featured';
}

export default function ToolCard({
  title,
  description,
  icon: Icon,
  href,
  badge,
  size = 'default',
}: ToolCardProps) {
  const isFeatured = size === 'featured';
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(href);

  return (
    <div className="group relative block h-full">
      <div
        className={`relative bg-white h-full rounded-2xl border border-gray-100 transition-all duration-300 ease-out
          group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-blue-100/60 group-hover:border-blue-200
          group-active:translate-y-0 group-active:shadow-md
          ${isFeatured ? 'p-7' : 'p-6'}
          shadow-sm flex flex-col overflow-hidden`}
      >
        {/* Stretched link — covers the whole card without nesting the star button */}
        <Link
          href={href}
          aria-label={`Open ${title}`}
          className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        />
        {/* Subtle gradient shine on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/40 group-hover:to-indigo-50/20 transition-all duration-300 rounded-2xl pointer-events-none" />

        {/* Badge + favorite star (above the stretched link) */}
        <div className="absolute top-4 right-4 z-[2] flex items-center gap-1.5">
          {badge && (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full
                ${badge === 'Popular'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
                }`}
            >
              {badge === 'Popular' ? '★ Popular' : '✦ New'}
            </span>
          )}
          <button
            aria-label={fav ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
            aria-pressed={fav}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(href);
            }}
            className={`p-1 rounded-md transition-colors ${
              fav ? 'text-amber-400 hover:text-amber-500' : 'text-gray-300 hover:text-amber-400'
            }`}
          >
            <Star className={`w-4 h-4 ${fav ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Icon */}
        <div
          className={`flex items-center justify-center rounded-xl mb-5 transition-all duration-300
            group-hover:scale-110 group-hover:bg-blue-600 group-hover:shadow-lg group-hover:shadow-blue-200
            bg-blue-50 text-blue-600
            ${isFeatured ? 'w-14 h-14' : 'w-12 h-12'}`}
        >
          <Icon className={`transition-colors duration-300 group-hover:text-white ${isFeatured ? 'w-7 h-7' : 'w-6 h-6'}`} />
        </div>

        {/* Text */}
        <h3
          className={`font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-200
            ${isFeatured ? 'text-xl' : 'text-base'}`}
        >
          {title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed flex-1">{description}</p>

        {/* Arrow */}
        <div className="mt-5 flex items-center gap-1 text-blue-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1">
          Open tool <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
