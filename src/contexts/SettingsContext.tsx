'use client';

import { createContext, useContext, useCallback, useSyncExternalStore, ReactNode } from 'react';
import { AppSettings } from '@/types';

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

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
  loaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useSyncExternalStore(
    subscribe,
    loadSettings,
    () => ({ ...DEFAULT_SETTINGS })
  );
  // On the server we can't read localStorage, so mark loaded only after mount.
  const loaded = typeof window !== 'undefined';

  const updateSettings = useCallback((newSettings: AppSettings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch { /* ignore */ }
    // Trigger a re-read so subscribers pick up the change.
    window.dispatchEvent(new Event('astroplan-settings-change'));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
