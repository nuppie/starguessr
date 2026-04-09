import { Constellation, backgroundStars, constellations } from './constellations';
import { Camera, raDecToScreen } from './camera';
import { DisplaySettings } from './storage';
import { constellationJa } from './i18n';
import { drawCelestialLines } from './celestial-lines';
import { drawFamousStars } from './famous-stars';

function starRadius(mag: number, zoom: number): number {
  const base = Math.max(0.3, 3.5 - mag * 0.45);
  const zoomFactor = Math.min(zoom / 300, 2.5);
  return base * zoomFactor;
}

function starAlpha(mag: number): number {
  if (mag < 1) return 1;
  if (mag > 5) return 0.25;
  return 1 - (mag - 1) * 0.18;
}

interface DrawOptions {
  lineAlpha: number;
  starAlpha: number;
  lineColor: string;
  starColor: string;
  showLabel: boolean;
  labelColor?: string;
  showLines: boolean;
}

function isOnScreen(x: number, y: number, w: number, h: number, margin: number): boolean {
  return x >= -margin && x <= w + margin && y >= -margin && y <= h + margin;
}

function drawConstellation(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  w: number,
  h: number,
  con: Constellation,
  opts: DrawOptions
) {
  const positions = con.stars.map(s => raDecToScreen(s.ra, s.dec, cam, w, h));

  // Lines
  if (opts.showLines) {
    ctx.strokeStyle = opts.lineColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = opts.lineAlpha;
    for (const line of con.lines) {
      const from = positions[line.from];
      const to = positions[line.to];
      if (from.behind || to.behind) continue;
      if (!isOnScreen(from.x, from.y, w, h, 100) && !isOnScreen(to.x, to.y, w, h, 100)) continue;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Stars
  for (let i = 0; i < con.stars.length; i++) {
    const pos = positions[i];
    if (pos.behind || !isOnScreen(pos.x, pos.y, w, h, 20)) continue;

    const star = con.stars[i];
    const r = starRadius(star.mag, cam.zoom);

    if (star.mag < 1.5) {
      const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * 5);
      glow.addColorStop(0, `rgba(180,200,255,${opts.starAlpha * 0.4})`);
      glow.addColorStop(1, 'rgba(180,200,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r * 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = opts.starAlpha;
    ctx.fillStyle = opts.starColor;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  if (opts.showLabel) {
    const center = raDecToScreen(con.centerRa, con.centerDec, cam, w, h);
    if (center.behind) return;
    const fontSize = Math.min(16, 10 + cam.zoom * 0.01);
    const ja = constellationJa[con.id] || '';

    // Japanese name
    ctx.font = `600 ${fontSize}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = opts.labelColor || '#ffffff';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.9;
    if (ja) {
      ctx.fillText(ja, center.x, center.y - 20);
      ctx.font = `400 ${fontSize * 0.75}px "Space Grotesk", sans-serif`;
      ctx.fillStyle = 'rgba(200,210,230,0.7)';
      ctx.fillText(con.name, center.x, center.y - 5);
    } else {
      ctx.fillText(con.name, center.x, center.y - 15);
    }
    ctx.globalAlpha = 1;
  }
}

function drawNebula(ctx: CanvasRenderingContext2D, cam: Camera, w: number, h: number) {
  const patches = [
    { ra: 5.6, dec: -1.5, r: 3, color: '80,50,100' },
    { ra: 18.5, dec: -25, r: 5, color: '60,30,50' },
    { ra: 20.5, dec: 42, r: 4, color: '40,50,80' },
  ];

  for (const p of patches) {
    const pos = raDecToScreen(p.ra, p.dec, cam, w, h);
    if (pos.behind) continue;
    const radius = p.r * cam.zoom * 0.02;
    if (!isOnScreen(pos.x, pos.y, w, h, radius)) continue;

    const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
    glow.addColorStop(0, `rgba(${p.color},0.08)`);
    glow.addColorStop(1, `rgba(${p.color},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Draw all constellation names (when toggle is on)
function drawAllConstellationNames(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  w: number,
  h: number,
) {
  for (const con of constellations) {
    const center = raDecToScreen(con.centerRa, con.centerDec, cam, w, h);
    if (center.behind || !isOnScreen(center.x, center.y, w, h, 0)) continue;

    const ja = constellationJa[con.id] || '';
    const fontSize = Math.min(13, 9 + cam.zoom * 0.005);

    ctx.font = `500 ${fontSize}px "Space Grotesk", sans-serif`;
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#a0b0d0';
    if (ja) {
      ctx.fillText(ja, center.x, center.y - 8);
      ctx.font = `400 ${fontSize * 0.8}px "Space Grotesk", sans-serif`;
      ctx.globalAlpha = 0.3;
      ctx.fillText(con.name, center.x, center.y + 5);
    } else {
      ctx.fillText(con.name, center.x, center.y);
    }
    ctx.globalAlpha = 1;
  }
}

export interface RenderState {
  currentConstellation: Constellation | null;
  highlightConstellation: Constellation | null;
  showAnswer: boolean;
  tapResult: { x: number; y: number; correct: boolean } | null;
  tapAnim: number;
}

export function render(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  w: number,
  h: number,
  state: RenderState,
  display: DisplaySettings,
) {
  // Background
  const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
  grad.addColorStop(0, '#0d1025');
  grad.addColorStop(1, '#050510');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  drawNebula(ctx, cam, w, h);

  // Celestial reference lines (behind stars)
  drawCelestialLines(ctx, cam, w, h, {
    showEquator: display.showEquator,
    showEcliptic: display.showEcliptic,
    showPoles: display.showPoles,
  });

  // Background stars
  for (const star of backgroundStars) {
    const pos = raDecToScreen(star.ra, star.dec, cam, w, h);
    if (pos.behind || !isOnScreen(pos.x, pos.y, w, h, 20)) continue;

    const r = starRadius(star.mag, cam.zoom);
    const alpha = starAlpha(star.mag);

    if (star.mag < 2) {
      const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * 4);
      glow.addColorStop(0, `rgba(200,220,255,${alpha * 0.3})`);
      glow.addColorStop(1, 'rgba(200,220,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = `rgba(220,230,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Constellations
  for (const con of constellations) {
    const isHighlighted = state.highlightConstellation?.id === con.id;
    const isAnswer = state.showAnswer && state.currentConstellation?.id === con.id;

    drawConstellation(ctx, cam, w, h, con, {
      lineAlpha: isHighlighted || isAnswer ? 0.8 : 0.15,
      starAlpha: isHighlighted || isAnswer ? 1 : 0.5,
      lineColor: isAnswer ? (state.tapResult?.correct ? '#4ade80' : '#f87171') :
                 isHighlighted ? '#60a5fa' : '#334155',
      starColor: isHighlighted || isAnswer ? '#ffffff' : '#8899bb',
      showLabel: isAnswer,
      labelColor: state.tapResult?.correct ? '#4ade80' : '#f87171',
      showLines: display.showConstellationLines,
    });
  }

  // Constellation names overlay
  if (display.showConstellationNames) {
    drawAllConstellationNames(ctx, cam, w, h);
  }

  // Famous star names
  drawFamousStars(ctx, cam, w, h, display.showStarNames);

  // Tap feedback ring
  if (state.tapResult && state.tapAnim > 0) {
    const alpha = state.tapAnim;
    const radius = (1 - state.tapAnim) * 60 + 20;
    ctx.strokeStyle = state.tapResult.correct
      ? `rgba(74, 222, 128, ${alpha})`
      : `rgba(248, 113, 113, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(state.tapResult.x, state.tapResult.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}
