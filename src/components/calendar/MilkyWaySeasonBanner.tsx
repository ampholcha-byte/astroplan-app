'use client';

import { MilkyWaySeason } from '@/types';

interface MilkyWaySeasonBannerProps {
  season: MilkyWaySeason;
}

const STYLES: Record<
  MilkyWaySeason['level'],
  { container: string; title: string; text: string }
> = {
  peak: {
    container: 'bg-indigo-900/40 border-indigo-700/40',
    title: 'text-indigo-300',
    text: 'text-indigo-200/80',
  },
  shoulder: {
    container: 'bg-yellow-900/20 border-yellow-700/30',
    title: 'text-yellow-300',
    text: 'text-yellow-200/70',
  },
  off: {
    container: 'bg-slate-800/40 border-slate-700/40',
    title: 'text-slate-400',
    text: 'text-slate-500',
  },
};

export default function MilkyWaySeasonBanner({ season }: MilkyWaySeasonBannerProps) {
  const style = STYLES[season.level];

  let title: string;
  let detail: string;
  if (season.level === 'peak') {
    title = '🌌 Milky Way Season — Peak';
    detail = `${season.bestWindowDays} dark-moon nights with the galactic core visible this month`;
  } else if (season.level === 'shoulder') {
    title = '🌌 Milky Way Season — Shoulder';
    detail = `Core visible on ${season.visibleDays} night${season.visibleDays === 1 ? '' : 's'}, but bright moon limits the best windows`;
  } else {
    title = '🌌 Milky Way Season — Off · GC ขึ้นเฉพาะกลางวัน';
    detail = 'คืนเดือนมืด (moon ≤ 3) ยังถ่ายดาว / Orion / Andromeda ได้ดี — ดู ★ good nights ด้านล่าง';
  }

  return (
    <div className={`rounded-xl border px-3 py-2 mb-3 ${style.container}`}>
      <p className={`text-xs font-semibold ${style.title}`}>{title}</p>
      <p className={`text-[10px] mt-0.5 ${style.text}`}>{detail}</p>
    </div>
  );
}
