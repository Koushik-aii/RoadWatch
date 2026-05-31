"""GIS analytics aggregation for complaints."""
from __future__ import annotations

import math
from collections import defaultdict
from datetime import date, datetime, time, timezone
from typing import Any

from sqlalchemy import Date, and_, cast, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Complaint, ComplaintStatus, OfficerZone, Road, SeverityLevel, User, UserRole
from .officer_service import get_officer_zones

SEVERITY_WEIGHT = {
    SeverityLevel.LOW: 0.2,
    SeverityLevel.MEDIUM: 0.45,
    SeverityLevel.HIGH: 0.75,
    SeverityLevel.CRITICAL: 1.0,
}


def _normalize_enum(value: Any) -> str:
    return value.value if hasattr(value, "value") else str(value)


def _date_start(value: date | None) -> datetime | None:
    if value is None:
        return None
    return datetime.combine(value, time.min, tzinfo=timezone.utc)


def _date_end(value: date | None) -> datetime | None:
    if value is None:
        return None
    return datetime.combine(value, time.max, tzinfo=timezone.utc)


async def analytics_filters(
    db: AsyncSession,
    user: User,
    *,
    district: str | None = None,
    severity: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[Any]:
    filters: list[Any] = []

    if user.role == UserRole.CITIZEN:
        filters.append(Complaint.reporter_id == user.id)
    elif user.role == UserRole.OFFICER:
        zones = await get_officer_zones(db, user.id)
        filters.append(_officer_zone_filter(zones))

    if district:
        filters.append(func.lower(Complaint.district) == district.strip().lower())
    if severity:
        try:
            filters.append(Complaint.severity == SeverityLevel(severity))
        except ValueError:
            pass
    if start_date:
        filters.append(Complaint.created_at >= _date_start(start_date))
    if end_date:
        filters.append(Complaint.created_at <= _date_end(end_date))

    return [f for f in filters if f is not None]


def _officer_zone_filter(zones: list[OfficerZone]) -> Any:
    if not zones:
        return Complaint.id.is_(None)
    clauses = [
        and_(
            func.lower(Complaint.district) == zone.district.lower(),
            func.lower(Complaint.state) == zone.state.lower(),
        )
        for zone in zones
    ]
    return or_(*clauses)


def _apply_filters(statement, filters: list[Any]):
    return statement.where(and_(*filters)) if filters else statement


async def get_filter_options(db: AsyncSession, filters: list[Any]) -> dict[str, list[str]]:
    district_query = _apply_filters(
        select(Complaint.district).where(Complaint.district.is_not(None)).distinct(),
        filters,
    ).order_by(Complaint.district)
    department_query = _apply_filters(
        select(Complaint.assigned_department)
        .where(Complaint.assigned_department.is_not(None))
        .distinct(),
        filters,
    ).order_by(Complaint.assigned_department)

    districts = [row[0] for row in (await db.execute(district_query)).all() if row[0]]
    departments = [row[0] for row in (await db.execute(department_query)).all() if row[0]]
    return {"districts": districts, "departments": departments}


async def get_summary(db: AsyncSession, filters: list[Any]) -> dict[str, Any]:
    total = (
        await db.execute(_apply_filters(select(func.count()).select_from(Complaint), filters))
    ).scalar() or 0
    resolved = (
        await db.execute(
            _apply_filters(
                select(func.count())
                .select_from(Complaint)
                .where(Complaint.status == ComplaintStatus.RESOLVED),
                filters,
            )
        )
    ).scalar() or 0
    open_total = max(total - resolved, 0)

    critical = (
        await db.execute(
            _apply_filters(
                select(func.count())
                .select_from(Complaint)
                .where(Complaint.severity == SeverityLevel.CRITICAL),
                filters,
            )
        )
    ).scalar() or 0

    avg_resolution_days = (
        await db.execute(
            _apply_filters(
                select(
                    func.avg(
                        func.extract("epoch", Complaint.updated_at - Complaint.created_at) / 86400
                    )
                )
                .select_from(Complaint)
                .where(Complaint.status == ComplaintStatus.RESOLVED),
                filters,
            )
        )
    ).scalar()

    return {
        "total": total,
        "open": open_total,
        "resolved": resolved,
        "critical": critical,
        "resolution_rate": round((resolved / total) * 100, 1) if total else 0,
        "avg_resolution_days": round(float(avg_resolution_days or 0), 1),
    }


async def get_distribution(db: AsyncSession, filters: list[Any], column) -> list[dict[str, Any]]:
    query = _apply_filters(
        select(column, func.count()).select_from(Complaint).group_by(column),
        filters,
    )
    rows = (await db.execute(query)).all()
    return [{"name": _normalize_enum(name), "value": count} for name, count in rows]


async def get_trends(db: AsyncSession, filters: list[Any], limit_days: int = 60) -> list[dict[str, Any]]:
    day = cast(Complaint.created_at, Date)
    query = (
        _apply_filters(
            select(day.label("day"), func.count())
            .select_from(Complaint)
            .group_by(day),
            filters,
        )
        .order_by(desc("day"))
        .limit(limit_days)
    )
    rows = list(reversed((await db.execute(query)).all()))
    return [{"date": str(row_day), "complaints": count} for row_day, count in rows]


async def get_department_performance(db: AsyncSession, filters: list[Any]) -> list[dict[str, Any]]:
    query = _apply_filters(
        select(Complaint.assigned_department, Complaint.status, func.count())
        .select_from(Complaint)
        .group_by(Complaint.assigned_department, Complaint.status),
        filters,
    )
    grouped: dict[str, dict[str, Any]] = defaultdict(
        lambda: {"department": "Unassigned", "total": 0, "resolved": 0, "pending": 0}
    )
    for department, status, count in (await db.execute(query)).all():
        key = department or "Unassigned"
        grouped[key]["department"] = key
        grouped[key]["total"] += count
        if status == ComplaintStatus.RESOLVED:
            grouped[key]["resolved"] += count
        else:
            grouped[key]["pending"] += count

    items = []
    for item in grouped.values():
        total = item["total"] or 1
        item["resolution_rate"] = round((item["resolved"] / total) * 100, 1)
        items.append(item)
    return sorted(items, key=lambda x: (-x["total"], x["department"]))[:10]


async def get_most_reported_roads(db: AsyncSession, filters: list[Any]) -> list[dict[str, Any]]:
    query = (
        _apply_filters(
            select(Road.name, Complaint.road_type, Complaint.district, func.count())
            .select_from(Complaint)
            .join(Road, Complaint.road_id == Road.id, isouter=True)
            .group_by(Road.name, Complaint.road_type, Complaint.district),
            filters,
        )
        .order_by(func.count().desc())
        .limit(10)
    )
    rows = (await db.execute(query)).all()
    return [
        {
            "name": road_name or f"{road_type or 'Road'} corridor",
            "district": district or "Unknown",
            "road_type": road_type or "Unknown",
            "complaints": count,
        }
        for road_name, road_type, district, count in rows
    ]


async def get_critical_regions(db: AsyncSession, filters: list[Any]) -> list[dict[str, Any]]:
    query = _apply_filters(
        select(Complaint.district, Complaint.state, Complaint.severity, func.count())
        .select_from(Complaint)
        .group_by(Complaint.district, Complaint.state, Complaint.severity),
        filters,
    )
    regions: dict[tuple[str, str], dict[str, Any]] = defaultdict(
        lambda: {
            "district": "Unknown",
            "state": "Unknown",
            "total": 0,
            "severity_counts": {level.value: 0 for level in SeverityLevel},
            "risk_score": 0,
        }
    )
    for district, state, severity, count in (await db.execute(query)).all():
        key = (district or "Unknown", state or "Unknown")
        item = regions[key]
        item["district"] = key[0]
        item["state"] = key[1]
        item["total"] += count
        item["severity_counts"][_normalize_enum(severity)] += count

    for item in regions.values():
        weighted = sum(
            item["severity_counts"][level.value] * weight
            for level, weight in SEVERITY_WEIGHT.items()
        )
        volume_score = min(1, math.log1p(item["total"]) / math.log1p(40))
        severity_score = weighted / item["total"] if item["total"] else 0
        item["risk_score"] = round((severity_score * 70) + (volume_score * 30), 1)

    return sorted(regions.values(), key=lambda x: (-x["risk_score"], -x["total"]))[:10]


async def get_map_intelligence(
    db: AsyncSession,
    filters: list[Any],
    *,
    radius_km: float = 1.2,
    max_points: int = 5000,
) -> dict[str, Any]:
    query = (
        _apply_filters(
            select(
                Complaint.id,
                Complaint.complaint_number,
                Complaint.title,
                Complaint.latitude,
                Complaint.longitude,
                Complaint.severity,
                Complaint.status,
                Complaint.district,
                Complaint.created_at,
            ).select_from(Complaint),
            filters,
        )
        .where(Complaint.latitude.is_not(None), Complaint.longitude.is_not(None))
        .order_by(Complaint.created_at.desc())
        .limit(max_points)
    )
    rows = (await db.execute(query)).all()
    points = []
    buckets: dict[tuple[int, int], list[dict[str, Any]]] = defaultdict(list)
    cell_size = max(radius_km / 111, 0.005)
    now = datetime.now(timezone.utc)

    for row in rows:
        _, number, title, lat, lng, severity, status, district, created_at = row
        if lat is None or lng is None:
            continue
        severity_weight = SEVERITY_WEIGHT.get(severity, 0.45)
        point = {
            "id": number,
            "title": title,
            "lat": lat,
            "lng": lng,
            "severity": _normalize_enum(severity),
            "status": _normalize_enum(status),
            "district": district,
            "created_at": created_at.isoformat() if created_at else None,
            "weight": severity_weight,
        }
        points.append(point)
        buckets[(math.floor(lat / cell_size), math.floor(lng / cell_size))].append(point)

    clusters = []
    heatmap = []
    dangerous_zones = []
    for cluster_id, bucket_points in enumerate(buckets.values(), start=1):
        count = len(bucket_points)
        lat = sum(p["lat"] for p in bucket_points) / count
        lng = sum(p["lng"] for p in bucket_points) / count
        severity_counts = {level.value: 0 for level in SeverityLevel}
        open_count = 0
        recent_count = 0
        weighted = 0.0

        for point in bucket_points:
            severity_counts[point["severity"]] += 1
            weighted += point["weight"]
            if point["status"] != ComplaintStatus.RESOLVED.value:
                open_count += 1
            if point["created_at"]:
                created = datetime.fromisoformat(point["created_at"])
                if created.tzinfo is None:
                    created = created.replace(tzinfo=timezone.utc)
                if (now - created).days <= 30:
                    recent_count += 1

        avg_severity = weighted / count
        volume_score = min(1, math.log1p(count) / math.log1p(20))
        open_ratio = open_count / count
        recent_ratio = recent_count / count
        risk_score = round(
            min(100, (avg_severity * 45) + (volume_score * 25) + (open_ratio * 20) + (recent_ratio * 10)),
            1,
        )
        cluster = {
            "id": f"cluster-{cluster_id}",
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "count": count,
            "open": open_count,
            "severity_counts": severity_counts,
            "risk_score": risk_score,
            "dominant_severity": max(severity_counts, key=severity_counts.get),
            "sample": bucket_points[:5],
        }
        clusters.append(cluster)
        heatmap.append([cluster["lat"], cluster["lng"], round(min(1, avg_severity + count / 25), 2)])

        if count >= 3 or risk_score >= 65:
            dangerous_zones.append(
                {
                    **cluster,
                    "prediction": (
                        "Critical" if risk_score >= 80 else "High" if risk_score >= 65 else "Watch"
                    ),
                    "reason": f"{count} nearby complaints, {open_count} unresolved",
                }
            )

    return {
        "points": points,
        "clusters": sorted(clusters, key=lambda x: -x["risk_score"]),
        "heatmap": heatmap,
        "dangerous_zones": sorted(dangerous_zones, key=lambda x: -x["risk_score"])[:25],
        "meta": {"sampled_points": len(points), "max_points": max_points, "radius_km": radius_km},
    }


async def build_analytics_payload(
    db: AsyncSession,
    user: User,
    *,
    district: str | None = None,
    severity: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    max_points: int = 5000,
) -> dict[str, Any]:
    filters = await analytics_filters(
        db,
        user,
        district=district,
        severity=severity,
        start_date=start_date,
        end_date=end_date,
    )
    options_filters = await analytics_filters(db, user)

    return {
        "summary": await get_summary(db, filters),
        "filters": await get_filter_options(db, options_filters),
        "severity_distribution": await get_distribution(db, filters, Complaint.severity),
        "status_distribution": await get_distribution(db, filters, Complaint.status),
        "complaint_trends": await get_trends(db, filters),
        "department_performance": await get_department_performance(db, filters),
        "most_reported_roads": await get_most_reported_roads(db, filters),
        "critical_regions": await get_critical_regions(db, filters),
        "map": await get_map_intelligence(db, filters, max_points=max_points),
    }
