# 🎤 RoadWatch — Stage 2 Demo Script
## IIT Madras CoERS Road Safety Hackathon
**Total Duration: 5 minutes | Covers all 5 Evaluation Criteria**

---

> ## ⚡ Before You Start — Checklist
> 1. Open Chrome at `http://localhost:5173/`
> 2. Open DevTools (F12) — keep **Network tab** ready
> 3. Clear onboarding: DevTools → Application → Local Storage → delete `roadwatch_onboarding_done`
> 4. Clear complaints: delete `roadwatch_complaints` key to start fresh
> 5. Zoom browser to **100%** — the app is mobile-first (430px max-width)
> 6. Keep DevTools on the side — **don't cover the app**
> 7. Have these queries ready to paste: `road info NH-65` · `budget SH-4` · `report pothole on SH-4` · `track RW-2044`

---

## ⏱️ Minute 0:00–0:45 — Hook + Onboarding Tour

**Say:**
> "Every year, India spends over ₹1.5 lakh crore on road infrastructure. But ask any citizen: *who built this road? When was it last repaired? How much was spent? And who do I call when it breaks?* Nobody knows. RoadWatch fixes that."

**Do:** Point to the screen — the 3-step onboarding tooltip card appears automatically.

**Say:**
> "New users see a 3-step guided tour. We designed this for rural citizens who may be using a civic app for the first time."

**Do:** Click **Next 2/3** then **Next 3/3** then **✓ Got it** — walk through all 3 steps, pausing on each:
- Step 1: *"Ask about any road →"* — notice the animated arrows pointing to the input bar  
- Step 2: *"See who's responsible →"* — the system auto-assigns the legally-responsible officer  
- Step 3: *"File a complaint in 30 seconds →"* — works offline too  

---

## ⏱️ Minute 0:45–1:30 — Criterion 1: Data Accuracy ✅

**Say:**
> "Let's query NH-65 — the Vijayawada-Hyderabad corridor, one of India's busiest NHs."

**Do:** Type in chatbot: `road info NH-65` → wait for card to appear (skeleton loader shows briefly)

**Say (pointing at the card):**
> "We get: road type National Highway, last relay date — March 2022, the contractor — Navayuga Engineering Co., their license number, and a full maintenance history timeline. Every single data point has a source. Click this link."

**Do:** Click the source link at the bottom of the card.

**Say:**
> "It goes directly to the NHAI portal — live government data. This is verifiable by any journalist, RTI applicant, or judge right now."

**Criterion demonstrated:** ✅ Data accuracy — road type, contractor, relay date, sourced & verifiable

---

## ⏱️ Minute 1:30–2:20 — Criteria 2 + 3: Budget Transparency + Complaint Routing ✅✅

**Say:**
> "Now let me show you what makes RoadWatch uniquely powerful — budget transparency and automated complaint routing working together."

**Do:** Type: `budget SH-4`

**Say (pointing at the red warning):**
> "SH-4 in Kurnool: ₹55 crore sanctioned. ₹55 crore disbursed. 100% of the budget absorbed. But look at this red flag — *no repair since January 2020*. Five years of budget, zero road work. This is the kind of systemic anomaly that goes unnoticed. RoadWatch surfaces it automatically."

**Do:** Point at the clickable source link.
> "Every figure here — the GO number, the sanctioned amount — links to the actual AP R&B government order. Fully citable."

**Do:** Type: `report pothole on SH-4`

**Say:**
> "When a citizen wants to act on this, they say 'report pothole'. Watch what happens — the intent engine detects SH-4, looks up our jurisdiction map, identifies that SH roads in Kurnool district fall under the State PWD, and routes the complaint to the exact Executive Engineer — their direct email, phone, and official complaint portal. Zero guesswork. Legally correct."

**Do:** Select defect type (e.g. "Pothole"), click "Detect my GPS location", then click "Submit Complaint".

**Say:**
> "Complaint filed and routed. Notice the routing card — authority name, designation, email, official portal link, and the escalation chain if unresolved in 30 days."

**Criteria demonstrated:** ✅ Budget transparency (anomaly detection, source links) ✅ Complaint routing (jurisdiction map, EE assignment)

---

## ⏱️ Minute 2:20–3:00 — Criterion 4: UI & Offline Capability ✅

**Say:**
> "Our primary users are rural citizens in low-connectivity zones. The app must work offline."

**Do:** In DevTools Network tab → change dropdown to **Offline**.

**Say:**
> "Watch what happens instantly."

**Do:** Point to the amber banner at the top.
> "Immediate feedback — they're on cached data. The chatbot still works because our NLP runs entirely client-side. No API calls, no LLM. Just a keyword intent engine that runs in under 5 milliseconds."

**Do:** Type: `road info VR-101` (shows it works from cache)

**Say:** "Now let me file a complaint while offline."

**Do:** Type `report pothole` → fill out the form → submit.
> "Saved offline via IndexedDB — a browser database. The complaint is queued for sync."

**Do:** Switch DevTools back to **No throttling** (online).
> "The moment connectivity returns — the green banner: complaints synced. Go to My Cases."

