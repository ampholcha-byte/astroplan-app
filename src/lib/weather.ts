import type { WeatherData } from '@/types';

// ── OpenWeatherMap 5-day / 3-hour forecast API ──
// Free tier: 5-day forecast with 3-hour steps
// Docs: https://openweathermap.org/forecast5

const OWM_BASE = 'https://api.openweathermap.org/data/2.5/forecast';

/**
 * Fetch cloud cover data for a specific date and location.
 * Uses OpenWeatherMap 5-day forecast API (free tier).
 * Returns null if date is beyond 5-day forecast range or API fails.
 */
export async function getCloudCover(
  lat: number,
  lng: number,
  date: Date,
  apiKey: string
): Promise<WeatherData | null> {
  if (!apiKey) return null;

  try {
    const url = `${OWM_BASE}?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hour

    if (!res.ok) {
      console.warn(`Weather API error: ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (!data.list || !Array.isArray(data.list)) return null;

    // Find forecast entries matching the target date
    const targetDateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
    const dayForecasts = data.list.filter((entry: { dt_txt: string }) =>
      entry.dt_txt.startsWith(targetDateStr)
    );

    if (dayForecasts.length === 0) return null;

    // Average cloud cover across all 3-hour slots for that day
    const avgCloud = Math.round(
      dayForecasts.reduce((sum: number, entry: { clouds: { all: number } }) => sum + (entry.clouds?.all ?? 0), 0) / dayForecasts.length
    );

    // Use the midday entry (or first available) for other metrics
    const midday = dayForecasts.find((e: { dt_txt: string }) => e.dt_txt.includes('12:00')) ?? dayForecasts[0];

    return {
      cloudCoverPercentage: avgCloud,
      humidity: midday.main?.humidity ?? 0,
      windSpeed: midday.wind?.speed ?? 0,
      description: midday.weather?.[0]?.description ?? '',
      icon: midday.weather?.[0]?.icon ?? '01d',
    };
  } catch (err) {
    console.warn('Weather fetch failed:', err);
    return null;
  }
}

/**
 * Generate deterministic mock cloud cover based on date.
 * Used as fallback when API key is not configured or date is out of range.
 */
export function getMockCloudCover(date: Date): WeatherData {
  const seed = date.getDate() + date.getMonth() * 31;
  const cloud = Math.round(((Math.cos(seed * 2) * 10000) % 1 + 1) % 1 * 100);
  return {
    cloudCoverPercentage: cloud,
    humidity: 50 + (seed % 40),
    windSpeed: 1 + (seed % 5),
    description: cloud < 30 ? 'clear sky' : cloud < 60 ? 'scattered clouds' : 'overcast clouds',
    icon: cloud < 30 ? '01d' : cloud < 60 ? '03d' : '04d',
  };
}
