import { Camera, raDecToScreen } from './camera';

// Draw celestial reference lines: equator, ecliptic, poles

export interface CelestialLinesOptions {
  showEquator: boolean;
  showEcliptic: boolean;
  showPoles: boolean;
}

const ECLIPTIC_OBLIQUITY = 23.44; // degrees

export function drawCelestialLines(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  w: number,
  h: number,
  opts: CelestialLinesOptions
) {
  if (opts.showEquator) drawEquator(ctx, cam, w, h);
  if (opts.showEcliptic) drawEcliptic(ctx, cam, w, h);
  if (opts.showPoles) drawPoles(ctx, cam, w, h);
}

function drawEquator(ctx: CanvasRenderingContext2D, cam: Camera, w: number, h: number) {
  ctx.strokeStyle = 'rgba(65, 180, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 6]);

  ctx.beginPath();
  let started = false;
  for (let ra = 0; ra <= 24; ra += 0.1) {
    const pos = raDecToScreen(ra % 24, 0, cam, w, h);
    if (!started) {
      ctx.moveTo(pos.x, pos.y);
      started = true;
    } else {
      ctx.lineTo(pos.x, pos.y);
    }
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Label
  const labelPos = raDecToScreen(cam.centerRa, 0, cam, w, h);
  if (labelPos.y > 20 && labelPos.y < h - 20) {
    ctx.font = '11px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(65, 180, 255, 0.5)';
    ctx.textAlign = 'left';
    ctx.fillText('天の赤道 Celestial Equator', labelPos.x + 10, labelPos.y - 6);
  }
}

function drawEcliptic(ctx: CanvasRenderingContext2D, cam: Camera, w: number, h: number) {
  ctx.strokeStyle = 'rgba(255, 200, 50, 0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 8]);

  ctx.beginPath();
  let started = false;
  for (let i = 0; i <= 360; i += 1) {
    const lambda = (i * Math.PI) / 180;
    // Convert ecliptic longitude to RA/Dec
    const ra = (Math.atan2(Math.sin(lambda) * Math.cos(ECLIPTIC_OBLIQUITY * Math.PI / 180), Math.cos(lambda)) / (Math.PI * 2)) * 24;
    const dec = (Math.asin(Math.sin(lambda) * Math.sin(ECLIPTIC_OBLIQUITY * Math.PI / 180)) * 180) / Math.PI;
    const raPositive = ((ra % 24) + 24) % 24;

    const pos = raDecToScreen(raPositive, dec, cam, w, h);
    if (!started) {
      ctx.moveTo(pos.x, pos.y);
      started = true;
    } else {
      // Avoid drawing across screen when wrapping
      const prevLambda = ((i - 1) * Math.PI) / 180;
      const prevRa = (Math.atan2(Math.sin(prevLambda) * Math.cos(ECLIPTIC_OBLIQUITY * Math.PI / 180), Math.cos(prevLambda)) / (Math.PI * 2)) * 24;
      const prevRaPos = ((prevRa % 24) + 24) % 24;
      const raDiff = Math.abs(raPositive - prevRaPos);
      if (raDiff > 12) {
        ctx.moveTo(pos.x, pos.y);
      } else {
        ctx.lineTo(pos.x, pos.y);
      }
    }
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Label at roughly RA 6h
  const eclLabelRa = 6;
  const eclLabelDec = ECLIPTIC_OBLIQUITY;
  const labelPos = raDecToScreen(eclLabelRa, eclLabelDec, cam, w, h);
  if (labelPos.x > 0 && labelPos.x < w && labelPos.y > 20 && labelPos.y < h - 20) {
    ctx.font = '11px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255, 200, 50, 0.5)';
    ctx.textAlign = 'left';
    ctx.fillText('黄道 Ecliptic', labelPos.x + 10, labelPos.y - 6);
  }
}

function drawPoles(ctx: CanvasRenderingContext2D, cam: Camera, w: number, h: number) {
  // North Celestial Pole (near Polaris)
  const ncp = raDecToScreen(0, 90, cam, w, h);
  drawPoleMarker(ctx, ncp.x, ncp.y, w, h, '天の北極 NCP');

  // South Celestial Pole
  const scp = raDecToScreen(0, -90, cam, w, h);
  drawPoleMarker(ctx, scp.x, scp.y, w, h, '天の南極 SCP');
}

function drawPoleMarker(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string) {
  if (x < -50 || x > w + 50 || y < -50 || y > h + 50) return;

  // Cross marker
  ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
  ctx.lineWidth = 1.5;
  const size = 10;
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();

  // Circle
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.stroke();

  // Label
  ctx.font = '11px "Space Grotesk", sans-serif';
  ctx.fillStyle = 'rgba(255, 100, 100, 0.6)';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y - 16);
}
