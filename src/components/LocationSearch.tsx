'use client';

import { useState, useRef, useEffect } from 'react';
import { Coordinates } from '@/types';
import { geocodePlaceName } from '@/lib/geocoding';

interface LocationSearchProps {
  onLocationSelect: (coords: Coordinates) => void;
}

const STORAGE_KEY = 'astroplan-recent-locations';
const MAX_RECENT = 5;

function getRecentLocations(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentLocation(query: string) {
  try {
    const recent = getRecentLocations();
    const updated = [query, ...recent.filter((q) => q !== query)].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

export default function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecent(getRecentLocations());
  }, []);

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) {
      setError('Please enter a place name.');
      return;
    }
    setError(null);
    setLoading(true);
    setShowRecent(false);
    try {
      const coords = await geocodePlaceName(q);
      onLocationSelect(coords);
      saveRecentLocation(q);
      setRecent(getRecentLocations());
      setQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationSelect({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          displayName: `${position.coords.latitude.toFixed(4)}°, ${position.coords.longitude.toFixed(4)}° (GPS)`,
        });
        setGpsLoading(false);
      },
      (err) => {
        setError(err.code === 1 ? 'Location permission denied.' : 'Could not get your location.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="w-full max-w-sm mx-auto mb-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowRecent(true); }}
            onFocus={() => setShowRecent(true)}
            onBlur={() => setTimeout(() => setShowRecent(false), 200)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter place name (e.g., Chiang Mai)"
            className="w-full px-3 py-2 text-sm border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-800 text-white placeholder-slate-500"
          />
          {/* Recent dropdown */}
          {showRecent && recent.length > 0 && !query.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-20 overflow-hidden">
              <div className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-wide">Recent</div>
              {recent.map((r) => (
                <button
                  key={r}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                  onMouseDown={() => { setQuery(r); handleSearch(r); }}
                >
                  📍 {r}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '...' : '🔍'}
        </button>
        <button
          onClick={handleGPS}
          disabled={gpsLoading}
          className="px-3 py-2 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Use current location"
        >
          {gpsLoading ? '...' : '📡'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
