// Star positions in RA (hours 0-24) and Dec (degrees -90 to +90)
// Converted to x,y on a equirectangular projection: x = RA/24 * 2PI, y = Dec in radians

export interface Star {
  ra: number;   // right ascension in hours (0-24)
  dec: number;  // declination in degrees (-90 to +90)
  mag: number;  // magnitude (lower = brighter)
  name?: string;
}

export interface ConstellationLine {
  from: number; // index into stars array
  to: number;
}

export interface Constellation {
  id: string;
  name: string;
  abbr: string;
  stars: Star[];
  lines: ConstellationLine[];
  // center for tap detection
  centerRa: number;
  centerDec: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function computeCenter(stars: Star[]): { ra: number; dec: number } {
  // Handle RA wraparound by using circular mean
  let sinSum = 0, cosSum = 0, decSum = 0;
  for (const s of stars) {
    const angle = (s.ra / 24) * Math.PI * 2;
    sinSum += Math.sin(angle);
    cosSum += Math.cos(angle);
    decSum += s.dec;
  }
  let ra = Math.atan2(sinSum, cosSum) / (Math.PI * 2) * 24;
  if (ra < 0) ra += 24;
  return { ra, dec: decSum / stars.length };
}

export function makeCon(
  id: string,
  name: string,
  abbr: string,
  difficulty: 'easy' | 'medium' | 'hard',
  stars: Star[],
  lines: ConstellationLine[]
): Constellation {
  const center = computeCenter(stars);
  return { id, name, abbr, stars, lines, centerRa: center.ra, centerDec: center.dec, difficulty };
}

export const constellations: Constellation[] = [

  // ============================================================
  // === EASY (15) ===
  // ============================================================

  makeCon('orion', 'Orion', 'Ori', 'easy', [
    { ra: 5.92,  dec:  7.41,  mag: 0.50,  name: 'Betelgeuse' },  // 0
    { ra: 5.24,  dec: -8.20,  mag: 0.12,  name: 'Rigel' },       // 1
    { ra: 5.68,  dec: -1.94,  mag: 1.70,  name: 'Alnitak' },     // 2
    { ra: 5.60,  dec: -1.20,  mag: 1.69,  name: 'Alnilam' },     // 3
    { ra: 5.53,  dec: -0.30,  mag: 2.23,  name: 'Mintaka' },     // 4
    { ra: 5.42,  dec:  6.35,  mag: 1.64,  name: 'Bellatrix' },   // 5
    { ra: 5.80,  dec: -9.67,  mag: 2.06,  name: 'Saiph' },       // 6
  ], [
    { from: 0, to: 5 }, { from: 5, to: 4 }, { from: 4, to: 3 }, { from: 3, to: 2 },
    { from: 2, to: 6 }, { from: 0, to: 2 }, { from: 5, to: 1 }, { from: 1, to: 6 },
  ]),

  makeCon('ursa_major', 'Ursa Major', 'UMa', 'easy', [
    { ra: 11.06, dec: 61.75, mag: 1.79, name: 'Dubhe' },         // 0
    { ra: 11.03, dec: 56.38, mag: 2.37, name: 'Merak' },         // 1
    { ra: 11.90, dec: 53.69, mag: 2.44, name: 'Phecda' },        // 2
    { ra: 12.26, dec: 57.03, mag: 3.31, name: 'Megrez' },        // 3
    { ra: 12.90, dec: 55.96, mag: 1.77, name: 'Alioth' },        // 4
    { ra: 13.40, dec: 54.93, mag: 2.27, name: 'Mizar' },         // 5
    { ra: 13.79, dec: 49.31, mag: 1.86, name: 'Alkaid' },        // 6
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
    { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 6 },
    { from: 0, to: 3 },
  ]),

  makeCon('ursa_minor', 'Ursa Minor', 'UMi', 'easy', [
    { ra:  2.53, dec: 89.26, mag: 1.98, name: 'Polaris' },       // 0
    { ra: 14.85, dec: 74.16, mag: 2.08, name: 'Kochab' },        // 1
    { ra: 15.73, dec: 71.83, mag: 3.05, name: 'Pherkad' },       // 2
    { ra: 16.29, dec: 75.75, mag: 4.23, name: 'Yildun' },        // 3
    { ra: 17.54, dec: 86.59, mag: 4.25, name: 'Epsilon UMi' },   // 4
    { ra: 16.77, dec: 82.04, mag: 4.32, name: 'Zeta UMi' },      // 5
    { ra: 15.74, dec: 77.79, mag: 5.00, name: 'Eta UMi' },       // 6
  ], [
    { from: 0, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 6 },
    { from: 6, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 6 },
  ]),

  makeCon('cassiopeia', 'Cassiopeia', 'Cas', 'easy', [
    { ra: 0.68,  dec: 56.54, mag: 2.23, name: 'Schedar' },       // 0
    { ra: 0.15,  dec: 59.15, mag: 2.27, name: 'Caph' },          // 1
    { ra: 0.95,  dec: 60.72, mag: 2.47, name: 'Gamma Cas' },     // 2
    { ra: 1.43,  dec: 60.24, mag: 2.68, name: 'Ruchbah' },       // 3
    { ra: 1.91,  dec: 63.67, mag: 3.37, name: 'Segin' },         // 4
  ], [
    { from: 1, to: 0 }, { from: 0, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
  ]),

  makeCon('scorpius', 'Scorpius', 'Sco', 'easy', [
    { ra: 16.49, dec: -26.43, mag: 0.96, name: 'Antares' },      // 0
    { ra: 16.09, dec: -19.81, mag: 2.56, name: 'Dschubba' },     // 1
    { ra: 16.01, dec: -22.62, mag: 2.32, name: 'Acrab' },        // 2
    { ra: 16.84, dec: -34.29, mag: 2.82, name: 'Mu Sco' },       // 3
    { ra: 17.20, dec: -43.24, mag: 1.87, name: 'Shaula' },       // 4
    { ra: 17.56, dec: -37.10, mag: 2.69, name: 'Sargas' },       // 5
    { ra: 16.36, dec: -25.59, mag: 2.89, name: 'Sigma Sco' },    // 6
    { ra: 17.71, dec: -39.03, mag: 3.00, name: 'Lesath' },       // 7
  ], [
    { from: 2, to: 1 }, { from: 1, to: 6 }, { from: 6, to: 0 },
    { from: 0, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 7 },
    { from: 7, to: 5 },
  ]),

  makeCon('leo', 'Leo', 'Leo', 'easy', [
    { ra: 10.14, dec: 11.97, mag: 1.35, name: 'Regulus' },       // 0
    { ra: 11.24, dec: 20.52, mag: 2.14, name: 'Denebola' },      // 1
    { ra: 10.33, dec: 19.84, mag: 2.56, name: 'Algieba' },       // 2
    { ra: 11.82, dec: 14.57, mag: 2.01, name: 'Zosma' },         // 3
    { ra:  9.76, dec: 23.77, mag: 3.44, name: 'Mu Leo' },        // 4
    { ra:  9.53, dec: 26.18, mag: 3.52, name: 'Adhafera' },      // 5
    { ra: 10.89, dec: 34.21, mag: 2.98, name: 'Chort' },         // 6
  ], [
    { from: 0, to: 2 }, { from: 2, to: 4 }, { from: 4, to: 5 },
    { from: 2, to: 3 }, { from: 3, to: 6 }, { from: 3, to: 1 }, { from: 0, to: 3 },
  ]),

  makeCon('crux', 'Crux', 'Cru', 'easy', [
    { ra: 12.44, dec: -63.10, mag: 0.76, name: 'Acrux' },        // 0
    { ra: 12.52, dec: -57.11, mag: 1.25, name: 'Mimosa' },       // 1
    { ra: 12.25, dec: -58.75, mag: 1.63, name: 'Gacrux' },       // 2
    { ra: 12.35, dec: -60.40, mag: 2.80, name: 'Delta Cru' },    // 3
  ], [
    { from: 2, to: 0 }, { from: 1, to: 3 },
  ]),

  makeCon('cygnus', 'Cygnus', 'Cyg', 'easy', [
    { ra: 20.69, dec: 45.28, mag: 1.25, name: 'Deneb' },         // 0
    { ra: 19.51, dec: 27.96, mag: 2.20, name: 'Albireo' },       // 1
    { ra: 20.37, dec: 40.26, mag: 2.48, name: 'Sadr' },          // 2
    { ra: 20.77, dec: 33.97, mag: 2.46, name: 'Gienah' },        // 3
    { ra: 19.94, dec: 35.08, mag: 2.87, name: 'Delta Cyg' },     // 4
  ], [
    { from: 0, to: 2 }, { from: 2, to: 1 }, { from: 4, to: 2 }, { from: 2, to: 3 },
  ]),

  makeCon('lyra', 'Lyra', 'Lyr', 'easy', [
    { ra: 18.62, dec: 38.78, mag: 0.03, name: 'Vega' },          // 0
    { ra: 18.98, dec: 32.69, mag: 3.24, name: 'Sulafat' },       // 1
    { ra: 18.75, dec: 37.60, mag: 4.33, name: 'Epsilon1 Lyr' },  // 2
    { ra: 18.83, dec: 36.06, mag: 3.52, name: 'Zeta Lyr' },      // 3
    { ra: 18.91, dec: 36.90, mag: 4.30, name: 'Delta Lyr' },     // 4
  ], [
    { from: 0, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
    { from: 4, to: 2 }, { from: 3, to: 1 }, { from: 4, to: 1 },
  ]),

  makeCon('gemini', 'Gemini', 'Gem', 'easy', [
    { ra:  7.76, dec: 28.03, mag: 1.14, name: 'Pollux' },        // 0
    { ra:  7.58, dec: 31.89, mag: 1.58, name: 'Castor' },        // 1
    { ra:  6.63, dec: 16.40, mag: 1.93, name: 'Alhena' },        // 2
    { ra:  6.75, dec: 25.13, mag: 2.88, name: 'Tejat' },         // 3
    { ra:  7.07, dec: 20.57, mag: 2.98, name: 'Mebsuda' },       // 4
    { ra:  7.34, dec: 21.98, mag: 3.36, name: 'Wasat' },         // 5
    { ra:  7.60, dec: 26.90, mag: 3.53, name: 'Kappa Gem' },     // 6
  ], [
    { from: 1, to: 0 }, { from: 1, to: 3 }, { from: 3, to: 4 },
    { from: 4, to: 2 }, { from: 0, to: 5 }, { from: 5, to: 4 },
    { from: 0, to: 6 }, { from: 6, to: 1 },
  ]),

  makeCon('taurus', 'Taurus', 'Tau', 'easy', [
    { ra:  4.60, dec: 16.51, mag: 0.85, name: 'Aldebaran' },     // 0
    { ra:  5.63, dec: 28.61, mag: 1.65, name: 'Elnath' },        // 1
    { ra:  4.33, dec: 15.63, mag: 3.53, name: 'Gamma Tau' },     // 2
    { ra:  4.48, dec: 19.18, mag: 3.40, name: 'Delta Tau' },     // 3
    { ra:  4.38, dec: 17.54, mag: 3.63, name: 'Epsilon Tau' },   // 4
    { ra:  5.44, dec: 21.14, mag: 3.00, name: 'Zeta Tau' },      // 5
  ], [
    { from: 2, to: 0 }, { from: 0, to: 3 }, { from: 3, to: 4 },
    { from: 0, to: 5 }, { from: 5, to: 1 },
  ]),

  makeCon('canis_major', 'Canis Major', 'CMa', 'easy', [
    { ra:  6.75, dec: -16.72, mag: -1.46, name: 'Sirius' },      // 0
    { ra:  6.38, dec: -17.96, mag:  1.98, name: 'Mirzam' },      // 1
    { ra:  7.14, dec: -26.39, mag:  1.50, name: 'Adhara' },      // 2
    { ra:  7.06, dec: -23.83, mag:  1.84, name: 'Wezen' },       // 3
    { ra:  7.40, dec: -29.30, mag:  2.45, name: 'Aludra' },      // 4
    { ra:  6.98, dec: -28.97, mag:  2.00, name: 'Furud' },       // 5
  ], [
    { from: 1, to: 0 }, { from: 0, to: 3 }, { from: 3, to: 2 },
    { from: 2, to: 5 }, { from: 5, to: 4 }, { from: 3, to: 4 },
  ]),

  makeCon('aquila', 'Aquila', 'Aql', 'easy', [
    { ra: 19.85, dec:  8.87, mag: 0.77, name: 'Altair' },        // 0
    { ra: 19.77, dec: 10.61, mag: 2.72, name: 'Tarazed' },       // 1
    { ra: 19.92, dec:  6.41, mag: 3.36, name: 'Alshain' },       // 2
    { ra: 19.10, dec: 13.86, mag: 3.44, name: 'Theta Aql' },     // 3
    { ra: 20.19, dec: -0.82, mag: 3.37, name: 'Lambda Aql' },    // 4
    { ra: 19.87, dec:  1.01, mag: 3.24, name: 'Eta Aql' },       // 5
  ], [
    { from: 3, to: 1 }, { from: 1, to: 0 }, { from: 0, to: 2 },
    { from: 0, to: 5 }, { from: 5, to: 4 },
  ]),

  makeCon('sagittarius', 'Sagittarius', 'Sgr', 'easy', [
    { ra: 18.40, dec: -34.38, mag: 1.85, name: 'Kaus Australis' }, // 0
    { ra: 18.35, dec: -29.83, mag: 2.70, name: 'Kaus Media' },   // 1
    { ra: 18.47, dec: -25.42, mag: 2.82, name: 'Kaus Borealis' }, // 2
    { ra: 19.04, dec: -27.67, mag: 2.99, name: 'Nunki' },        // 3
    { ra: 18.92, dec: -26.30, mag: 3.17, name: 'Ascella' },      // 4
    { ra: 18.10, dec: -21.06, mag: 2.72, name: 'Phi Sgr' },      // 5
    { ra: 18.23, dec: -36.76, mag: 3.93, name: 'Eta Sgr' },      // 6
    { ra: 19.93, dec: -15.57, mag: 2.08, name: 'Rukbat' },       // 7
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 1, to: 4 },
    { from: 4, to: 3 }, { from: 2, to: 5 }, { from: 0, to: 6 },
    { from: 3, to: 7 },
  ]),

  makeCon('canis_minor', 'Canis Minor', 'CMi', 'easy', [
    { ra:  7.65, dec:  5.22, mag: 0.34, name: 'Procyon' },        // 0
    { ra:  7.45, dec:  8.29, mag: 2.89, name: 'Gomeisa' },        // 1
  ], [
    { from: 1, to: 0 },
  ]),

  // ============================================================
  // === MEDIUM (30) ===
  // ============================================================

  makeCon('andromeda', 'Andromeda', 'And', 'medium', [
    { ra:  0.14, dec: 29.09, mag: 2.06, name: 'Alpheratz' },     // 0
    { ra:  1.16, dec: 35.62, mag: 2.06, name: 'Mirach' },        // 1
    { ra:  2.07, dec: 42.33, mag: 2.10, name: 'Almach' },        // 2
    { ra:  0.66, dec: 30.86, mag: 3.27, name: 'Delta And' },     // 3
    { ra:  1.63, dec: 48.63, mag: 3.59, name: 'Mu And' },        // 4
  ], [
    { from: 0, to: 3 }, { from: 3, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 4 },
  ]),

  makeCon('perseus', 'Perseus', 'Per', 'medium', [
    { ra:  3.41, dec: 49.86, mag: 1.79, name: 'Mirfak' },        // 0
    { ra:  3.14, dec: 40.96, mag: 2.12, name: 'Algol' },         // 1
    { ra:  3.72, dec: 47.79, mag: 2.85, name: 'Zeta Per' },      // 2
    { ra:  3.96, dec: 40.01, mag: 2.93, name: 'Epsilon Per' },   // 3
    { ra:  3.08, dec: 53.51, mag: 3.01, name: 'Gamma Per' },     // 4
    { ra:  2.84, dec: 55.90, mag: 3.79, name: 'Eta Per' },       // 5
  ], [
    { from: 5, to: 4 }, { from: 4, to: 0 }, { from: 0, to: 2 },
    { from: 2, to: 3 }, { from: 0, to: 1 },
  ]),

  makeCon('auriga', 'Auriga', 'Aur', 'medium', [
    { ra:  5.28, dec: 46.00, mag: 0.08, name: 'Capella' },       // 0
    { ra:  5.99, dec: 44.95, mag: 1.90, name: 'Menkalinan' },    // 1
    { ra:  5.03, dec: 43.82, mag: 2.69, name: 'Theta Aur' },     // 2
    { ra:  5.11, dec: 41.23, mag: 2.62, name: 'Delta Aur' },     // 3
    { ra:  5.63, dec: 28.61, mag: 1.65, name: 'Elnath' },        // 4
    { ra:  5.33, dec: 37.21, mag: 3.18, name: 'Zeta Aur' },      // 5
  ], [
    { from: 0, to: 1 }, { from: 1, to: 4 }, { from: 4, to: 3 },
    { from: 3, to: 2 }, { from: 2, to: 0 }, { from: 2, to: 5 }, { from: 5, to: 3 },
  ]),

  makeCon('bootes', 'Boötes', 'Boo', 'medium', [
    { ra: 14.26, dec:  19.18, mag: -0.05, name: 'Arcturus' },    // 0
    { ra: 13.91, dec:  18.40, mag:  2.68, name: 'Muphrid' },     // 1
    { ra: 14.53, dec:  30.37, mag:  2.35, name: 'Izar' },        // 2
    { ra: 15.03, dec:  40.39, mag:  2.62, name: 'Nekkar' },      // 3
    { ra: 14.69, dec:  38.31, mag:  3.03, name: 'Seginus' },     // 4
    { ra: 13.82, dec:  15.80, mag:  3.46, name: 'Eta Boo' },     // 5
  ], [
    { from: 5, to: 0 }, { from: 0, to: 1 }, { from: 1, to: 2 },
    { from: 2, to: 4 }, { from: 4, to: 3 }, { from: 0, to: 2 },
  ]),

  makeCon('virgo', 'Virgo', 'Vir', 'medium', [
    { ra: 13.42, dec: -11.16, mag: 0.98, name: 'Spica' },        // 0
    { ra: 12.69, dec:  -1.45, mag: 2.83, name: 'Porrima' },      // 1
    { ra: 13.04, dec:  10.96, mag: 2.83, name: 'Vindemiatrix' }, // 2
    { ra: 12.33, dec:  -0.67, mag: 3.37, name: 'Eta Vir' },      // 3
    { ra: 11.84, dec:   1.76, mag: 3.61, name: 'Zaniah' },       // 4
    { ra: 14.72, dec:   1.89, mag: 3.38, name: 'Heze' },         // 5
  ], [
    { from: 4, to: 3 }, { from: 3, to: 1 }, { from: 1, to: 0 },
    { from: 1, to: 2 }, { from: 0, to: 5 },
  ]),

  makeCon('pegasus', 'Pegasus', 'Peg', 'medium', [
    { ra: 23.08, dec: 15.21, mag: 2.39, name: 'Enif' },          // 0
    { ra: 22.69, dec: 10.83, mag: 2.44, name: 'Scheat' },        // 1
    { ra: 23.08, dec: 28.08, mag: 2.83, name: 'Matar' },         // 2
    { ra: 21.74, dec:  9.88, mag: 2.49, name: 'Markab' },        // 3
    { ra: 22.83, dec: 24.60, mag: 2.83, name: 'Algenib' },       // 4
    { ra:  0.14, dec: 29.09, mag: 2.06, name: 'Alpheratz' },     // 5
  ], [
    { from: 0, to: 2 }, { from: 2, to: 1 }, { from: 1, to: 3 },
    { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 1 },
  ]),

  makeCon('aquarius', 'Aquarius', 'Aqr', 'medium', [
    { ra: 22.10, dec:  -0.32, mag: 2.91, name: 'Sadalsuud' },    // 0
    { ra: 22.36, dec:  -1.39, mag: 3.00, name: 'Sadalmelik' },   // 1
    { ra: 22.88, dec: -15.82, mag: 2.90, name: 'Skat' },         // 2
    { ra: 22.59, dec:  -0.12, mag: 3.27, name: 'Gamma Aqr' },    // 3
    { ra: 22.83, dec: -13.59, mag: 3.54, name: 'Delta Aqr' },    // 4
    { ra: 23.24, dec: -21.17, mag: 4.16, name: 'Lambda Aqr' },   // 5
  ], [
    { from: 1, to: 0 }, { from: 0, to: 3 }, { from: 3, to: 4 },
    { from: 4, to: 2 }, { from: 2, to: 5 },
  ]),

  makeCon('capricornus', 'Capricornus', 'Cap', 'medium', [
    { ra: 20.30, dec: -12.51, mag: 3.57, name: 'Algedi' },       // 0
    { ra: 20.35, dec: -14.78, mag: 3.05, name: 'Dabih' },        // 1
    { ra: 21.62, dec: -16.66, mag: 2.85, name: 'Deneb Algedi' }, // 2
    { ra: 21.37, dec: -16.83, mag: 3.69, name: 'Zeta Cap' },     // 3
    { ra: 21.10, dec: -17.23, mag: 3.80, name: 'Theta Cap' },    // 4
    { ra: 20.86, dec: -26.92, mag: 4.11, name: 'Gamma Cap' },    // 5
  ], [
    { from: 0, to: 1 }, { from: 1, to: 5 }, { from: 5, to: 4 },
    { from: 4, to: 3 }, { from: 3, to: 2 }, { from: 2, to: 0 },
  ]),

  makeCon('aries', 'Aries', 'Ari', 'medium', [
    { ra:  2.12, dec: 23.46, mag: 2.00, name: 'Hamal' },         // 0
    { ra:  1.91, dec: 20.81, mag: 2.64, name: 'Sheratan' },      // 1
    { ra:  1.89, dec: 19.29, mag: 3.88, name: 'Mesarthim' },     // 2
    { ra:  2.83, dec: 27.26, mag: 3.63, name: 'Botein' },        // 3
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 0, to: 3 },
  ]),

  makeCon('pisces', 'Pisces', 'Psc', 'medium', [
    { ra:  2.03, dec:  2.76, mag: 3.62, name: 'Eta Psc' },       // 0
    { ra:  1.52, dec: 15.35, mag: 3.79, name: 'Gamma Psc' },     // 1
    { ra: 23.99, dec:  6.86, mag: 4.13, name: 'Al Rischa' },     // 2
    { ra: 23.67, dec:  5.63, mag: 3.69, name: 'Fum al Samakah' }, // 3
    { ra: 23.29, dec:  3.28, mag: 4.27, name: 'Omega Psc' },     // 4
    { ra:  1.05, dec:  7.89, mag: 4.49, name: 'Kappa Psc' },     // 5
  ], [
    { from: 4, to: 3 }, { from: 3, to: 2 }, { from: 2, to: 5 },
    { from: 5, to: 0 }, { from: 0, to: 1 },
  ]),

  makeCon('libra', 'Libra', 'Lib', 'medium', [
    { ra: 14.85, dec: -16.04, mag: 2.61, name: 'Zubenelgenubi' }, // 0
    { ra: 15.28, dec:  -9.38, mag: 2.61, name: 'Zubeneschamali' }, // 1
    { ra: 15.59, dec: -14.79, mag: 3.29, name: 'Brachium' },     // 2
    { ra: 15.07, dec: -25.28, mag: 3.91, name: 'Theta Lib' },    // 3
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 0 },
  ]),

