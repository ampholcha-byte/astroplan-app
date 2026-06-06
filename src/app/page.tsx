'use client';

import { useState, useCallback, useEffect } from 'react';
import { Coordinates, DayData, CalendarMonth, MoonLevel, AppSettings } from '@/types';
import { getMoonLevel, getGalacticCenterTimes, isGalacticCenterVisible } from '@/lib/astro';
import LocationSearch from '@/components/LocationSearch';
import CalendarGrid from '@/components/CalendarGrid';
import DayDetailsModal from '@/components/DayDetailsModal';
import BestDaysSummary from '@/components/BestDaysSummary';
import SettingsPanel from '@/components/SettingsPanel';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function generateRealMonth(year: number, month: number, lat: number, lng: number): CalendarMonth {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const days: DayData[] = [];

  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    days.push(createPaddingDay(year, month - 1, d, lat, lng));
  }

  // Current month — real data
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(createRealDay(year, month, d, lat, lng));
  }

  // Next month padding to fill 5 weeks (35 cells)
  const remaining = 35 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push(createPaddingDay(year, month + 1, d, lat, lng));
  }

  return { year, month, days };
}

function createPaddingDay(year: number, month: number, date: number, lat: number, lng: number): DayData {
  const monthIdx = month < 0 ? 11 : month > 11 ? 0 : month;
  const y = month < 0 ? year - 1 : month > 11 ? year + 1 : year;
  return createRealDay(y, monthIdx, date, lat, lng);
}

function createRealDay(year: number, month: number, date: number, lat: number, lng: number): DayData {
  const id = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
  const dateObj = new Date(year, month, date);

  // Real moon data from suncalc
  const moon = getMoonLevel(dateObj);

  // Real Galactic Center data
  const gcVisible = isGalacticCenterVisible(dateObj, lat, lng);
  const galacticCenter = gcVisible ? getGalacticCenterTimes(dateObj, lat, lng) : null;

  // Mock cloud cover for now (Phase 2 will add real weather API)
  const cloudCoverPercentage = Math.round(((Math.cos(date * 2) * 10000) % 1 + 1) % 1 * 100);

  const isHoliday = date === 1 || date === 15 || date % 7 === 0;

  return {
    id,
    date,
    isHoliday,
    moonLevel: moon.level,
    moonPercentage: Math.round(moon.fraction * 100),
    cloudCoverPercentage,
    galacticCenter,
    visibility: gcVisible ? 'visible' : 'hidden',
  };
}

// Default location: Bangkok
const DEFAULT_LAT = 13.7563;
const DEFAULT_LNG = 100.5018;

const DEFAULT_SETTINGS: AppSettings = {
  latitude: DEFAULT_LAT,
  longitude: DEFAULT_LNG,
  timezone: 'Asia/Bangkok',
  useGPS: false,
};

export default function Home() {
  const [calendar, setCalendar] = useState<CalendarMonth>(() =>
    generateRealMonth(new Date().getFullYear(), new Date().getMonth(), DEFAULT_LAT, DEFAULT_LNG)
  );
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  });
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  const regenerateCalendar = useCallback(
    (year: number, month: number) => {
      setCalendar(generateRealMonth(year, month, coords.lat, coords.lng));
    },
    [coords]
  );

  useEffect(() => {
    regenerateCalendar(calendar.year, calendar.month);
  }, [coords.lat, coords.lng]);

  const handlePrevMonth = () => {
    const prevMonth = calendar.month === 0 ? 11 : calendar.month - 1;
    const prevYear = calendar.month === 0 ? calendar.year - 1 : calendar.year;
    regenerateCalendar(prevYear, prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = calendar.month === 11 ? 0 : calendar.month + 1;
    const nextYear = calendar.month === 11 ? calendar.year + 1 : calendar.year;
    regenerateCalendar(nextYear, nextMonth);
  };

  const handleLocationSelect = useCallback((newCoords: Coordinates) => {
    setLocation(newCoords);
    setCoords({ lat: newCoords.lat, lng: newCoords.lng });
  }, []);

  // Count good shooting days this month
  const goodDays = calendar.days.filter(
    (d) => d.visibility === 'visible' && d.moonLevel <= 4 && d.cloudCoverPercentage < 50
  ).length;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col items-center">
      {/* Starfield background effect */}
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
