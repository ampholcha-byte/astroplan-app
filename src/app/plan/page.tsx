'use client';

import PageWrapper from '@/components/layout/PageWrapper';

export default function PlanPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">📸</span>
        <h2 className="text-xl font-bold text-white mb-2">Photo Planning</h2>
        <p className="text-sm text-slate-400 max-w-xs">
          Plan your Milky Way shooting sessions. Multi-day planning, export, and sharing — coming soon.
        </p>
      </div>
    </PageWrapper>
  );
}
