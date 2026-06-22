'use client';

import { useState } from 'react';
import { AppSettings } from '@/types';

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onClose: () => void;
}

export default function SettingsPanel({ settings, onSettingsChange, onClose }: SettingsPanelProps) {
  const [local, setLocal] = useState<AppSettings>({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSettingsChange(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-700/50 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-gray-300 text-lg transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          {/* Default Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Default Location
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={local.latitude}
                  onChange={(e) => setLocal({ ...local, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-slate-600 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={local.longitude}
                  onChange={(e) => setLocal({ ...local, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-slate-600 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Timezone
            </label>
            <select
              value={local.timezone}
              onChange={(e) => setLocal({ ...local, timezone: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-600 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Asia/Bangkok">Bangkok (UTC+7)</option>
              <option value="Asia/Chiang_Mai">Chiang Mai (UTC+7)</option>
              <option value="Asia/Phuket">Phuket (UTC+7)</option>
              <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
              <option value="Australia/Sydney">Sydney (UTC+10/+11)</option>
              <option value="Europe/London">London (UTC+0/+1)</option>
              <option value="America/Los_Angeles">Los Angeles (UTC-8/-7)</option>
              <option value="America/New_York">New York (UTC-5/-4)</option>
            </select>
          </div>

          {/* Auto GPS */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-300">Auto-detect location</div>
              <div className="text-[10px] text-slate-500">Use GPS on app start</div>
            </div>
            <button
              onClick={() => setLocal({ ...local, useGPS: !local.useGPS })}
              className={`w-11 h-6 rounded-full transition-colors relative ${local.useGPS ? 'bg-indigo-600' : 'bg-slate-600'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${local.useGPS ? 'translate-x-5' : ''}`}
              />
            </button>
          </div>

          {/* Weather API Key */}
          <div className="text-center py-4">
            <p className="text-xs text-slate-500">🌤 Weather data from Open-Meteo (free, no API key)</p>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700/50" />

          {/* About */}
          <div className="text-center text-xs text-slate-500">
            <p className="font-semibold text-slate-400">AstroPlan v0.1.0</p>
            <p className="mt-1">Milky Way Photography Planner</p>
            <p className="mt-1">Built with Next.js + SunCalc</p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-colors bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {saved ? '✅ Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
