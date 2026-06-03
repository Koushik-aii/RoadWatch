import { ScanLine, CheckCircle2, AlertTriangle, Brain, Users, Clock3 } from 'lucide-react';
import AnimatedCounter from '../ui/AnimatedCounter';
import { DEMO_STATS } from '../../data/demoData';

/**
 * Animated dashboard statistics grid.
 * Shows key platform metrics with count-up animation and trend indicators.
 *
 * Props:
 *  - stats: object — override default demo stats
 */
export default function StatsGrid({ stats }) {
  const data = stats || DEMO_STATS;

  const cards = [
    {
      icon: ScanLine,
      label: 'Potholes Detected',
      value: data.potholes_detected,
      color: 'from-indigo-500 to-purple-500',
      textColor: 'text-indigo-400',
      trend: { value: 12, dir: 'up' },
    },
    {
      icon: CheckCircle2,
      label: 'Complaints Resolved',
      value: data.complaints_resolved,
      color: 'from-emerald-500 to-cyan-500',
      textColor: 'text-emerald-400',
      trend: { value: 8, dir: 'up' },
    },
    {
      icon: AlertTriangle,
      label: 'High Risk Roads',
      value: data.high_risk_roads,
      color: 'from-red-500 to-orange-500',
      textColor: 'text-red-400',
      trend: { value: 3, dir: 'down' },
    },
    {
      icon: Brain,
      label: 'AI Accuracy',
      value: data.ai_accuracy,
      suffix: '%',
      decimals: 1,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-400',
      trend: { value: 0.4, dir: 'up' },
    },
    {
      icon: Users,
      label: 'Citizen Reports',
      value: data.citizen_reports,
      color: 'from-cyan-500 to-blue-500',
      textColor: 'text-cyan-400',
      trend: { value: 15, dir: 'up' },
    },
    {
      icon: Clock3,
      label: 'Avg Resolution',
      value: data.avg_resolution_days,
      suffix: ' days',
      decimals: 1,
      color: 'from-amber-500 to-yellow-500',
      textColor: 'text-amber-400',
      trend: { value: 1.2, dir: 'down' },
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative rounded-xl border border-slate-800 bg-slate-900/70 p-4 group hover:border-slate-700 transition-all overflow-hidden"
        >
          {/* Background glow */}
          <div className={`absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br ${card.color} opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-opacity`} />

          <div className="relative">
            {/* Icon + Trend */}
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md`}>
                <card.icon size={14} className="text-white" />
              </div>
              {card.trend && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  card.trend.dir === 'up' && card.label.includes('Risk')
                    ? 'text-red-400 bg-red-500/10'
                    : card.trend.dir === 'down' && card.label.includes('Resolution')
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : card.trend.dir === 'up'
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-emerald-400 bg-emerald-500/10'
                }`}>
                  {card.trend.dir === 'up' ? '↑' : '↓'} {card.trend.value}%
                </span>
              )}
            </div>

            {/* Value */}
            <div className={`text-xl font-bold font-display ${card.textColor}`}>
              <AnimatedCounter
                value={card.value}
                suffix={card.suffix || ''}
                decimals={card.decimals || 0}
              />
            </div>

            {/* Label */}
            <p className="text-[10px] text-slate-500 mt-1 font-medium">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
