import { useState, useMemo } from 'react';
import { Trash2, Copy, Check, AlignLeft, Clock, FileText, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

function computeStats(text: string) {
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+(?:\s|$)/).filter(s => s.trim().length > 0).length;
  const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

  const mins = words / 200;
  let readingTime: string;
  if (words === 0) {
    readingTime = '—';
  } else if (mins < 0.5) {
    readingTime = '< 1 min';
  } else {
    readingTime = `${Math.ceil(mins)} min`;
  }

  return { words, chars, charsNoSpaces, sentences, paragraphs, readingTime };
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  highlight?: boolean;
}

function StatCard({ label, value, icon, highlight }: StatCardProps) {
  return (
    <div
      className={`rounded-xl p-4 border flex flex-col gap-2 transition-all ${
        highlight
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highlight ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
        {icon}
      </div>
      <div className={`text-2xl font-bold tracking-tight ${highlight ? 'text-blue-700' : 'text-gray-900'}`}>
        {value}
      </div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">
        {label}
      </div>
    </div>
  );
}

export default function WordCounter() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const stats = useMemo(() => computeStats(text), [text]);
  const hasText = text.length > 0;

  const handleCopy = async () => {
    if (!hasText) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Text copied to clipboard.', duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Please try selecting and copying manually.', variant: 'destructive' });
    }
  };

  const handleClear = () => {
    setText('');
    setCopied(false);
  };

  return (
    <div className="max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Word Counter</h1>
        <p className="text-muted-foreground">Count words, characters, sentences, and estimate reading time</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-6">

        {/* Stats grid — 2 cols on mobile, 3 on sm+, 6 on lg+ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            label="Words"
            value={stats.words.toLocaleString()}
            icon={<AlignLeft className="w-4 h-4" />}
            highlight
          />
          <StatCard
            label="Characters"
            value={stats.chars.toLocaleString()}
            icon={<FileText className="w-4 h-4" />}
          />
          <StatCard
            label="No Spaces"
            value={stats.charsNoSpaces.toLocaleString()}
            icon={<Minus className="w-4 h-4" />}
          />
          <StatCard
            label="Sentences"
            value={stats.sentences.toLocaleString()}
            icon={<FileText className="w-4 h-4" />}
          />
          <StatCard
            label="Paragraphs"
            value={stats.paragraphs.toLocaleString()}
            icon={<AlignLeft className="w-4 h-4" />}
          />
          <StatCard
            label="Reading Time"
            value={stats.readingTime}
            icon={<Clock className="w-4 h-4" />}
            highlight
          />
        </div>

        {/* Textarea — styled to match the blue-50 output panel of the other tools */}
        <div className="rounded-xl border border-blue-100 overflow-hidden bg-blue-50/40">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-blue-50/60">
            <span className="text-sm font-semibold text-gray-700">
              {hasText ? `${stats.words.toLocaleString()} word${stats.words !== 1 ? 's' : ''}` : 'Your text'}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!hasText}
                className="gap-1.5 h-8 text-xs hover:bg-blue-100 hover:text-blue-700 hover:border-blue-200"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Text'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={!hasText}
                className="gap-1.5 h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </Button>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here…"
            className="w-full h-64 md:h-80 p-5 resize-none bg-transparent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-200 text-base leading-relaxed text-gray-800 placeholder:text-gray-400"
            spellCheck
          />
        </div>

        {/* Footer hint */}
        <p className="text-xs text-center text-muted-foreground">
          Reading time estimated at 200 words per minute
        </p>
      </div>
    </div>
  );
}
