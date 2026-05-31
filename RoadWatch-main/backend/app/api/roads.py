"""
Roads API router for RoadWatch.

Endpoints
---------
GET /api/roads/
    Return a paginated list of roads with optional filters:
        ?type=NH        — filter by road type (NH/SH/MDR/ODR/VR/Urban)
        ?state=Andhra Pradesh — filter roads whose jurisdiction has this state name (matched
                          against the road name / mock data; DB jurisdictions store names)
        ?search=NH-65   — substring search on road name

GET /api/roads/{road_id}
    Return full road details including maintenance history and budget breakdown.
    The UUID-based {road_id} path parameter accepts either the DB UUID or
    the short mock ID (e.g. "NH-65") for development convenience.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Road, Complaint, Jurisdiction, ComplaintStatus
from .schemas import (
    AuthorityInfo,
    RepairEvent,
    RoadDetail,
    RoadListResponse,
    RoadSummary,
)

# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------
router = APIRouter(prefix="/api/roads", tags=["roads"])

# ---------------------------------------------------------------------------
# Mock data cache — loaded once at import time
# ---------------------------------------------------------------------------
_MOCK_DATA_PATH = Path(__file__).parent.parent.parent / "data" / "roads_mock.json"
_JURISDICTION_MAP_PATH = Path(__file__).parent.parent.parent / "data" / "jurisdiction_map.json"


def _load_mock_roads() -> list[dict]:
    """Load roads_mock.json and return as a list of dicts."""
    if _MOCK_DATA_PATH.exists():
        with open(_MOCK_DATA_PATH, "r", encoding="utf-8") as fh:
            return json.load(fh)
    return []


def _load_jurisdiction_map() -> dict:
    if _JURISDICTION_MAP_PATH.exists():
        with open(_JURISDICTION_MAP_PATH, "r", encoding="utf-8") as fh:
            return json.load(fh)
    return {}


_MOCK_ROADS: list[dict] = _load_mock_roads()
_JURISDICTION_MAP: dict = _load_jurisdiction_map()

# Build a lookup by mock road ID for O(1) access
_MOCK_BY_ID: dict[str, dict] = {r["id"]: r for r in _MOCK_ROADS}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _mock_to_summary(m: dict) -> RoadSummary:
    """Convert a roads_mock.json entry to a RoadSummary schema."""
    return RoadSummary(
        id=m["id"],
        name=m["name"],
        type=m["type"],
        jurisdiction_name=m.get("district"),
        contractor_name=m.get("contractor", {}).get("name"),
        relay_date=m.get("lastRelayDate"),
        budget_sanctioned=Decimal(str(m["sanctioned_cr"])) if m.get("sanctioned_cr") is not None else None,
        budget_spent=Decimal(str(m["disbursed_cr"])) if m.get("disbursed_cr") is not None else None,
        source_url=m.get("sourceUrl"),
        segment=m.get("segment"),
        district=m.get("district"),
        state=m.get("state"),
        flag=m.get("flag"),
    )


def _db_road_to_summary(road: Road) -> RoadSummary:
    """Convert a SQLAlchemy Road ORM instance to a RoadSummary schema."""
    jname: Optional[str] = None
    if road.jurisdiction:
        jname = road.jurisdiction.name

    return RoadSummary(
        id=str(road.id),
        name=road.name,
        type=road.type,
        jurisdiction_name=jname,
        contractor_name=road.contractor_name,
        relay_date=str(road.relay_date) if road.relay_date else None,
        budget_sanctioned=road.budget_sanctioned,
        budget_spent=road.budget_spent,
        source_url=road.source_url,
    )


def _resolve_authority(road_type: str, district: str, state: str) -> Optional[AuthorityInfo]:
    """Look up the responsible authority in the jurisdiction map."""
    state_data = _JURISDICTION_MAP.get(state, {})
    district_data = state_data.get(district, {})
    authority_data = district_data.get(road_type)
    if not authority_data:
        return None
    return AuthorityInfo(**authority_data)


def _enrich_with_mock(summary: RoadSummary, mock: dict) -> RoadDetail:
    """Merge a DB-sourced RoadSummary with a mock-data record into a RoadDetail."""
    repair_history = [
        RepairEvent(date=r["date"], event=r["event"], severity=r["severity"])
        for r in mock.get("repairHistory", [])
    ]
    budget_sanctioned = summary.budget_sanctioned or (
        Decimal(str(mock["sanctioned_cr"])) if mock.get("sanctioned_cr") is not None else None
    )
    budget_spent = summary.budget_spent or (
        Decimal(str(mock["disbursed_cr"])) if mock.get("disbursed_cr") is not None else None
    )
    return RoadDetail(
        **summary.model_dump(),
        budget_sanctioned=budget_sanctioned,
        budget_spent=budget_spent,
        length_km=mock.get("length_km"),
        budget_utilised_pct=mock.get("utilised_pct"),
        next_due_date=mock.get("nextDueDate"),
        source_docs=mock.get("sourceDocs"),
        accident_count=mock.get("accidentCount"),
        accident_source=mock.get("accidentSource"),
        repair_history=repair_history,
        district=mock.get("district") or summary.district,
        state=mock.get("state") or summary.state,
        segment=mock.get("segment") or summary.segment,
        flag=mock.get("flag") or summary.flag,
        contractor_name=summary.contractor_name or mock.get("contractor", {}).get("name"),
        source_url=summary.source_url or mock.get("sourceUrl"),
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/", response_model=RoadListResponse, summary="List all roads")
async def get_roads(
    db: AsyncSession = Depends(get_db),
    road_type: Optional[str] = Query(
        None,
        alias="type",
        description="Filter by road type: NH, SH, MDR, ODR, VR, Urban",
    ),
    state: Optional[str] = Query(None, description="Filter by state name"),
    search: Optional[str] = Query(None, description="Substring search on road name"),
):
    """
    Return a list of roads from the database enriched with mock-data fields.

    Falls back to serving the entire mock dataset if the DB is empty (useful
    during development before data is seeded).
    """
    query = select(Road)
    if road_type:
        query = query.where(Road.type == road_type)
    if search:
        query = query.where(Road.name.ilike(f"%{search}%"))
    if state:
        query = query.join(
            Jurisdiction, Road.jurisdiction_id == Jurisdiction.id, isouter=True
        ).where(Jurisdiction.name.ilike(f"%{state}%"))

    result = await db.execute(query)
    db_roads: list[Road] = list(result.scalars().all())

    # --- Build summaries from DB rows ---
    summaries: list[RoadSummary] = []
    for road in db_roads:
        summary = _db_road_to_summary(road)
        # Try to enrich from mock data using road name as key
        mock = _MOCK_BY_ID.get(road.name)
        if mock:
            # Apply mock extras to the summary (non-detail fields only)
            summary.district = summary.district or mock.get("district")
            summary.state = summary.state or mock.get("state")
            summary.segment = mock.get("segment")
            summary.flag = mock.get("flag")
            if not summary.relay_date:
                summary.relay_date = mock.get("lastRelayDate")
            if not summary.budget_sanctioned and mock.get("sanctioned_cr") is not None:
                summary.budget_sanctioned = Decimal(str(mock["sanctioned_cr"]))
            if not summary.budget_spent and mock.get("disbursed_cr") is not None:
                summary.budget_spent = Decimal(str(mock["disbursed_cr"]))
        summaries.append(summary)

    # --- Fallback: serve mock data when the DB is empty ---
    if not summaries:
        mock_roads = _MOCK_ROADS

        # Apply client-side filters to the mock data
        if road_type:
            mock_roads = [r for r in mock_roads if r.get("type", "").upper() == road_type.upper()]
        if state:
            mock_roads = [
                r for r in mock_roads
                if state.lower() in r.get("state", "").lower()
            ]
        if search:
            mock_roads = [
                r for r in mock_roads
                if search.lower() in r.get("name", "").lower()
            ]

        summaries = [_mock_to_summary(m) for m in mock_roads]

    return RoadListResponse(total=len(summaries), roads=summaries)


@router.get("/{road_id}", response_model=RoadDetail, summary="Get road details")
async def get_road_details(road_id: str, db: AsyncSession = Depends(get_db)):
    """
    Return full details for a single road, including:
    - Contractor and budget breakdown
    - Maintenance / repair history
    - Open complaint count
    - Responsible authority derived from jurisdiction map
    """
    import uuid as _uuid

    db_road: Optional[Road] = None

    # Try to parse as UUID first
    try:
        uid = _uuid.UUID(road_id)
        road_result = await db.execute(select(Road).where(Road.id == uid))
        db_road = road_result.scalar_one_or_none()
    except ValueError:
        road_result = await db.execute(select(Road).where(Road.name == road_id))
        db_road = road_result.scalar_one_or_none()

    if db_road:
        summary = _db_road_to_summary(db_road)
        mock = _MOCK_BY_ID.get(db_road.name)

        count_result = await db.execute(
            select(func.count())
            .select_from(Complaint)
            .where(
                Complaint.road_id == db_road.id,
                Complaint.status != ComplaintStatus.RESOLVED,
            )
        )
        open_complaints = count_result.scalar() or 0

        if mock:
            detail = _enrich_with_mock(summary, mock)
        else:
            detail = RoadDetail(**summary.model_dump())

        detail.open_complaints = open_complaints

        # Resolve authority from jurisdiction map
        district = detail.district or (
            db_road.jurisdiction.name if db_road.jurisdiction else None
        )
        state = detail.state
        if district and state:
            detail.routed_authority = _resolve_authority(db_road.type, district, state)

        return detail

    # --- Fallback: serve from mock data ---
    mock = _MOCK_BY_ID.get(road_id)
    if not mock:
        raise HTTPException(status_code=404, detail=f"Road '{road_id}' not found.")

    summary = _mock_to_summary(mock)
    detail = _enrich_with_mock(summary, mock)

    # Resolve authority
    district = mock.get("district")
    state = mock.get("state")
    if district and state:
        detail.routed_authority = _resolve_authority(mock["type"], district, state)

    return detail
