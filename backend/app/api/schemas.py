"""
Pydantic schemas for RoadWatch API request and response validation.
"""
from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Shared / primitive schemas
# ---------------------------------------------------------------------------

class AuthorityInfo(BaseModel):
    """Details of the authority responsible for a road / complaint."""
    authority_name: str
    designation: str
    email: str
    phone: str
    complaint_portal: Optional[str] = None
    escalation: Optional[str] = None


# ---------------------------------------------------------------------------
# Road schemas
# ---------------------------------------------------------------------------

class RepairEvent(BaseModel):
    """A single entry in a road's maintenance / repair history."""
    date: str
    event: str
    severity: str  # "high" | "medium" | "low"


class RoadSummary(BaseModel):
    """Lightweight road record returned in the list endpoint."""
    id: str
    name: str
    type: str
    jurisdiction_name: Optional[str] = None
    contractor_name: Optional[str] = None
    relay_date: Optional[str] = None
    budget_sanctioned: Optional[Decimal] = None
    budget_spent: Optional[Decimal] = None
    source_url: Optional[str] = None
    # Extra fields that come from roads_mock.json when the DB record is thin
    segment: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    flag: Optional[str] = None

    class Config:
        from_attributes = True


class RoadDetail(RoadSummary):
    """Full road record including maintenance history and budget breakdown."""
    length_km: Optional[float] = None
    budget_utilised_pct: Optional[float] = None
    next_due_date: Optional[str] = None
    source_docs: Optional[str] = None
    accident_count: Optional[int] = None
    accident_source: Optional[str] = None
    repair_history: list[RepairEvent] = Field(default_factory=list)
    open_complaints: int = 0
    routed_authority: Optional[AuthorityInfo] = None


class RoadListResponse(BaseModel):
    total: int
    roads: list[RoadSummary]


# ---------------------------------------------------------------------------
# Complaint schemas
# ---------------------------------------------------------------------------

class ComplaintCreateRequest(BaseModel):
    """Payload for POST /api/complaints/."""
    road_id: Optional[uuid.UUID] = Field(
        None, description="UUID of the associated road (optional)"
    )
    lat: float = Field(..., ge=-90, le=90, description="Latitude of the issue")
    lng: float = Field(..., ge=-180, le=180, description="Longitude of the issue")
    issue_type: str = Field(..., min_length=2, max_length=100)
    district: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    country: str = Field(default="India", max_length=100)
    # Road type hint used for jurisdiction resolution when road_id is absent
    road_type: Optional[str] = Field(
        None,
        description="Road type (NH/SH/MDR/ODR/VR/Urban) used for routing when road_id is not provided",
    )

    @field_validator("issue_type")
    @classmethod
    def strip_issue_type(cls, v: str) -> str:
        return v.strip()


class ComplaintCreateResponse(BaseModel):
    """Response returned after a complaint is successfully created."""
    complaint_id: str = Field(
        ..., description="Human-readable complaint ID, e.g. RW-A3F2"
    )
    status: str
    routed_authority: AuthorityInfo
    message: str


class ComplaintStatusResponse(BaseModel):
    """Response for GET /api/complaints/{complaint_id}."""
    complaint_id: str
    status: str
    issue_type: str
    submitted_at: datetime
    road_id: Optional[str] = None
    routed_authority: Optional[AuthorityInfo] = None
