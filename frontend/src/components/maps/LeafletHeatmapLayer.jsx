import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

function createHeatmapLayer(points, options = {}) {
  return L.layerGroup().on('add', function handleAdd(event) {
    const map = event.target._map;
    const canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer');
    const ctx = canvas.getContext('2d');
    const pane = map.getPanes().overlayPane;
    const radius = options.radius || 34;
    const blur = options.blur || 22;

    canvas.style.position = 'absolute';
    canvas.style.pointerEvents = 'none';
    canvas.style.mixBlendMode = 'screen';
    pane.appendChild(canvas);

    function draw() {
      const size = map.getSize();
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      canvas.width = size.x;
      canvas.height = size.y;
      L.DomUtil.setPosition(canvas, topLeft);
      ctx.clearRect(0, 0, size.x, size.y);

      points.forEach(([lat, lng, intensity = 0.5]) => {
        const point = map.latLngToContainerPoint([lat, lng]);
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
<<<<<<< Updated upstream
        const alpha = Math.max(0.12, Math.min(0.9, intensity));
        gradient.addColorStop(0, `rgba(239, 68, 68, ${alpha})`);
        gradient.addColorStop(0.35, `rgba(245, 158, 11, ${alpha * 0.65})`);
        gradient.addColorStop(0.72, `rgba(34, 197, 94, ${alpha * 0.28})`);
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
=======
        const alpha = Math.max(0.15, Math.min(0.9, intensity));
        
        const theme = options.theme || 'complaints';
        
        let coreStr, midStr, edgeStr;
        
        if (theme === 'accidents') {
          if (intensity >= 0.8) {
            coreStr = `rgba(159, 18, 57, ${alpha})`; // rose-900
            midStr = `rgba(225, 29, 72, ${alpha * 0.6})`; // rose-600
            edgeStr = 'rgba(244, 63, 94, 0)'; // rose-500
          } else if (intensity >= 0.6) {
            coreStr = `rgba(107, 33, 168, ${alpha})`; // purple-800
            midStr = `rgba(147, 51, 234, ${alpha * 0.6})`; // purple-600
            edgeStr = 'rgba(168, 85, 247, 0)'; // purple-500
          } else if (intensity >= 0.35) {
            coreStr = `rgba(76, 29, 149, ${alpha})`; // violet-900
            midStr = `rgba(124, 58, 237, ${alpha * 0.6})`; // violet-600
            edgeStr = 'rgba(139, 92, 246, 0)'; // violet-500
          } else {
            coreStr = `rgba(30, 58, 138, ${alpha})`; // blue-900
            midStr = `rgba(37, 99, 235, ${alpha * 0.6})`; // blue-600
            edgeStr = 'rgba(59, 130, 246, 0)'; // blue-500
          }
        } else {
          // Complaints theme (default)
          if (intensity >= 0.8) {
            coreStr = `rgba(239, 68, 68, ${alpha})`;
            midStr = `rgba(239, 68, 68, ${alpha * 0.5})`;
            edgeStr = 'rgba(239, 68, 68, 0)';
          } else if (intensity >= 0.6) {
            coreStr = `rgba(249, 115, 22, ${alpha})`;
            midStr = `rgba(249, 115, 22, ${alpha * 0.5})`;
            edgeStr = 'rgba(249, 115, 22, 0)';
          } else if (intensity >= 0.35) {
            coreStr = `rgba(234, 179, 8, ${alpha})`;
            midStr = `rgba(234, 179, 8, ${alpha * 0.5})`;
            edgeStr = 'rgba(234, 179, 8, 0)';
          } else {
            coreStr = `rgba(34, 197, 94, ${alpha})`;
            midStr = `rgba(34, 197, 94, ${alpha * 0.5})`;
            edgeStr = 'rgba(34, 197, 94, 0)';
          }
        }

        gradient.addColorStop(0, coreStr);
        gradient.addColorStop(0.5, midStr);
        gradient.addColorStop(1, edgeStr);
        
>>>>>>> Stashed changes
        ctx.filter = `blur(${blur / 5}px)`;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.filter = 'none';
    }

    draw();
    map.on('move zoom resize', draw);
    this.on('remove', () => {
      map.off('move zoom resize', draw);
      canvas.remove();
    });
  });
}

export default function LeafletHeatmapLayer({ points, options }) {
  const map = useMap();

  useEffect(() => {
    if (!points?.length) return undefined;
    const layer = createHeatmapLayer(points, options).addTo(map);
    return () => layer.remove();
  }, [map, points, options]);

  return null;
}
