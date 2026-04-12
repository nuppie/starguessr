export interface Camera {
  centerRa: number;    // hours (0-24) — where you're looking
  centerDec: number;   // degrees (-90 to 90)
  zoom: number;        // pixels per radian on the projection plane
  roll?: number;       // radians; 0 = north up. Accumulates during pole drags,
                       // decays back to 0 after drag ends (see animation.ts).
}

const DEG = Math.PI / 180;

export const ZOOM_MIN = 80;
export const ZOOM_MAX = 1600;
export const DEC_MIN = -90;
export const DEC_MAX = 90;

type Vec3 = [number, number, number];

export function clampCamera(cam: Camera): Camera {
  let dec = ((cam.centerDec + 180) % 360 + 360) % 360 - 180;
  return {
    centerRa: ((cam.centerRa % 24) + 24) % 24,
    centerDec: dec,
    zoom: Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, cam.zoom)),
    roll: cam.roll ?? 0,
  };
}

// Convert RA/Dec to unit vector on the celestial sphere
function raDecToVec(raHours: number, decDeg: number): Vec3 {
  const ra = raHours * 15 * DEG;
  const dec = decDeg * DEG;
  const cosDec = Math.cos(dec);
  return [cosDec * Math.cos(ra), cosDec * Math.sin(ra), Math.sin(dec)];
}

// Convert unit vector back to RA/Dec
function vecToRaDec(x: number, y: number, z: number): { ra: number; dec: number } {
  const dec = Math.asin(Math.max(-1, Math.min(1, z))) / DEG;
  let ra = Math.atan2(y, x) / DEG / 15;
  if (ra < 0) ra += 24;
  return { ra, dec };
}

