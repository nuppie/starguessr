const STORAGE_KEY = 'starguessr_state';

export interface QuizRecord {
  constellationId: string;
  correct: boolean;
  timestamp: number;
}

export interface DisplaySettings {
  showConstellationNames: boolean;
  showConstellationLines: boolean;
  showStarNames: boolean;
  showEquator: boolean;
  showEcliptic: boolean;
  showPoles: boolean;
}

export interface UserState {
  totalCorrect: number;
  totalAttempts: number;
  streak: number;
  bestStreak: number;
  history: QuizRecord[];
  constellationStats: Record<string, { correct: number; attempts: number }>;
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
  display: DisplaySettings;
}

const defaultDisplay: DisplaySettings = {
  showConstellationNames: false,
  showConstellationLines: true,
  showStarNames: false,
  showEquator: false,
  showEcliptic: false,
  showPoles: false,
};

const defaultState: UserState = {
  totalCorrect: 0,
  totalAttempts: 0,
  streak: 0,
  bestStreak: 0,
  history: [],
  constellationStats: {},
  difficulty: 'all',
  display: { ...defaultDisplay },
};

export function loadState(): UserState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultState, ...parsed, display: { ...defaultDisplay, ...parsed.display } };
    }
  } catch {
    // corrupted state, reset
  }
  return { ...defaultState };
}

export function saveState(state: UserState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function recordAnswer(state: UserState, constellationId: string, correct: boolean): UserState {
  const next = { ...state, constellationStats: { ...state.constellationStats }, history: [...state.history] };
  next.totalAttempts++;
  if (correct) {
    next.totalCorrect++;
    next.streak++;
    if (next.streak > next.bestStreak) next.bestStreak = next.streak;
  } else {
    next.streak = 0;
  }

  const prev = next.constellationStats[constellationId] ?? { correct: 0, attempts: 0 };
  next.constellationStats[constellationId] = {
    correct: prev.correct + (correct ? 1 : 0),
    attempts: prev.attempts + 1,
  };

  next.history.push({ constellationId, correct, timestamp: Date.now() });
  // Keep last 500 records
  if (next.history.length > 500) next.history = next.history.slice(-500);

  saveState(next);
  return next;
}
