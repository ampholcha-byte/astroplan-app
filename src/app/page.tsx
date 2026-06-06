'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Coordinates, DayData, CalendarMonth, MoonLevel, AppSettings, WeatherData, CloudSource, LightPollutionData } from '@/types';
import { getMoonLevel, getGalacticCenterTimes, isGalacticCenterVisible, getSunMoonTimes } from '@/lib/astro';
import { getMockCloudCover } from '@/lib/weather';
import { fetchWeatherForMonth, fetchLightPollution } from './actions';
import LocationSearch from '@/components/LocationSearch';
import CalendarGrid from '@/components/CalendarGrid';
import DayDetailsModal from '@/components/DayDetailsModal';
import BestDaysSummary from '@/components/BestDaysSummary';
import SettingsPanel from '@/components/SettingsPanel';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DEFAULT_LAT = 13.7563;
const DEFAULT_LNG = 100.5018;

const DEFAULT_SETTINGS: AppSettings = {
  latitude: DEFAULT_LAT,
  longitude: DEFAULT_LNG,
  timezone: 'Asia/Bangkok',
  useGPS: false,
  weatherApiKey: '',
};

// ── Sync day creator (uses pre-fetched weather cache) ──
function createDay(
  year: number,
  month: number,
  date: number,
  lat: number,
  lng: number,
  weatherCache: Record<number, { weather: WeatherData; source: CloudSource }>,
  lightPollutionCache: LightPollutionData | null
): DayData {
  const id = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
  const dateObj = new Date(year, month, date);

  const moon = getMoonLevel(dateObj);
  const gcVisible = isGalacticCenterVisible(dateObj, lat, lng);
  const galacticCenter = gcVisible ? getGalacticCenterTimes(dateObj, lat, lng) : null;

  // Use cached weather or fallback to mock
  const cached = weatherCache[date];
  const weather = cached?.weather ?? getMockCloudCover(dateObj);
  const cloudSource: CloudSource = cached?.source ?? 'mock';

  const isHoliday = date === 1 || date === 15 || date % 7 === 0;

  // Calculate sun & moon times
  const sunMoon = getSunMoonTimes(dateObj, lat, lng);

  return {
    id,
    date,
    isHoliday,
    moonLevel: moon.level,
    moonPercentage: Math.round(moon.fraction * 100),
    cloudCoverPercentage: weather.cloudCoverPercentage,
    cloudSource,
    weather,
    galacticCenter,
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
  weatherCache: Record<number, { weather: WeatherData; source: CloudSource }>,
  lightPollutionCache: LightPollutionData | null
): CalendarMonth {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const days: DayData[] = [];

  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month - 1;
    const y = m < 0 ? year - 1 : year;
    const mi = m < 0 ? 11 : m;
    days.push(createDay(y, mi, d, lat, lng, weatherCache, lightPollutionCache));
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(createDay(year, month, d, lat, lng, weatherCache, lightPollutionCache));
  }

  // Next month padding
  const remaining = 35 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month + 1;
    const y = m > 11 ? year + 1 : year;
    const mi = m > 11 ? 0 : m;
    days.push(createDay(y, mi, d, lat, lng, weatherCache, lightPollutionCache));
  }

  return { year, month, days };
}

