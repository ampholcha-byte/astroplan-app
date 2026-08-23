'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Coordinates, DayData, CalendarMonth, AppSettings, WeatherData, CloudSource, LightPollutionData } from '@/types';
import { getMoonLevel, getGCNightWindow, getGCPositionsForNight, getMilkyWaySeason, isGalacticCenterVisible, getSunMoonTimes } from '@/lib/astro';
import { fetchWeatherForMonth, fetchLightPollution } from '@/app/actions';
import PageWrapper from '@/components/layout/PageWrapper';
import LocationSearch from '@/components/shared/LocationSearch';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import DayDetailsModal from '@/components/calendar/DayDetailsModal';
import BestDaysSummary from '@/components/calendar/BestDaysSummary';
import MilkyWaySeasonBanner from '@/components/calendar/MilkyWaySeasonBanner';
import MonthTimeline from '@/components/calendar/MonthTimeline';
import SettingsPanel from '@/components/layout/SettingsPanel';
import TonightForecast from '@/components/calendar/TonightForecast';
import ScoreFilter, { ScoreMode, calcWeightedScore } from '@/components/calendar/ScoreFilter';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DEFAULT_LAT = 13.7563;
const DEFAULT_LNG = 100.5018;

const SETTINGS_STORAGE_KEY = 'astroplan-settings';
const LOCATION_STORAGE_KEY = 'astroplan-location';

const DEFAULT_SETTINGS: AppSettings = {
  latitude: DEFAULT_LAT,
  longitude: DEFAULT_LNG,
  timezone: 'Asia/Bangkok',
};

function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

function saveSettingsToStorage(s: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
}

function createDay(
  year: number,
  month: number,
  date: number,
  lat: number,
  lng: number,
  weatherCache: Record<number, { weather: WeatherData | null; source: CloudSource }>,
  lightPollutionCache: LightPollutionData | null
): DayData {
  const id = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
  const dateObj = new Date(year, month, date);

  const moon = getMoonLevel(dateObj);
  const gcVisible = isGalacticCenterVisible(dateObj, lat);
  const galacticCenter = gcVisible ? getGCNightWindow(dateObj, lat, lng) : null;
  const gcPositions = gcVisible ? getGCPositionsForNight(dateObj, lat, lng) : null;

  const cached = weatherCache[date];
  const weather = cached?.weather ?? null;
  const cloudSource: CloudSource = cached?.source ?? 'none';

  const sunMoon = getSunMoonTimes(dateObj, lat, lng);

  return {
    id,
    date,
    moonLevel: moon.level,
    moonPercentage: Math.round(moon.fraction * 100),
    cloudCoverPercentage: weather?.cloudCoverPercentage ?? null,
    cloudSource,
    weather,
    galacticCenter,
    gcPositions,
    sunMoon,
    lightPollution: lightPollutionCache,
    visibility: gcVisible ? 'visible' : 'hidden',
  };
}

function buildMonth(
  year: number,
  month: number,
  lat: number,
  lng: number,
  weatherCache: Record<number, { weather: WeatherData | null; source: CloudSource }>,
  lightPollutionCache: LightPollutionData | null
): CalendarMonth {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const days: DayData[] = [];

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month - 1;
    const y = m < 0 ? year - 1 : year;
    const mi = m < 0 ? 11 : m;
    days.push(createDay(y, mi, d, lat, lng, weatherCache, lightPollutionCache));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push(createDay(year, month, d, lat, lng, weatherCache, lightPollutionCache));
  }

  const remaining = 35 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month + 1;
    const y = m > 11 ? year + 1 : year;
    const mi = m > 11 ? 0 : m;
    days.push(createDay(y, mi, d, lat, lng, weatherCache, lightPollutionCache));
  }

  return { year, month, days };
}

/**
 * Shorten location display name.
 * "Chiang Mai, Chiang Mai District, Chiang Mai 50000, Thailand"
 * → "Chiang Mai, Chiang Mai District"
 */
