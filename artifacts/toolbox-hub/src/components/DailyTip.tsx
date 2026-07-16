import React from 'react';
import { Lightbulb } from 'lucide-react';

const TIPS = [
  'Compressing PDFs before emailing saves upload time and inbox space.',
  'Use the QR Code Generator to share links instantly at meetings or events.',
  'The Password Generator creates passwords up to 64 characters long — the longer the safer.',
  'Your recently-used tools are saved automatically. Find them at the top of the home page.',
  'Star any tool with ⭐ to add it to your Favourites for one-click access later.',
  'Use ⌘K or "/" to open the search bar from any page without scrolling.',
  'The Image Compressor can reduce file sizes by up to 80% with no visible quality loss.',
  'Merge multiple PDFs in one go with the PDF Merge tool — unlimited pages.',
  'The Resume Builder generates a print-ready PDF — no design skills needed.',
  'Use the Word Counter to track your progress while writing essays or blog posts.',
  'The QR Scanner works entirely in your browser — no app install required.',
  'The Color Palette Generator is great for finding complementary brand colors.',
  'All tools work offline after the first page load — no internet needed.',
  'Use the Invoice Generator to produce professional invoices in under 2 minutes.',
  'The Flyer Generator creates print-ready A4 flyers in seconds.',
  'Save your favorite tools with ⭐ and access them instantly on your next visit.',
  'The Essay Generator works for argumentative, expository, and descriptive styles.',
  'The Font Pairing Generator suggests Google Font combos that work beautifully together.',
  'Use the BMI Calculator to track health goals alongside your daily productivity.',
  'The Script Generator works for YouTube, podcasts, short films, and stage plays.',
  'The Cover Letter Generator adapts tone for Formal, Modern, and Creative roles.',
  'The Loan Calculator helps you understand total interest before you sign anything.',
  'Use the Brand Name Generator to test multiple naming directions quickly.',
  'The Barcode Generator supports QR, EAN-13, UPC-A, and more — downloadable as SVG.',
  'The Social Media Brand Kit exports avatar, cover, and post template as PNG.',
  'Use the Slogan Generator to A/B test different brand voices and pitches.',
  'The File Checksum Generator verifies file integrity for downloads and backups.',
  'Use the Random Fact Generator to spark creativity during brainstorming sessions.',
  'The To-Do List saves automatically in your browser — nothing gets lost on refresh.',
  'Export any tool result to PDF or PNG to keep a record offline.',
];

export default function DailyTip() {
  const idx = Math.floor(Date.now() / 86_400_000) % TIPS.length;
  const tip = TIPS[idx];

  return (
    <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl px-4 py-3.5">
      <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-amber-400 flex items-center justify-center mt-0.5">
        <Lightbulb className="w-3.5 h-3.5 text-white" />
      </div>
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
          💡 Did you know?
        </p>
        <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">{tip}</p>
      </div>
    </div>
  );
}
