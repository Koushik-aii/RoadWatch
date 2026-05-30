// ================================================================
// NLP Intent Engine — Gemini AI-powered intent detection
// with keyword-based fallback for offline / timeout scenarios
// ================================================================

import {
  MOCK_ROADS,
  MOCK_BUDGETS,
  MOCK_COMPLAINTS,
} from '../data/mockData';
import { resolveAuthority } from './jurisdictionService';

// ── Constants ────────────────────────────────────────────────
const ROAD_KEYS = Object.keys(MOCK_ROADS); // ['NH-65','SH-1','MDR-23', ...]
const VALID_ROAD_IDS = ['NH-65', 'SH-1', 'MDR-23', 'VR-101', 'URB-MG', 'SH-4'];
const GEMINI_TIMEOUT_MS = 2000;
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── Gemini system prompt ─────────────────────────────────────
const SYSTEM_PROMPT = `You are an intent classifier for RoadWatch, an Indian civic road-monitoring chatbot.

Classify the user's message into EXACTLY ONE of these 5 intents:
- roadInfo   → user asks about a road: type, contractor name, last relaying date, length
- budget     → user asks about money: sanctioned amount, budget spent, cost, how much was allocated
- report     → user wants to report a problem: pothole, crack, waterlogging, broken signage, road damage
- track      → user wants to track a previously submitted complaint, mentions an ID like RW-2044
- default    → anything else (greetings, off-topic, unclear)

Also extract these entities if present (return null if not found):
- road_id       : one of [NH-65, SH-1, MDR-23, VR-101, URB-MG, SH-4] exactly as written
- complaint_id  : a string matching pattern RW-NNNN (e.g. RW-2044, RW-1012)
- road_type     : one of [NH, SH, MDR, ODR, VR, Urban]
- district      : Indian district name if mentioned (e.g. Krishna, Guntur, Hyderabad)

Rules:
1. Respond ONLY with a single JSON object. No markdown. No explanation. No code fences.
2. JSON must have exactly these keys: intent, road_id, complaint_id, road_type, district
3. All values must be strings or null. No booleans, arrays, or nested objects.
4. If the user mentions a road type keyword (NH, SH, MDR, VR, Urban) but no specific road_id, infer road_type only.
5. "track" beats "report" — if user mentions both a complaint ID and an issue, classify as track.

Example output:
{"intent":"roadInfo","road_id":"NH-65","complaint_id":null,"road_type":"NH","district":"Krishna"}`;

