"""Complaint business logic and database operations."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..core.exceptions import NotFoundError, ValidationError
from ..models import Complaint, ComplaintStatus, OfficerZone, Road, SeverityLevel, User, UserRole
from ..utils.complaint_helpers import (
    days_since,
    is_overdue,
    make_complaint_number,
    parse_complaint_id,
    status_to_stage,
)
from .file_storage import image_url
from .jurisdiction_service import get_road_type_from_db, resolve_authority

settings = get_settings()
SEVERITY_FROM_ISSUE = {
    "pothole": SeverityLevel.MEDIUM,
    "crack": SeverityLevel.LOW,
    "waterlogging": SeverityLevel.HIGH,
    "road cave-in": SeverityLevel.CRITICAL,
    "cave-in": SeverityLevel.CRITICAL,
    "missing signage": SeverityLevel.LOW,
}


def infer_severity(title: str, explicit: SeverityLevel | None = None) -> SeverityLevel:
    if explicit:
        return explicit
    lower = title.lower()
    for key, sev in SEVERITY_FROM_ISSUE.items():
        if key in lower:
            return sev
    return SeverityLevel.MEDIUM


async def _generate_unique_complaint_number(db: AsyncSession) -> tuple[str, uuid.UUID]:
    for _ in range(10):
        new_uuid = uuid.uuid4()
        number = make_complaint_number(new_uuid)
        exists = await db.execute(
            select(Complaint.id).where(Complaint.complaint_number == number)
        )
        if exists.scalar_one_or_none() is None:
            return number, new_uuid
    raise ValidationError("Unable to generate unique complaint number.")


async def get_complaint_by_identifier(
    db: AsyncSession,
    complaint_id: str,
) -> Complaint:
    kind, value = parse_complaint_id(complaint_id)

    if kind == "rw":
        result = await db.execute(
            select(Complaint).where(
                func.lower(Complaint.complaint_number) == f"rw-{value}".lower()
            )
        )
        complaint = result.scalar_one_or_none()
        if complaint is None:
            suffix = value.lower()
            all_result = await db.execute(select(Complaint))
            for c in all_result.scalars().all():
                if c.id.hex[-4:].lower() == suffix:
                    return c
    else:
        try:
            uid = uuid.UUID(value)
        except ValueError as exc:
            raise ValidationError(
                f"Invalid complaint ID '{complaint_id}'. Use RW-XXXX or a valid UUID."
            ) from exc
        result = await db.execute(select(Complaint).where(Complaint.id == uid))
        complaint = result.scalar_one_or_none()

    if complaint is None:
        raise NotFoundError("Complaint", complaint_id)
    return complaint


def complaint_to_frontend_dict(
    complaint: Complaint,
    authority_name: str | None = None,
    authority_email: str | None = None,
    escalation: str | None = None,
) -> dict:
    """Shape complaint for React frontend compatibility."""
    dept = complaint.assigned_department or authority_name or "Unassigned"
    email = complaint.authority_email or authority_email or ""
    esc = complaint.escalation_contact or escalation or ""
    stage = status_to_stage(complaint.status)
    filed = complaint.created_at
    filed_str = filed.strftime("%Y-%m-%d") if filed else ""
    elapsed = days_since(filed)
    sla = settings.sla_days_default

    return {
        "id": complaint.complaint_number,
        "uuid": str(complaint.id),
        "title": complaint.title,
        "description": complaint.description or "",
        "issue": complaint.description or complaint.title,
        "road": complaint.road_type or "",
        "road_type": complaint.road_type,
        "location": f"{complaint.latitude:.4f}, {complaint.longitude:.4f}",
        "latitude": complaint.latitude,
        "longitude": complaint.longitude,
        "stage": stage,
        "status": complaint.status.value,
        "severity": complaint.severity.value if complaint.severity else "Medium",
        "assigned_department": dept,
        "authority": dept,
        "authority_name": dept,
        "authority_email": email,
        "authorityEmail": email,
        "escalation": esc,
        "district": complaint.district,
        "state": complaint.state,
        "country": complaint.country,
        "filedDate": filed_str,
        "created_at": filed.isoformat() if filed else None,
        "updated_at": complaint.updated_at.isoformat() if complaint.updated_at else None,
        "resolvedDate": filed_str if stage == 2 else None,
        "daysElapsed": elapsed,
        "expectedDays": sla,
        "overdue": is_overdue(filed, sla) and stage < 2,
        "image_url": image_url(complaint.image_path),
        "photo": image_url(complaint.image_path),
        "road_id": str(complaint.road_id) if complaint.road_id else None,
        "issue_type": complaint.issue_type or complaint.title,
    }


async def create_complaint(
    db: AsyncSession,
    *,
    title: str,
    description: str | None,
    latitude: float,
    longitude: float,
    district: str,
    state: str,
    country: str = "India",
    road_type: str | None = None,
    road_id: uuid.UUID | None = None,
    severity: SeverityLevel | None = None,
    status: ComplaintStatus = ComplaintStatus.UNDER_REVIEW,
    image_path: str | None = None,
    issue_type: str | None = None,
    reporter_id: uuid.UUID | None = None,
) -> tuple[Complaint, object]:
    resolved_road_type = road_type
    if road_id:
        db_road_type = await get_road_type_from_db(db, road_id)
        if db_road_type is None:
            raise NotFoundError("Road", str(road_id))
        resolved_road_type = db_road_type

    resolved_road_type = resolved_road_type or road_type
    if not resolved_road_type:
        raise ValidationError(
            "Cannot determine road type. Provide road_id or road_type (NH/SH/MDR/ODR/VR/Urban)."
        )

    authority = resolve_authority(resolved_road_type, district, state)
    if authority is None:
        raise ValidationError(
            f"No authority mapping for state='{state}', district='{district}', "
            f"road_type='{resolved_road_type}'."
        )

    complaint_number, new_uuid = await _generate_unique_complaint_number(db)
    final_title = title.strip() or (issue_type or "Road issue").strip()
    final_description = (description or issue_type or final_title).strip()
    sev = infer_severity(final_title, severity)

    try:
        point = from_shape(Point(longitude, latitude), srid=4326)
    except Exception:
        point = None

    complaint = Complaint(
        id=new_uuid,
        complaint_number=complaint_number,
        title=final_title,
        description=final_description,
        latitude=latitude,
        longitude=longitude,
        location=point,
        image_path=image_path,
        severity=sev,
        status=status,
        assigned_department=authority.authority_name,
        authority_email=authority.email,
        escalation_contact=authority.escalation,
        district=district,
        state=state,
        country=country,
        road_type=resolved_road_type,
        road_id=road_id,
        issue_type=issue_type or final_title,
        reporter_id=reporter_id,
    )
    db.add(complaint)
    await db.flush()
    await db.refresh(complaint)
    return complaint, authority


async def list_complaints(
    db: AsyncSession,
    *,
    page: int = 1,
    page_size: int = 20,
    status: str | None = None,
    severity: str | None = None,
    district: str | None = None,
    state: str | None = None,
    road_type: str | None = None,
    assigned_department: str | None = None,
    search: str | None = None,
    reporter_id: uuid.UUID | None = None,
    officer_zones: list[OfficerZone] | None = None,
) -> tuple[list[Complaint], int]:
    query = select(Complaint)
    filters = []

    if reporter_id is not None:
        filters.append(Complaint.reporter_id == reporter_id)

    if officer_zones is not None:
        if not officer_zones:
            filters.append(Complaint.id.is_(None))
        else:
            zone_clauses = []
            for z in officer_zones:
                zone_clauses.append(
                    and_(
                        func.lower(Complaint.district) == z.district.lower(),
                        func.lower(Complaint.state) == z.state.lower(),
                    )
                )
            filters.append(or_(*zone_clauses))

    if status:
        try:
            st = ComplaintStatus(status)
            if st == ComplaintStatus.ROUTED:
                filters.append(
                    Complaint.status.in_([ComplaintStatus.ROUTED, ComplaintStatus.UNDER_REVIEW])
                )
            else:
                filters.append(Complaint.status == st)
        except ValueError:
            pass

    if severity:
        try:
            filters.append(Complaint.severity == SeverityLevel(severity))
        except ValueError:
            pass

    if district:
        filters.append(func.lower(Complaint.district) == district.strip().lower())
    if state:
        filters.append(func.lower(Complaint.state) == state.strip().lower())
    if road_type:
        filters.append(func.upper(Complaint.road_type) == road_type.strip().upper())
    if assigned_department:
        filters.append(
            Complaint.assigned_department.ilike(f"%{assigned_department.strip()}%")
        )
    if search:
        term = f"%{search.strip()}%"
        filters.append(
            or_(
                Complaint.title.ilike(term),
                Complaint.description.ilike(term),
                Complaint.complaint_number.ilike(term),
            )
        )

    if filters:
        query = query.where(and_(*filters))

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    offset = (page - 1) * page_size
    query = query.order_by(Complaint.created_at.desc()).offset(offset).limit(page_size)
    result = await db.execute(query)
    return list(result.scalars().all()), total


async def update_complaint(
    db: AsyncSession,
    complaint_id: str,
    updates: dict,
) -> Complaint:
    complaint = await get_complaint_by_identifier(db, complaint_id)

    if "title" in updates and updates["title"] is not None:
        complaint.title = updates["title"].strip()
    if "description" in updates and updates["description"] is not None:
        complaint.description = updates["description"]
    if "status" in updates and updates["status"] is not None:
        complaint.status = ComplaintStatus(updates["status"])
    if "severity" in updates and updates["severity"] is not None:
        complaint.severity = SeverityLevel(updates["severity"])
    if "assigned_department" in updates and updates["assigned_department"] is not None:
        complaint.assigned_department = updates["assigned_department"]
    if "latitude" in updates and updates["latitude"] is not None:
        complaint.latitude = updates["latitude"]
    if "longitude" in updates and updates["longitude"] is not None:
        complaint.longitude = updates["longitude"]
        try:
            complaint.location = from_shape(
                Point(updates["longitude"], updates["latitude"]), srid=4326
            )
        except Exception:
            pass

    complaint.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(complaint)
    return complaint


async def delete_complaint(db: AsyncSession, complaint_id: str) -> None:
    complaint = await get_complaint_by_identifier(db, complaint_id)
    await db.delete(complaint)
