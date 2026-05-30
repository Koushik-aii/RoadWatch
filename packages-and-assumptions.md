# 📦 Software Packages & Technical Assumptions

> **IIT Madras AI Road Safety Hackathon 2026 — Track: RoadWatch**  
> This document lists all software packages used (frontend and backend) with their exact versions and purposes, along with the core technical assumptions made during the development of **RoadWatch**.

---

## 1. Frontend Packages (npm dependencies)

### Production Dependencies
| Package Name | Version | Purpose |
|---|---|---|
| **react** | `^19.2.6` | Core UI library for component-based rendering. |
| **react-dom** | `^19.2.6` | React DOM renderer targeting web browsers. |
| **leaflet** | `^1.9.4` | Mobile-friendly open-source interactive mapping framework. |
| **react-leaflet** | `^5.0.0` | React bindings for Leaflet map overlays and marker state hooks. |
| **lucide-react** | `^1.17.0` | Sleek, modern vector icons for navigational headers and banners. |
| **react-router-dom** | `^7.16.0` | Client-side routing engine mapping views (Chat, Map, Complaints). |

### Development Dependencies
| Package Name | Version | Purpose |
|---|---|---|
| **vite** | `^8.0.12` | Ultra-fast next-generation frontend bundler and development server. |
| **tailwindcss** | `^4.3.0` | Utility-first styling engine used for rapid custom-grid aesthetics. |
| **@tailwindcss/vite** | `^4.3.0` | Vite plugin integrating Tailwind compilation within the bundling pipeline. |
| **vite-plugin-pwa** | `^1.3.0` | Workbox-powered generator for offline caching manifest and service worker. |
| **eslint** | `^10.3.0` | Static analyzer ensuring code cleanliness and adherence to React rules. |
| **postcss** | `^8.5.15` | Tool for transforming styles with JS plugins. |
| **autoprefixer** | `^10.5.0` | PostCSS plugin to parse CSS and add vendor prefixes to CSS rules. |

---

## 2. Backend Packages (Python requirements)

| Package Name | Version | Purpose |
|---|---|---|
| **fastapi** | `^0.115.0` | High-performance modern web framework for building RESTful APIs. |
| **uvicorn[standard]** | `^0.34.0` | Lightning-fast ASGI web server implementation for FastAPI launch. |
| **sqlalchemy** | `^2.0.35` | Powerful SQL Toolkit and Object-Relational Mapper (ORM) for data operations. |
| **psycopg2-binary** | `^2.9.10` | PostgreSQL database adapter for Python environments. |
| **geoalchemy2** | `^0.15.2` | Spatial extensions for SQLAlchemy to support geographic PostGIS operations. |
| **shapely** | `^2.0.6` | Manipulation and analysis of geometric shapes (GPS points/polygons). |
| **pydantic** | `^2.10.0` | Data validation and settings management using Python type annotations. |
| **pydantic-settings** | `^2.7.0` | Config parsing for FastAPI application environments. |
| **python-dotenv** | `^1.0.1` | Reads key-value pairs from `.env` files and sets them as env variables. |

---

## 3. Technical Assumptions Made During Development

1. **Mock Data Accuracy:** Mock records in `roads_mock.json` are modelled closely on real public disclosures. Budget sizes, contractors (e.g., Navayuga, Kier Group), last relay dates, and lengths are derived from PMGSY OMMS, NHAI portal summaries, and the Highways England Smart Motorway Delivery program reports.
2. **Dynamic Geolocation Resolution:** Browser geolocation coordinates via `navigator.geolocation` are treated as primary inputs. In case of permission denial or absence of GPS hardware, the engine seamlessly falls back to the coordinate centroid of the selected district (e.g., Vijayawada for Krishna District).
3. **Demo Client-Side ID Generation:** Unique complaint identifiers (e.g. `RW-2044`) are generated client-side inside the interactive cards to allow instant offline filing and local persistence tracking. In production, these would be reconciled with server-generated database UUIDs.
4. **Robust Hybrid NLP Classifier:** The app expects user internet connection to classify intents using the Gemini API (`gemini-1.5-flash`). If latency exceeds `2000ms`, or the API fails, a client-side keyword extraction algorithm runs instantly to guarantee an uninterrupted user experience.
5. **IndexedDB Schema Isolation (v2 Migration):** IndexedDB is structured with two discrete stores (`complaints_queue` and `complaints_history`). Active/queued complaints have their own lifecycle until fully synced, while historical complaints persist locally in a permanent log.
6. **OpenStreetMap Tile Caching Limits:** OpenStreetMap tiles from `tile.openstreetmap.org` are cached in a CacheFirst strategy limited to 500 tiles with a 7-day expiration to prevent overwhelming the device's storage.
7. **Dual-Country Adapter Conversion:** UK roads use the same column labels in the database (`sanctioned_cr` and `disbursed_cr`), but the system uses the active `CountryContext` to dynamically translate and display them in Millions (M) GBP instead of Crores (Cr) INR.
8. **Jurisdiction Map Bounds:** The jurisdiction mapping maps AP districts (Krishna, Guntur, Visakhapatnam) with full granular coverage down to PWD sub-divisions. Roads out of AP or UK roads default to regional administrators with a notice stating manual review is required.
9. **PWA Network Strategies:** The service worker uses a `NetworkFirst` strategy for `/api/roads` requests with a 24-hour expiration window, ensuring that users see up-to-date road information when online while still having immediate access when offline.
10. **Re-connection Sync Mechanism:** Background synchronisation does not poll continuously (which drains battery); it hooks directly into the browser `online` event listener to instantly flush queued IndexedDB complaints the second connectivity is restored.