  makeCon('cancer', 'Cancer', 'Cnc', 'medium', [
    { ra:  8.74, dec: 18.15, mag: 3.52, name: 'Tarf' },           // 0
    { ra:  8.97, dec: 11.86, mag: 3.94, name: 'Altarf' },         // 1
    { ra:  8.72, dec: 21.47, mag: 4.02, name: 'Asellus Australis' }, // 2
    { ra:  8.67, dec: 24.11, mag: 4.66, name: 'Asellus Borealis' }, // 3
    { ra:  8.28, dec: 28.76, mag: 5.59, name: 'Iota Cnc' },       // 4
  ], [
    { from: 4, to: 3 }, { from: 3, to: 2 }, { from: 2, to: 0 },
    { from: 0, to: 1 },
  ]),

  makeCon('ophiuchus', 'Ophiuchus', 'Oph', 'medium', [
    { ra: 17.72, dec:  4.57, mag: 2.08, name: 'Rasalhague' },    // 0
    { ra: 16.24, dec: -3.69, mag: 2.43, name: 'Sabik' },         // 1
    { ra: 17.17, dec: -15.72, mag: 2.54, name: 'Yed Prior' },    // 2
    { ra: 17.98, dec:  2.71, mag: 3.20, name: 'Cebalrai' },      // 3
    { ra: 17.36, dec: -24.99, mag: 3.19, name: 'Theta Oph' },    // 4
    { ra: 16.62, dec: -10.57, mag: 3.75, name: 'Zeta Oph' },     // 5
  ], [
    { from: 0, to: 3 }, { from: 0, to: 2 }, { from: 2, to: 1 },
    { from: 1, to: 5 }, { from: 1, to: 4 },
  ]),

