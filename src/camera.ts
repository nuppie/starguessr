export interface Camera {
  centerRa: number;   // hours (0-24) — where you're looking
  centerDec: number;  // degrees (-90 to 90)
  zoom: number;       // pixels per radian on the projection plane
}

const DEG = Math.PI / 180;

export const ZOOM_MIN = 80;
export const ZOOM_MAX = 1600;
export const DEC_MIN = -90;
export const DEC_MAX = 90;

export function clampCamera(cam: Camera): Camera {
  return {
    centerRa: ((cam.centerRa % 24) + 24) % 24,
    centerDec: Math.max(DEC_MIN, Math.min(DEC_MAX, cam.centerDec)),
    zoom: Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, cam.zoom)),
  };
}

// Convert RA/Dec to unit vector on the celestial sphere
function raDecToVec(raHours: number, decDeg: number): [number, number, number] {
  const ra = raHours * 15 * DEG; // hours -> degrees -> radians
  const dec = decDeg * DEG;
  const cosDec = Math.cos(dec);
  return [
    cosDec * Math.cos(ra),
    cosDec * Math.sin(ra),
    Math.sin(dec),
  ];
}

// Convert unit vector back to RA/Dec
function vecToRaDec(x: number, y: number, z: number): { ra: number; dec: number } {
  const dec = Math.asin(Math.max(-1, Math.min(1, z))) / DEG;
  let ra = Math.atan2(y, x) / DEG / 15; // radians -> degrees -> hours
  if (ra < 0) ra += 24;
  return { ra, dec };
}

// Rotate vector so that the camera center maps to (0, 0, 1)
// This is a rotation: first by -RA around Z, then by -(90-Dec) around Y
function rotateToCamera(
  px: number, py: number, pz: number,
  camRaRad: number, camDecRad: number
): [number, number, number] {
  // Rotate around Z by -camRa
  const cosRa = Math.cos(-camRaRad);
  const sinRa = Math.sin(-camRaRad);
  const x1 = px * cosRa - py * sinRa;
  const y1 = px * sinRa + py * cosRa;
  const z1 = pz;

  // Rotate around Y by -(90° - camDec) = camDec - 90°
  const angle = camDecRad - Math.PI / 2;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const x2 = x1 * cosA + z1 * sinA;
  const y2 = y1;
  const z2 = -x1 * sinA + z1 * cosA;

  return [x2, y2, z2];
}

// Inverse rotation: from camera-local back to world
function rotateFromCamera(
  x2: number, y2: number, z2: number,
  camRaRad: number, camDecRad: number
): [number, number, number] {
  // Inverse of Y rotation
  const angle = -(camDecRad - Math.PI / 2);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const x1 = x2 * cosA + z2 * sinA;
  const y1 = y2;
  const z1 = -x2 * sinA + z2 * cosA;

  // Inverse of Z rotation
  const cosRa = Math.cos(camRaRad);
  const sinRa = Math.sin(camRaRad);
  const px = x1 * cosRa - y1 * sinRa;
  const py = x1 * sinRa + y1 * cosRa;
  const pz = z1;

  return [px, py, pz];
}

// Stereographic projection: project point on sphere to 2D plane
// The projection plane is tangent at (0,0,1) (camera center)
// Points behind the viewer (z < -0.1) are culled
export function raDecToScreen(
  ra: number,
  dec: number,
  cam: Camera,
  w: number,
  h: number
): { x: number; y: number; behind: boolean } {
  const [px, py, pz] = raDecToVec(ra, dec);
  const camRaRad = cam.centerRa * 15 * DEG;
  const camDecRad = cam.centerDec * DEG;
  const [lx, ly, lz] = rotateToCamera(px, py, pz, camRaRad, camDecRad);

  // Behind the viewer
  if (lz < -0.05) {
    return { x: -9999, y: -9999, behind: true };
  }

  // Stereographic projection: project from south pole (-Z) onto tangent plane at north pole (+Z)
  const denom = 1 + lz;
  const projX = lx / denom;
  const projY = ly / denom;

  return {
    x: w / 2 + projX * cam.zoom,
    y: h / 2 - projY * cam.zoom, // Y flipped
    behind: false,
  };
}

export function screenToRaDec(
  sx: number,
  sy: number,
  cam: Camera,
  w: number,
  h: number
): { ra: number; dec: number } {
  // Inverse stereographic projection
  const projX = (sx - w / 2) / cam.zoom;
  const projY = -(sy - h / 2) / cam.zoom;

  const r2 = projX * projX + projY * projY;
  const lz = (1 - r2) / (1 + r2);
  const scale = 2 / (1 + r2);
  const lx = projX * scale;
  const ly = projY * scale;

  const camRaRad = cam.centerRa * 15 * DEG;
  const camDecRad = cam.centerDec * DEG;
  const [wx, wy, wz] = rotateFromCamera(lx, ly, lz, camRaRad, camDecRad);

  return vecToRaDec(wx, wy, wz);
}

export function panCamera(cam: Camera, dxPixels: number, dyPixels: number): Camera {
  // Convert pixel drag to angular displacement on the sphere
  const scale = 1 / cam.zoom; // radians per pixel
  const dRaDeg = -dxPixels * scale / DEG / Math.max(Math.cos(cam.centerDec * DEG), 0.05);
  const dDecDeg = dyPixels * scale / DEG;

  return clampCamera({
    centerRa: cam.centerRa + dRaDeg / 15, // degrees to hours
    centerDec: cam.centerDec + dDecDeg,
    zoom: cam.zoom,
  });
}

export function zoomCamera(cam: Camera, factor: number): Camera {
  return clampCamera({
    ...cam,
    zoom: cam.zoom * factor,
  });
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
