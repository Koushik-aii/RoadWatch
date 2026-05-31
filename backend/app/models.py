from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Enum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
import uuid
import datetime
from .database import Base
import enum

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
    parent_id = Column(UUID(as_uuid=True), ForeignKey('jurisdictions.id'), nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    boundary = Column(Geometry('MULTIPOLYGON', srid=4326), nullable=True)

    parent = relationship("Jurisdiction", remote_side=[id])
    roads = relationship("Road", back_populates="jurisdiction")

class Road(Base):
    __tablename__ = "roads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # e.g., NH, SH, MDR, ODR, VR
    jurisdiction_id = Column(UUID(as_uuid=True), ForeignKey('jurisdictions.id'))
    geometry = Column(Geometry('LINESTRING', srid=4326), nullable=True)
    
    relay_date = Column(Date, nullable=True)
    budget_sanctioned = Column(Numeric(12, 2), nullable=True)
    budget_spent = Column(Numeric(12, 2), nullable=True)
    source_url = Column(String, nullable=True)
    contractor_name = Column(String, nullable=True)

    jurisdiction = relationship("Jurisdiction", back_populates="roads")
    complaints = relationship("Complaint", back_populates="road")

class ComplaintStatus(str, enum.Enum):
    PENDING = "Pending"
    ROUTED = "Routed"
    RESOLVED = "Resolved"

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    road_id = Column(UUID(as_uuid=True), ForeignKey('roads.id'), nullable=True)
    location = Column(Geometry('POINT', srid=4326), nullable=False)
    issue_type = Column(String, nullable=False)
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.PENDING)
    assigned_jurisdiction_id = Column(UUID(as_uuid=True), ForeignKey('jurisdictions.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    road = relationship("Road", back_populates="complaints")
    assigned_jurisdiction = relationship("Jurisdiction")
