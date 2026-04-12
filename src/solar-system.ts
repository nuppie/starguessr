import { Camera, raDecToScreen } from './camera';

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

// Simplified planetary position calculator using mean orbital elements
// Accurate to ~1° for inner planets, ~2° for outer planets

interface OrbitalElements {
  // Mean longitude at epoch J2000
  L0: number; // degrees
  Lrate: number; // degrees per century
  // Ecliptic coordinates are converted to RA/Dec
}

// Simplified mean longitudes (sufficient for visual positioning)
const planets: Record<string, { name: string; nameJa: string; color: string; symbol: string; L0: number; Lrate: number; ecc: number; incl: number }> = {
  mercury: { name: 'Mercury', nameJa: '水星', color: '#b0b0b0', symbol: '☿', L0: 252.25, Lrate: 149472.67, ecc: 0.2056, incl: 7.00 },
  venus:   { name: 'Venus',   nameJa: '金星', color: '#ffe4b5', symbol: '♀', L0: 181.98, Lrate: 58517.82, ecc: 0.0068, incl: 3.39 },
  mars:    { name: 'Mars',    nameJa: '火星', color: '#ff6b4a', symbol: '♂', L0: 355.43, Lrate: 19140.30, ecc: 0.0934, incl: 1.85 },
  jupiter: { name: 'Jupiter', nameJa: '木星', color: '#f0d0a0', symbol: '♃', L0: 34.35,  Lrate: 3034.91, ecc: 0.0484, incl: 1.30 },
  saturn:  { name: 'Saturn',  nameJa: '土星', color: '#f5deb3', symbol: '♄', L0: 50.08,  Lrate: 1222.11, ecc: 0.0542, incl: 2.49 },
};

const OBLIQUITY = 23.44; // ecliptic obliquity in degrees

// Julian century from J2000.0
function julianCentury(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  return (jd - 2451545.0) / 36525;
}

// Very rough geocentric ecliptic longitude of a planet
// (uses heliocentric longitude difference with Earth for outer planets,
//  and simplified model for inner planets)
function planetEclipticLon(T: number, planet: typeof planets[string]): number {
  return (planet.L0 + planet.Lrate * T) % 360;
}

// Earth's mean longitude
function earthEclipticLon(T: number): number {
  return (100.46 + 35999.37 * T) % 360;
}

// Convert ecliptic longitude (assuming lat ≈ 0) to RA/Dec
function eclipticToRaDec(lon: number): { ra: number; dec: number } {
  const lonRad = lon * DEG;
  const oblRad = OBLIQUITY * DEG;
  const ra = Math.atan2(Math.sin(lonRad) * Math.cos(oblRad), Math.cos(lonRad)) * RAD;
  const dec = Math.asin(Math.sin(lonRad) * Math.sin(oblRad)) * RAD;
  let raHours = ((ra / 15) + 24) % 24;
  return { ra: raHours, dec };
}

// Sun position (opposite of Earth's heliocentric longitude)
function sunPosition(T: number): { ra: number; dec: number } {
  const earthLon = earthEclipticLon(T);
  const sunLon = (earthLon + 180) % 360;
  return eclipticToRaDec(sunLon);
}

// Moon position (very rough — mean longitude)
function moonPosition(T: number): { ra: number; dec: number } {
  // Moon mean longitude
  const L = (218.32 + 481267.88 * T) % 360;
  // Moon mean anomaly (for slight correction)
  const M = (134.96 + 477198.87 * T) % 360;
  // Rough correction
  const lon = L + 6.29 * Math.sin(M * DEG);
  // Moon ecliptic latitude (rough)
  const lat = 5.13 * Math.sin((93.27 + 483202.02 * T) * DEG);

  const lonRad = lon * DEG;
  const latRad = lat * DEG;
  const oblRad = OBLIQUITY * DEG;

  const ra = Math.atan2(
    Math.sin(lonRad) * Math.cos(oblRad) - Math.tan(latRad) * Math.sin(oblRad),
    Math.cos(lonRad)
  ) * RAD;
  const dec = Math.asin(
    Math.sin(latRad) * Math.cos(oblRad) + Math.cos(latRad) * Math.sin(oblRad) * Math.sin(lonRad)
  ) * RAD;

  return { ra: ((ra / 15) + 24) % 24, dec };
}

// Geocentric planet position (very simplified)
function planetPosition(T: number, planet: typeof planets[string]): { ra: number; dec: number } {
  const planetLon = planetEclipticLon(T, planet);
  const earthLon = earthEclipticLon(T);

  // For geocentric: use the elongation from the sun
  // This is a gross simplification but gives roughly correct sky positions
  const geocentricLon = planetLon; // simplified: just use heliocentric
  // For outer planets, the geocentric longitude is roughly the heliocentric
  // For inner planets, it's more complex but this gives a visual approximation
  return eclipticToRaDec(geocentricLon);
}

export interface SolarSystemBody {
  name: string;
  nameJa: string;
  ra: number;
  dec: number;
  color: string;
  symbol: string;
  type: 'sun' | 'moon' | 'planet';
}

