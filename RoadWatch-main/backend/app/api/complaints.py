"""
Complaints API — CRUD with JWT auth and role-based access control.
"""
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..core.auth import AdminUser, CurrentUser, OfficerUser, get_current_user
from ..core.exceptions import AppException, NotFoundError, ValidationError
from ..core.rate_limit import rate_limit_complaint_create
from ..database import get_db
from ..models import ComplaintStatus, SeverityLevel, User, UserRole
from ..services.access_control import assert_can_view_complaint
from ..services.complaint_service import (
    complaint_to_frontend_dict,
    create_complaint,
    delete_complaint,
    get_complaint_by_identifier,
    list_complaints,
    update_complaint,
)
from ..services.file_storage import save_complaint_image
from ..services.jurisdiction_service import resolve_authority
from ..services.officer_service import get_officer_zones, officer_can_access_complaint
from .schemas import (
    AuthorityInfo,
    ComplaintCreateRequest,
    ComplaintCreateResponse,
    ComplaintListResponse,
    ComplaintResponse,
    ComplaintStatusResponse,
    ComplaintUpdateRequest,
)

router = APIRouter(prefix="/api/complaints", tags=["complaints"])
settings = get_settings()


def _build_complaint_response(complaint, authority: AuthorityInfo | None = None) -> ComplaintResponse:
    data = complaint_to_frontend_dict(complaint)
    auth = authority
    if auth is None and complaint.road_type and complaint.district and complaint.state:
        auth = resolve_authority(complaint.road_type, complaint.district, complaint.state)

    routed = auth
    return ComplaintResponse(
        complaint_id=data["id"],
        uuid=data["uuid"],
        title=data["title"],
        description=data.get("description"),
        issue=data["issue"],
        latitude=data["latitude"],
        longitude=data["longitude"],
        image_url=data.get("image_url"),
        severity=data["severity"],
        status=data["status"],
        stage=data["stage"],
        assigned_department=data["assigned_department"],
        authority_email=data["authority_email"],
        escalation=data["escalation"],
        district=data.get("district"),
        state=data.get("state"),
        country=data.get("country"),
        road_type=data.get("road_type"),
        road_id=data.get("road_id"),
        issue_type=data.get("issue_type"),
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
        filedDate=data["filedDate"],
        daysElapsed=data["daysElapsed"],
        expectedDays=data["expectedDays"],
        overdue=data["overdue"],
        routed_authority=routed,
    )


async def _list_kwargs_for_user(db: AsyncSession, user: User) -> dict:
    if user.role == UserRole.CITIZEN:
        return {"reporter_id": user.id}
    if user.role == UserRole.OFFICER:
        zones = await get_officer_zones(db, user.id)
        return {"officer_zones": zones}
    return {}


