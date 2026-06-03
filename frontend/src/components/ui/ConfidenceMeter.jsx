import { useState, useEffect } from 'react';
import { getSeverityClasses, getSeverityFromScore } from '../../utils/severityUtils';

/**
 * Animated circular confidence meter.
 * Shows AI confidence as a circular arc with severity-based coloring.
 *
 * Props:
 *  - value: number (0–100 percentage)
 *  - label: string (default: 'AI Confidence')
 *  - size: number (default: 100)
 */
export default function ConfidenceMeter({ value = 0, label = 'AI Confidence', size = 100 }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const target = Math.round(value);
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setAnimatedValue(current);
      if (current >= target) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [value]);

  const severity = getSeverityFromScore(animatedValue);
  const styles = getSeverityClasses(severity);

  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          {/* Filled arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={styles.hex}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.3s',
              filter: `drop-shadow(0 0 6px ${styles.glow})`,
            }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-xl font-bold ${styles.text}`}
            style={{ textShadow: `0 0 10px ${styles.glow}` }}
          >
            {animatedValue}%
          </span>
        </div>
      </div>
      <span className="text-[10px] text-slate-500 font-medium">{label}</span>
    </div>
  );
}
