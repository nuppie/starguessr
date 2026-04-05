import { describe, it, expect } from 'vitest';
import {
  clampCamera,
  panCamera,
  zoomCamera,
  raDecToScreen,
  screenToRaDec,
  lerpCamera,
  ZOOM_MIN,
  ZOOM_MAX,
  DEC_MIN,
  DEC_MAX,
} from '../camera';

describe('clampCamera', () => {
  it('wraps RA into 0-24 range', () => {
    expect(clampCamera({ centerRa: 25, centerDec: 0, zoom: 10 }).centerRa).toBeCloseTo(1);
    expect(clampCamera({ centerRa: -2, centerDec: 0, zoom: 10 }).centerRa).toBeCloseTo(22);
  });

  it('clamps Dec to bounds', () => {
    expect(clampCamera({ centerRa: 0, centerDec: 100, zoom: 10 }).centerDec).toBe(DEC_MAX);
    expect(clampCamera({ centerRa: 0, centerDec: -100, zoom: 10 }).centerDec).toBe(DEC_MIN);
  });

  it('clamps zoom to bounds', () => {
    expect(clampCamera({ centerRa: 0, centerDec: 0, zoom: 0 }).zoom).toBe(ZOOM_MIN);
    expect(clampCamera({ centerRa: 0, centerDec: 0, zoom: 100 }).zoom).toBe(ZOOM_MAX);
  });
});

describe('panCamera', () => {
  it('shifts RA and Dec based on pixel offset', () => {
    const cam = { centerRa: 12, centerDec: 0, zoom: 10 };
    const panned = panCamera(cam, 150, 0); // dx = 150 pixels right
    expect(panned.centerRa).not.toBeCloseTo(12); // should have changed
    expect(panned.centerDec).toBeCloseTo(0); // dy = 0
  });

  it('shifts Dec with dy', () => {
    const cam = { centerRa: 12, centerDec: 0, zoom: 10 };
    const panned = panCamera(cam, 0, 50);
    expect(panned.centerDec).toBeGreaterThan(0);
  });
});

describe('zoomCamera', () => {
  it('multiplies zoom by factor', () => {
    const cam = { centerRa: 0, centerDec: 0, zoom: 10 };
    expect(zoomCamera(cam, 2).zoom).toBe(20);
    expect(zoomCamera(cam, 0.5).zoom).toBe(5);
  });

  it('clamps result', () => {
    const cam = { centerRa: 0, centerDec: 0, zoom: 10 };
    expect(zoomCamera(cam, 100).zoom).toBe(ZOOM_MAX);
    expect(zoomCamera(cam, 0.01).zoom).toBe(ZOOM_MIN);
  });
});

describe('raDecToScreen / screenToRaDec roundtrip', () => {
  it('converts coordinates and back', () => {
    const cam = { centerRa: 6, centerDec: 20, zoom: 10 };
    const w = 800, h = 600;

    const screen = raDecToScreen(8, 30, cam, w, h);
    const back = screenToRaDec(screen.x, screen.y, cam, w, h);

    expect(back.ra).toBeCloseTo(8, 1);
    expect(back.dec).toBeCloseTo(30, 1);
  });

  it('handles RA wraparound', () => {
    const cam = { centerRa: 23, centerDec: 0, zoom: 10 };
    const w = 800, h = 600;

    const screen = raDecToScreen(1, 0, cam, w, h);
    // RA 1h is 2h ahead of 23h (wrapping), should be to the right
    expect(screen.x).toBeGreaterThan(w / 2);
  });

  it('center of screen maps to camera center', () => {
    const cam = { centerRa: 12, centerDec: 45, zoom: 10 };
    const w = 800, h = 600;

    const center = screenToRaDec(w / 2, h / 2, cam, w, h);
    expect(center.ra).toBeCloseTo(12);
    expect(center.dec).toBeCloseTo(45);
  });
});

describe('lerpCamera', () => {
  it('returns start at t=0', () => {
    const from = { centerRa: 0, centerDec: 0, zoom: 5 };
    const to = { centerRa: 12, centerDec: 60, zoom: 20 };
    const result = lerpCamera(from, to, 0);
    expect(result.centerRa).toBeCloseTo(0);
    expect(result.centerDec).toBeCloseTo(0);
    expect(result.zoom).toBeCloseTo(5);
  });

  it('returns end at t=1', () => {
    const from = { centerRa: 0, centerDec: 0, zoom: 5 };
    const to = { centerRa: 12, centerDec: 60, zoom: 20 };
    const result = lerpCamera(from, to, 1);
    expect(result.centerRa).toBeCloseTo(12);
    expect(result.centerDec).toBeCloseTo(60);
    expect(result.zoom).toBeCloseTo(20);
  });

  it('takes shortest path across RA wraparound', () => {
    const from = { centerRa: 23, centerDec: 0, zoom: 10 };
    const to = { centerRa: 1, centerDec: 0, zoom: 10 };
    const mid = lerpCamera(from, to, 0.5);
    // Should go through 0/24, not through 12
    // At t=0.5 with cubic ease-out, effective t ≈ 0.875
    // RA should be near 0 (or 24), not near 12
    expect(mid.centerRa < 3 || mid.centerRa > 21).toBe(true);
  });
});
