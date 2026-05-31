import { SEVERITY_COLORS } from '../../services/analyticsApi';

const FALLBACK_COLORS = ['#22c55e', '#0ea5e9', '#f59e0b', '#ef4444', '#a855f7'];

export function TrendChart({ data = [] }) {
  const width = 320;
  const height = 120;
  const max = Math.max(1, ...data.map((d) => d.complaints || 0));
  const points = data.map((d, index) => {
    const x = data.length <= 1 ? width : (index / (data.length - 1)) * width;
    const y = height - ((d.complaints || 0) / max) * (height - 18) - 8;
    return `${x},${y}`;
  });

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white">Complaint trends</h3>
        <span className="text-[10px] text-slate-500">last {data.length || 0} active days</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full overflow-visible">
        <polyline points={points.join(' ')} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
        {data.map((d, index) => {
          const [x, y] = points[index]?.split(',').map(Number) || [0, height];
          return <circle key={`${d.date}-${index}`} cx={x} cy={y} r="3" fill="#f8fafc" />;
        })}
      </svg>
    </div>
  );
}

export function DonutChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let offset = 25;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
      <h3 className="mb-3 text-xs font-semibold text-white">Severity distribution</h3>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 42 42" className="h-24 w-24 shrink-0 rotate-[-90deg]">
          {data.map((item, index) => {
            const value = (item.value / total) * 100;
            const strokeDasharray = `${value} ${100 - value}`;
            const strokeDashoffset = offset;
            offset -= value;
            return (
              <circle
                key={item.name}
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke={SEVERITY_COLORS[item.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                strokeWidth="6"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </svg>
        <div className="min-w-0 flex-1 space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex min-w-0 items-center gap-2 text-slate-300">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: SEVERITY_COLORS[item.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length] }}
                />
                {item.name}
              </span>
              <span className="font-semibold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BarListChart({ title, data = [], labelKey = 'department', valueKey = 'total' }) {
  const max = Math.max(1, ...data.map((item) => item[valueKey] || 0));

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
      <h3 className="mb-3 text-xs font-semibold text-white">{title}</h3>
      <div className="space-y-3">
        {data.length === 0 && <div className="text-xs text-slate-500">No data available</div>}
        {data.slice(0, 8).map((item) => (
          <div key={`${item[labelKey]}-${item[valueKey]}`}>
            <div className="mb-1 flex justify-between gap-3 text-[11px]">
              <span className="truncate text-slate-300">{item[labelKey]}</span>
              <span className="font-semibold text-white">{item[valueKey]}</span>
            </div>
            <div className="h-2 overflow-hidden rounded bg-slate-800">
              <div
                className="h-full rounded bg-cyan-400"
                style={{ width: `${Math.max(5, ((item[valueKey] || 0) / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
