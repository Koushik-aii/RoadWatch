import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * "Accident Hotspots" ranking table.
 * Displays roads with highest accident severity scores.
 */
export default function AccidentHotspotsWidget() {
  // Simulated data generated based on the new backend accident analytics
  const hotspots = [
    { name: 'NH-16 (Visakhapatnam - Vijayawada)', count: 42, score: 85, trend: 'Increasing', class: 'High Risk' },
    { name: 'SH-4 (Hyderabad Highway)', count: 28, score: 72, trend: 'Increasing', class: 'High Risk' },
    { name: 'MDR-12 (Guntur Connector)', count: 15, score: 55, trend: 'Stable', class: 'Moderate Risk' },
    { name: 'ORR (Outer Ring Road)', count: 8, score: 35, trend: 'Decreasing', class: 'Moderate Risk' },
    { name: 'City Center Road', count: 2, score: 12, trend: 'Stable', class: 'Safe' },
  ];

  const maxScore = 100;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-xs font-bold text-white">
          <AlertTriangle size={14} className="text-red-400" />
          Accident Hotspots (MoRTH / iRAD)
        </h3>
        <span className="text-[10px] text-slate-500">Top {hotspots.length} identified</span>
      </div>

      <div className="space-y-3">
        {hotspots.map((road, i) => {
          const isHighRisk = road.class === 'High Risk';
          const isSafe = road.class === 'Safe';
          const color = isHighRisk ? '#f87171' : isSafe ? '#34d399' : '#fbbf24';
          const pct = (road.score / maxScore) * 100;

          return (
            <div key={road.name} className="group">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] text-slate-600 font-bold w-4 shrink-0">#{i + 1}</span>
                  <span className="text-[11px] text-slate-300 truncate font-medium">{road.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {road.trend === 'Increasing' ? <TrendingUp size={10} className="text-red-400" /> : 
                   road.trend === 'Decreasing' ? <TrendingDown size={10} className="text-emerald-400" /> : 
                   <Minus size={10} className="text-slate-500" />}
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: `${color}33`, color: color }}>
                    {road.class}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 6px ${color}80`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold w-12 text-right" style={{ color: color }}>
                  {road.score}/100
                </span>
              </div>

              {/* Details row */}
              <div className="flex items-center justify-between mt-1 text-[9px] text-slate-600">
                <span>{road.count} Accidents Logged</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
