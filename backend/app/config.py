"""Application configuration via environment variables."""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "RoadWatch API"
    app_version: str = "3.0.0"
    debug: bool = False
<<<<<<< Updated upstream

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/roadwatch"
    database_url_sync: str = "postgresql://postgres:postgres@localhost:5432/roadwatch"
=======
    use_mock_ai: bool = True

    database_url: str = "sqlite+aiosqlite:///./roadwatch.db"
    database_url_sync: str = "sqlite:///./roadwatch.db"
>>>>>>> Stashed changes

    cors_origins: str = "*"

    uploads_dir: Path = BASE_DIR / "uploads"
    complaint_uploads_dir: Path = BASE_DIR / "uploads" / "complaints"
    max_upload_size_mb: int = 10
    allowed_image_extensions: set[str] = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

    default_page_size: int = 20
    max_page_size: int = 100

    sla_days_default: int = 21

    # JWT
    jwt_secret_key: str = "CHANGE-ME-in-production-use-openssl-rand-hex-32"  # env: JWT_SECRET_KEY
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # Rate limiting
    rate_limit_auth_per_minute: int = 10
    rate_limit_register_per_hour: int = 5
    complaint_rate_limit_per_user: int = 5
    complaint_rate_limit_per_ip: int = 10
    complaint_rate_limit_window_seconds: int = 3600

    # Bootstrap admin (optional, first run)
    bootstrap_admin_email: str | None = None
    bootstrap_admin_password: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
