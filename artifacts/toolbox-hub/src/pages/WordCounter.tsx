import React, { useState, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WordCounter() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    
    // Split by spaces, newlines, etc, and filter out empty strings
    const wordsArray = text.trim().split(/\s+/).filter(word => word.length > 0);
    const words = wordsArray.length;
    
    // Split by sentence ending punctuation followed by space or newline
    const sentences = text.split(/[.!?]+(?:\s+|$)/).filter(sentence => sentence.trim().length > 0).length;
    
    // Split by 2 or more newlines
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    // 200 words per minute average reading speed
    const readingTimeMins = Math.ceil(words / 200);

    return {
      words,
      chars,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingTime: `${readingTimeMins} min read`
    };
  }, [text]);

  const statCards = [
    { label: 'Words', value: stats.words },
    { label: 'Characters', value: stats.chars },
    { label: 'Characters (no spaces)', value: stats.charsNoSpaces },
    { label: 'Sentences', value: stats.sentences },
    { label: 'Paragraphs', value: stats.paragraphs },
    { label: 'Reading Time', value: stats.readingTime },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Word Counter</h1>
        <p className="text-muted-foreground">Count words, characters, sentences and estimate reading time</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col h-[500px]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <span className="text-sm font-semibold text-gray-700">Paste your text below</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setText('')}
            disabled={!text}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-3"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here..."
          className="flex-1 w-full p-6 resize-none focus:outline-none focus:ring-inset focus:ring-2 focus:ring-primary/20 text-base leading-relaxed"
        />
      </div>
    </div>
  );
}