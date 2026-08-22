import { DARK_SKY_SPOTS, distanceKm, nearestSpots, bortleColor } from '@/lib/darksky';

describe('darksky', () => {
  describe('distanceKm', () => {
    it('Bangkok → Chiang Mai is roughly 580-620 km', () => {
      const d = distanceKm(13.7563, 100.5018, 18.79, 98.98);
      expect(d).toBeGreaterThan(560);
      expect(d).toBeLessThan(640);
    });

    it('same point is 0 km', () => {
      expect(distanceKm(18.79, 98.98, 18.79, 98.98)).toBe(0);
    });
  });

  describe('nearestSpots', () => {
    it('returns Thai northern spots first from Chiang Mai', () => {
      const spots = nearestSpots(18.79, 98.98, 5);
      expect(spots.length).toBe(5);
      expect(spots[0].region).toContain('Chiang Mai');
      // sorted by distance
      const dists = spots.map((s) => distanceKm(18.79, 98.98, s.lat, s.lng));
      for (let i = 1; i < dists.length; i++) {
        expect(dists[i]).toBeGreaterThanOrEqual(dists[i - 1]);
      }
    });

    it('returns Atacama first from South America', () => {
      const spots = nearestSpots(-23.0, -67.5, 3);
      expect(spots[0].id).toBe('atacama');
    });
  });

  describe('bortleColor', () => {
    it('maps known scales and falls back for unknown', () => {
      expect(bortleColor(1)).toBe('#9ca3af');
      expect(bortleColor(9)).toBe('#ef4444');
      expect(bortleColor(99)).toBe('#64748b');
    });
  });

  it('spot list has unique ids and valid coordinates', () => {
    const ids = new Set(DARK_SKY_SPOTS.map((s) => s.id));
    expect(ids.size).toBe(DARK_SKY_SPOTS.length);
    for (const s of DARK_SKY_SPOTS) {
      expect(s.lat).toBeGreaterThanOrEqual(-90);
      expect(s.lat).toBeLessThanOrEqual(90);
      expect(s.lng).toBeGreaterThanOrEqual(-180);
      expect(s.lng).toBeLessThanOrEqual(180);
      expect(s.name.length).toBeGreaterThan(0);
    }
  });
});
