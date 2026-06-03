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
<<<<<<< Updated upstream
=======


# ---------------------------------------------------------------------------
# Officer Zones Management
# ---------------------------------------------------------------------------

from ..models import OfficerZone
from ..api.schemas import OfficerZoneCreate, OfficerZoneResponse

@router.get("/officer-zones", response_model=list[OfficerZoneResponse])
async def list_officer_zones(_admin: AdminUser, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OfficerZone))
    return result.scalars().all()


@router.post("/officer-zones", response_model=OfficerZoneResponse, status_code=201)
async def create_officer_zone(
    body: OfficerZoneCreate,
    _admin: AdminUser,
    db: AsyncSession = Depends(get_db)
):
    try:
        user_id = uuid.UUID(body.officer_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid officer ID")

    zone = OfficerZone(
        officer_id=user_id,
        district=body.district,
        state=body.state,
        road_types=body.road_types
    )
    db.add(zone)
    await db.commit()
    await db.refresh(zone)
    return zone


@router.delete("/officer-zones/{zone_id}", status_code=204)
async def delete_officer_zone(
    zone_id: str,
    _admin: AdminUser,
    db: AsyncSession = Depends(get_db)
):
    try:
        zid = uuid.UUID(zone_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid zone ID")

    result = await db.execute(select(OfficerZone).where(OfficerZone.id == zid))
    zone = result.scalar_one_or_none()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    await db.delete(zone)
    await db.commit()


# ---------------------------------------------------------------------------
# Jurisdiction Management
# ---------------------------------------------------------------------------

from ..models import Jurisdiction, JurisdictionLevel
from ..api.schemas import JurisdictionCreate, JurisdictionUpdate, JurisdictionResponse

@router.get("/jurisdictions", response_model=list[JurisdictionResponse])
async def list_jurisdictions(_admin: AdminUser, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Jurisdiction).order_by(Jurisdiction.name))
    return result.scalars().all()


@router.post("/jurisdictions", response_model=JurisdictionResponse, status_code=201)
async def create_jurisdiction(
    body: JurisdictionCreate,
    _admin: AdminUser,
    db: AsyncSession = Depends(get_db)
):
    try:
        level = JurisdictionLevel(body.level)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid level. Must be one of {[e.value for e in JurisdictionLevel]}")

    parent_id = None
    if body.parent_id:
        try:
            parent_id = uuid.UUID(body.parent_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid parent ID")

    jurisdiction = Jurisdiction(
        name=body.name,
        level=level,
        parent_id=parent_id,
        contact_email=body.contact_email,
        contact_phone=body.contact_phone
    )
    db.add(jurisdiction)
    await db.commit()
    await db.refresh(jurisdiction)
    return jurisdiction


@router.patch("/jurisdictions/{jurisdiction_id}", response_model=JurisdictionResponse)
async def update_jurisdiction(
    jurisdiction_id: str,
    body: JurisdictionUpdate,
    _admin: AdminUser,
    db: AsyncSession = Depends(get_db)
):
    try:
        jid = uuid.UUID(jurisdiction_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid jurisdiction ID")

    result = await db.execute(select(Jurisdiction).where(Jurisdiction.id == jid))
    jurisdiction = result.scalar_one_or_none()
    if not jurisdiction:
        raise HTTPException(status_code=404, detail="Jurisdiction not found")

    if body.name is not None:
        jurisdiction.name = body.name
    if body.level is not None:
        try:
            jurisdiction.level = JurisdictionLevel(body.level)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid level")
    if body.parent_id is not None:
        if body.parent_id == "":
            jurisdiction.parent_id = None
        else:
            try:
                jurisdiction.parent_id = uuid.UUID(body.parent_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid parent ID")
    if body.contact_email is not None:
        jurisdiction.contact_email = body.contact_email
    if body.contact_phone is not None:
        jurisdiction.contact_phone = body.contact_phone

    await db.commit()
    await db.refresh(jurisdiction)
    return jurisdiction


@router.delete("/jurisdictions/{jurisdiction_id}", status_code=204)
async def delete_jurisdiction(
    jurisdiction_id: str,
    _admin: AdminUser,
    db: AsyncSession = Depends(get_db)
):
    try:
        jid = uuid.UUID(jurisdiction_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid jurisdiction ID")

    result = await db.execute(select(Jurisdiction).where(Jurisdiction.id == jid))
    jurisdiction = result.scalar_one_or_none()
    if not jurisdiction:
        raise HTTPException(status_code=404, detail="Jurisdiction not found")

    await db.delete(jurisdiction)
    await db.commit()
>>>>>>> Stashed changes
