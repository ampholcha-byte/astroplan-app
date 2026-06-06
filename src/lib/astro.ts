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
  const moonTimes = (SunCalc as { getMoonTimes?: (date: Date, lat: number, lng: number) => { rise?: Date; set?: Date } }).getMoonTimes?.(date, lat, lng);

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
