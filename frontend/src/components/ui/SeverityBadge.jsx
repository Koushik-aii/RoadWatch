import { getSeverityClasses } from '../../utils/severityUtils';

/**
 * Reusable severity badge component.
 * Consistent severity visualization across the platform.
 *
 * Props:
 *  - severity: 'Low' | 'Medium' | 'High' | 'Critical' | 'Safe'
 *  - size: 'sm' | 'md' | 'lg' (default: 'md')
 *  - glow: boolean — adds glow effect
 *  - pulse: boolean — adds pulse animation
 *  - showIcon: boolean — show emoji icon (default: true)
 *  - className: additional classes
 */
export default function SeverityBadge({
  severity = 'Low',
  size = 'md',
  glow = false,
  pulse = false,
  showIcon = true,
  className = '',
}) {
  const styles = getSeverityClasses(severity);

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2.5 py-1',
    lg: 'text-xs px-3 py-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-bold
        ${styles.text} ${styles.bg} border ${styles.border}
        ${sizeClasses[size] || sizeClasses.md}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
      style={glow ? { boxShadow: `0 0 12px ${styles.glow}` } : undefined}
    >
      {showIcon && <span>{styles.icon}</span>}
      {severity}
    </span>
  );
}
