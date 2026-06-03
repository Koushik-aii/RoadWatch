import { ChevronRight, MapPin } from 'lucide-react';
import { ROAD_TYPE_COLORS } from '../../data/mockData';
import { useCountry } from '../../context/CountryContext';
import { useLanguage } from '../../context/LanguageContext';

export default function RoadListCard({ data, onSelectRoad }) {
  const { config } = useCountry();
  const { t } = useLanguage();

  if (!data || data.length === 0) return null;

  return (
    <div className="rounded-2xl bg-slate-800/80 border border-slate-700 overflow-hidden w-full">
      <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700/60">
        <h3 className="font-semibold text-white text-sm">Matches Found ({data.length})</h3>
        <p className="text-slate-400 text-xs mt-0.5">Please select a road for more details:</p>
      </div>
      
      <div className="flex flex-col">
        {data.map((item, idx) => {
          const colors = ROAD_TYPE_COLORS[item.road.type] || ROAD_TYPE_COLORS['NH'];
          const displayType = config.road_type_map[item.road.type] || item.road.type;
          
          return (
            <button
              key={idx}
              onClick={() => onSelectRoad(item.road.id)}
              className="flex items-center justify-between px-4 py-3 border-b border-slate-700/40 hover:bg-slate-700/40 transition-colors text-left last:border-b-0"
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded text-white ${colors.bg}`}>
                    {displayType}
                  </span>
                  <span className="font-semibold text-sm text-slate-200 truncate">{item.road.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={10} />
                  <span className="truncate">{item.road.district}, {item.road.state}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500 shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
