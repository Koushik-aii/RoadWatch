import { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, WifiOff, ClipboardList, ArrowRight, RefreshCw, AlertTriangle, Search, Filter, Calendar, MessageSquare, ChevronDown } from 'lucide-react';
import { getAllHistory } from '../services/db';
import { listComplaints } from '../services/complaintsApi';
import { ComplaintRowSkeleton } from '../components/SkeletonLoaders';
import { useLanguage } from '../context/LanguageContext';

const STAGE_COLORS = ['text-blue-400', 'text-amber-400', 'text-emerald-400'];
const STAGE_BG = ['bg-blue-500/20 border-blue-600/40', 'bg-amber-500/20 border-amber-600/40', 'bg-emerald-500/20 border-emerald-600/40'];

function ComplaintRow({ complaint, isOffline, t }) {
  const stage = complaint.stage ?? (isOffline ? -1 : 0);
  const STAGE_LABELS = [t('stageFiled') || 'Filed', t('stageUnderReview') || 'Review', t('stageResolved') || 'Resolved'];
  const [expanded, setExpanded] = useState(false);

  // Time calculations
  const created = new Date(complaint.created_at || complaint.filedDate || Date.now());
  const ageDays = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
  
  let slaRemaining = null;
  if (complaint.sla_deadline && stage < 2) {
    const deadline = new Date(complaint.sla_deadline);
    const hrs = Math.floor((deadline - Date.now()) / (1000 * 60 * 60));
    if (hrs > 0) {
      slaRemaining = hrs >= 24 ? `${Math.floor(hrs / 24)}d remaining` : `${hrs}h remaining`;
    } else {
      slaRemaining = 'Overdue';
    }
  }

  return (
    <div className={`rounded-xl border ${isOffline ? 'bg-amber-900/20 border-amber-700/40' : 'bg-slate-800/60 border-slate-700/60'}`}>
      <div 
        className="p-3 cursor-pointer hover:bg-slate-700/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-xs">{complaint.complaint_id || complaint.uuid || complaint.id}</span>
              
              {complaint.is_escalated && (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-400 bg-red-900/40 px-2 py-0.5 rounded-full border border-red-500/30">
                  <AlertTriangle size={8} /> Escalated
                </span>
              )}
              
              {isOffline && (
                <span className="flex items-center gap-0.5 text-[9px] font-semibold text-amber-400 bg-amber-900/40 px-2 py-0.5 rounded-full">
                  <WifiOff size={8} /> Queued
                </span>
              )}
            </div>
            <p className="text-slate-300 text-sm mt-1 font-semibold truncate">
              {complaint.title || complaint.issue || 'Road Issue'}
            </p>
            <p className="text-slate-400 text-[10px] truncate">
              {complaint.district}, {complaint.state}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-1 text-right">
            {!isOffline && stage >= 0 && (
              <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STAGE_BG[stage]} ${STAGE_COLORS[stage]}`}>
                {STAGE_LABELS[stage]}
              </span>
            )}
            
            {slaRemaining && (
              <span className={`text-[9px] font-bold ${slaRemaining === 'Overdue' ? 'text-red-400' : 'text-amber-400'}`}>
                SLA: {slaRemaining}
              </span>
            )}
          </div>
        </div>

        {!isOffline && (
          <div className="flex gap-0.5 items-center mt-3">
            {STAGE_LABELS.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
                <div className={`w-full h-1 rounded-full ${i <= stage ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                {i <= stage && <div className={`w-1.5 h-1.5 rounded-full ${i === stage ? 'bg-indigo-400 animate-pulse' : 'bg-indigo-600'}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Clock size={9} />
            Filed {created.toLocaleDateString()} ({ageDays}d ago)
            {(complaint.overdue || slaRemaining === 'Overdue') && <span className="text-red-400 font-semibold ml-1">Overdue</span>}
          </div>
          <ChevronDown size={14} className={`text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {/* Expanded Timeline & Details */}
      {expanded && (
        <div className="px-3 pb-3 pt-3 border-t border-slate-700/60 bg-slate-800/40 text-xs text-slate-300 space-y-4">
          
          {/* Issue Photo & Road Details */}
          <div className="flex gap-3">
            {complaint.image_url || complaint.photo ? (
              <img 
                src={complaint.image_url || complaint.photo} 
                alt="Issue" 
                className="w-16 h-16 object-cover rounded-lg border border-slate-600 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500 shrink-0 border border-slate-600">
                <Camera size={18} />
                <span className="text-[8px] mt-1 uppercase tracking-wide">No Photo</span>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Location</div>
              <div className="font-semibold text-white truncate">{complaint.road_id || 'Unknown Road'}</div>
              <div className="text-[10px] mt-0.5"><span className="text-indigo-400 font-medium">{complaint.road_type}</span> • {complaint.district}, {complaint.state}</div>
              <div className="mt-1.5 flex gap-2">
                <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[9px] uppercase">{complaint.issue_type || complaint.title}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${complaint.severity === 'Critical' ? 'bg-red-900/50 text-red-400' : 'bg-slate-700 text-slate-300'}`}>{complaint.severity || 'Medium'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700/30 p-2 rounded-lg border border-slate-700/50">
              <div className="text-slate-500 text-[9px] uppercase tracking-wide flex items-center gap-1 mb-1"><Calendar size={10} /> Expected Resolution</div>
              <div className={`font-medium ${complaint.overdue ? 'text-red-400' : 'text-emerald-400'}`}>
                {complaint.sla_deadline ? new Date(complaint.sla_deadline).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="bg-slate-700/30 p-2 rounded-lg border border-slate-700/50">
              <div className="text-slate-500 text-[9px] uppercase tracking-wide mb-1">Current Status</div>
              <div className="font-medium text-white capitalize">{complaint.status}</div>
            </div>
          </div>
          
          {/* Description */}
          {complaint.description && (
            <div>
              <div className="text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">Description</div>
              <p className="text-[11px] leading-relaxed text-slate-300">{complaint.description}</p>
            </div>
          )}

          {/* Authority Contact Section */}
          <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl overflow-hidden">
            <div className="bg-indigo-500/10 px-3 py-1.5 border-b border-indigo-500/20 text-[10px] font-bold text-indigo-300 uppercase tracking-wide">
              Assigned Authority
            </div>
            <div className="p-3 space-y-2">
              <div>
                <div className="text-white font-medium text-sm">{complaint.authority_name || complaint.assigned_department || 'Pending Assignment'}</div>
                {complaint.authority_designation && <div className="text-indigo-400 text-[10px] font-medium">{complaint.authority_designation}</div>}
              </div>
              
              {(complaint.authority_email || complaint.authority_phone) && (
                <div className="pt-2 border-t border-indigo-500/10 flex flex-col gap-1.5">
                  {complaint.authority_email && (
                    <a href={`mailto:${complaint.authority_email}`} className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5">
                      <MessageSquare size={11} className="text-indigo-400" /> {complaint.authority_email}
                    </a>
                  )}
                  {complaint.authority_phone && (
                    <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <span className="text-indigo-400">📞</span> {complaint.authority_phone}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Resolution Notes */}
          {complaint.resolution_notes && (
            <div className="bg-emerald-900/20 border border-emerald-800/30 p-2.5 rounded-xl">
              <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold uppercase tracking-wide mb-1">
                <CheckCircle2 size={10} /> Resolution Notes
              </div>
              <p className="text-[11px] text-emerald-200/80 leading-relaxed">{complaint.resolution_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyComplaints() {
  const { t } = useLanguage();
  const [liveComplaints, setLiveComplaints] = useState([]);
  const [offlineComplaints, setOfflineComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all'); // all, active, resolved

  const loadComplaints = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const offline = await getAllHistory();
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

  const filteredComplaints = useMemo(() => {
    let result = [...liveComplaints];
    
    // Sort: active first, then by date descending
    result.sort((a, b) => {
      const aActive = a.stage < 2 ? 1 : 0;
      const bActive = b.stage < 2 ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive; // Active first
      
      const aDate = new Date(a.created_at || a.filedDate || 0);
      const bDate = new Date(b.created_at || b.filedDate || 0);
      return bDate - aDate;
    });

    if (filterStage === 'open') {
      result = result.filter(c => c.status && c.status.toLowerCase() === 'under review');
    } else if (filterStage === 'assigned') {
      result = result.filter(c => c.status && c.status.toLowerCase() === 'routed');
    } else if (filterStage === 'in_progress') {
      result = result.filter(c => c.status && c.status.toLowerCase() === 'in progress');
    } else if (filterStage === 'resolved') {
      result = result.filter(c => c.stage === 2 || (c.status && c.status.toLowerCase() === 'resolved'));
    } else if (filterStage === 'overdue') {
      result = result.filter(c => {
        if (!c.sla_deadline) return false;
        return new Date(c.sla_deadline) < Date.now() && c.stage < 2;
      });
    }

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(c => 
        (c.complaint_id && c.complaint_id.toLowerCase().includes(lower)) ||
        (c.uuid && c.uuid.toLowerCase().includes(lower)) ||
        (c.title && c.title.toLowerCase().includes(lower)) ||
        (c.issue && c.issue.toLowerCase().includes(lower))
      );
    }

    return result;
  }, [liveComplaints, search, filterStage]);

  const total = liveComplaints.length + offlineComplaints.length;

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-y-auto">
      <div className="shrink-0 px-4 pt-5 pb-3 bg-slate-800/90 border-b border-slate-700/60 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-indigo-400" />
            <h2 className="text-white font-bold text-base">{t('complaintsTitle') || 'My Complaints'}</h2>
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
        
        {/* Search & Filters */}
        <div className="flex gap-2 mb-1">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search IDs or issues..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <select 
            value={filterStage}
            onChange={e => setFilterStage(e.target.value)}
            className="bg-slate-700/50 border border-slate-600/50 rounded-lg py-1.5 px-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 outline-none"
          >
            <option value="all">All Complaints</option>
            <option value="open">Open (Under Review)</option>
            <option value="assigned">Assigned (Routed)</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="overdue">Overdue Only</option>
          </select>
        </div>

        {loadError && (
          <p className="text-amber-400 text-[10px] mt-2">{loadError}</p>
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
              { label: t('complaintsStatFiled') || 'Filed', value: total, color: 'text-indigo-400' },
              { label: t('complaintsStatResolved') || 'Resolved', value: liveComplaints.filter(c => c.stage === 2).length, color: 'text-emerald-400' },
              { label: t('complaintsStatOverdue') || 'Escalated', value: liveComplaints.filter(c => c.is_escalated).length, color: 'text-red-400' },
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
              <WifiOff size={10} /> {t('complaintsPendingSync', { n: offlineComplaints.length }) || `Pending Sync (${offlineComplaints.length})`}
            </div>
            <div className="space-y-2">
              {offlineComplaints.map(c => (
                <ComplaintRow key={c.id} complaint={c} isOffline t={t} />
              ))}
            </div>
          </div>
        )}

        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mb-2">
          {filterStage === 'all' ? 'All Complaints' : (filterStage === 'active' ? 'Active Complaints' : 'Resolved Complaints')}
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map(i => <ComplaintRowSkeleton key={i} />)}
          </div>
        ) : filteredComplaints.length === 0 && offlineComplaints.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <ClipboardList size={24} className="text-slate-600" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">{t('complaintsEmpty') || 'No complaints found'}</p>
              <p className="text-slate-600 text-xs mt-1 whitespace-pre-line">
                {search ? 'Try a different search term.' : 'You have not submitted any complaints yet.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredComplaints.map(c => (
              <ComplaintRow key={c.id || c.uuid || c.complaint_id} complaint={c} isOffline={false} t={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
