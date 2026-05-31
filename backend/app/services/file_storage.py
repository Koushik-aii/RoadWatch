"""Complaint image upload handling."""
from __future__ import annotations

import uuid
from pathlib import Path

import aiofiles
from fastapi import UploadFile

from ..config import get_settings
from ..core.exceptions import ValidationError

settings = get_settings()


def ensure_upload_dirs() -> None:
    settings.complaint_uploads_dir.mkdir(parents=True, exist_ok=True)
    settings.uploads_dir.mkdir(parents=True, exist_ok=True)


def _validate_extension(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext not in settings.allowed_image_extensions:
        raise ValidationError(
            f"Invalid file type '{ext}'. Allowed: {', '.join(sorted(settings.allowed_image_extensions))}"
        )
    return ext


async def save_complaint_image(file: UploadFile) -> str:
    """Save uploaded image; returns relative path under uploads/."""
    ensure_upload_dirs()

    if not file.filename:
        raise ValidationError("Image filename is required.")

    ext = _validate_extension(file.filename)
    content = await file.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise ValidationError(
            f"Image exceeds maximum size of {settings.max_upload_size_mb} MB."
        )

    filename = f"{uuid.uuid4().hex}{ext}"
    rel_path = f"complaints/{filename}"
    dest = settings.complaint_uploads_dir / filename

    async with aiofiles.open(dest, "wb") as out:
        await out.write(content)

    return rel_path


def image_url(image_path: str | None) -> str | None:
    if not image_path:
        return None
    return f"/uploads/{image_path}"
