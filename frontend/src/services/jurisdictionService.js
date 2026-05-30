// ================================================================
// Jurisdiction Service — resolve the responsible Executive Engineer
// for any (state, district, roadType) combination using the full
// jurisdiction_map.json sourced from backend/data/.
// ================================================================

import jurisdictionMap from '../data/jurisdiction_map.json';

// ── National-level fallback ──────────────────────────────────
// Used when neither the state nor its "_default" entry exists.
const NATIONAL_DEFAULT = {
  authority_name: 'National Highways Authority of India (NHAI)',
  designation: 'Regional Officer',
  email: 'complaints@nhai.gov.in',
  phone: '1800-11-6062',
  complaint_portal: 'https://pgportal.gov.in/',
  escalation: 'Chief General Manager, NHAI',
};

// ── Approximate district-from-coordinates table ──────────────
// Bounding-box centroids for Andhra Pradesh + Telangana districts.
// Each entry: { name, state, lat, lng } — we pick the nearest one.
const DISTRICT_CENTROIDS = [
  // Andhra Pradesh
  { name: 'Krishna',          state: 'Andhra Pradesh', lat: 16.57, lng: 80.65 },
  { name: 'Guntur',           state: 'Andhra Pradesh', lat: 16.31, lng: 80.44 },
  { name: 'Visakhapatnam',    state: 'Andhra Pradesh', lat: 17.69, lng: 83.22 },
  { name: 'Kurnool',          state: 'Andhra Pradesh', lat: 15.83, lng: 78.04 },
  { name: 'Nellore',          state: 'Andhra Pradesh', lat: 14.44, lng: 79.97 },
  { name: 'East Godavari',    state: 'Andhra Pradesh', lat: 17.31, lng: 82.08 },
  { name: 'West Godavari',    state: 'Andhra Pradesh', lat: 16.91, lng: 81.34 },
  { name: 'Chittoor',         state: 'Andhra Pradesh', lat: 13.22, lng: 79.10 },
  { name: 'Kadapa',           state: 'Andhra Pradesh', lat: 14.47, lng: 78.82 },
  { name: 'Srikakulam',       state: 'Andhra Pradesh', lat: 18.30, lng: 83.90 },
  { name: 'Vizianagaram',     state: 'Andhra Pradesh', lat: 18.12, lng: 83.41 },
  { name: 'Prakasam',         state: 'Andhra Pradesh', lat: 15.35, lng: 79.58 },
  { name: 'Anantapur',        state: 'Andhra Pradesh', lat: 14.68, lng: 77.60 },
  // Telangana
  { name: 'Hyderabad',        state: 'Telangana', lat: 17.38, lng: 78.47 },
  { name: 'Ranga Reddy',      state: 'Telangana', lat: 17.24, lng: 78.08 },
  { name: 'Medchal-Malkajgiri', state: 'Telangana', lat: 17.53, lng: 78.48 },
];

// ── Helpers ──────────────────────────────────────────────────

/**
 * Case-insensitive key lookup in a plain object.
 * Returns the *value* if found, undefined otherwise.
 */
function ciLookup(obj, key) {
  if (!obj || !key) return undefined;
  // Fast path — exact match
  if (obj[key] !== undefined) return obj[key];
  // Slow path — case-insensitive
  const lowerKey = key.toLowerCase();
  for (const k of Object.keys(obj)) {
    if (k.toLowerCase() === lowerKey) return obj[k];
  }
  return undefined;
}

/**
 * Haversine-ish squared-distance (no need for real km — just ordering).
 */
function distSq(lat1, lng1, lat2, lng2) {
  const dLat = lat1 - lat2;
  const dLng = (lng1 - lng2) * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180));
  return dLat * dLat + dLng * dLng;
}

// ── Public API ───────────────────────────────────────────────

/**
 * Resolve the responsible Executive Engineer / authority for a road type
 * within a given state and district.
 *
 * Resolution order:
 *  1. Exact   state → district → roadType
 *  2. Default state → "_default" → roadType
 *  3. National fallback (NHAI generic)
 *
 * @param {string} state    — e.g. "Andhra Pradesh"
 * @param {string} district — e.g. "Krishna"
 * @param {string} roadType — one of NH, SH, MDR, ODR, VR, Urban
 * @returns {{ authority_name, designation, email, phone, complaint_portal, escalation }}
 */
export function resolveAuthority(state, district, roadType) {
  // 1. Try exact state → district → roadType
  const stateData = ciLookup(jurisdictionMap, state);
  if (stateData) {
    const districtData = ciLookup(stateData, district);
    if (districtData) {
      const authority = ciLookup(districtData, roadType);
      if (authority) return { ...authority };
    }

    // 2. Fall back to _default entry for this state
    const defaultDistrict = stateData['_default'];
    if (defaultDistrict) {
      const authority = ciLookup(defaultDistrict, roadType);
      if (authority) return { ...authority };
    }

    // 2b. If roadType not found, pick the first available district and road type
    //     to at least return *someone* in the right state.
    const firstDistrict = Object.values(stateData)[0];
    if (firstDistrict && typeof firstDistrict === 'object') {
      const authority = ciLookup(firstDistrict, roadType);
      if (authority) return { ...authority };
    }
  }

  // 3. National fallback
  return { ...NATIONAL_DEFAULT };
}

/**
 * Approximate the district from GPS coordinates, then resolve the authority.
 *
 * Uses a nearest-centroid lookup against a table of AP + Telangana districts.
 * If the coordinates are far from any known centroid (> ~1° away) the national
 * fallback is returned instead.
 *
 * @param {number} lat      — latitude  (WGS-84)
 * @param {number} lng      — longitude (WGS-84)
 * @param {string} roadType — one of NH, SH, MDR, ODR, VR, Urban
 * @returns {{ authority_name, designation, email, phone, complaint_portal, escalation, _resolvedDistrict?, _resolvedState? }}
 */
export function resolveAuthorityByCoords(lat, lng, roadType) {
  let best = null;
  let bestDist = Infinity;

  for (const entry of DISTRICT_CENTROIDS) {
    const d = distSq(lat, lng, entry.lat, entry.lng);
    if (d < bestDist) {
      bestDist = d;
      best = entry;
    }
  }

  // If nearest centroid is more than ~1.5° away, the point is likely outside
  // our coverage area — fall back to national default.
  if (!best || bestDist > 2.25) {
    return { ...NATIONAL_DEFAULT, _resolvedDistrict: null, _resolvedState: null };
  }

  const authority = resolveAuthority(best.state, best.name, roadType);
  return {
    ...authority,
    _resolvedDistrict: best.name,
    _resolvedState: best.state,
  };
}
