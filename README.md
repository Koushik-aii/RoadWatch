# RoadWatch

> AI-powered chatbot that enables citizens to monitor road quality, track public spending, and report issues to the responsible authorities — increasing transparency in road infrastructure.

**IIT Madras AI Road Safety Hackathon 2026 — Track: RoadWatch**
Organized by CoERS & RBG Labs, IIT Madras.

---

## Problem

Public accountability for road quality remains low because critical information about road construction, maintenance contracts, budgets, and repair history is fragmented across multiple government departments or buried within complex administrative records.

Citizens typically have limited visibility into:
- Which contractor is responsible for a road
- How much public money has been allocated for its construction or maintenance
- When repairs were last carried out

This lack of transparency makes it difficult to track delays, identify repeated failures in road quality, or hold responsible agencies and contractors accountable.

## Solution

RoadWatch consolidates publicly available data on road projects — including contractor details, allocated budgets, maintenance schedules, and repair history — into an accessible, location-based AI chatbot. Citizens can:

1. **Query any road** — get road type (NH/SH/MDR/ODR/VR), last relaying date, contractor name
2. **Check public spending** — sanctioned vs spent amounts with source citation
3. **Report issues** — AI-classified photo reports (pothole/crack/waterlogging) with GPS
4. **Route complaints** — automatically sent to the correct Executive Engineer or Authority based on road type and jurisdiction
5. **Track complaints** — follow up on submitted reports

## Key Features (Rulebook §1.2.3)

- ✅ Road type (NH/SH/MDR etc.), last relaying date, contractor name
- ✅ Routing to correct Executive Engineer or Authority for complaints
- ✅ Amount sanctioned/spent with source citation
- ✅ Global applicability across countries (country-agnostic schema)
- ✅ Offline functionality and robustness in low-network conditions

## Evaluation Criteria Coverage (Rulebook)

| Criterion | Implementation |
|---|---|
| Data accuracy | PMGSY OMMS, NHAI portal, State PWD — cited per record |
| Complaint routing mechanism | `jurisdiction_map.json` — road type + district → EE/Authority |
| Budget transparency including source | Source URL/document shown in every budget card |
| User interface & accessibility | Mobile-first chatbot, Hindi/Telugu toggle, offline mode |
| Information integration across countries | Country adapter pattern, India + UK demo |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Leaflet.js |
| Backend | FastAPI (Python 3.11) |
| AI — Intent & NLP | Claude API (Anthropic) — few-shot intent classification |
| AI — Defect detection | YOLOv8-nano / MobileNetV3 (ONNX, runs in-browser) |
| Database | PostgreSQL 15 + PostGIS |
| Offline | Service Worker + IndexedDB (Workbox) |
| Maps | OpenStreetMap (Leaflet) |
| Hosting | Render (backend) + Vercel (frontend) |

## Data Sources

- [PMGSY OMMS](https://omms.nic.in) — rural road-level data (contractor, cost, completion date)
- [NHAI](https://nhai.gov.in) — National Highway project data
- [iRAD / MoRTH](https://irad.org.in) — Integrated Road Accident Database
- [OpenStreetMap](https://openstreetmap.org) — road classification, offline tiles
- State PWD portals — AP, Telangana, Tamil Nadu

## Project Structure

```
roadwatch/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/          # API route handlers
│   │   ├── models/           # Pydantic schemas + DB models
│   │   ├── services/         # Business logic
│   │   └── data/             # jurisdiction_map.json, country adapters
│   ├── tests/
│   └── requirements.txt
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/         # Chatbot UI
│   │   │   ├── map/          # Leaflet map view
│   │   │   ├── complaint/    # Issue report flow
│   │   │   └── shared/       # Cards, badges, offline banner
│   │   ├── hooks/            # useOffline, useGeolocation, useChat
│   │   ├── services/         # API client, intent service
│   │   ├── store/            # State management
│   │   └── utils/            # Country adapters, formatters
│   └── public/
│       └── sw.js             # Service worker (Workbox)
├── docs/
│   ├── architecture.md
│   ├── data-sources.md
│   ├── jurisdiction-schema.md
│   └── global-adapters.md
├── scripts/
│   ├── seed_pmgsy.py         # Seed DB from PMGSY data
│   └── build_jurisdiction_map.py
└── docker-compose.yml
```
