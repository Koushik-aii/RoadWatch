"""Officer zone management and complaint access checks."""
from __future__ import annotations

import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Complaint, OfficerZone, User, UserRole


def parse_road_types(road_types_str: str | None) -> list[str] | None:
    if not road_types_str:
        return None
    return [t.strip().upper() for t in road_types_str.split(",") if t.strip()]


def format_road_types(road_types: list[str] | None) -> str | None:
    if not road_types:
        return None
    return ",".join(t.strip().upper() for t in road_types)


async def get_officer_zones(db: AsyncSession, officer_id: uuid.UUID) -> list[OfficerZone]:
    result = await db.execute(
        select(OfficerZone).where(OfficerZone.officer_id == officer_id)
    )
    return list(result.scalars().all())


async def set_officer_zones(
    db: AsyncSession,
    officer: User,
    zones: list[dict],
) -> list[OfficerZone]:
    if officer.role not in (UserRole.OFFICER, UserRole.ADMIN):
        raise ValueError("User is not an officer.")

    await db.execute(delete(OfficerZone).where(OfficerZone.officer_id == officer.id))
    created = []
    for z in zones:
        oz = OfficerZone(
            officer_id=officer.id,
            district=z["district"].strip(),
            state=z["state"].strip(),
            road_types=format_road_types(z.get("road_types")),
        )
        db.add(oz)
        created.append(oz)
    await db.flush()
    return created


def complaint_in_zone(complaint: Complaint, zones: list[OfficerZone]) -> bool:
    if not zones:
        return False
    for z in zones:
        if (
            complaint.district
            and complaint.state
            and complaint.district.lower() == z.district.lower()
            and complaint.state.lower() == z.state.lower()
        ):
            allowed = parse_road_types(z.road_types)
            if not allowed or not complaint.road_type:
                return True
            if complaint.road_type.upper() in allowed:
                return True
    return False


async def officer_can_access_complaint(
    db: AsyncSession,
    officer: User,
    complaint: Complaint,
) -> bool:
    if officer.role == UserRole.ADMIN:
        return True
    if officer.role != UserRole.OFFICER:
        return False
    zones = await get_officer_zones(db, officer.id)
    return complaint_in_zone(complaint, zones)
