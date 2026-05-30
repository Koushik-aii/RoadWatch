"""
Complaints API router for RoadWatch.

Endpoints
---------
POST /api/complaints/
    Submit a new road complaint.
    - Accepts: road_id (optional UUID), lat, lng, issue_type, district, state, country,
               road_type (optional, for jurisdiction routing when road_id is absent).
    - Resolves the responsible Executive Engineer from backend/data/jurisdiction_map.json
      using the road's type (from DB or from request body) + district + state.
    - Persists the complaint in the DB.
    - Returns: complaint_id (RW-XXXX), status, routed authority details.

GET /api/complaints/{complaint_id}
    Fetch the status and routing details of an existing complaint.
    The {complaint_id} accepts:
        - A human-readable RW-XXXX code (matched via UUID suffix), OR
        - A full UUID string.
"""

from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Complaint, ComplaintStatus, Road
from .schemas import (
    AuthorityInfo,
    ComplaintCreateRequest,
    ComplaintCreateResponse,
    ComplaintStatusResponse,
)

# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------
router = APIRouter(prefix="/api/complaints", tags=["complaints"])

# ---------------------------------------------------------------------------
# Jurisdiction map — loaded once at import time
# ---------------------------------------------------------------------------
_JURISDICTION_MAP_PATH = (
    Path(__file__).parent.parent.parent / "data" / "jurisdiction_map.json"
)


def _load_jurisdiction_map() -> dict:
    if _JURISDICTION_MAP_PATH.exists():
        with open(_JURISDICTION_MAP_PATH, "r", encoding="utf-8") as fh:
            return json.load(fh)
    return {}


_JURISDICTION_MAP: dict = _load_jurisdiction_map()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_complaint_number(complaint_uuid: uuid.UUID) -> str:
    """
    Derive a short, human-readable complaint reference from a UUID.
    Uses the last 4 hex characters of the UUID to keep it compact.
    Example: UUID ending in '…a3f2' → 'RW-A3F2'
    """
    hex_str = complaint_uuid.hex[-4:].upper()
    return f"RW-{hex_str}"


def _resolve_authority(
    road_type: str,
    district: str,
    state: str,
) -> Optional[AuthorityInfo]:
    """
    Look up the responsible authority in the jurisdiction map.

    Resolution order:
      1. Exact state → district → road_type match.
      2. Case-insensitive state match → exact district → road_type.
      3. Returns None if no match found.
    """
    # Attempt exact match first
    state_data = _JURISDICTION_MAP.get(state, {})
    if not state_data:
        # Case-insensitive state search
        state_lower = state.strip().lower()
        for key in _JURISDICTION_MAP:
            if key.lower() == state_lower:
                state_data = _JURISDICTION_MAP[key]
                break

    district_data = state_data.get(district, {})
    if not district_data:
        # Case-insensitive district search
        district_lower = district.strip().lower()
        for key in state_data:
            if key.lower() == district_lower:
                district_data = state_data[key]
                break

    authority_data = district_data.get(road_type)
    if not authority_data:
        # Try road type case-insensitive
        road_type_upper = road_type.strip().upper()
        for key in district_data:
            if key.upper() == road_type_upper:
                authority_data = district_data[key]
                break

    if not authority_data:
        return None
    return AuthorityInfo(**authority_data)


def _get_road_type_from_db(
    db: Session,
    road_id: Optional[uuid.UUID],
) -> Optional[str]:
    """Fetch the road type from DB given a road UUID. Returns None if not found."""
    if road_id is None:
        return None
    road: Optional[Road] = db.query(Road).filter(Road.id == road_id).first()
    return road.type if road else None


