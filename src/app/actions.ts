'use server';

import { getLightPollution } from '@/lib/lightpollution';
import type { WeatherData, LightPollutionData } from '@/types';

export async function fetchWeatherForMonth(
  year: number,
  month: number,
  lat: number,
  lng: number
): Promise<Record<number, { weather: WeatherData | null; source: 'api' | 'none' }>> {
  const result: Record<number, { weather: WeatherData | null; source: 'api' | 'none' }> = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const monthStartStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const monthEndStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  // Determine which API to use:
  // - If entire month is in the past → archive API
  // - If entire month is within 7-day forecast → forecast API
  // - If month spans both → fetch from both and merge
  let forecastData: Record<string, WeatherData> = {};
  let archiveData: Record<string, WeatherData> = {};

  const monthEnd = new Date(year, month + 1, 0);
  const monthStart = new Date(year, month, 1);
  const isEntirelyPast = monthEnd < today;
  const isEntirelyFuture = monthStart > new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);

  if (!isEntirelyPast) {
    // Some/all days might be covered by forecast
    forecastData = await fetchOpenMeteoForecast(lat, lng);
  }

  if (!isEntirelyFuture) {
    // Some/all days might be covered by archive
    const archiveStart = isEntirelyPast ? monthStartStr : todayStr;
    const archiveEnd = isEntirelyPast ? monthEndStr : todayStr;
    archiveData = await fetchOpenMeteoArchive(lat, lng, archiveStart, archiveEnd);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const targetStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // Prefer forecast data (more accurate for near-term), fall back to archive
    const matched = forecastData[targetStr] ?? archiveData[targetStr];
    if (matched) {
      result[d] = { weather: matched, source: 'api' };
    } else {
      result[d] = { weather: null, source: 'none' };
    }
  }

  return result;
}

async function fetchOpenMeteoArchive(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string
): Promise<Record<string, WeatherData>> {
  // Open-Meteo Historical Archive API — free, no key, back to 1940
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${startDate}&end_date=${endDate}&daily=cloudcover_mean,weather_code&hourly=relativehumidity_2m,wind_speed_10m&timezone=auto`;
  const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h for historical data

  if (!res.ok) return {};

  const data = await res.json();
  if (!data.daily?.time) return {};

  // Build date -> daily cloud cover map
  const cloudByDate: Record<string, number> = {};
  const codeByDate: Record<string, number> = {};
  for (let i = 0; i < data.daily.time.length; i++) {
    cloudByDate[data.daily.time[i]] = data.daily.cloudcover_mean[i] ?? 0;
    codeByDate[data.daily.time[i]] = data.daily.weather_code[i] ?? 0;
  }

  // Build date -> hourly entries map (pick midday)
  const hourlyByDate: Record<string, { humidity: number; wind: number; hour: number }> = {};
  if (data.hourly?.time) {
    for (let i = 0; i < data.hourly.time.length; i++) {
      const dateStr = data.hourly.time[i].slice(0, 10);
      const hour = new Date(data.hourly.time[i]).getHours();
      if (!hourlyByDate[dateStr] || Math.abs(hour - 12) < Math.abs(hourlyByDate[dateStr].hour - 12)) {
        hourlyByDate[dateStr] = {
          humidity: data.hourly.relativehumidity_2m[i] ?? 0,
          wind: data.hourly.wind_speed_10m[i] ?? 0,
          hour,
        };
      }
    }
  }

  const result: Record<string, WeatherData> = {};
  for (const dateStr of Object.keys(cloudByDate)) {
    const h = hourlyByDate[dateStr];
    const code = codeByDate[dateStr] ?? 0;
    result[dateStr] = {
      cloudCoverPercentage: cloudByDate[dateStr],
      humidity: h?.humidity ?? 0,
      windSpeed: h?.wind ?? 0,
      description: weatherCodeToDesc(code),
      icon: '',
    };
  }

  return result;
}

async function fetchOpenMeteoForecast(
  lat: number,
  lng: number
): Promise<Record<string, WeatherData>> {
  // Open-Meteo: free, no API key required, 7-day forecast
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=cloudcover_mean&hourly=relativehumidity_2m,wind_speed_10m,weather_code&timezone=auto&forecast_days=7`;
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) return {};

  const data = await res.json();
  if (!data.daily?.time || !data.hourly?.time) return {};

  // Build date -> daily cloud cover map
  const cloudByDate: Record<string, number> = {};
  for (let i = 0; i < data.daily.time.length; i++) {
    cloudByDate[data.daily.time[i]] = data.daily.cloudcover_mean[i] ?? 0;
  }

  // Build date -> hourly entries map (pick midday ~index 12)
  const hourlyByDate: Record<string, { humidity: number; wind: number; code: number; hour: number }> = {};
  for (let i = 0; i < data.hourly.time.length; i++) {
    const dateStr = data.hourly.time[i].slice(0, 10);
    const hour = new Date(data.hourly.time[i]).getHours();
    // Prefer midday readings
    if (!hourlyByDate[dateStr] || Math.abs(hour - 12) < Math.abs(hourlyByDate[dateStr].hour - 12)) {
      hourlyByDate[dateStr] = {
        humidity: data.hourly.relativehumidity_2m[i] ?? 0,
        wind: data.hourly.wind_speed_10m[i] ?? 0,
        code: data.hourly.weather_code[i] ?? 0,
        hour,
      };
    }
  }

  const result: Record<string, WeatherData> = {};
  for (const dateStr of Object.keys(cloudByDate)) {
    const h = hourlyByDate[dateStr];
    result[dateStr] = {
      cloudCoverPercentage: cloudByDate[dateStr],
      humidity: h?.humidity ?? 0,
      windSpeed: h?.wind ?? 0,
      description: weatherCodeToDesc(h?.code ?? 0),
      icon: '',
    };
  }

  return result;
}

function weatherCodeToDesc(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  return 'Thunderstorm';
}

export async function fetchLightPollution(
  lat: number,
  lng: number
): Promise<LightPollutionData | null> {
  return getLightPollution(lat, lng);
}
