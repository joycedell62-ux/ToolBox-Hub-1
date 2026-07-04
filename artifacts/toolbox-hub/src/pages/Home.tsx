import React, { useState } from 'react';
import { Search, ShieldAlert, QrCode, FileText, Activity, Calendar, TrendingUp, Percent, Tag, CaseSensitive } from 'lucide-react';
import ToolCard from '../components/ToolCard';

const TOOLS = [
  {
    title: 'Password Generator',
    description: 'Create strong, secure passwords',
    icon: ShieldAlert,
    href: '/password-generator',
  },
  {
    title: 'QR Code Generator',
    description: 'Turn any URL or text into a QR code',
    icon: QrCode,
    href: '/qr-code-generator',
  },
  {
    title: 'Word Counter',
    description: 'Count words, characters, and sentences',
    icon: FileText,
    href: '/word-counter',
  },
  {
    title: 'BMI Calculator',
    description: 'Calculate your Body Mass Index',
    icon: Activity,
    href: '/bmi-calculator',
  },
  {
    title: 'Age Calculator',
    description: 'Find your exact age in years, months, days',
    icon: Calendar,
    href: '/age-calculator',
  },
  {
    title: 'Loan Calculator',
    description: 'Calculate monthly payments and total interest',
    icon: TrendingUp,
    href: '/loan-calculator',
  },
  {
    title: 'Percentage Calculator',
    description: 'Calculate percentages, changes, and portions',
    icon: Percent,
    href: '/percentage-calculator',
  },
  {
    title: 'Discount Calculator',
    description: 'Find the final price, savings, and tax on any deal',
    icon: Tag,
    href: '/discount-calculator',
  },
  {
    title: 'Text Case Converter',
    description: 'Convert text to uppercase, lowercase, title case, and more',
    icon: CaseSensitive,
    href: '/text-case-converter',
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = TOOLS.filter((tool) =>
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10">
      <section className="text-center space-y-6 max-w-2xl mx-auto py-4 md:py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          ToolBox Hub
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Free online tools for everyone. Simple, fast, and secure.
        </p>

        <div className="relative max-w-md mx-auto mt-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-4 bg-white border-none shadow-sm rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-md transition-all text-base"
          />
        </div>
      </section>

      <section>
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.href}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                href={tool.href}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border border-dashed">
            <p>No tools found matching "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 text-primary hover:underline font-medium"
            >
              Clear search
            </button>
          </div>
        )}
      </section>
    </div>
  );
}