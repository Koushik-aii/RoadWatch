# 🛣️ RoadWatch — AI-Powered Civic Road Safety & Transparency Platform

> **IIT Madras AI Road Safety Hackathon 2026 — Track: RoadWatch**  
> A mobile-first, offline-ready civic engagement platform utilizing Generative AI (Gemini) for automatic complaint routing, budget accountability, and structural road transparency across India and the UK.

---

## 📸 Screenshots

| Chatbot Assistant | Live Map | My Complaints | Budget Transparency |
|:---:|:---:|:---:|:---:|
| ![Chat](frontend/public/screenshot_chat.png) | ![Map](frontend/public/screenshot_map.png) | ![Complaints](frontend/public/screenshot_complaints.png) | ![Budget](frontend/public/screenshot_budget.png) |
| AI intent classification with Gemini | Dynamic country switching & coordinate pins | Progress timeline & local IndexedDB storage | Budget utilization & red-flag anomalies |

---

## 🎯 Problem Statement

Citizens encounter road safety hazards (potholes, structural damage, waterlogging) daily. However, resolving these hazards is hindered by three major hurdles:
1. **Lack of Transparency:** Citizens do not know which roads are under warranty, who the contractor is, or when the road was last relaid.
2. **Ambiguous Jurisdiction:** Complex governance makes it impossible for citizens to identify whether a National Highway (NHAI), State Highway (State PWD), Major District Road (MDR), Village Road (PMGSY), or Municipal Corporation is legally responsible for repair.
3. **Budget Accountability:** Hundreds of crores are sanctioned for highway maintenance, yet tracking actual disbursement against road conditions remains completely opaque.

**RoadWatch** solves these challenges by combining a mobile-first chatbot interface, dynamic mapping, and generative AI to automate defect reporting, route complaints directly to the responsible Executive Engineer, and hold agencies accountable through clear budget tracking.

---

## ✨ Key Features

- **🧠 Gemini-Powered NLP Intent Engine:** Replaced fragile keyword logic with a production-grade Gemini API (`gemini-1.5-flash`) integration. It dynamically classifies user messages into four critical categories:
  - `roadInfo`: Retrieves detailed structural road specifications, contractors, licenses, and last relay dates.
  - `budget`: Siphons financial utilization and raises alerts for budget anomalies (e.g., 100% spent but no repairs for 4+ years).
  - `report`: Triggers an interactive geolocation/photo reporting card that auto-routes complaints.
  - `track`: Tracks complaints in a visual 3-stage progress pipeline (Filed → Under Review → Resolved).
- **🗺️ Live Interactive Map (Leaflet):** An immersive dark-mode mapping module (`MapView.jsx`) that clusters road hazards, overlays complaints, and color-codes roads by health condition (Green = Good, Amber = Due, Red = Overdue).
- **⚡ Unified Offline Persistence (IndexedDB):** Implements a two-store IndexedDB caching architecture (`services/db.js`):
  - `complaints_queue`: Temporarily holds offline complaint submissions.
  - `complaints_history`: Persistently stores filed complaints for local tracking, rendering them instantly without round-trips.
- **📡 PWA and Service Worker (Workbox):** Configured via `vite-plugin-pwa` to cache the app shell, OpenStreetMap tiles (up to 500 tiles with a 7-day expiration), and API responses (`/api/roads` Network-First caching).
- **🔀 Automated Jurisdiction Engine:** Includes a legal-jurisdiction resolver covering **Andhra Pradesh** fully (78 entries spanning Krishna, Guntur, Visakhapatnam, and more) plus parts of Telangana. It automatically maps `State → District → Road Type` to determine the exact Executive Engineer, direct contact email, and escalation paths.
- **🌍 Country Adapter Pattern (Global Scope):** A unified configuration interface (`COUNTRY_CONFIGS`) allowing the entire app to dynamically adapt (currency, type labels, authorities, map center, and zoom) between **India (IN)** and the **United Kingdom (GB)**.

---

## 🛠️ Tech Stack

| Layer | Technology Used | Version / Configuration |
|---|---|---|
| **Frontend** | React 19, React Router v7 | `react@^19.2.6`, `react-router-dom@^7.16.0` |
| **Build Tool** | Vite 8 | `vite@^8.0.12` |
| **Styling** | TailwindCSS 4, Vanilla CSS | `tailwindcss@^4.3.0`, `@tailwindcss/vite` |
| **Interactive Maps** | Leaflet + React Leaflet | `leaflet@^1.9.4`, `react-leaflet@^5.0.0` |
| **AI Integration** | Gemini API (`gemini-1.5-flash`) | Intent classification, fallback timeout logic |
| **PWA & Offline** | Workbox + IndexedDB | `vite-plugin-pwa@^1.3.0`, IndexedDB (v2 schema) |
| **Backend API** | FastAPI (Python) | `fastapi@^0.115.0`, `uvicorn[standard]` |
| **ORM & DB** | SQLAlchemy + PostGIS | `sqlalchemy@^2.0.35`, `psycopg2-binary`, `geoalchemy2` |
| **Icons** | Lucide React | `lucide-react@^1.17.0` |

