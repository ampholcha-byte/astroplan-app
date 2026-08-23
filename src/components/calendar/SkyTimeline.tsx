'use client';

import { useMemo, useState } from 'react';
import { DayData } from '@/types';
import { getMWBandPoints } from '@/lib/astro';

interface SkyTimelineProps {
  day: DayData;
  lat: number;
  lng: number;
}

const START_H = 18; // timeline domain: 18:00 → 06:00 next morning
const END_H = 30;
const W = 320;
const H = 56;
const BAR_Y = 10;
const BAR_H = 18;

// Panorama geometry: azimuth 90°(E) → 270°(W) through south, altitude 0–90°
const PW = 320;
const PH = 150;
const HORIZON_Y = 128;
const ALT_TOP_Y = 18;
const AZ_MIN = 90;
const AZ_MAX = 270;

const FOCALS = [10, 14, 16, 24];

/** Full-frame FoV in degrees for a focal length (landscape orientation). */
function fov(focal: number): { w: number; h: number } {
  const hfov = (2 * Math.atan(36 / (2 * focal)) * 180) / Math.PI;
  const vfov = (2 * Math.atan(24 / (2 * focal)) * 180) / Math.PI;
  return { w: hfov, h: vfov };
}

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

function azToX(az: number): number {
  return ((az - AZ_MIN) / (AZ_MAX - AZ_MIN)) * PW;
}

function altToY(alt: number): number {
  return HORIZON_Y - (Math.max(0, alt) / 90) * (HORIZON_Y - ALT_TOP_Y);
}

