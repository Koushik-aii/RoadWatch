import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function AuthorityMapWidget() {
  const center = [16.5062, 80.6480]; // Vijayawada roughly

  const complaints = [
    { id: 'RW-101', lat: 16.5162, lng: 80.6480, type: 'Pothole', severity: 'High' },
    { id: 'RW-102', lat: 16.5000, lng: 80.6300, type: 'Bridge Damage', severity: 'Critical' },
    { id: 'RW-103', lat: 16.5200, lng: 80.6500, type: 'Waterlogging', severity: 'Medium' }
  ];

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 lg:p-5 h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-display font-bold text-sm text-slate-100">Live Operational Map</h2>
          <p className="text-slate-500 text-[10px] mt-0.5">Geospatial dispatch overview</p>
        </div>
        <div className="flex gap-2 text-[9px] font-semibold">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Critical</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Active</span>
        </div>
      </div>
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 relative z-0">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {complaints.map(c => (
            <Marker key={c.id} position={[c.lat, c.lng]} icon={c.severity === 'Critical' ? redIcon : new L.Icon.Default()}>
              <Popup className="text-xs">
                <strong>{c.id}</strong><br/>{c.type}<br/>{c.severity} Severity
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
