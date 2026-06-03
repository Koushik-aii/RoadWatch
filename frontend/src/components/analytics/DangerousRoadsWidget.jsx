import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import SeverityBadge from '../ui/SeverityBadge';
import { getSeverityClasses } from '../../utils/severityUtils';
import { DEMO_DANGEROUS_ROADS } from '../../data/demoData';

/**
 * "Most Dangerous Roads" analytics widget.
 *
 * Props:
 *  - roads: array — override default demo data
 */
export default function DangerousRoadsWidget({ roads }) {
  const data = roads || DEMO_DANGEROUS_ROADS;
  const maxScore = Math.max(...data.map(r => r.risk_score), 1);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-xs font-bold text-white">
          <AlertTriangle size={14} className="text-red-400" />
          Most Dangerous Roads
        </h3>
        <span className="text-[10px] text-slate-500">{data.length} flagged</span>
      </div>

      <div className="space-y-3">
        {data.slice(0, 6).map((road, i) => {
          const styles = getSeverityClasses(road.avg_severity);
          const pct = (road.risk_score / maxScore) * 100;

          return (
            <div key={road.name} className="group">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] text-slate-600 font-bold w-4 shrink-0">#{i + 1}</span>
                  <span className="text-[11px] text-slate-300 truncate font-medium">{road.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <TrendIndicator trend={road.trend} />
                  <SeverityBadge severity={road.avg_severity} size="sm" showIcon={false} />
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${styles.hex}, ${styles.hex}cc)`,
                      boxShadow: `0 0 6px ${styles.glow}`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold w-12 text-right" style={{ color: styles.hex }}>
                  {road.risk_score}
                </span>
              </div>

              {/* Details row */}
              <div className="flex items-center gap-3 mt-1 text-[9px] text-slate-600">
                <span>{road.complaints} complaints</span>
                <span>Risk score: {road.risk_score}/100</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrendIndicator({ trend }) {
  if (trend === 'up') return <TrendingUp size={10} className="text-red-400" />;
  if (trend === 'down') return <TrendingDown size={10} className="text-emerald-400" />;
  return <Minus size={10} className="text-slate-500" />;
}
