"""SLA Engine for dynamic complaint resolution deadlines."""

def calculate_sla_days(issue_type: str, description: str) -> int:
    """
    Calculate the SLA duration in days based on the issue type and description.
    """
    text = f"{issue_type or ''} {description or ''}".lower()
    
    if "bridge" in text or "cave-in" in text or "cave in" in text:
        return 30
    if "drainage" in text or "waterlogging" in text or "flooding" in text:
        return 20
    if "crack" in text:
        return 15
    if "pothole" in text:
        return 7
    
    return 21  # Default fallback SLA
