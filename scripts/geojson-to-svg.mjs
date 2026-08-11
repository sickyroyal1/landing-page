/**
 * Convert GADM Philippines Level-1 GeoJSON → simplified SVG
 * Run: node scripts/geojson-to-svg.mjs
 *
 * Output: src/components/PhilippineProvinces.ts
 *   exports `const PHILIPPINE_PROVINCES: Record<string, { name: string; path: string }>`
 *   mapping PSGC province code → SVG path data (all rings, evenodd fill-rule).
 */

import { readFileSync, writeFileSync } from 'fs';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const GEOJSON = resolve(__dirname, '..', 'ph_gadm1.json');
const geo = JSON.parse(readFileSync(GEOJSON, 'utf8'));

// ── Projection ──────────────────────────────────────────────────────────────
// Equirectangular: lat/lon → SVG x,y.
// Philippines: 116.93–126.61°E, 4.59–21.07°N
const MIN_LON = 116.5, MAX_LON = 127.0;
const MIN_LAT =  4.0,  MAX_LAT = 21.5;
const W = 500, H = 850;

const project = ([lon, lat]) => {
  const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * W;
  const y = ((MAX_LAT - lat)   / (MAX_LAT - MIN_LAT)) * H;
  return [Math.round(x), Math.round(y)];
};

// ── Ring cleanup ────────────────────────────────────────────────────────────
// Drop consecutive duplicate points (integer rounding collapses close points).
function dedupe(pts) {
  const out = [];
  for (const p of pts) {
    const last = out[out.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
  }
  return out;
}

// Shoelace polygon area (SVG px²).
function ringArea(pts) {
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

// Point-to-segment distance, used by RDP.
function perpDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

// Ramer-Douglas-Peucker polyline simplification.
function rdp(points, eps) {
  if (points.length < 3) return points;
  const first = points[0], last = points[points.length - 1];
  let maxDist = -1, index = -1;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDist(points[i], first, last);
    if (d > maxDist) { maxDist = d; index = i; }
  }
  if (maxDist > eps) {
    const left = rdp(points.slice(0, index + 1), eps);
    const right = rdp(points.slice(index), eps);
    return left.slice(0, -1).concat(right);
  }
  return [first, last];
}

/**
 * Simplify + filter a single ring. Returns a clean path fragment, or null if
 * the ring is too small / degenerate to be worth drawing.
 */
function simplifyRing(rawRing) {
  let pts = rawRing.map(project);
  pts = dedupe(pts);
  if (pts.length < 4) return null;         // needs ≥3 unique points + closure
  if (ringArea(pts) < 2.0) return null;    // drop slivers & microscopic islets
  pts = rdp(pts, 1.0);
  if (pts.length < 4) return null;
  return 'M ' + pts.map(p => p.join(',')).join(' L ') + ' Z ';
}

// ── PSGC code mapping ───────────────────────────────────────────────────────
// GADM CC_1 is "RPP" or "RRPP" (1-2 digit region + 2-digit province).
// The psgc.cloud API province code is RR + PPP (3-digit province) + "00000".
// Example: Negros Oriental GADM CC_1=746 → region 7, province 46 → "0704600000".
function toPsgc(gadmCode) {
  const s = String(gadmCode);
  const region = s.slice(0, -2);
  const province = s.slice(-2);
  return region.padStart(2, '0') + province.padStart(3, '0') + '00000';
}

// GADM 4.1 ships a few wrong CC_1 codes / renamed provinces. Keyed by GID_1 → correct 10-digit PSGC.
const PSGC_OVERRIDES = {
  // Zambales collides with Pangasinan (both CC_1 = 155). Zambales = Region 03, province 71.
  'PHL.78_1': '0307100000',
  // Maguindanao split into del Norte/del Sur in 2022; GADM has one combined polygon → map to del Sur.
  'PHL.44_1': '1908800000',
};

// Rename provinces for display (GADM predates the official PSGC renames).
const NAME_OVERRIDES = {
  'CompostelaValley': 'Davao de Oro',
  'NorthCotabato': 'Cotabato',
  'MetropolitanManila': 'Metro Manila',
};

// GADM names are concatenated ("NegrosOccidental") → "Negros Occidental".
function prettifyName(raw) {
  return raw.replace(/([a-z])([A-Z])/g, '$1 $2');
}

// ── Build SVG paths ─────────────────────────────────────────────────────────
const provinces = [];
let totalRings = 0, droppedRings = 0;

for (const feat of geo.features) {
  const name = NAME_OVERRIDES[feat.properties.NAME_1] ?? prettifyName(feat.properties.NAME_1);
  const psgcCode = PSGC_OVERRIDES[feat.properties.GID_1] ?? toPsgc(feat.properties.CC_1);

  const polys = feat.geometry.type === 'MultiPolygon'
    ? feat.geometry.coordinates
    : [feat.geometry.coordinates];

  let pathData = '';
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const poly of polys) {
    for (const ring of poly) {
      totalRings++;
      const frag = simplifyRing(ring);
      if (!frag) { droppedRings++; continue; }
      pathData += frag;
      // Track bbox from the projected points used in this ring
      for (const pt of ring.map(project).filter(p => p[0] > 0 || p[1] > 0)) {
        if (pt[0] < minX) minX = pt[0];
        if (pt[1] < minY) minY = pt[1];
        if (pt[0] > maxX) maxX = pt[0];
        if (pt[1] > maxY) maxY = pt[1];
      }
    }
  }

  if (pathData) {
    const bbox = [minX, minY, maxX - minX, maxY - minY];
    provinces.push({ name, psgcCode, pathData: pathData.trim(), bbox });
  }
}

console.log(`Processed ${provinces.length} provinces.`);
console.log(`Rings: ${totalRings} total, ${droppedRings} dropped (${Math.round(droppedRings / totalRings * 100)}%).`);

// ── Generate TSX ────────────────────────────────────────────────────────────
const tsx = `/**
 * Auto-generated from GADM 4.1 Philippines Level-1 boundaries.
 * DO NOT EDIT — regenerate with: node scripts/geojson-to-svg.mjs
 *
 * Each entry maps a 10-digit PSGC province code to an SVG path string.
 * Paths are in viewBox 0 0 ${W} ${H} (equirectangular projection), evenodd fill.
 */
export const PROVINCE_VIEWBOX = '0 0 ${W} ${H}';

export const PHILIPPINE_PROVINCES: Record<string, { name: string; path: string; bbox: [number, number, number, number] }> = {
${provinces.map(p => `  '${p.psgcCode}': { name: '${p.name.replace(/'/g, "\\'")}', path: '${p.pathData}', bbox: [${p.bbox.join(',')}] },`).join('\n')}
};
`;

const OUT = resolve(__dirname, '..', 'src', 'components', 'PhilippineProvinces.ts');
writeFileSync(OUT, tsx);
console.log('Written to', OUT);
