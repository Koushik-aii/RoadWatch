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

from rapidfuzz import process, fuzz, utils

from ..services.accident_analytics import calculate_accident_analytics
from ..utils.normalization import normalize_text, extract_filters_from_query
from ..database import get_db
from ..models import Road, Complaint, Jurisdiction, ComplaintStatus
from .schemas import (
    AuthorityInfo,
    RepairEvent,
    RoadDetail,
    RoadListResponse,
    RoadSummary,
    RoadSearchResponse,
    RoadSearchResult,
    ContractorInfo,
    SourceVerification
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


from datetime import datetime

async def _build_road_detail(summary: RoadSummary, mock: Optional[dict] = None, db_road: Optional[Road] = None, db: Optional[AsyncSession] = None) -> RoadDetail:
    """Build RoadDetail from DB and mock data, calculating anomalies and contractor metrics."""
    mock = mock or {}
    repair_history = [
        RepairEvent(date=r["date"], event=r["event"], severity=r["severity"])
        for r in mock.get("repairHistory", [])
    ]
    
    # Financial fields
    budget_sanctioned = summary.budget_sanctioned or (
        Decimal(str(mock["sanctioned_cr"])) if mock.get("sanctioned_cr") is not None else None
    )
    budget_spent = summary.budget_spent or (
        Decimal(str(mock["disbursed_cr"])) if mock.get("disbursed_cr") is not None else None
    )
    
    budget_released = None
    funding_agency = None
    source_document_id = None
    budget_last_updated = None
    
    if db_road:
        budget_released = db_road.budget_released
        funding_agency = db_road.funding_agency
        source_document_id = db_road.source_document_id
        budget_last_updated = str(db_road.budget_last_updated) if db_road.budget_last_updated else None

    # Calculate Utilization
    utilised_pct = mock.get("utilised_pct")
    if utilised_pct is None and budget_sanctioned and budget_spent and budget_sanctioned > 0:
        utilised_pct = float((budget_spent / budget_sanctioned) * 100)
        
    next_due_date = mock.get("nextDueDate")
    
    # Anomaly Detection
    anomalies = []
    if budget_spent and budget_sanctioned and budget_spent > budget_sanctioned:
        anomalies.append(f"Overspending detected (Spent: {budget_spent} Cr > Sanctioned: {budget_sanctioned} Cr)")
        
    if budget_sanctioned and budget_sanctioned > 0 and not repair_history:
        anomalies.append("Ghost Allocation: Budget allocated but no repairs recorded on ground.")
        
    if next_due_date:
        try:
            # Assuming format 'MMM YYYY' like 'Sep 2026' or 'YYYY-MM-DD'
            dt = None
            if len(next_due_date) == 8 or len(next_due_date) == 7:
                dt = datetime.strptime(next_due_date, "%b %Y")
            elif "-" in next_due_date:
                dt = datetime.strptime(next_due_date.split("T")[0], "%Y-%m-%d")
                
            if dt and (datetime.now() - dt).days > 180:
                anomalies.append(f"Delayed Maintenance: Over 6 months past due date ({next_due_date}).")
        except Exception:
            pass

    accident_count = mock.get("accidentCount") or 0
    length_km = mock.get("length_km") or 10.0
    rt = summary.type or "Unknown"
    analytics = calculate_accident_analytics(accident_count, length_km, rt)

    rd = RoadDetail(
        **summary.model_dump(exclude={'budget_sanctioned', 'budget_spent', 'budget_released', 'district', 'state', 'segment', 'flag', 'contractor_name', 'source_url'}),
        budget_sanctioned=budget_sanctioned,
        budget_spent=budget_spent,
        budget_released=budget_released,
        budget_utilised_pct=utilised_pct,
        budget_anomalies=anomalies,
        funding_agency=funding_agency,
        source_document_id=source_document_id,
        budget_last_updated=budget_last_updated,
        length_km=length_km,
        next_due_date=next_due_date,
        source_docs=mock.get("sourceDocs"),
        accident_count=accident_count,
        accident_source=analytics["accident_source"],
        accident_severity_score=analytics["accident_severity_score"],
        hotspot_ranking=analytics["hotspot_ranking"],
        accident_trend=analytics["accident_trend"],
        risk_classification=analytics["risk_classification"],
        repair_history=repair_history,
        district=mock.get("district") or summary.district,
        state=mock.get("state") or summary.state,
        segment=mock.get("segment") or summary.segment,
        flag=mock.get("flag") or summary.flag,
        contractor_name=summary.contractor_name or mock.get("contractor", {}).get("name"),
        source_url=summary.source_url or mock.get("sourceUrl"),
    )

    contractor_name = rd.contractor_name
    if contractor_name:
        # Fallback to mock data if DB is not available or if the road lacks contractor agency
        c_agency = db_road.contractor_agency if db_road and db_road.contractor_agency else mock.get("contractor", {}).get("agency", "Local PWD")
        c_val = db_road.contract_value if db_road and db_road.contract_value else mock.get("contractor", {}).get("contract_value")
        c_date = db_road.completion_date if db_road and db_road.completion_date else mock.get("contractor", {}).get("completion_date")
        c_date_str = str(c_date) if c_date else None
        c_war = db_road.maintenance_warranty_years if db_road and db_road.maintenance_warranty_years else mock.get("contractor", {}).get("maintenance_warranty_years", 3)
        
        complaint_count = 0
        roads_handled = 0
        
        if db:
            # Query the database for contractor metrics
            from sqlalchemy import select, func
            from ..models import Complaint, Road
            
            roads_res = await db.execute(select(func.count(Road.id)).where(Road.contractor_name == contractor_name))
            roads_handled = roads_res.scalar() or 0
            
            comps_res = await db.execute(select(func.count(Complaint.id)).join(Road, Complaint.road_id == Road.id).where(Road.contractor_name == contractor_name))
            complaint_count = comps_res.scalar() or 0
            
        else:
            # Fallback mock calculations based on name
            roads_handled = 2 + (len(contractor_name) % 4)
            complaint_count = 1 + (len(contractor_name) % 6)

        rd.contractor = ContractorInfo(
            name=contractor_name,
            agency=c_agency,
            contract_value=c_val,
            completion_date=c_date_str,
            maintenance_warranty_years=c_war,
            complaint_count=complaint_count,
            roads_handled=roads_handled,
            repeat_failure_flag=complaint_count > 3
        )
        
    v_name = "MoRTH Open Data"
    v_url = "https://morth.nic.in/data"
    v_date = datetime.now().strftime("%Y-%m-%d")
    v_conf = "High"

    if db_road:
        if db_road.source_name: v_name = db_road.source_name
        if db_road.source_url: v_url = db_road.source_url
        if db_road.source_retrieval_date: v_date = str(db_road.source_retrieval_date)
        if db_road.source_confidence: v_conf = db_road.source_confidence
    elif mock.get("sourceName"):
        v_name = mock.get("sourceName")
        v_conf = "Verified"
        
    rd.verification = SourceVerification(
        source_name=v_name,
        source_url=v_url,
        retrieval_date=v_date,
        confidence_level=v_conf
    )

    return rd


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


@router.get("/search", response_model=RoadSearchResponse, summary="Fuzzy search roads")
async def search_roads(
    q: str = Query(..., description="Free text search query"),
    db: AsyncSession = Depends(get_db),
):
    """
    Perform a fuzzy search against all roads.
    Extracts implied filters (e.g., 'NH', 'Guntur') from the query.
    Returns a ranked list of best alternatives if no exact match is found.
    """
    # 1. Normalize query
    normalized_q = normalize_text(q)
    filters = extract_filters_from_query(normalized_q)

    # 2. Fetch candidates (currently fetching all roads for in-memory fuzzy search)
    # If the DB grows too large, apply filters in the DB query first.
    query_builder = select(Road)
    if filters.get("road_type"):
        query_builder = query_builder.where(Road.type == filters["road_type"])
        
    result = await db.execute(query_builder)
    db_roads: list[Road] = list(result.scalars().all())

    # Create details for all candidates (we need to return RoadDetail)
    candidates = []
    for road in db_roads:
        summary = _db_road_to_summary(road)
        mock = _MOCK_BY_ID.get(road.name)
        if mock:
            detail = await _build_road_detail(summary, mock=mock, db_road=road, db=db)
        else:
            detail = await _build_road_detail(summary, mock=None, db_road=road, db=db)

        # Resolve authority
        district = detail.district or (
            road.jurisdiction.name if road.jurisdiction else None
        )
        if district and detail.state:
            detail.routed_authority = _resolve_authority(road.type, district, detail.state)
            
        candidates.append(detail)

    if not candidates:
        # Fallback to mock data if DB empty
        mock_candidates = []
        for m in _MOCK_ROADS:
            if filters.get("road_type") and m.get("type", "").upper() != filters["road_type"].upper():
                continue
            summary = _mock_to_summary(m)
            detail = await _build_road_detail(summary, mock=m, db_road=None, db=db)
            dist = m.get("district")
            st = m.get("state")
            if dist and st:
                detail.routed_authority = _resolve_authority(m["type"], dist, st)
            mock_candidates.append(detail)
        candidates = mock_candidates

    if not candidates:
        return RoadSearchResponse(results=[], exact_match=False, confidence_score=0.0)

    # 3. Direct Discovery Bypass
    # If the user asks for roads in a city without a specific name (e.g. "roads in Vijayawada")
    # bypass fuzzy string matching and return top regional roads.
    is_discovery_only = filters.get("district_hint") and not filters.get("road_name_hint") and not filters.get("road_number")
    if is_discovery_only:
        district_roads = [r for r in candidates if (r.district or "").lower() == filters["district_hint"].lower()]
        if filters.get("road_type"):
            district_roads = [r for r in district_roads if r.type == filters["road_type"]]
            
        # Sort highways first
        district_roads.sort(key=lambda x: 0 if x.type in ["NH", "SH"] else 1)
        
        results = [
            RoadSearchResult(confidence_score=90.0, is_exact_match=False, road=r)
            for r in district_roads[:5]
        ]
        
        return RoadSearchResponse(
            results=results,
            exact_match=False, # We want to trigger RoadListCard, not RoadInfoCard
            confidence_score=90.0 if results else 0.0
        )

    # 3. Build search corpus
    # We create a mapping of index -> string to search against
    # Include name, district, state, segment
    search_corpus = {}
    for i, detail in enumerate(candidates):
        parts = [
            detail.name,
            detail.district or "",
            detail.state or "",
            detail.segment or "",
            detail.type or ""
        ]
        search_corpus[i] = " ".join(parts).lower()

    # 4. Perform fuzzy search
    # extract returns a list of tuples: (match_string, score, index)
    extracted = process.extract(
        normalized_q.lower(),
        search_corpus,
        scorer=fuzz.token_set_ratio,
        processor=utils.default_process,
        limit=5
    )

    results = []
    best_score = 0.0
    is_exact = False

    for match_str, score, idx in extracted:
        if score > best_score:
            best_score = score
        
        road_detail = candidates[idx]
        
        # Boost score if there's an exact substring match on name
        if normalized_q.lower() in road_detail.name.lower():
            score = min(100.0, score + 10.0)
            
        # Boost based on structured filters
        if filters.get("district_hint") and filters["district_hint"].lower() == (road_detail.district or "").lower():
            score = min(100.0, score + 15.0)
            
        if filters.get("road_name_hint") and filters["road_name_hint"].lower() in road_detail.name.lower():
            score = min(100.0, score + 20.0)
            
        if score > best_score:
            best_score = score
                
        # Consider it exact if > 85
        exact = score > 85.0
        if exact:
            is_exact = True
            
        if score > 40.0:  # Threshold for relevance
            results.append(
                RoadSearchResult(
                    confidence_score=score,
                    is_exact_match=exact,
                    road=road_detail
                )
            )

    # Sort results by confidence descending
    results.sort(key=lambda x: x.confidence_score, reverse=True)

    return RoadSearchResponse(
        results=results,
        exact_match=is_exact,
        confidence_score=best_score
    )


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
            detail = await _build_road_detail(summary, mock=mock, db_road=db_road, db=db)
        else:
            detail = await _build_road_detail(summary, mock=None, db_road=db_road, db=db)

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
    detail = await _build_road_detail(summary, mock=mock, db_road=None, db=db)

    # Resolve authority
    district = mock.get("district")
    state = mock.get("state")
    if district and state:
        detail.routed_authority = _resolve_authority(mock["type"], district, state)

    return detail
