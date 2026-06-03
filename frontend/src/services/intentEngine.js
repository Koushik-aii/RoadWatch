// ================================================================
// NLP Intent Engine — Rule-based pipeline with Gemini fallback
// ================================================================

import { resolveAuthority } from './jurisdictionService';

const GEMINI_TIMEOUT_MS = 2000;
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── 1. Greeting Detection ──────────────────────────────────────
function detectGreeting(text) {
  const lower = text.toLowerCase().trim();
  const greetings = ['hi', 'hello', 'hey', 'namaste', 'hola', 'bonjour', 'good morning', 'good evening', 'good afternoon', 'shubh prabhat'];
  if (greetings.includes(lower) || greetings.some(g => lower.startsWith(g + ' ') || lower.startsWith(g + '!'))) {
    return { intent: 'greeting', data: null };
  }
  return null;
}

// ── 2. Complaint Tracking Detection ────────────────────────────
function detectTracking(text) {
  const lower = text.toLowerCase();
  
  // Explicit ID match
  const match = text.match(/RW-\d{4}/i);
  if (match) {
    return { intent: 'track', data: null, rawId: match[0].toUpperCase() };
  }
  
  if (
    lower.includes('my complaints') || 
    lower.includes('my reports') || 
    lower.includes('show complaints') ||
    (lower.includes('complaint') && (lower.includes('status') || lower.includes('track') || lower.includes('where')))
  ) {
    return { intent: 'track', data: null, rawId: null };
  }
  return null;
}

// ── 3. Road Search / Discovery Detection ───────────────────────
function detectRoadSearch(text) {
  const lower = text.toLowerCase();
  
  // Specific IDs
  const idMatch = text.match(/\b(NH|SH|MDR|ODR|VR|URB)-?\d*\b/i);
  if (idMatch) {
    return { intent: 'roadDiscovery', query: text };
  }
  
  // Discovery keywords
  if (
    lower.includes('roads in') || 
    lower.includes('roads near') || 
    lower.includes('roads between') ||
    lower.includes('highway') ||
    lower.includes('national highway') ||
    lower.includes('state highway') ||
    lower.includes('rural road') ||
    (lower.includes('road') && (lower.includes('guntur') || lower.includes('vijayawada') || lower.includes('krishna') || lower.includes('tirupati') || lower.includes('visakhapatnam'))) ||
    lower.match(/\b(find|search|show me).+roads\b/i)
  ) {
    return { intent: 'roadDiscovery', query: text };
  }
  return null;
}

// ── 4. Budget Queries Detection ────────────────────────────────
function detectBudget(text) {
  const lower = text.toLowerCase();
  if (
    lower.includes('spent') ||
    lower.includes('budget') ||
    lower.includes('cost') ||
    lower.includes('sanctioned') ||
    lower.includes('how much') ||
    lower.includes('contractor') ||
    lower.includes('who built') ||
    lower.includes('who is repairing') ||
    lower.includes('who repaired') ||
    lower.includes('who maintains')
  ) {
    return { intent: 'budget', query: text };
  }
  return null;
}

// ── 5. Analytics & Maintenance Queries Detection ───────────────
function detectAnalytics(text) {
  const lower = text.toLowerCase();
  if (
    lower.includes('analytics') || 
    lower.includes('statistics') || 
    lower.includes('most reported') ||
    lower.includes('maintenance history') ||
    lower.includes('condition') ||
    lower.includes('when was') ||
    lower.includes('last repaired')
  ) {
    // We can group maintenance history into 'analytics' or 'budget' for now
    // Actually, let's keep it as roadDiscovery or specific intent, but the UI maps analytics to Analytics card.
    // Wait, maintenance history is shown in the RoadInfoCard (budget handles some, roadDiscovery handles general info)
    // If they ask for "maintenance history of NH-16", it should show the road info.
    // So if it has a specific road, we might want to route to roadDiscovery/budget
    if (lower.match(/\b(NH|SH|MDR|ODR|VR|URB)-?\d*\b/i) || lower.includes('road')) {
        return { intent: 'roadDiscovery', query: text };
    }
    return { intent: 'analytics', query: text };
  }
  return null;
}