function shortLocationName(displayName: string): string {
  // Nominatim format: "Name, District, Province, Postal, Country"
  // We want: "Name, Province" or "Name, District"
  const parts = displayName.split(',').map((s) => s.trim()).filter(Boolean);

  if (parts.length <= 2) return displayName; // Already short

  // Take first (city/town) + second (district/province) parts
  // Skip postal code (usually 5 digits) and country
  const filtered = parts.filter((p) => !/^\d{5}$/.test(p) && !/^(Thailand|United States|Japan|Australia|UK|Germany|France|China|Korea|India)$/i.test(p));

  if (filtered.length >= 2) {
    return `${filtered[0]}, ${filtered[1]}`;
  }
  return filtered[0] || displayName;
}

function getBortleColor(scale: number): string {
  // Returns a hex color for the Bortle scale (1=darkest, 9=brightest)
  const colors: Record<number, string> = {
    1: '#9ca3af', // gray-400
    2: '#93c5fd', // blue-300
    3: '#67e8f9', // cyan-300
    4: '#86efac', // green-300
    5: '#fde047', // yellow-300
    6: '#fdba74', // orange-300
    7: '#fb923c', // orange-400
    8: '#f87171', // red-400
    9: '#ef4444', // red-500
  };
  return colors[scale] ?? '#64748b';
}