function normalize(v: Vec3): Vec3 {
  const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
  if (len < 1e-10) return [1, 0, 0];
  return [v[0] / len, v[1] / len, v[2] / len];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

// Rodrigues rotation: rotate v around unit axis by angle (sin/cos provided)
function rodrigues(v: Vec3, axis: Vec3, sinA: number, cosA: number): Vec3 {
  const d = dot(axis, v);
  const cx = axis[1] * v[2] - axis[2] * v[1];
  const cy = axis[2] * v[0] - axis[0] * v[2];
  const cz = axis[0] * v[1] - axis[1] * v[0];
  const t = 1 - cosA;
  return [
    v[0] * cosA + cx * sinA + axis[0] * d * t,
    v[1] * cosA + cy * sinA + axis[1] * d * t,
    v[2] * cosA + cz * sinA + axis[2] * d * t,
  ];
}

// Reconstruct camera forward and up vectors from Camera struct.
// roll=0 → up is world north projected perpendicular to forward.
function getFwdUp(cam: Camera): { fwd: Vec3; up: Vec3 } {
  const fwd = raDecToVec(cam.centerRa, cam.centerDec);
  const north: Vec3 = [0, 0, 1];
  const d = dot(north, fwd);
  let northPerp: Vec3 = [north[0] - d * fwd[0], north[1] - d * fwd[1], north[2] - d * fwd[2]];
  const len = Math.sqrt(northPerp[0] ** 2 + northPerp[1] ** 2 + northPerp[2] ** 2);
  if (len < 1e-6) {
    // At exact pole: choose RA=0 meridian direction as arbitrary up
    const ref: Vec3 = [1, 0, 0];
    const d2 = dot(ref, fwd);
    northPerp = normalize([ref[0] - d2 * fwd[0], ref[1] - d2 * fwd[1], ref[2] - d2 * fwd[2]]);
  } else {
    northPerp = [northPerp[0] / len, northPerp[1] / len, northPerp[2] / len];
  }
  const roll = cam.roll ?? 0;
  const up = rodrigues(northPerp, fwd, Math.sin(roll), Math.cos(roll));
  return { fwd, up };
}

// Extract roll angle from forward and up vectors
function extractRoll(fwd: Vec3, up: Vec3): number {
  const north: Vec3 = [0, 0, 1];
  const d = dot(north, fwd);
  let northPerp: Vec3 = [north[0] - d * fwd[0], north[1] - d * fwd[1], north[2] - d * fwd[2]];
  const len = Math.sqrt(northPerp[0] ** 2 + northPerp[1] ** 2 + northPerp[2] ** 2);
  if (len < 1e-6) return 0;
  northPerp = [northPerp[0] / len, northPerp[1] / len, northPerp[2] / len];

  const cosRoll = Math.max(-1, Math.min(1, dot(northPerp, up)));
  const cx = northPerp[1] * up[2] - northPerp[2] * up[1];
  const cy = northPerp[2] * up[0] - northPerp[0] * up[2];
  const cz = northPerp[0] * up[1] - northPerp[1] * up[0];
  const sinRoll = cx * fwd[0] + cy * fwd[1] + cz * fwd[2];
  return Math.atan2(sinRoll, cosRoll);
}

// Rotate around Z by -camRa, then around Y by (camDec-90°)
function rotateToCamera(
  px: number, py: number, pz: number,
  camRaRad: number, camDecRad: number,
): Vec3 {
  const cosRa = Math.cos(-camRaRad), sinRa = Math.sin(-camRaRad);
  const x1 = px * cosRa - py * sinRa;
  const y1 = px * sinRa + py * cosRa;
  const z1 = pz;

  const angle = camDecRad - Math.PI / 2;
  const cosA = Math.cos(angle), sinA = Math.sin(angle);
  return [x1 * cosA + z1 * sinA, y1, -x1 * sinA + z1 * cosA];
}

function rotateFromCamera(
  x2: number, y2: number, z2: number,
  camRaRad: number, camDecRad: number,
): Vec3 {
  const angle = -(camDecRad - Math.PI / 2);
  const cosA = Math.cos(angle), sinA = Math.sin(angle);
  const x1 = x2 * cosA + z2 * sinA;
  const y1 = y2;
  const z1 = -x2 * sinA + z2 * cosA;

  const cosRa = Math.cos(camRaRad), sinRa = Math.sin(camRaRad);
  return [x1 * cosRa - y1 * sinRa, x1 * sinRa + y1 * cosRa, z1];
}

export function raDecToScreen(
  ra: number, dec: number, cam: Camera, w: number, h: number,
): { x: number; y: number; behind: boolean } {
  const [px, py, pz] = raDecToVec(ra, dec);
  const camRaRad = cam.centerRa * 15 * DEG;
  const camDecRad = cam.centerDec * DEG;
  const [lx, ly, lz] = rotateToCamera(px, py, pz, camRaRad, camDecRad);

  if (lz < -0.05) return { x: -9999, y: -9999, behind: true };

  const denom = 1 + lz;

  // Apply roll: rotate image plane coords by roll angle
  const roll = cam.roll ?? 0;
  const cr = Math.cos(roll), sr = Math.sin(roll);
  const lxr = lx * cr + ly * sr;
  const lyr = -lx * sr + ly * cr;

  const projX = lyr / denom;
  const projY = -lxr / denom;

  return {
    x: w / 2 + projX * cam.zoom,
    y: h / 2 + projY * cam.zoom,
    behind: false,
  };
}

export function screenToRaDec(
  sx: number, sy: number, cam: Camera, w: number, h: number,
): { ra: number; dec: number } {
  const [wx, wy, wz] = screenToVec(sx, sy, cam, w, h);
  return vecToRaDec(wx, wy, wz);
}

// Map screen point to unit vector on the celestial sphere
export function screenToVec(
  sx: number, sy: number, cam: Camera, w: number, h: number,
): Vec3 {
  let projX = (sx - w / 2) / cam.zoom;
  let projY = (sy - h / 2) / cam.zoom;

  // Inverse roll
  const roll = cam.roll ?? 0;
  const cr = Math.cos(roll), sr = Math.sin(roll);
  // projX = lyr/d, projY = -lxr/d  →  lyr = projX*d, lxr = -projY*d
  // lxr = lx*cr + ly*sr, lyr = -lx*sr + ly*cr
  // Inverse: lx = lxr*cr - lyr*sr, ly = lxr*sr + lyr*cr
  const lxr = -projY;
  const lyr = projX;
  const lxU = lxr * cr - lyr * sr;
  const lyU = lxr * sr + lyr * cr;
  projX = lyU;
  projY = -lxU;

  const r2 = projX * projX + projY * projY;
  const lz = (1 - r2) / (1 + r2);
  const scale = 2 / (1 + r2);
  const ly = projX * scale;
  const lx = -projY * scale;

  const camRaRad = cam.centerRa * 15 * DEG;
  const camDecRad = cam.centerDec * DEG;
  return rotateFromCamera(lx, ly, lz, camRaRad, camDecRad);
}

// Quaternion-based free pan: horizontal drag rotates around camera up,
// vertical drag rotates around camera right. Roll accumulates naturally
// at poles (feels like a globe), then decays in animLoop.
export function panCameraFree(cam: Camera, dx: number, dy: number): Camera {
  const { fwd, up } = getFwdUp(cam);

  // Camera right = fwd × up (fwd⊥up so already unit length)
  const right: Vec3 = [
    fwd[1] * up[2] - fwd[2] * up[1],
    fwd[2] * up[0] - fwd[0] * up[2],
    fwd[0] * up[1] - fwd[1] * up[0],
  ];

  // Horizontal drag: rotate fwd around up axis (up stays fixed)
  const dθH = -dx / cam.zoom;
  let newFwd = rodrigues(fwd, up, Math.sin(dθH), Math.cos(dθH));

  // Vertical drag: rotate fwd AND up around right axis
  const dθV = -dy / cam.zoom;
  newFwd = rodrigues(newFwd, right, Math.sin(dθV), Math.cos(dθV));
  let newUp = rodrigues(up, right, Math.sin(dθV), Math.cos(dθV));

  // Re-orthogonalise
  newFwd = normalize(newFwd);
  const d = dot(newUp, newFwd);
  newUp = normalize([newUp[0] - d * newFwd[0], newUp[1] - d * newFwd[1], newUp[2] - d * newFwd[2]]);

  const { ra, dec } = vecToRaDec(newFwd[0], newFwd[1], newFwd[2]);
  const roll = extractRoll(newFwd, newUp);

  return clampCamera({ centerRa: ra, centerDec: dec, zoom: cam.zoom, roll });
}

export function panCameraByScreenDelta(cam: Camera, dx: number, dy: number): Camera {
  return panCameraFree(cam, dx, dy);
}

export function zoomCamera(cam: Camera, factor: number): Camera {
  return clampCamera({ ...cam, zoom: cam.zoom * factor });
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
    roll: (from.roll ?? 0) + ((to.roll ?? 0) - (from.roll ?? 0)) * ease,
  });
}
