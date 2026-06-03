import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertCircle, Filter, Flame, Map as MapIcon, Radar, Route, AlertTriangle, ShieldAlert } from 'lucide-react';
import roadsData from '../data/roads_mock.json';
import { accidentsData } from '../data/accidentsMock';
import { ROAD_TYPE_COLORS } from '../data/mockData';
import LeafletHeatmapLayer from '../components/maps/LeafletHeatmapLayer';
import { MapLoadingSkeleton } from '../components/SkeletonLoaders';
import { useAnalytics } from '../hooks/useAnalytics';
import { SEVERITY_COLORS } from '../services/analyticsApi';
import { apiUrl } from '../services/apiClient';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DISTRICT_COORDS = {
  Krishna: [16.5062, 80.648],
  Guntur: [16.3067, 80.4365],
  Visakhapatnam: [17.6868, 83.2185],
  Kurnool: [15.8281, 78.0373],
  Nellore: [14.4426, 79.9865],
  'East Godavari': [16.9891, 82.2475],
  Chittoor: [13.2172, 79.1003],
  London: [51.5074, -0.1278],
  Birmingham: [52.4862, -1.8904],
  Manchester: [53.4808, -2.2426],
  Leeds: [53.8008, -1.5491],
};

const ROAD_CONDITION_COLORS = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
};

const SEVERITIES = ['All', 'Low', 'Medium', 'High', 'Critical'];