  makeCon('hercules', 'Hercules', 'Her', 'medium', [
    { ra: 17.24, dec: 14.39, mag: 2.78, name: 'Kornephoros' },   // 0
    { ra: 16.50, dec: 21.49, mag: 2.81, name: 'Zeta Her' },      // 1
    { ra: 17.00, dec: 30.93, mag: 3.16, name: 'Sarin' },         // 2
    { ra: 16.69, dec: 31.60, mag: 3.48, name: 'Pi Her' },        // 3
    { ra: 17.39, dec: 37.15, mag: 3.75, name: 'Eta Her' },       // 4
    { ra: 17.77, dec: 27.72, mag: 3.86, name: 'Mu Her' },        // 5
    { ra: 16.36, dec: 19.15, mag: 3.92, name: 'Epsilon Her' },   // 6
  ], [
    { from: 6, to: 1 }, { from: 1, to: 0 }, { from: 0, to: 5 },
    { from: 1, to: 3 }, { from: 3, to: 2 }, { from: 3, to: 4 }, { from: 2, to: 4 },
  ]),

  makeCon('centaurus', 'Centaurus', 'Cen', 'medium', [
    { ra: 14.66, dec: -60.83, mag: -0.01, name: 'Rigil Kentaurus' }, // 0
    { ra: 14.06, dec: -60.37, mag:  0.61, name: 'Hadar' },        // 1
    { ra: 13.66, dec: -53.47, mag:  2.06, name: 'Menkent' },      // 2
    { ra: 14.11, dec: -36.37, mag:  2.55, name: 'Muhlifain' },    // 3
    { ra: 12.19, dec: -52.37, mag:  2.75, name: 'Epsilon Cen' },  // 4
    { ra: 13.34, dec: -36.71, mag:  2.85, name: 'Zeta Cen' },     // 5
    { ra: 13.93, dec: -47.29, mag:  2.06, name: 'Theta Cen' },    // 6
  ], [
    { from: 0, to: 1 }, { from: 1, to: 6 }, { from: 6, to: 2 },
    { from: 2, to: 5 }, { from: 5, to: 3 }, { from: 1, to: 4 },
  ]),

