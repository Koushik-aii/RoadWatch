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
        const alpha = Math.max(0.12, Math.min(0.9, intensity));
        gradient.addColorStop(0, `rgba(239, 68, 68, ${alpha})`);
        gradient.addColorStop(0.35, `rgba(245, 158, 11, ${alpha * 0.65})`);
        gradient.addColorStop(0.72, `rgba(34, 197, 94, ${alpha * 0.28})`);
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
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