export default function Home() {
  const [calendar, setCalendar] = useState<CalendarMonth>(() =>
    buildMonth(new Date().getFullYear(), new Date().getMonth(), DEFAULT_LAT, DEFAULT_LNG, {}, null)
  );
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const fetchedRef = useRef<string>('');

  const [lightPollution, setLightPollution] = useState<LightPollutionData | null>(null);
  const lpFetchedRef = useRef<string>('');

  const regenerateCalendar = useCallback(
    async (year: number, month: number) => {
      const cacheKey = `${year}-${month}-${coords.lat.toFixed(4)}-${coords.lng.toFixed(4)}`;

      // Fetch weather data from server action
      let weatherCache: Record<number, { weather: WeatherData; source: CloudSource }> = {};

      if (settings.weatherApiKey && fetchedRef.current !== cacheKey) {
        setWeatherLoading(true);
        fetchedRef.current = cacheKey;
        try {
          weatherCache = await fetchWeatherForMonth(year, month, coords.lat, coords.lng, settings.weatherApiKey);
        } catch (err) {
          console.warn('Weather fetch failed, using mock:', err);
        } finally {
          setWeatherLoading(false);
        }
      }

      // Fetch light pollution data (once per location)
      const lpKey = `${coords.lat.toFixed(4)}-${coords.lng.toFixed(4)}`;
      if (lpFetchedRef.current !== lpKey) {
        lpFetchedRef.current = lpKey;
        try {
          const lp = await fetchLightPollution(coords.lat, coords.lng);
          setLightPollution(lp);
        } catch (err) {
          console.warn('Light pollution fetch failed:', err);
        }
      }

      setCalendar(buildMonth(year, month, coords.lat, coords.lng, weatherCache, lightPollution));
    },
    [coords, settings.weatherApiKey, lightPollution]
  );

  useEffect(() => {
    regenerateCalendar(calendar.year, calendar.month);
  }, [coords.lat, coords.lng]);

  const handlePrevMonth = () => {
    const pm = calendar.month === 0 ? 11 : calendar.month - 1;
    const py = calendar.month === 0 ? calendar.year - 1 : calendar.year;
    regenerateCalendar(py, pm);
  };

  const handleNextMonth = () => {
    const nm = calendar.month === 11 ? 0 : calendar.month + 1;
    const ny = calendar.month === 11 ? calendar.year + 1 : calendar.year;
    regenerateCalendar(ny, nm);
  };

  const handleLocationSelect = useCallback((newCoords: Coordinates) => {
    setLocation(newCoords);
    setCoords({ lat: newCoords.lat, lng: newCoords.lng });
    fetchedRef.current = ''; // Invalidate cache for new location
  }, []);

  const goodDays = calendar.days.filter(
    (d) => d.visibility === 'visible' && d.moonLevel <= 4 && d.cloudCoverPercentage < 50
  ).length;

  // Count how many days have real API data
  const apiDays = calendar.days.filter((d) => d.cloudSource === 'api').length;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col items-center">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-6 flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-5">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ✦ AstroPlan
            </h1>
            <p className="text-xs text-slate-500 mt-1">Milky Way Photography Planner</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition-colors text-slate-400 hover:text-white"
            title="Settings"
          >
            ⚙️
          </button>
        </div>

        {/* Location search */}
        <LocationSearch onLocationSelect={handleLocationSelect} />

        {/* Location display */}
        {location && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 mb-3">
            <p className="text-xs text-slate-400 text-center truncate max-w-full">
              📍 {location.displayName} ({coords.lat.toFixed(2)}°, {coords.lng.toFixed(2)}°)
            </p>
          </div>
        )}

        {/* Weather status */}
        <div className="flex items-center gap-2 mb-2">
          {weatherLoading && (
            <span className="text-[10px] text-indigo-400 animate-pulse">⏳ Loading weather...</span>
          )}
          {!weatherLoading && apiDays > 0 && (
            <span className="text-[10px] text-emerald-400">🌤 Live weather data</span>
          )}
          {!weatherLoading && apiDays === 0 && settings.weatherApiKey && (
            <span className="text-[10px] text-yellow-400">⚠️ Using forecast (date out of 5-day range)</span>
          )}
          {!weatherLoading && !settings.weatherApiKey && (
            <span className="text-[10px] text-slate-500">📊 Mock cloud data (set API key in Settings)</span>
          )}
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between w-full mb-3">
          <button
            onClick={handlePrevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition-colors text-lg text-slate-300"
          >
            ‹
          </button>
          <div className="text-center">
            <span className="text-base font-semibold text-white">
              {MONTH_NAMES[calendar.month]} {calendar.year}
            </span>
            {goodDays > 0 && (
              <p className="text-[10px] text-emerald-400 mt-0.5">
                ★ {goodDays} good shooting {goodDays === 1 ? 'day' : 'days'} this month
              </p>
            )}
          </div>
          <button
            onClick={handleNextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition-colors text-lg text-slate-300"
          >
            ›
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mb-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> GC Rise</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> GC Set</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Moon Bright</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600" /> Dark Sky</span>
        </div>

        {/* Calendar */}
        <CalendarGrid days={calendar.days} onDayClick={setSelectedDay} />

        {/* Best days summary */}
        <BestDaysSummary days={calendar.days} onDayClick={setSelectedDay} />
      </div>

      {/* Day details modal */}
      {selectedDay && (
        <DayDetailsModal day={selectedDay} onClose={() => setSelectedDay(null)} />
      )}

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
