'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Coordinates, DayData, CalendarMonth, MoonLevel, AppSettings, WeatherData, CloudSource, LightPollutionData } from '@/types';
import { getMoonLevel, getGCNightWindow, isGalacticCenterVisible, getSunMoonTimes } from '@/lib/astro';
import { fetchWeatherForMonth, fetchLightPollution } from '@/app/actions';
import PageWrapper from '@/components/layout/PageWrapper';
import LocationSearch from '@/components/shared/LocationSearch';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import DayDetailsModal from '@/components/calendar/DayDetailsModal';
import BestDaysSummary from '@/components/calendar/BestDaysSummary';
import SettingsPanel from '@/components/layout/SettingsPanel';
import NotificationBanner from '@/components/shared/NotificationBanner';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DEFAULT_LAT = 13.7563;
const DEFAULT_LNG = 100.5018;

const SETTINGS_STORAGE_KEY = 'astroplan-settings';

const DEFAULT_SETTINGS: AppSettings = {
  latitude: DEFAULT_LAT,
  longitude: DEFAULT_LNG,
  timezone: 'Asia/Bangkok',
  useGPS: false,
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
  const gcVisible = isGalacticCenterVisible(dateObj, lat, lng);
  const galacticCenter = gcVisible ? getGCNightWindow(dateObj, lat, lng) : null;

  const cached = weatherCache[date];
  const weather = cached?.weather ?? null;
  const cloudSource: CloudSource = cached?.source ?? 'none';

  const isHoliday = date === 1;
  const sunMoon = getSunMoonTimes(dateObj, lat, lng);

  return {
    id,
    date,
    isHoliday,
    moonLevel: moon.level,
    moonPercentage: Math.round(moon.fraction * 100),
    cloudCoverPercentage: weather?.cloudCoverPercentage ?? null,
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

export default function CalendarPage() {
  const [calendar, setCalendar] = useState<CalendarMonth>(() =>
    buildMonth(new Date().getFullYear(), new Date().getMonth(), DEFAULT_LAT, DEFAULT_LNG, {}, null)
  );
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [settings, setSettings] = useState<AppSettings>(() => ({ ...DEFAULT_SETTINGS }));
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const fetchedRef = useRef<string>('');

  const [lightPollution, setLightPollution] = useState<LightPollutionData | null>(null);
  const lpFetchedRef = useRef<string>('');
  const weatherCacheRef = useRef<Record<number, { weather: WeatherData | null; source: CloudSource }>>({});

  useEffect(() => {
    setSettings(loadSettings());
    setSettingsLoaded(true);
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

      buildAndApply(year, month, weatherCache, lightPollution);
    },
    [coords, lightPollution, buildAndApply]
  );

  useEffect(() => {
    if (lightPollution && lpFetchedRef.current) {
      buildAndApply(calendar.year, calendar.month, weatherCacheRef.current, lightPollution);
    }
  }, [lightPollution, buildAndApply, calendar.year, calendar.month]);

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

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
  }, []);

  const handleLocationSelect = useCallback((newCoords: Coordinates) => {
    setLocation(newCoords);
    setCoords({ lat: newCoords.lat, lng: newCoords.lng });
    fetchedRef.current = '';
  }, []);

  const goodDays = calendar.days.filter(
    (d) => d.visibility === 'visible' && d.moonLevel <= 4 && (d.cloudCoverPercentage === null || d.cloudCoverPercentage < 50)
  ).length;

  const apiDays = calendar.days.filter((d) => d.cloudSource === 'api').length;

  const now = new Date();
  const isCurrentMonth = calendar.month === now.getMonth() && calendar.year === now.getFullYear();

  return (
    <PageWrapper>
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
          <span className="text-[10px] text-emerald-400">🌤 Live weather (Open-Meteo)</span>
        )}
        {!weatherLoading && apiDays === 0 && (
          <span className="text-[10px] text-yellow-400">⚠️ No forecast data (date out of 7-day range)</span>
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
        <div className="text-center flex-1 mx-2">
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

      {/* Notification banner */}
      <NotificationBanner days={calendar.days} />

      {/* Day details modal */}
      {selectedDay && (
        <DayDetailsModal
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
          locationName={location?.displayName ?? ''}
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
