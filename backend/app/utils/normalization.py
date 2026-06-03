import re

# Simple dictionary for common cities and districts
# Extensible for other states in the future
TRANSLITERATION_MAP = {
    # Telugu
    "విజయవాడ": "Vijayawada",
    "గుంటూరు": "Guntur",
    "విశాఖపట్నం": "Visakhapatnam",
    "కర్నూలు": "Kurnool",
    "నెల్లూరు": "Nellore",
    "తిరుపతి": "Tirupati",
    "హైదరాబాద్": "Hyderabad",
    "కృష్ణా": "Krishna",
    # Hindi
    "विजयवाड़ा": "Vijayawada",
    "गुंटूर": "Guntur",
    "विशाखापत्तनम": "Visakhapatnam",
    "कुरनूल": "Kurnool",
    "नेल्लोर": "Nellore",
    "तिरुपति": "Tirupati",
    "हैदराबाद": "Hyderabad",
    "कृष्णा": "Krishna",
    # Tamil
    "விஜயவாடா": "Vijayawada",
    "குண்டூர்": "Guntur",
    "விசாகப்பட்டினம்": "Visakhapatnam",
    "கர்னூல்": "Kurnool",
    "நெல்லூர்": "Nellore",
    "திருப்பதி": "Tirupati",
    "ஹைதராபாத்": "Hyderabad",
    "கிருஷ்ணா": "Krishna",
}

def normalize_text(text: str) -> str:
    """Normalize input text by replacing native scripts with English equivalents."""
    if not text:
        return text
        
    normalized = text
    for native, english in TRANSLITERATION_MAP.items():
        normalized = normalized.replace(native, english)
        
    return normalized

def extract_filters_from_query(query: str) -> dict:
    """
    Extract implied filters (like road_type, district, city, explicit road name) from the user's free-text query.
    e.g. 'national highways in guntur' -> type: 'NH', district_hint: 'Guntur'
    """
    q_lower = query.lower()
    filters = {}
    
    # Road type extraction
    if re.search(r'\b(national highway|nh)\b', q_lower):
        filters['road_type'] = 'NH'
    elif re.search(r'\b(state highway|sh)\b', q_lower):
        filters['road_type'] = 'SH'
    elif re.search(r'\b(major district road|mdr)\b', q_lower):
        filters['road_type'] = 'MDR'
    elif re.search(r'\b(other district road|odr)\b', q_lower):
        filters['road_type'] = 'ODR'
    elif re.search(r'\b(village road|vr|rural road)\b', q_lower):
        filters['road_type'] = 'VR'
    elif re.search(r'\b(urban road|city road)\b', q_lower):
        filters['road_type'] = 'Urban'
        
    # Extract explicit road number (e.g. NH-16, SH 12)
    match_id = re.search(r'\b(nh|sh|mdr|odr|vr|urb)[\s\-]*(\d+)\b', q_lower)
    if match_id:
        filters['road_number'] = f"{match_id.group(1).upper()}-{match_id.group(2)}"
        filters['road_type'] = match_id.group(1).upper()

    # District / City extraction
    # Check if the query mentions specific cities to set geographical boundaries
    for eng_city in set(TRANSLITERATION_MAP.values()):
        if eng_city.lower() in q_lower:
            filters['district_hint'] = eng_city
            break
            
    # Extract specific keywords that act as names (very basic heuristic)
    # E.g. "roads near MG road" -> "mg road"
    match_name = re.search(r'\b([\w\s]+?)\s+(road|highway|expressway|street|marg)\b', q_lower)
    if match_name:
        # Avoid capturing "national highway" as the name
        name_candidate = match_name.group(0).strip()
        if name_candidate not in ['national highway', 'state highway', 'district road', 'village road', 'urban road']:
            filters['road_name_hint'] = name_candidate
            
    return filters
