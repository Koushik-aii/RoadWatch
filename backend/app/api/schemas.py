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


class SourceVerification(BaseModel):
    source_name: str
    source_url: Optional[str] = None
    retrieval_date: Optional[str] = None
    confidence_level: str

class ContractorInfo(BaseModel):
    name: str
    agency: Optional[str] = None
    contract_value: Optional[Decimal] = None
    completion_date: Optional[str] = None
    maintenance_warranty_years: Optional[int] = None
    complaint_count: int = 0
    roads_handled: int = 0
    repeat_failure_flag: bool = False

class RoadDetail(RoadSummary):
    """Full road record including maintenance history and budget breakdown."""
    length_km: Optional[float] = None
    budget_released: Optional[Decimal] = None
    budget_utilised_pct: Optional[float] = None
    budget_anomalies: list[str] = Field(default_factory=list)
    funding_agency: Optional[str] = None
    source_document_id: Optional[str] = None
    budget_last_updated: Optional[str] = None
    next_due_date: Optional[str] = None
    source_docs: Optional[str] = None
    accident_count: Optional[int] = None
    accident_source: Optional[str] = None
    accident_severity_score: Optional[float] = None
    hotspot_ranking: Optional[int] = None
    accident_trend: Optional[str] = None
    risk_classification: Optional[str] = None
    repair_history: list[RepairEvent] = Field(default_factory=list)
    open_complaints: int = 0
    routed_authority: Optional[AuthorityInfo] = None
    contractor: Optional[ContractorInfo] = None
    verification: Optional[SourceVerification] = None


class RoadListResponse(BaseModel):
    total: int
    roads: list[RoadSummary]


class RoadSearchResult(BaseModel):
    """A single fuzzy search result with confidence score."""
    confidence_score: float
    is_exact_match: bool
    road: RoadDetail


class RoadSearchResponse(BaseModel):
    """Response for GET /api/roads/search"""
    results: list[RoadSearchResult]
    exact_match: bool
    confidence_score: float


# ---------------------------------------------------------------------------
# Complaint schemas
# ---------------------------------------------------------------------------

