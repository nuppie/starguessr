import { Camera, raDecToScreen } from './camera';

export interface FamousStar {
  name: string;
  nameJa: string;
  ra: number;
  dec: number;
  mag: number;
  constellation: string;
  spectralType: string;
}

export const famousStars: FamousStar[] = [
  { name: 'Sirius', nameJa: 'シリウス', ra: 6.75, dec: -16.72, mag: -1.46, constellation: 'CMa', spectralType: 'A1V' },
  { name: 'Canopus', nameJa: 'カノープス', ra: 6.40, dec: -52.70, mag: -0.74, constellation: 'Car', spectralType: 'A9II' },
  { name: 'Arcturus', nameJa: 'アークトゥルス', ra: 14.26, dec: 19.18, mag: -0.05, constellation: 'Boo', spectralType: 'K1.5III' },
  { name: 'Vega', nameJa: 'ベガ（織姫星）', ra: 18.62, dec: 38.78, mag: 0.03, constellation: 'Lyr', spectralType: 'A0V' },
  { name: 'Capella', nameJa: 'カペラ', ra: 5.28, dec: 46.00, mag: 0.08, constellation: 'Aur', spectralType: 'G8III' },
  { name: 'Rigel', nameJa: 'リゲル', ra: 5.24, dec: -8.20, mag: 0.12, constellation: 'Ori', spectralType: 'B8Ia' },
  { name: 'Procyon', nameJa: 'プロキオン', ra: 7.65, dec: 5.22, mag: 0.34, constellation: 'CMi', spectralType: 'F5IV' },
  { name: 'Betelgeuse', nameJa: 'ベテルギウス', ra: 5.92, dec: 7.41, mag: 0.50, constellation: 'Ori', spectralType: 'M1Ia' },
  { name: 'Achernar', nameJa: 'アケルナル', ra: 1.63, dec: -57.24, mag: 0.46, constellation: 'Eri', spectralType: 'B6V' },
  { name: 'Altair', nameJa: 'アルタイル（彦星）', ra: 19.85, dec: 8.87, mag: 0.77, constellation: 'Aql', spectralType: 'A7V' },
  { name: 'Aldebaran', nameJa: 'アルデバラン', ra: 4.60, dec: 16.51, mag: 0.85, constellation: 'Tau', spectralType: 'K5III' },
  { name: 'Antares', nameJa: 'アンタレス', ra: 16.49, dec: -26.43, mag: 0.96, constellation: 'Sco', spectralType: 'M1Ib' },
  { name: 'Spica', nameJa: 'スピカ', ra: 13.42, dec: -11.16, mag: 0.98, constellation: 'Vir', spectralType: 'B1V' },
  { name: 'Pollux', nameJa: 'ポルックス', ra: 7.76, dec: 28.03, mag: 1.14, constellation: 'Gem', spectralType: 'K0III' },
  { name: 'Fomalhaut', nameJa: 'フォーマルハウト', ra: 22.96, dec: -29.62, mag: 1.16, constellation: 'PsA', spectralType: 'A3V' },
  { name: 'Deneb', nameJa: 'デネブ', ra: 20.69, dec: 45.28, mag: 1.25, constellation: 'Cyg', spectralType: 'A2Ia' },
  { name: 'Regulus', nameJa: 'レグルス', ra: 10.14, dec: 11.97, mag: 1.35, constellation: 'Leo', spectralType: 'B8IV' },
  { name: 'Castor', nameJa: 'カストル', ra: 7.58, dec: 31.89, mag: 1.58, constellation: 'Gem', spectralType: 'A1V' },
  { name: 'Polaris', nameJa: 'ポラリス（北極星）', ra: 2.53, dec: 89.26, mag: 1.98, constellation: 'UMi', spectralType: 'F7Ib' },
  { name: 'Dubhe', nameJa: 'ドゥーベ', ra: 11.06, dec: 61.75, mag: 1.79, constellation: 'UMa', spectralType: 'K0III' },
  // Summer triangle
  // Vega, Altair, Deneb already included
  // Winter triangle
  // Sirius, Procyon, Betelgeuse already included
  { name: 'Mimosa', nameJa: 'ミモザ', ra: 12.80, dec: -59.69, mag: 1.25, constellation: 'Cru', spectralType: 'B0.5III' },
  { name: 'Acrux', nameJa: 'アクルックス', ra: 12.44, dec: -63.10, mag: 0.76, constellation: 'Cru', spectralType: 'B0.5IV' },
  { name: 'Shaula', nameJa: 'シャウラ', ra: 17.56, dec: -37.10, mag: 1.62, constellation: 'Sco', spectralType: 'B2IV' },
];

export function drawFamousStars(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  w: number,
  h: number,
  showNames: boolean,
) {
  if (!showNames) return;

  for (const star of famousStars) {
    const pos = raDecToScreen(star.ra, star.dec, cam, w, h);
    if (pos.x < -30 || pos.x > w + 30 || pos.y < -30 || pos.y > h + 30) continue;

    // Name label
    ctx.font = '10px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(200, 210, 255, 0.6)';
    ctx.textAlign = 'left';
    const r = Math.max(2, 4 - star.mag * 0.5) * Math.min(cam.zoom / 8, 2);
    ctx.fillText(`${star.nameJa}`, pos.x + r + 4, pos.y - 2);
    ctx.fillStyle = 'rgba(160, 170, 200, 0.4)';
    ctx.fillText(star.name, pos.x + r + 4, pos.y + 10);
  }
}
