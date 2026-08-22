'use client';

import { useState, ReactNode } from 'react';

interface GuideSectionProps {
  icon: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function GuideSection({ icon, title, subtitle, children }: GuideSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700/30 transition-colors"
      >
        <span className="text-xl shrink-0">{icon}</span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm text-slate-200 font-medium">{title}</span>
          {subtitle && (
            <span className="block text-[10px] text-slate-500 mt-0.5 truncate">{subtitle}</span>
          )}
        </span>
        <span className={`text-slate-500 text-lg transition-transform ${open ? 'rotate-180' : ''}`}>
          ⌄
        </span>
      </button>
      {open && (
        <div className="border-t border-slate-700/30 px-4 py-3 text-xs text-slate-300 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
