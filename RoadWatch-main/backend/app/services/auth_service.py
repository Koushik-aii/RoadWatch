"""User registration, login, and token lifecycle."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..core.exceptions import ValidationError
from ..core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_refresh_token,
    safe_decode_token,
    validate_password_strength,
    verify_password,
)
from ..models import RefreshToken, User, UserRole
from ..schemas.auth import TokenResponse, UserResponse

settings = get_settings()


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(func.lower(User.email) == email.lower()))
    return result.scalar_one_or_none()


async def register_citizen(
    db: AsyncSession,
    email: str,
    password: str,
    full_name: str,
) -> User:
    validate_password_strength(password)
    existing = await get_user_by_email(db, email)
    if existing:
        raise ValidationError("Email already registered.")

    user = User(
        email=email.lower().strip(),
        hashed_password=hash_password(password),
        full_name=full_name.strip(),
        role=UserRole.CITIZEN,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    user = await get_user_by_email(db, email)
    if user is None or not verify_password(password, user.hashed_password):
        raise ValidationError("Invalid email or password.")
    if not user.is_active:
        raise ValidationError("Account is disabled.")
    return user


async def issue_tokens(db: AsyncSession, user: User) -> TokenResponse:
    access = create_access_token(str(user.id), user.role.value)
    refresh, expires = create_refresh_token(str(user.id))
    token_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(refresh),
        expires_at=expires,
        revoked=False,
    )
    db.add(token_record)
    await db.flush()
    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        expires_in=settings.jwt_access_token_expire_minutes * 60,
    )


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> TokenResponse:
    payload = safe_decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise ValidationError("Invalid refresh token.")

    token_hash = hash_refresh_token(refresh_token)
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked.is_(False),
        )
    )
    record = result.scalar_one_or_none()
    if record is None:
        raise ValidationError("Refresh token not found or revoked.")

    if record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        record.revoked = True
        raise ValidationError("Refresh token expired.")

    user_result = await db.execute(select(User).where(User.id == record.user_id))
    user = user_result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise ValidationError("User not found or inactive.")

    # Rotate refresh token
    record.revoked = True
    return await issue_tokens(db, user)


async def revoke_refresh_token(db: AsyncSession, refresh_token: str) -> None:
    token_hash = hash_refresh_token(refresh_token)
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    )
    record = result.scalar_one_or_none()
    if record:
        record.revoked = True


async def create_user_admin(
    db: AsyncSession,
    email: str,
    password: str,
    full_name: str,
    role: UserRole,
) -> User:
    validate_password_strength(password)
    if await get_user_by_email(db, email):
        raise ValidationError("Email already registered.")
    user = User(
        email=email.lower().strip(),
        hashed_password=hash_password(password),
        full_name=full_name.strip(),
        role=role,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user
