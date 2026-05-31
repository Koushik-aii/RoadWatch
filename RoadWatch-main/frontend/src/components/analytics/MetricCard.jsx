export default function MetricCard({ icon: Icon, label, value, tone = 'emerald', detail }) {
  const tones = {
    emerald: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-300 bg-red-500/10 border-red-500/20',
    cyan: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
        {Icon && (
          <span className={`rounded-md border p-1.5 ${tones[tone] || tones.emerald}`}>
            <Icon size={14} />
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
      {detail && <div className="mt-1 text-[11px] text-slate-400">{detail}</div>}
    </div>
  );
}
