'use client';

import { useState, useCallback, useRef } from 'react';
import { WeatherData, CloudSource } from '@/types';
import { fetchWeatherForMonth } from '@/app/actions';

interface WeatherCache {
  [key: string]: Record<number, { weather: WeatherData | null; source: CloudSource }>;
}

export function useWeather() {
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<WeatherCache>({});

  const fetchWeather = useCallback(async (year: number, month: number, lat: number, lng: number) => {
    const cacheKey = `${year}-${month}-${lat.toFixed(4)}-${lng.toFixed(4)}`;

    // Return cached data if available
    if (cacheRef.current[cacheKey]) {
      return cacheRef.current[cacheKey];
    }

    setLoading(true);
    try {
      const data = await fetchWeatherForMonth(year, month, lat, lng);
      cacheRef.current[cacheKey] = data;
      return data;
    } catch (err) {
      console.warn('Weather fetch failed:', err);
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  const invalidateCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  return { fetchWeather, loading, invalidateCache };
}
