import { useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, ChevronRight, ExternalLink, Activity, Circle } from 'lucide-react';
import { useCountry } from '../../context/CountryContext';
import { useLanguage } from '../../context/LanguageContext';

export default function TrackComplaintCard({ data }) {
  const { config } = useCountry();
  const { t } = useLanguage();
  const STAGES = [t('stageFiled'), t('stageUnderReview'), t('stageResolved')];
  const [showEscalation, setShowEscalation] = useState(false);
  const filedDate = new Date(data.filedDate);
  const expectedDate = new Date(filedDate);
  expectedDate.setDate(expectedDate.getDate() + data.expectedDays);

  return (
    <div className={`rounded-2xl bg-slate-800/80 border-l-4 ${data.overdue ? 'border-red-500' : 'border-indigo-500'} overflow-hidden w-full`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white text-sm">{data.id}</h3>
            {data.overdue ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-900/60 text-red-400 border border-red-700/50">
                {t('trackOverdue')}
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-700/50">
                {t('trackOnTrack')}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-[10px] mt-0.5 leading-tight">{data.issue}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-4">
        <div className="relative flex items-center justify-between">
          {/* Connecting lines */}
          <div className="absolute inset-x-0 top-3 h-0.5 bg-slate-700" />
          <div
            className={`absolute top-3 left-0 h-0.5 transition-all duration-700 ${data.overdue ? 'bg-red-500' : 'bg-indigo-500'}`}
            style={{ width: data.stage === 0 ? '0%' : data.stage === 1 ? '50%' : '100%' }}
          />

          {STAGES.map((stage, i) => {
            const isActive = i <= data.stage;
            const isCurrent = i === data.stage;
            return (
              <div key={stage} className="flex flex-col items-center gap-1.5 z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                  isActive
                    ? data.overdue && isCurrent
                      ? 'bg-red-500 border-red-400'
                      : 'bg-indigo-500 border-indigo-400'
                    : 'bg-slate-700 border-slate-600'
                }`}>
                  {i < data.stage ? (
                    <CheckCircle2 size={12} className="text-white" />
                  ) : isCurrent ? (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  ) : (
                    <Circle size={8} className="text-slate-500" />
                  )}
                </div>
                <span className={`text-[9px] font-medium text-center leading-tight ${isActive ? 'text-slate-200' : 'text-slate-600'}`}>
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Grid */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-slate-700/40 rounded-lg p-2">
          <div className="text-slate-500 uppercase tracking-wide">{t('trackFiled')}</div>
          <div className="text-white font-medium">{data.filedDate}</div>
        </div>
        <div className="bg-slate-700/40 rounded-lg p-2">
          <div className="text-slate-500 uppercase tracking-wide">{t('trackExpectedBy')}</div>
          <div className={`font-medium ${data.overdue ? 'text-red-400' : 'text-white'}`}>
            {expectedDate.toISOString().slice(0, 10)}
          </div>
        </div>
        <div className="bg-slate-700/40 rounded-lg p-2">
          <div className="text-slate-500 uppercase tracking-wide flex items-center gap-1"><Clock size={8} /> {t('trackElapsed')}</div>
          <div className={`font-medium ${data.overdue ? 'text-red-400' : 'text-white'}`}>{t('trackDays', { days: data.daysElapsed })}</div>
        </div>
        <div className="bg-slate-700/40 rounded-lg p-2">
          <div className="text-slate-500 uppercase tracking-wide">{t('trackAuthority')}</div>
          <div className="text-white font-medium leading-tight">{data.authority}</div>
        </div>
      </div>

      {/* Overdue Escalation */}
      {data.overdue && (
        <div className="mx-4 mb-3 flex items-start gap-2 bg-red-900/30 border border-red-700/50 rounded-xl px-3 py-2">
          <AlertTriangle size={13} className="text-red-400 shrink-0 mt-0.5" />
          <div className="text-[10px] text-red-300">
            <strong className="text-red-400">{t('trackOverdueAlert', { days: data.daysElapsed - data.expectedDays })}</strong>
            {' '}{t('trackEscalate', { name: data.escalation })}
          </div>
        </div>
      )}

      {/* Authority Email */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-700/40 text-[10px]">
          <div className="font-semibold text-white text-sm">{config?.code === 'GB' ? config.authority_levels[0] : data.authority}</div>
          <a href={`mailto:${data.authorityEmail}`} className="text-indigo-400 text-xs hover:underline inline-flex items-center gap-1 mt-0.5">
            {config?.code === 'GB' ? config.complaint_endpoint : data.authorityEmail} <ExternalLink size={9} />
          </a>
      </div>
    </div>
  );
}
