"""Admin routes: user management and analytics."""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.auth import AdminUser
from ..core.exceptions import ValidationError
from ..database import get_db
from ..models import Complaint, ComplaintStatus, SeverityLevel, User, UserRole
from ..schemas.auth import (
    AdminUserUpdate,
    AnalyticsResponse,
    RegisterRequest,
    UserResponse,
)
from ..services.auth_service import create_user_admin, get_user_by_email

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    _admin: AdminUser,
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()).offset(skip).limit(limit))
    return [UserResponse.from_user(u) for u in result.scalars().all()]


@router.post("/users", response_model=UserResponse, status_code=201)
async def create_user(
    body: RegisterRequest,
    _admin: AdminUser,
    role: UserRole = Query(UserRole.CITIZEN),
    db: AsyncSession = Depends(get_db),
):
    try:
        user = await create_user_admin(
            db, body.email, body.password, body.full_name, role
        )
    except ValueError as exc:
        raise ValidationError(str(exc)) from exc
    return UserResponse.from_user(user)


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    body: AdminUserUpdate,
    _admin: AdminUser,
    db: AsyncSession = Depends(get_db),
):
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID.")

    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if body.role is not None:
        user.role = body.role
    if body.is_active is not None:
        user.is_active = body.is_active
    if body.full_name is not None:
        user.full_name = body.full_name

    await db.flush()
    await db.refresh(user)
    return UserResponse.from_user(user)


@router.get("/analytics", response_model=AnalyticsResponse)
async def analytics(_admin: AdminUser, db: AsyncSession = Depends(get_db)):
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar() or 0
    total_complaints = (await db.execute(select(func.count()).select_from(Complaint))).scalar() or 0

    status_counts = {}
    for st in ComplaintStatus:
        c = (
            await db.execute(
                select(func.count()).select_from(Complaint).where(Complaint.status == st)
            )
        ).scalar() or 0
        status_counts[st.value] = c

    severity_counts = {}
    for sev in SeverityLevel:
        c = (
            await db.execute(
                select(func.count()).select_from(Complaint).where(Complaint.severity == sev)
            )
        ).scalar() or 0
        severity_counts[sev.value] = c

    role_counts = {}
    for role in UserRole:
        c = (
            await db.execute(
                select(func.count()).select_from(User).where(User.role == role)
            )
        ).scalar() or 0
        role_counts[role.value] = c

    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent = (
        await db.execute(
            select(func.count())
            .select_from(Complaint)
            .where(Complaint.created_at >= week_ago)
        )
    ).scalar() or 0

    return AnalyticsResponse(
        total_users=total_users,
        total_complaints=total_complaints,
        complaints_by_status=status_counts,
        complaints_by_severity=severity_counts,
        users_by_role=role_counts,
        complaints_last_7_days=recent,
    )
