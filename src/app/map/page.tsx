'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AppSettings, LightPollutionData } from '@/types';
import { fetchLightPollution } from '@/app/actions';
import { nearestSpots, distanceKm, bortleColor, DarkSkySpot } from '@/lib/darksky';
import PageWrapper from '@/components/layout/PageWrapper';

const SETTINGS_STORAGE_KEY = 'astroplan-settings';
const DEFAULT_LAT = 13.7563;
const DEFAULT_LNG = 100.5018;

interface SpotWithMeta extends DarkSkySpot {
  distance: number;
  lp: LightPollutionData | null;
}

export default function MapPage() {
  const router = useRouter();
  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [spots, setSpots] = useState<SpotWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState<string | null>(null);

  useEffect(() => {
    // Client-only hydration: use saved location if present
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const s: AppSettings = JSON.parse(raw);
        if (typeof s.latitude === 'number' && typeof s.longitude === 'number') {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCoords({ lat: s.latitude, lng: s.longitude });
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const list = nearestSpots(coords.lat, coords.lng, 8).map((s) => ({
        ...s,
        distance: distanceKm(coords.lat, coords.lng, s.lat, s.lng),
        lp: null as LightPollutionData | null,
      }));
      // optimistic render first, then enrich with real light pollution data
      if (!cancelled) setSpots(list);
      const enriched = await Promise.all(
        list.map(async (s) => {
          try {
            return { ...s, lp: await fetchLightPollution(s.lat, s.lng) };
          } catch {
            return s;
          }
        })
      );
      if (!cancelled) {
        setSpots(enriched);
        setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [coords.lat, coords.lng]);

  const handleUseSpot = (spot: DarkSkySpot) => {
    setPicking(spot.id);
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      const current: AppSettings = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({ ...current, latitude: spot.lat, longitude: spot.lng })
      );
    } catch { /* ignore */ }
    router.push('/calendar');
  };

  return (
    <PageWrapper>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">🗺 Dark Sky Suggestions</h2>
        <p className="text-xs text-slate-500 mt-1">
          จุดถ่ายท้องฟ้ามืด (Bortle ต่ำ) เรียงตามระยะทางจากตำแหน่งของคุณ — กด &ldquo;ใช้จุดนี้&rdquo; เพื่อเปลี่ยนตำแหน่งในปฏิทิน
        </p>
      </div>

      {loading && (
        <p className="text-[10px] text-indigo-400 animate-pulse mb-3">⏳ กำลังเช็กค่า Bortle ของแต่ละจุด...</p>
      )}

      <div className="space-y-2.5">
        {spots.map((spot) => (
          <div
            key={spot.id}
            className="rounded-xl overflow-hidden border border-slate-700/50"
          >
            {spot.lp && (
              <div className="h-1.5 w-full" style={{ backgroundColor: bortleColor(spot.lp.bortleScale) }} />
            )}
            <div className="bg-slate-800/60 px-3 py-2.5">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate">{spot.name}</p>
                  <p className="text-[10px] text-slate-500">{spot.region}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-300 font-semibold">{spot.distance.toLocaleString()} km</p>
                  {spot.lp && (
                    <p className="text-[10px] text-slate-500">
                      Bortle <span className="font-semibold" style={{ color: bortleColor(spot.lp.bortleScale) }}>{spot.lp.bortleScale}</span>
                      {' · '}{spot.lp.label}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{spot.note}</p>
              <button
                onClick={() => handleUseSpot(spot)}
                disabled={picking === spot.id}
                className="px-3 py-1.5 text-[11px] font-medium rounded-full bg-indigo-600/80 hover:bg-indigo-500 disabled:opacity-50 text-white transition-colors"
              >
                {picking === spot.id ? 'กำลังเปิดปฏิทิน...' : '📍 ใช้จุดนี้'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[9px] text-slate-600 mt-4">
        พิกัดชี้ย่านทั่วไป — ควรสำรวจจุดตั้งกล้องจริงก่อน และเช็กสิทธิ์เข้าพื้นที่/อุทยานแต่ละแห่ง
      </p>
    </PageWrapper>
  );
}
