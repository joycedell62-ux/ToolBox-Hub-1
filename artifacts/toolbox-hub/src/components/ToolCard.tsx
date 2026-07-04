import React from 'react';
import { Link } from 'wouter';
import { LucideIcon } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

export default function ToolCard({ title, description, icon: Icon, href }: ToolCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <div className="bg-card h-full p-6 rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/30 flex flex-col">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-lg text-card-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mt-auto">
          {description}
        </p>
      </div>
    </Link>
  );
}