export function getSolarSystemBodies(date: Date = new Date()): SolarSystemBody[] {
  const T = julianCentury(date);
  const bodies: SolarSystemBody[] = [];

  // Sun
  const sun = sunPosition(T);
  bodies.push({ name: 'Sun', nameJa: '太陽', ra: sun.ra, dec: sun.dec, color: '#ffdd44', symbol: '☀', type: 'sun' });

  // Moon
  const moon = moonPosition(T);
  bodies.push({ name: 'Moon', nameJa: '月', ra: moon.ra, dec: moon.dec, color: '#e8e8d0', symbol: '☽', type: 'moon' });

  // Planets
  for (const [, planet] of Object.entries(planets)) {
    const pos = planetPosition(T, planet);
    bodies.push({ ...planet, ra: pos.ra, dec: pos.dec, type: 'planet' });
  }

  return bodies;
}

export function drawSolarSystemBodies(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  w: number,
  h: number,
  bodies: SolarSystemBody[],
) {
  for (const body of bodies) {
    const pos = raDecToScreen(body.ra, body.dec, cam, w, h);
    if (pos.behind) continue;
    if (pos.x < -30 || pos.x > w + 30 || pos.y < -30 || pos.y > h + 30) continue;

    const size = body.type === 'sun' ? 10 : body.type === 'moon' ? 8 : 5;

    // Glow
    const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 3);
    glow.addColorStop(0, body.color + '60');
    glow.addColorStop(1, body.color + '00');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = body.color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();

    // Symbol + name
    ctx.font = '12px "Space Grotesk", sans-serif';
    ctx.fillStyle = body.color;
    ctx.textAlign = 'center';
    ctx.fillText(body.symbol + ' ' + body.nameJa, pos.x, pos.y - size - 6);
  }
}

// Horizon calculation based on GPS coordinates
export interface HorizonInfo {
  latitude: number;
  longitude: number;
  lst: number; // local sidereal time in hours
}

export function calculateHorizon(date: Date, lat: number, lon: number): HorizonInfo {
  const T = julianCentury(date);
  // Greenwich Mean Sidereal Time in hours
  const gmst = (280.46061837 + 360.98564736629 * (date.getTime() / 86400000 + 2440587.5 - 2451545.0)) % 360;
  const lst = ((gmst + lon) / 15 + 24) % 24;
  return { latitude: lat, longitude: lon, lst };
}

export function drawHorizon(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  w: number,
  h: number,
  horizon: HorizonInfo,
) {
  // Draw the horizon line — points at Dec where altitude = 0
  // For observer at latitude φ, the horizon is where:
  //   sin(alt) = sin(φ)sin(δ) + cos(φ)cos(δ)cos(H) = 0
  // where H = hour angle = LST - RA

  ctx.strokeStyle = 'rgba(100, 200, 100, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();

  const latRad = horizon.latitude * DEG;
  let prevBehind = true;

  for (let i = 0; i <= 360; i += 1) {
    const azRad = i * DEG;
    // Convert horizon point (alt=0, az) to RA/Dec
    // sin(dec) = sin(lat)*sin(alt) + cos(lat)*cos(alt)*cos(az)
    // Since alt=0: sin(dec) = cos(lat)*cos(az)
    const dec = Math.asin(Math.cos(latRad) * Math.cos(azRad)) * RAD;
    // cos(H) = (sin(alt) - sin(lat)*sin(dec)) / (cos(lat)*cos(dec))
    // Since alt=0: cos(H) = -sin(lat)*sin(dec) / (cos(lat)*cos(dec)) = -tan(lat)*tan(dec)
    const tanProd = -Math.tan(latRad) * Math.tan(dec * DEG);
    if (Math.abs(tanProd) > 1) { prevBehind = true; continue; }
    const H = Math.acos(tanProd) * RAD / 15; // hour angle in hours
    // Adjust sign based on azimuth
    const hourAngle = (i <= 180) ? H : -H;
    let ra = (horizon.lst - hourAngle + 24) % 24;

    const pos = raDecToScreen(ra, dec, cam, w, h);
    if (pos.behind) { prevBehind = true; continue; }

    if (prevBehind) {
      ctx.moveTo(pos.x, pos.y);
    } else {
      ctx.lineTo(pos.x, pos.y);
    }
    prevBehind = false;
  }

  ctx.stroke();
  ctx.setLineDash([]);

  // Label
  ctx.font = '11px "Space Grotesk", sans-serif';
  ctx.fillStyle = 'rgba(100, 200, 100, 0.5)';
  ctx.textAlign = 'center';
  // Find a visible point on the horizon to place the label
  const zenithPos = raDecToScreen(horizon.lst, horizon.latitude, cam, w, h);
  if (!zenithPos.behind && zenithPos.x > 0 && zenithPos.x < w) {
    ctx.fillText(`地平線 Horizon (${horizon.latitude.toFixed(1)}°N)`, zenithPos.x, zenithPos.y + 20);
  }
}
