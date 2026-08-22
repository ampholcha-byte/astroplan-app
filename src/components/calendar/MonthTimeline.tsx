'use client';

import { DayData } from '@/types';

interface MonthTimelineProps {
  days: DayData[];
  onDayClick: (day: DayData) => void;
}

const START_H = 18;
const END_H = 30;
const W = 300;
const BAR_H = 12;

const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** "HH:MM" → hours on the 18–30 night domain. */
function toDomainHours(t: string): number | null {
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h)) return null;
  let hours = h + m / 60;
  if (hours < 12) hours += 24;
  return Math.min(Math.max(hours, START_H), END_H);
}

function x(hours: number): number {
  return ((hours - START_H) / (END_H - START_H)) * W;
}

function windowDuration(rise: string, set: string): string {
  const parse = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    let hours = h + m / 60;
    if (hours < 12) hours += 24;
    return hours;
  };
  const dur = parse(set) - parse(rise);
  if (dur <= 0) return '—';
  const h = Math.floor(dur);
  const m = Math.round((dur - h) * 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function MonthTimeline({ days, onDayClick }: MonthTimelineProps) {
  // one row per night of the current month (exclude grid spillover days)
  const monthPrefix = days.length > 0 ? days[Math.floor(days.length / 2)].id.slice(0, 7) : '';
  const nights = days.filter((d) => d.id.startsWith(monthPrefix));

  return (
    <div className="mb-4">
      {/* hour scale header */}
      <div className="flex items-center gap-2 mb-1">
        <span className="w-12 shrink-0" />
        <div className="flex-1 relative h-3 text-[8px] text-slate-600">
          {[18, 20, 22, 24, 26, 28, 30].map((h) => (
            <span
              key={h}
              className="absolute -translate-x-1/2"
              style={{ left: `${((h - START_H) / (END_H - START_H)) * 100}%` }}
            >
              {String(h % 24).padStart(2, '0')}
            </span>
          ))}
        </div>
        <span className="w-12 shrink-0 text-right text-[8px] text-slate-600">GC</span>
      </div>

      <div className="space-y-[3px]">
        {nights.map((day) => {
          const nightStart = day.sunMoon ? toDomainHours(day.sunMoon.nightStart) : null;
          const nightEnd = day.sunMoon ? toDomainHours(day.sunMoon.astronomicalDawn) : null;
          const moonrise = day.sunMoon?.moonrise ? toDomainHours(day.sunMoon.moonrise) : null;
          const moonset = day.sunMoon?.moonset ? toDomainHours(day.sunMoon.moonset) : null;
          const gcFrom = day.galacticCenter ? toDomainHours(day.galacticCenter.rise) : null;
          const gcTo = day.galacticCenter ? toDomainHours(day.galacticCenter.set) : null;
          const isOffSeason = !day.galacticCenter && day.visibility === 'visible';

          return (
            <button
              key={day.id}
              onClick={() => onDayClick(day)}
              className="w-full flex items-center gap-2 group"
              aria-label={`Night of ${day.id}, moon level ${day.moonLevel}${day.galacticCenter ? `, GC window ${day.galacticCenter.rise} to ${day.galacticCenter.set}` : ', GC off-season'}`}
            >
              {/* date label */}
              <span className="w-12 shrink-0 text-left text-[9px] text-slate-400 group-hover:text-slate-200 truncate">
                {DOW[new Date(day.id).getDay()]} {day.date}
              </span>

              {/* night bar */}
              <svg
                viewBox={`0 0 ${W} ${BAR_H}`}
                className="flex-1 h-3 rounded-sm overflow-hidden bg-slate-800/80"
                preserveAspectRatio="none"
              >
                {/* astronomical night */}
                {nightStart !== null && nightEnd !== null && (
                  <rect x={x(nightStart)} width={x(nightEnd) - x(nightStart)} y={0} height={BAR_H} className="fill-indigo-900/80" />
                )}
                {/* moon above horizon */}
                {moonrise !== null && moonset !== null && (
                  <rect x={x(moonrise)} width={x(moonset) - x(moonrise)} y={0} height={BAR_H} className="fill-yellow-500/30" />
                )}
                {/* GC shooting window */}
                {gcFrom !== null && gcTo !== null && (
                  <rect x={x(gcFrom)} width={x(gcTo) - x(gcFrom)} y={0} height={BAR_H} className="fill-emerald-400" />
                )}
                {/* off-season marker */}
                {isOffSeason && (
                  <text x={W / 2} y={BAR_H - 2.5} textAnchor="middle" className="fill-slate-600" fontSize={8}>
                    ✕ GC off-season
                  </text>
                )}
              </svg>

              {/* duration */}
              <span className="w-12 shrink-0 text-right text-[9px]">
                {day.galacticCenter ? (
                  <span className="text-emerald-400 font-medium">{windowDuration(day.galacticCenter.rise, day.galacticCenter.set)}</span>
                ) : (
                  <span className="text-slate-600">{day.visibility === 'hidden' ? '✕' : '—'}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[9px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-900" /> ความมืด</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-yellow-500/40" /> จันทร์ขึ้น</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400" /> ช่วงถ่าย GC</span>
        <span>แกนเวลา 18:00 → 06:00 · กดแถวเพื่อดูรายละเอียด</span>
      </div>
    </div>
  );
}
