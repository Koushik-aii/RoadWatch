"""Analytics and GIS intelligence API."""
from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.auth import CurrentUser
from ..database import get_db
from ..services.analytics_service import analytics_filters, build_analytics_payload, get_map_intelligence

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard")
async def analytics_dashboard(
    user: CurrentUser,
    district: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    max_points: int = Query(5000, ge=250, le=20000),
    db: AsyncSession = Depends(get_db),
):
    return await build_analytics_payload(
        db,
        user,
        district=district,
        severity=severity,
        start_date=start_date,
        end_date=end_date,
        max_points=max_points,
    )


@router.get("/map")
async def analytics_map(
    user: CurrentUser,
    district: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    radius_km: float = Query(1.2, ge=0.2, le=20),
    max_points: int = Query(5000, ge=250, le=20000),
    db: AsyncSession = Depends(get_db),
):
    filters = await analytics_filters(
        db,
        user,
        district=district,
        severity=severity,
        start_date=start_date,
        end_date=end_date,
    )
    return await get_map_intelligence(
        db,
        filters,
        radius_km=radius_km,
        max_points=max_points,
    )
