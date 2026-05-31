import { useState, useEffect, useCallback } from 'react';
import { Clock, WifiOff, ClipboardList, ArrowRight, RefreshCw } from 'lucide-react';
import { getComplaints } from '../services/db';
import { listComplaints } from '../services/complaintsApi';
import { ComplaintRowSkeleton } from '../components/SkeletonLoaders';
import { useLanguage } from '../context/LanguageContext';

const STAGE_COLORS = ['text-blue-400', 'text-amber-400', 'text-emerald-400'];
const STAGE_BG = ['bg-blue-500/20 border-blue-600/40', 'bg-amber-500/20 border-amber-600/40', 'bg-emerald-500/20 border-emerald-600/40'];

function ComplaintRow({ complaint, isOffline, t }) {
  const stage = complaint.stage ?? (isOffline ? -1 : 0);
  const STAGE_LABELS = [t('stageFiled'), t('stageUnderReview'), t('stageResolved')];

  return (
    <div className={`rounded-xl border p-3 space-y-2 ${isOffline ? 'bg-amber-900/20 border-amber-700/40' : 'bg-slate-800/60 border-slate-700/60'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-xs">{complaint.id}</span>
            {isOffline && (
              <span className="flex items-center gap-0.5 text-[9px] font-semibold text-amber-400 bg-amber-900/40 px-2 py-0.5 rounded-full">
                <WifiOff size={8} /> Queued
              </span>
            )}
          </div>
          <p className="text-slate-400 text-[10px] mt-0.5 truncate">
            {complaint.issue || `${complaint.formState?.defectType || 'Issue'} on ${complaint.road || complaint.roadType}`}
          </p>
        </div>
        {!isOffline && stage >= 0 && (
          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STAGE_BG[stage]} ${STAGE_COLORS[stage]}`}>
            {STAGE_LABELS[stage]}
          </span>
        )}
      </div>

      {!isOffline && (
        <div className="flex gap-0.5 items-center">
          {STAGE_LABELS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
              <div className={`w-full h-1 rounded-full ${i <= stage ? 'bg-indigo-500' : 'bg-slate-700'}`} />
              {i <= stage && <div className={`w-1.5 h-1.5 rounded-full ${i === stage ? 'bg-indigo-400 animate-pulse' : 'bg-indigo-600'}`} />}
            </div>
          ))}
        </div>
      )}

      <div className="text-[10px] text-slate-500 flex items-center gap-1">
        <Clock size={9} />
        {t('complaintsFiled')} {complaint.filedDate || (complaint.created_at ? complaint.created_at.slice(0, 10) : '')}
        {complaint.overdue && <span className="text-red-400 font-semibold ml-1">{t('complaintsOverdueBadge')}</span>}
      </div>
    </div>
  );
}

export default function MyComplaints() {
  const { t } = useLanguage();
  const [liveComplaints, setLiveComplaints] = useState([]);
  const [offlineComplaints, setOfflineComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadComplaints = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const offline = await getComplaints();
      setOfflineComplaints(offline || []);

      if (navigator.onLine) {
        const res = await listComplaints({ page: 1, page_size: 100 });
        setLiveComplaints(res.items || []);
      } else {
        setLiveComplaints([]);
        setLoadError('Offline — showing queued complaints only.');
      }
    } catch (err) {
      console.warn('[MyComplaints] API load failed:', err);
      setLoadError(err.message || 'Could not load complaints from server.');
      setLiveComplaints([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const total = liveComplaints.length + offlineComplaints.length;

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-y-auto">
      <div className="shrink-0 px-4 pt-5 pb-3 bg-slate-800/90 border-b border-slate-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-indigo-400" />
            <h2 className="text-white font-bold text-base">{t('complaintsTitle')}</h2>
          </div>
          <button
            onClick={loadComplaints}
            disabled={isLoading}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        {isLoading ? (
          <div className="h-3 bg-slate-700 rounded w-32 mt-1.5 animate-pulse" />
        ) : (
          <p className="text-slate-400 text-xs mt-0.5">
            {t('complaintsTotalStat', {
              total,
              resolved: liveComplaints.filter(c => c.stage === 2).length,
            })}
          </p>
        )}
        {loadError && (
          <p className="text-amber-400 text-[10px] mt-1">{loadError}</p>
        )}
      </div>

      <div className="flex-1 px-3 py-4 space-y-2">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 text-center animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-8 mx-auto" />
                <div className="h-2 bg-slate-700/60 rounded w-12 mx-auto mt-1.5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: t('complaintsStatFiled'), value: total, color: 'text-indigo-400' },
              { label: t('complaintsStatResolved'), value: liveComplaints.filter(c => c.stage === 2).length, color: 'text-emerald-400' },
              { label: t('complaintsStatOverdue'), value: liveComplaints.filter(c => c.overdue).length, color: 'text-red-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 text-center">
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-slate-500 text-[9px] uppercase tracking-wide mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {offlineComplaints.length > 0 && (
          <div className="mb-4">
            <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wide mb-2 flex items-center gap-1">
              <WifiOff size={10} /> {t('complaintsPendingSync', { n: offlineComplaints.length })}
            </div>
            <div className="space-y-2">
              {offlineComplaints.map(c => (
                <ComplaintRow key={c.id} complaint={c} isOffline t={t} />
              ))}
            </div>
          </div>
        )}

        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mb-2">{t('complaintsAllLabel')}</div>
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map(i => <ComplaintRowSkeleton key={i} />)}
          </div>
        ) : liveComplaints.length === 0 && offlineComplaints.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <ClipboardList size={24} className="text-slate-600" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">{t('complaintsEmpty')}</p>
              <p className="text-slate-600 text-xs mt-1 whitespace-pre-line">{t('complaintsEmptyHint')}</p>
            </div>
            <div className="flex items-center gap-1 text-indigo-400 text-xs font-medium bg-indigo-900/20 border border-indigo-800/40 px-3 py-1.5 rounded-full">
              <ArrowRight size={11} /> {t('complaintsEmptyCTA')}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {liveComplaints.map(c => (
              <ComplaintRow key={c.id || c.uuid} complaint={c} isOffline={false} t={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
