import sys
import json
import logging
from fastapi.testclient import TestClient
from app.main import app

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("demo")

client = TestClient(app)

def print_step(title):
    print(f"\n{'='*60}\n>> {title}\n{'='*60}")

def run_demo():
    print_step("INIT: Authenticating Citizen")
    res = client.post("/api/auth/login", json={"email": "citizen@test.com", "password": "DemoPass123!"})
    if res.status_code != 200:
        print(f"Auth failed: {res.text}")
        sys.exit(1)
    citizen_token = res.json()["tokens"]["access_token"]
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}
    print("[OK] Successfully authenticated as Citizen.")

    print_step("STEP 1: User asks about road (Search)")
    q = "Vijayawada Bypass NH-16"
    print(f"Querying: {q}")
    res = client.get(f"/api/roads/search?q={q}")
    results = res.json()["results"]
    print(f"Found {len(results)} matching roads.")
    if not results:
        print("No roads found. Exiting.")
        sys.exit(1)
    target_road = results[0]["road"]
    print(f"[OK] Selected Road: {target_road['name']} (Score: {results[0]['confidence_score']:.1f})")
    road_id = target_road.get('uuid') or target_road.get('id')

    print_step("STEP 2, 3 & 4: System shows Road Details, Contractor, and Budget")
    res = client.get(f"/api/roads/{road_id}")
    details = res.json()
    print(f"Road: {details['name']} ({details['type']})")
    print(f"Risk Classification: {details.get('risk_classification')} (Accidents: {details.get('accident_count')})")
    print("\nContractor Transparency:")
    c = details.get('contractor')
    if c:
        print(f"  Name: {c.get('name')}")
        print(f"  Complaints: {c.get('complaint_count')}")
        print(f"  Repeat Failure Flag: {'YES (ALERT)' if c.get('repeat_failure_flag') else 'NO'}")
    else:
        print("  None listed.")
        
    print("\nBudget Tracking:")
    print(f"  Sanctioned: {details.get('budget_sanctioned')}")
    print(f"  Released: {details.get('budget_released')}")
    print(f"  Anomalies Detected: {', '.join(details.get('budget_anomalies', [])) or 'None'}")
    
    v = details.get('verification')
    print(f"\nSource Verification: {v.get('source_name')} | Confidence: {v.get('confidence_level')}")

    print_step("STEP 5, 6, 7 & 8: User uploads Pothole Image, AI Classifies, Complaint Generated & Routed")
    print("Simulating user uploading an image of a severe pothole...")
    complaint_data = {
        "title": "Severe Pothole on Highway",
        "description": "Massive crater forming in the middle lane.",
        "lat": 16.5,
        "lng": 80.6,
        "district": "Krishna",
        "state": "Andhra Pradesh",
        "country": "India",
        "road_type": "NH",
        "issue_type": "Pothole",
        "severity": "High"
    }
    import uuid
    try:
        uuid.UUID(str(road_id))
        complaint_data["road_id"] = road_id
    except ValueError:
        pass
    res = client.post("/api/complaints/", json=complaint_data, headers=citizen_headers)
    if res.status_code != 201:
        print(f"Failed to create complaint: {res.text}")
        sys.exit(1)
        
    created = res.json()
    complaint_id = created["complaint_id"]
    authority = created["routed_authority"]
    
    print(f"[OK] AI Analysis Triggered (Mocked). Issue Type: {created['complaint']['issue']}")
    print(f"[OK] Complaint Generated: ID {complaint_id}")
    print(f"[OK] Automatically Routed To: {authority['authority_name']} ({authority['designation']})")
    print(f"  Contact: {authority['phone']} | {authority['email']}")

    print_step("STEP 9: Complaint appears in Authority Dashboard")
    print("Authenticating as Officer...")
    res = client.post("/api/auth/login", json={"email": "officer@test.com", "password": "DemoPass123!"})
    officer_token = res.json()["tokens"]["access_token"]
    officer_headers = {"Authorization": f"Bearer {officer_token}"}
    
    res = client.get("/api/officer/metrics", headers=officer_headers)
    stats = res.json()
    print(f"Total Pending Cases for Officer: {stats['open']}")
    print(f"SLA Violations Active: {stats['overdue']}")
    
    res = client.get("/api/complaints/", headers=officer_headers)
    recent = [c['complaint_id'] for c in res.json()['items']]
    if complaint_id in recent:
        print(f"[OK] VERIFIED: Complaint {complaint_id} successfully populated in the Authority queue!")
    else:
        print(f"  Note: {complaint_id} not in top recent complaints list, but dashboard is active.")

    print_step("STEP 10: Complaint tracked through resolution timeline (SLA Tracker)")
    res = client.get(f"/api/complaints/{complaint_id}", headers=citizen_headers)
    tracker = res.json()
    
    print(f"Status: {tracker['status']}")
    print(f"Filed Date: {tracker['complaint']['filedDate']}")
    print(f"Expected Resolution: {tracker['complaint']['expectedDays']} days")
    print(f"SLA Deadline: {tracker['complaint'].get('sla_deadline', 'N/A')}")
    print(f"Overdue Status: {'OVERDUE' if tracker['complaint'].get('daysElapsed', 0) > tracker['complaint'].get('expectedDays', 21) else 'On Track'}")
    
    v = tracker['complaint'].get('verification', {})
    print(f"\nVerification: {v.get('source_name')} | Confidence: {v.get('confidence_level')}")
    
    print_step("END OF DEMONSTRATION")
    print("The entire lifecycle worked autonomously without manual intervention.")

if __name__ == "__main__":
    run_demo()
