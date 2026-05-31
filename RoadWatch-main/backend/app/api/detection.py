"""
AI Road Damage Detection API router for RoadWatch.
"""
from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.auth import CurrentUser
from ..database import get_db
from ..models import ComplaintStatus, RoadDamageDetection, SeverityLevel
from ..services.ai_detection import detect_road_damage
from ..services.complaint_service import create_complaint
from ..utils.complaint_helpers import make_complaint_number
from .schemas import (
    CreateComplaintFromDetection,
    DetectionItem,
    DetectionListItem,
    DetectionListResponse,
    RoadDamageResponse,
)

router = APIRouter(prefix="/api", tags=["detection"])

UPLOADS_DIR = Path(__file__).parent.parent.parent / "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_FILE_SIZE = 10 * 1024 * 1024

SEVERITY_MAP = {
    "Low": SeverityLevel.LOW,
    "Medium": SeverityLevel.MEDIUM,
    "High": SeverityLevel.HIGH,
    "Critical": SeverityLevel.CRITICAL,
}


@router.post("/detect-road-damage", response_model=RoadDamageResponse)
async def detect_damage(
    file: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max: 10 MB.")

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    file_id = uuid.uuid4().hex[:12]
    saved_filename = f"{file_id}_{file.filename}"
    saved_path = UPLOADS_DIR / saved_filename

    with open(saved_path, "wb") as f:
        f.write(content)

    try:
        result = detect_road_damage(str(saved_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI detection failed: {str(e)}") from e

    detection_items = [
        DetectionItem(
            damage_type=d["damage_type"],
            confidence=d["confidence"],
            bbox=d["bbox"],
            area_percentage=d["area_percentage"],
            risk_score=d["risk_score"],
            severity=d["severity"],
            repair_priority=d["repair_priority"],
            repair_timeframe=d["repair_timeframe"],
            explanation=d["explanation"],
        )
        for d in result["detections"]
    ]

    overall_sev_str = result["overall_severity"]
    severity_enum = SEVERITY_MAP.get(overall_sev_str)

    primary_confidence = result["detections"][0]["confidence"] if result["detections"] else 0.0
    primary_repair_priority = (
        result["detections"][0]["repair_priority"] if result["detections"] else "Routine"
    )
    primary_explanation = (
        result["detections"][0]["explanation"]
        if result["detections"]
        else "No road damage detected in this image."
    )

    detection_record = RoadDamageDetection(
        image_path=str(saved_filename),
        result_image_path=result.get("result_image_filename", ""),
        latitude=latitude,
        longitude=longitude,
        damage_type="Pothole",
        confidence=primary_confidence,
        severity=severity_enum,
        risk_score=result["overall_risk_score"],
        repair_priority=primary_repair_priority,
        explanation=primary_explanation,
        bbox_json=json.dumps([d["bbox"] for d in result["detections"]]),
        detections_json=json.dumps(result["detections"]),
        detection_count=result["detection_count"],
    )
    db.add(detection_record)
    await db.flush()
    await db.refresh(detection_record)

    message = (
        f"AI detected {result['detection_count']} pothole(s). Overall severity: {overall_sev_str}."
        if result["detection_count"] > 0
        else "No road damage detected in this image."
    )

    return RoadDamageResponse(
        detection_id=str(detection_record.id),
        detections=detection_items,
        detection_count=result["detection_count"],
        overall_risk_score=result["overall_risk_score"],
        overall_severity=overall_sev_str,
        image_url=f"/uploads/{saved_filename}",
        result_image_url=f"/uploads/{result.get('result_image_filename', saved_filename)}",
        message=message,
    )


@router.post("/detections/{detection_id}/create-complaint", status_code=201)
async def create_complaint_from_detection(
    detection_id: str,
    body: CreateComplaintFromDetection,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    try:
        det_uuid = uuid.UUID(detection_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid detection ID format.")

    result = await db.execute(
        select(RoadDamageDetection).where(RoadDamageDetection.id == det_uuid)
    )
    detection = result.scalar_one_or_none()
    if detection is None:
        raise HTTPException(status_code=404, detail="Detection record not found.")

    if detection.complaint_id is not None:
        complaint_number = make_complaint_number(detection.complaint_id)
        return {
            "message": f"A complaint ({complaint_number}) was already created for this detection.",
            "complaint_id": complaint_number,
            "already_exists": True,
        }

    severity_str = detection.severity.value if detection.severity else "Unknown"
    title = f"AI-Detected {detection.damage_type}"
    description = (
        f"AI-Detected Pothole — Severity: {severity_str}, "
        f"Confidence: {round(detection.confidence * 100, 1)}%, "
        f"Risk Score: {round((detection.risk_score or 0) * 100)}/100"
    )

    complaint, _authority = await create_complaint(
        db,
        title=title,
        description=description,
        latitude=body.latitude,
        longitude=body.longitude,
        district=body.district,
        state=body.state,
        country=body.country,
        road_type=body.road_type,
        severity=detection.severity,
        image_path=detection.image_path,
        issue_type=title,
        status=ComplaintStatus.PENDING,
        reporter_id=user.id,
    )

    detection.complaint_id = complaint.id
    detection.latitude = body.latitude
    detection.longitude = body.longitude
    await db.flush()

    return {
        "message": f"Complaint {complaint.complaint_number} created successfully from AI detection.",
        "complaint_id": complaint.complaint_number,
        "already_exists": False,
        "severity": severity_str,
        "detection_id": str(detection.id),
    }


@router.get("/detections", response_model=DetectionListResponse)
async def list_detections(
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
    offset: int = 0,
):
    total_result = await db.execute(select(func.count()).select_from(RoadDamageDetection))
    total = total_result.scalar() or 0

    records_result = await db.execute(
        select(RoadDamageDetection)
        .order_by(RoadDamageDetection.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    records = records_result.scalars().all()

    items = []
    for r in records:
        overall_severity = r.severity.value if r.severity else "Safe"
        items.append(
            DetectionListItem(
                id=str(r.id),
                damage_type=r.damage_type,
                confidence=r.confidence,
                severity=r.severity.value if r.severity else "Low",
                risk_score=r.risk_score or 0.0,
                repair_priority=r.repair_priority or "Routine",
                detection_count=r.detection_count or 0,
                overall_severity=overall_severity,
                image_url=f"/uploads/{r.image_path}",
                result_image_url=f"/uploads/{r.result_image_path}" if r.result_image_path else "",
                has_complaint=r.complaint_id is not None,
                complaint_id=make_complaint_number(r.complaint_id) if r.complaint_id else None,
                created_at=r.created_at,
            )
        )

    return DetectionListResponse(total=total, detections=items)


@router.get("/detections/{detection_id}")
async def get_detection(
    detection_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        det_uuid = uuid.UUID(detection_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid detection ID format.")

    result = await db.execute(
        select(RoadDamageDetection).where(RoadDamageDetection.id == det_uuid)
    )
    detection = result.scalar_one_or_none()
    if detection is None:
        raise HTTPException(status_code=404, detail="Detection not found.")

    try:
        dets = json.loads(detection.detections_json) if detection.detections_json else []
    except Exception:
        dets = []

    detection_items = [
        DetectionItem(
            damage_type=d.get("damage_type", "Pothole"),
            confidence=d.get("confidence", 0),
            bbox=d.get("bbox", []),
            area_percentage=d.get("area_percentage", 0),
            risk_score=d.get("risk_score", 0),
            severity=d.get("severity", "Low"),
            repair_priority=d.get("repair_priority", "Routine"),
            repair_timeframe=d.get("repair_timeframe", "7 Days"),
            explanation=d.get("explanation", ""),
        )
        for d in dets
    ]

    overall_severity = detection.severity.value if detection.severity else "Safe"

    return RoadDamageResponse(
        detection_id=str(detection.id),
        detections=detection_items,
        detection_count=detection.detection_count or 0,
        overall_risk_score=detection.risk_score or 0.0,
        overall_severity=overall_severity,
        image_url=f"/uploads/{detection.image_path}",
        result_image_url=(
            f"/uploads/{detection.result_image_path}" if detection.result_image_path else ""
        ),
        message=detection.explanation or "",
    )
