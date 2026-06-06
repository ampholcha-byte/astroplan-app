'use server';

import { getCloudCover, getMockCloudCover } from '@/lib/weather';
import { getLightPollution } from '@/lib/lightpollution';
import type { WeatherData, LightPollutionData } from '@/types';

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
  if (apiKey) {
    const apiData = await getCloudCover(lat, lng, date, apiKey);
    if (apiData) {
      return { weather: apiData, source: 'api' };
    }
  }
  return { weather: getMockCloudCover(date), source: 'mock' };
}

export async function fetchLightPollution(
  lat: number,
  lng: number
): Promise<LightPollutionData | null> {
  return getLightPollution(lat, lng);
}
