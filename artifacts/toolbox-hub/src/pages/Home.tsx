import React, { useState, useRef } from 'react';
import {
  Search, ShieldAlert, QrCode, FileText, Activity, Calendar,
  TrendingUp, Percent, Tag, CaseSensitive, Shuffle, X,
  Zap, Lock, Smartphone, Gift, ChevronRight, Award, ClipboardList, Receipt,
  // PDF Tools icons
  Layers, Scissors, Minimize2, FileCode, FileOutput, FileImage,
  Image, RotateCcw, Unlock, ShieldCheck,
  // Image Tools icons
  Maximize2, Crop, ArrowLeftRight, Images, Stamp,
  LayoutGrid, Pipette, Focus,
  // New tool icons
  Flame, Dumbbell, Baby, Heart, DollarSign, Landmark, Coins, Lightbulb,
  ShoppingBag, Utensils, CalendarDays, CheckSquare, ListTodo, Clipboard, Star,
  BookOpen, Replace, Filter, ArrowUpDown, StickyNote, FileText as FileText2,
  Code, Binary, Link2, Shield, Fingerprint,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import ToolCard from '../components/ToolCard';

// ─── Tool registry ────────────────────────────────────────────────────────────

type Category = 'Text Tools' | 'Calculators' | 'Utility Tools' | 'Developer Tools' | 'PDF Tools' | 'Image Tools' | 'Daily Life';

interface Tool {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  category: Category;
  popular?: boolean;
  isNew?: boolean;
}

const TOOLS: Tool[] = [
  {
    title: 'Password Generator',
    description: 'Create strong, secure passwords with custom length and character sets.',
    icon: ShieldAlert,
    href: '/password-generator',
    category: 'Utility Tools',
    popular: true,
  },
  {
    title: 'QR Code Generator',
    description: 'Turn any URL or text into a scannable QR code instantly.',
    icon: QrCode,
    href: '/qr-code-generator',
    category: 'Developer Tools',
    popular: true,
  },
  {
    title: 'Word Counter',
    description: 'Count words, characters, sentences, and reading time live.',
    icon: FileText,
    href: '/word-counter',
    category: 'Text Tools',
    popular: true,
  },
  {
    title: 'BMI Calculator',
    description: 'Calculate your Body Mass Index in metric or imperial units.',
    icon: Activity,
    href: '/bmi-calculator',
    category: 'Calculators',
    popular: true,
  },
  {
    title: 'Age Calculator',
    description: 'Find your exact age in years, months, and days with next birthday countdown.',
    icon: Calendar,
    href: '/age-calculator',
    category: 'Calculators',
  },
  {
    title: 'Loan Calculator',
    description: 'Calculate monthly payments, total interest, and an amortization schedule.',
    icon: TrendingUp,
    href: '/loan-calculator',
    category: 'Calculators',
  },
  {
    title: 'Percentage Calculator',
    description: 'Four percentage modes — portions, ratios, change, and decrease.',
    icon: Percent,
    href: '/percentage-calculator',
    category: 'Calculators',
  },
  {
    title: 'Discount Calculator',
    description: 'Find the final price, savings, and optional sales tax on any deal.',
    icon: Tag,
    href: '/discount-calculator',
    category: 'Calculators',
    isNew: true,
  },
  {
    title: 'Text Case Converter',
    description: 'Convert text to UPPERCASE, lowercase, Title Case, Sentence case, and more.',
    icon: CaseSensitive,
    href: '/text-case-converter',
    category: 'Text Tools',
    isNew: true,
  },
  {
    title: 'Random Number Generator',
    description: 'Generate random numbers within any range, with history and no-duplicate mode.',
    icon: Shuffle,
    href: '/random-number-generator',
    category: 'Utility Tools',
    isNew: true,
  },
  {
    title: 'Certificate Generator',
    description: 'Design professional certificates for courses, events, competitions, and more.',
    icon: Award,
    href: '/certificate-generator',
    category: 'Utility Tools',
    isNew: true,
  },
  {
    title: 'Resume Builder',
    description: 'Build a professional resume with 5 templates, live preview, and PDF download.',
    icon: ClipboardList,
    href: '/resume-builder',
    category: 'Utility Tools',
    isNew: true,
  },
  {
    title: 'Invoice Generator',
    description: 'Create professional invoices with 5 templates, live preview, and PDF export.',
    icon: Receipt,
    href: '/invoice-generator',
    category: 'Utility Tools',
    isNew: true,
  },
  // ── PDF Tools ──────────────────────────────────────────────────────────────
  {
    title: 'PDF Merge',
    description: 'Combine multiple PDF files into one — drag, reorder, and download.',
    icon: Layers,
    href: '/pdf-merge',
    category: 'PDF Tools',
    isNew: true,
  },
  {
    title: 'PDF Split',
    description: 'Extract pages or split a PDF into multiple files by range.',
    icon: Scissors,
    href: '/pdf-split',
    category: 'PDF Tools',
    isNew: true,
  },
  {
    title: 'PDF Compressor',
    description: 'Reduce PDF file size while keeping it readable — no server upload.',
    icon: Minimize2,
    href: '/pdf-compressor',
    category: 'PDF Tools',
    isNew: true,
  },
  {
    title: 'Word to PDF',
    description: 'Convert DOCX files to PDF with formatting preserved — in your browser.',
    icon: FileCode,
    href: '/word-to-pdf',
    category: 'PDF Tools',
    isNew: true,
  },
  {
    title: 'PDF to Word',
    description: 'Extract text from PDF and download as an editable Word document.',
    icon: FileOutput,
    href: '/pdf-to-word',
    category: 'PDF Tools',
    isNew: true,
  },
  {
    title: 'JPG to PDF',
    description: 'Combine one or more images into a single PDF — drag to reorder.',
    icon: FileImage,
    href: '/jpg-to-pdf',
    category: 'PDF Tools',
    isNew: true,
  },
  {
    title: 'PDF to JPG',
    description: 'Convert PDF pages into high-quality JPG images — download all as ZIP.',
    icon: Image,
    href: '/pdf-to-jpg',
    category: 'PDF Tools',
    isNew: true,
  },
  {
    title: 'Rotate PDF',
    description: 'Rotate selected or all PDF pages 90°, 180°, or 270° and download.',
    icon: RotateCcw,
    href: '/rotate-pdf',
    category: 'PDF Tools',
    isNew: true,
  },
  {
    title: 'Unlock PDF',
    description: 'Remove password protection from a PDF — you must know the password.',
    icon: Unlock,
    href: '/unlock-pdf',
    category: 'PDF Tools',
    isNew: true,
  },
  {
    title: 'Protect PDF',
    description: 'Add password protection and permissions to your PDF files.',
    icon: ShieldCheck,
    href: '/protect-pdf',
    category: 'PDF Tools',
    isNew: true,
  },
  // ── Image Tools ────────────────────────────────────────────────────────────
  {
    title: 'Image Compressor',
    description: 'Reduce image file size with adjustable compression — before & after preview.',
    icon: Minimize2,
    href: '/image-compressor',
    category: 'Image Tools',
    isNew: true,
  },
  {
    title: 'Image Resizer',
    description: 'Resize images by pixels, percentage, or social media presets.',
    icon: Maximize2,
    href: '/image-resizer',
    category: 'Image Tools',
    isNew: true,
  },
  {
    title: 'Image Cropper',
    description: 'Crop images with freeform or fixed aspect ratios — right in your browser.',
    icon: Crop,
    href: '/image-cropper',
    category: 'Image Tools',
    isNew: true,
  },
  {
    title: 'Image Converter',
    description: 'Convert images between JPG, PNG, WebP, and BMP formats — bulk supported.',
    icon: ArrowLeftRight,
    href: '/image-converter',
    category: 'Image Tools',
    isNew: true,
  },
  {
    title: 'Image to PDF',
    description: 'Combine multiple images into a professional PDF — drag to reorder.',
    icon: Images,
    href: '/image-to-pdf',
    category: 'Image Tools',
    isNew: true,
  },
  {
    title: 'Watermark Image',
    description: 'Add text or image watermarks with opacity, size, and position controls.',
    icon: Stamp,
    href: '/watermark-image',
    category: 'Image Tools',
    isNew: true,
  },
  {
    title: 'Photo Collage Maker',
    description: 'Create beautiful photo collages with multiple layouts and borders.',
    icon: LayoutGrid,
    href: '/photo-collage-maker',
    category: 'Image Tools',
    isNew: true,
  },
  {
    title: 'Color Picker',
    description: 'Pick colors from uploaded images — get HEX, RGB, HSL, and CMYK values.',
    icon: Pipette,
    href: '/color-picker',
    category: 'Image Tools',
    isNew: true,
  },
  {
    title: 'Blur Image',
    description: 'Blur an entire image or selected regions with adjustable intensity.',
    icon: Layers,
    href: '/blur-image',
    category: 'Image Tools',
    isNew: true,
  },
  {
    title: 'Sharpen Image',
    description: 'Enhance image sharpness with adjustable convolution enhancement.',
    icon: Focus,
    href: '/sharpen-image',
    category: 'Image Tools',
    isNew: true,
  },
  // ── Sprint 5 — Calculators ─────────────────────────────────────────────────
  {
    title: 'Calorie Calculator',
    description: 'Calculate your daily calorie needs using BMR, TDEE, and goal targets.',
    icon: Flame,
    href: '/calorie-calculator',
    category: 'Calculators',
    isNew: true,
  },
  {
    title: 'Body Fat Calculator',
    description: 'Estimate body fat percentage using the US Navy tape measurement method.',
    icon: Dumbbell,
    href: '/body-fat-calculator',
    category: 'Calculators',
    isNew: true,
  },
  {
    title: 'Pregnancy Calculator',
    description: 'Find your due date, trimester info, and days remaining from your LMP.',
    icon: Baby,
    href: '/pregnancy-calculator',
    category: 'Calculators',
    isNew: true,
  },
  {
    title: 'Ovulation Calculator',
    description: 'Find your fertile window and ovulation date from your last period.',
    icon: Heart,
    href: '/ovulation-calculator',
    category: 'Calculators',
    isNew: true,
  },
  {
    title: 'Salary Calculator',
    description: 'Convert between hourly, weekly, monthly, and annual salaries instantly.',
    icon: DollarSign,
    href: '/salary-calculator',
    category: 'Calculators',
    isNew: true,
  },
  {
    title: 'Tax Calculator',
    description: 'Estimate 2024 US federal income tax with bracket breakdown and effective rate.',
    icon: Landmark,
    href: '/tax-calculator',
    category: 'Calculators',
    isNew: true,
  },
  {
    title: 'Currency Converter',
    description: 'Convert between 30+ currencies with offline rates and comparison table.',
    icon: Coins,
    href: '/currency-converter',
    category: 'Calculators',
    isNew: true,
  },
  {
    title: 'Electricity Bill Calculator',
    description: 'Add appliances by wattage and hours to estimate your electricity cost.',
    icon: Lightbulb,
    href: '/electricity-bill-calculator',
    category: 'Calculators',
    isNew: true,
  },
  {
    title: 'Fuel Cost Calculator',
    description: 'Calculate trip fuel cost in imperial or metric — per mile and per km.',
    icon: Zap,
    href: '/fuel-cost-calculator',
    category: 'Calculators',
    isNew: true,
  },
  // ── Sprint 5 — Daily Life ──────────────────────────────────────────────────
  {
    title: 'Grocery List',
    description: 'Organise your grocery list by aisle, check off items, and print it.',
    icon: ShoppingBag,
    href: '/grocery-list',
    category: 'Daily Life',
    isNew: true,
  },
  {
    title: 'Meal Planner',
    description: 'Plan breakfast, lunch, dinner, and snacks across your whole week.',
    icon: Utensils,
    href: '/meal-planner',
    category: 'Daily Life',
    isNew: true,
  },
  {
    title: 'Weekly Planner',
    description: 'Plan your week with prioritised task lists for each day.',
    icon: CalendarDays,
    href: '/weekly-planner',
    category: 'Daily Life',
    isNew: true,
  },
  {
    title: 'Monthly Planner',
    description: 'Full calendar grid with click-to-add notes on any day.',
    icon: Calendar,
    href: '/monthly-planner',
    category: 'Daily Life',
    isNew: true,
  },
  {
    title: 'Daily To-Do List',
    description: 'Track tasks with High/Medium/Low priority, filter, and clear completed.',
    icon: CheckSquare,
    href: '/todo-list',
    category: 'Daily Life',
    isNew: true,
    popular: true,
  },
  {
    title: 'Shopping List',
    description: 'Add items with quantities and prices, see your estimated total.',
    icon: ListTodo,
    href: '/shopping-list',
    category: 'Daily Life',
    isNew: true,
  },
  {
    title: 'Chore Chart Generator',
    description: 'Assign weekly chores to family members and track daily completion.',
    icon: Clipboard,
    href: '/chore-chart',
    category: 'Daily Life',
    isNew: true,
  },
  {
    title: 'Birthday Reminder',
    description: 'Track upcoming birthdays with days-until countdown — never forget one.',
    icon: Gift,
    href: '/birthday-reminder',
    category: 'Daily Life',
    isNew: true,
  },
  {
    title: 'Anniversary Reminder',
    description: 'Track wedding anniversaries and milestones with years elapsed.',
    icon: Heart,
    href: '/anniversary-reminder',
    category: 'Daily Life',
    isNew: true,
  },
  {
    title: 'Gift Idea Generator',
    description: 'Get curated gift ideas by age group, occasion, and budget.',
    icon: Star,
    href: '/gift-idea-generator',
    category: 'Daily Life',
    isNew: true,
  },
  // ── V2 Text Tools ──────────────────────────────────────────────────────────
  {
    title: 'Reading Time Calculator',
    description: 'Paste text to get word count, reading time, speaking time, and stats.',
    icon: BookOpen,
    href: '/reading-time-calculator',
    category: 'Text Tools',
    isNew: true,
  },
  {
    title: 'Find & Replace',
    description: 'Find and replace words or patterns in any text — with regex support.',
    icon: Replace,
    href: '/find-replace',
    category: 'Text Tools',
    isNew: true,
  },
  {
    title: 'Remove Duplicate Lines',
    description: 'Paste any list and remove duplicate lines instantly — with sort and trim options.',
    icon: Filter,
    href: '/remove-duplicates',
    category: 'Text Tools',
    isNew: true,
  },
  {
    title: 'Text Sorter',
    description: 'Sort lines A→Z, Z→A, by length, or randomly with case and numeric options.',
    icon: ArrowUpDown,
    href: '/text-sorter',
    category: 'Text Tools',
    isNew: true,
  },
  {
    title: 'Notes Pad',
    description: 'A fast multi-note notepad with colour coding, auto-save, and download.',
    icon: StickyNote,
    href: '/notes-pad',
    category: 'Text Tools',
    isNew: true,
  },
  {
    title: 'Markdown Editor',
    description: 'Write Markdown with live preview, auto-save, and export as .md or .html.',
    icon: FileText2,
    href: '/markdown-editor',
    category: 'Text Tools',
    isNew: true,
  },
  // ── V2 Developer Tools ─────────────────────────────────────────────────────
  {
    title: 'JSON Formatter',
    description: 'Format, minify, and validate JSON — with 2 or 4 space indent options.',
    icon: Code,
    href: '/json-formatter',
    category: 'Developer Tools',
    isNew: true,
  },
  {
    title: 'Base64 Encoder / Decoder',
    description: 'Encode and decode text to Base64 — with URL-safe mode support.',
    icon: Binary,
    href: '/base64',
    category: 'Developer Tools',
    isNew: true,
  },
  {
    title: 'URL Encoder / Decoder',
    description: 'Percent-encode and decode URLs — full URL or component mode.',
    icon: Link2,
    href: '/url-encoder',
    category: 'Developer Tools',
    isNew: true,
  },
  {
    title: 'Hash Generator',
    description: 'Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes using Web Crypto API.',
    icon: Shield,
    href: '/hash-generator',
    category: 'Developer Tools',
    isNew: true,
  },
  {
    title: 'UUID Generator',
    description: 'Generate up to 100 random v4 UUIDs with uppercase and curly-brace options.',
    icon: Fingerprint,
    href: '/uuid-generator',
    category: 'Developer Tools',
    isNew: true,
  },
];

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES: { name: Category; emoji: string; color: string; bg: string; border: string }[] = [
  { name: 'Text Tools',      emoji: '📄', color: 'text-violet-700', bg: 'bg-violet-50',  border: 'border-violet-100' },
  { name: 'Calculators',     emoji: '🧮', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { name: 'Daily Life',      emoji: '🏠', color: 'text-teal-700',   bg: 'bg-teal-50',    border: 'border-teal-100' },
  { name: 'Utility Tools',   emoji: '🔧', color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-100' },
  { name: 'Developer Tools', emoji: '💻', color: 'text-orange-700', bg: 'bg-orange-50',  border: 'border-orange-100' },
  { name: 'PDF Tools',       emoji: '📑', color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-100' },
  { name: 'Image Tools',     emoji: '🖼️', color: 'text-pink-700',   bg: 'bg-pink-50',    border: 'border-pink-100' },
];

// ─── Hero background dot pattern ──────────────────────────────────────────────

const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='white' fill-opacity='0.08'/%3E%3C/svg%3E")`;

// ─── Stat items ───────────────────────────────────────────────────────────────

const STATS = [
  { icon: Gift,       label: '63+ Free Tools',  sub: 'Always free, no limits' },
  { icon: Lock,       label: 'No Sign-up',       sub: 'Use instantly, no account' },
  { icon: Zap,        label: 'Instant Results',  sub: 'Everything runs in browser' },
  { icon: Smartphone, label: 'Mobile Ready',     sub: 'Works on any device' },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const toolsSectionRef = useRef<HTMLElement>(null);

  const isSearching = searchQuery.trim().length > 0;

  const filteredTools = isSearching
    ? TOOLS.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const popularTools  = TOOLS.filter((t) => t.popular);
  const recentTools   = TOOLS.filter((t) => t.isNew);

  const scrollToTools = () => {
    toolsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col">

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #3b82f6 100%)',
        }}
      >
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: DOT_PATTERN }}
          aria-hidden="true"
        />
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(147,197,253,0.15) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-blue-100 text-xs font-semibold px-4 py-2 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
            63+ Free Tools Available — No sign-up required
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-75">
            ToolBox&nbsp;
            <span
              style={{
                background: 'linear-gradient(90deg, #93c5fd, #c4b5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Hub
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
            Free online tools to make everyday tasks faster and easier.
            <br className="hidden sm:block" />
            No downloads, no accounts — just open and use.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              id="hero-search"
              aria-label="Search tools"
              placeholder="Search tools — try &quot;password&quot; or &quot;calculator&quot;…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-13 pr-12 py-4 bg-white rounded-2xl text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-4 focus:ring-blue-300/50 shadow-2xl text-base transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-r-2xl"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* CTAs */}
          {!isSearching && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <button
                onClick={scrollToTools}
                className="px-7 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50
                           shadow-lg shadow-black/10 transition-all duration-200 hover:scale-105 active:scale-100 text-sm"
              >
                Get Started
              </button>
              <button
                onClick={scrollToTools}
                className="px-7 py-3.5 bg-white/10 backdrop-blur-sm border border-white/25 text-white font-semibold
                           rounded-xl hover:bg-white/20 transition-all duration-200 text-sm"
              >
                Browse All Tools
              </button>
            </div>
          )}
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none" aria-hidden="true">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40Z" fill="hsl(210 40% 98%)" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SEARCH RESULTS (overlay when searching)
      ══════════════════════════════════════════════════════════ */}
      {isSearching && (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10">
          {filteredTools.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-5">
                {filteredTools.length} result{filteredTools.length !== 1 ? 's' : ''} for&nbsp;
                <strong className="text-gray-800">"{searchQuery}"</strong>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTools.map((t) => (
                  <ToolCard
                    key={t.href}
                    title={t.title}
                    description={t.description}
                    icon={t.icon}
                    href={t.href}
                    badge={t.popular ? 'Popular' : t.isNew ? 'New' : undefined}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-gray-600 font-medium mb-1">No tools found for "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground mb-4">Try a different keyword like "word", "BMI", or "QR"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:underline font-medium text-sm"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          BODY — hidden while searching
      ══════════════════════════════════════════════════════════ */}
      {!isSearching && (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20 space-y-20">

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10">
            {STATS.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-start gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-100 transition-all duration-200"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm leading-tight">{label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Popular Tools ── */}
          <section>
            <SectionHeader
              title="Popular Tools"
              subtitle="The tools people reach for most"
              emoji="⭐"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
              {popularTools.map((t) => (
                <ToolCard
                  key={t.href}
                  title={t.title}
                  description={t.description}
                  icon={t.icon}
                  href={t.href}
                  badge="Popular"
                  size="featured"
                />
              ))}
            </div>
          </section>

          {/* ── Recently Added ── */}
          <section>
            <SectionHeader
              title="Recently Added"
              subtitle="Fresh tools just landed"
              emoji="✨"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
              {recentTools.map((t) => (
                <ToolCard
                  key={t.href}
                  title={t.title}
                  description={t.description}
                  icon={t.icon}
                  href={t.href}
                  badge="New"
                />
              ))}
            </div>
          </section>

          {/* ── Browse by Category ── */}
          <section ref={toolsSectionRef} id="tools">
            <SectionHeader
              title="Browse by Category"
              subtitle="All tools, organised for you"
              emoji="🗂️"
            />

            <div className="space-y-14 mt-8">
              {CATEGORIES.map((cat) => {
                const tools = TOOLS.filter((t) => t.category === cat.name);
                if (!tools.length) return null;
                return (
                  <div key={cat.name}>
                    {/* Category pill header */}
                    <div className="flex items-center gap-3 mb-5">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${cat.color} ${cat.bg} ${cat.border}`}
                      >
                        <span aria-hidden="true">{cat.emoji}</span>
                        {cat.name}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {tools.length} tool{tools.length !== 1 ? 's' : ''}
                      </span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {tools.map((t) => (
                        <ToolCard
                          key={t.href}
                          title={t.title}
                          description={t.description}
                          icon={t.icon}
                          href={t.href}
                          badge={t.popular ? 'Popular' : t.isNew ? 'New' : undefined}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Footer CTA ── */}
          <section className="relative overflow-hidden rounded-3xl"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: DOT_PATTERN }}
              aria-hidden="true"
            />
            <div className="relative text-center px-6 py-14 space-y-5">
              <p className="text-3xl font-extrabold text-white">More tools coming soon</p>
              <p className="text-blue-200 text-base max-w-md mx-auto">
                We're constantly adding new free tools. Bookmark this page so you don't miss anything.
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-300 text-sm font-medium">
                <ChevronRight className="w-4 h-4" />
                All tools are free forever
              </div>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, emoji }: { title: string; subtitle: string; emoji: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl" aria-hidden="true">{emoji}</span>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

