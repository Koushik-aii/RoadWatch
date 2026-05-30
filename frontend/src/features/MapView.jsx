import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, AlertCircle, Map as MapIcon } from 'lucide-react';
import roadsData from '../data/roads_mock.json';
import { MOCK_COMPLAINTS, ROAD_TYPE_COLORS } from '../data/mockData';
import { MapLoadingSkeleton } from '../components/SkeletonLoaders';
import { useLanguage } from '../context/LanguageContext';
import { useCountry } from '../context/CountryContext';

// Fix leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for complaints
const complaintIcon = new L.DivIcon({
  html: `<div style="background-color: #ef4444; border: 2px solid white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"><span style="color: white; font-weight: bold; font-size: 14px;">!</span></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const DISTRICT_COORDS = {
  'Krishna': [16.5062, 80.6480],
  'Guntur': [16.3067, 80.4365],
  'Visakhapatnam': [17.6868, 83.2185],
  'Kurnool': [15.8281, 78.0373],
  'Nellore': [14.4426, 79.9865],
  'East Godavari': [16.9891, 82.2475],
  'Chittoor': [13.2172, 79.1003],
  'London': [51.5074, -0.1278],
  'Birmingham': [52.4862, -1.8904],
  'Manchester': [53.4808, -2.2426],
  'Leeds': [53.8008, -1.5491],
};

function getCondition(road) {
  if (road.flag) return 'red'; // Overdue/Flagged
  
  const lastRelay = new Date(road.lastRelayDate);
  const now = new Date();
  const yearsDiff = (now - lastRelay) / (1000 * 60 * 60 * 24 * 365.25);
  
  if (yearsDiff > 5) return 'red';
  if (yearsDiff >= 3) return 'amber';
  return 'green';
}

const COLOR_MAP = {
  'green': '#22c55e',
  'amber': '#f59e0b',
  'red': '#ef4444'
};

// Inner component to detect when tiles finish loading
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
  const [filterType, setFilterType] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Reset filters when country changes
  useEffect(() => {
    setFilterType('All');
    setFilterCondition('All');
    setFilterDistrict('All');
  }, [country]);

  // Derive districts dynamically based on roads present in the active country
  const availableDistricts = useMemo(() => {
    const districts = new Set(
      roadsData
        .filter(road => (road.country || 'IN') === country)
        .map(road => road.district)
    );
    return Array.from(districts).sort();
  }, [country]);

  const filteredRoads = useMemo(() => {
    return roadsData.filter(road => {
      const roadCountry = road.country || 'IN';
      if (roadCountry !== country) return false;

      const cond = getCondition(road);
      const condMatch = filterCondition === 'All' || 
                       (filterCondition === 'Good' && cond === 'green') ||
                       (filterCondition === 'Due' && cond === 'amber') ||
                       (filterCondition === 'Overdue' && cond === 'red');
      
      const typeMatch = filterType === 'All' || road.type === filterType;
      const distMatch = filterDistrict === 'All' || road.district === filterDistrict;

      return condMatch && typeMatch && distMatch;
    });
  }, [country, filterType, filterCondition, filterDistrict]);

  const complaintsList = Object.values(MOCK_COMPLAINTS).filter(c => {
    const road = roadsData.find(r => r.id === c.road);
    if (!road) return false;
    const roadCountry = road.country || 'IN';
    if (roadCountry !== country) return false;

    const distMatch = filterDistrict === 'All' || road.district === filterDistrict;
    return distMatch;
  });

  const countryCenter = country === 'GB' ? [54.0, -2.5] : [16.5, 80.6];
  const countryZoom = country === 'GB' ? 6 : 8;

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900">
      {/* Map Loading Skeleton */}
      {!mapLoaded && <MapLoadingSkeleton />}
      {/* Filter Bar Header */}
      <div className="absolute top-0 inset-x-0 z-[1000] p-3 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/60 p-3 pointer-events-auto shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white font-semibold flex items-center gap-2 text-sm">
              <Filter size={14} className="text-indigo-400" />
              {t('mapFiltersTitle')}
            </h2>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs text-indigo-400 font-medium px-2 py-1 rounded hover:bg-slate-800"
            >
              {showFilters ? t('mapBtnHide') : t('mapBtnShow')}
            </button>
          </div>
          
          {showFilters && (
            <div className="space-y-3 pt-2 border-t border-slate-700/50">
              <select className="w-full bg-slate-800 text-xs text-slate-200 border border-slate-600 rounded-lg p-2"
                value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}>
                <option value="All">{t('mapFilterAllDistricts')}</option>
                {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              
              <select className="w-full bg-slate-800 text-xs text-slate-200 border border-slate-600 rounded-lg p-2"
                value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="All">{t('mapFilterAllTypes')}</option>
                {Object.keys(config.road_type_map || {}).map(type => (
                  <option key={type} value={type}>
                    {config.road_type_map[type]}
                  </option>
                ))}
              </select>

              <select className="w-full bg-slate-800 text-xs text-slate-200 border border-slate-600 rounded-lg p-2"
                value={filterCondition} onChange={e => setFilterCondition(e.target.value)}>
                <option value="All">{t('mapFilterAllConditions')}</option>
                <option value="Good">{t('mapFilterGood')}</option>
                <option value="Due">{t('mapFilterDue')}</option>
                <option value="Overdue">{t('mapFilterOverdue')}</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full h-full relative z-0">
        <MapContainer 
          key={country}
          center={countryCenter} 
          zoom={countryZoom} 
          style={{ height: '100%', width: '100%', background: '#0f172a' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <TileLoadWatcher onLoaded={() => setTimeout(() => setMapLoaded(true), 500)} />
          
          {/* Road Markers */}
          {filteredRoads.map((road, idx) => {
            const baseCoords = DISTRICT_COORDS[road.district] || countryCenter;
            // slight offset so they don't perfectly overlap in the same district
            const coords = [baseCoords[0] + (idx * 0.01) - 0.03, baseCoords[1] + (idx * 0.01) - 0.03];
            const cond = getCondition(road);
            const color = COLOR_MAP[cond];

            return (
              <CircleMarker
                key={road.id}
                center={coords}
                pathOptions={{ color: 'white', weight: 2, fillColor: color, fillOpacity: 0.9 }}
                radius={9}
              >
                <Popup className="roadwatch-popup">
                  <div className="p-1 min-w-[200px]">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 text-sm">{road.name}</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full text-white ${ROAD_TYPE_COLORS[road.type]?.bg || 'bg-slate-500'}`}>
                        {road.type}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 mb-3 text-xs text-slate-600">
                      <p><strong>{t('infoLastRelaid')}:</strong> {road.lastRelayDate}</p>
                      <p><strong>{t('infoContractor')}:</strong> {road.contractor.name}</p>
                      <p><strong>{t('budgetUtilisation')}:</strong> <span className="text-emerald-600 font-bold">{road.utilised_pct}%</span></p>
                      {road.flag && (
                        <p className="text-red-600 font-semibold text-[10px] bg-red-50 p-1 rounded border border-red-200 mt-1">
                          <AlertCircle size={10} className="inline mr-1" />
                          {road.flag}
                        </p>
                      )}
                    </div>

                    <button 
                      onClick={() => onSwitchToChat(`Report issue on ${road.id}`)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-xs transition-colors"
                    >
                      Report Issue on this road
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Complaint Markers */}
          {complaintsList.map((comp, idx) => {
            const road = roadsData.find(r => r.id === comp.road);
            const baseCoords = DISTRICT_COORDS[road.district] || countryCenter;
            const coords = [baseCoords[0] + (idx * 0.015) + 0.02, baseCoords[1] - (idx * 0.015) + 0.02];

            return (
              <Marker key={comp.id} position={coords} icon={complaintIcon}>
                <Popup className="roadwatch-popup">
                  <div className="p-1">
                    <h3 className="font-bold text-red-600 text-sm mb-1">{comp.id}</h3>
                    <p className="text-xs text-slate-600 mb-2">{comp.issue}</p>
                    <button 
                      onClick={() => onSwitchToChat(`Track ${comp.id}`)}
                      className="text-xs text-indigo-600 font-medium hover:underline"
                    >
                      Track this complaint →
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 inset-x-4 z-[1000] pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/60 p-2.5 flex justify-between items-center text-[10px] text-slate-300 font-medium shadow-xl">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
            <span>{t('mapLegendGood')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500 border border-white" />
            <span>{t('mapLegendDue')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-white" />
            <span>{t('mapLegendOverdue')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