  makeCon('draco', 'Draco', 'Dra', 'medium', [
    { ra: 17.94, dec: 51.49, mag: 2.23, name: 'Eltanin' },        // 0
    { ra: 17.51, dec: 52.30, mag: 2.79, name: 'Rastaban' },       // 1
    { ra: 14.07, dec: 64.37, mag: 3.07, name: 'Aldhibah' },       // 2
    { ra: 11.52, dec: 69.33, mag: 3.17, name: 'Thuban' },         // 3
    { ra: 17.15, dec: 65.71, mag: 3.29, name: 'Chi Dra' },        // 4
    { ra: 19.21, dec: 67.66, mag: 3.84, name: 'Epsilon Dra' },    // 5
    { ra: 15.41, dec: 58.97, mag: 3.73, name: 'Theta Dra' },      // 6
    { ra: 16.40, dec: 61.51, mag: 3.17, name: 'Eta Dra' },        // 7
  ], [
    { from: 3, to: 6 }, { from: 6, to: 7 }, { from: 7, to: 2 },
    { from: 2, to: 4 }, { from: 4, to: 1 }, { from: 1, to: 0 },
    { from: 0, to: 5 },
  ]),

  makeCon('corona_borealis', 'Corona Borealis', 'CrB', 'medium', [
    { ra: 15.58, dec: 26.71, mag: 2.23, name: 'Alphecca' },      // 0
    { ra: 15.46, dec: 29.11, mag: 3.66, name: 'Nusakan' },       // 1
    { ra: 15.71, dec: 26.30, mag: 3.81, name: 'Gamma CrB' },     // 2
    { ra: 15.83, dec: 26.88, mag: 4.63, name: 'Delta CrB' },     // 3
    { ra: 15.96, dec: 26.88, mag: 4.14, name: 'Epsilon CrB' },   // 4
  ], [
    { from: 1, to: 0 }, { from: 0, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
  ]),

  makeCon('corvus', 'Corvus', 'Crv', 'medium', [
    { ra: 12.17, dec: -17.54, mag: 2.59, name: 'Gienah' },        // 0
    { ra: 12.50, dec: -23.40, mag: 2.65, name: 'Kraz' },          // 1
    { ra: 12.14, dec: -22.62, mag: 2.94, name: 'Algorab' },       // 2
    { ra: 12.26, dec: -24.73, mag: 3.02, name: 'Delta Crv' },     // 3
  ], [
    { from: 0, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 1 }, { from: 1, to: 0 },
  ]),

  makeCon('crater', 'Crater', 'Crt', 'medium', [
    { ra: 11.41, dec: -17.68, mag: 3.56, name: 'Alkes' },         // 0
    { ra: 10.99, dec: -18.30, mag: 4.07, name: 'Beta Crt' },      // 1
    { ra: 11.75, dec: -18.35, mag: 4.08, name: 'Gamma Crt' },     // 2
    { ra: 11.32, dec: -14.78, mag: 3.82, name: 'Delta Crt' },     // 3
  ], [
    { from: 1, to: 0 }, { from: 0, to: 3 }, { from: 3, to: 2 },
  ]),

  makeCon('lupus', 'Lupus', 'Lup', 'medium', [
    { ra: 14.98, dec: -43.13, mag: 2.30, name: 'Alpha Lup' },     // 0
    { ra: 15.20, dec: -40.90, mag: 2.68, name: 'Beta Lup' },      // 1
    { ra: 15.59, dec: -41.17, mag: 2.78, name: 'Gamma Lup' },     // 2
    { ra: 15.36, dec: -44.96, mag: 3.22, name: 'Delta Lup' },     // 3
    { ra: 15.37, dec: -36.26, mag: 3.41, name: 'Epsilon Lup' },   // 4
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
    { from: 0, to: 3 }, { from: 1, to: 4 },
  ]),

  makeCon('serpens', 'Serpens', 'Ser', 'medium', [
    { ra: 15.74, dec:  6.43, mag: 2.65, name: 'Unukalhai' },     // 0
    { ra: 15.82, dec: 15.07, mag: 3.54, name: 'Beta Ser' },      // 1
    { ra: 15.58, dec:  2.20, mag: 3.67, name: 'Gamma Ser' },     // 2
    { ra: 18.94, dec:  4.20, mag: 3.26, name: 'Eta Ser' },       // 3
    { ra: 18.35, dec: -2.90, mag: 4.09, name: 'Mu Ser' },        // 4
  ], [
    { from: 1, to: 0 }, { from: 0, to: 2 },
    { from: 4, to: 3 },
  ]),

  makeCon('cepheus', 'Cepheus', 'Cep', 'medium', [
    { ra: 21.31, dec: 62.58, mag: 2.44, name: 'Alderamin' },      // 0
    { ra: 21.48, dec: 70.56, mag: 3.23, name: 'Alfirk' },         // 1
    { ra: 23.66, dec: 77.63, mag: 3.21, name: 'Errai' },          // 2
    { ra: 22.83, dec: 66.20, mag: 3.43, name: 'Zeta Cep' },       // 3
    { ra: 22.18, dec: 58.20, mag: 4.19, name: 'Iota Cep' },       // 4
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
    { from: 3, to: 0 }, { from: 0, to: 4 },
  ]),

  makeCon('delphinus', 'Delphinus', 'Del', 'medium', [
    { ra: 20.66, dec: 15.91, mag: 3.77, name: 'Rotanev' },        // 0
    { ra: 20.63, dec: 14.60, mag: 3.64, name: 'Sualocin' },       // 1
    { ra: 20.72, dec: 16.12, mag: 4.03, name: 'Gamma Del' },      // 2
    { ra: 20.75, dec: 15.07, mag: 4.43, name: 'Delta Del' },      // 3
    { ra: 20.55, dec: 11.30, mag: 4.27, name: 'Epsilon Del' },    // 4
  ], [
    { from: 4, to: 1 }, { from: 1, to: 0 }, { from: 0, to: 2 },
    { from: 2, to: 3 }, { from: 3, to: 1 },
  ]),

  makeCon('sagitta', 'Sagitta', 'Sge', 'medium', [
    { ra: 19.98, dec: 18.01, mag: 3.51, name: 'Gamma Sge' },      // 0
    { ra: 19.79, dec: 18.53, mag: 4.37, name: 'Delta Sge' },      // 1
    { ra: 19.67, dec: 17.97, mag: 4.67, name: 'Alpha Sge' },      // 2
    { ra: 19.69, dec: 17.48, mag: 4.37, name: 'Beta Sge' },       // 3
  ], [
    { from: 2, to: 1 }, { from: 3, to: 1 }, { from: 1, to: 0 },
  ]),

  makeCon('triangulum', 'Triangulum', 'Tri', 'medium', [
    { ra:  2.16, dec: 29.58, mag: 3.00, name: 'Ras al Muthallah' }, // 0
    { ra:  1.88, dec: 29.58, mag: 3.41, name: 'Beta Tri' },       // 1
    { ra:  2.29, dec: 33.85, mag: 4.01, name: 'Gamma Tri' },      // 2
  ], [
    { from: 1, to: 0 }, { from: 0, to: 2 }, { from: 2, to: 1 },
  ]),

  makeCon('ara', 'Ara', 'Ara', 'medium', [
    { ra: 17.42, dec: -49.88, mag: 2.85, name: 'Beta Ara' },      // 0
    { ra: 17.53, dec: -49.88, mag: 2.77, name: 'Alpha Ara' },     // 1
    { ra: 17.42, dec: -55.53, mag: 3.13, name: 'Zeta Ara' },      // 2
    { ra: 17.62, dec: -46.50, mag: 3.13, name: 'Gamma Ara' },     // 3
    { ra: 16.99, dec: -53.16, mag: 3.31, name: 'Eta Ara' },       // 4
  ], [
    { from: 4, to: 2 }, { from: 2, to: 0 }, { from: 0, to: 1 },
    { from: 1, to: 3 }, { from: 0, to: 3 },
  ]),

  makeCon('corona_australis', 'Corona Australis', 'CrA', 'medium', [
    { ra: 19.15, dec: -37.90, mag: 4.11, name: 'Alphekka Meridiana' }, // 0
    { ra: 19.17, dec: -40.50, mag: 4.23, name: 'Beta CrA' },      // 1
    { ra: 18.96, dec: -37.11, mag: 4.54, name: 'Gamma CrA' },     // 2
    { ra: 19.26, dec: -39.34, mag: 4.57, name: 'Delta CrA' },     // 3
    { ra: 18.83, dec: -43.68, mag: 4.74, name: 'Eta CrA' },       // 4
  ], [
    { from: 4, to: 1 }, { from: 1, to: 3 }, { from: 3, to: 0 },
    { from: 0, to: 2 },
  ]),

  makeCon('columba', 'Columba', 'Col', 'medium', [
    { ra:  5.66, dec: -34.07, mag: 2.65, name: 'Phact' },         // 0
    { ra:  5.85, dec: -35.77, mag: 3.12, name: 'Wezn' },          // 1
    { ra:  5.96, dec: -42.82, mag: 3.86, name: 'Delta Col' },     // 2
    { ra:  6.37, dec: -33.44, mag: 3.85, name: 'Epsilon Col' },   // 3
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 1, to: 3 },
  ]),