---

## ⚙️ Environment Variables Needed

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend` folder:
```env
# Gemini API Key for NLP Intent engine
VITE_GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
```

### Backend (`backend/.env`)
Create a `.env` file in the `backend` folder:
```env
# PostgreSQL Database URL with PostGIS support
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/roadwatch
```

---

## 🚀 How to Run Locally

### 1. Backend Setup (FastAPI)
```bash
# Navigate to backend and create venv
cd backend
python -m venv venv

# Activate Virtual Environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# Start Development Server (running on port 8000)
python -m uvicorn app.main:app --reload --port 8000
```
*API docs will be live at `http://localhost:8000/docs`*

### 2. Database Setup (PostgreSQL + PostGIS)
```bash
# Initialize local postgres database
createdb roadwatch

# Enable PostGIS spatial extensions
psql roadwatch -c "CREATE EXTENSION postgis;"
```

### 3. Frontend Setup (React PWA)
```bash
# Navigate to frontend and install dependencies
cd frontend
npm install

# Start local server (running on port 5173)
npm run dev
```
*App will be live at `http://localhost:5173`*

---

## 📋 Data Sources

| Domain | Sourced From | Citation URL |
|---|---|---|
| **PMGSY Rural Roads** | PMGSY Online Monitoring & Management System (OMMS) | [omms.nic.in](https://omms.nic.in) |
| **National Highways (India)** | NHAI Public Portal / MoRTH | [pgportal.gov.in](https://pgportal.gov.in) |
| **State Roads (Andhra Pradesh)** | AP Roads & Buildings Dept (AP R&B) | [rnb.ap.gov.in](https://rnb.ap.gov.in) |
| **Accident Data (India)** | iRAD MoRTH Road Accident Database | [irad.morth.gov.in](https://irad.morth.gov.in) |
| **UK Motorways & SRN** | National Highways (UK) | [nationalhighways.co.uk](https://nationalhighways.co.uk) |
| **Local Council Issues (UK)** | FixMyStreet Complaint Portal / BCC Portal | [fixmystreet.com](https://www.fixmystreet.com) |
| **Accident Data (UK)** | STATS19 DfT Road Safety Data | [data.gov.uk](https://data.gov.uk) |

---

## 🏗️ Project Structure

```
RoadWatch/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application server entry
│   │   ├── models.py            # PostgreSQL + GeoAlchemy2 schemas
│   │   ├── database.py          # SQLAlchemy connections & configs
│   │   └── api/                 # API controllers for roads & complaints
│   └── data/
│       ├── jurisdiction_map.json   # 96 legal authority mappings (AP & TS)
│       └── roads_mock.json         # Mock database of Indian & UK roads
│
├── frontend/
│   ├── public/
│   │   ├── manifest.webmanifest # PWA Web Manifest configuration
│   │   └── screenshot_*.png     # App views screenshots
│   └── src/
│       ├── components/
│       │   ├── ChatWindow.jsx       # AI Chat container & dispatcher
│       │   ├── OnboardingTour.jsx   # Dynamic 3-step interactive onboarding
│       │   ├── SkeletonLoaders.jsx  # Card & map loading skeletons
│       │   └── cards/
│       │       ├── RoadInfoCard.jsx     # Intent 1 card - Structural info & links
│       │       ├── BudgetCard.jsx       # Intent 2 card - Utilization & anomalies
│       │       ├── ReportIssueCard.jsx  # Intent 3 card - Geo/Photo defect filing
│       │       └── TrackComplaintCard.jsx # Intent 4 card - Status progress tracker
│       ├── context/
│       │   └── CountryContext.jsx   # Global country (IN vs GB) state provider
│       ├── data/
│       │   ├── countryConfigs.js    # Localization details for IN and GB
│       │   ├── mockData.js          # In-memory datasets mapping from JSON
│       │   └── roads_mock.json      # Client-side compiled roads data
│       ├── features/
│       │   ├── MapView.jsx          # Leaflet map container & country centers
│       │   └── MyComplaints.jsx     # complaints overview with IndexedDB support
│       └── services/
│           ├── db.js                # IndexedDB stores (v2 complaints database)
│           └── intentEngine.js      # Gemini classification & keyword fallback
│
├── generate_map.py                  # Script compiling authority routing engine
├── LICENSE                          # MIT License
├── packages-and-assumptions.md      # Dependency index & technical assumptions
├── README.md                        # Project manifesto
└── DEMO_SCRIPT.md                   # Interactive judges demo roadmap
```

---

