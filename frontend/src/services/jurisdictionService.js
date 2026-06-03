// ================================================================
// Jurisdiction Service — resolve the responsible Executive Engineer
// for any (state, district, roadType) combination using the full
// jurisdiction_map.json sourced from backend/data/.
// ================================================================

import jurisdictionMap from '../data/jurisdiction_map.json';

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
 * @param {object} countryConfig — current country configuration
 * @returns {{ authority_name, designation, email, phone, complaint_portal, escalation }}
 */
export function resolveAuthority(state, district, roadType, countryConfig) {
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

    // 3. National fallback (Dynamic from Country Config)
    const fallback = countryConfig?.national_default_authority || {
      authority_name: 'Unknown National Authority'
    };
    return { ...fallback };
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
 * @param {object} countryConfig — current country configuration
 * @returns {{ authority_name, designation, email, phone, complaint_portal, escalation, _resolvedDistrict?, _resolvedState? }}
 */
export function resolveAuthorityByCoords(lat, lng, roadType, countryConfig) {
  let best = null;
  let bestDist = Infinity;

  const centroids = countryConfig?.district_centroids || [];

  for (const entry of centroids) {
    const d = distSq(lat, lng, entry.lat, entry.lng);
    if (d < bestDist) {
      bestDist = d;
      best = entry;
    }
  }

  // If nearest centroid is more than ~1.5° away, the point is likely outside
  // our coverage area — fall back to national default.
  if (!best || bestDist > 2.25) {
    const fallback = countryConfig?.national_default_authority || {
      authority_name: 'Unknown National Authority'
    };
    return { ...fallback, _resolvedDistrict: null, _resolvedState: null };
  }

  const authority = resolveAuthority(best.state, best.name, roadType, countryConfig);
  return {
    ...authority,
    _resolvedDistrict: best.name,
    _resolvedState: best.state,
  };
}