  makeCon('lepus', 'Lepus', 'Lep', 'medium', [
    { ra:  5.55, dec: -17.82, mag: 2.58, name: 'Arneb' },         // 0
    { ra:  5.47, dec: -20.76, mag: 2.84, name: 'Nihal' },         // 1
    { ra:  5.21, dec: -16.21, mag: 3.55, name: 'Gamma Lep' },     // 2
    { ra:  5.09, dec: -22.37, mag: 3.59, name: 'Delta Lep' },     // 3
    { ra:  5.78, dec: -14.82, mag: 3.71, name: 'Eta Lep' },       // 4
  ], [
    { from: 2, to: 0 }, { from: 0, to: 1 }, { from: 1, to: 3 },
    { from: 0, to: 4 },
  ]),

  makeCon('pavo', 'Pavo', 'Pav', 'medium', [
    { ra: 19.09, dec: -59.99, mag: 1.94, name: 'Peacock' },       // 0
    { ra: 18.72, dec: -71.43, mag: 3.43, name: 'Beta Pav' },      // 1
    { ra: 18.39, dec: -61.49, mag: 4.01, name: 'Gamma Pav' },     // 2
    { ra: 19.97, dec: -66.18, mag: 3.61, name: 'Delta Pav' },     // 3
    { ra: 17.76, dec: -64.72, mag: 4.35, name: 'Eta Pav' },       // 4
  ], [
    { from: 4, to: 1 }, { from: 1, to: 0 }, { from: 0, to: 3 },
    { from: 0, to: 2 },
  ]),

  // ============================================================
  // === HARD (43) ===
  // ============================================================

  makeCon('eridanus', 'Eridanus', 'Eri', 'hard', [
    { ra:  1.63, dec: -57.24, mag: 0.46, name: 'Achernar' },      // 0
    { ra:  5.13, dec:  -5.09, mag: 2.97, name: 'Cursa' },         // 1
    { ra:  2.94, dec: -40.30, mag: 2.80, name: 'Acamar' },        // 2
    { ra:  3.97, dec: -13.51, mag: 3.55, name: 'Zaurak' },        // 3
    { ra:  4.60, dec:  -3.35, mag: 3.72, name: 'Delta Eri' },     // 4
    { ra:  3.55, dec: -21.63, mag: 3.89, name: 'Beid' },          // 5
  ], [
    { from: 0, to: 2 }, { from: 2, to: 5 }, { from: 5, to: 3 },
    { from: 3, to: 4 }, { from: 4, to: 1 },
  ]),

  makeCon('monoceros', 'Monoceros', 'Mon', 'hard', [
    { ra:  7.69, dec: -9.55,  mag: 3.93, name: 'Beta Mon' },      // 0
    { ra:  6.40, dec: -7.03,  mag: 4.07, name: 'Alpha Mon' },     // 1
    { ra:  8.14, dec: -2.99,  mag: 4.15, name: 'Gamma Mon' },     // 2
    { ra:  7.20, dec: -0.49,  mag: 4.50, name: 'Delta Mon' },     // 3
  ], [
    { from: 1, to: 3 }, { from: 3, to: 0 }, { from: 0, to: 2 },
  ]),

  makeCon('hydra', 'Hydra', 'Hya', 'hard', [
    { ra: 10.18, dec: -12.35, mag: 1.99, name: 'Alphard' },       // 0
    { ra:  9.24, dec:  -2.31, mag: 3.11, name: 'Zeta Hya' },      // 1
    { ra:  9.66, dec:  -1.14, mag: 3.54, name: 'Nu Hya' },        // 2
    { ra:  8.92, dec:   5.95, mag: 3.38, name: 'Epsilon Hya' },   // 3
    { ra:  8.78, dec:   6.42, mag: 3.83, name: 'Delta Hya' },     // 4
    { ra: 10.83, dec: -16.19, mag: 3.27, name: 'Gamma Hya' },     // 5
    { ra: 14.11, dec: -26.68, mag: 3.54, name: 'Pi Hya' },        // 6
  ], [
    { from: 4, to: 3 }, { from: 3, to: 1 }, { from: 1, to: 2 },
    { from: 2, to: 0 }, { from: 0, to: 5 }, { from: 5, to: 6 },
  ]),

  makeCon('fornax', 'Fornax', 'For', 'hard', [
    { ra:  3.20, dec: -28.99, mag: 3.80, name: 'Dalim' },         // 0
    { ra:  2.82, dec: -32.41, mag: 4.46, name: 'Beta For' },      // 1
    { ra:  3.46, dec: -26.90, mag: 4.69, name: 'Nu For' },        // 2
  ], [
    { from: 1, to: 0 }, { from: 0, to: 2 },
  ]),

