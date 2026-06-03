import { COMPLAINT_STAGES } from '../../utils/severityUtils';

/**
 * Complaint lifecycle timeline component.
 * Shows stages: Submitted → AI Verified → Assigned → Under Review → Resolved
 *
 * Props:
 *  - currentStage: number (0–4) — index of the current stage
 *  - timestamps: object — { submitted, ai_verified, assigned, under_review, resolved }
 *  - compact: boolean — compact layout for cards (default: false)
 */
export default function TimelineProgress({
  currentStage = 0,
  timestamps = {},
  compact = false,
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {COMPLAINT_STAGES.map((stage, i) => (
          <div key={stage.key} className="flex items-center">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i <= currentStage
                  ? i === currentStage
                    ? 'bg-indigo-400 shadow-md shadow-indigo-400/50 scale-125'
                    : 'bg-indigo-500'
                  : 'bg-slate-700'
              }`}
              title={stage.label}
            />
            {i < COMPLAINT_STAGES.length - 1 && (
              <div
                className={`w-4 h-0.5 transition-all duration-500 ${
                  i < currentStage ? 'bg-indigo-500' : 'bg-slate-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {COMPLAINT_STAGES.map((stage, i) => {
        const isComplete = i < currentStage;
        const isCurrent = i === currentStage;
        const isPending = i > currentStage;
        const timestamp = timestamps[stage.key];

        return (
          <div key={stage.key} className="flex items-start gap-3">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm
                  transition-all duration-500 shrink-0
                  ${isComplete ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : ''}
                  ${isCurrent ? 'bg-indigo-500/30 text-indigo-200 border-2 border-indigo-400 shadow-lg shadow-indigo-500/30 timeline-pulse' : ''}
                  ${isPending ? 'bg-slate-800 text-slate-600 border border-slate-700' : ''}
                `}
              >
                {isComplete ? '✓' : stage.icon}
              </div>
              {i < COMPLAINT_STAGES.length - 1 && (
                <div
                  className={`w-0.5 h-8 transition-all duration-500 ${
                    isComplete ? 'bg-indigo-500/50' : 'bg-slate-700/50'
                  }`}
                />
              )}
            </div>

            {/* Label + timestamp */}
            <div className="pt-1.5 min-w-0">
              <p
                className={`text-xs font-semibold transition-colors ${
                  isComplete ? 'text-indigo-300' : isCurrent ? 'text-white' : 'text-slate-600'
                }`}
              >
                {stage.label}
              </p>
              {timestamp && (
                <p className="text-[10px] text-slate-500 mt-0.5">{timestamp}</p>
              )}
              {isCurrent && !timestamp && (
                <p className="text-[10px] text-indigo-400/70 mt-0.5 animate-pulse">In progress...</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
