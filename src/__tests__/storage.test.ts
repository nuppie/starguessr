import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadState, saveState, recordAnswer, UserState } from '../storage';

// Mock localStorage
let store: Record<string, string> = {};

beforeEach(() => {
  store = {};
  const localStorageMock = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    length: 0,
    key: vi.fn(() => null),
  };
  vi.stubGlobal('localStorage', localStorageMock);
});

describe('loadState', () => {
  it('returns default state when nothing stored', () => {
    const s = loadState();
    expect(s.totalCorrect).toBe(0);
    expect(s.totalAttempts).toBe(0);
    expect(s.streak).toBe(0);
    expect(s.difficulty).toBe('all');
  });

  it('loads saved state', () => {
    const saved: UserState = {
      totalCorrect: 5,
      totalAttempts: 10,
      streak: 3,
      bestStreak: 5,
      history: [],
      constellationStats: {},
      difficulty: 'easy',
      display: { showConstellationNames: false, showConstellationLines: true, showStarNames: false, showEquator: false, showEcliptic: false, showPoles: false, showSolarSystem: true, showHorizon: false },
    };
    store['starguessr_state'] = JSON.stringify(saved);
    const s = loadState();
    expect(s.totalCorrect).toBe(5);
    expect(s.difficulty).toBe('easy');
  });

  it('handles corrupted data gracefully', () => {
    store['starguessr_state'] = 'not-json';
    const s = loadState();
    expect(s.totalCorrect).toBe(0);
  });
});

describe('saveState', () => {
  it('persists to localStorage', () => {
    const s = loadState();
    saveState(s);
    expect(localStorage.setItem).toHaveBeenCalledWith('starguessr_state', expect.any(String));
  });
});

describe('recordAnswer', () => {
  it('increments correct count on correct answer', () => {
    let s = loadState();
    s = recordAnswer(s, 'orion', true);
    expect(s.totalCorrect).toBe(1);
    expect(s.totalAttempts).toBe(1);
    expect(s.streak).toBe(1);
  });

  it('resets streak on wrong answer', () => {
    let s = loadState();
    s = recordAnswer(s, 'orion', true);
    s = recordAnswer(s, 'orion', true);
    s = recordAnswer(s, 'orion', false);
    expect(s.streak).toBe(0);
    expect(s.bestStreak).toBe(2);
  });

  it('tracks per-constellation stats', () => {
    const fresh: UserState = {
      totalCorrect: 0, totalAttempts: 0, streak: 0, bestStreak: 0,
      history: [], constellationStats: {}, difficulty: 'all',
      display: { showConstellationNames: false, showConstellationLines: true, showStarNames: false, showEquator: false, showEcliptic: false, showPoles: false, showSolarSystem: true, showHorizon: false },
    };
    let s = recordAnswer(fresh, 'orion', true);
    s = recordAnswer(s, 'orion', false);
    s = recordAnswer(s, 'leo', true);

    expect(s.constellationStats['orion']).toEqual({ correct: 1, attempts: 2 });
    expect(s.constellationStats['leo']).toEqual({ correct: 1, attempts: 1 });
  });

  it('updates best streak', () => {
    let s = loadState();
    s = recordAnswer(s, 'a', true);
    s = recordAnswer(s, 'b', true);
    s = recordAnswer(s, 'c', true);
    expect(s.bestStreak).toBe(3);
    s = recordAnswer(s, 'd', false);
    expect(s.bestStreak).toBe(3); // unchanged
    s = recordAnswer(s, 'e', true);
    expect(s.bestStreak).toBe(3); // still 3
  });

  it('trims history to 500', () => {
    let s = loadState();
    for (let i = 0; i < 510; i++) {
      s = recordAnswer(s, 'x', true);
    }
    expect(s.history.length).toBe(500);
  });
});
