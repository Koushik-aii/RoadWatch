# RoadWatch

RoadWatch is a hackathon prototype for AI-assisted civic road complaint reporting, jurisdiction routing, and road-condition analytics. It combines a mobile-first React PWA with a FastAPI backend, PostgreSQL/PostGIS storage, Leaflet maps, offline complaint queuing, and early-stage AI road-damage workflows.

The project is designed to demonstrate how citizens, road authorities, and civic teams could work from the same complaint and analytics layer: citizens report issues, the system helps route them to the right authority, officers update status, and public dashboards show complaint density, severity, and response patterns.

## Project Status

RoadWatch is a functional prototype, not a production deployment. Some screens use seeded demonstration data to make the hackathon flow repeatable. The architecture is intentionally shaped so those datasets can later be replaced by official road inventories, public works records, and live government integrations.

## What Is Implemented

- User authentication with citizen, officer, and admin roles.
- Complaint creation, listing, tracking, update, and deletion APIs.
- Image upload support for complaint evidence.
- AI road damage detection workflow with severity, confidence, risk score, and complaint creation from detection results.
- Jurisdiction mapping from district and road type to authority contact details.
- Officer zone assignment and role-based complaint access.
- React PWA with mobile-first navigation.
- Offline complaint queue and local complaint history through IndexedDB.
- Leaflet map with road markers, complaint markers, density heatmap, clusters, dangerous-zone overlays, and filtering.
- Analytics APIs for complaint trends, severity distribution, department performance, critical regions, most reported roads, and resolution statistics.
- Multilingual UI strings for English, Telugu, Hindi, and Tamil.
- Docker Compose setup for PostGIS and backend services.

## Prototype Features

These features are present as prototype or demo-oriented capabilities and should be treated as early-stage:

- Road and budget records use seeded demo data in parts of the UI.
- AI road damage detection is suitable for demonstration and workflow validation, not certified engineering assessment.
- Dangerous-zone prediction is based on complaint density, severity mix, and unresolved cases, not on a validated civil-engineering model.
- Government workflow simulation demonstrates how a case could move through civic operations, but it is not integrated with official systems.
- Country adapters and multilingual support show extensibility, but full jurisdiction coverage depends on verified public datasets.

## Future Scope

- Integrate official road inventories, work-order records, and repair history datasets.
- Add duplicate complaint detection using PostGIS radius search and text similarity.
- Add citizen voting to convert duplicate reports into urgency signals.
- Add workflow event logs for filed, triaged, assigned, work order issued, resolved, and citizen verified states.
- Add background jobs for image processing, notifications, sync reconciliation, and analytics refresh.
- Add Open311-compatible exports for civic platform interoperability.
- Add SMS or WhatsApp intake for users without smartphone app access.
- Add materialized analytics views and production-grade observability.

## Demo Screenshots

Screenshots can be added here for submission decks and judge review.

| Assistant | AI Scan | GIS Map | Analytics |
|---|---|---|---|
| `frontend/public/screenshot_chat.png` | `TODO: add scan screenshot` | `frontend/public/screenshot_map.png` | `TODO: add analytics screenshot` |

| Complaints | Officer View | Offline Queue | Admin |
|---|---|---|---|
| `frontend/public/screenshot_complaints.png` | `TODO: add officer screenshot` | `TODO: add offline screenshot` | `TODO: add admin screenshot` |

## System Design

```mermaid
flowchart TD
    Citizen[Citizen PWA] -->|Report complaint / upload image| Frontend[React + Leaflet PWA]
    Frontend -->|JWT API calls| API[FastAPI Backend]
    Frontend -->|Offline queue| IndexedDB[(IndexedDB)]
    IndexedDB -->|Sync when online| API

    API --> Auth[Auth and RBAC]
    API --> Complaints[Complaint Service]
    API --> Detection[AI Detection Service]
    API --> Routing[Jurisdiction Routing]
    API --> Analytics[Analytics Service]

    Complaints --> DB[(PostgreSQL + PostGIS)]
    Detection --> Uploads[(Uploaded Images)]
    Routing --> JurisdictionData[Jurisdiction JSON / DB]
    Analytics --> DB

    Officers[Officer Dashboard] --> API
    Admins[Admin Dashboard] --> API
    API --> Dashboards[Maps + Analytics Views]
```

## Architecture Overview

### Frontend

- React 19 and Vite for the PWA shell.
- React Router for app routes.
- Tailwind CSS for UI styling.
- Leaflet and React Leaflet for maps.
- IndexedDB services for offline complaint queue and local history.
- Workbox through `vite-plugin-pwa` for app shell and runtime caching.

### Backend

- FastAPI application with modular routers.
- SQLAlchemy async ORM with PostgreSQL/PostGIS.
- Alembic migrations.
- JWT authentication and role-based access control.
- Upload handling for complaint and detection images.
- Analytics service layer that aggregates data before sending it to the frontend.

### Data Layer

- `complaints`: complaint records, GPS coordinates, severity, status, district, road type, department, timestamps.
- `roads`: road inventory and geometry support.
- `jurisdictions`: authority hierarchy and optional boundaries.
- `users`, `refresh_tokens`, `officer_zones`: authentication and access control.
- `road_damage_detections`: AI detection metadata and generated result images.

## API Documentation

When the backend is running:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `GET /api/health`

Key API groups:

| Area | Endpoint Examples | Purpose |
|---|---|---|
| Auth | `POST /api/auth/login`, `GET /api/auth/me` | User login, registration, refresh, profile |
| Complaints | `POST /api/complaints/`, `GET /api/complaints/`, `PATCH /api/complaints/{id}` | Complaint lifecycle |
| Detection | `POST /api/detect-road-damage`, `GET /api/detections` | Road damage image workflow |
| Roads | `GET /api/roads` | Road records and road metadata |
| Officer | `GET /api/officer/zones`, `PATCH /api/officer/complaints/{id}/status` | Officer workflow |
| Admin | `GET /api/admin/users`, `GET /api/admin/analytics` | Admin management |
| Analytics | `GET /api/analytics/dashboard`, `GET /api/analytics/map` | Aggregated GIS and dashboard data |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Maps | Leaflet, React Leaflet |
| PWA | Workbox, vite-plugin-pwa |
| Offline Storage | IndexedDB |
| Backend | FastAPI, Uvicorn |
| Database | PostgreSQL, PostGIS |
| ORM / Migrations | SQLAlchemy, Alembic |
| AI / Image Workflow | Ultralytics, OpenCV, Pillow |
| Auth | JWT, bcrypt/passlib |

## Local Setup

### Prerequisites

- Node.js 20 or newer
- Python 3.10 or newer
- Docker Desktop, recommended for PostGIS
- Git, optional but recommended

### 1. Start PostgreSQL/PostGIS

From the repository root:

```bash
docker compose up -d db
```

This starts a PostGIS database at:

```env
postgresql://postgres:postgres@localhost:5432/roadwatch
```

### 2. Configure Backend

Create `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/roadwatch
DATABASE_URL_SYNC=postgresql://postgres:postgres@localhost:5432/roadwatch
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
JWT_SECRET_KEY=replace-this-with-a-long-random-secret
BOOTSTRAP_ADMIN_EMAIL=admin@roadwatch.local
BOOTSTRAP_ADMIN_PASSWORD=ChangeMe123!
```

Install dependencies and run migrations:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python -m uvicorn app.main:app --reload --port 8000
```

On macOS or Linux, activate the virtual environment with:

```bash
source venv/bin/activate
```

### 3. Configure Frontend

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GEMINI_API_KEY=
```

The Gemini key is optional for local demo flows that use fallback intent handling.

Install dependencies and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Docker Deployment

For a local containerized backend and database:

```bash
docker compose up --build
```

This starts:

- PostGIS on `localhost:5432`
- FastAPI on `localhost:8000`

Then run the frontend separately:

```bash
cd frontend
npm install
npm run dev
```

## Production Deployment Notes

Recommended production shape:

1. Build frontend static assets:

```bash
cd frontend
npm run build
```

2. Serve `frontend/dist` from a static host such as Vercel, Netlify, Cloudflare Pages, or Nginx.
3. Deploy the backend with Uvicorn/Gunicorn workers behind a reverse proxy.
4. Use managed PostgreSQL with PostGIS enabled.
5. Set production environment variables:

```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:5432/roadwatch
DATABASE_URL_SYNC=postgresql://USER:PASSWORD@HOST:5432/roadwatch
CORS_ORIGINS=https://your-frontend-domain.example
JWT_SECRET_KEY=strong-random-secret
```

6. Run migrations during release:

```bash
cd backend
alembic upgrade head
```

7. Store uploaded images in object storage for production, rather than local disk.
8. Add HTTPS, monitoring, structured logs, backup policies, and rate-limit persistence before real public use.

## Scalability Discussion

RoadWatch is structured around aggregation APIs and spatial data so it can scale beyond a small hackathon dataset.

Important scaling paths:

- Add PostGIS `GIST` indexes on complaint `location` and road geometries.
- Add B-tree indexes on `district`, `severity`, `status`, `created_at`, and `assigned_department`.
- Use bounding-box map queries so the frontend loads only visible map points.
- Move expensive analytics to cached queries or materialized views.
- Run image detection in a background worker instead of inside request/response paths.
- Store uploads in S3-compatible object storage.
- Use a queue for offline sync reconciliation, notifications, and dashboard refresh.
- Add read replicas for analytics-heavy deployments.
- Add audit logs for workflow transitions and officer actions.

## Hackathon Demo Flow

A focused 5-minute demo should show one complete civic loop:

1. Upload or select a road damage image in AI Scan.
2. Show AI-assisted severity, confidence, and repair priority.
3. Create a complaint from the detection.
4. Show jurisdiction routing to the responsible authority.
5. Open the GIS map and analytics dashboard to show heatmap, clusters, dangerous zones, trends, and department performance.
6. Switch offline, queue a complaint, reconnect, and show sync.
7. Switch language briefly to demonstrate accessibility and inclusion.

## Responsible AI and Data Notes

- AI outputs are decision-support signals, not final engineering assessments.
- Confidence and severity should be shown to users as estimates.
- Seeded demo data should be replaced with verified public datasets before deployment.
- Government workflow screens should be labeled as simulated unless integrated with official systems.
- Any real deployment should include privacy review, evidence retention policy, and human review for escalations.

## Repository Structure

```text
RoadWatch-main/
  backend/
    app/
      api/                 FastAPI route modules
      services/            Business logic and analytics services
      core/                Auth, middleware, security, exceptions
      schemas/             Auth and response schemas
      models.py            SQLAlchemy models
      database.py          Async DB setup
    alembic/               Database migrations
    data/                  Seed jurisdiction and road data
    requirements.txt
  frontend/
    src/
      components/          Shared UI components
      context/             Auth, language, country providers
      features/            Main app screens
      hooks/               Offline, sync, analytics hooks
      services/            API, IndexedDB, detection, auth clients
      data/                Seed client data and translations
    public/                PWA icons and screenshots
    package.json
  docker-compose.yml
  DEMO_SCRIPT.md
  HACKATHON_FINALIST_STRATEGY.md
```

## License

This repository is provided under the MIT License. See `LICENSE` for details.