  makeCon('horologium', 'Horologium', 'Hor', 'hard', [
    { ra:  4.23, dec: -42.29, mag: 3.86, name: 'Alpha Hor' },     // 0
    { ra:  2.72, dec: -50.80, mag: 4.99, name: 'Beta Hor' },      // 1
    { ra:  2.68, dec: -64.07, mag: 5.31, name: 'Mu Hor' },        // 2
    { ra:  3.06, dec: -59.74, mag: 5.01, name: 'Delta Hor' },     // 3
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
  ]),

  makeCon('reticulum', 'Reticulum', 'Ret', 'hard', [
    { ra:  4.24, dec: -62.47, mag: 3.35, name: 'Alpha Ret' },     // 0
    { ra:  3.74, dec: -64.81, mag: 3.85, name: 'Beta Ret' },      // 1
    { ra:  4.02, dec: -61.40, mag: 4.44, name: 'Epsilon Ret' },   // 2
    { ra:  4.60, dec: -63.25, mag: 4.97, name: 'Delta Ret' },     // 3
  ], [
    { from: 0, to: 2 }, { from: 2, to: 1 }, { from: 1, to: 3 }, { from: 3, to: 0 },
  ]),

  makeCon('pictor', 'Pictor', 'Pic', 'hard', [
    { ra:  6.80, dec: -61.94, mag: 3.27, name: 'Alpha Pic' },     // 0
    { ra:  5.79, dec: -51.07, mag: 3.86, name: 'Beta Pic' },      // 1
    { ra:  6.17, dec: -58.97, mag: 4.50, name: 'Gamma Pic' },     // 2
  ], [
    { from: 1, to: 2 }, { from: 2, to: 0 },
  ]),

  makeCon('dorado', 'Dorado', 'Dor', 'hard', [
    { ra:  4.27, dec: -51.49, mag: 3.27, name: 'Alpha Dor' },     // 0
    { ra:  5.56, dec: -62.49, mag: 3.76, name: 'Beta Dor' },      // 1
    { ra:  6.09, dec: -57.47, mag: 4.25, name: 'Gamma Dor' },     // 2
    { ra:  4.57, dec: -55.04, mag: 4.34, name: 'Delta Dor' },     // 3
  ], [
    { from: 0, to: 3 }, { from: 3, to: 1 }, { from: 1, to: 2 },
  ]),

  makeCon('volans', 'Volans', 'Vol', 'hard', [
    { ra:  7.15, dec: -70.50, mag: 3.78, name: 'Beta Vol' },      // 0
    { ra:  7.70, dec: -66.90, mag: 3.91, name: 'Gamma Vol' },     // 1
    { ra:  9.04, dec: -66.40, mag: 4.16, name: 'Delta Vol' },     // 2
    { ra:  7.28, dec: -67.96, mag: 4.35, name: 'Alpha Vol' },     // 3
  ], [
    { from: 0, to: 3 }, { from: 3, to: 1 }, { from: 1, to: 2 },
  ]),

  makeCon('mensa', 'Mensa', 'Men', 'hard', [
    { ra:  5.53, dec: -76.34, mag: 5.09, name: 'Alpha Men' },     // 0
    { ra:  5.04, dec: -71.32, mag: 5.31, name: 'Beta Men' },      // 1
    { ra:  5.99, dec: -74.75, mag: 5.53, name: 'Gamma Men' },     // 2
    { ra:  7.38, dec: -76.29, mag: 5.47, name: 'Delta Men' },     // 3
  ], [
    { from: 1, to: 0 }, { from: 0, to: 2 }, { from: 2, to: 3 },
  ]),

  makeCon('chamaeleon', 'Chamaeleon', 'Cha', 'hard', [
    { ra: 10.59, dec: -78.61, mag: 4.05, name: 'Alpha Cha' },     // 0
    { ra:  8.31, dec: -76.92, mag: 4.11, name: 'Gamma Cha' },     // 1
    { ra: 12.31, dec: -79.31, mag: 4.45, name: 'Beta Cha' },      // 2
    { ra:  8.09, dec: -80.47, mag: 4.48, name: 'Delta Cha' },     // 3
  ], [
    { from: 1, to: 0 }, { from: 0, to: 2 }, { from: 1, to: 3 },
  ]),

  makeCon('musca', 'Musca', 'Mus', 'hard', [
    { ra: 12.62, dec: -69.14, mag: 2.69, name: 'Alpha Mus' },     // 0
    { ra: 12.77, dec: -68.11, mag: 3.04, name: 'Beta Mus' },      // 1
    { ra: 12.29, dec: -72.13, mag: 3.62, name: 'Delta Mus' },     // 2
    { ra: 11.75, dec: -66.73, mag: 3.84, name: 'Epsilon Mus' },   // 3
  ], [
    { from: 3, to: 0 }, { from: 0, to: 1 }, { from: 0, to: 2 },
  ]),