class ComplaintCreateRequest(BaseModel):
    """Payload for POST /api/complaints/ (JSON). Supports legacy + new fields."""
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    road_id: Optional[uuid.UUID] = None
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    issue_type: Optional[str] = Field(None, min_length=2, max_length=100)
    district: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    country: str = Field(max_length=100)
    road_type: Optional[str] = None
    severity: Optional[str] = Field(
        None, description="Low / Medium / High / Critical"
    )

    @field_validator("issue_type", "title", "description", mode="before")
    @classmethod
    def strip_strings(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v

    def resolved_title(self) -> str:
        return (self.title or self.issue_type or "Road issue").strip()

    def resolved_description(self) -> str:
        return (self.description or self.issue_type or self.resolved_title()).strip()


class ComplaintUpdateRequest(BaseModel):
    """Payload for PATCH /api/complaints/{complaint_id}."""
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[str] = Field(
        None, description="Pending / Under Review / Routed / Resolved"
    )
    severity: Optional[str] = None
    assigned_department: Optional[str] = Field(None, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    resolution_notes: Optional[str] = Field(None, max_length=5000)


class ComplaintResponse(BaseModel):
    """Full complaint record for API responses."""
    complaint_id: str
    uuid: str
    title: str
    description: Optional[str] = None
    issue: str
    latitude: float
    longitude: float
    image_url: Optional[str] = None
    severity: str
    status: str
    stage: int = Field(description="Frontend stage: 0=Filed, 1=Under Review, 2=Resolved")
    assigned_department: Optional[str] = None
    authority_email: Optional[str] = None
    escalation: Optional[str] = None
    
    # Optional Authority fields for display
    authority_name: Optional[str] = None
    authority_designation: Optional[str] = None
    authority_phone: Optional[str] = None
    
    verification: Optional[SourceVerification] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    road_type: Optional[str] = None
    road_id: Optional[str] = None
    issue_type: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    filedDate: str
    daysElapsed: int = 0
    expectedDays: int = 21
    overdue: bool = False
    routed_authority: Optional[AuthorityInfo] = None
    sla_deadline: Optional[datetime] = None
    is_escalated: bool = False
    resolution_notes: Optional[str] = None

    class Config:
        from_attributes = True


class ComplaintListResponse(BaseModel):
    """Paginated complaint list."""
    total: int
    page: int
    page_size: int
    pages: int
    items: list[ComplaintResponse]


class ComplaintCreateResponse(BaseModel):
    """Response returned after a complaint is successfully created."""
    complaint_id: str
    status: str
    routed_authority: AuthorityInfo
    message: str
    complaint: Optional[ComplaintResponse] = None


class ComplaintStatusResponse(BaseModel):
    """Legacy-compatible status response for GET /api/complaints/{complaint_id}."""
    complaint_id: str
    status: str
    issue_type: str
    submitted_at: datetime
    road_id: Optional[str] = None
    routed_authority: Optional[AuthorityInfo] = None
    complaint: Optional[ComplaintResponse] = None


# ---------------------------------------------------------------------------
# Detection schemas
# ---------------------------------------------------------------------------

class DetectionItem(BaseModel):
    """A single AI detection result."""
    damage_type: str = Field(default="Pothole", description="Type of road damage detected")
    confidence: float = Field(..., ge=0.0, le=1.0, description="AI confidence score")
    bbox: list[float] = Field(default_factory=list, description="Bounding box [x1, y1, x2, y2]")
    area_percentage: float = Field(default=0.0, description="Percentage of image area occupied")
    risk_score: float = Field(default=0.0, description="Composite risk score 0.0-1.0")
    severity: str = Field(default="Low", description="Low / Medium / High / Critical")
    repair_priority: str = Field(default="Routine", description="Emergency / Urgent / Elevated / Routine")
    repair_timeframe: str = Field(default="7 Days", description="Immediate / 24 Hours / 3 Days / 7 Days")
    explanation: str = Field(default="", description="Human-readable AI explanation")


class RoadDamageResponse(BaseModel):
    """Response from POST /api/detect-road-damage."""
    detection_id: str = Field(..., description="UUID of the stored detection record")
    detections: list[DetectionItem] = Field(default_factory=list)
    detection_count: int = 0
    overall_risk_score: float = Field(default=0.0, description="Worst-case risk score")
    overall_severity: str = Field(default="Safe", description="Safe / Low / Medium / High / Critical")
    image_url: str = Field(default="", description="URL to the original uploaded image")
    result_image_url: str = Field(default="", description="URL to the annotated result image")
    message: str = ""


class CreateComplaintFromDetection(BaseModel):
    """Request body to create a complaint from an AI detection."""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    district: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    country: str = Field(max_length=100)
    road_type: Optional[str] = Field(
        None,
        description="Road type (NH/SH/MDR/ODR/VR/Urban) for jurisdiction routing",
    )


class DetectionListItem(BaseModel):
    """Summary of a detection for listing."""
    id: str
    damage_type: str
    confidence: float
    severity: str
    risk_score: float
    repair_priority: str
    detection_count: int = 0
    overall_severity: str = "Safe"
    image_url: str = ""
    result_image_url: str = ""
    has_complaint: bool = False
    complaint_id: Optional[str] = None
    created_at: datetime


class DetectionListResponse(BaseModel):
    """Paginated list of detections."""
    total: int
    detections: list[DetectionListItem]


# ---------------------------------------------------------------------------
# Admin & Jurisdiction schemas
# ---------------------------------------------------------------------------

class OfficerZoneCreate(BaseModel):
    officer_id: str
    district: str
    state: str
    road_types: Optional[str] = None


class OfficerZoneResponse(BaseModel):
    id: str
    officer_id: str
    district: str
    state: str
    road_types: Optional[str] = None

    class Config:
        from_attributes = True


class JurisdictionCreate(BaseModel):
    name: str
    level: str  # Country, State, District, Local
    parent_id: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class JurisdictionUpdate(BaseModel):
    name: Optional[str] = None
    level: Optional[str] = None
    parent_id: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class JurisdictionResponse(BaseModel):
    id: str
    name: str
    level: str
    parent_id: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

    class Config:
        from_attributes = True

