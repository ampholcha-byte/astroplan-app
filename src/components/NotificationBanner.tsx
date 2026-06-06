'use client';

import { useState, useEffect } from 'react';
import type { DayData } from '@/types';
import {
  getNotificationSettings,
  saveNotificationSettings,
  checkGoodDays,
  requestNotificationPermission,
  showNotification,
  setLastNotifiedDate,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '@/lib/notifications';

interface NotificationBannerProps {
  days: DayData[];
}

export default function NotificationBanner({ days }: NotificationBannerProps) {
  const [settings, setSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);
  const [showSetup, setShowSetup] = useState(false);
  const [notifMessage, setNotifMessage] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    setSettings(getNotificationSettings());
  }, []);

  // Check for good days on mount and when days change
  useEffect(() => {
    const msg = checkGoodDays(days, settings);
    if (msg) {
      setNotifMessage(msg);
      if ('Notification' in window && Notification.permission === 'granted') {
        showNotification(msg.title, msg.body);
        setLastNotifiedDate(new Date().toISOString().slice(0, 10));
      }
    }
  }, [days, settings]);

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      const newSettings = { ...settings, enabled: true };
      setSettings(newSettings);
      saveNotificationSettings(newSettings);
      setShowSetup(false);
    }
  };

  const handleDisable = () => {
    const newSettings = { ...settings, enabled: false };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
    setShowSetup(false);
  };

  const handleMinScoreChange = (score: number) => {
    const newSettings = { ...settings, minScore: score };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  return (
    <div className="w-full">
      {/* Notification alert */}
      {notifMessage && settings.enabled && (
        <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-xl px-4 py-3 mb-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">🔔</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-emerald-300">{notifMessage.title}</p>
              <p className="text-[10px] text-emerald-400/80 mt-0.5">{notifMessage.body}</p>
            </div>
            <button
              onClick={() => setNotifMessage(null)}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Notification settings toggle */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl px-4 py-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🔔</span>
            <div>
              <p className="text-xs text-slate-300 font-medium">Shooting Alerts</p>
              <p className="text-[10px] text-slate-500">
                {settings.enabled ? `On — min score ${settings.minScore}` : 'Off'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSetup(!showSetup)}
            className={`w-11 h-6 rounded-full transition-colors relative ${settings.enabled ? 'bg-emerald-600' : 'bg-slate-600'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-5' : ''}`}
            />
          </button>
        </div>

        {/* Setup panel */}
        {showSetup && (
          <div className="mt-3 pt-3 border-t border-slate-700/30 space-y-3">
            {!settings.enabled ? (
              <div>
                <p className="text-[10px] text-slate-400 mb-2">
                  Get notified when tomorrow is a good day for Milky Way shooting.
                </p>
                <button
                  onClick={handleEnable}
                  className="w-full py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors"
                >
                  🔔 Enable Notifications
                </button>
              </div>
            ) : (
              <>
                {/* Min score slider */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    Minimum shooting score: <span className="text-white font-semibold">{settings.minScore}</span>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    step="5"
                    value={settings.minScore}
                    onChange={(e) => handleMinScoreChange(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[8px] text-slate-600 mt-0.5">
                    <span>30 (Any)</span>
                    <span>95 (Perfect)</span>
                  </div>
                </div>

                <button
                  onClick={handleDisable}
                  className="w-full py-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors"
                >
                  Disable notifications
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
