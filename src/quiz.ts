import { Constellation, constellations } from './constellations';
import { UserState } from './storage';

export function getFilteredConstellations(difficulty: UserState['difficulty']): Constellation[] {
  if (difficulty === 'all') return constellations;
  return constellations.filter(c => c.difficulty === difficulty);
}

export function pickNextConstellation(
  pool: Constellation[],
  stats: UserState['constellationStats'],
  currentId: string | null
): Constellation {
  if (pool.length === 0) throw new Error('No constellations in pool');
  if (pool.length === 1) return pool[0];

  const weighted = pool.map(c => {
    const s = stats[c.id];
    if (!s || s.attempts === 0) return { con: c, weight: 3 };
    const accuracy = s.correct / s.attempts;
    return { con: c, weight: Math.max(0.5, 3 - accuracy * 2.5) };
  });

  // Avoid repeating
  const filtered = weighted.filter(w => w.con.id !== currentId);
  const candidates = filtered.length > 0 ? filtered : weighted;

  const totalWeight = candidates.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * totalWeight;
  for (const w of candidates) {
    r -= w.weight;
    if (r <= 0) return w.con;
  }

  return candidates[candidates.length - 1].con;
}

export interface TapCheckResult {
  correct: boolean;
  distance: number;
}

export function checkTap(
  tapRa: number,
  tapDec: number,
  target: Constellation,
  zoom: number
): TapCheckResult {
  // Distance to center
  let dRa = (tapRa - target.centerRa) * 15;
  if (dRa > 180) dRa -= 360;
  if (dRa < -180) dRa += 360;
  const dDec = tapDec - target.centerDec;
  const centerDist = Math.sqrt(dRa * dRa + dDec * dDec);

  // Distance to nearest star
  let minStarDist = Infinity;
  for (const star of target.stars) {
    let sdRa = (tapRa - star.ra) * 15;
    if (sdRa > 180) sdRa -= 360;
    if (sdRa < -180) sdRa += 360;
    const sdDec = tapDec - star.dec;
    const sd = Math.sqrt(sdRa * sdRa + sdDec * sdDec);
    if (sd < minStarDist) minStarDist = sd;
  }

  const threshold = Math.max(12, 25 / (zoom / 8));
  const correct = centerDist < threshold || minStarDist < threshold * 0.6;
  const distance = Math.min(centerDist, minStarDist);

  return { correct, distance };
}
