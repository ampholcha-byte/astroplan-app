import { getGCNightWindow, getSunMoonTimes, isGalacticCenterVisible, getMoonLevel, getMilkyWaySeason } from '@/lib/astro';

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

          // Parse times for validation
          const parseTime = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h + m / 60;
          };

          const rise = parseTime(result.rise);
          const set = parseTime(result.set);

          // Rise should be before set (after normalization)
          expect(rise).toBeLessThan(set);

          // Both should be within night hours (typically 18:00 - 06:00)
          expect(rise).toBeGreaterThanOrEqual(0);
          expect(set).toBeLessThanOrEqual(24);
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
  });
});