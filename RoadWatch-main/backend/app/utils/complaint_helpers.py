"""Shared complaint ID and status mapping utilities."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from ..models import ComplaintStatus


def make_complaint_number(complaint_uuid: uuid.UUID) -> str:
    """Human-readable RW-XXXX from UUID suffix."""
    return f"RW-{complaint_uuid.hex[-4:].upper()}"


def parse_complaint_id(complaint_id: str) -> tuple[str, str | None]:
    """
    Parse complaint identifier.
    Returns ('rw', suffix) or ('uuid', uuid_str).
    """
    cid = complaint_id.strip().upper()
    if cid.startswith("RW-"):
        return "rw", cid.replace("RW-", "").lower()
    return "uuid", complaint_id.strip()


def status_to_stage(status: ComplaintStatus) -> int:
    """Map backend status to frontend stage (0=Filed, 1=Under Review, 2=Resolved)."""
    mapping = {
        ComplaintStatus.PENDING: 0,
        ComplaintStatus.UNDER_REVIEW: 1,
        ComplaintStatus.ROUTED: 1,
        ComplaintStatus.RESOLVED: 2,
    }
    return mapping.get(status, 0)


def stage_to_status(stage: int) -> ComplaintStatus:
    """Map frontend stage to backend status."""
    if stage >= 2:
        return ComplaintStatus.RESOLVED
    if stage == 1:
        return ComplaintStatus.UNDER_REVIEW
    return ComplaintStatus.PENDING


def days_since(dt: datetime | None) -> int:
    if not dt:
        return 0
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    return max(0, (now - dt).days)


def is_overdue(created_at: datetime | None, sla_days: int = 21) -> bool:
    return days_since(created_at) > sla_days
