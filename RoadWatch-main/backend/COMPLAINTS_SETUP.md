# Complaints Backend Setup

## Folder structure

```
backend/
├── alembic/                 # Database migrations
│   ├── env.py
│   └── versions/
├── app/
│   ├── main.py              # FastAPI app + exception handlers
│   ├── config.py            # Pydantic settings (env vars)
│   ├── database.py          # Async SQLAlchemy engine
│   ├── models.py            # ORM models (Complaint, Road, …)
│   ├── api/
│   │   ├── complaints.py    # CRUD + upload
│   │   ├── detection.py     # AI detection (async)
│   │   ├── roads.py
│   │   └── schemas.py
│   ├── core/
│   │   └── exceptions.py
│   ├── services/
│   │   ├── complaint_service.py
│   │   ├── jurisdiction_service.py
│   │   └── file_storage.py
│   └── utils/
│       └── complaint_helpers.py
├── uploads/complaints/      # Uploaded complaint images
├── data/                    # jurisdiction_map.json
├── API_EXAMPLES.md
├── .env.example
├── Dockerfile
└── requirements.txt
```

## Quick start (Docker)

```bash
cd RoadWatch-main
docker compose up -d
```

API: http://localhost:8000/docs

## Local development

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/complaints/` | Create (JSON) |
| POST | `/api/complaints/upload` | Create with image |
| GET | `/api/complaints/` | List (pagination + filters) |
| GET | `/api/complaints/{id}` | Get one |
| PATCH | `/api/complaints/{id}` | Update |
| DELETE | `/api/complaints/{id}` | Delete |

Filters: `status`, `severity`, `district`, `state`, `road_type`, `assigned_department`, `search`

See `API_EXAMPLES.md` for sample JSON responses.
