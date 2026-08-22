'use client';

import PageWrapper from '@/components/layout/PageWrapper';
import GuideContent from '@/components/planning/GuideContent';

export default function PlanPage() {
  return (
    <PageWrapper>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">📸 Photo Planning</h2>
        <p className="text-xs text-slate-500 mt-1">
          Guide สำหรับมือใหม่ — ใช้แอปนี้ยังไง + พื้นฐานการถ่าย Milky Way (กดแต่ละหัวข้อเพื่ออ่าน)
        </p>
      </div>
      <GuideContent />
    </PageWrapper>
  );
}
