import { Briefcase, AlertTriangle } from 'lucide-react';

export default function RecurringContractorsWidget() {
  const contractors = [
    { name: 'RVR Construction Pvt Ltd', complaints: 14, activeSLA: 5, status: 'Review Required' },
    { name: 'KNR Infrastructures', complaints: 8, activeSLA: 2, status: 'Warning' },
    { name: 'L&T Transportation', complaints: 3, activeSLA: 0, status: 'Satisfactory' },
  ];

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 lg:p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase size={16} className="text-amber-500" />
        <div>
          <h2 className="font-display font-bold text-sm text-slate-100">Recurring Contractors</h2>
          <p className="text-slate-500 text-[10px] mt-0.5">Top entities with frequent road defects</p>
        </div>
      </div>

      <div className="space-y-3">
        {contractors.map((c, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/50 pb-3 last:border-0 last:pb-0">
            <div>
              <p className="text-xs font-semibold text-slate-200 truncate max-w-[150px]" title={c.name}>{c.name}</p>
              <div className="flex items-center gap-3 mt-1 text-[9px]">
                <span className="text-slate-400">{c.complaints} total complaints</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {c.activeSLA > 0 ? (
                <div className="flex items-center gap-1 bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 text-[9px] font-bold">
                  <AlertTriangle size={10} /> {c.activeSLA} SLA Breaches
                </div>
              ) : (
                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 text-[9px] font-bold">
                  0 Breaches
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