export default function CalendarPage() {
  const [calendar, setCalendar] = useState<CalendarMonth>(() =>
    buildMonth(new Date().getFullYear(), new Date().getMonth(), DEFAULT_LAT, DEFAULT_LNG, {}, null)
  );
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [settings, setSettings] = useState<AppSettings>(() => ({ ...DEFAULT_SETTINGS }));
  const [showSettings, setShowSettings] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [scoreMode, setScoreMode] = useState<ScoreMode>('balanced');
  const [includeWeather, setIncludeWeather] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const fetchedRef = useRef<string>('');

  // Mirror the latest calendar in a ref so the mount/coords effect can read it
  // without listing calendar.year/month in its dependency array (which would
  // cause a double-run when navigating months — month nav calls
  // regenerateCalendar directly via handlePrevMonth/handleNextMonth).
  const calendarRef = useRef(calendar);
  useEffect(() => {
    calendarRef.current = calendar;
  }, [calendar]);
  const [lightPollution, setLightPollution] = useState<LightPollutionData | null>(null);
  const lpFetchedRef = useRef<string>('');
  const weatherCacheRef = useRef<Record<number, { weather: WeatherData | null; source: CloudSource }>>({});

  // Mirror lightPollution in a ref so regenerateCalendar can read the latest
  // value without listing it in its dependency array (it's only set once per
  // location, after which regenerateCalendar is invoked again anyway).
  const lightPollutionRef = useRef(lightPollution);
  useEffect(() => {
    lightPollutionRef.current = lightPollution;
  }, [lightPollution]);

  useEffect(() => {
    // Client-only hydration of localStorage state (correct pattern, no loop).
    // Saved location (name + coords) takes precedence; fall back to raw settings coords.
    const s = loadSettings();
    let savedLocation: Coordinates | null = null;
    try {
      const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number' && parsed.displayName) {
          savedLocation = parsed as Coordinates;
        }
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(s);
    if (savedLocation) {
      setLocation(savedLocation);
      setCoords({ lat: savedLocation.lat, lng: savedLocation.lng });
    } else {
      setCoords({ lat: s.latitude, lng: s.longitude });
    }
  }, []);

  const buildAndApply = useCallback(
    (year: number, month: number, weatherCache: Record<number, { weather: WeatherData | null; source: CloudSource }>, lp: LightPollutionData | null) => {
      setCalendar(buildMonth(year, month, coords.lat, coords.lng, weatherCache, lp));
    },
    [coords]
  );

  const regenerateCalendar = useCallback(
    async (year: number, month: number) => {
      const cacheKey = `${year}-${month}-${coords.lat.toFixed(4)}-${coords.lng.toFixed(4)}`;

      // Fetch weather
      let weatherCache: Record<number, { weather: WeatherData | null; source: CloudSource }> = {};
      setWeatherLoading(true);
      fetchedRef.current = cacheKey;
      try {
        weatherCache = await fetchWeatherForMonth(year, month, coords.lat, coords.lng);
        weatherCacheRef.current = weatherCache;
      } catch (err) {
        console.warn('Weather fetch failed:', err);
      } finally {
        setWeatherLoading(false);
      }

      // Fetch light pollution and wait for it
      const lpKey = `${coords.lat.toFixed(4)}-${coords.lng.toFixed(4)}`;
      let lpData: LightPollutionData | null = null;
      if (lpFetchedRef.current !== lpKey) {
        lpFetchedRef.current = lpKey;
        try {
          lpData = await fetchLightPollution(coords.lat, coords.lng);
          setLightPollution(lpData);
        } catch (err) {
          console.warn('Light pollution fetch failed:', err);
        }
      } else {
        lpData = lightPollutionRef.current;
      }

      // Apply calendar AFTER both fetches complete
      buildAndApply(year, month, weatherCache, lpData);
    },
    [coords, buildAndApply]
  );

  useEffect(() => {
    // Initial load + reload when location changes. Month navigation is handled
    // explicitly by handlePrevMonth/handleNextMonth (which call regenerateCalendar
    // directly), so calendar.year/month are read via ref and intentionally
    // excluded from deps. The async call sets state (correct load pattern).
    void regenerateCalendar(calendarRef.current.year, calendarRef.current.month);
  }, [coords.lat, coords.lng, regenerateCalendar]);

  const handlePrevMonth = () => {
    const pm = calendar.month === 0 ? 11 : calendar.month - 1;
    const py = calendar.month === 0 ? calendar.year - 1 : calendar.year;
    fetchedRef.current = '';
    weatherCacheRef.current = {}; // Clear cache for new month
    regenerateCalendar(py, pm);
  };

  const handleNextMonth = () => {
    const nm = calendar.month === 11 ? 0 : calendar.month + 1;
    const ny = calendar.month === 11 ? calendar.year + 1 : calendar.year;
    fetchedRef.current = '';
    weatherCacheRef.current = {}; // Clear cache for new month
    regenerateCalendar(ny, nm);
  };

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
  }, []);

  const handleLocationSelect = useCallback((newCoords: Coordinates) => {
    setLocation(newCoords);
    setCoords({ lat: newCoords.lat, lng: newCoords.lng });
    fetchedRef.current = '';
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newCoords));
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      const current: AppSettings = raw ? JSON.parse(raw) : {} as AppSettings;
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({ ...current, latitude: newCoords.lat, longitude: newCoords.lng })
      );
    } catch { /* ignore */ }
  }, []);

  const mwSeason = useMemo(
    () => getMilkyWaySeason(calendar.year, calendar.month, coords.lat, coords.lng),
    [calendar.year, calendar.month, coords.lat, coords.lng]
  );

  const goodDays = calendar.days.filter(
    (d) => calcWeightedScore(d, scoreMode, includeWeather) >= 60
  ).length;

  const apiDays = calendar.days.filter((d) => d.cloudSource === 'api').length;

  const now = new Date();
  const isCurrentMonth = calendar.month === now.getMonth() && calendar.year === now.getFullYear();

  // Find today and tomorrow in calendar days
  const todayDate = now.getDate();
  const todayDay = calendar.days.find((d) => d.date === todayDate && d.id.startsWith(`${calendar.year}-${String(calendar.month + 1).padStart(2, '0')}`));
  const tomorrowDay = calendar.days.find((d) => {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.date === tomorrow.getDate() && d.id.startsWith(`${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}`);
  });

  return (
    <PageWrapper>
      {/* Location — first run: full search. After that: compact bar (change via Settings) */}
      {!location ? (
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2">📍 เลือกสถานที่ถ่ายครั้งแรก แล้วระบบจะจำไว้ให้ (เปลี่ยนได้ที่หน้า Settings)</p>
          <LocationSearch onLocationSelect={handleLocationSelect} />
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden mb-3 border border-slate-700/50">
          {lightPollution && (
            <div
              className="h-1.5 w-full"
              style={{ backgroundColor: getBortleColor(lightPollution.bortleScale) }}
              title={`Bortle ${lightPollution.bortleScale}: ${lightPollution.label} (${lightPollution.brightness} mpsas)`}
            />
          )}
          <div className="bg-slate-800/60 px-3 py-2 flex items-center justify-between gap-2">
            <p className="text-sm text-slate-200 font-medium truncate">
              📍 {shortLocationName(location.displayName)}
            </p>
            <Link
              href="/settings"
              className="text-[10px] text-indigo-400 hover:text-indigo-300 underline shrink-0"
            >
              เปลี่ยนสถานที่
            </Link>
          </div>
        </div>
      )}

      {/* Month navigation */}
      <div className="flex items-center justify-between w-full mb-3">
        <button
          onClick={handlePrevMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition-colors text-lg text-slate-300"
        >
          ‹
        </button>
        <div className="text-center flex-1 mx-2">
          <span className="text-base font-semibold text-white">
            {MONTH_NAMES[calendar.month]} {calendar.year}
          </span>
          {goodDays > 0 && (
            <p className="text-[10px] text-emerald-400 mt-0.5">
              ★ {goodDays} good shooting {goodDays === 1 ? 'day' : 'days'} this month
            </p>
          )}
          {/* View toggle lives with month nav so both views switch months in place */}
          <div className="flex justify-center gap-1.5 mt-1.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-0.5 text-[10px] rounded-full border transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              🗓 Grid
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-0.5 text-[10px] rounded-full border transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              📊 Timeline
            </button>
          </div>
        </div>
        <button
          onClick={handleNextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition-colors text-lg text-slate-300"
        >
          ›
        </button>
      </div>

      {/* Milky Way season indicator for this month/location */}
      <MilkyWaySeasonBanner season={mwSeason} />

      {/* Today button — hidden when already on current month */}
      {!isCurrentMonth && (
        <button
          onClick={() => {
            fetchedRef.current = '';
            regenerateCalendar(now.getFullYear(), now.getMonth());
          }}
          className="mb-3 px-4 py-1.5 text-xs font-medium rounded-full bg-indigo-600/80 hover:bg-indigo-500 text-white transition-colors"
        >
          📅 Today
        </button>
      )}

      {/* Legend (grid view) */}
      {viewMode === 'grid' && (
        <div className="flex items-center gap-3 mb-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> GC Rise</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> GC Set</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Moon Bright</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600" /> Dark Sky</span>
        </div>
      )}

      {/* Calendar */}
      {viewMode === 'grid' ? (
        <CalendarGrid days={calendar.days} onDayClick={setSelectedDay} />
      ) : (
        <MonthTimeline days={calendar.days} onDayClick={setSelectedDay} />
      )}

      {/* Tonight's Forecast Card */}
      {isCurrentMonth && todayDay && (
        <TonightForecast today={todayDay} tomorrow={tomorrowDay} onDayClick={setSelectedDay} includeWeather={includeWeather} />
      )}

      {/* Weather status */}
      <div className="flex items-center gap-2 mt-3 mb-2">
        {weatherLoading && (
          <span className="text-[10px] text-indigo-400 animate-pulse">⏳ Loading weather...</span>
        )}
        {!weatherLoading && apiDays > 0 && (
          <span className="text-[10px] text-emerald-400">🌤 Live weather (Open-Meteo)</span>
        )}
        {!weatherLoading && apiDays === 0 && (
          <span className="text-[10px] text-yellow-400">⚠️ No forecast data (date out of 7-day range)</span>
        )}
      </div>
      <p className="text-[9px] text-slate-600 mb-2">
        พยากรณ์เมฆครอบคลุม ~7 วันข้างหน้า — วันที่เกินกว่านั้น คะแนนคำนวณจากดวงจันทร์+GC อย่างเดียว (เช็กอากาศอีกครั้งเมื่อใกล้วันจริง)
      </p>

      {/* Score Filter */}
      <ScoreFilter mode={scoreMode} onChange={setScoreMode} includeWeather={includeWeather} onIncludeWeatherChange={setIncludeWeather} />

      {/* Best days summary */}
      <BestDaysSummary days={calendar.days} onDayClick={setSelectedDay} includeWeather={includeWeather} />

      {/* Day details modal */}
      {selectedDay && (
        <DayDetailsModal
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
          locationName={location?.displayName ?? ''}
          includeWeather={includeWeather}
        />
      )}

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </PageWrapper>
  );
}
