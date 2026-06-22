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
 * Estimate light pollution based on coordinates using a global model.
 *
 * Uses the World Atlas of Artificial Night Sky Brightness (2015) data
 * via lightpollutionmap.info's public query API.
 *
 * Falls back to a distance-based estimation from known reference points
 * when the API is unavailable.
 */
export async function getLightPollution(
  lat: number,
  lng: number
): Promise<LightPollutionData | null> {
  try {
    // lightpollutionmap.info public query endpoint
    // Returns sky brightness in mpsas as plain text
    const url = `https://www.lightpollutionmap.info/QueryRaster/?ql=wa_2015&qt=point&qd=${lng},${lat}&key=`;
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const text = await res.text();
      const brightness = parseFloat(text.trim());

      if (!isNaN(brightness) && brightness > 0) {
        const bortle = classifyBortle(brightness);
        return {
          brightness: Math.round(brightness * 100) / 100,
          bortleScale: bortle.scale,
          label: bortle.label,
          color: bortle.color,
        };
      }
    }
  } catch {
    // API unavailable — fall through to estimation
  }

  return estimateFromLocation(lat, lng);
}

/**
 * Fallback: estimate light pollution from a global set of reference points.
 * Uses inverse-distance weighting for interpolation.
 */
function estimateFromLocation(lat: number, lng: number): LightPollutionData | null {
  // Global reference points: [lat, lng, brightness_mpsas]
  // Covers major dark sky areas and cities worldwide
  const referencePoints: [number, number, number][] = [
    // Dark sky reserves
    [-33.7, 150.3, 21.7],   // Greater Blue Mountains, Australia
    [-25.3, 131.0, 21.9],   // Uluru, Australia
    [36.5, -118.6, 21.8],   // Death Valley, USA
    [37.7, -119.5, 21.7],   // Yosemite, USA
    [64.2, -15.2, 21.9],    // Iceland interior
    [-22.9, -67.8, 21.9],   // Atacama Desert, Chile
    [28.0, 86.9, 21.8],     // Himalayas
    [78.0, 15.0, 21.9],     // Svalbard, Norway
    [-54.3, -67.5, 21.8],   // Tierra del Fuego
    [35.3, 25.4, 21.5],     // Crete, Greece

    // Thailand dark sky
    [18.58, 98.48, 21.5],   // Doi Inthanon
    [14.44, 101.37, 20.8],  // Khao Yai
    [19.30, 97.97, 21.2],   // Mae Hong Son
    [8.92, 98.53, 21.3],    // Khao Sok
    [19.40, 98.87, 21.6],   // Doi Chiang Dao

    // Major cities (high pollution)
    [13.75, 100.50, 17.5],  // Bangkok
    [18.79, 98.98, 18.8],   // Chiang Mai
    [7.88, 98.39, 18.5],    // Phuket
    [35.68, 139.69, 16.8],  // Tokyo
    [51.51, -0.13, 16.5],   // London
    [40.71, -74.01, 16.0],  // New York
    [37.57, 126.98, 16.2],  // Seoul
    [31.23, 121.47, 15.8],  // Shanghai
    [19.43, -99.13, 16.5],  // Mexico City
    [-23.55, -46.63, 16.8], // São Paulo
    [28.61, 77.23, 16.0],   // Delhi
    [1.35, 103.82, 15.5],   // Singapore
  ];

  // Inverse-distance weighting (power=2)
  let weightSum = 0;
  let brightnessSum = 0;

  for (const [refLat, refLng, refBright] of referencePoints) {
    const dist = Math.sqrt((lat - refLat) ** 2 + (lng - refLng) ** 2);
    // Avoid division by zero for exact matches
    const weight = 1 / (dist * dist + 0.001);
    weightSum += weight;
    brightnessSum += weight * refBright;
  }

  const brightness = brightnessSum / weightSum;
  const bortle = classifyBortle(brightness);

  return {
    brightness: Math.round(brightness * 100) / 100,
    bortleScale: bortle.scale,
    label: bortle.label,
    color: bortle.color,
  };
}
