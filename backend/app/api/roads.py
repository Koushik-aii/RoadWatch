from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db

router = APIRouter(
    prefix="/api/roads",
    tags=["roads"]
)

@router.get("/")
def get_roads(db: Session = Depends(get_db)):
    # Placeholder for fetching roads (GeoJSON format usually for map)
    return {"message": "List of roads will go here"}

@router.get("/{road_id}")
def get_road_details(road_id: str, db: Session = Depends(get_db)):
    # Placeholder for a single road's details including budget and contractor
    return {"road_id": road_id, "details": "Road details will go here"}
