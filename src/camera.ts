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
  // Dec is NOT clamped to ±90°. Values beyond ±90° are valid:
  // raDecToVec handles them correctly via trigonometry (e.g. Dec=95°
  // maps to the same point as Dec=85°, RA+12h). This lets the user
  // drag smoothly through the poles without "bouncing".
  // Normalize to [-180,180] to prevent unbounded growth.
  let dec = ((cam.centerDec + 180) % 360 + 360) % 360 - 180;

  return {
    centerRa: ((cam.centerRa % 24) + 24) % 24,
    centerDec: dec,
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
  // ly maps to screen X (RA increases to the right), lx maps to screen Y (inverted)
  const denom = 1 + lz;
  const projX = ly / denom;
  const projY = -lx / denom;

  return {
    x: w / 2 + projX * cam.zoom,
    y: h / 2 + projY * cam.zoom,
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
  // Inverse stereographic projection (matching the axis swap in raDecToScreen)
  const projX = (sx - w / 2) / cam.zoom;
  const projY = (sy - h / 2) / cam.zoom;

  const r2 = projX * projX + projY * projY;
  const lz = (1 - r2) / (1 + r2);
  const scale = 2 / (1 + r2);
  const ly = projX * scale;
  const lx = -projY * scale;

  const camRaRad = cam.centerRa * 15 * DEG;
  const camDecRad = cam.centerDec * DEG;
  const [wx, wy, wz] = rotateFromCamera(lx, ly, lz, camRaRad, camDecRad);

  return vecToRaDec(wx, wy, wz);
}

// Map screen point to unit vector on the celestial sphere (no RA/Dec intermediary)
function screenToVec(
  sx: number, sy: number, cam: Camera, w: number, h: number
): [number, number, number] {
  const projX = (sx - w / 2) / cam.zoom;
  const projY = (sy - h / 2) / cam.zoom;
  const r2 = projX * projX + projY * projY;
  const lz = (1 - r2) / (1 + r2);
  const scale = 2 / (1 + r2);
  const ly = projX * scale;
  const lx = -projY * scale;

  const camRaRad = cam.centerRa * 15 * DEG;
  const camDecRad = cam.centerDec * DEG;
  return rotateFromCamera(lx, ly, lz, camRaRad, camDecRad);
}

// Rodrigues rotation: rotate vector v around unit axis by angle (given as sin/cos)
function rodrigues(
  v: [number, number, number],
  axis: [number, number, number],
  sinA: number, cosA: number
): [number, number, number] {
  const dot = axis[0] * v[0] + axis[1] * v[1] + axis[2] * v[2];
  const cx = axis[1] * v[2] - axis[2] * v[1];
  const cy = axis[2] * v[0] - axis[0] * v[2];
  const cz = axis[0] * v[1] - axis[1] * v[0];
  const t = 1 - cosA;
  return [
    v[0] * cosA + cx * sinA + axis[0] * dot * t,
    v[1] * cosA + cy * sinA + axis[1] * dot * t,
    v[2] * cosA + cz * sinA + axis[2] * dot * t,
  ];
}

// Origin-based trackball: compute TOTAL rotation from drag start.
// Roll is discarded only once (not per frame), so pole behavior is correct.
export function panCameraFromOrigin(
  startCam: Camera,
  startX: number, startY: number,
  currentX: number, currentY: number,
  w: number, h: number
): Camera {
  // Map both points to sphere using the ORIGINAL camera (not the current one)
  const v0 = screenToVec(startX, startY, startCam, w, h);
  const v1 = screenToVec(currentX, currentY, startCam, w, h);

  const crossX = v1[1] * v0[2] - v1[2] * v0[1];
  const crossY = v1[2] * v0[0] - v1[0] * v0[2];
  const crossZ = v1[0] * v0[1] - v1[1] * v0[0];
  const sinA = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);
  const cosA = v1[0] * v0[0] + v1[1] * v0[1] + v1[2] * v0[2];

  if (sinA < 1e-10) return startCam;

  // When rotation > ~120°, numerics get shaky — caller should reset origin
  if (cosA < -0.5) return startCam;

  const axis: [number, number, number] = [crossX / sinA, crossY / sinA, crossZ / sinA];

  const camVec = raDecToVec(startCam.centerRa, startCam.centerDec);
  const rotated = rodrigues(camVec, axis, sinA, cosA);
  const { ra, dec } = vecToRaDec(rotated[0], rotated[1], rotated[2]);

  return clampCamera({ centerRa: ra, centerDec: dec, zoom: startCam.zoom });
}

// Spherical coordinate navigation: horizontal → RA, vertical → Dec.
// No cos(Dec) scaling — horizontal drag always rotates around the polar axis
// at a constant rate, which feels natural at poles. Dec values > ±90° are
// passed through to clampCamera, which normalises to [−180,180]; raDecToVec
// handles them correctly, so dragging through the poles works smoothly.
export function panCameraByScreenDelta(
  cam: Camera,
  dx: number,
  dy: number,
): Camera {
  const dRaHours = -dx / cam.zoom * (180 / Math.PI) / 15;
  const dDecDeg  =  dy / cam.zoom * (180 / Math.PI);
  return clampCamera({
    centerRa:  cam.centerRa  + dRaHours,
    centerDec: cam.centerDec - dDecDeg,
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