**Do:** Tap the **My Cases** tab.
> "The complaint we just filed is here. And the two demo complaints — one resolved, one overdue with an escalation alert."

**Criterion demonstrated:** ✅ UI & Accessibility — mobile-first, skeleton loaders, offline-capable, complaint tracking

---

## ⏱️ Minute 3:00–3:45 — Criterion 5: Global Applicability ✅

**Say:**
> "The final criterion — global scalability. Can this work outside India?"

**Do:** Click the **🇮🇳 IN** button in the chatbot header → switches to **🇬🇧 GB**.

**Say:**
> "The system adapts immediately. Budget cards now show £ instead of ₹. Road types map to Motorways and A-roads. Complaint routing now shows 'National Highways' in the UK and links to the FixMyStreet API. Same backend, same NLP, same UI — zero rewrites."

**Do:** Point to the floating badge: *"Adding a new country = 1 JSON config file"*.
> "We didn't hack the core logic. The entire localization — currencies, authority names, road type labels, complaint portals — lives in a single 30-line JSON config. Adding Australia, Kenya, or Brazil is an afternoon's work."

**Do:** Switch back to 🇮🇳 IN.

**Criterion demonstrated:** ✅ Global applicability — country-agnostic schema, 2-country live demo

---

## ⏱️ Minute 3:45–4:20 — Live Map Walkthrough

**Do:** Tap the **Live Map** tab.

**Say:**
> "Every road in our database is plotted on a dark OpenStreetMap layer — no API key, no cost. Green = good condition, amber = due for relay, red = overdue or flagged."

**Do:** Open filter panel → filter by Condition → Overdue.
> "Real-time filtering. Now only the problem roads are visible."

**Do:** Click the red circle marker.
> "The popup shows the full data — last relay, contractor, budget utilisation, the anomaly flag. And a direct button to report an issue — which pre-fills the chatbot. The map and chatbot are fully integrated."

---

## ⏱️ Minute 4:20–4:45 — My Complaints Deep Dive

**Do:** Tap **My Cases** tab.

**Say:**
> "Citizens can track every complaint they've ever filed — with a visual 3-stage progress pipeline. RW-1012 here is overdue by 24 days. In a production system, this would automatically trigger an escalation email to the Superintending Engineer and flag the authority on a public dashboard."

**Do:** Point at the overdue complaint row.
> "The stats at the top — 3 filed, 1 resolved, 1 overdue — give citizens instant civic literacy about their area."

---

## ⏱️ Minute 4:45–5:00 — Close

**Say:**
> "To summarise: RoadWatch provides **verifiable data** from PMGSY, NHAI, and State PWD records. It **auto-routes complaints** to the legally responsible officer — the Executive Engineer — based on road type and district. It **exposes budget anomalies** with direct government citations. It **works offline** for rural users with no connectivity. And it's built **country-agnostically** — one JSON file to deploy anywhere in the world."

**Pause. Make eye contact.**

> "The jurisdiction map covers 96 authorities across Andhra Pradesh and Telangana today. Scaling to all 36 Indian states is a data-entry exercise, not an engineering one. The architecture is production-ready. Thank you."

---

## 🧯 Contingency Phrases

| If... | Say... |
|---|---|
| App takes time to load | "While that loads — our jurisdiction map covers 96 authorities across AP and Telangana. Each entry has the EE's direct email, phone, and complaint portal." |
| Skeleton loader is visible | "Notice the loading state — no blank white screens. Even as data loads, the user gets visual feedback." |
| Offline toggle is slow | "The offline detection uses the browser's `navigator.onLine` event — the same API used by Google Maps and Twitter." |
| Judge asks about real data | "All source URLs in the cards are live government portals. The JSON data mirrors the PMGSY OMMS schema exactly — we can ingest a full shapefile export from MoRTH." |
| Judge asks about scaling | "The backend uses FastAPI + PostgreSQL with PostGIS — we can ingest the full NHAI road network as a shapefile import. The NLP intent engine can be replaced with a fine-tuned Gemini model for natural language." |
| Judge asks about road not found | "Type `road info XY-999` — watch what happens. When a road isn't in our database, we still assign the district's generic Executive Engineer and tell the citizen their complaint will be manually reviewed. No citizen is left without a contact." |
| Internet drops during demo | "This is actually a perfect live demo of offline mode! The app continues working — notice the amber banner." |

---

## 📊 Evaluation Criteria Checklist

| # | Criterion | Where Shown | Time |
|---|---|---|---|
| 1 | Data Accuracy | `road info NH-65` card + source link | 0:45–1:30 |
| 2 | Complaint Routing | `report pothole on SH-4` → EE routing card | 1:30–2:20 |
| 3 | Budget Transparency | `budget SH-4` → red flag anomaly | 1:30–2:20 |
| 4 | UI & Accessibility | Offline demo + My Cases skeleton | 2:20–3:00 |
| 5 | Global Applicability | 🇮🇳→🇬🇧 toggle + 1-JSON badge | 3:00–3:45 |
