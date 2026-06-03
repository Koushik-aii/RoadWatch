"""Accident Analytics Engine for calculating transparent road safety metrics."""

def calculate_accident_analytics(accident_count: int, length_km: float, road_type: str) -> dict:
    """
    Calculate transparent accident risk scores based on raw count, length, and road type.
    """
    if accident_count is None:
        accident_count = 0
    if not length_km or length_km <= 0:
        length_km = 1.0  # Fallback to prevent div by zero
        
    # Accidents per km
    accidents_per_km = accident_count / length_km
    
    # Severity multiplier based on road type speeds
    multiplier = 1.0
    rt = (road_type or "").upper()
    if "NH" in rt or "SH" in rt:
        multiplier = 2.5  # High-speed corridors have higher fatality rates
    elif "MDR" in rt:
        multiplier = 1.5
    else:
        multiplier = 1.0
        
    # Base transparent severity score (0 to 100)
    score = (accidents_per_km * 5.0) * multiplier
    score = round(min(100.0, score), 1)
    
    # Classification
    if score < 30:
        classification = "Safe"
    elif score < 70:
        classification = "Moderate Risk"
    else:
        classification = "High Risk"
        
    # Simulated Trend (In a real system, this compares year-over-year)
    if score > 80:
        trend = "Increasing"
    elif score > 40:
        trend = "Stable"
    else:
        trend = "Decreasing"
        
    # Hotspot ranking simulated based on score directly for demonstration
    ranking = max(1, int(100 - score + 1))
    
    return {
        "accident_severity_score": score,
        "risk_classification": classification,
        "accident_trend": trend,
        "hotspot_ranking": ranking,
        "accident_source": "MoRTH / iRAD datasets",
    }

def enrich_road_with_accident_analytics(road_data: dict) -> dict:
    """Enrich a road dictionary with computed accident metrics."""
    # Ensure accident count exists (can be 0)
    count = road_data.get("accident_count") or 0
    length = road_data.get("length_km") or 10.0
    rt = road_data.get("type") or "Unknown"
    
    analytics = calculate_accident_analytics(count, length, rt)
    road_data.update(analytics)
    return road_data
