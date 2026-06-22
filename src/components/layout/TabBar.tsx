'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Calendar', icon: '📅' },
  { href: '/plan', label: 'Plan', icon: '📸' },
  { href: '/map', label: 'Map', icon: '🗺' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function TabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop: top nav */}
      <nav className="hidden sm:flex items-center gap-1 bg-slate-800/80 backdrop-blur-sm rounded-full px-2 py-1.5 border border-slate-700/50">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive(tab.href)
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </nav>

      {/* Mobile: bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-[60px] ${
                isActive(tab.href)
                  ? 'text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
