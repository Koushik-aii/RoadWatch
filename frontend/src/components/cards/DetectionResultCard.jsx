import { useState, useEffect } from 'react';

/**
 * Detection result card component.
 * Displays a single AI detection with confidence bar, severity badge,
 * repair priority, and human-readable explanation.
 *
 * Props:
 *  - detection: object { damage_type, confidence, severity, risk_score,
 *                        repair_priority, repair_timeframe, explanation,
 *                        area_percentage, bbox }
 *  - index: number (detection index for display)
 */

const SEVERITY_CONFIG = {
  Low: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    barColor: 'from-emerald-500 to-emerald-400',
    icon: '✅',
  },
  Medium: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    barColor: 'from-amber-500 to-yellow-400',
    icon: '⚠️',
  },
  High: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/30',
    barColor: 'from-orange-500 to-orange-400',
    icon: '🔶',
  },
  Critical: {
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
    barColor: 'from-red-600 to-red-400',
    icon: '🔴',
  },
};

export default function DetectionResultCard({ detection, index = 0 }) {
  const [animatedConf, setAnimatedConf] = useState(0);
  const conf = detection.confidence || 0;
  const severity = detection.severity || 'Low';
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Low;

  // Animate confidence bar
  useEffect(() => {
    const target = Math.round(conf * 100);
    let current = 0;
    const step = Math.max(1, Math.floor(target / 25));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setAnimatedConf(current);
      if (current >= target) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [conf]);

  return (
    <div
      className={`detection-card rounded-xl border ${config.border} ${config.bg} backdrop-blur-sm p-3.5 space-y-3`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header: type + severity badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🕳️</span>
          <div>
            <h4 className="text-white text-sm font-semibold">
              {detection.damage_type || 'Pothole'} #{index + 1}
            </h4>
            <p className="text-slate-400 text-[10px]">
              Area: {(detection.area_percentage || 0).toFixed(1)}% of surface
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${config.color} ${config.bg} border ${config.border}`}
        >
          {config.icon} {severity}
        </span>
      </div>

      {/* Confidence bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-400 font-medium">AI Confidence</span>
          <span className={`text-xs font-bold ${config.color}`}>{animatedConf}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${config.barColor} transition-all duration-700 ease-out`}
            style={{ width: `${animatedConf}%` }}
          />
        </div>
      </div>

      {/* Repair priority */}
      <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2.5">
        <div>
          <p className="text-[10px] text-slate-500 font-medium">Repair Priority</p>
          <p className={`text-xs font-bold ${config.color}`}>{detection.repair_priority || 'Routine'}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 font-medium">Timeframe</p>
          <p className="text-xs font-bold text-white">{detection.repair_timeframe || '7 Days'}</p>
        </div>
      </div>

      {/* AI Explanation */}
      {detection.explanation && (
        <div className="bg-slate-800/30 rounded-lg p-2.5 border border-slate-700/30">
          <p className="text-[10px] text-slate-500 font-medium mb-1 flex items-center gap-1">
            <span>🤖</span> AI Analysis
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {detection.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
