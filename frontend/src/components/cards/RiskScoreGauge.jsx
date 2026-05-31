import { useState, useEffect } from 'react';

/**
 * Semi-circular risk score gauge component.
 * Displays 0-100 score with animated fill and color gradient.
 *
 * Props:
 *  - score: number (0-1 scale, will be displayed as 0-100)
 *  - severity: string (Safe / Low / Medium / High / Critical)
 *  - size: number (default 160)
 */
export default function RiskScoreGauge({ score = 0, severity = 'Safe', size = 160 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score on mount / change
  useEffect(() => {
    const target = Math.round(score * 100);
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setAnimatedScore(current);
      if (current >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [score]);

  const displayScore = animatedScore;
  const percentage = displayScore / 100;

  // SVG arc math for semi-circle
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10;

  // Arc from 180° to 0° (left to right, top semi-circle)
  const startAngle = Math.PI;
  const endAngle = Math.PI * (1 - percentage);

  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy + radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(endAngle);
  const y2 = cy + radius * Math.sin(endAngle);

  const largeArc = percentage > 0.5 ? 1 : 0;

  const bgPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy}`;
  const fillPath = percentage > 0
    ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`
    : '';

  // Color based on severity
  const colorMap = {
    Safe: { stroke: '#22c55e', glow: 'rgba(34,197,94,0.3)', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    Low: { stroke: '#22c55e', glow: 'rgba(34,197,94,0.3)', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    Medium: { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.3)', text: 'text-amber-400', bg: 'bg-amber-500/10' },
    High: { stroke: '#f97316', glow: 'rgba(249,115,22,0.3)', text: 'text-orange-400', bg: 'bg-orange-500/10' },
    Critical: { stroke: '#ef4444', glow: 'rgba(239,68,68,0.3)', text: 'text-red-400', bg: 'bg-red-500/10' },
  };

  const colors = colorMap[severity] || colorMap.Safe;

  const labelMap = {
    Safe: 'Safe',
    Low: 'Low Risk',
    Medium: 'Moderate Risk',
    High: 'Dangerous',
    Critical: 'Critical',
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
        <svg
          width={size}
          height={size / 2 + 20}
          viewBox={`0 0 ${size} ${size / 2 + 20}`}
          className="drop-shadow-lg"
        >
          {/* Background arc */}
          <path
            d={bgPath}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Filled arc */}
          {fillPath && (
            <path
              d={fillPath}
              fill="none"
              stroke={colors.stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 6px ${colors.glow})`,
                transition: 'all 0.3s ease-out',
              }}
            />
          )}
        </svg>

        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span
            className={`text-3xl font-bold ${colors.text}`}
            style={{ textShadow: `0 0 12px ${colors.glow}` }}
          >
            {displayScore}
          </span>
          <span className="text-[10px] text-slate-500 font-medium -mt-1">/ 100</span>
        </div>
      </div>

      {/* Severity label */}
      <div
        className={`mt-1 px-3 py-1 rounded-full text-xs font-bold ${colors.text} ${colors.bg} border border-current/20`}
      >
        {labelMap[severity] || severity}
      </div>
    </div>
  );
}
