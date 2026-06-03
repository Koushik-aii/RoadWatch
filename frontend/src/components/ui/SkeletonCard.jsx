/**
 * Generic skeleton loader card.
 *
 * Props:
 *  - rows: number — number of shimmer rows (default: 3)
 *  - hasImage: boolean — show image placeholder (default: false)
 *  - className: additional classes
 */
export default function SkeletonCard({ rows = 3, hasImage = false, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 space-y-3 animate-pulse ${className}`}
    >
      {hasImage && (
        <div className="w-full h-32 bg-slate-700/50 rounded-lg shimmer" />
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div
            className="h-3 bg-slate-700/60 rounded shimmer"
            style={{ width: `${85 - i * 15}%` }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Table skeleton loader for authority dashboard.
 */
export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {/* Header */}
      <div className="flex gap-3 px-3 py-2 bg-slate-800/50 rounded-lg">
        {[120, 80, 60, 70, 80, 60, 90, 50].map((w, i) => (
          <div key={i} className="h-3 bg-slate-700/50 rounded" style={{ width: w }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-3 px-3 py-3 bg-slate-800/20 rounded-lg">
          {[120, 80, 60, 70, 80, 60, 90, 50].map((w, i) => (
            <div
              key={i}
              className="h-3 bg-slate-700/30 rounded shimmer"
              style={{ width: w, animationDelay: `${row * 100 + i * 50}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
