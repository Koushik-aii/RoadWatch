# RoadWatch Complaints API — Example Responses

Base URL: `http://localhost:8000`

## Create complaint (JSON)

**Request:** `POST /api/complaints/`

```json
{
  "title": "Large pothole near Krishna Bridge",
  "description": "40cm x 20cm pothole causing traffic slowdown",
  "lat": 16.5062,
  "lng": 80.6480,
  "issue_type": "Pothole",
  "district": "Krishna",
  "state": "Andhra Pradesh",
  "road_type": "SH",
  "severity": "High"
}
```

**Response:** `201 Created`

```json
{
  "complaint_id": "RW-A3F2",
  "status": "Under Review",
  "routed_authority": {
    "authority_name": "R&B Division, Krishna",
    "designation": "Executive Engineer",
    "email": "ee.rnb.krishna@ap.gov.in",
    "phone": "+91-8674-252001",
    "complaint_portal": "https://example.gov.in/complaints",
    "escalation": "Superintending Engineer (R&B)"
  },
  "message": "Your complaint RW-A3F2 has been submitted and routed to R&B Division, Krishna.",
  "complaint": {
    "complaint_id": "RW-A3F2",
    "uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Large pothole near Krishna Bridge",
    "description": "40cm x 20cm pothole causing traffic slowdown",
    "issue": "40cm x 20cm pothole causing traffic slowdown",
    "latitude": 16.5062,
    "longitude": 80.648,
    "image_url": null,
    "severity": "High",
    "status": "Under Review",
    "stage": 1,
    "assigned_department": "R&B Division, Krishna",
    "filedDate": "2026-05-31",
    "daysElapsed": 0,
    "expectedDays": 21,
    "overdue": false
  }
}
```

## List complaints (paginated + filters)

**Request:** `GET /api/complaints/?page=1&page_size=10&status=Pending&district=Krishna&search=pothole`

**Response:** `200 OK`

```json
{
  "total": 42,
  "page": 1,
  "page_size": 10,
  "pages": 5,
  "items": [
    {
      "complaint_id": "RW-A3F2",
      "title": "Large pothole near Krishna Bridge",
      "status": "Pending",
      "stage": 0,
      "severity": "High",
      "assigned_department": "R&B Division, Krishna",
      "latitude": 16.5062,
      "longitude": 80.648,
      "image_url": "/uploads/complaints/abc123.jpg",
      "filedDate": "2026-05-31",
      "overdue": false
    }
  ]
}
```

## Get single complaint

**Request:** `GET /api/complaints/RW-A3F2`

## Update complaint

**Request:** `PATCH /api/complaints/RW-A3F2`

```json
{
  "status": "Resolved",
  "assigned_department": "R&B Division, Krishna"
}
```

## Delete complaint

**Request:** `DELETE /api/complaints/RW-A3F2`  
**Response:** `204 No Content`

## Create with image (multipart)

**Request:** `POST /api/complaints/upload`  
`Content-Type: multipart/form-data`

| Field | Value |
|-------|-------|
| lat | 16.5062 |
| lng | 80.6480 |
| district | Krishna |
| state | Andhra Pradesh |
| title | Pothole on SH-1 |
| road_type | SH |
| image | (file) |

## Error response

```json
{
  "detail": "Complaint 'RW-9999' not found.",
  "code": "not_found"
}
```
