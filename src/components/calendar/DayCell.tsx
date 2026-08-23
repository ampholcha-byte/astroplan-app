'use client';

import { DayData } from '@/types';

interface DayCellProps {
  day: DayData;
  onClick: () => void;
  isToday?: boolean;
}

// Moon level → background gradient
// Level 1 = คืนมืดสุด (New Moon) → พื้นหลังดำ/เทาเข้ม = ท้องฟ้ามืด ดีที่สุดสำหรับถ่ายภาพ
// Level 10 = คืนสว่างสุด (Full Moon) → พื้นหลังเหลือง/ทอง = แสงจันทร์สว่าง
const MOON_BG: Record<number, string> = {
  1:  'bg-gradient-to-br from-gray-900 to-black',
  2:  'bg-gradient-to-br from-slate-800 to-gray-900',
  3:  'bg-gradient-to-br from-slate-700 to-slate-900',
  4:  'bg-gradient-to-br from-slate-600 to-indigo-950',
  5:  'bg-gradient-to-br from-indigo-900 to-purple-950',
  6:  'bg-gradient-to-br from-purple-800 to-fuchsia-950',
  7:  'bg-gradient-to-br from-fuchsia-700 to-amber-900',
  8:  'bg-gradient-to-br from-amber-600 to-yellow-800',
  9:  'bg-gradient-to-br from-yellow-500 to-amber-600',
  10: 'bg-gradient-to-br from-yellow-300 to-amber-500',
};

const MOON_TEXT: Record<number, string> = {
  1: 'text-gray-100',
  2: 'text-gray-100',
  3: 'text-gray-100',
  4: 'text-gray-100',
  5: 'text-gray-100',
  6: 'text-gray-100',
  7: 'text-gray-100',
  8: 'text-gray-900',
  9: 'text-gray-900',
  10: 'text-gray-900',
};

// Shooting quality label
function getQualityLabel(day: DayData): { label: string; color: string } | null {
  if (day.visibility === 'hidden') return null;
  // Can't rate quality without cloud data — only rate if we have API data
  if (day.cloudCoverPercentage === null) {
    if (day.moonLevel <= 4) return { label: '★', color: 'text-slate-400' };
    return null;
  }
  if (day.moonLevel <= 2 && day.cloudCoverPercentage < 30) return { label: '★★★', color: 'text-green-400' };
  if (day.moonLevel <= 4 && day.cloudCoverPercentage < 50) return { label: '★★', color: 'text-yellow-400' };
  if (day.moonLevel <= 6) return { label: '★', color: 'text-orange-400' };
  return null;
}

/** Compass direction of the GC at the hour closest to a "HH:MM" night time. */
function gcDirectionAt(day: DayData, time: string): string {
  if (!day.gcPositions) return '';
  const toNightHours = (t: string) => {
    const [h] = t.split(':').map(Number);
    return h < 12 ? h + 24 : h;
  };
  const target = toNightHours(time);
  let best = day.gcPositions[0];
  let bestDiff = Infinity;
  for (const p of day.gcPositions) {
    const diff = Math.abs(toNightHours(p.time) - target);
    if (diff < bestDiff) {
      best = p;
      bestDiff = diff;
    }
  }
  return best.altitude >= 0 ? best.direction : '';
}

export default function DayCell({ day, onClick, isToday }: DayCellProps) {
  const isHidden = day.visibility === 'hidden';
  const isOffSeason = !isHidden && !day.galacticCenter;
  const bgColor = MOON_BG[day.moonLevel] || MOON_BG[1];
  const textColor = MOON_TEXT[day.moonLevel] || MOON_TEXT[1];
  const quality = getQualityLabel(day);
  const riseDir = day.galacticCenter ? gcDirectionAt(day, day.galacticCenter.rise) : '';
  const setDir = day.galacticCenter ? gcDirectionAt(day, day.galacticCenter.set) : '';

  return (
    <button
      type="button"
      className={`${bgColor} ${textColor} aspect-[5/6] flex flex-col items-center justify-between px-0.5 py-1 cursor-pointer hover:scale-105 hover:z-10 hover:shadow-lg hover:shadow-indigo-500/20 rounded-sm relative overflow-hidden ${isHidden ? 'opacity-40 grayscale-[30%]' : ''} ${isToday ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900 z-10' : ''}`}
      onClick={onClick}
      aria-label={`Day ${day.date}, moon level ${day.moonLevel}, cloud ${day.cloudCoverPercentage !== null ? day.cloudCoverPercentage + '%' : 'no data'}${isToday ? ' (today)' : ''}`}
    >
      {/* Date number */}
      <span className="text-[10px] font-bold self-start leading-none">{day.date}</span>

      {/* Quality stars — top right (replaces old indigo dot) */}
      {quality && (
        <span className={`absolute top-0.5 right-0.5 text-[8px] font-bold leading-none ${quality.color}`}>{quality.label}</span>
      )}

      {/* Center info */}
      <div className="flex flex-col items-center gap-[1px] flex-1 justify-center">
        {/* Galactic Center rise/set — clamped to Astronomical Night, with compass direction */}
        {day.galacticCenter && (
          <>
            <div className="flex items-center gap-[2px] text-[7px] leading-none whitespace-nowrap" title="GC visible (dark night) — face this direction">
              <span className="inline-block w-1 h-1 rounded-full bg-emerald-400" />
              <span>{riseDir} {day.galacticCenter.rise}</span>
            </div>
            <div className="flex items-center gap-[2px] text-[7px] leading-none whitespace-nowrap" title="GC window ends (sets or night ends)">
              <span className="inline-block w-1 h-1 rounded-full bg-rose-400" />
              <span>{setDir} {day.galacticCenter.set}</span>
            </div>
          </>
        )}

        {/* Off-season: GC rises only in daylight — faint ✕ so the cell explains itself */}
        {isOffSeason && (
          <span
            className="text-[9px] leading-none text-slate-500/60 select-none"
            title="GC ขึ้นเฉพาะกลางวันช่วงนี้ — คืนเดือนมืดยังถ่ายดาวได้"
          >
            ✕
          </span>
        )}

        {/* Cloud cover + source indicator */}
        <div className="flex items-center gap-[2px] text-[7px] leading-none opacity-70 whitespace-nowrap">
          {day.cloudCoverPercentage !== null ? (
            <>
              <span>☁{day.cloudCoverPercentage}%</span>
              {day.cloudSource === 'api' && (
                <span className="text-emerald-400" title="Live weather data">●</span>
              )}
            </>
          ) : (
            <span className="text-slate-500">☁—</span>
          )}
        </div>
      </div>

      {/* Hidden overlay */}
      {isHidden && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-lg font-bold opacity-20">✕</span>
        </div>
      )}
    </button>
  );
}
