# 🛣️ RoadWatch — Civic Road Transparency Platform

> **IIT Madras CoERS Road Safety Hackathon 2024**  
> A mobile-first AI chatbot platform for civic road transparency, complaint routing, and budget accountability across India.

---

## 📸 Screenshots

| Chatbot Assistant | Live Map | My Complaints | Budget Transparency |
|:---:|:---:|:---:|:---:|
| ![Chat](frontend/public/screenshot_chat.png) | ![Map](frontend/public/screenshot_map.png) | ![Complaints](frontend/public/screenshot_complaints.png) | ![Budget](frontend/public/screenshot_budget.png) |
| Road info with NHAI citations | Condition-coded road markers | Progress pipeline & overdue alerts | Budget anomaly detection |

---

## 🎯 How Evaluation Criteria Map to Features

| Criterion | What We Built | Key Files |
|---|---|---|
| **1. Data Accuracy** | Road type, contractor, relay date — sourced from PMGSY/NHAI and verifiable via clickable links | [`roads_mock.json`](frontend/src/data/roads_mock.json), [`RoadInfoCard.jsx`](frontend/src/components/cards/RoadInfoCard.jsx) |
| **2. Complaint Routing** | Intent engine auto-routes to correct Executive Engineer by road type + district. 96 authority entries. | [`intentEngine.js`](frontend/src/services/intentEngine.js), [`jurisdiction_map.json`](backend/data/jurisdiction_map.json) |
| **3. Budget Transparency** | Sanctioned vs. disbursed figures, utilisation %, source URL, red-flag warning for anomalies | [`BudgetCard.jsx`](frontend/src/components/cards/BudgetCard.jsx), [`roads_mock.json`](frontend/src/data/roads_mock.json) |
| **4. UI & Accessibility** | Mobile-first PWA with offline capability, skeleton loaders, onboarding tour, complaint tracking | [`sw.js`](frontend/public/sw.js), [`db.js`](frontend/src/services/db.js), [`SkeletonLoaders.jsx`](frontend/src/components/SkeletonLoaders.jsx) |
| **5. Global Applicability** | Country-agnostic schema — one JSON config file per country. Live demo: 🇮🇳 India + 🇬🇧 UK | [`countryConfigs.js`](frontend/src/data/countryConfigs.js), [`CountryContext.jsx`](frontend/src/context/CountryContext.jsx) |

---

## 🗺️ jurisdiction_map.json — For Judges

This is the **core routing engine** of the platform. It maps:

```
State → District → Road Type → Responsible Authority (with direct contact)
```

**Coverage:**
- **Andhra Pradesh:** All 13 districts × 6 road types (NH, SH, MDR, ODR, VR, Urban) = **78 entries**
- **Telangana:** 3 districts (Hyderabad, Rangareddy, Warangal) = **18 entries**
- **Total: 96 authority entries**

Each entry contains the exact legally-responsible officer:

```json
{
  "authority_name": "NHAI PIU, Krishna",
  "designation": "Executive Engineer (NH)",
  "email": "pd.nhai.krishna@ap.gov.in",
  "phone": "1800-11-6062",
  "complaint_portal": "https://pgportal.gov.in/",
  "escalation": "Regional Officer (RO), NHAI"
}
```

**How it works in practice:**
When a citizen says `"report pothole on SH-1 in Guntur"`, the intent engine:
1. Detects road type → `SH`
2. Detects district → `Guntur`
3. Looks up `jurisdiction_map["Andhra Pradesh"]["Guntur"]["SH"]`
4. Returns the exact Executive Engineer + direct email + complaint portal URL

**Zero guesswork. Legally correct. Fully automated.**

---

## 🏗️ Project Structure

