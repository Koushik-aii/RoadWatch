import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, ArrowUpDown } from 'lucide-react';
import SeverityBadge from '../ui/SeverityBadge';
import AIStatusLabel from '../ui/AIStatusLabel';
import TimelineProgress from '../ui/TimelineProgress';
import EmptyState from '../ui/EmptyState';
import { TableSkeleton } from '../ui/SkeletonCard';
import { AUTHORITY_STATUSES } from '../../data/mockAuthority';

/**
 * Professional complaint management table.
 *
 * Props:
 *  - complaints: array of complaint objects
 *  - loading: boolean
 *  - onStatusChange: (id, newStatus) => void
 *  - onSelectComplaint: (complaint) => void — for detail view
 */
export default function ComplaintTable({
  complaints = [],
  loading = false,
  onStatusChange,
  onSelectComplaint,
}) {
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterZone, setFilterZone] = useState('All');
  const [sortField, setSortField] = useState('created');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Get unique zones from data
  const zones = useMemo(() => {
    const set = new Set(complaints.map(c => c.zone).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [complaints]);

  // Filter + search
  const filtered = useMemo(() => {
    let result = [...complaints];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.id?.toLowerCase().includes(q) ||
        c.citizen?.toLowerCase().includes(q) ||
        c.issue?.toLowerCase().includes(q) ||
        c.zone?.toLowerCase().includes(q)
      );
    }

    if (filterSeverity !== 'All') result = result.filter(c => c.severity === filterSeverity);
    if (filterStatus !== 'All') result = result.filter(c => c.status === filterStatus);
    if (filterZone !== 'All') result = result.filter(c => c.zone === filterZone);

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'ai_confidence') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [complaints, search, filterSeverity, filterStatus, filterZone, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  }

  if (loading) return <TableSkeleton rows={6} />;

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search complaints, citizens, zones..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterSeverity}
            onChange={e => { setFilterSeverity(e.target.value); setPage(1); }}
            className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-2 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="All">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-2 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="All">All Statuses</option>
            {AUTHORITY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filterZone}
            onChange={e => { setFilterZone(e.target.value); setPage(1); }}
            className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-2 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 hidden lg:block"
          >
            {zones.map(z => <option key={z} value={z}>{z === 'All' ? 'All Zones' : z}</option>)}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span>{filtered.length} complaint{filtered.length !== 1 ? 's' : ''} found</span>
        <span>Page {page} of {totalPages}</span>
      </div>

      {/* Table (desktop) / Cards (mobile) */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description="Try adjusting your search or filters to find complaints."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-700/40">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 text-left">
                  <th className="px-3 py-2.5 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('id')}>
                    <span className="flex items-center gap-1">ID <ArrowUpDown size={10} /></span>
                  </th>
                  <th className="px-3 py-2.5 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('citizen')}>
                    <span className="flex items-center gap-1">Citizen <ArrowUpDown size={10} /></span>
                  </th>
                  <th className="px-3 py-2.5 font-semibold">Severity</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 font-semibold">Zone</th>
                  <th className="px-3 py-2.5 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('ai_confidence')}>
                    <span className="flex items-center gap-1">AI Conf. <ArrowUpDown size={10} /></span>
                  </th>
                  <th className="px-3 py-2.5 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('created')}>
                    <span className="flex items-center gap-1">Date <ArrowUpDown size={10} /></span>
                  </th>
                  <th className="px-3 py-2.5 font-semibold">SLA / Escalation</th>
                  <th className="px-3 py-2.5 font-semibold">Progress</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => onSelectComplaint?.(c)}
                  >
                    <td className="px-3 py-2.5 font-bold text-white">{c.id}</td>
                    <td className="px-3 py-2.5 text-slate-300">{c.citizen}</td>
                    <td className="px-3 py-2.5">
                      <SeverityBadge severity={c.severity} size="sm" />
                    </td>
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      <select
                        value={c.status}
                        onChange={e => onStatusChange?.(c.id, e.target.value)}
                        className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-[10px] text-white focus:outline-none focus:border-indigo-500"
                      >
                        {AUTHORITY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2.5 text-slate-400">{c.zone}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            style={{ width: `${(c.ai_confidence || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-indigo-300 font-bold">{Math.round((c.ai_confidence || 0) * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">{c.created}</td>
                    <td className="px-3 py-2.5">
                      {c.is_escalated ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">
                          Escalated
                        </span>
                      ) : c.overdue ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">
                          Overdue
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                          On Track
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <TimelineProgress currentStage={c.stage ?? 0} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-2">
            {pageData.map((c) => (
              <div
                key={c.id}
                className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-3 space-y-2 hover:border-slate-600/60 transition-colors cursor-pointer"
                onClick={() => onSelectComplaint?.(c)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-xs">{c.id}</span>
                  <SeverityBadge severity={c.severity} size="sm" />
                </div>
                <p className="text-slate-400 text-[11px] truncate">{c.issue}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 text-[10px]">{c.citizen} · {c.zone}</span>
                  <AIStatusLabel variant="verified" size="sm" animated={false} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <TimelineProgress currentStage={c.stage ?? 0} compact />
                  <select
                    value={c.status}
                    onChange={e => { e.stopPropagation(); onStatusChange?.(c.id, e.target.value); }}
                    onClick={e => e.stopPropagation()}
                    className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-[10px] text-white focus:outline-none"
                  >
                    {AUTHORITY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/40 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    p === page
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-slate-800/40 text-slate-500 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/40 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