export default function SkyTimeline({ day, lat, lng }: SkyTimelineProps) {
  const sunMoon = day.sunMoon;
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [focal, setFocal] = useState(14);

  // MW band geometry at the selected hour (kept above the early return — hook order)
  const mwBand = useMemo(() => {
    const [y, m, d] = day.id.split('-').map(Number);
    const base = new Date(y, m - 1, d).getTime();
    const t = new Date(base + (START_H + (selectedIdx ?? 6)) * 3600_000);
    return getMWBandPoints(t, lat, lng, 5);
  }, [day.id, selectedIdx, lat, lng]);

  // Split band into above-horizon polyline segments (panorama covers az 90–270)
  const mwSegments = useMemo(() => {
    const segs: string[] = [];
    let current = '';
    for (const p of mwBand) {
      if (p.altitude >= -1 && p.azimuth >= AZ_MIN - 20 && p.azimuth <= AZ_MAX + 20) {
        const px = azToX(p.azimuth);
        const py = altToY(p.altitude);
        current += `${current ? ' L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`;
      } else if (current) {
        segs.push(current);
        current = '';
      }
    }
    if (current) segs.push(current);
    return segs;
  }, [mwBand]);

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

  // Default selection: middle of shooting window if present, else mid-night
  const defaultIdx = winFromH !== null && winToH !== null
    ? Math.min(12, Math.max(0, Math.round(((winFromH + winToH) / 2 - START_H))))
    : 6;
  const idx = selectedIdx ?? defaultIdx;
  const sel = day.gcPositions[idx];

  // Status at selected hour
  const selH = START_H + idx;
  const isDark = nightStart !== null && nightEnd !== null && selH >= nightStart && selH <= nightEnd;
  const isMoonUp = moonrise !== null && moonset !== null && selH >= moonrise && selH <= moonset;
  const gcUp = sel.altitude >= 0;

  // Direction advice for the whole night
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

  // Panorama marker geometry
  const gcX = azToX(sel.azimuth);
  const gcY = altToY(sel.altitude);
  const frame = fov(focal);

  return (
    <div className="mb-5">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        🌠 Sky Compass (18:00 → 06:00)
      </h3>
      <div className="bg-slate-700/30 rounded-xl p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Night sky timeline">
          <rect x={0} y={BAR_Y} width={W} height={BAR_H} rx={2} className="fill-slate-800" />
          {nightStart !== null && nightEnd !== null && (
            <Band from={nightStart} to={nightEnd} className="fill-indigo-900" label="Astronomical night" />
          )}
          {moonrise !== null && moonset !== null && (
            <Band from={moonrise} to={moonset} className="fill-yellow-500/40" label="Moon above horizon" />
          )}
          {gcFromH !== null && gcToH !== null && (
            <Band from={gcFromH} to={gcToH + 1} className="fill-emerald-500/40" label="Galactic Center above horizon" />
          )}
          {winFromH !== null && winToH !== null && (
            <Band from={winFromH} to={winToH} className="fill-emerald-400" label="Dark night with GC visible" />
          )}
          {/* selected hour marker */}
          <line
            x1={((selH - START_H) / (END_H - START_H)) * W}
            x2={((selH - START_H) / (END_H - START_H)) * W}
            y1={BAR_Y - 4}
            y2={BAR_Y + BAR_H + 4}
            className="stroke-white"
            strokeWidth={2}
          />
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

        {/* time slider */}
        <input
          type="range"
          min={0}
          max={12}
          step={1}
          value={idx}
          onChange={(e) => setSelectedIdx(Number(e.target.value))}
          className="w-full accent-indigo-400 mb-3"
          aria-label="Selected hour"
        />
        <div className="flex justify-between text-[9px] text-slate-500 mb-3">
          <span>18:00</span><span>00:00</span><span>06:00</span>
        </div>

        {/* panorama */}
        <svg viewBox={`0 0 ${PW} ${PH}`} className="w-full" role="img" aria-label="Sky panorama facing south">
          {/* sky gradient */}
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <filter id="mwBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>
          <rect x={0} y={0} width={PW} height={HORIZON_Y} fill="url(#skyGrad)" rx={4} />

          {/* Milky Way band — "river of light" style (soft wide haze + bright core line + star specks) */}
          {mwSegments.map((seg, i) => (
            <path key={`haze-${i}`} d={seg} fill="none" stroke="#94a3b8" strokeOpacity={0.28} strokeWidth={13} strokeLinecap="round" filter="url(#mwBlur)" />
          ))}
          {mwSegments.map((seg, i) => (
            <path key={`core-${i}`} d={seg} fill="none" stroke="#e2e8f0" strokeOpacity={0.55} strokeWidth={3.5} strokeLinecap="round" />
          ))}
          {mwBand.map((p, i) =>
            p.altitude >= 4 && p.azimuth >= AZ_MIN && p.azimuth <= AZ_MAX && i % 2 === 0 ? (
              <circle
                key={`star-${i}`}
                cx={azToX(p.azimuth) + Math.sin(i * 3.7) * 5}
                cy={altToY(p.altitude) + Math.cos(i * 2.9) * 4}
                r={0.7 + (i % 3) * 0.35}
                className="fill-white"
                opacity={0.35 + (i % 4) * 0.12}
              />
            ) : null
          )}

          {/* altitude grid */}
          {[30, 60].map((alt) => (
            <g key={alt}>
              <line x1={0} x2={PW} y1={altToY(alt)} y2={altToY(alt)} className="stroke-slate-600/40" strokeDasharray="3 4" strokeWidth={1} />
              <text x={3} y={altToY(alt) - 2} className="fill-slate-600" fontSize={7}>{alt}°</text>
            </g>
          ))}
          <line x1={0} x2={PW} y1={HORIZON_Y} y2={HORIZON_Y} className="stroke-slate-500" strokeWidth={1.5} />

          {/* direction labels */}
          {[['E', 90], ['SE', 135], ['S', 180], ['SW', 225], ['W', 270]].map(([label, az]) => (
            <text key={label as string} x={azToX(az as number)} y={HORIZON_Y + 14} textAnchor="middle" className="fill-slate-500" fontSize={9}>
              {label}
            </text>
          ))}

          {/* focal length frame around GC */}
          {gcUp && (
            <rect
              x={azToX(sel.azimuth - frame.w / 2)}
              y={altToY(sel.altitude + frame.h / 2)}
              width={(frame.w / (AZ_MAX - AZ_MIN)) * PW}
              height={((frame.h / 90) * (HORIZON_Y - ALT_TOP_Y))}
              className="fill-indigo-400/10 stroke-indigo-400"
              strokeWidth={1}
              strokeDasharray="4 3"
              rx={2}
            >
              <title>{focal}mm frame ({Math.round(frame.w)}°×{Math.round(frame.h)}°)</title>
            </rect>
          )}

          {/* GC core glow + marker (only when above horizon) */}
          {gcUp && (
            <g>
              <circle cx={gcX} cy={gcY} r={16} className="fill-amber-300/10" />
              <circle cx={gcX} cy={gcY} r={9} className="fill-amber-300/20" />
              <circle cx={gcX} cy={gcY} r={4} className="fill-amber-300" />
              <text x={gcX} y={gcY - 12} textAnchor="middle" className="fill-amber-200" fontSize={8}>
                GC {sel.altitude}°
              </text>
            </g>
          )}
          {!gcUp && (
            <text x={PW / 2} y={60} textAnchor="middle" className="fill-slate-500" fontSize={9}>
              GC ต่ำกว่าขอบฟ้า ({sel.altitude}°) — เลื่อนเวลาดูช่วงที่ขึ้น
            </text>
          )}

          {/* moon marker */}
          {isMoonUp && (
            <circle cx={PW - 30} cy={ALT_TOP_Y + 12} r={5} className="fill-yellow-200/80">
              <title>Moon is up at this hour</title>
            </circle>
          )}
        </svg>

        {/* focal length selector */}
        <div className="flex gap-1.5 mt-2 mb-2">
          {FOCALS.map((f) => (
            <button
              key={f}
              onClick={() => setFocal(f)}
              className={`px-2.5 py-1 text-[10px] rounded-full border transition-colors ${
                focal === f
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {f}mm
            </button>
          ))}
        </div>

        {/* selected hour status */}
        <p className="text-[10px] text-slate-300">
          🕐 {sel.time} · GC {sel.altitude >= 0 ? `${sel.altitude}° ${sel.direction}` : `${sel.altitude}° (ใต้ขอบฟ้า)`}
          {' · '}
          {isDark ? <span className="text-indigo-300">มืดสนิท</span> : <span className="text-slate-500">ยังไม่มืด/เลยช่วงมืด</span>}
          {isMoonUp && <span className="text-yellow-300"> · ☀ จันทร์ขึ้นอยู่</span>}
        </p>

        {/* hourly position chips */}
        <div className="flex gap-1 overflow-x-auto pb-1 mt-2">
          {day.gcPositions.map((p, i) => (
            <button
              key={p.time}
              onClick={() => setSelectedIdx(i)}
              className={`shrink-0 rounded-md px-1.5 py-1 text-center border transition-colors ${
                i === idx ? 'ring-1 ring-white' : ''
              } ${
                p.altitude >= 0
                  ? 'bg-emerald-900/30 border-emerald-700/40 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700/40 text-slate-600'
              }`}
              title={`${p.time} · alt ${p.altitude}° · az ${p.azimuth}° (${p.direction})`}
            >
              <div className="text-[8px] text-slate-500">{p.time}</div>
              <div className="text-[10px] font-semibold">{p.altitude}°</div>
              <div className="text-[8px]">{p.altitude >= 0 ? p.direction : '—'}</div>
            </button>
          ))}
        </div>

        {/* direction advice */}
        <p className="text-[10px] text-slate-400 mt-2">📍 {advice}</p>
      </div>
    </div>
  );
}
