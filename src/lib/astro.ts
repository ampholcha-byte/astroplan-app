import SunCalc from 'suncalc';
import { GalacticCenterTime, MoonLevel, SunMoonTimes } from '@/types';

const GC_RA = 266.4051;   // Galactic Center RA in degrees
const GC_DEC = -28.936175; // Galactic Center Dec in degrees

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

  const H = toDegrees(Math.acos(cosH));
  const gcRA = GC_RA;

  const noon = new Date(date);
  noon.setHours(12, 0, 0, 0);
  const lstNoon = getLocalSiderealTime(noon, lng);

  let transitLST = gcRA;
  let hourAngleRise = -H;
  let hourAngleSet = H;

  let transitHours = ((transitLST - lstNoon) / 360) * 24;
  let riseHours = ((gcRA + hourAngleRise - lstNoon) / 360) * 24;
  let setHours = ((gcRA + hourAngleSet - lstNoon) / 360) * 24;

  const utcOffset = -date.getTimezoneOffset() / 60;
  transitHours += utcOffset;
  riseHours += utcOffset;
  setHours += utcOffset;

  return {
    rise: formatTime(riseHours),
    set: formatTime(setHours),
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

  // Parse "HH:MM" to fractional hours
  const parseTime = (t: string): number => {
    const [h, m] = t.split(':').map(Number);
    return h + m / 60;
  };

  const gcRise = parseTime(gcTimes.rise);
  const gcSet = parseTime(gcTimes.set);
  const nightStart = parseTime(sunMoon.nightStart);   // astronomical dusk
  const nightEnd = parseTime(sunMoon.nightStart);     // we need night end too

  // Get the next day's night start as night end approximation
  // Actually, SunCalc "night" = astronomical dusk. We need astronomical dawn.
  // Let's compute it: night ends at next day's astronomical dawn
  // which is the same as: today's nauticalDusk is NOT what we want.
  // We need to find when astronomical twilight ends in the morning.
  // SunCalc doesn't give "nightEnd" directly, so we compute it from next day.
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const prevDay = new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);
  const nextSunMoon = getSunMoonTimes(nextDay, lat, lng);
  const prevSunMoon = getSunMoonTimes(prevDay, lat, lng);

  // Night period: from today's astronomical dusk (nightStart) to next day's astronomical dawn
  // Next day's "night" time in SunCalc = astronomical dusk, but we need dawn.
  // Actually SunCalc "night" = dusk. For dawn, we look at prev day's "night" from the next day's perspective.
  // Simpler: night ends at the time when sun reaches -18° in the morning = next day's "night" is dusk, not dawn.
  // Let's use a different approach: compute sun altitude at each hour and find when it crosses -18°
  const nightEndTime = findAstronomicalDawn(date, lat, lng);
  const nightStartTime = nightStart;

  // Handle wrap-around: night may span midnight
  // GC window may also span midnight
  // We need intersection of [gcRise, gcSet] and [nightStart, nightEnd]

  // Normalize: if gcSet < gcRise, GC spans midnight → add 24 to set
  const gcSetNorm = gcSet < gcRise ? gcSet + 24 : gcSet;
  const nightEndNorm = nightEndTime < nightStartTime ? nightEndTime + 24 : nightEndTime;

  const windowStart = Math.max(gcRise, nightStartTime);
  const windowEnd = Math.min(gcSetNorm, nightEndNorm);

  if (windowStart >= windowEnd) {
    return null; // No overlap — GC not visible during dark night
  }

  return {
    rise: formatTime(windowStart),
    set: formatTime(windowEnd),
  };
}

/**
 * Find astronomical dawn time (sun at -18°) by checking hourly.
 * This is when true night ends in the morning.
 */
function findAstronomicalDawn(date: Date, lat: number, lng: number): number {
  // Check each hour of the day to find when sun crosses -18° going up
  const times = SunCalc.getTimes(date, lat, lng) as SunCalc.SunTimes;

  // SunCalc gives us "night" = astronomical dusk (evening)
  // For astronomical dawn (morning), we check the next sunrise period
  // Simple approach: use the "night" from previous day shifted, or compute directly

  // Actually, let's just compute sun altitude at each hour
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

  // Fallback: if sun never reaches -18° (polar day/night edge cases)
  return 5; // default to 05:00
}

export function isGalacticCenterVisible(
  date: Date,
  lat: number,
  lng: number
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
    moonrise: moonTimes?.rise ? formatTimeFromDate(moonTimes.rise) : null,
    moonset: moonTimes?.set ? formatTimeFromDate(moonTimes.set) : null,
  };
}

function formatTimeFromDate(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
