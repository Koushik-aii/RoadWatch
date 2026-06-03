"""SQLAlchemy ORM models."""
from __future__ import annotations

import datetime
import enum
import uuid

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .database import Base


class UserRole(str, enum.Enum):
    CITIZEN = "Citizen"
    OFFICER = "Road Authority Officer"
    ADMIN = "Admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CITIZEN, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    officer_zones = relationship("OfficerZone", back_populates="officer", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="reporter")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="refresh_tokens")


class OfficerZone(Base):
    """Districts/states an officer is responsible for."""

    __tablename__ = "officer_zones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    officer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    road_types = Column(String(255), nullable=True)  # comma-separated NH,SH,MDR

    officer = relationship("User", back_populates="officer_zones")


class JurisdictionLevel(str, enum.Enum):
    COUNTRY = "Country"
    STATE = "State"
    DISTRICT = "District"
    LOCAL = "Local"


class Jurisdiction(Base):
    __tablename__ = "jurisdictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    level = Column(Enum(JurisdictionLevel), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("jurisdictions.id"), nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    boundary = Column(Text, nullable=True)

    parent = relationship("Jurisdiction", remote_side=[id])
    roads = relationship("Road", back_populates="jurisdiction")


class Road(Base):
    __tablename__ = "roads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    jurisdiction_id = Column(UUID(as_uuid=True), ForeignKey("jurisdictions.id"))
    geometry = Column(Text, nullable=True)
    relay_date = Column(Date, nullable=True)
    budget_sanctioned = Column(Numeric(12, 2), nullable=True)
    budget_released = Column(Numeric(12, 2), nullable=True)
    budget_spent = Column(Numeric(12, 2), nullable=True)
    funding_agency = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    source_document_id = Column(String, nullable=True)
    budget_last_updated = Column(Date, nullable=True)
    contractor_name = Column(String, nullable=True)
    contractor_agency = Column(String, nullable=True)
    contract_value = Column(Numeric(12, 2), nullable=True)
    completion_date = Column(Date, nullable=True)
    maintenance_warranty_years = Column(Integer, nullable=True)
    
    # Source Verification
    source_name = Column(String, nullable=True)
    source_retrieval_date = Column(Date, nullable=True)
    source_confidence = Column(String, nullable=True)

    jurisdiction = relationship("Jurisdiction", back_populates="roads")
    complaints = relationship("Complaint", back_populates="road")


class ComplaintStatus(str, enum.Enum):
    PENDING = "Pending"
    UNDER_REVIEW = "Under Review"
    ROUTED = "Routed"  # legacy alias for Under Review
    RESOLVED = "Resolved"


class SeverityLevel(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    complaint_number = Column(String(16), unique=True, index=True, nullable=False)

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location = Column(Text, nullable=True)

    image_path = Column(String(512), nullable=True)
    severity = Column(Enum(SeverityLevel), default=SeverityLevel.MEDIUM, nullable=False)
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.PENDING, nullable=False)

    assigned_department = Column(String(255), nullable=True)
    authority_email = Column(String(255), nullable=True)
    escalation_contact = Column(String(255), nullable=True)

    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    road_type = Column(String(32), nullable=True)

    road_id = Column(UUID(as_uuid=True), ForeignKey("roads.id"), nullable=True)
    assigned_jurisdiction_id = Column(
        UUID(as_uuid=True), ForeignKey("jurisdictions.id"), nullable=True
    )

    issue_type = Column(String(100), nullable=True)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)

    sla_deadline = Column(DateTime(timezone=True), nullable=True)
    is_escalated = Column(Boolean, default=False, nullable=False)
    resolution_notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    
    # New Fields for Authority Details
    authority_name = Column(String(255), nullable=True)
    authority_designation = Column(String(255), nullable=True)
    authority_phone = Column(String(50), nullable=True)

    # Source Verification
    source_name = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    source_retrieval_date = Column(Date, nullable=True)
    source_confidence = Column(String, nullable=True)

    road = relationship("Road", back_populates="complaints")
    assigned_jurisdiction = relationship("Jurisdiction")
    reporter = relationship("User", back_populates="complaints")
    detections = relationship("RoadDamageDetection", back_populates="complaint")
    routing_history = relationship("ComplaintRoutingHistory", back_populates="complaint", cascade="all, delete-orphan")


class ComplaintRoutingHistory(Base):
    __tablename__ = "complaint_routing_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    complaint_id = Column(UUID(as_uuid=True), ForeignKey("complaints.id"), nullable=False)
    routed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    authority_name = Column(String(255), nullable=True)
    designation = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)

    complaint = relationship("Complaint", back_populates="routing_history")


class RoadDamageDetection(Base):
    __tablename__ = "road_damage_detections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    image_path = Column(String, nullable=False)
    result_image_path = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    damage_type = Column(String, nullable=False, default="Pothole")
    confidence = Column(Float, nullable=False)
    severity = Column(Enum(SeverityLevel), nullable=True)
    risk_score = Column(Float, nullable=True)
    repair_priority = Column(String, nullable=True)
    explanation = Column(String, nullable=True)
    bbox_json = Column(String, nullable=True)
    detections_json = Column(String, nullable=True)
    detection_count = Column(Integer, default=0)
    complaint_id = Column(UUID(as_uuid=True), ForeignKey("complaints.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaint = relationship("Complaint", back_populates="detections")
