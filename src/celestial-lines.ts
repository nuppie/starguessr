import { Camera, raDecToScreen } from './camera';

export interface CelestialLinesOptions {
  showEquator: boolean;
  showEcliptic: boolean;
  showPoles: boolean;
}

const ECLIPTIC_OBLIQUITY = 23.44;

export function drawCelestialLines(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  w: number,
  h: number,
  opts: CelestialLinesOptions
) {
  if (opts.showEquator) drawGreatCircle(ctx, cam, w, h, (ra) => ({ ra, dec: 0 }), 'rgba(65, 180, 255, 0.3)', '天の赤道 Celestial Equator');
  if (opts.showEcliptic) drawEcliptic(ctx, cam, w, h);
  if (opts.showPoles) drawPoles(ctx, cam, w, h);
}

function drawGreatCircle(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  w: number,
  h: number,
  pointAt: (ra: number) => { ra: number; dec: number },
  color: string,
  label: string,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();

  let prevBehind = true;
  for (let i = 0; i <= 240; i++) {
    const ra = (i / 240) * 24;
    const pt = pointAt(ra);
    const pos = raDecToScreen(pt.ra, pt.dec, cam, w, h);
    if (pos.behind) {
      prevBehind = true;
      continue;
    }
    if (prevBehind) {
      ctx.moveTo(pos.x, pos.y);
    } else {
      ctx.lineTo(pos.x, pos.y);
    }
    prevBehind = false;
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Label near center of view
  const labelPt = pointAt(cam.centerRa);
  const labelPos = raDecToScreen(labelPt.ra, labelPt.dec, cam, w, h);
  if (!labelPos.behind && labelPos.y > 20 && labelPos.y < h - 20 && labelPos.x > 0 && labelPos.x < w) {
    ctx.font = '11px "Space Grotesk", sans-serif';
    ctx.fillStyle = color.replace('0.3', '0.5');
    ctx.textAlign = 'left';
    ctx.fillText(label, labelPos.x + 10, labelPos.y - 6);
  }
}

function drawEcliptic(ctx: CanvasRenderingContext2D, cam: Camera, w: number, h: number) {
  const oblRad = ECLIPTIC_OBLIQUITY * Math.PI / 180;

  ctx.strokeStyle = 'rgba(255, 200, 50, 0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();

  let prevBehind = true;
  for (let i = 0; i <= 360; i++) {
    const lambda = (i * Math.PI) / 180;
    const ra = (Math.atan2(Math.sin(lambda) * Math.cos(oblRad), Math.cos(lambda)) / (Math.PI * 2)) * 24;
    const dec = (Math.asin(Math.sin(lambda) * Math.sin(oblRad)) * 180) / Math.PI;
    const raPos = ((ra % 24) + 24) % 24;

    const pos = raDecToScreen(raPos, dec, cam, w, h);
    if (pos.behind) {
      prevBehind = true;
      continue;
    }
    if (prevBehind) {
      ctx.moveTo(pos.x, pos.y);
    } else {
      ctx.lineTo(pos.x, pos.y);
    }
    prevBehind = false;
  }
  ctx.stroke();
  ctx.setLineDash([]);

  const labelPos = raDecToScreen(6, ECLIPTIC_OBLIQUITY, cam, w, h);
  if (!labelPos.behind && labelPos.x > 0 && labelPos.x < w && labelPos.y > 20 && labelPos.y < h - 20) {
    ctx.font = '11px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255, 200, 50, 0.5)';
    ctx.textAlign = 'left';
    ctx.fillText('黄道 Ecliptic', labelPos.x + 10, labelPos.y - 6);
  }
}

function drawPoles(ctx: CanvasRenderingContext2D, cam: Camera, w: number, h: number) {
  const ncp = raDecToScreen(0, 90, cam, w, h);
  if (!ncp.behind) drawPoleMarker(ctx, ncp.x, ncp.y, w, h, '天の北極 NCP');

  const scp = raDecToScreen(0, -90, cam, w, h);
  if (!scp.behind) drawPoleMarker(ctx, scp.x, scp.y, w, h, '天の南極 SCP');
}

function drawPoleMarker(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string) {
  if (x < -50 || x > w + 50 || y < -50 || y > h + 50) return;

  ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
  ctx.lineWidth = 1.5;
  const size = 10;
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = '11px "Space Grotesk", sans-serif';
  ctx.fillStyle = 'rgba(255, 100, 100, 0.6)';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y - 16);
}
