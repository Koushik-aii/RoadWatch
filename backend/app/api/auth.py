"""Authentication routes: register, login, refresh, logout, me."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.auth import CurrentUser
from ..core.exceptions import ValidationError
from ..core.rate_limit import rate_limit_auth, rate_limit_register
from ..database import get_db
from ..schemas.auth import (
    AuthResponse,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from ..services.auth_service import (
    authenticate_user,
    issue_tokens,
    refresh_access_token,
    register_citizen,
    revoke_refresh_token,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(
    body: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    rate_limit_register(request)
    try:
        user = await register_citizen(db, body.email, body.password, body.full_name)
        tokens = await issue_tokens(db, user)
    except ValueError as exc:
        raise ValidationError(str(exc)) from exc
    return AuthResponse(user=UserResponse.from_user(user), tokens=tokens)


@router.post("/login", response_model=AuthResponse)
async def login(
    body: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    rate_limit_auth(request)
    try:
        user = await authenticate_user(db, body.email, body.password)
        tokens = await issue_tokens(db, user)
    except ValueError as exc:
        raise ValidationError(str(exc)) from exc
    return AuthResponse(user=UserResponse.from_user(user), tokens=tokens)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    body: RefreshRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    rate_limit_auth(request)
    try:
        return await refresh_access_token(db, body.refresh_token)
    except ValueError as exc:
        raise ValidationError(str(exc)) from exc


@router.post("/logout", status_code=204)
async def logout(
    body: RefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    await revoke_refresh_token(db, body.refresh_token)


@router.get("/me", response_model=UserResponse)
async def me(user: CurrentUser):
    return UserResponse.from_user(user)
