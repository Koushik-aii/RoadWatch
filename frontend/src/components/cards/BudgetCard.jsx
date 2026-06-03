import { ExternalLink, AlertTriangle, TrendingUp, ShieldCheck, FileText, Calendar, Building } from 'lucide-react';
import { useCountry } from '../../context/CountryContext';
import { useLanguage } from '../../context/LanguageContext';
import SourceCitation from '../common/SourceCitation';

export default function BudgetCard({ data }) {
  const { config } = useCountry();
  const { t } = useLanguage();
  
  if (!data) return null;

  const pct = data.budget_utilised_pct || 0;
  const anomalies = data.budget_anomalies || [];
  
  // Format currency
  const currencyUnit = config.code === 'GB' ? 'M' : 'Cr';
  const formatCurrency = (val) => {
    if (val === null || val === undefined) return 'Unavailable';
    return `${config.currency}${val} ${currencyUnit}`;
  };

  const sanctioned = formatCurrency(data.budget_sanctioned);
  const released = formatCurrency(data.budget_released);
  const spent = formatCurrency(data.budget_spent);

  const unavailable = <span className="text-slate-500 italic">Unavailable</span>;

  return (
    <div className="rounded-2xl bg-slate-800/90 border border-emerald-500/30 overflow-hidden w-full shadow-lg">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-emerald-900/40 to-slate-800/90 border-b border-emerald-500/20">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-emerald-400">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Public Financials</span>
            </div>
            <h3 className="font-bold text-white text-sm leading-tight">{data.name}</h3>
            {data.segment && <p className="text-emerald-300/70 text-xs mt-0.5">{data.segment}</p>}
          </div>
        </div>
      </div>

      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <div className="mx-4 mt-3 mb-1 space-y-1.5">
          {anomalies.map((anomaly, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-red-900/30 border border-red-700/50 rounded-lg px-2.5 py-2">
              <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs text-red-200/90 leading-snug">
                <span className="font-bold text-red-400 mr-1">Alert:</span>
                {anomaly}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Budget Numbers */}
      <div className="px-4 py-3 grid grid-cols-3 gap-2">
        <div className="bg-slate-700/40 rounded-xl p-2.5 text-center border border-slate-600/30">
          <div className="text-slate-400 text-[9px] font-semibold uppercase tracking-wider">Sanctioned</div>
          <div className={`font-bold text-sm mt-0.5 ${data.budget_sanctioned ? 'text-white' : 'text-slate-500 italic font-medium'}`}>
            {sanctioned}
          </div>
        </div>
        <div className="bg-slate-700/40 rounded-xl p-2.5 text-center border border-slate-600/30">
          <div className="text-slate-400 text-[9px] font-semibold uppercase tracking-wider">Released</div>
          <div className={`font-bold text-sm mt-0.5 ${data.budget_released ? 'text-indigo-300' : 'text-slate-500 italic font-medium'}`}>
            {released}
          </div>
        </div>
        <div className="bg-slate-700/40 rounded-xl p-2.5 text-center border border-slate-600/30">
          <div className="text-slate-400 text-[9px] font-semibold uppercase tracking-wider">Spent</div>
          <div className={`font-bold text-sm mt-0.5 ${data.budget_spent ? 'text-emerald-400' : 'text-slate-500 italic font-medium'}`}>
            {spent}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {data.budget_sanctioned > 0 && data.budget_spent >= 0 && (
        <div className="px-4 pb-3">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 font-medium"><TrendingUp size={11} className="text-emerald-400"/> Utilization</span>
            <span className="font-bold text-emerald-400">{pct.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-700/80 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${pct > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Detailed Source Citation */}
      <div className="border-t border-slate-700/60 bg-slate-800/60 px-4 py-3 text-[10px] space-y-2">
        <div className="text-slate-500 font-bold uppercase tracking-widest mb-1">Source Citation</div>
        
        <div className="grid grid-cols-2 gap-2 text-slate-300">
          <div className="flex items-start gap-1.5">
            <Building size={11} className="text-slate-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-slate-500 text-[8px] uppercase">Funding Agency</div>
              <div className="font-medium truncate" title={data.funding_agency}>{data.funding_agency || unavailable}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-1.5">
            <FileText size={11} className="text-slate-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-slate-500 text-[8px] uppercase">Document ID</div>
              <div className="font-medium truncate" title={data.source_document_id}>{data.source_document_id || unavailable}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-1.5">
            <Calendar size={11} className="text-slate-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-slate-500 text-[8px] uppercase">Last Updated</div>
              <div className="font-medium">{data.budget_last_updated || unavailable}</div>
            </div>
          </div>

          <div className="flex items-start gap-1.5">
            <Calendar size={11} className="text-slate-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-slate-500 text-[8px] uppercase">Last Updated</div>
              <div className="font-medium">{data.budget_last_updated || unavailable}</div>
            </div>
          </div>
        </div>
      </div>
      
      <SourceCitation verification={data.verification} />
    </div>
  );
}
