export interface Camera {
  centerRa: number;   // hours (0-24)
  centerDec: number;  // degrees (-90 to 90)
  zoom: number;       // pixels per degree
}

export const ZOOM_MIN = 2;
export const ZOOM_MAX = 40;
export const DEC_MIN = -85;
export const DEC_MAX = 85;

export function clampCamera(cam: Camera): Camera {
  return {
    centerRa: ((cam.centerRa % 24) + 24) % 24,
    centerDec: Math.max(DEC_MIN, Math.min(DEC_MAX, cam.centerDec)),
    zoom: Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, cam.zoom)),
  };
}

export function panCamera(cam: Camera, dxPixels: number, dyPixels: number): Camera {
  return clampCamera({
    centerRa: cam.centerRa - dxPixels / cam.zoom / 15,
    centerDec: cam.centerDec + dyPixels / cam.zoom,
    zoom: cam.zoom,
  });
}

export function zoomCamera(cam: Camera, factor: number): Camera {
  return clampCamera({
    ...cam,
    zoom: cam.zoom * factor,
  });
}

export function raDecToScreen(
  ra: number,
  dec: number,
  cam: Camera,
  w: number,
  h: number
): { x: number; y: number } {
  let dRa = (ra - cam.centerRa) * 15;
  if (dRa > 180) dRa -= 360;
  if (dRa < -180) dRa += 360;
  const dDec = dec - cam.centerDec;
  return {
    x: w / 2 + dRa * cam.zoom,
    y: h / 2 - dDec * cam.zoom,
  };
}

export function screenToRaDec(
  sx: number,
  sy: number,
  cam: Camera,
  w: number,
  h: number
): { ra: number; dec: number } {
  const dRaDeg = (sx - w / 2) / cam.zoom;
  const dDec = -(sy - h / 2) / cam.zoom;
  let ra = cam.centerRa + dRaDeg / 15;
  if (ra < 0) ra += 24;
  if (ra >= 24) ra -= 24;
  return { ra, dec: cam.centerDec + dDec };
}

export function lerpCamera(from: Camera, to: Camera, t: number): Camera {
  const ease = 1 - Math.pow(1 - t, 3);

  let dRa = to.centerRa - from.centerRa;
  if (dRa > 12) dRa -= 24;
  if (dRa < -12) dRa += 24;

  return clampCamera({
    centerRa: from.centerRa + dRa * ease,
    centerDec: from.centerDec + (to.centerDec - from.centerDec) * ease,
    zoom: from.zoom + (to.zoom - from.zoom) * ease,
  });
}
