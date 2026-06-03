// Format: [lat, lng, intensity, severity_string]
// Intensity maps to color/size. 1.0 is highest risk, 0.2 is lowest.
// severity_string is used for filtering.

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

// Helper to jitter points slightly
const jitter = (val, amt = 0.05) => val + (Math.random() - 0.5) * amt;

const baseDistricts = {
  Hyderabad: [17.3850, 78.4867],
  Visakhapatnam: [17.6868, 83.2185],
  Vijayawada: [16.5062, 80.6480],
  Guntur: [16.3067, 80.4365],
  Warangal: [17.9689, 79.5941],
  Kurnool: [15.8281, 78.0373],
};

// Generate 400 random accident points across major regions
const generateAccidents = () => {
  const points = [];
  Object.keys(baseDistricts).forEach((district) => {
    const [lat, lng] = baseDistricts[district];
    
    // Create ~60-80 points per district
    const numPoints = Math.floor(Math.random() * 20) + 60;
    
    for (let i = 0; i < numPoints; i++) {
      const isCore = Math.random() > 0.6; // High density in center
      const spread = isCore ? 0.05 : 0.2;
      
      const pLat = jitter(lat, spread);
      const pLng = jitter(lng, spread);
      
      // Random severity
      const sevIdx = Math.floor(Math.random() * 4);
      let intensity;
      if (sevIdx === 3) intensity = 0.9 + Math.random() * 0.1; // Critical
      else if (sevIdx === 2) intensity = 0.65 + Math.random() * 0.15; // High
      else if (sevIdx === 1) intensity = 0.4 + Math.random() * 0.15; // Medium
      else intensity = 0.15 + Math.random() * 0.2; // Low
      
      points.push([pLat, pLng, intensity, SEVERITIES[sevIdx]]);
    }
  });
  
  return points;
};

export const accidentsData = generateAccidents();
