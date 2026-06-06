import { Coordinates } from '@/types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function geocodePlaceName(query: string): Promise<Coordinates> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    // countrycodes removed — support global locations (Phase 2)
  });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'Accept-Language': 'en' },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error(`Location "${query}" not found. Please try a different place name.`);
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}