```
RoadWatch/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint
│   │   ├── models.py            # PostgreSQL/PostGIS schemas
│   │   ├── database.py          # DB connection
│   │   └── api/                 # Route handlers
│   └── data/
│       ├── jurisdiction_map.json   # 96 authority entries (AP + Telangana)
│       └── roads_mock.json         # 6 roads with full budget data
│
├── frontend/
│   ├── public/
│   │   ├── sw.js                # Service Worker (offline caching)
│   │   └── screenshot_*.png     # Screenshots for README
│   └── src/
│       ├── components/
│       │   ├── ChatWindow.jsx          # Main chatbot + intent dispatcher
│       │   ├── OnboardingTour.jsx      # 3-step first-time tooltip tour
│       │   ├── SkeletonLoaders.jsx     # Loading states for all card types
│       │   └── cards/
│       │       ├── RoadInfoCard.jsx    # Intent 1 — Road data + citations
│       │       ├── BudgetCard.jsx      # Intent 2 — Budget transparency
│       │       ├── ReportIssueCard.jsx # Intent 3 — Offline-aware complaint form
│       │       └── TrackComplaintCard.jsx # Intent 4 — Status tracker
│       ├── context/
│       │   └── CountryContext.jsx      # Global country config provider
│       ├── data/
│       │   ├── countryConfigs.js       # IN + GB localization configs
│       │   ├── mockData.js             # Runtime data mapped from JSON
│       │   └── roads_mock.json         # Road database (frontend copy)
│       ├── features/
│       │   ├── MapView.jsx             # Leaflet map with condition-coded pins
│       │   └── MyComplaints.jsx        # /my-complaints page with tracking
│       └── services/
│           ├── db.js                   # IndexedDB wrapper (offline queue)
│           └── intentEngine.js         # Keyword-based NLP engine
│
├── generate_map.py                 # Script to generate jurisdiction_map.json
├── README.md
└── DEMO_SCRIPT.md                  # Timed 5-minute demo script for judges
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 14+ with PostGIS extension (optional — frontend runs standalone)

### Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

> ✅ The frontend is fully self-contained with mock data. No backend required to run the demo.

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

### Database (PostgreSQL + PostGIS)

```bash
# Create DB
createdb roadwatch
psql roadwatch -c "CREATE EXTENSION postgis;"

# Run migrations (if Alembic is configured)
alembic upgrade head

# Load jurisdiction map
python generate_map.py
```

---

## 🌍 Global Applicability

Adding a new country requires **one JSON config file**:

```js
// frontend/src/data/countryConfigs.js
{
  code: 'AU', name: 'Australia', flag: '🇦🇺',
  road_type_map: {
    NH: 'National Highway',
    SH: 'State Road',
    Urban: 'Local Road',
  },
  authority_levels: ['National Land Transport', 'State Roads Authority'],
  complaint_endpoint: 'See.Click.Fix API',
  currency: 'A$',
  currency_code: 'AUD'
}
```

The entire UI adapts: road type labels, currencies, authority names, complaint portals, escalation chains. Currently supports 🇮🇳 India and 🇬🇧 United Kingdom.

---

## 📡 Offline Capability

RoadWatch works **fully offline** — critical for rural users with spotty connectivity:

1. **Service Worker** (`sw.js`) caches the app shell + all road/jurisdiction JSON on first load
2. **Keyword NLP** (`intentEngine.js`) runs entirely client-side — no API calls needed
3. **IndexedDB queue** (`db.js`) stores complaints locally when offline
4. Auto-syncs on reconnect — green banner confirms sync with complaint count
5. **Amber offline banner** appears immediately on disconnection

---

## ✨ New in This Version (Hackathon Polish)

- 🦴 **Skeleton loaders** on all cards: chatbot responses, map loading, complaints page
- 🔴 **Road not found** — shows fallback district EE with "will be manually reviewed" message
- 🗂️ **My Complaints** — skeleton loading state + complaints filed via the app now appear here automatically
- 🎯 **Onboarding tour** — animated arrow pointers + glowing highlight ring on chat input
- 🗺️ **MapView** — full-screen skeleton while Leaflet tiles load (no blank white screen)

---

## 🔗 Live Demo

> Local: `http://localhost:5173/`

**Quick demo commands to try:**
```
road info NH-65      → Road data with contractor + NHAI source
budget SH-4          → Budget anomaly (100% spent, no repair since 2020)
report pothole       → Complaint form → auto-routes to EE
track RW-2044        → View complaint status pipeline
road info XY-999     → Error state → generic district EE assigned
```

---

## 📋 Data Sources

| Data | Source | URL |
|---|---|---|
| PMGSY road data | OMMS NIC | https://omms.nic.in |
| National Highway budgets | NHAI Portal | https://pgportal.gov.in |
| AP State PWD records | AP R&B | https://rnb.ap.gov.in |
| Accident statistics | iRAD MoRTH | https://irad.morth.gov.in |
| Urban roads | VMC | https://vmc.ap.gov.in |
| Jurisdiction map | AP R&B + NHAI Circulars | Generated via `generate_map.py` |

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Maps | Leaflet + React-Leaflet (no API key) |
| Offline | Service Worker + IndexedDB |
| NLP | Keyword intent engine (client-side, zero latency) |
| Backend | FastAPI + Python |
| Database | PostgreSQL + PostGIS (optional) |
| Icons | Lucide React |

---

*Built for IIT Madras CoERS Road Safety Hackathon 2024*
