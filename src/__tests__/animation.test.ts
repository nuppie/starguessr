import { describe, it, expect } from 'vitest';
import { createCameraAnimation, tickCameraAnimation, tickMomentum } from '../animation';
import { Camera } from '../camera';

describe('createCameraAnimation', () => {
  it('creates an active animation', () => {
    const from: Camera = { centerRa: 0, centerDec: 0, zoom: 10 };
    const to: Camera = { centerRa: 12, centerDec: 45, zoom: 15 };
    const anim = createCameraAnimation(from, to, 500);
    expect(anim!.active).toBe(true);
    expect(anim!.duration).toBe(500);
  });
});

describe('tickCameraAnimation', () => {
  it('returns null for null animation', () => {
    expect(tickCameraAnimation(null, 0)).toBeNull();
  });

  it('interpolates camera over time', () => {
    const from: Camera = { centerRa: 0, centerDec: 0, zoom: 10 };
    const to: Camera = { centerRa: 12, centerDec: 60, zoom: 20 };
    const anim = createCameraAnimation(from, to, 1000);
    const startTime = anim!.startTime;

    const mid = tickCameraAnimation(anim, startTime + 500);
    expect(mid).not.toBeNull();
    expect(mid!.done).toBe(false);
    expect(mid!.cam.centerDec).toBeGreaterThan(0);
    expect(mid!.cam.centerDec).toBeLessThan(60);

    const end = tickCameraAnimation(anim, startTime + 1000);
    expect(end!.done).toBe(true);
    expect(end!.cam.centerRa).toBeCloseTo(12);
  });
});

describe('tickMomentum', () => {
  it('returns no movement when dragging', () => {
    const cam: Camera = { centerRa: 12, centerDec: 0, zoom: 10 };
    const momentum = { vx: 5, vy: 5 };
    const result = tickMomentum(cam, momentum, true);
    expect(result.moved).toBe(false);
  });

  it('returns no movement when momentum is zero', () => {
    const cam: Camera = { centerRa: 12, centerDec: 0, zoom: 10 };
    const momentum = { vx: 0, vy: 0 };
    const result = tickMomentum(cam, momentum, false);
    expect(result.moved).toBe(false);
  });

  it('applies momentum and decays', () => {
    const cam: Camera = { centerRa: 12, centerDec: 0, zoom: 10 };
    const momentum = { vx: 5, vy: 3 };
    const result = tickMomentum(cam, momentum, false);
    expect(result.moved).toBe(true);
    expect(momentum.vx).toBeCloseTo(5 * 0.95);
    expect(momentum.vy).toBeCloseTo(3 * 0.95);
  });
});
