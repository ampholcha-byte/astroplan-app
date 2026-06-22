'use client';

import PageWrapper from '@/components/layout/PageWrapper';
import SettingsPanel from '@/components/layout/SettingsPanel';
import { useState, useEffect } from 'react';
import { AppSettings } from '@/types';

const DEFAULT_SETTINGS: AppSettings = {
  latitude: 13.7563,
  longitude: 100.5018,
  timezone: 'Asia/Bangkok',
  useGPS: false,
};

const SETTINGS_STORAGE_KEY = 'astroplan-settings';

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
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setSettingsLoaded(true);
  }, []);

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch { /* ignore */ }
  };

  if (!settingsLoaded) return null;

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">⚙️ Settings</h2>
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
