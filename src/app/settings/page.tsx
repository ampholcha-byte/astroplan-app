'use client';

import { useSyncExternalStore } from 'react';
import type { AppSettings } from '@/types';
import PageWrapper from '@/components/layout/PageWrapper';
import SettingsPanel from '@/components/layout/SettingsPanel';

const SETTINGS_STORAGE_KEY = 'astroplan-settings';

const DEFAULT_SETTINGS: AppSettings = {
  latitude: 13.7563,
  longitude: 100.5018,
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

// useSyncExternalStore avoids the "set-state-in-effect" warning and keeps
// client-only state correct without a flash of defaults.
const subscribe = () => () => {};

export default function SettingsPage() {
  const settings = useSyncExternalStore(
    subscribe,
    loadSettings,
    () => ({ ...DEFAULT_SETTINGS })
  );

  const handleSettingsChange = (newSettings: AppSettings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch { /* ignore */ }
    window.dispatchEvent(new Event('astroplan-settings-change'));
  };

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
