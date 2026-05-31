/**
 * AI Road Damage Detection API Client
 *
 * Provides functions to interact with the backend detection endpoints:
 * - detectRoadDamage: Upload image for AI analysis
 * - createComplaintFromDetection: User-initiated complaint creation
 * - getDetections: Fetch detection history
 * - getDetection: Fetch single detection details
 */

import { apiUrl } from './apiClient';

const API_BASE = apiUrl('/api');

/**
 * Upload an image for AI pothole detection.
 * @param {File} file - Image file (jpg/png/webp)
 * @param {number|null} latitude - Optional latitude
 * @param {number|null} longitude - Optional longitude
 * @returns {Promise<object>} Detection results with confidence, severity, risk score
 */
export async function detectRoadDamage(file, latitude = null, longitude = null) {
  const formData = new FormData();
  formData.append("file", file);
  if (latitude !== null) formData.append("latitude", latitude.toString());
  if (longitude !== null) formData.append("longitude", longitude.toString());

  const response = await fetch(`${API_BASE}/detect-road-damage`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Detection failed (${response.status})`);
  }

  return response.json();
}

/**
 * Create a complaint from an AI detection (user-initiated).
 * @param {string} detectionId - UUID of the detection record
 * @param {object} data - { latitude, longitude, district, state, country?, road_type? }
 * @returns {Promise<object>} Complaint creation result
 */
export async function createComplaintFromDetection(detectionId, data) {
  const response = await fetch(`${API_BASE}/detections/${detectionId}/create-complaint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Complaint creation failed (${response.status})`);
  }

  return response.json();
}

/**
 * Fetch paginated list of past detections.
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<object>} { total, detections[] }
 */
export async function getDetections(limit = 50, offset = 0) {
  const response = await fetch(`${API_BASE}/detections?limit=${limit}&offset=${offset}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch detections (${response.status})`);
  }

  return response.json();
}

/**
 * Fetch a single detection by ID.
 * @param {string} detectionId - UUID
 * @returns {Promise<object>} Full detection details
 */
export async function getDetection(detectionId) {
  const response = await fetch(`${API_BASE}/detections/${detectionId}`);

  if (!response.ok) {
    throw new Error(`Detection not found (${response.status})`);
  }

  return response.json();
}
