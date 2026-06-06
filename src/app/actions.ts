'use server';

import { getCloudCover, getMockCloudCover } from '@/lib/weather';
import type { WeatherData } from '@/types';

export async function fetchWeatherForMonth(
  year: number,
  month: number,
  lat: number,
  lng: number,
  apiKey: string
): Promise<Record<number, { weather: WeatherData; source: 'api' | 'mock' }>> {
  const result: Record<number, { weather: WeatherData; source: 'api' | 'mock' }> = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const promises = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    // Shift to midnight local to avoid timezone issues
    date.setHours(0, 0, 0, 0);
    promises.push(
      fetchDayWeather(date, lat, lng, apiKey).then((data) => {
        result[d] = data;
      })
    );
  }

  await Promise.all(promises);
  return result;
}

async function fetchDayWeather(
  date: Date,
  lat: number,
  lng: number,
  apiKey: string
): Promise<{ weather: WeatherData; source: 'api' | 'mock' }> {
  // Try API first
  if (apiKey) {
    const apiData = await getCloudCover(lat, lng, date, apiKey);
    if (apiData) {
      return { weather: apiData, source: 'api' };
    }
  }

  // Fallback to mock
  return { weather: getMockCloudCover(date), source: 'mock' };
}