  makeCon('triangulum_australe', 'Triangulum Australe', 'TrA', 'hard', [
    { ra: 16.81, dec: -69.03, mag: 1.92, name: 'Atria' },         // 0
    { ra: 15.92, dec: -63.43, mag: 2.85, name: 'Beta TrA' },      // 1
    { ra: 15.31, dec: -68.68, mag: 2.87, name: 'Gamma TrA' },     // 2
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 0 },
  ]),

  makeCon('norma', 'Norma', 'Nor', 'hard', [
    { ra: 16.33, dec: -50.16, mag: 4.02, name: 'Gamma2 Nor' },    // 0
    { ra: 16.05, dec: -49.23, mag: 4.47, name: 'Eta Nor' },       // 1
    { ra: 16.05, dec: -54.98, mag: 4.73, name: 'Epsilon Nor' },   // 2
    { ra: 16.32, dec: -47.55, mag: 5.36, name: 'Delta Nor' },     // 3
  ], [
    { from: 1, to: 0 }, { from: 0, to: 3 }, { from: 1, to: 2 },
  ]),

  makeCon('circinus', 'Circinus', 'Cir', 'hard', [
    { ra: 14.71, dec: -64.98, mag: 3.19, name: 'Alpha Cir' },     // 0
    { ra: 15.29, dec: -58.80, mag: 4.48, name: 'Beta Cir' },      // 1
    { ra: 15.39, dec: -59.32, mag: 4.51, name: 'Gamma Cir' },     // 2
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 },
  ]),

  makeCon('telescopium', 'Telescopium', 'Tel', 'hard', [
    { ra: 18.45, dec: -45.97, mag: 3.51, name: 'Alpha Tel' },     // 0
    { ra: 18.48, dec: -49.07, mag: 4.10, name: 'Epsilon Tel' },   // 1
    { ra: 18.53, dec: -47.37, mag: 4.13, name: 'Zeta Tel' },      // 2
  ], [
    { from: 0, to: 2 }, { from: 2, to: 1 },
  ]),

  makeCon('indus', 'Indus', 'Ind', 'hard', [
    { ra: 20.63, dec: -47.29, mag: 3.11, name: 'Alpha Ind' },     // 0
    { ra: 20.91, dec: -58.45, mag: 3.65, name: 'Beta Ind' },      // 1
    { ra: 21.97, dec: -54.99, mag: 4.39, name: 'Theta Ind' },     // 2
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 },
  ]),

  makeCon('microscopium', 'Microscopium', 'Mic', 'hard', [
    { ra: 21.02, dec: -32.26, mag: 4.67, name: 'Gamma Mic' },     // 0
    { ra: 20.83, dec: -33.78, mag: 4.71, name: 'Alpha Mic' },     // 1
    { ra: 21.34, dec: -40.81, mag: 4.80, name: 'Epsilon Mic' },   // 2
  ], [
    { from: 1, to: 0 }, { from: 0, to: 2 },
  ]),

  makeCon('grus', 'Grus', 'Gru', 'hard', [
    { ra: 22.14, dec: -46.96, mag: 1.73, name: 'Alnair' },        // 0
    { ra: 22.71, dec: -46.88, mag: 2.10, name: 'Beta Gru' },      // 1
    { ra: 22.49, dec: -43.50, mag: 3.01, name: 'Gamma Gru' },     // 2
    { ra: 23.02, dec: -52.75, mag: 3.97, name: 'Delta Gru' },     // 3
    { ra: 22.81, dec: -51.32, mag: 4.28, name: 'Epsilon Gru' },   // 4
  ], [
    { from: 0, to: 2 }, { from: 2, to: 1 }, { from: 1, to: 4 },
    { from: 4, to: 3 },
  ]),

  makeCon('phoenix', 'Phoenix', 'Phe', 'hard', [
    { ra:  0.44, dec: -42.31, mag: 2.39, name: 'Ankaa' },         // 0
    { ra:  1.10, dec: -46.72, mag: 3.31, name: 'Beta Phe' },      // 1
    { ra:  1.47, dec: -43.32, mag: 3.41, name: 'Gamma Phe' },     // 2
    { ra:  1.52, dec: -55.25, mag: 3.95, name: 'Delta Phe' },     // 3
  ], [
    { from: 0, to: 1 }, { from: 1, to: 3 }, { from: 1, to: 2 }, { from: 2, to: 0 },
  ]),

  makeCon('sculptor', 'Sculptor', 'Scl', 'hard', [
    { ra:  0.97, dec: -29.36, mag: 4.31, name: 'Alpha Scl' },     // 0
    { ra: 23.55, dec: -37.82, mag: 4.37, name: 'Beta Scl' },      // 1
    { ra: 23.31, dec: -32.53, mag: 4.41, name: 'Gamma Scl' },     // 2
    { ra:  1.04, dec: -25.00, mag: 4.57, name: 'Delta Scl' },     // 3
  ], [
    { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 0 },
  ]),

  makeCon('tucana', 'Tucana', 'Tuc', 'hard', [
    { ra: 22.31, dec: -60.26, mag: 2.86, name: 'Alpha Tuc' },     // 0
    { ra: 23.46, dec: -65.57, mag: 3.99, name: 'Gamma Tuc' },     // 1
    { ra: 23.29, dec: -58.24, mag: 4.23, name: 'Beta Tuc' },      // 2
    { ra:  0.53, dec: -62.96, mag: 4.49, name: 'Zeta Tuc' },      // 3
  ], [
    { from: 0, to: 2 }, { from: 2, to: 1 }, { from: 1, to: 3 }, { from: 3, to: 0 },
  ]),

  makeCon('hydrus', 'Hydrus', 'Hyi', 'hard', [
    { ra:  1.98, dec: -61.57, mag: 2.82, name: 'Beta Hyi' },      // 0
    { ra:  1.47, dec: -68.87, mag: 3.26, name: 'Alpha Hyi' },     // 1
    { ra:  3.79, dec: -74.24, mag: 3.24, name: 'Gamma Hyi' },     // 2
    { ra:  2.36, dec: -68.27, mag: 4.12, name: 'Delta Hyi' },     // 3
  ], [
    { from: 1, to: 0 }, { from: 0, to: 3 }, { from: 3, to: 2 },
  ]),

  makeCon('octans', 'Octans', 'Oct', 'hard', [
    { ra: 21.69, dec: -77.39, mag: 3.76, name: 'Nu Oct' },        // 0
    { ra: 22.77, dec: -81.38, mag: 4.14, name: 'Beta Oct' },      // 1
    { ra: 14.45, dec: -83.67, mag: 4.32, name: 'Delta Oct' },     // 2
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 },
  ]),

  makeCon('apus', 'Apus', 'Aps', 'hard', [
    { ra: 14.80, dec: -79.04, mag: 3.83, name: 'Alpha Aps' },     // 0
    { ra: 16.56, dec: -78.90, mag: 3.86, name: 'Gamma Aps' },     // 1
    { ra: 16.72, dec: -77.52, mag: 4.23, name: 'Beta Aps' },      // 2
    { ra: 16.34, dec: -78.69, mag: 4.68, name: 'Delta1 Aps' },    // 3
  ], [
    { from: 0, to: 3 }, { from: 3, to: 1 }, { from: 1, to: 2 },
  ]),

  makeCon('puppis', 'Puppis', 'Pup', 'hard', [
    { ra:  8.06, dec: -40.00, mag: 2.25, name: 'Naos' },          // 0
    { ra:  7.49, dec: -37.10, mag: 3.17, name: 'Pi Pup' },        // 1
    { ra:  7.82, dec: -24.86, mag: 3.25, name: 'Sigma Pup' },     // 2
    { ra:  6.63, dec: -43.20, mag: 3.75, name: 'Nu Pup' },        // 3
    { ra:  7.29, dec: -36.74, mag: 3.17, name: 'Xi Pup' },        // 4
  ], [
    { from: 3, to: 1 }, { from: 1, to: 0 }, { from: 0, to: 2 },
    { from: 1, to: 4 },
  ]),

  makeCon('vela', 'Vela', 'Vel', 'hard', [
    { ra:  9.13, dec: -43.43, mag: 1.83, name: 'Gamma Vel' },     // 0
    { ra:  8.16, dec: -47.34, mag: 1.96, name: 'Delta Vel' },     // 1
    { ra:  9.37, dec: -55.01, mag: 2.50, name: 'Kappa Vel' },     // 2
    { ra:  9.51, dec: -40.47, mag: 2.70, name: 'Lambda Vel' },    // 3
    { ra: 10.78, dec: -49.42, mag: 2.97, name: 'Mu Vel' },        // 4
  ], [
    { from: 1, to: 0 }, { from: 0, to: 3 }, { from: 3, to: 4 },
    { from: 0, to: 2 }, { from: 2, to: 1 },
  ]),

  makeCon('pyxis', 'Pyxis', 'Pyx', 'hard', [
    { ra:  8.73, dec: -33.19, mag: 3.68, name: 'Alpha Pyx' },     // 0
    { ra:  8.67, dec: -35.31, mag: 3.97, name: 'Beta Pyx' },      // 1
    { ra:  8.84, dec: -27.71, mag: 4.01, name: 'Gamma Pyx' },     // 2
  ], [
    { from: 2, to: 0 }, { from: 0, to: 1 },
  ]),

  makeCon('antlia', 'Antlia', 'Ant', 'hard', [
    { ra: 10.45, dec: -31.07, mag: 4.25, name: 'Alpha Ant' },     // 0
    { ra: 10.93, dec: -37.14, mag: 4.60, name: 'Epsilon Ant' },   // 1
    { ra: 10.63, dec: -35.51, mag: 4.78, name: 'Iota Ant' },      // 2
  ], [
    { from: 0, to: 2 }, { from: 2, to: 1 },
  ]),

  makeCon('sextans', 'Sextans', 'Sex', 'hard', [
    { ra: 10.13, dec:  -0.37, mag: 4.49, name: 'Alpha Sex' },     // 0
    { ra:  9.87, dec:  -8.11, mag: 5.07, name: 'Beta Sex' },      // 1
    { ra: 10.50, dec:  -2.44, mag: 5.20, name: 'Gamma Sex' },     // 2
  ], [
    { from: 1, to: 0 }, { from: 0, to: 2 },
  ]),

  makeCon('leo_minor', 'Leo Minor', 'LMi', 'hard', [
    { ra: 10.46, dec: 36.71, mag: 3.83, name: 'Praecipua' },      // 0
    { ra: 10.89, dec: 34.21, mag: 4.21, name: 'Beta LMi' },       // 1
    { ra: 10.12, dec: 35.25, mag: 4.49, name: '10 LMi' },         // 2
  ], [
    { from: 2, to: 0 }, { from: 0, to: 1 },
  ]),

  makeCon('lynx', 'Lynx', 'Lyn', 'hard', [
    { ra:  9.35, dec: 34.39, mag: 3.13, name: 'Alpha Lyn' },      // 0
    { ra:  7.01, dec: 59.03, mag: 4.25, name: '38 Lyn' },         // 1
    { ra:  6.33, dec: 59.44, mag: 3.97, name: '31 Lyn' },         // 2
    { ra:  8.38, dec: 43.19, mag: 4.55, name: '15 Lyn' },         // 3
  ], [
    { from: 2, to: 1 }, { from: 1, to: 3 }, { from: 3, to: 0 },
  ]),

  makeCon('camelopardalis', 'Camelopardalis', 'Cam', 'hard', [
    { ra:  4.90, dec: 66.34, mag: 4.03, name: 'Beta Cam' },       // 0
    { ra:  5.06, dec: 60.44, mag: 4.26, name: 'Alpha Cam' },      // 1
    { ra:  3.84, dec: 71.33, mag: 4.21, name: 'Gamma Cam' },      // 2
    { ra:  7.00, dec: 76.97, mag: 4.59, name: 'CS Cam' },         // 3
  ], [
    { from: 2, to: 0 }, { from: 0, to: 1 }, { from: 2, to: 3 },
  ]),

  makeCon('canes_venatici', 'Canes Venatici', 'CVn', 'hard', [
    { ra: 12.93, dec: 38.32, mag: 2.89, name: 'Cor Caroli' },     // 0
    { ra: 13.19, dec: 38.86, mag: 4.26, name: 'Chara' },          // 1
  ], [
    { from: 0, to: 1 },
  ]),

  makeCon('coma_berenices', 'Coma Berenices', 'Com', 'hard', [
    { ra: 13.17, dec: 17.53, mag: 4.26, name: 'Beta Com' },       // 0
    { ra: 13.00, dec: 21.99, mag: 4.32, name: 'Alpha Com' },      // 1
    { ra: 12.45, dec: 28.27, mag: 4.36, name: 'Gamma Com' },      // 2
  ], [
    { from: 2, to: 1 }, { from: 1, to: 0 },
  ]),

  makeCon('vulpecula', 'Vulpecula', 'Vul', 'hard', [
    { ra: 19.47, dec: 24.66, mag: 4.44, name: 'Anser' },          // 0
    { ra: 20.25, dec: 24.75, mag: 4.61, name: '1 Vul' },          // 1
    { ra: 19.89, dec: 27.10, mag: 5.49, name: '13 Vul' },         // 2
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 },
  ]),

  makeCon('equuleus', 'Equuleus', 'Equ', 'hard', [
    { ra: 21.26, dec:  5.25, mag: 3.92, name: 'Kitalpha' },       // 0
    { ra: 21.24, dec:  5.03, mag: 4.69, name: 'Delta Equ' },      // 1
    { ra: 21.18, dec:  4.30, mag: 5.23, name: 'Gamma Equ' },      // 2
  ], [
    { from: 2, to: 0 }, { from: 0, to: 1 },
  ]),

  makeCon('lacerta', 'Lacerta', 'Lac', 'hard', [
    { ra: 22.52, dec: 50.28, mag: 3.77, name: 'Alpha Lac' },      // 0
    { ra: 22.40, dec: 52.23, mag: 4.43, name: 'Beta Lac' },       // 1
    { ra: 22.35, dec: 49.48, mag: 4.51, name: '5 Lac' },          // 2
    { ra: 22.49, dec: 47.71, mag: 4.57, name: '4 Lac' },          // 3
  ], [
    { from: 1, to: 0 }, { from: 0, to: 2 }, { from: 2, to: 3 },
  ]),

  makeCon('scutum', 'Scutum', 'Sct', 'hard', [
    { ra: 18.59, dec:  -8.24, mag: 3.85, name: 'Alpha Sct' },     // 0
    { ra: 18.79, dec:  -4.75, mag: 4.22, name: 'Beta Sct' },      // 1
    { ra: 18.71, dec:  -8.93, mag: 4.67, name: 'Gamma Sct' },     // 2
    { ra: 18.82, dec: -10.02, mag: 4.72, name: 'Delta Sct' },     // 3
  ], [
    { from: 0, to: 1 }, { from: 0, to: 2 }, { from: 2, to: 3 },
  ]),

  makeCon('caelum', 'Caelum', 'Cae', 'hard', [
    { ra:  4.68, dec: -41.86, mag: 4.45, name: 'Alpha Cae' },     // 0
    { ra:  4.70, dec: -37.14, mag: 5.07, name: 'Beta Cae' },      // 1
    { ra:  4.49, dec: -44.95, mag: 5.07, name: 'Gamma Cae' },     // 2
  ], [
    { from: 1, to: 0 }, { from: 0, to: 2 },
  ]),

  makeCon('piscis_austrinus', 'Piscis Austrinus', 'PsA', 'hard', [
    { ra: 22.96, dec: -29.62, mag: 1.16, name: 'Fomalhaut' },    // 0
    { ra: 22.68, dec: -32.99, mag: 4.18, name: 'Beta PsA' },     // 1
    { ra: 22.52, dec: -32.35, mag: 4.20, name: 'Gamma PsA' },    // 2
    { ra: 22.84, dec: -24.30, mag: 4.17, name: 'Delta PsA' },    // 3
    { ra: 21.80, dec: -24.18, mag: 4.20, name: 'Eta PsA' },      // 4
  ], [
    { from: 4, to: 3 }, { from: 3, to: 0 }, { from: 0, to: 1 },
    { from: 1, to: 2 }, { from: 2, to: 0 },
  ]),

  makeCon('carina', 'Carina', 'Car', 'hard', [
    { ra:  6.40, dec: -52.70, mag: -0.72, name: 'Canopus' },      // 0
    { ra:  9.22, dec: -59.28, mag:  1.67, name: 'Avior' },        // 1
    { ra: 10.23, dec: -61.33, mag:  2.76, name: 'Aspidiske' },    // 2
    { ra:  8.38, dec: -59.51, mag:  1.68, name: 'Miaplacidus' },  // 3
    { ra:  7.95, dec: -52.98, mag:  2.24, name: 'Epsilon Car' },  // 4
  ], [
    { from: 0, to: 4 }, { from: 4, to: 3 }, { from: 3, to: 1 },
    { from: 1, to: 2 },
  ]),

  makeCon('cetus', 'Cetus', 'Cet', 'hard', [
    { ra:  0.73, dec: -17.99, mag: 2.04, name: 'Diphda' },        // 0
    { ra:  2.66, dec:   3.23, mag: 2.54, name: 'Menkar' },        // 1
    { ra:  1.40, dec:  -8.18, mag: 3.56, name: 'Gamma Cet' },     // 2
    { ra:  1.14, dec: -10.18, mag: 3.74, name: 'Xi2 Cet' },       // 3
    { ra:  2.72, dec:   8.46, mag: 3.47, name: 'Mira' },          // 4
  ], [
    { from: 0, to: 3 }, { from: 3, to: 2 }, { from: 2, to: 1 },
    { from: 1, to: 4 },
  ]),

];

