'use client';

import { useState, useCallback, useRef } from 'react';
import { LightPollutionData } from '@/types';
import { fetchLightPollution } from '@/app/actions';

export function useLightPollution() {
  const [data, setData] = useState<LightPollutionData | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchedKeyRef = useRef<string>('');

  const fetchLP = useCallback(async (lat: number, lng: number) => {
    const key = `${lat.toFixed(4)}-${lng.toFixed(4)}`;
    if (fetchedKeyRef.current === key && data) return data;

    setLoading(true);
    fetchedKeyRef.current = key;
    try {
      const result = await fetchLightPollution(lat, lng);
      setData(result);
      return result;
    } catch (err) {
      console.warn('Light pollution fetch failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [data]);

  return { data, loading, fetch: fetchLP };
}
