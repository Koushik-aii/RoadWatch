import { ExternalLink, Calendar, User, Clock, ChevronRight } from 'lucide-react';
import { ROAD_TYPE_COLORS } from '../../data/mockData';
import { useCountry } from '../../context/CountryContext';
import { useLanguage } from '../../context/LanguageContext';

const severityColor = {
  high: 'bg-blue-500',
  medium: 'bg-yellow-500',
  low: 'bg-slate-400',
};

export default function RoadInfoCard({ data }) {
  const { config } = useCountry();
  const { t } = useLanguage();
  const colors = ROAD_TYPE_COLORS[data.type] || ROAD_TYPE_COLORS['NH'];
  const displayType = config.road_type_map[data.type] || data.type;

  return (
    <div className={`rounded-2xl bg-slate-800/80 border-l-4 ${colors.border} overflow-hidden w-full`}>
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3 gap-2">
        <div>
          <h3 className="font-semibold text-white text-sm leading-snug">{data.name}</h3>
          <p className="text-slate-400 text-xs mt-0.5">{data.state} · {data.district} · {data.length}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${colors.bg}`}>
          {displayType}
        </span>
      </div>

      <div className="px-4 pb-2 grid grid-cols-2 gap-3 text-xs">
        {/* Relay Date */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <Calendar size={13} className={colors.text} />
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wide">{t('infoLastRelaid')}</div>
            <div className="font-medium">{data.lastRelayDate}</div>
          </div>
        </div>
        {/* Contractor */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <User size={13} className={colors.text} />
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wide">{t('infoContractor')}</div>
            <div className="font-medium leading-tight">{data.contractor}</div>
            <div className="text-slate-500 text-[10px]">{data.licenseNo}</div>
          </div>
        </div>
      </div>

      {/* Maintenance Timeline */}
      <div className="px-4 pb-3">
        <div className="text-slate-500 text-[10px] uppercase tracking-wide mb-2 flex items-center gap-1">
          <Clock size={10} /> {t('infoMaintenanceTitle')}
        </div>
        <div className="relative pl-3 border-l border-slate-700 space-y-2">
          {data.maintenanceHistory.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className={`absolute -left-[4.5px] mt-1 w-2 h-2 rounded-full ${severityColor[item.severity]}`} />
              <div className="pl-2">
                <span className={`text-[10px] font-semibold ${colors.text}`}>{item.date}</span>
                <span className="text-slate-400 text-[10px] ml-1">{item.event}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Source */}
      <div className={`flex items-center justify-between px-4 py-2.5 bg-slate-700/40 text-[10px]`}>
        <span className="text-slate-500 uppercase tracking-wide">{t('infoSource')}</span>
        <a
          href={data.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1 font-semibold ${colors.text} hover:underline`}
        >
          {data.source} — {data.sourceUrl.replace('https://', '')}
          <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
