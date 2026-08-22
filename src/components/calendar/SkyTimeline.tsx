'use client';

import { DayData } from '@/types';

interface SkyTimelineProps {
  day: DayData;
}

const START_H = 18; // timeline domain: 18:00 → 06:00 next morning
const END_H = 30;
const W = 320;
const H = 56;
const BAR_Y = 10;
const BAR_H = 18;

/** "HH:MM" → hours on the 18–30 timeline domain (night wraps midnight). */
function toDomainHours(t: string): number | null {
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h)) return null;
  let hours = h + m / 60;
  if (hours < 12) hours += 24; // early-morning times belong to next day
  return hours;
}

function Band({ from, to, className, label }: { from: number; to: number; className: string; label: string }) {
  const x1 = ((Math.max(from, START_H) - START_H) / (END_H - START_H)) * W;
  const x2 = ((Math.min(to, END_H) - START_H) / (END_H - START_H)) * W;
  if (x2 <= x1) return null;
  return (
    <rect
      x={x1}
      y={BAR_Y}
      width={x2 - x1}
      height={BAR_H}
      rx={2}
      className={className}
    >
      <title>{label}</title>
    </rect>
  );
}

export default function SkyTimeline({ day }: SkyTimelineProps) {
  const sunMoon = day.sunMoon;
  if (!sunMoon || !day.gcPositions) return null;

  const parse = (t: string | null | undefined) => (t ? toDomainHours(t) : null);

  const nightStart = parse(sunMoon.nightStart);
  const nightEnd = parse(sunMoon.astronomicalDawn);
  const moonrise = parse(sunMoon.moonrise);
  const moonset = parse(sunMoon.moonset);

  // GC above-horizon band from hourly positions (first/last hour with alt >= 0)
  const up = day.gcPositions.filter((p) => p.altitude >= 0);
  const gcFrom = up.length > 0 ? up[0].time : null;
  const gcTo = up.length > 0 ? up[up.length - 1].time : null;
  const gcFromH = parse(gcFrom);
  const gcToH = parse(gcTo);

  // Golden window = dark ∩ GC above horizon (day.galacticCenter is exactly this)
  const winFromH = day.galacticCenter ? parse(day.galacticCenter.rise) : null;
  const winToH = day.galacticCenter ? parse(day.galacticCenter.set) : null;

  // Direction advice: azimuth direction around the middle of the visible hours
  let advice: string;
  if (day.galacticCenter && up.length > 0) {
    const mid = up[Math.floor(up.length / 2)];
    advice = `ถ่ายได้โดยหันไปทางทิศ${mid.direction} (${day.galacticCenter.rise} → ${day.galacticCenter.set})`;
  } else if (up.length > 0) {
    advice = `GC อยู่เหนือขอบฟ้า (${gcFrom}–${gcTo}) แต่ไม่ตรงกับความมืด`;
  } else {
    advice = 'GC อยู่ต่ำกว่าขอบฟ้าทั้งคืน';
  }

  const ticks = [18, 20, 22, 24, 26, 28, 30];

  return (
    <div className="mb-5">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        🌠 Sky Timeline (18:00 → 06:00)
      </h3>
      <div className="bg-slate-700/30 rounded-xl p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Night sky timeline">
          {/* base track */}
          <rect x={0} y={BAR_Y} width={W} height={BAR_H} rx={2} className="fill-slate-800" />

          {/* astronomical night */}
          {nightStart !== null && nightEnd !== null && (
            <Band from={nightStart} to={nightEnd} className="fill-indigo-900" label="Astronomical night" />
          )}
          {/* moon up */}
          {moonrise !== null && moonset !== null && (
            <Band from={moonrise} to={moonset} className="fill-yellow-500/40" label="Moon above horizon" />
          )}
          {/* GC above horizon */}
          {gcFromH !== null && gcToH !== null && (
            <Band from={gcFromH} to={gcToH + 1} className="fill-emerald-500/40" label="Galactic Center above horizon" />
          )}
          {/* golden window */}
          {winFromH !== null && winToH !== null && (
            <Band from={winFromH} to={winToH} className="fill-emerald-400" label="Dark night with GC visible" />
          )}

          {/* hour ticks */}
          {ticks.map((h) => (
            <g key={h}>
              <line
                x1={((h - START_H) / (END_H - START_H)) * W}
                x2={((h - START_H) / (END_H - START_H)) * W}
                y1={BAR_Y + BAR_H}
                y2={BAR_Y + BAR_H + 4}
                className="stroke-slate-600"
                strokeWidth={1}
              />
              <text
                x={((h - START_H) / (END_H - START_H)) * W}
                y={BAR_Y + BAR_H + 15}
                textAnchor="middle"
                className="fill-slate-500"
                fontSize={8}
              >
                {String(h % 24).padStart(2, '0')}
              </text>
            </g>
          ))}
        </svg>

        {/* legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 mb-3 text-[9px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-900" /> Dark night</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-yellow-500/40" /> Moon up</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/40" /> GC above horizon</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400" /> Shooting window</span>
        </div>

        {/* hourly position chips */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {day.gcPositions.map((p) => (
            <div
              key={p.time}
              className={`shrink-0 rounded-md px-1.5 py-1 text-center border ${
                p.altitude >= 0
                  ? 'bg-emerald-900/30 border-emerald-700/40 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700/40 text-slate-600'
              }`}
              title={`${p.time} · alt ${p.altitude}° · az ${p.azimuth}° (${p.direction})`}
            >
              <div className="text-[8px] text-slate-500">{p.time}</div>
              <div className="text-[10px] font-semibold">{p.altitude}°</div>
              <div className="text-[8px]">{p.altitude >= 0 ? p.direction : '—'}</div>
            </div>
          ))}
        </div>

        {/* direction advice */}
        <p className="text-[10px] text-slate-400 mt-2">📍 {advice}</p>
      </div>
    </div>
  );
}
