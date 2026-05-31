"""Officer routes: zones and complaint status updates."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.auth import OfficerUser
from ..core.exceptions import NotFoundError, ValidationError
from ..database import get_db
from ..models import UserRole
from ..schemas.auth import OfficerZoneResponse, OfficerZonesUpdate
from .schemas import ComplaintResponse, ComplaintUpdateRequest
from ..services.complaint_service import get_complaint_by_identifier, update_complaint
from ..services.officer_service import (
    get_officer_zones,
    officer_can_access_complaint,
    parse_road_types,
    set_officer_zones,
)
from ..api.complaints import _build_complaint_response

router = APIRouter(prefix="/api/officer", tags=["officer"])


def _zone_response(z) -> OfficerZoneResponse:
    return OfficerZoneResponse(
        id=str(z.id),
        district=z.district,
        state=z.state,
        road_types=parse_road_types(z.road_types),
    )


@router.get("/zones", response_model=list[OfficerZoneResponse])
async def list_zones(officer: OfficerUser, db: AsyncSession = Depends(get_db)):
    zones = await get_officer_zones(db, officer.id)
    return [_zone_response(z) for z in zones]


@router.put("/zones", response_model=list[OfficerZoneResponse])
async def update_zones(
    body: OfficerZonesUpdate,
    officer: OfficerUser,
    db: AsyncSession = Depends(get_db),
):
    if officer.role not in (UserRole.OFFICER, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Officer role required.")
    zone_dicts = [z.model_dump() for z in body.zones]
    try:
        created = await set_officer_zones(db, officer, zone_dicts)
    except ValueError as exc:
        raise ValidationError(str(exc)) from exc
    return [_zone_response(z) for z in created]


@router.patch("/complaints/{complaint_id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    complaint_id: str,
    body: ComplaintUpdateRequest,
    officer: OfficerUser,
    db: AsyncSession = Depends(get_db),
):
    """Officers update status for complaints in their assigned zones."""
    if not body.status:
        raise HTTPException(status_code=400, detail="status field is required.")

    try:
        complaint = await get_complaint_by_identifier(db, complaint_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.message) from exc

    if not await officer_can_access_complaint(db, officer, complaint):
        raise HTTPException(status_code=403, detail="Complaint outside your assigned zones.")

    updates = {"status": body.status}
    if body.assigned_department:
        updates["assigned_department"] = body.assigned_department

    try:
        updated = await update_complaint(db, complaint_id, updates)
    except (ValidationError, ValueError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return _build_complaint_response(updated)
