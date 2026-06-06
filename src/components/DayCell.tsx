'use client';

import { DayData } from '@/types';
import PathGraphic from './PathGraphic';

interface DayCellProps {
  day: DayData;
  onClick: () => void;
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
  if (day.moonLevel <= 2 && day.cloudCoverPercentage < 30) return { label: '★★★', color: 'text-green-400' };
  if (day.moonLevel <= 4 && day.cloudCoverPercentage < 50) return { label: '★★', color: 'text-yellow-400' };
  if (day.moonLevel <= 6) return { label: '★', color: 'text-orange-400' };
  return null;
}

export default function DayCell({ day, onClick }: DayCellProps) {
  const isHidden = day.visibility === 'hidden';
  const bgColor = MOON_BG[day.moonLevel] || MOON_BG[1];
  const textColor = MOON_TEXT[day.moonLevel] || MOON_TEXT[1];
  const quality = getQualityLabel(day);

  return (
    <button
      type="button"
      className={`${bgColor} ${textColor} aspect-square flex flex-col items-center justify-between p-1 cursor-pointer hover:scale-105 hover:z-10 hover:shadow-lg hover:shadow-indigo-500/20 rounded-sm relative overflow-hidden ${isHidden ? 'opacity-40 grayscale-[30%]' : ''}`}
      onClick={onClick}
      aria-label={`Day ${day.date}, moon level ${day.moonLevel}, cloud ${day.cloudCoverPercentage}%`}
    >
      {/* Holiday triangle */}
      {day.isHoliday && (
        <div className="absolute top-0 left-0 w-0 h-0 border-t-[14px] border-t-red-500 border-r-[14px] border-r-transparent" />
      )}

      {/* Date number */}
      <span className="text-[11px] font-bold self-start">{day.date}</span>

      {/* Center info */}
      <div className="flex flex-col items-center gap-0.5 flex-1 justify-center">
        {/* Quality stars */}
        {quality && (
          <span className={`text-[10px] font-bold ${quality.color}`}>{quality.label}</span>
        )}

        {/* Galactic Center rise/set */}
        {day.galacticCenter && (
          <>
            <div className="flex items-center gap-0.5 text-[8px] leading-tight">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span>{day.galacticCenter.rise}</span>
            </div>
            <div className="flex items-center gap-0.5 text-[8px] leading-tight">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" />
              <span>{day.galacticCenter.set}</span>
            </div>
          </>
        )}

        {/* Cloud cover + source indicator */}
        <div className="flex items-center gap-0.5 text-[8px] opacity-70">
          <span>☁ {day.cloudCoverPercentage}%</span>
          {day.cloudSource === 'api' && (
            <span className="text-emerald-400" title="Live weather data">●</span>
          )}
        </div>
      </div>

      {/* Path graphic */}
      <PathGraphic />

      {/* Hidden overlay */}
      {isHidden && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-lg font-bold opacity-20">✕</span>
        </div>
      )}
    </button>
  );
}
