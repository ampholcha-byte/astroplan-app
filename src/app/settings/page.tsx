'use client';

import { useState, useEffect } from 'react';
import type { AppSettings, Coordinates } from '@/types';
import PageWrapper from '@/components/layout/PageWrapper';
import SettingsPanel from '@/components/layout/SettingsPanel';
import LocationSearch from '@/components/shared/LocationSearch';

const SETTINGS_STORAGE_KEY = 'astroplan-settings';
const LOCATION_STORAGE_KEY = 'astroplan-location';

const DEFAULT_SETTINGS: AppSettings = {
  latitude: 13.7563,
  longitude: 100.5018,
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => ({ ...DEFAULT_SETTINGS }));

  useEffect(() => {
    // Client-only hydration of localStorage state (correct pattern, no loop).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadSettings());
  }, []);

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch { /* ignore */ }
  };

  const handleLocationSelect = (coords: Coordinates) => {
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(coords));
      handleSettingsChange({ ...settings, latitude: coords.lat, longitude: coords.lng });
    } catch { /* ignore */ }
  };

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">⚙️ Settings</h2>
        </div>

        {/* Location change — the main place to switch shooting location */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">📍 สถานที่ถ่าย</h3>
          <LocationSearch onLocationSelect={handleLocationSelect} />
          <p className="text-[10px] text-slate-500 mt-1.5">
            ค้นหาแล้วเลือก — ปฏิทินจะใช้สถานที่นี้ทันที (หรือเลือกจากจุด Dark Sky ในหน้า Map)
          </p>
        </div>

        <SettingsPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onClose={() => {}}
          embedded
        />
      </div>
    </PageWrapper>
  );
}
