"""Jurisdiction map lookup for complaint routing."""
from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..api.schemas import AuthorityInfo
from ..models import Road

_JURISDICTION_MAP_PATH = (
    Path(__file__).resolve().parent.parent.parent / "data" / "jurisdiction_map.json"
)
_JURISDICTION_MAP: dict | None = None


def load_jurisdiction_map() -> dict:
    global _JURISDICTION_MAP
    if _JURISDICTION_MAP is None:
        if _JURISDICTION_MAP_PATH.exists():
            with open(_JURISDICTION_MAP_PATH, encoding="utf-8") as fh:
                _JURISDICTION_MAP = json.load(fh)
        else:
            _JURISDICTION_MAP = {}
    return _JURISDICTION_MAP


def resolve_authority(
    road_type: str,
    district: str,
    state: str,
) -> Optional[AuthorityInfo]:
    jurisdiction_map = load_jurisdiction_map()

    state_data = jurisdiction_map.get(state, {})
    if not state_data:
        state_lower = state.strip().lower()
        for key in jurisdiction_map:
            if key.lower() == state_lower:
                state_data = jurisdiction_map[key]
                break

    district_data = state_data.get(district, {})
    if not district_data:
        district_lower = district.strip().lower()
        for key in state_data:
            if key.lower() == district_lower:
                district_data = state_data[key]
                break

    authority_data = district_data.get(road_type)
    if not authority_data:
        road_type_upper = road_type.strip().upper()
        for key in district_data:
            if key.upper() == road_type_upper:
                authority_data = district_data[key]
                break

    if not authority_data:
        return None
    return AuthorityInfo(**authority_data)


async def get_road_type_from_db(
    db: AsyncSession,
    road_id: Optional[uuid.UUID],
) -> Optional[str]:
    if road_id is None:
        return None
    result = await db.execute(select(Road).where(Road.id == road_id))
    road = result.scalar_one_or_none()
    return road.type if road else None
