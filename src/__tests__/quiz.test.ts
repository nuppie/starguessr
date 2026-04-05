import { describe, it, expect } from 'vitest';
import { getFilteredConstellations, pickNextConstellation, checkTap } from '../quiz';
import { constellations, Constellation } from '../constellations';

describe('getFilteredConstellations', () => {
  it('returns all constellations for "all"', () => {
    const result = getFilteredConstellations('all');
    expect(result.length).toBe(constellations.length);
  });

  it('filters by easy', () => {
    const result = getFilteredConstellations('easy');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(c => c.difficulty === 'easy')).toBe(true);
  });

  it('filters by medium', () => {
    const result = getFilteredConstellations('medium');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(c => c.difficulty === 'medium')).toBe(true);
  });

  it('filters by hard', () => {
    const result = getFilteredConstellations('hard');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(c => c.difficulty === 'hard')).toBe(true);
  });
});

describe('pickNextConstellation', () => {
  const pool = constellations.slice(0, 5);

  it('returns a constellation from the pool', () => {
    const result = pickNextConstellation(pool, {}, null);
    expect(pool.some(c => c.id === result.id)).toBe(true);
  });

  it('avoids repeating the current constellation', () => {
    // Run many times to check statistically
    const currentId = pool[0].id;
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(pickNextConstellation(pool, {}, currentId).id);
    }
    expect(results.has(currentId)).toBe(false);
  });

  it('handles single-item pool', () => {
    const single = [pool[0]];
    const result = pickNextConstellation(single, {}, null);
    expect(result.id).toBe(pool[0].id);
  });

  it('throws on empty pool', () => {
    expect(() => pickNextConstellation([], {}, null)).toThrow();
  });

  it('prefers constellations with lower accuracy', () => {
    const stats = {
      [pool[0].id]: { correct: 10, attempts: 10 }, // 100% accuracy
      [pool[1].id]: { correct: 0, attempts: 10 },  // 0% accuracy
    };
    const counts: Record<string, number> = {};
    for (let i = 0; i < 200; i++) {
      const r = pickNextConstellation(pool, stats, null);
      counts[r.id] = (counts[r.id] || 0) + 1;
    }
    // pool[1] should appear more often than pool[0]
    expect(counts[pool[1].id] || 0).toBeGreaterThan(counts[pool[0].id] || 0);
  });
});

describe('checkTap', () => {
  const orion = constellations.find(c => c.id === 'orion')!;

  it('returns correct for tap near constellation center', () => {
    const result = checkTap(orion.centerRa, orion.centerDec, orion, 8);
    expect(result.correct).toBe(true);
    expect(result.distance).toBeLessThan(1);
  });

  it('returns correct for tap near a star', () => {
    const star = orion.stars[0]; // Betelgeuse
    const result = checkTap(star.ra, star.dec, orion, 8);
    expect(result.correct).toBe(true);
  });

  it('returns incorrect for tap far away', () => {
    // Tap at RA 18h, Dec -60 — far from Orion
    const result = checkTap(18, -60, orion, 8);
    expect(result.correct).toBe(false);
  });

  it('adjusts threshold based on zoom', () => {
    // At low zoom, threshold is larger
    const farPoint = { ra: orion.centerRa + 1.5, dec: orion.centerDec };
    const lowZoom = checkTap(farPoint.ra, farPoint.dec, orion, 3);
    const highZoom = checkTap(farPoint.ra, farPoint.dec, orion, 20);
    // Low zoom should be more forgiving
    expect(lowZoom.correct || !highZoom.correct).toBe(true);
  });
});