// ── 6. Report Issue Detection ──────────────────────────────────
function extractRoadType(text) {
  const upper = text.toUpperCase();
  if (upper.includes('NH')) return 'NH';
  if (upper.includes('SH')) return 'SH';
  if (upper.includes('MDR')) return 'MDR';
  if (upper.includes('ODR')) return 'ODR';
  if (upper.includes('VR')) return 'VR';
  if (upper.includes('URBAN')) return 'Urban';
  return 'SH'; // default
}

function detectReport(text) {
  const lower = text.toLowerCase();
  if (
    lower.includes('pothole') ||
    lower.includes('crack') ||
    lower.includes('waterlogging') ||
    lower.includes('broken') ||
    lower.includes('damage') ||
    (lower.includes('report') && !lower.includes('budget') && !lower.includes('my report')) ||
    lower.includes('issue') ||
    lower.includes('bad condition') ||
    lower.includes('terrible road')
  ) {
    const roadType = extractRoadType(text);
    return { 
      intent: 'report', 
      data: resolveAuthority('Andhra Pradesh', 'Krishna', roadType), 
      roadType 
    };
  }
  return null;
}


// ── Gemini Fallback ──────────────────────────────────────────
const SYSTEM_PROMPT = `You are an intent classifier for RoadWatch, an Indian civic road-monitoring chatbot.

Classify the user's message into EXACTLY ONE of these intents:
- greeting       → user says hi, hello, namaste
- roadDiscovery  → user asks about roads in a city, national highways, etc.
- budget         → user asks about money, budget spent, cost
- report         → user wants to report a problem: pothole, crack, waterlogging
- track          → user wants to track a previously submitted complaint
- analytics      → user asks for statistics, analytics, most dangerous roads
- default        → anything else (off-topic, unclear)

Rules:
1. Respond ONLY with a single JSON object. No markdown. No explanation.
2. JSON must have exactly this key: intent
3. All values must be strings.

Example output:
{"intent":"roadDiscovery"}`;

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
          temperature: 0,
          maxOutputTokens: 128,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const json = await response.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = rawText.replace(/```json?|```/gi, '').trim();
    return JSON.parse(cleaned);
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Public API ────────────────────────────────────────────────
/**
 * Classify the user's message using a deterministic pipeline first,
 * then falling back to Gemini if the rules don't match.
 */
export async function detectIntent(text) {
  // 1. Greeting
  const greeting = detectGreeting(text);
  if (greeting) return greeting;

  // 2. Tracking
  const tracking = detectTracking(text);
  if (tracking) return tracking;

  // 3. Road Discovery / Search
  const roadSearch = detectRoadSearch(text);
  if (roadSearch) return roadSearch;

  // 4. Budget
  const budget = detectBudget(text);
  if (budget) return budget;
  
  // 5. Analytics
  const analytics = detectAnalytics(text);
  if (analytics) return analytics;

  // 6. Report Issue
  const report = detectReport(text);
  if (report) return report;

  // 7. Gemini Fallback
  try {
    const geminiResult = await classifyWithGemini(text);
    const validIntents = ['greeting', 'roadDiscovery', 'budget', 'report', 'track', 'analytics'];
    
    if (validIntents.includes(geminiResult.intent)) {
      if (geminiResult.intent === 'roadDiscovery' || geminiResult.intent === 'budget' || geminiResult.intent === 'analytics') {
        return { intent: geminiResult.intent, query: text };
      }
      if (geminiResult.intent === 'track') {
        const idMatch = text.match(/RW-\d{4}/i);
        return { intent: 'track', data: null, rawId: idMatch ? idMatch[0].toUpperCase() : null };
      }
      if (geminiResult.intent === 'report') {
        const roadType = extractRoadType(text);
        return { intent: 'report', data: resolveAuthority('Andhra Pradesh', 'Krishna', roadType), roadType };
      }
      return geminiResult;
    }
  } catch (err) {
    console.warn('[IntentEngine] Gemini unavailable or timed out.');
  }

  return { intent: 'default', data: null };
}
