import { Inbox } from 'lucide-react';

/**
 * Reusable empty state component.
 *
 * Props:
 *  - icon: Lucide icon component (default: Inbox)
 *  - title: string
 *  - description: string
 *  - action: { label, onClick } — optional CTA button
 *  - className: additional classes
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No data yet',
  description = '',
  action = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center gap-4 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
        <Icon size={28} className="text-slate-600" />
      </div>
      <div className="space-y-1">
        <h3 className="text-slate-400 text-sm font-semibold">{title}</h3>
        {description && (
          <p className="text-slate-600 text-xs max-w-[260px] leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs text-indigo-400 font-medium px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
