import { ExternalLink, Calendar, User, Clock, CheckCircle, Shield, Briefcase, FileText, AlertTriangle } from 'lucide-react';
import { ROAD_TYPE_COLORS } from '../../data/mockData';
import { useCountry } from '../../context/CountryContext';
import { useLanguage } from '../../context/LanguageContext';
import SourceCitation from '../common/SourceCitation';

const severityColor = {
  high: 'bg-blue-500',
  medium: 'bg-yellow-500',
  low: 'bg-slate-400',
};

export default function RoadInfoCard({ data }) {
  const { config } = useCountry();
  const { t } = useLanguage();
  
  if (!data) return null;

  const colors = ROAD_TYPE_COLORS[data.type] || ROAD_TYPE_COLORS['NH'];
  const displayType = config.road_type_map[data.type] || data.type;
  
  const unavailable = "Unavailable";

  // Data mappings from backend RoadDetail schema
  const length = data.length_km ? `${data.length_km} km` : unavailable;
  const relayDate = data.relay_date || unavailable;
  const nextDueDate = data.next_due_date || unavailable;
  const contractor = data.contractor_name || unavailable;
  const licenseNo = data.contractor_license || "No public record"; // if added to backend, otherwise default
  const maintenanceAgency = (data.routed_authority && data.routed_authority.authority_name) || unavailable;
  
  const hasHistory = data.repair_history && data.repair_history.length > 0;

  return (
    <div className={`rounded-2xl bg-slate-800/80 border-l-4 ${colors.border} overflow-hidden w-full`}>
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3 gap-2">
        <div>
          <h3 className="font-semibold text-white text-sm leading-snug">{data.name}</h3>
          <p className="text-slate-400 text-xs mt-0.5">{data.district || unavailable} · {data.state || unavailable} · {length}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${colors.bg}`}>
          {displayType}
        </span>
      </div>

      <div className="px-4 pb-2 grid grid-cols-2 gap-3 text-xs">
        {/* Relay Date */}
        <div className="flex items-start gap-1.5 text-slate-300">
          <Calendar size={13} className={`${colors.text} mt-0.5`} />
          <div>
            <div className="text-slate-500 text-[9px] uppercase tracking-wide">Last Relaid</div>
            <div className={`font-medium ${relayDate === unavailable ? 'text-slate-500 italic' : ''}`}>{relayDate}</div>
          </div>
        </div>
        
        {/* Next Due Date */}
        <div className="flex items-start gap-1.5 text-slate-300">
          <Clock size={13} className={`${colors.text} mt-0.5`} />
          <div>
            <div className="text-slate-500 text-[9px] uppercase tracking-wide">Next Due Date</div>
            <div className={`font-medium ${nextDueDate === unavailable ? 'text-slate-500 italic' : ''}`}>{nextDueDate}</div>
          </div>
        </div>
        

        {/* Maintenance Agency */}
        <div className="flex items-start gap-1.5 text-slate-300">
          <Shield size={13} className={`${colors.text} mt-0.5`} />
          <div>
            <div className="text-slate-500 text-[9px] uppercase tracking-wide">Maintenance Agency</div>
            <div className={`font-medium leading-tight ${maintenanceAgency === unavailable ? 'text-slate-500 italic' : ''}`}>{maintenanceAgency}</div>
          </div>
        </div>
      </div>

      {/* Maintenance Timeline */}
      {hasHistory && (
        <div className="px-4 pb-3 mt-2">
          <div className="text-slate-500 text-[10px] uppercase tracking-wide mb-2 flex items-center gap-1">
            <CheckCircle size={10} /> Maintenance History
          </div>
          <div className="relative pl-3 border-l border-slate-700 space-y-2">
            {data.repair_history.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={`absolute -left-[4.5px] mt-1 w-2 h-2 rounded-full ${severityColor[item.severity] || severityColor.low}`} />
                <div className="pl-2">
                  <span className={`text-[10px] font-semibold ${colors.text}`}>{item.date}</span>
                  <span className="text-slate-400 text-[10px] ml-1">{item.event}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contractor Transparency */}
      {data.contractor && (
        <div className="px-4 pb-3 mt-2 border-t border-slate-700/50 pt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-500 text-[10px] uppercase tracking-wide flex items-center gap-1">
              <Briefcase size={10} className="text-amber-400" /> Contractor Transparency
            </div>
            {data.contractor.repeat_failure_flag && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                <AlertTriangle size={8} /> Repeat Failures Detected
              </span>
            )}
          </div>
          
          <div className="bg-slate-900/40 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Assigned Contractor</div>
                <div className="text-sm font-semibold text-slate-200">{data.contractor.name}</div>
                <div className="text-[9px] text-slate-400">{data.contractor.agency || 'Unknown Agency'}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Contract Value</div>
                <div className="text-sm font-bold text-emerald-400">{data.contractor.contract_value ? `₹${data.contractor.contract_value} Cr` : 'N/A'}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50">
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Completion Date</div>
                <div className="text-xs font-semibold text-slate-300">{data.contractor.completion_date || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Maintenance Warranty</div>
                <div className="text-xs font-semibold text-slate-300">{data.contractor.maintenance_warranty_years ? `${data.contractor.maintenance_warranty_years} Years` : 'N/A'}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50">
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Roads Handled</div>
                <div className="text-xs font-semibold text-slate-300">{data.contractor.roads_handled}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Total Complaints</div>
                <div className={`text-xs font-semibold ${data.contractor.repeat_failure_flag ? 'text-red-400' : 'text-slate-300'}`}>
                  {data.contractor.complaint_count}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accident & Safety Analytics */}
      {(data.accident_count !== undefined) && (
        <div className="px-4 pb-3 mt-2 border-t border-slate-700/50 pt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-500 text-[10px] uppercase tracking-wide flex items-center gap-1">
              <Shield size={10} className="text-red-400" /> Accident & Safety Analytics
            </div>
            {data.risk_classification && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                data.risk_classification === 'Safe' ? 'bg-emerald-500/20 text-emerald-400' :
                data.risk_classification === 'High Risk' ? 'bg-red-500/20 text-red-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {data.risk_classification}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2 bg-slate-900/40 rounded-lg p-2">
            <div>
              <div className="text-[9px] text-slate-500 uppercase">Count</div>
              <div className="text-xs font-semibold text-slate-200">{data.accident_count}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase">Severity</div>
              <div className="text-xs font-semibold text-slate-200">{data.accident_severity_score}/100</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase">Trend</div>
              <div className={`text-xs font-semibold ${
                data.accident_trend === 'Increasing' ? 'text-red-400' :
                data.accident_trend === 'Decreasing' ? 'text-emerald-400' : 'text-slate-300'
              }`}>{data.accident_trend}</div>
            </div>
          </div>
          <div className="text-[8px] text-slate-500 mt-1.5 text-right italic">
            Source: {data.accident_source || 'MoRTH / iRAD datasets'}
          </div>
        </div>
      )}

      {/* Source */}
      <SourceCitation verification={data.verification} />
    </div>
  );
}
