"""
Road Import Service

Handles ingestion of road data from real sources:
1. OpenStreetMap (Overpass API)
2. Seed datasets (NHAI, PMGSY, State PWD records)

This eliminates the need for hardcoded mock data.
"""

import httpx
import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models import Road, Jurisdiction

logger = logging.getLogger(__name__)

OVERPASS_URL = "http://overpass-api.de/api/interpreter"

async def import_from_osm(db: AsyncSession, area_name: str = "Andhra Pradesh", road_types: List[str] = ["trunk", "primary", "secondary"]):
    """
    Fetch road geometries and metadata from OpenStreetMap using Overpass API.
    Maps OSM tags to RoadWatch Road models.
    """
    logger.info(f"Starting OSM import for {area_name}")
    
    # Overpass QL query
    # Find the area, then find ways with highway tags within that area.
    highway_filter = "|".join(road_types)
    query = f"""
    [out:json][timeout:90];
    area[name="{area_name}"]->.searchArea;
    (
      way["highway"~"^{highway_filter}$"](area.searchArea);
    );
    out body;
    >;
    out skel qt;
    """
    
    try:
        async with httpx.AsyncClient(timeout=100.0) as client:
            response = await client.post(OVERPASS_URL, data={"data": query})
            response.raise_for_status()
            data = response.json()
    except Exception as e:
        logger.error(f"Failed to fetch from OSM: {e}")
        return 0

    elements = data.get("elements", [])
    ways = [e for e in elements if e["type"] == "way"]
    
    imported_count = 0
    for way in ways:
        tags = way.get("tags", {})
        
        # Extract meaningful name and reference
        name = tags.get("name")
        ref = tags.get("ref")
        
        if not name and not ref:
            continue
            
        road_name = name if name else f"Unnamed {tags.get('highway')} road"
        if ref:
            road_name = f"{ref} - {road_name}"
            
        # Map OSM highway to Indian classifications (Approximate)
        hw_type = tags.get("highway")
        mapped_type = "SH"
        if hw_type == "trunk" or (ref and ref.startswith("NH")):
            mapped_type = "NH"
        elif hw_type == "primary":
            mapped_type = "SH"
        elif hw_type == "secondary":
            mapped_type = "MDR"
        elif hw_type == "tertiary":
            mapped_type = "ODR"
            
        # Check if exists
        stmt = select(Road).where(Road.name == road_name)
        existing = await db.execute(stmt)
        if existing.scalars().first():
            continue
            
        # Create record. We leave contractor/budget fields empty (Unavailable)
        # to strictly avoid fabricating data.
        new_road = Road(
            name=road_name,
            type=mapped_type,
            source_url=f"https://www.openstreetmap.org/way/{way['id']}",
            source_docs="OpenStreetMap (ODbL)",
            contractor_name=None,  # Intentionally null to enforce "Unavailable"
            budget_sanctioned=None,
        )
        
        db.add(new_road)
        imported_count += 1
        
    if imported_count > 0:
        await db.commit()
        
    logger.info(f"Successfully imported {imported_count} roads from OSM.")
    return imported_count


async def import_from_seed(db: AsyncSession, filepath: str):
    """
    Import curated road datasets (e.g. scraped NHAI or PMGSY records).
    These contain actual contractor and budget data.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        logger.error(f"Seed file not found: {filepath}")
        return 0

    imported_count = 0
    for item in data:
        name = item.get("name")
        if not name:
            continue
            
        stmt = select(Road).where(Road.name == name)
        existing = await db.execute(stmt)
        
        if existing.scalars().first():
            continue
            
        new_road = Road(
            name=name,
            type=item.get("type", "SH"),
            contractor_name=item.get("contractor"),
            budget_sanctioned=item.get("budget_sanctioned"),
            budget_spent=item.get("budget_spent"),
            source_url=item.get("source_url"),
            source_docs=item.get("source_docs", "Public Records"),
        )
        db.add(new_road)
        imported_count += 1
        
    if imported_count > 0:
        await db.commit()
        
    return imported_count
