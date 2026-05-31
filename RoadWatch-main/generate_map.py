import json
import os

states_districts = {
    "Andhra Pradesh": [
        "Krishna", "Guntur", "Visakhapatnam", "Kurnool", 
        "Nellore", "East Godavari", "West Godavari", "Chittoor", 
        "Kadapa", "Srikakulam", "Vizianagaram", "Prakasam", "Anantapur"
    ],
    "Telangana": [
        "Hyderabad", "Ranga Reddy", "Medchal-Malkajgiri"
    ]
}

road_types = ["NH", "SH", "MDR", "ODR", "VR", "Urban"]

jurisdiction_map = {}

def format_domain(state):
    return "ap.gov.in" if state == "Andhra Pradesh" else "telangana.gov.in"

for state, districts in states_districts.items():
    jurisdiction_map[state] = {}
    for idx, dist in enumerate(districts):
        dist_lower = dist.lower().replace(" ", "")
        domain = format_domain(state)
        jurisdiction_map[state][dist] = {}
        
        # NH
        jurisdiction_map[state][dist]["NH"] = {
            "authority_name": f"NHAI Project Implementation Unit, {dist}",
            "designation": "Project Director / Executive Engineer (NH)",
            "email": f"pd.nhai.{dist_lower}@{domain}",
            "phone": f"1800-11-6062",
            "complaint_portal": "https://pgportal.gov.in/",
            "escalation": "Regional Officer (RO), NHAI"
        }
        
        # SH
        jurisdiction_map[state][dist]["SH"] = {
            "authority_name": f"R&B Division, {dist}",
            "designation": "Executive Engineer (R&B)",
            "email": f"ee.rnb.{dist_lower}@{domain}",
            "phone": f"+91-8{idx:02d}0000001",
            "complaint_portal": f"https://rnb.{domain}/complaints",
            "escalation": "Superintending Engineer (R&B)"
        }
        
        # MDR
        jurisdiction_map[state][dist]["MDR"] = {
            "authority_name": f"R&B Division, {dist}",
            "designation": "Executive Engineer (R&B)",
            "email": f"ee.rnb.{dist_lower}@{domain}",
            "phone": f"+91-8{idx:02d}0000001",
            "complaint_portal": f"https://rnb.{domain}/complaints",
            "escalation": "Superintending Engineer (R&B)"
        }
        
        # ODR
        jurisdiction_map[state][dist]["ODR"] = {
            "authority_name": f"Panchayati Raj Engineering Dept, {dist}",
            "designation": "Executive Engineer (PR/PMGSY)",
            "email": f"ee.pr.{dist_lower}@{domain}",
            "phone": f"+91-9{idx:02d}0000001",
            "complaint_portal": f"https://epanchayat.{domain}/",
            "escalation": "Superintending Engineer (PR)"
        }
        
        # VR
        jurisdiction_map[state][dist]["VR"] = {
            "authority_name": f"Panchayati Raj Engineering Dept, {dist}",
            "designation": "Executive Engineer (PR/PMGSY)",
            "email": f"ee.pr.{dist_lower}@{domain}",
            "phone": f"+91-9{idx:02d}0000001",
            "complaint_portal": f"https://epanchayat.{domain}/",
            "escalation": "Superintending Engineer (PR)"
        }
        
        # Urban
        jurisdiction_map[state][dist]["Urban"] = {
            "authority_name": f"{dist} Municipal Corporation",
            "designation": "Executive Engineer (Municipal)",
            "email": f"commissioner.{dist_lower}@{domain}",
            "phone": f"+91-7{idx:02d}0000001",
            "complaint_portal": f"https://cdma.{domain}/",
            "escalation": "Municipal Commissioner"
        }

# Ensure directory exists
os.makedirs("backend/data", exist_ok=True)
out_path = "backend/data/jurisdiction_map.json"

# Save to JSON
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(jurisdiction_map, f, indent=2)

print(f"Generated {out_path}")

# VERIFICATION
with open(out_path, "r", encoding="utf-8") as f:
    data = json.load(f)
    print("Verification: Successfully parsed JSON.")

total_entries = 0
summary = []

for state, districts in data.items():
    for dist, r_types in districts.items():
        total_entries += len(r_types)
        summary.append(f"{state: <15} | {dist: <20} | {', '.join(r_types.keys())}")

print(f"\nTotal Authority Entries: {total_entries}\n")
print(f"{'State': <15} | {'District': <20} | {'Road Types Covered'}")
print("-" * 65)
for line in summary:
    print(line)
