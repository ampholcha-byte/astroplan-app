import SunCalc from 'suncalc';
import { GalacticCenterTime, GCPosition, MilkyWaySeason, MilkyWaySeasonLevel, MoonLevel, SunMoonTimes } from '@/types';

const GC_RA = 266.4051;   // Galactic Center RA in degrees
const GC_DEC = -28.936175; // Galactic Center Dec in degrees
// Minimum usable altitude for the GC window — below this the core is lost to
// horizon haze/trees. Matches typical MW-planner practice (~10°).
const GC_MIN_ALT_DEG = 10;

export function getMoonLevel(date: Date): {
  fraction: number;
  level: MoonLevel;
} {
  const illumination = SunCalc.getMoonIllumination(date);
  const pct = illumination.fraction;
  let level: MoonLevel;
  if (pct < 0.1) level = 1;
  else if (pct < 0.2) level = 2;
  else if (pct < 0.3) level = 3;
  else if (pct < 0.4) level = 4;
  else if (pct < 0.5) level = 5;
  else if (pct < 0.6) level = 6;
  else if (pct < 0.7) level = 7;
  else if (pct < 0.8) level = 8;
  else if (pct < 0.9) level = 9;
  else level = 10;
  return { fraction: illumination.fraction, level };
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

function getJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function getLocalSiderealTime(date: Date, lng: number): number {
  const JD = getJulianDate(date);
  const T = (JD - 2451545.0) / 36525.0;
  let gmst =
    280.46061837 +
    360.98564736629 * (JD - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000.0;
  gmst = ((gmst % 360) + 360) % 360;
  let lst = gmst + lng;
  lst = ((lst % 360) + 360) % 360;
  return lst;
}

function formatTime(hours: number): string {
  const h = Math.floor(((hours % 24) + 24) % 24);
  const m = Math.floor(((((hours % 24) + 24) % 24) - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function getGalacticCenterTimes(
  date: Date,
  lat: number,
  lng: number
): GalacticCenterTime | null {
  const decRad = toRadians(GC_DEC);
  const latRad = toRadians(lat);

  const cosH =
    -Math.sin(decRad) * Math.sin(latRad) /
    (Math.cos(decRad) * Math.cos(latRad));

  if (cosH < -1 || cosH > 1) {
    return null;
  }

  // Scan the local day (noon → next noon) for crossings of the usable-altitude
  // threshold using the same LST formula as getGCPosition (authoritative path).
  // The previous noon-LST + timezone-offset derivation drifted ~5h.
  const noon = new Date(date);
  noon.setHours(12, 0, 0, 0);

  const altAt = (t: Date): number => {
    const lst = getLocalSiderealTime(t, lng);
    let hourAngle = lst - GC_RA;
    hourAngle = ((hourAngle + 180) % 360 + 360) % 360 - 180;
    const HRad = toRadians(hourAngle);
    const sinAlt =
      Math.sin(decRad) * Math.sin(latRad) +
      Math.cos(decRad) * Math.cos(latRad) * Math.cos(HRad);
    return Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  };
  const threshold = toRadians(GC_MIN_ALT_DEG);
  const usable = (t: Date): boolean => altAt(t) >= threshold;

  // Night hours relevant to the evening's date: 18:00 → 06:00 next morning
  const NIGHT_START_MS = 6 * 3600_000;  // noon + 6h = 18:00
  const NIGHT_END_MS = 18 * 3600_000;   // noon + 18h = 06:00 next day

  const STEP_MS = 5 * 60_000;
  const intervals: { start: Date; end: Date }[] = [];
  let prevT = noon;
  let prevUp = usable(noon);
  let intervalStart: Date | null = prevUp ? noon : null;

  const refine = (lo: Date, hi: Date, targetUp: boolean): Date => {
    let a = lo, b = hi;
    for (let i = 0; i < 6; i++) {
      const mid = new Date((a.getTime() + b.getTime()) / 2);
      if (usable(mid) !== targetUp) a = mid; else b = mid;
    }
    return b;
  };

  const scanEnd = new Date(noon.getTime() + NIGHT_END_MS);
  for (let t = new Date(noon.getTime() + STEP_MS); t <= scanEnd; t = new Date(t.getTime() + STEP_MS)) {
    const up = usable(t);
    if (!prevUp && up) {
      intervalStart = refine(prevT, t, true);
    } else if (prevUp && !up && intervalStart) {
      intervals.push({ start: intervalStart, end: refine(prevT, t, false) });
      intervalStart = null;
    }
    prevT = t;
    prevUp = up;
  }
  if (intervalStart) {
    intervals.push({ start: intervalStart, end: scanEnd });
  }

  // Keep intervals overlapping the night span; merge from first rise to last set
  const nightStart = noon.getTime() + NIGHT_START_MS;
  const nightEnd = noon.getTime() + NIGHT_END_MS;
  const overlapping = intervals.filter((iv) => iv.end.getTime() >= nightStart && iv.start.getTime() <= nightEnd);
  if (overlapping.length === 0) return null;

  const rise = new Date(Math.min(...overlapping.map((iv) => iv.start.getTime())));
  const set = new Date(Math.max(...overlapping.map((iv) => iv.end.getTime())));

  return {
    rise: formatTimeFromDate(rise),
    set: formatTimeFromDate(set),
  };
}

/**
 * Get the usable GC window clamped to Astronomical Night.
 * Returns the intersection of [gcRise, gcSet] and [nightStart, nightEnd].
 * If there's no overlap, returns null.
 */
export function getGCNightWindow(
  date: Date,
  lat: number,
  lng: number
): GalacticCenterTime | null {
  const gcTimes = getGalacticCenterTimes(date, lat, lng);
  if (!gcTimes) return null;

  const sunMoon = getSunMoonTimes(date, lat, lng);

  // Parse "HH:MM" to fractional hours on the night domain (12h–36h):
  // morning times (before noon) belong to the next calendar day.
  const parseNightTime = (t: string): number => {
    const [h, m] = t.split(':').map(Number);
    let hours = h + m / 60;
    if (hours < 12) hours += 24;
    return hours;
  };

  const gcRise = parseNightTime(gcTimes.rise);
  const gcSet = parseNightTime(gcTimes.set);
  const nightStartTime = parseNightTime(sunMoon.nightStart);

  // Find astronomical dawn (sun at -18° going up) for night end
  const nightEndTime = findAstronomicalDawn(date, lat, lng);

  // Normalize: if gcSet < gcRise, GC spans midnight → add 24 to set
  const gcSetNorm = gcSet < gcRise ? gcSet + 24 : gcSet;
  const nightEndNorm = nightEndTime < nightStartTime ? nightEndTime + 24 : nightEndTime;

  const windowStart = Math.max(gcRise, nightStartTime);
  const windowEnd = Math.min(gcSetNorm, nightEndNorm);

  // Discard windows too short to shoot through (horizon-hugging junk)
  const MIN_WINDOW_H = 0.5;
  if (windowEnd - windowStart < MIN_WINDOW_H) {
    return null;
  }

  return {
    rise: formatTime(windowStart),
    set: formatTime(windowEnd),
  };
}

/**
 * Instantaneous altitude/azimuth of the Galactic Center.
 * Altitude in degrees above horizon (negative = below), azimuth in degrees
 * from North going East (N=0, E=90, S=180, W=270).
 */
export function getGCPosition(
  date: Date,
  lat: number,
  lng: number
): { altitude: number; azimuth: number } {
  const lst = getLocalSiderealTime(date, lng);
  let hourAngle = lst - GC_RA;
  hourAngle = ((hourAngle + 180) % 360 + 360) % 360 - 180; // normalize to [-180, 180]

  const decRad = toRadians(GC_DEC);
  const latRad = toRadians(lat);
  const HRad = toRadians(hourAngle);

  const sinAlt =
    Math.sin(decRad) * Math.sin(latRad) +
    Math.cos(decRad) * Math.cos(latRad) * Math.cos(HRad);
  const altRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));

  const cosAz =
    (Math.sin(decRad) - Math.sin(altRad) * Math.sin(latRad)) /
    (Math.cos(altRad) * Math.cos(latRad));
  let az = toDegrees(Math.acos(Math.max(-1, Math.min(1, cosAz))));
  if (Math.sin(HRad) > 0) az = 360 - az; // object west of meridian

  return { altitude: toDegrees(altRad), azimuth: az };
}

/** 8-point compass label for an azimuth in degrees. */
export function azimuthToDirection(azimuth: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round((((azimuth % 360) + 360) % 360) / 45) % 8;
  return dirs[idx];
}

/**
 * Hourly GC positions across one night: 18:00 through 06:00 next morning.
 * `date` is the evening's local date.
 */
export function getGCPositionsForNight(
  date: Date,
  lat: number,
  lng: number
): GCPosition[] {
  const positions: GCPosition[] = [];
  for (let h = 18; h <= 30; h++) {
    const t = new Date(date);
    t.setDate(t.getDate() + Math.floor(h / 24));
    t.setHours(h % 24, 0, 0, 0);
    const { altitude, azimuth } = getGCPosition(t, lat, lng);
    positions.push({
      time: formatTimeFromDate(t),
      altitude: Math.round(altitude),
      azimuth: Math.round(azimuth),
      direction: azimuthToDirection(azimuth),
    });
  }
  return positions;
}

/** Horizontal (alt/az) position of an arbitrary equatorial RA/Dec at a time. */
function altAzForRaDec(
  raDeg: number,
  decDeg: number,
  t: Date,
  lat: number,
  lng: number
): { altitude: number; azimuth: number } {
  const lst = getLocalSiderealTime(t, lng);
  let hourAngle = lst - raDeg;
  hourAngle = ((hourAngle + 180) % 360 + 360) % 360 - 180;

  const decRad = toRadians(decDeg);
  const latRad = toRadians(lat);
  const HRad = toRadians(hourAngle);

  const sinAlt =
    Math.sin(decRad) * Math.sin(latRad) +
    Math.cos(decRad) * Math.cos(latRad) * Math.cos(HRad);
  const altRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));

  const cosAz =
    (Math.sin(decRad) - Math.sin(altRad) * Math.sin(latRad)) /
    (Math.cos(altRad) * Math.cos(latRad));
  let az = toDegrees(Math.acos(Math.max(-1, Math.min(1, cosAz))));
  if (Math.sin(HRad) > 0) az = 360 - az;

  return { altitude: toDegrees(altRad), azimuth: az };
}

/** Unit vector from equatorial RA/Dec (degrees). */
function unitFromRaDec(raDeg: number, decDeg: number): [number, number, number] {
  const ra = toRadians(raDeg);
  const dec = toRadians(decDeg);
  return [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
}

/** Rodrigues rotation of vector v around unit axis k by angle (radians). */
function rotateAround(
  v: [number, number, number],
  k: [number, number, number],
  angleRad: number
): [number, number, number] {
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  const dot = v[0] * k[0] + v[1] * k[1] + v[2] * k[2];
  const cross: [number, number, number] = [
    k[1] * v[2] - k[2] * v[1],
    k[2] * v[0] - k[0] * v[2],
    k[0] * v[1] - k[1] * v[0],
  ];
  return [
    v[0] * c + cross[0] * s + k[0] * dot * (1 - c),
    v[1] * c + cross[1] * s + k[1] * dot * (1 - c),
    v[2] * c + cross[2] * s + k[2] * dot * (1 - c),
  ];
}

export interface SkyPoint {
  altitude: number;
  azimuth: number;
}

// Galactic pole (RA/Dec in degrees) — rotation axis of the galactic plane
const GAL_POLE_RA = 192.85948;
const GAL_POLE_DEC = 27.12825;

/**
 * Sample points along the galactic equator (the Milky Way band) for a time
 * and location. Sample 0 is the Galactic Center itself.
 */
export function getMWBandPoints(
  t: Date,
  lat: number,
  lng: number,
  stepDeg = 10
): SkyPoint[] {
  const pole = unitFromRaDec(GAL_POLE_RA, GAL_POLE_DEC);
  const gc = unitFromRaDec(GC_RA, GC_DEC);
  const points: SkyPoint[] = [];
  for (let l = 0; l < 360; l += stepDeg) {
    const v = rotateAround(gc, pole, toRadians(l));
    const ra = (toDegrees(Math.atan2(v[1], v[0])) + 360) % 360;
    const dec = toDegrees(Math.asin(Math.max(-1, Math.min(1, v[2]))));
    points.push(altAzForRaDec(ra, dec, t, lat, lng));
  }
  return points;
}

/**
 * Find astronomical dawn time (sun at -18°) by checking hourly.
 * This is when true night ends in the morning.
 */
function findAstronomicalDawn(date: Date, lat: number, lng: number): number {
  // Find when sun crosses -18° going upward (astronomical dawn)
  // Compute sun altitude at each hour and binary-search for -18° crossing
  for (let h = 0; h < 24; h++) {
    const checkTime = new Date(date);
    checkTime.setHours(h, 0, 0, 0);
    const pos = SunCalc.getPosition(checkTime, lat, lng);
    const sunAlt = toDegrees(pos.altitude);

    // Astronomical dawn: sun crosses -18° going upward (morning)
    // Check if sun is at -18° between this hour and next
    if (sunAlt > -18 && sunAlt < -10) {
      // Refine with binary search
      let lo = h, hi = h + 1;
      for (let i = 0; i < 6; i++) { // 6 iterations ≈ 1.5 min precision
        const mid = (lo + hi) / 2;
        const midTime = new Date(date);
        midTime.setHours(Math.floor(mid), (mid % 1) * 60, 0, 0);
        const midPos = SunCalc.getPosition(midTime, lat, lng);
        const midAlt = toDegrees(midPos.altitude);
        if (midAlt < -18) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }
  }

  // Fallback: use sunrise time if astronomical dawn cannot be found
  // (polar regions or edge cases where sun never reaches -18°)
  const times = SunCalc.getTimes(date, lat, lng) as SunCalc.SunTimes;
  if (times.sunrise) {
    return (times.sunrise.getHours() + times.sunrise.getMinutes() / 60);
  }
  return 5; // ultimate fallback
}

/**
 * Month-level Milky Way season for a location.
 * A day counts as "visible" when the GC night window (clamped to
 * astronomical night) exists, and "best" when the moon is dark (level <= 3).
 */
export function getMilkyWaySeason(
  year: number,
  month: number,
  lat: number,
  lng: number
): MilkyWaySeason {
  const totalDays = new Date(year, month + 1, 0).getDate();
  let visibleDays = 0;
  let bestWindowDays = 0;

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const window = getGCNightWindow(date, lat, lng);
    if (!window) continue;
    visibleDays++;
    if (getMoonLevel(date).level <= 3) bestWindowDays++;
  }

  const level: MilkyWaySeasonLevel =
    bestWindowDays / totalDays >= 0.25
      ? 'peak'
      : visibleDays > 0
        ? 'shoulder'
        : 'off';

  return { level, visibleDays, bestWindowDays, totalDays };
}

export function isGalacticCenterVisible(
  date: Date,
  lat: number
): boolean {
  const decRad = toRadians(GC_DEC);
  const latRad = toRadians(lat);
  const cosH =
    -Math.sin(decRad) * Math.sin(latRad) /
    (Math.cos(decRad) * Math.cos(latRad));
  return cosH >= -1 && cosH <= 1;
}

// ── Sun & Moon Times ──

export function getSunMoonTimes(
  date: Date,
  lat: number,
  lng: number
): SunMoonTimes {
  const times = SunCalc.getTimes(date, lat, lng) as SunCalc.SunTimes;

  // Moon times — SunCalc.getMoonTimes may return undefined for rise/set
  // when moon is below horizon all day or above horizon all day
  const moonTimes = SunCalc.getMoonTimes(date, lat, lng);

  return {
    sunrise: formatTimeFromDate(times.sunrise),
    sunset: formatTimeFromDate(times.sunset),
    goldenHourEnd: formatTimeFromDate(times.goldenHourEnd),
    goldenHour: formatTimeFromDate(times.goldenHour),
    blueHourEnd: formatTimeFromDate(times.dusk),
    nauticalDusk: formatTimeFromDate(times.nauticalDusk),
    nightStart: formatTimeFromDate(times.night),
    astronomicalDawn: formatTime(findAstronomicalDawn(date, lat, lng)),
    moonrise: moonTimes?.rise ? formatTimeFromDate(moonTimes.rise) : null,
    moonset: moonTimes?.set ? formatTimeFromDate(moonTimes.set) : null,
  };
}

function formatTimeFromDate(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
