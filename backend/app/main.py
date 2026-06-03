"""RoadWatch FastAPI application entry point."""
from contextlib import asynccontextmanager
<<<<<<< Updated upstream
=======
import logging
>>>>>>> Stashed changes

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
<<<<<<< Updated upstream
=======
from sqlalchemy.ext.asyncio import AsyncSession
>>>>>>> Stashed changes

from .api import admin, analytics, auth, complaints, detection, officer, roads
from .config import get_settings
from .core.exceptions import AppException, app_exception_handler, http_exception_handler
from .core.middleware import SecurityHeadersMiddleware
<<<<<<< Updated upstream
from .database import async_session_maker
from .models import User, UserRole
from .services.auth_service import create_user_admin, get_user_by_email
from .services.file_storage import ensure_upload_dirs

settings = get_settings()


async def _bootstrap_admin() -> None:
    if not settings.bootstrap_admin_email or not settings.bootstrap_admin_password:
        return
    async with async_session_maker() as db:
        existing = await get_user_by_email(db, settings.bootstrap_admin_email)
        if existing:
            return
        await create_user_admin(
            db,
            settings.bootstrap_admin_email,
            settings.bootstrap_admin_password,
            "System Administrator",
            UserRole.ADMIN,
        )
=======
from .core.security import hash_password
from .database import async_session_maker, engine, Base
from .models import User, UserRole
from .services.auth_service import get_user_by_email
from .services.file_storage import ensure_upload_dirs

settings = get_settings()
logger = logging.getLogger(__name__)


async def _bootstrap_demo_accounts() -> None:
    # Auto-create tables for SQLite demo stability
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_maker() as db:
        # Admin
        if not await get_user_by_email(db, "admin@roadwatch.ai"):
            admin_user = User(
                email="admin@roadwatch.ai",
                full_name="Demo Admin",
                role=UserRole.ADMIN,
                hashed_password=hash_password("DemoPass123!"),
            )
            db.add(admin_user)

        # Officer
        if not await get_user_by_email(db, "officer@test.com"):
            officer_user = User(
                email="officer@test.com",
                full_name="Demo Officer",
                role=UserRole.OFFICER,
                hashed_password=hash_password("DemoPass123!"),
            )
            db.add(officer_user)

        # Citizen
        if not await get_user_by_email(db, "citizen@test.com"):
            citizen_user = User(
                email="citizen@test.com",
                full_name="Demo Citizen",
                role=UserRole.CITIZEN,
                hashed_password=hash_password("DemoPass123!"),
            )
            db.add(citizen_user)
>>>>>>> Stashed changes
        await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_upload_dirs()
    try:
<<<<<<< Updated upstream
        await _bootstrap_admin()
    except Exception:
        pass
=======
        await _bootstrap_demo_accounts()
    except Exception as e:
        print(f"Bootstrap error: {e}")
>>>>>>> Stashed changes
    yield


app = FastAPI(
    title=settings.app_name,
    description=(
        "Civic road transparency and complaint management API with "
        "PostgreSQL persistence, pagination, filtering, and AI pothole detection."
    ),
    version=settings.app_version,
    lifespan=lifespan,
)

origins = (
    [o.strip() for o in settings.cors_origins.split(",")]
    if settings.cors_origins != "*"
    else ["*"]
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import HTTPException  # noqa: E402

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)

settings.uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(settings.uploads_dir)), name="uploads")


@app.get("/")
def read_root():
    return {
        "message": "Welcome to the RoadWatch API",
        "version": settings.app_version,
        "docs": "/docs",
    }


@app.get("/api/health")
async def health_check():
    db_ok = False
    try:
        from sqlalchemy import text
        from .database import async_session_maker

        async with async_session_maker() as session:
            await session.execute(text("SELECT 1"))
            db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "unavailable",
        "ai_enabled": True,
        "version": settings.app_version,
    }


app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(analytics.router)
app.include_router(officer.router)
app.include_router(roads.router)
app.include_router(complaints.router)
app.include_router(detection.router)
