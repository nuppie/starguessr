import { describe, it, expect } from 'vitest';
import {
  clampCamera,
  panCameraByScreenDelta,
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
    expect(clampCamera({ centerRa: 25, centerDec: 0, zoom: 400 }).centerRa).toBeCloseTo(1);
    expect(clampCamera({ centerRa: -2, centerDec: 0, zoom: 400 }).centerRa).toBeCloseTo(22);
  });

  it('clamps Dec to bounds', () => {
    expect(clampCamera({ centerRa: 0, centerDec: 100, zoom: 400 }).centerDec).toBe(DEC_MAX);
    expect(clampCamera({ centerRa: 0, centerDec: -100, zoom: 400 }).centerDec).toBe(DEC_MIN);
  });

  it('clamps zoom to bounds', () => {
    expect(clampCamera({ centerRa: 0, centerDec: 0, zoom: 0 }).zoom).toBe(ZOOM_MIN);
    expect(clampCamera({ centerRa: 0, centerDec: 0, zoom: 10000 }).zoom).toBe(ZOOM_MAX);
  });
});

describe('panCameraByScreenDelta', () => {
  const w = 800, h = 600;

  it('shifts RA when dragging horizontally', () => {
    const cam = { centerRa: 12, centerDec: 0, zoom: 400 };
    const panned = panCameraByScreenDelta(cam, 150, 0);
    // RA should shift
    expect(Math.abs(panned.centerRa - 12) > 0.0001 || panned.centerRa !== 12).toBe(true);
  });

  it('shifts Dec when dragging vertically', () => {
    const cam = { centerRa: 12, centerDec: 0, zoom: 400 };
    const panned = panCameraByScreenDelta(cam, 0, -50);
    expect(panned.centerDec).toBeGreaterThan(0);
  });
});

describe('zoomCamera', () => {
  it('multiplies zoom by factor', () => {
    const cam = { centerRa: 0, centerDec: 0, zoom: 400 };
    expect(zoomCamera(cam, 2).zoom).toBe(800);
    expect(zoomCamera(cam, 0.5).zoom).toBe(200);
  });

  it('clamps result', () => {
    const cam = { centerRa: 0, centerDec: 0, zoom: 400 };
    expect(zoomCamera(cam, 100).zoom).toBe(ZOOM_MAX);
    expect(zoomCamera(cam, 0.01).zoom).toBe(ZOOM_MIN);
  });
});

describe('raDecToScreen / screenToRaDec roundtrip', () => {
  it('converts coordinates and back for nearby point', () => {
    const cam = { centerRa: 6, centerDec: 20, zoom: 400 };
    const w = 800, h = 600;

    // Point close to camera center (within visible hemisphere)
    const screen = raDecToScreen(7, 25, cam, w, h);
    expect(screen.behind).toBe(false);
    const back = screenToRaDec(screen.x, screen.y, cam, w, h);

    expect(back.ra).toBeCloseTo(7, 0);
    expect(back.dec).toBeCloseTo(25, 0);
  });

  it('marks points behind the viewer', () => {
    const cam = { centerRa: 6, centerDec: 20, zoom: 400 };
    const w = 800, h = 600;

    // Point on opposite side of sky
    const screen = raDecToScreen(18, -20, cam, w, h);
    expect(screen.behind).toBe(true);
  });

  it('handles RA wraparound', () => {
    const cam = { centerRa: 23, centerDec: 0, zoom: 400 };
    const w = 800, h = 600;

    const screen = raDecToScreen(1, 0, cam, w, h);
    expect(screen.behind).toBe(false);
    // RA 1h is 2h ahead of 23h (wrapping), should be to the right of center
    expect(screen.x).toBeGreaterThanOrEqual(w / 2);
  });

  it('center of screen maps to camera center', () => {
    const cam = { centerRa: 12, centerDec: 45, zoom: 400 };
    const w = 800, h = 600;

    const center = screenToRaDec(w / 2, h / 2, cam, w, h);
    expect(center.ra).toBeCloseTo(12, 0);
    expect(center.dec).toBeCloseTo(45, 0);
  });
});

describe('lerpCamera', () => {
  it('returns start at t=0', () => {
    const from = { centerRa: 0, centerDec: 0, zoom: 200 };
    const to = { centerRa: 12, centerDec: 60, zoom: 800 };
    const result = lerpCamera(from, to, 0);
    expect(result.centerRa).toBeCloseTo(0);
    expect(result.centerDec).toBeCloseTo(0);
    expect(result.zoom).toBeCloseTo(200);
  });

  it('returns end at t=1', () => {
    const from = { centerRa: 0, centerDec: 0, zoom: 200 };
    const to = { centerRa: 12, centerDec: 60, zoom: 800 };
    const result = lerpCamera(from, to, 1);
    expect(result.centerRa).toBeCloseTo(12);
    expect(result.centerDec).toBeCloseTo(60);
    expect(result.zoom).toBeCloseTo(800);
  });

  it('takes shortest path across RA wraparound', () => {
    const from = { centerRa: 23, centerDec: 0, zoom: 400 };
    const to = { centerRa: 1, centerDec: 0, zoom: 400 };
    const mid = lerpCamera(from, to, 0.5);
    expect(mid.centerRa < 3 || mid.centerRa > 21).toBe(true);
  });
});