// Background stars for atmosphere (~200 random dim stars)
export const backgroundStars: Star[] = [
  // A few well-known bright stars for reference
  { ra:  2.53, dec:  89.26, mag:  1.98 }, // Polaris
  { ra: 18.62, dec:  38.78, mag:  0.03 }, // Vega
  { ra: 19.85, dec:   8.87, mag:  0.77 }, // Altair
  // Pleiades cluster
  { ra:  3.79, dec:  24.11, mag:  3.70 },
  { ra:  3.81, dec:  24.05, mag:  4.20 },
  { ra:  3.78, dec:  24.37, mag:  3.90 },
  { ra:  3.76, dec:  24.11, mag:  4.30 },
  { ra:  3.75, dec:  24.28, mag:  4.10 },
  { ra:  3.77, dec:  23.95, mag:  5.09 },
  // Hyades cluster
  { ra:  4.30, dec:  15.87, mag:  3.65 },
  { ra:  4.48, dec:  16.00, mag:  3.76 },
  { ra:  4.52, dec:  15.52, mag:  4.29 },
  // Random dim background stars — uniform distribution on sphere using hash-based PRNG
  ...Array.from({ length: 300 }, (_, i) => {
    // Simple hash to break patterns (Mulberry32-inspired)
    let h = (i + 1) * 2654435761;
    h = ((h >>> 16) ^ h) * 0x45d9f3b;
    h = ((h >>> 16) ^ h) * 0x45d9f3b;
    h = (h >>> 16) ^ h;
    const r1 = (h & 0xffff) / 0x10000;
    h = ((h >>> 16) ^ (h * 0x119de1f3)) >>> 0;
    const r2 = (h & 0xffff) / 0x10000;

    const ra = r1 * 24;
    const dec = Math.asin(2 * r2 - 1) * (180 / Math.PI);
    return {
      ra,
      dec,
      mag: 3.8 + (((i * 7 + 13) % 25) * 0.08),
    };
  }),
];