function getCondition(road) {
  if (road.flag) return 'red';
  const lastRelay = new Date(road.lastRelayDate);
  const yearsDiff = (Date.now() - lastRelay.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (yearsDiff > 5) return 'red';
  if (yearsDiff >= 3) return 'amber';
  return 'green';
}

function severityColor(severity) {
  return SEVERITY_COLORS[severity] || '#64748b';
}

function riskColor(score) {
  if (score >= 80) return '#dc2626';
  if (score >= 65) return '#ea580c';
  if (score >= 45) return '#d97706';
  return '#16a34a';
}

function makeSeverityIcon(severity) {
  const color = severityColor(severity);
  return new L.DivIcon({
    html: `<div style="background:${color};border:2px solid white;border-radius:999px;width:24px;height:24px;box-shadow:0 8px 18px rgba(0,0,0,.35);display:grid;place-items:center;color:white;font-size:12px;font-weight:800;">!</div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function makeDetectionIcon(severity) {
  const color = severityColor(severity);
  return new L.DivIcon({
    html: `<div style="background:${color};border:2px solid white;border-radius:8px;width:28px;height:28px;display:grid;place-items:center;box-shadow:0 8px 18px rgba(0,0,0,.38);transform:rotate(45deg);"><span style="transform:rotate(-45deg);color:white;font-size:12px;font-weight:800;">AI</span></div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function TileLoadWatcher({ onLoaded }) {
  useMapEvents({
    load: () => onLoaded(),
    tileload: () => onLoaded(),
  });
  return null;
}

export default function MapView({ onSwitchToChat }) {
  const { t } = useLanguage();
  const { country, config } = useCountry();
  const [filters, setFilters] = useState({
    district: 'All',
    severity: 'All',
    startDate: '',
    endDate: '',
    maxPoints: 8000,
  });
  const [filterType, setFilterType] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [showRoads, setShowRoads] = useState(true);
  const [showComplaints, setShowComplaints] = useState(true);
  const [showAccidents, setShowAccidents] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [aiDetections, setAiDetections] = useState([]);
  const { data: analytics, loading, error } = useAnalytics(filters, { pollMs: 30000 });

  useEffect(() => {
    setFilterType('All');
    setFilterCondition('All');
    setFilters((prev) => ({ ...prev, district: 'All', severity: 'All' }));
  }, [country]);

  useEffect(() => {
    async function fetchDetections() {
      try {
        const res = await fetch(apiUrl('/api/detections?limit=100'));
        if (res.ok) {
          const data = await res.json();
          setAiDetections(data.detections || []);
        }
      } catch {
        setAiDetections([]);
      }
    }
    fetchDetections();
    const interval = setInterval(fetchDetections, 30000);
    return () => clearInterval(interval);
  }, []);

  const countryCenter = country === 'GB' ? [54.0, -2.5] : [16.5, 80.6];
  const countryZoom = country === 'GB' ? 6 : 8;
  const mapData = analytics?.map || {};
  const heatmapOptions = useMemo(() => ({ radius: 36, blur: 22 }), []);

  const availableDistricts = useMemo(() => {
    const districtSet = new Set(analytics?.filters?.districts || []);
    roadsData
      .filter((road) => (road.country || 'IN') === country)
      .forEach((road) => districtSet.add(road.district));
    return Array.from(districtSet).filter(Boolean).sort();
  }, [analytics?.filters?.districts, country]);

  const filteredRoads = useMemo(() => {
    return roadsData.filter((road) => {
      if ((road.country || 'IN') !== country) return false;
      const cond = getCondition(road);
      const condMatch =
        filterCondition === 'All' ||
        (filterCondition === 'Good' && cond === 'green') ||
        (filterCondition === 'Due' && cond === 'amber') ||
        (filterCondition === 'Overdue' && cond === 'red');
      const typeMatch = filterType === 'All' || road.type === filterType;
      const distMatch = filters.district === 'All' || road.district === filters.district;
      return condMatch && typeMatch && distMatch;
    });
  }, [country, filterType, filterCondition, filters.district]);

  const filteredAccidents = useMemo(() => {
    return accidentsData.filter((point) => {
      const sevStr = point[3];
      if (filters.severity !== 'All' && sevStr !== filters.severity) return false;
      return true;
    });
  }, [filters.severity]);

  const visiblePoints = (mapData.points || []).slice(0, 120);
  const clusters = mapData.clusters || [];
  const dangerousZones = mapData.dangerous_zones || [];
  const summary = analytics?.summary || {};

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-[#08130f]">
      {!mapLoaded && <MapLoadingSkeleton />}

      <div className="absolute inset-x-0 top-0 z-[1000] p-3 pointer-events-none">
        <div className="rounded-lg border border-emerald-900/50 bg-[#07130f]/92 p-3 shadow-2xl backdrop-blur pointer-events-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Radar size={15} className="text-emerald-300" />
                GIS Intelligence Map
              </h2>
              <p className="mt-0.5 truncate text-[10px] text-emerald-200/60">
                {summary.total ?? 0} complaints / {dangerousZones.length} predicted dangerous zones
              </p>
            </div>
            <button
              onClick={() => setShowFilters((value) => !value)}
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-medium text-emerald-200"
            >
              <Filter size={13} className="inline" /> {showFilters ? 'Hide' : 'Filters'}
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 space-y-3 border-t border-emerald-900/40 pt-3">
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="rounded-md border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200"
                  value={filters.district}
                  onChange={(event) => updateFilter('district', event.target.value)}
                >
                  <option value="All">{t('mapFilterAllDistricts')}</option>
                  {availableDistricts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>

                <select
                  className="rounded-md border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200"
                  value={filters.severity}
                  onChange={(event) => updateFilter('severity', event.target.value)}
                >
                  {SEVERITIES.map((severity) => (
                    <option key={severity} value={severity}>{severity === 'All' ? 'All severities' : severity}</option>
                  ))}
                </select>

                <input
                  type="date"
                  className="rounded-md border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200"
                  value={filters.startDate}
                  onChange={(event) => updateFilter('startDate', event.target.value)}
                />
                <input
                  type="date"
                  className="rounded-md border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200"
                  value={filters.endDate}
                  onChange={(event) => updateFilter('endDate', event.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  className="rounded-md border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200"
                  value={filterType}
                  onChange={(event) => setFilterType(event.target.value)}
                >
                  <option value="All">{t('mapFilterAllTypes')}</option>
                  {Object.keys(config.road_type_map || {}).map((type) => (
                    <option key={type} value={type}>{config.road_type_map[type]}</option>
                  ))}
                </select>

                <select
                  className="rounded-md border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200"
                  value={filterCondition}
                  onChange={(event) => setFilterCondition(event.target.value)}
                >
                  <option value="All">{t('mapFilterAllConditions')}</option>
                  <option value="Good">{t('mapFilterGood')}</option>
                  <option value="Due">{t('mapFilterDue')}</option>
                  <option value="Overdue">{t('mapFilterOverdue')}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <ToggleButton icon={Route} active={showRoads} label="Roads" onClick={() => setShowRoads((v) => !v)} />
                <ToggleButton icon={Flame} active={showComplaints} label="Complaints" onClick={() => setShowComplaints((v) => !v)} />
                <ToggleButton icon={AlertTriangle} active={showAccidents} label="Accidents" onClick={() => setShowAccidents((v) => !v)} />
                <ToggleButton icon={ShieldAlert} active={showRiskZones} label="Risk Zones" onClick={() => setShowRiskZones((v) => !v)} />
              </div>
            </div>
          )}

          {error && <div className="mt-2 rounded-md bg-red-500/10 p-2 text-[11px] text-red-200">{error}</div>}
        </div>
      </div>

      <div className="relative z-0 h-full w-full flex-1">
        <MapContainer
          key={country}
          center={countryCenter}
          zoom={countryZoom}
          style={{ height: '100%', width: '100%', background: '#08130f' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <TileLoadWatcher onLoaded={() => setTimeout(() => setMapLoaded(true), 500)} />
          
          {showComplaints && <LeafletHeatmapLayer points={mapData.heatmap || []} options={{ ...heatmapOptions, theme: 'complaints' }} />}
          {showAccidents && <LeafletHeatmapLayer points={filteredAccidents} options={{ ...heatmapOptions, theme: 'accidents' }} />}

          {showRoads && filteredRoads.map((road, index) => {
            const baseCoords = DISTRICT_COORDS[road.district] || countryCenter;
            const coords = [baseCoords[0] + index * 0.01 - 0.03, baseCoords[1] + index * 0.01 - 0.03];
            const cond = getCondition(road);
            const color = ROAD_CONDITION_COLORS[cond];

            return (
              <CircleMarker
                key={road.id}
                center={coords}
                pathOptions={{ color: '#f8fafc', weight: 2, fillColor: color, fillOpacity: 0.9 }}
                radius={8}
              >
                <Popup className="roadwatch-popup">
                  <div className="min-w-[200px] p-1">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-800">{road.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold text-white ${ROAD_TYPE_COLORS[road.type]?.bg || 'bg-slate-500'}`}>
                        {road.type}
                      </span>
                    </div>
                    <div className="mb-3 space-y-1.5 text-xs text-slate-600">
                      <p><strong>{t('infoLastRelaid')}:</strong> {road.lastRelayDate}</p>
                      <p><strong>{t('infoContractor')}:</strong> {road.contractor.name}</p>
                      <p><strong>{t('budgetUtilisation')}:</strong> <span className="font-bold text-emerald-600">{road.utilised_pct}%</span></p>
                      {road.flag && <p className="rounded border border-red-200 bg-red-50 p-1 text-[10px] font-semibold text-red-600">{road.flag}</p>}
                    </div>
                    <button
                      onClick={() => onSwitchToChat?.(`Report issue on ${road.id}`)}
                      className="w-full rounded-lg bg-emerald-700 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-800"
                    >
                      Report Issue on this road
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {showComplaints && clusters.map((cluster) => (
            <CircleMarker
              key={cluster.id}
              center={[cluster.lat, cluster.lng]}
              radius={Math.min(30, 10 + Math.sqrt(cluster.count) * 4)}
              pathOptions={{
                color: '#f8fafc',
                weight: 2,
                fillColor: riskColor(cluster.risk_score),
                fillOpacity: 0.78,
              }}
            >
              <Popup className="roadwatch-popup">
                <ClusterPopup cluster={cluster} onSwitchToChat={onSwitchToChat} />
              </Popup>
            </CircleMarker>
          ))}

          {showRiskZones && dangerousZones.map((zone) => (
            <CircleMarker
              key={`risk-${zone.id}`}
              center={[zone.lat, zone.lng]}
              radius={Math.min(42, 18 + zone.risk_score / 4)}
              pathOptions={{
                color: '#fecaca',
                weight: 2,
                dashArray: '6 4',
                fillColor: riskColor(zone.risk_score),
                fillOpacity: 0.22,
              }}
            >
              <Popup className="roadwatch-popup">
                <div className="min-w-[210px] p-1">
                  <div className="mb-1 text-[10px] font-bold uppercase text-red-600">Dangerous zone prediction</div>
                  <h3 className="text-sm font-bold text-slate-800">{zone.prediction} risk corridor</h3>
                  <p className="mt-1 text-xs text-slate-600">{zone.reason}</p>
                  <p className="mt-2 text-xs font-semibold text-red-600">Risk score: {zone.risk_score}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {showComplaints && visiblePoints.map((point) => (
            <Marker key={point.id} position={[point.lat, point.lng]} icon={makeSeverityIcon(point.severity)}>
              <Popup className="roadwatch-popup">
                <div className="p-1">
                  <h3 className="mb-1 text-sm font-bold text-slate-800">{point.id}</h3>
                  <p className="text-xs text-slate-600">{point.title}</p>
                  <p className="mt-1 text-[11px] font-semibold" style={{ color: severityColor(point.severity) }}>{point.severity}</p>
                  <button
                    onClick={() => onSwitchToChat?.(`Track ${point.id}`)}
                    className="mt-2 text-xs font-medium text-emerald-700 hover:underline"
                  >
                    Track this complaint
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {aiDetections
            .filter((det) => det.latitude && det.longitude)
            .map((det) => (
              <Marker key={`ai-${det.id}`} position={[det.latitude, det.longitude]} icon={makeDetectionIcon(det.severity || 'Low')}>
                <Popup className="roadwatch-popup">
                  <div className="min-w-[200px] p-1">
                    <div className="mb-2 flex items-center gap-1.5">
                      <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[9px] font-bold text-cyan-700">AI Detection</span>
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ background: severityColor(det.severity || 'Low') }}>
                        {det.severity || 'Low'}
                      </span>
                    </div>
                    <h3 className="mb-1 text-sm font-bold text-slate-800">{det.damage_type}</h3>
                    <div className="mb-2 space-y-1 text-xs text-slate-600">
                      <p><strong>Confidence:</strong> {Math.round(det.confidence * 100)}%</p>
                      <p><strong>Risk Score:</strong> {Math.round(det.risk_score * 100)}/100</p>
                      <p><strong>Priority:</strong> {det.repair_priority}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      <div className="absolute inset-x-4 bottom-4 z-[1000] pointer-events-none">
        <div className="grid grid-cols-4 gap-1 rounded-lg border border-emerald-900/50 bg-[#07130f]/92 p-2 text-[10px] font-medium text-slate-300 shadow-xl backdrop-blur">
          {Object.entries(SEVERITY_COLORS).map(([severity, color]) => (
            <div key={severity} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full border border-white" style={{ background: color }} />
              <span>{severity}</span>
            </div>
          ))}
        </div>
        {loading && <div className="mt-2 rounded bg-slate-950/80 px-2 py-1 text-center text-[10px] text-emerald-200">Refreshing analytics...</div>}
      </div>
    </div>
  );
}

function ToggleButton({ icon: Icon, active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1 rounded-md border px-2 py-2 text-[11px] font-semibold ${
        active
          ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100'
          : 'border-slate-700 bg-slate-950 text-slate-400'
      }`}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

function ClusterPopup({ cluster, onSwitchToChat }) {
  return (
    <div className="min-w-[220px] p-1">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500">
        <MapIcon size={12} />
        Complaint cluster
      </div>
      <h3 className="text-sm font-bold text-slate-800">{cluster.count} nearby complaints</h3>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
        <span>Open: <strong>{cluster.open}</strong></span>
        <span>Risk: <strong>{cluster.risk_score}</strong></span>
        <span>Top severity: <strong>{cluster.dominant_severity}</strong></span>
        <span>Critical: <strong>{cluster.severity_counts?.Critical || 0}</strong></span>
      </div>
      <div className="mt-3 space-y-1">
        {(cluster.sample || []).slice(0, 3).map((item) => (
          <div key={item.id} className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
            <Route size={10} className="mr-1 inline" />
            {item.id} / {item.severity}
          </div>
        ))}
      </div>
      <button
        onClick={() => onSwitchToChat?.(`Inspect risk cluster ${cluster.id}`)}
        className="mt-3 w-full rounded-md bg-emerald-700 py-2 text-xs font-semibold text-white"
      >
        Inspect cluster
      </button>
    </div>
  );
}