def _find_complaint_by_rw_id(
    db: Session,
    rw_id: str,
) -> Optional[Complaint]:
    """
    Locate a Complaint whose UUID hex ends with the 4-character suffix
    encoded in a RW-XXXX complaint number.
    """
    suffix = rw_id.replace("RW-", "").lower()
    # Retrieve all complaints and filter in Python (acceptable; complaints are sparse)
    all_complaints: list[Complaint] = db.query(Complaint).all()
    for c in all_complaints:
        if c.id.hex[-4:].lower() == suffix:
            return c
    return None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post(
    "/",
    response_model=ComplaintCreateResponse,
    status_code=201,
    summary="Submit a road complaint",
)
def create_complaint(
    body: ComplaintCreateRequest,
    db: Session = Depends(get_db),
):
    """
    Submit a new road complaint.

    The endpoint:
    1. Resolves the road type (from DB road record if road_id provided, otherwise
       from the `road_type` field in the request body).
    2. Looks up the responsible Executive Engineer using the jurisdiction map.
    3. Stores the complaint in the database.
    4. Returns the generated complaint ID (RW-XXXX format) and authority details.
    """
    # --- Resolve road type for jurisdiction routing ---
    road_type: Optional[str] = None

    if body.road_id:
        road_type = _get_road_type_from_db(db, body.road_id)
        if road_type is None:
            raise HTTPException(
                status_code=404,
                detail=f"Road with id '{body.road_id}' not found.",
            )

    road_type = road_type or body.road_type

    if not road_type:
        raise HTTPException(
            status_code=422,
            detail=(
                "Cannot determine road type. "
                "Provide a valid 'road_id' or set 'road_type' (e.g. NH, SH, MDR, ODR, VR, Urban)."
            ),
        )

    # --- Resolve authority from jurisdiction map ---
    authority = _resolve_authority(road_type, body.district, body.state)
    if authority is None:
        raise HTTPException(
            status_code=422,
            detail=(
                f"No authority mapping found for state='{body.state}', "
                f"district='{body.district}', road_type='{road_type}'. "
                "Please verify the jurisdiction details."
            ),
        )

    # --- Build geometry point ---
    point = from_shape(Point(body.lng, body.lat), srid=4326)

    # --- Persist complaint ---
    complaint = Complaint(
        road_id=body.road_id,
        location=point,
        issue_type=body.issue_type,
        status=ComplaintStatus.ROUTED,
        # assigned_jurisdiction_id could be set if we store authority in DB;
        # left None here as the jurisdiction_map is the source of truth.
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    complaint_number = _make_complaint_number(complaint.id)

    return ComplaintCreateResponse(
        complaint_id=complaint_number,
        status=ComplaintStatus.ROUTED.value,
        routed_authority=authority,
        message=(
            f"Your complaint {complaint_number} has been successfully submitted and "
            f"routed to {authority.authority_name}."
        ),
    )


@router.get(
    "/{complaint_id}",
    response_model=ComplaintStatusResponse,
    summary="Get complaint status",
)
def get_complaint_status(
    complaint_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve the current status and routing details for a complaint.

    Accepts either:
    - A human-readable RW-XXXX code (e.g. ``RW-A3F2``).
    - A full UUID string (e.g. ``3fa85f64-5717-4562-b3fc-2c963f66afa6``).
    """
    complaint: Optional[Complaint] = None

    if complaint_id.upper().startswith("RW-"):
        complaint = _find_complaint_by_rw_id(db, complaint_id.upper())
    else:
        # Try to parse as UUID
        try:
            uid = uuid.UUID(complaint_id)
            complaint = db.query(Complaint).filter(Complaint.id == uid).first()
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Invalid complaint ID '{complaint_id}'. "
                    "Expected format: RW-XXXX or a valid UUID."
                ),
            )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail=f"Complaint '{complaint_id}' not found.",
        )

    complaint_number = _make_complaint_number(complaint.id)

    # Attempt to resolve authority details from the associated road
    authority: Optional[AuthorityInfo] = None
    road: Optional[Road] = (
        db.query(Road).filter(Road.id == complaint.road_id).first()
        if complaint.road_id
        else None
    )
    if road and road.jurisdiction:
        authority = _resolve_authority(
            road.type,
            road.jurisdiction.name,
            # State-level parent name; jurisdiction hierarchy may differ per deployment
            road.jurisdiction.parent.name if road.jurisdiction.parent else road.jurisdiction.name,
        )

    return ComplaintStatusResponse(
        complaint_id=complaint_number,
        status=complaint.status.value,
        issue_type=complaint.issue_type,
        submitted_at=complaint.created_at,
        road_id=str(complaint.road_id) if complaint.road_id else None,
        routed_authority=authority,
    )
