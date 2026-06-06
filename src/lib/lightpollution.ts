export interface LightPollutionData {
  /** Sky brightness in mpsas (magnitudes per square arcsecond) */
  brightness: number;
  /** Bortle scale 1-9 (1 = darkest, 9 = most polluted) */
  bortleScale: number;
  /** Human-readable label */
  label: string;
  /** Color for UI display */
  color: string;
}

/**
 * Bortle scale classification based on sky brightness (mpsas).
 * Higher mpsas = darker sky = better for astrophotography.
 */
function classifyBortle(brightness: number): { scale: number; label: string; color: string } {
  if (brightness >= 21.99) return { scale: 1, label: 'Excellent dark sky', color: 'text-gray-100' };
  if (brightness >= 21.89) return { scale: 2, label: 'Typical dark sky', color: 'text-blue-300' };
  if (brightness >= 21.69) return { scale: 3, label: 'Rural sky', color: 'text-cyan-300' };
  if (brightness >= 20.49) return { scale: 4, label: 'Rural/suburban transition', color: 'text-green-300' };
  if (brightness >= 19.50) return { scale: 5, label: 'Suburban sky', color: 'text-yellow-300' };
  if (brightness >= 18.94) return { scale: 6, label: 'Bright suburban', color: 'text-orange-300' };
  if (brightness >= 18.38) return { scale: 7, label: 'Suburban/urban transition', color: 'text-orange-400' };
  if (brightness >= 17.88) return { scale: 8, label: 'City sky', color: 'text-red-400' };
  return { scale: 9, label: 'Inner-city sky', color: 'text-red-500' };
}

/**
 * Estimate light pollution based on coordinates.
 *
 * Uses the World Atlas of Artificial Night Sky Brightness data
 * via the lightpollutionmap.info API (tile-based).
 *
 * For simplicity in Phase 2, we use a proxy approach:
 * - Fetch from the lightpollutionmap.info API
 * - Fall back to estimation based on known dark sky locations in Thailand
 */
export async function getLightPollution(
  lat: number,
  lng: number
): Promise<LightPollutionData | null> {
  try {
    // Light Pollution Map uses a specific API endpoint
    // The map tiles encode brightness values; we use their data API
    const url = `https://www.lightpollutionmap.info/QueryRaster/?ql=wa_2015&qt=point&qd=${lng},${lat}&key=`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h

    if (!res.ok) {
      return estimateFromLocation(lat, lng);
    }

    const text = await res.text();
    const brightness = parseFloat(text.trim());

    if (isNaN(brightness) || brightness <= 0) {
      return estimateFromLocation(lat, lng);
    }

    const bortle = classifyBortle(brightness);
    return {
      brightness: Math.round(brightness * 100) / 100,
      bortleScale: bortle.scale,
      label: bortle.label,
      color: bortle.color,
    };
  } catch {
    return estimateFromLocation(lat, lng);
  }
}

/**
 * Fallback: estimate light pollution based on known locations.
 * Used when API is unavailable.
 */
function estimateFromLocation(lat: number, lng: number): LightPollutionData | null {
  // Known dark sky locations in Thailand (approximate)
  const darkSkyLocations = [
    { name: 'Doi Inthanon', lat: 18.58, lng: 98.48, brightness: 21.5 },
    { name: 'Khao Yai', lat: 14.44, lng: 101.37, brightness: 20.8 },
    { name: 'Mae Hong Son', lat: 19.30, lng: 97.97, brightness: 21.2 },
    { name: 'Pha Taem', lat: 15.52, lng: 105.60, brightness: 21.0 },
    { name: 'Khao Sok', lat: 8.92, lng: 98.53, brightness: 21.3 },
    { name: 'Doi Chiang Dao', lat: 19.40, lng: 98.87, brightness: 21.6 },
    { name: 'Phu Kradueng', lat: 16.88, lng: 101.80, brightness: 21.0 },
    { name: 'Erawan', lat: 14.38, lng: 99.15, brightness: 20.5 },
  ];

  // Major cities (high pollution)
  const cities = [
    { name: 'Bangkok', lat: 13.75, lng: 100.50, brightness: 17.5 },
    { name: 'Chiang Mai', lat: 18.79, lng: 98.98, brightness: 18.8 },
    { name: 'Phuket', lat: 7.88, lng: 98.39, brightness: 18.5 },
    { name: 'Pattaya', lat: 12.92, lng: 100.88, brightness: 18.0 },
    { name: 'Hat Yai', lat: 7.00, lng: 100.47, brightness: 18.2 },
    { name: 'Khon Kaen', lat: 16.43, lng: 102.83, brightness: 19.0 },
  ];

  // Find nearest location
  let nearest = null;
  let minDist = Infinity;

  for (const loc of [...darkSkyLocations, ...cities]) {
    const dist = Math.sqrt((lat - loc.lat) ** 2 + (lng - loc.lng) ** 2);
    if (dist < minDist) {
      minDist = dist;
      nearest = loc;
    }
  }

  if (!nearest) return null;

  // Interpolate: if within ~50km of a known location, use its brightness
  // Otherwise estimate based on distance from nearest city
  let brightness = nearest.brightness;
  if (minDist > 0.5) {
    // More than ~50km away from known location, darken slightly
    brightness = Math.min(21.99, nearest.brightness + 0.3);
  }

  const bortle = classifyBortle(brightness);
  return {
    brightness: Math.round(brightness * 100) / 100,
    bortleScale: bortle.scale,
    label: bortle.label,
    color: bortle.color,
  };
}