// ── Gemini API call ──────────────────────────────────────────
async function classifyWithGemini(text) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not set');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text }] }],
        generationConfig: {
          temperature: 0,          // deterministic classification
          maxOutputTokens: 128,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    // Extract the text content from the Gemini response envelope
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    // Strip any accidental markdown fences just in case
    const cleaned = rawText.replace(/```json?|```/gi, '').trim();
    return JSON.parse(cleaned);
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Keyword fallback helpers (preserved from original) ───────
function extractRoadKey(text) {
  const upper = text.toUpperCase();
  for (const k of ROAD_KEYS) {
    if (upper.includes(k)) return k;
  }
  if (upper.includes('NH')) return 'NH-65';
  if (upper.includes('SH')) return 'SH-1';
  if (upper.includes('MDR')) return 'MDR-23';
  if (upper.includes('VR')) return 'VR-101';
  if (upper.includes('URB')) return 'URB-MG';
  return null;
}

function extractUnknownRoadId(text) {
  const match = text.match(/\b([A-Z]{1,4}-?\d+)\b/gi);
  if (!match) return null;
  const specific = match.find(m => !ROAD_KEYS.some(k => m.toUpperCase() === k));
  return specific || null;
}

function extractComplaintId(text) {
  const match = text.match(/RW-\d{4}/i);
  return match ? match[0].toUpperCase() : null;
}

function extractRoadType(text) {
  const upper = text.toUpperCase();
  if (upper.includes('NH')) return 'NH';
  if (upper.includes('SH')) return 'SH';
  if (upper.includes('MDR')) return 'MDR';
  if (upper.includes('ODR')) return 'ODR';
  if (upper.includes('VR')) return 'VR';
  if (upper.includes('URBAN')) return 'Urban';
  return 'SH'; // sensible default for pothole reports
}

/** Extract district name from text by checking if a known road ID is mentioned. */
function extractDistrictFromRoads(text) {
  const key = extractRoadKey(text);
  if (key && MOCK_ROADS[key]) return MOCK_ROADS[key].district || null;
  // Also try to find a district name mentioned directly in the text
  const knownDistricts = [
    'Krishna', 'Guntur', 'Visakhapatnam', 'Kurnool', 'Nellore',
    'East Godavari', 'West Godavari', 'Chittoor', 'Kadapa',
    'Srikakulam', 'Vizianagaram', 'Prakasam', 'Anantapur',
    'Hyderabad', 'Ranga Reddy', 'Medchal-Malkajgiri',
  ];
  const lower = text.toLowerCase();
  for (const d of knownDistricts) {
    if (lower.includes(d.toLowerCase())) return d;
  }
  return null;
}

/** Extract state name from text by checking if a known road ID is mentioned. */
function extractStateFromRoads(text) {
  const key = extractRoadKey(text);
  if (key && MOCK_ROADS[key]) return MOCK_ROADS[key].state || null;
  const lower = text.toLowerCase();
  if (lower.includes('andhra pradesh') || lower.includes('andhra')) return 'Andhra Pradesh';
  if (lower.includes('telangana')) return 'Telangana';
  return null;
}


/** Pure keyword-based classification — used as fallback. */
function detectIntentKeyword(text) {
  const lower = text.toLowerCase();

  // Track (highest specificity — check first)
  if (
    lower.includes('rw-') ||
    (lower.includes('complaint') && (lower.includes('status') || lower.includes('track') || lower.includes('happened')))
  ) {
    const id = extractComplaintId(text);
    const data = id ? MOCK_COMPLAINTS[id] : Object.values(MOCK_COMPLAINTS)[0];
    return { intent: 'track', data: data || Object.values(MOCK_COMPLAINTS)[0], rawId: id };
  }

  // Report
  if (
    lower.includes('pothole') ||
    lower.includes('crack') ||
    lower.includes('waterlogging') ||
    lower.includes('broken') ||
    lower.includes('damage') ||
    (lower.includes('report') && !lower.includes('budget')) ||
    lower.includes('issue')
  ) {
    const roadType = extractRoadType(text);
    // Resolve real authority from jurisdiction map; default to Krishna / AP
    const district = extractDistrictFromRoads(text) || 'Krishna';
    const state = extractStateFromRoads(text) || 'Andhra Pradesh';
    return { intent: 'report', data: resolveAuthority(state, district, roadType), roadType };
  }

  // Budget
  if (
    lower.includes('spent') ||
    lower.includes('budget') ||
    lower.includes('cost') ||
    lower.includes('sanctioned') ||
    lower.includes('how much')
  ) {
    const key = extractRoadKey(text);
    return { intent: 'budget', data: MOCK_BUDGETS[key] || MOCK_BUDGETS['NH-65'], roadKey: key };
  }

  // Road info
  if (
    lower.includes('what type') ||
    lower.includes('road info') ||
    lower.includes('nh-') ||
    lower.includes('sh-') ||
    lower.includes('mdr-') ||
    lower.includes('contractor') ||
    lower.includes('relay') ||
    lower.includes('road') ||
    lower.includes('highway')
  ) {
    const unknown = extractUnknownRoadId(text);
    const key = extractRoadKey(text);
    if (unknown && !key) {
      return { intent: 'notFound', data: null, roadKey: unknown };
    }
    return { intent: 'roadInfo', data: MOCK_ROADS[key] || MOCK_ROADS['NH-65'], roadKey: key || 'NH-65' };
  }

  return { intent: 'default', data: null };
}

// ── Map Gemini JSON → the shape ChatWindow.handleSend expects ─
function mapGeminiResult(parsed, originalText) {
  const { intent, road_id, complaint_id, road_type, district } = parsed;

  // Validate intent — reject unknown values
  const validIntents = ['roadInfo', 'budget', 'report', 'track', 'default'];
  if (!validIntents.includes(intent)) {
    return detectIntentKeyword(originalText);
  }

  switch (intent) {
    case 'track': {
      // Prefer the Gemini-extracted complaint_id, fall back to regex
      const rawId = complaint_id?.toUpperCase() || extractComplaintId(originalText);
      const data = rawId ? MOCK_COMPLAINTS[rawId] : Object.values(MOCK_COMPLAINTS)[0];
      return {
        intent: 'track',
        data: data || Object.values(MOCK_COMPLAINTS)[0],
        rawId,
      };
    }

    case 'report': {
      // Use Gemini road_type; fall back to keyword extraction
      const rType = road_type || extractRoadType(originalText);
      // Prefer Gemini-extracted district, fall back to road data or defaults
      const rDistrict = district || extractDistrictFromRoads(originalText) || 'Krishna';
      const rState = extractStateFromRoads(originalText) || 'Andhra Pradesh';
      return {
        intent: 'report',
        data: resolveAuthority(rState, rDistrict, rType),
        roadType: rType,
      };
    }

    case 'budget': {
      // Prefer Gemini road_id; fall back to keyword extraction
      const key = (road_id && VALID_ROAD_IDS.includes(road_id))
        ? road_id
        : extractRoadKey(originalText);
      return {
        intent: 'budget',
        data: MOCK_BUDGETS[key] || MOCK_BUDGETS['NH-65'],
        roadKey: key,
      };
    }

    case 'roadInfo': {
      const key = (road_id && VALID_ROAD_IDS.includes(road_id))
        ? road_id
        : extractRoadKey(originalText);
      // Gemini found a road-like token that isn't in our DB
      if (!key) {
        const unknown = extractUnknownRoadId(originalText);
        if (unknown) return { intent: 'notFound', data: null, roadKey: unknown };
      }
      return {
        intent: 'roadInfo',
        data: MOCK_ROADS[key] || MOCK_ROADS['NH-65'],
        roadKey: key || 'NH-65',
      };
    }

    case 'default':
    default:
      return { intent: 'default', data: null };
  }
}

// ── Public API ────────────────────────────────────────────────
/**
 * Classify the user's message using the Gemini API.
 * Falls back to keyword-based classification if the API call fails or times out.
 *
 * @param {string} text - Raw user message
 * @returns {Promise<{intent: string, data: any, [key: string]: any}>}
 */
export async function detectIntent(text) {
  try {
    const geminiResult = await classifyWithGemini(text);
    return mapGeminiResult(geminiResult, text);
  } catch (err) {
    // AbortError = timeout; any other error = API/network failure
    const reason = err.name === 'AbortError' ? 'timeout' : err.message;
    console.warn(`[IntentEngine] Gemini unavailable (${reason}). Using keyword fallback.`);
    return detectIntentKeyword(text);
  }
}
