'use client';

import TabBar from './TabBar';

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
}

export default function PageWrapper({ children, showHeader = true }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
      {/* Background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      </div>

      {/* Desktop top nav */}
      {showHeader && (
        <header className="hidden sm:flex items-center justify-between px-6 py-4 relative z-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ✦ AstroPlan
            </h1>
            <p className="text-xs text-slate-500">Milky Way Photography Planner</p>
          </div>
          <TabBar />
        </header>
      )}

      {/* Mobile header */}
      {showHeader && (
        <header className="sm:hidden flex items-center justify-between px-4 py-3 relative z-10">
          <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ✦ AstroPlan
          </h1>
          <span className="text-xs text-slate-500">Milky Way Planner</span>
        </header>
      )}

      {/* Main content */}
      <main className="relative z-10 flex-1 w-full max-w-md mx-auto px-4 py-4 sm:py-6 pb-24 sm:pb-6">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <TabBar />
    </div>
  );
}
