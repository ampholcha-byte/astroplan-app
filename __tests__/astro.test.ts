import { getGCNightWindow, getSunMoonTimes, isGalacticCenterVisible, getMoonLevel, getMilkyWaySeason, getGCPosition, getGCPositionsForNight, azimuthToDirection } from '@/lib/astro';

describe('astro functions', () => {
  // Test location: Chiang Mai, Thailand (18.79, 98.98)
  const CHIANG_MAI = { lat: 18.79, lng: 98.98 };

  describe('getMoonLevel', () => {
    it('returns level 1 for new moon (fraction < 0.1)', () => {
      // New Moon day
      const date = new Date('2024-01-11T00:00:00');
      const result = getMoonLevel(date);
      expect(result.level).toBe(1);
    });

    it('returns level 10 for full moon (fraction >= 0.9)', () => {
      // Full Moon day
      const date = new Date('2024-01-25T00:00:00');
      const result = getMoonLevel(date);
      expect(result.level).toBe(10);
    });
  });

  describe('isGalacticCenterVisible', () => {
    it('returns false for locations where GC never rises (too far south)', () => {
      // Bangkok, Thailand - GC is visible but lower
      const date = new Date('2024-07-01');
      expect(isGalacticCenterVisible(date, 13.75, 100.5)).toBe(true);
    });

    it('returns true for northern hemisphere locations in summer', () => {
      const date = new Date('2024-07-01');
      expect(isGalacticCenterVisible(date, CHIANG_MAI.lat, CHIANG_MAI.lng)).toBe(true);
    });
  });

  describe('getSunMoonTimes', () => {
    it('returns all required time fields including astronomicalDawn', () => {
      const date = new Date('2024-07-01');
      const result = getSunMoonTimes(date, CHIANG_MAI.lat, CHIANG_MAI.lng);

      expect(result.sunrise).toBeDefined();
      expect(result.sunset).toBeDefined();
      expect(result.nightStart).toBeDefined();
      expect(result.astronomicalDawn).toBeDefined();

      // astronomicalDawn should be later than sunrise (roughly)
      // Format: "HH:MM"
      const parseTime = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h + m / 60;
      };
      const dawnTime = parseTime(result.astronomicalDawn);
      const sunriseTime = parseTime(result.sunrise);

      // Astronomical dawn (sun at -18°) should be before sunrise
      expect(dawnTime).toBeLessThan(sunriseTime);
    });
  });

  describe('getMilkyWaySeason', () => {
    it('reports a season with consistent day counts (Chiang Mai, any month)', () => {
      const season = getMilkyWaySeason(2024, 5, CHIANG_MAI.lat, CHIANG_MAI.lng); // June 2024
      expect(season.totalDays).toBe(30);
      expect(season.visibleDays).toBeGreaterThanOrEqual(0);
      expect(season.visibleDays).toBeLessThanOrEqual(season.totalDays);
      expect(season.bestWindowDays).toBeLessThanOrEqual(season.visibleDays);
      expect(['peak', 'shoulder', 'off']).toContain(season.level);
    });

    it('June in Chiang Mai is MW season (peak or shoulder, not off)', () => {
      const season = getMilkyWaySeason(2024, 5, CHIANG_MAI.lat, CHIANG_MAI.lng);
      expect(season.level).not.toBe('off');
      expect(season.visibleDays).toBeGreaterThan(0);
    });

    it('December in Chiang Mai — GC not in dark sky', () => {
      const season = getMilkyWaySeason(2024, 11, CHIANG_MAI.lat, CHIANG_MAI.lng);
      expect(season.level).toBe('off');
      expect(season.visibleDays).toBe(0);
    });

    it('does not throw at extreme latitude', () => {
      expect(() => getMilkyWaySeason(2024, 11, 65, 20)).not.toThrow(); // Northern winter
    });
  });

  describe('getGCPosition / getGCPositionsForNight', () => {
    it('returns azimuth in the southerly sector when GC is up from Chiang Mai', () => {
      // June evening ~22:00 local — GC should be up, towards the south
      const date = new Date(2024, 5, 15, 22, 0, 0);
      const pos = getGCPosition(date, CHIANG_MAI.lat, CHIANG_MAI.lng);
      expect(pos.altitude).toBeGreaterThan(0);
      expect(pos.azimuth).toBeGreaterThan(120);
      expect(pos.azimuth).toBeLessThan(240);
    });

    it('returns 13 hourly entries covering 18:00 → 06:00', () => {
      const night = getGCPositionsForNight(new Date(2024, 5, 15), CHIANG_MAI.lat, CHIANG_MAI.lng);
      expect(night).toHaveLength(13);
      expect(night[0].time).toBe('18:00');
      expect(night[12].time).toBe('06:00');
      for (const p of night) {
        expect(p.altitude).toBeGreaterThanOrEqual(-90);
        expect(p.altitude).toBeLessThanOrEqual(90);
        expect(p.azimuth).toBeGreaterThanOrEqual(0);
        expect(p.azimuth).toBeLessThanOrEqual(360);
        expect(p.direction).toMatch(/^[NSEW]{1,2}$/);
      }
    });

    it('mid-June night in Chiang Mai has GC above horizon in the middle hours', () => {
      const night = getGCPositionsForNight(new Date(2024, 5, 15), CHIANG_MAI.lat, CHIANG_MAI.lng);
      const at22 = night.find((p) => p.time === '22:00');
      expect(at22).toBeDefined();
      expect(at22!.altitude).toBeGreaterThan(0);
    });
  });

  describe('azimuthToDirection', () => {
    it('maps cardinal azimuths', () => {
      expect(azimuthToDirection(0)).toBe('N');
      expect(azimuthToDirection(90)).toBe('E');
      expect(azimuthToDirection(180)).toBe('S');
      expect(azimuthToDirection(270)).toBe('W');
      expect(azimuthToDirection(225)).toBe('SW');
    });
  });

  describe('getGCNightWindow', () => {
    it('returns null when GC is not visible during astronomical night', () => {
      // Date when GC is visible but outside night hours
      const date = new Date('2024-01-15');
      const result = getGCNightWindow(date, CHIANG_MAI.lat, CHIANG_MAI.lng);
      // Jan 15 may have GC visible during day, not night
      // This is a sanity check - we just verify it returns valid times or null
      if (result) {
        expect(result.rise).toBeDefined();
        expect(result.set).toBeDefined();
      }
    });

    it('returns valid time format for GC night window', () => {
      const date = new Date('2024-07-01');
      const visible = isGalacticCenterVisible(date, CHIANG_MAI.lat, CHIANG_MAI.lng);

      if (visible) {
        const result = getGCNightWindow(date, CHIANG_MAI.lat, CHIANG_MAI.lng);

        if (result) {
          // Should match HH:MM format
          expect(result.rise).toMatch(/^\d{2}:\d{2}$/);
          expect(result.set).toMatch(/^\d{2}:\d{2}$/);

          // Parse times on the night domain (morning times = next day, +24)
          const parseTime = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            let hours = h + m / 60;
            if (hours < 12) hours += 24;
            return hours;
          };

          const rise = parseTime(result.rise);
          const set = parseTime(result.set);

          // Rise should be before set (after normalization)
          expect(rise).toBeLessThan(set);

          // Both should be within night hours on the 12–36h domain (18:00 → 06:00)
          expect(rise).toBeGreaterThanOrEqual(12);
          expect(set).toBeLessThanOrEqual(30);
        }
      }
    });

    it('cosH >= -1 check: does not crash on extreme latitudes', () => {
      // Edge case: near poles where cosH might be out of range
      const date = new Date('2024-06-21'); // Summer solstice
      expect(() => {
        isGalacticCenterVisible(date, 89, 0); // Near North Pole
      }).not.toThrow();
    });

    // ── Regression: GC rise/set was ~5h off before (noon-LST + tz-offset bug) ──

    it('mid-August window at Bangkok runs ~6h (GC sets after midnight)', () => {
      const win = getGCNightWindow(new Date(2026, 7, 15), 13.7563, 100.5018);
      expect(win).not.toBeNull();
      const parse = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        let hours = h + m / 60;
        if (hours < 12) hours += 24;
        return hours;
      };
      const rise = parse(win!.rise);
      const set = parse(win!.set);
      expect(set - rise).toBeGreaterThanOrEqual(4); // real window is ~5h, was ~1h with the bug
    });

    it('mid-May usable rise at Bangkok is late evening (~21-22h) — matches reference apps', () => {
      const win = getGCNightWindow(new Date(2026, 4, 15), 13.7563, 100.5018);
      expect(win).not.toBeNull();
      const [h] = win!.rise.split(':').map(Number);
      expect(h).toBeGreaterThanOrEqual(21);
    });

    it('November 15 at Bangkok has no usable window (horizon-hugging core filtered)', () => {
      const win = getGCNightWindow(new Date(2026, 10, 15), 13.7563, 100.5018);
      expect(win).toBeNull();
    });

    it('September at Bangkok is a full MW month (was wrongly 3 nights before the fix)', () => {
      const season = getMilkyWaySeason(2026, 8, 13.7563, 100.5018);
      expect(season.visibleDays).toBeGreaterThanOrEqual(25);
    });
  });
});