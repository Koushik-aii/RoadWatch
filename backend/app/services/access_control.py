"""Complaint access control by role."""
from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Complaint, User, UserRole
from .officer_service import get_officer_zones, officer_can_access_complaint


async def assert_can_view_complaint(
    db: AsyncSession,
    user: User,
    complaint: Complaint,
) -> None:
    if user.role == UserRole.ADMIN:
        return
    if user.role == UserRole.CITIZEN:
        if complaint.reporter_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own complaints.",
            )
        return
    if user.role == UserRole.OFFICER:
        if not await officer_can_access_complaint(db, user, complaint):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Complaint is outside your assigned zones.",
            )
        return


def list_filters_for_user(user: User) -> dict:
    """Return kwargs for list_complaints based on role."""
    if user.role == UserRole.CITIZEN:
        return {"reporter_id": user.id}
    if user.role == UserRole.OFFICER:
        return {"officer_zones": []}  # filled async in route
    return {}
