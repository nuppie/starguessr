import { describe, it, expect } from 'vitest';
import { constellations, backgroundStars } from '../constellations';

describe('constellations data', () => {
  it('has at least 10 constellations', () => {
    expect(constellations.length).toBeGreaterThanOrEqual(10);
  });

  it('each constellation has unique id', () => {
    const ids = constellations.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each constellation has valid stars', () => {
    for (const c of constellations) {
      expect(c.stars.length).toBeGreaterThan(0);
      for (const s of c.stars) {
        expect(s.ra).toBeGreaterThanOrEqual(0);
        expect(s.ra).toBeLessThan(24);
        expect(s.dec).toBeGreaterThanOrEqual(-90);
        expect(s.dec).toBeLessThanOrEqual(90);
      }
    }
  });

  it('line indices are valid', () => {
    for (const c of constellations) {
      for (const line of c.lines) {
        expect(line.from).toBeGreaterThanOrEqual(0);
        expect(line.from).toBeLessThan(c.stars.length);
        expect(line.to).toBeGreaterThanOrEqual(0);
        expect(line.to).toBeLessThan(c.stars.length);
      }
    }
  });

  it('has all difficulty levels', () => {
    const diffs = new Set(constellations.map(c => c.difficulty));
    expect(diffs.has('easy')).toBe(true);
    expect(diffs.has('medium')).toBe(true);
    expect(diffs.has('hard')).toBe(true);
  });

  it('center RA/Dec are within valid ranges', () => {
    for (const c of constellations) {
      expect(c.centerRa).toBeGreaterThanOrEqual(0);
      expect(c.centerRa).toBeLessThan(24);
      expect(c.centerDec).toBeGreaterThanOrEqual(-90);
      expect(c.centerDec).toBeLessThanOrEqual(90);
    }
  });
});

describe('backgroundStars', () => {
  it('has many stars', () => {
    expect(backgroundStars.length).toBeGreaterThan(100);
  });

  it('star coordinates are valid', () => {
    for (const s of backgroundStars) {
      expect(s.ra).toBeGreaterThanOrEqual(0);
      expect(s.ra).toBeLessThan(24);
      expect(s.dec).toBeGreaterThanOrEqual(-90);
      expect(s.dec).toBeLessThanOrEqual(90);
    }
  });
});