@router.post("/", response_model=ComplaintCreateResponse, status_code=201)
async def create_complaint_endpoint(
    body: ComplaintCreateRequest,
    request: Request,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    rate_limit_complaint_create(str(user.id), request)

    severity = None
    if body.severity:
        try:
            severity = SeverityLevel(body.severity)
        except ValueError as exc:
            raise ValidationError(f"Invalid severity: {body.severity}") from exc

    complaint, authority = await create_complaint(
        db,
        title=body.resolved_title(),
        description=body.resolved_description(),
        latitude=body.lat,
        longitude=body.lng,
        district=body.district,
        state=body.state,
        country=body.country,
        road_type=body.road_type,
        road_id=body.road_id,
        severity=severity,
        issue_type=body.issue_type,
        reporter_id=user.id,
    )

    resp = _build_complaint_response(complaint, authority)
    return ComplaintCreateResponse(
        complaint_id=resp.complaint_id,
        status=resp.status,
        routed_authority=authority,
        message=(
            f"Your complaint {resp.complaint_id} has been submitted and routed to "
            f"{authority.authority_name}."
        ),
        complaint=resp,
    )


@router.post("/upload", response_model=ComplaintCreateResponse, status_code=201)
async def create_complaint_with_image(
    request: Request,
    user: CurrentUser,
    lat: float = Form(...),
    lng: float = Form(...),
    district: str = Form(...),
    state: str = Form(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    issue_type: Optional[str] = Form(None),
    country: str = Form("India"),
    road_type: Optional[str] = Form(None),
    road_id: Optional[str] = Form(None),
    severity: Optional[str] = Form(None),
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    rate_limit_complaint_create(str(user.id), request)
    image_path = await save_complaint_image(image)

    sev = None
    if severity:
        try:
            sev = SeverityLevel(severity)
        except ValueError as exc:
            raise ValidationError(f"Invalid severity: {severity}") from exc

    rid = None
    if road_id:
        try:
            rid = uuid.UUID(road_id)
        except ValueError as exc:
            raise ValidationError("Invalid road_id UUID.") from exc

    resolved_title = (title or issue_type or "Road issue").strip()
    resolved_desc = (description or issue_type or resolved_title).strip()

    complaint, authority = await create_complaint(
        db,
        title=resolved_title,
        description=resolved_desc,
        latitude=lat,
        longitude=lng,
        district=district,
        state=state,
        country=country,
        road_type=road_type,
        road_id=rid,
        severity=sev,
        image_path=image_path,
        issue_type=issue_type,
        reporter_id=user.id,
    )

    resp = _build_complaint_response(complaint, authority)
    return ComplaintCreateResponse(
        complaint_id=resp.complaint_id,
        status=resp.status,
        routed_authority=authority,
        message=f"Complaint {resp.complaint_id} created with image attachment.",
        complaint=resp,
    )


@router.get("/", response_model=ComplaintListResponse)
async def list_complaints_endpoint(
    user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(None, ge=1, le=100),
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    road_type: Optional[str] = Query(None),
    assigned_department: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    size = page_size or settings.default_page_size
    size = min(size, settings.max_page_size)
    rbac = await _list_kwargs_for_user(db, user)

    complaints, total = await list_complaints(
        db,
        page=page,
        page_size=size,
        status=status,
        severity=severity,
        district=district,
        state=state,
        road_type=road_type,
        assigned_department=assigned_department,
        search=search,
        **rbac,
    )

    pages = max(1, (total + size - 1) // size) if total else 1
    items = [_build_complaint_response(c) for c in complaints]

    return ComplaintListResponse(
        total=total,
        page=page,
        page_size=size,
        pages=pages,
        items=items,
    )


@router.get("/{complaint_id}", response_model=ComplaintStatusResponse)
async def get_complaint(
    complaint_id: str,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    try:
        complaint = await get_complaint_by_identifier(db, complaint_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.message) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=exc.message) from exc

    await assert_can_view_complaint(db, user, complaint)

    authority = None
    if complaint.road_type and complaint.district and complaint.state:
        authority = resolve_authority(
            complaint.road_type, complaint.district, complaint.state
        )

    full = _build_complaint_response(complaint, authority)
    return ComplaintStatusResponse(
        complaint_id=full.complaint_id,
        status=full.status,
        issue_type=full.issue_type or full.title,
        submitted_at=full.created_at,
        road_id=full.road_id,
        routed_authority=authority,
        complaint=full,
    )


@router.patch("/{complaint_id}", response_model=ComplaintResponse)
async def patch_complaint(
    complaint_id: str,
    body: ComplaintUpdateRequest,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Admin: full update. Officer: use /api/officer/complaints/{id}/status."""
    if user.role == UserRole.CITIZEN:
        raise HTTPException(status_code=403, detail="Citizens cannot update complaints.")

    try:
        complaint = await get_complaint_by_identifier(db, complaint_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.message) from exc

    if user.role == UserRole.OFFICER:
        if not await officer_can_access_complaint(db, user, complaint):
            raise HTTPException(status_code=403, detail="Outside your assigned zones.")
        allowed = {"status", "assigned_department"}
        updates = {k: v for k, v in body.model_dump(exclude_unset=True).items() if k in allowed}
    else:
        updates = body.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided to update.")

    try:
        updated = await update_complaint(db, complaint_id, updates)
    except (ValidationError, ValueError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return _build_complaint_response(updated)


@router.delete("/{complaint_id}", status_code=204)
async def remove_complaint(
    complaint_id: str,
    _admin: AdminUser,
    db: AsyncSession = Depends(get_db),
):
    try:
        await delete_complaint(db, complaint_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.message) from exc
