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

function computeCenter(stars: Star[]): { ra: number; dec: number } {
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

function makeCon(
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
  // === EASY ===
  makeCon('orion', 'Orion', 'Ori', 'easy', [
    { ra: 5.92, dec: 7.41, mag: 0.5, name: 'Betelgeuse' },    // 0
    { ra: 5.24, dec: -8.20, mag: 0.12, name: 'Rigel' },       // 1
    { ra: 5.68, dec: -1.94, mag: 1.7, name: 'Alnitak' },      // 2
    { ra: 5.60, dec: -1.20, mag: 1.69, name: 'Alnilam' },     // 3
    { ra: 5.53, dec: -0.30, mag: 2.23, name: 'Mintaka' },     // 4
    { ra: 5.42, dec: 6.35, mag: 1.64, name: 'Bellatrix' },    // 5
    { ra: 5.80, dec: -9.67, mag: 2.06, name: 'Saiph' },       // 6
  ], [
    { from: 0, to: 5 }, { from: 5, to: 4 }, { from: 4, to: 3 }, { from: 3, to: 2 },
    { from: 2, to: 6 }, { from: 0, to: 2 }, { from: 5, to: 1 }, { from: 1, to: 6 },
  ]),

  makeCon('ursa_major', 'Ursa Major', 'UMa', 'easy', [
    { ra: 11.06, dec: 61.75, mag: 1.79, name: 'Dubhe' },      // 0
    { ra: 11.03, dec: 56.38, mag: 2.37, name: 'Merak' },      // 1
    { ra: 11.90, dec: 53.69, mag: 2.44, name: 'Phecda' },     // 2
    { ra: 12.26, dec: 57.03, mag: 3.31, name: 'Megrez' },     // 3
    { ra: 12.90, dec: 55.96, mag: 1.77, name: 'Alioth' },     // 4
    { ra: 13.40, dec: 54.93, mag: 2.27, name: 'Mizar' },      // 5
    { ra: 13.79, dec: 49.31, mag: 1.86, name: 'Alkaid' },     // 6
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
    { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 6 },
    { from: 0, to: 3 },
  ]),

  makeCon('cassiopeia', 'Cassiopeia', 'Cas', 'easy', [
    { ra: 0.68, dec: 56.54, mag: 2.23, name: 'Schedar' },     // 0
    { ra: 0.15, dec: 59.15, mag: 2.27, name: 'Caph' },        // 1
    { ra: 0.95, dec: 60.72, mag: 2.47, name: 'Gamma Cas' },   // 2
    { ra: 1.43, dec: 60.24, mag: 2.68, name: 'Ruchbah' },     // 3
    { ra: 1.91, dec: 63.67, mag: 3.37, name: 'Segin' },       // 4
  ], [
    { from: 1, to: 0 }, { from: 0, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
  ]),

  makeCon('scorpius', 'Scorpius', 'Sco', 'easy', [
    { ra: 16.49, dec: -26.43, mag: 0.96, name: 'Antares' },   // 0
    { ra: 16.09, dec: -19.81, mag: 2.56, name: 'Dschubba' },  // 1
    { ra: 16.01, dec: -22.62, mag: 2.32, name: 'Acrab' },     // 2
    { ra: 16.84, dec: -34.29, mag: 2.82 },                     // 3
    { ra: 17.20, dec: -43.24, mag: 1.87, name: 'Shaula' },    // 4
    { ra: 17.56, dec: -37.10, mag: 2.69, name: 'Sargas' },    // 5
    { ra: 16.36, dec: -25.59, mag: 2.89 },                     // 6
    { ra: 17.71, dec: -39.03, mag: 3.0 },                      // 7
  ], [
    { from: 2, to: 1 }, { from: 1, to: 6 }, { from: 6, to: 0 },
    { from: 0, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 7 },
    { from: 7, to: 5 },
  ]),

  makeCon('leo', 'Leo', 'Leo', 'easy', [
    { ra: 10.14, dec: 11.97, mag: 1.35, name: 'Regulus' },    // 0
    { ra: 11.24, dec: 20.52, mag: 2.14, name: 'Denebola' },   // 1
    { ra: 10.33, dec: 19.84, mag: 2.56, name: 'Algieba' },    // 2
    { ra: 11.82, dec: 14.57, mag: 2.01, name: 'Zosma' },      // 3
    { ra: 9.76, dec: 23.77, mag: 3.44 },                       // 4
    { ra: 9.53, dec: 26.18, mag: 3.52 },                       // 5
  ], [
    { from: 0, to: 2 }, { from: 2, to: 4 }, { from: 4, to: 5 },
    { from: 2, to: 3 }, { from: 3, to: 1 }, { from: 0, to: 3 },
  ]),

  makeCon('crux', 'Crux', 'Cru', 'easy', [
    { ra: 12.44, dec: -63.10, mag: 0.76, name: 'Acrux' },     // 0
    { ra: 12.52, dec: -57.11, mag: 1.25, name: 'Mimosa' },    // 1
    { ra: 12.25, dec: -58.75, mag: 1.63, name: 'Gacrux' },    // 2
    { ra: 12.35, dec: -60.40, mag: 2.80 },                     // 3
  ], [
    { from: 0, to: 2 }, { from: 1, to: 3 },
  ]),

  // === MEDIUM ===
  makeCon('cygnus', 'Cygnus', 'Cyg', 'medium', [
    { ra: 20.69, dec: 45.28, mag: 1.25, name: 'Deneb' },      // 0
    { ra: 19.51, dec: 27.96, mag: 2.20, name: 'Albireo' },    // 1
    { ra: 20.37, dec: 40.26, mag: 2.48, name: 'Sadr' },       // 2
    { ra: 20.77, dec: 33.97, mag: 2.46, name: 'Gienah' },     // 3
    { ra: 19.94, dec: 35.08, mag: 2.87 },                      // 4
  ], [
    { from: 0, to: 2 }, { from: 2, to: 1 }, { from: 4, to: 2 }, { from: 2, to: 3 },
  ]),

  makeCon('lyra', 'Lyra', 'Lyr', 'medium', [
    { ra: 18.62, dec: 38.78, mag: 0.03, name: 'Vega' },       // 0
    { ra: 18.98, dec: 32.69, mag: 3.24 },                      // 1
    { ra: 18.75, dec: 37.60, mag: 4.33 },                      // 2
    { ra: 18.83, dec: 36.06, mag: 3.52 },                      // 3
    { ra: 18.91, dec: 36.90, mag: 4.30 },                      // 4
  ], [
    { from: 0, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
    { from: 4, to: 2 }, { from: 3, to: 1 }, { from: 4, to: 1 },
  ]),

  makeCon('gemini', 'Gemini', 'Gem', 'medium', [
    { ra: 7.76, dec: 28.03, mag: 1.14, name: 'Pollux' },      // 0
    { ra: 7.58, dec: 31.89, mag: 1.58, name: 'Castor' },      // 1
    { ra: 6.63, dec: 16.40, mag: 1.93, name: 'Alhena' },      // 2
    { ra: 6.75, dec: 25.13, mag: 2.88, name: 'Tejat' },       // 3
    { ra: 7.07, dec: 20.57, mag: 2.98 },                       // 4
    { ra: 7.34, dec: 21.98, mag: 3.36 },                       // 5
  ], [
    { from: 1, to: 0 }, { from: 1, to: 3 }, { from: 3, to: 4 },
    { from: 4, to: 2 }, { from: 0, to: 5 }, { from: 5, to: 4 },
  ]),

  makeCon('taurus', 'Taurus', 'Tau', 'medium', [
    { ra: 4.60, dec: 16.51, mag: 0.85, name: 'Aldebaran' },   // 0
    { ra: 5.63, dec: 28.61, mag: 1.65, name: 'Elnath' },      // 1
    { ra: 4.33, dec: 15.63, mag: 3.53 },                       // 2
    { ra: 4.48, dec: 19.18, mag: 3.40 },                       // 3
    { ra: 4.38, dec: 17.54, mag: 3.63 },                       // 4
    { ra: 5.44, dec: 21.14, mag: 3.00, name: 'Zeta Tau' },    // 5
  ], [
    { from: 2, to: 0 }, { from: 0, to: 3 }, { from: 3, to: 4 },
    { from: 0, to: 5 }, { from: 5, to: 1 },
  ]),

  makeCon('aquila', 'Aquila', 'Aql', 'medium', [
    { ra: 19.85, dec: 8.87, mag: 0.77, name: 'Altair' },      // 0
    { ra: 19.77, dec: 10.61, mag: 2.72, name: 'Tarazed' },    // 1
    { ra: 19.92, dec: 6.41, mag: 3.36, name: 'Alshain' },     // 2
    { ra: 19.10, dec: 13.86, mag: 3.44 },                      // 3
    { ra: 20.19, dec: -0.82, mag: 3.37 },                      // 4
  ], [
    { from: 3, to: 1 }, { from: 1, to: 0 }, { from: 0, to: 2 }, { from: 2, to: 4 },
  ]),

  makeCon('canis_major', 'Canis Major', 'CMa', 'medium', [
    { ra: 6.75, dec: -16.72, mag: -1.46, name: 'Sirius' },    // 0
    { ra: 6.38, dec: -17.96, mag: 1.98, name: 'Mirzam' },     // 1
    { ra: 7.14, dec: -26.39, mag: 1.50, name: 'Adhara' },     // 2
    { ra: 7.06, dec: -23.83, mag: 1.84, name: 'Wezen' },      // 3
    { ra: 7.40, dec: -29.30, mag: 2.45, name: 'Aludra' },     // 4
  ], [
    { from: 1, to: 0 }, { from: 0, to: 3 }, { from: 3, to: 2 },
    { from: 2, to: 4 }, { from: 3, to: 4 },
  ]),

  // === HARD ===
  makeCon('virgo', 'Virgo', 'Vir', 'hard', [
    { ra: 13.42, dec: -11.16, mag: 0.98, name: 'Spica' },     // 0
    { ra: 12.69, dec: -1.45, mag: 2.83, name: 'Porrima' },    // 1
    { ra: 13.04, dec: 10.96, mag: 2.83, name: 'Vindemiatrix' },// 2
    { ra: 12.33, dec: -0.67, mag: 3.37 },                      // 3
    { ra: 11.84, dec: 1.76, mag: 3.61 },                       // 4
  ], [
    { from: 4, to: 3 }, { from: 3, to: 1 }, { from: 1, to: 0 },
    { from: 1, to: 2 },
  ]),

  makeCon('bootes', 'Bootes', 'Boo', 'hard', [
    { ra: 14.26, dec: 19.18, mag: -0.05, name: 'Arcturus' },  // 0
    { ra: 13.91, dec: 18.40, mag: 2.68 },                      // 1
    { ra: 14.53, dec: 30.37, mag: 2.35, name: 'Izar' },       // 2
    { ra: 15.03, dec: 40.39, mag: 2.62, name: 'Nekkar' },     // 3
    { ra: 14.69, dec: 38.31, mag: 3.03 },                      // 4
    { ra: 13.82, dec: 15.80, mag: 3.46 },                      // 5
  ], [
    { from: 5, to: 0 }, { from: 0, to: 1 }, { from: 1, to: 2 },
    { from: 2, to: 4 }, { from: 4, to: 3 }, { from: 0, to: 2 },
  ]),

  makeCon('perseus', 'Perseus', 'Per', 'hard', [
    { ra: 3.41, dec: 49.86, mag: 1.79, name: 'Mirfak' },      // 0
    { ra: 3.14, dec: 40.96, mag: 2.12, name: 'Algol' },       // 1
    { ra: 3.72, dec: 47.79, mag: 2.85 },                       // 2
    { ra: 3.96, dec: 40.01, mag: 2.93 },                       // 3
    { ra: 3.08, dec: 53.51, mag: 3.01 },                       // 4
  ], [
    { from: 4, to: 0 }, { from: 0, to: 2 }, { from: 2, to: 3 },
    { from: 0, to: 1 },
  ]),

  makeCon('auriga', 'Auriga', 'Aur', 'hard', [
    { ra: 5.28, dec: 46.00, mag: 0.08, name: 'Capella' },     // 0
    { ra: 5.99, dec: 44.95, mag: 1.90, name: 'Menkalinan' },  // 1
    { ra: 5.03, dec: 43.82, mag: 2.69 },                       // 2
    { ra: 5.11, dec: 41.23, mag: 2.62 },                       // 3
    { ra: 5.63, dec: 28.61, mag: 1.65 },                       // 4 (shared with Taurus - Elnath)
  ], [
    { from: 0, to: 1 }, { from: 1, to: 4 }, { from: 4, to: 3 },
    { from: 3, to: 2 }, { from: 2, to: 0 },
  ]),

  makeCon('libra', 'Libra', 'Lib', 'hard', [
    { ra: 14.85, dec: -16.04, mag: 2.61, name: 'Zubenelgenubi' }, // 0
    { ra: 15.28, dec: -9.38, mag: 2.61, name: 'Zubeneschamali' },// 1
    { ra: 15.59, dec: -14.79, mag: 3.29 },                        // 2
    { ra: 15.07, dec: -25.28, mag: 3.91 },                        // 3
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 0 },
  ]),

  makeCon('aries', 'Aries', 'Ari', 'hard', [
    { ra: 2.12, dec: 23.46, mag: 2.00, name: 'Hamal' },       // 0
    { ra: 1.91, dec: 20.81, mag: 2.64, name: 'Sheratan' },    // 1
    { ra: 1.89, dec: 19.29, mag: 3.88 },                       // 2
  ], [
    { from: 0, to: 1 }, { from: 1, to: 2 },
  ]),

  makeCon('pisces', 'Pisces', 'Psc', 'hard', [
    { ra: 2.03, dec: 2.76, mag: 3.62, name: 'Eta Psc' },      // 0
    { ra: 1.52, dec: 15.35, mag: 3.79 },                       // 1
    { ra: 23.99, dec: 6.86, mag: 4.13 },                       // 2
    { ra: 23.67, dec: 5.63, mag: 3.69 },                       // 3
    { ra: 23.29, dec: 3.28, mag: 4.27 },                       // 4
    { ra: 1.05, dec: 7.89, mag: 4.49 },                        // 5
  ], [
    { from: 4, to: 3 }, { from: 3, to: 2 }, { from: 2, to: 5 },
    { from: 5, to: 0 }, { from: 0, to: 1 },
  ]),
];

// Background stars for atmosphere (bright stars not in constellations above)
export const backgroundStars: Star[] = [
  { ra: 6.40, dec: -52.70, mag: -0.72 },  // Canopus
  { ra: 14.66, dec: -60.83, mag: -0.01 }, // Alpha Centauri
  { ra: 18.62, dec: 38.78, mag: 0.03 },   // Vega
  { ra: 5.24, dec: -8.20, mag: 0.12 },    // Rigel
  { ra: 7.65, dec: 5.22, mag: 0.34 },     // Procyon
  { ra: 1.63, dec: -57.24, mag: 0.46 },   // Achernar
  { ra: 22.96, dec: -29.62, mag: 1.16 },  // Fomalhaut
  { ra: 7.58, dec: -28.97, mag: 1.50 },   // random bright
  { ra: 0.44, dec: 29.09, mag: 2.06 },    // Alpheratz
  { ra: 2.53, dec: 89.26, mag: 1.98 },    // Polaris
  { ra: 22.10, dec: 15.21, mag: 2.39 },   // Enif
  { ra: 3.79, dec: 24.11, mag: 3.7 },     // Pleiades area
  { ra: 3.81, dec: 24.05, mag: 4.2 },
  { ra: 3.78, dec: 24.37, mag: 3.9 },
  { ra: 3.76, dec: 24.11, mag: 4.3 },
  { ra: 3.75, dec: 24.28, mag: 4.1 },
  // Scatter some random dim stars
  ...Array.from({ length: 200 }, (_, i) => ({
    ra: ((i * 7.31 + 3.14) % 24),
    dec: ((i * 13.7 + 5.2) % 180) - 90,
    mag: 3.5 + (i % 30) * 0.1,
  })),
];
