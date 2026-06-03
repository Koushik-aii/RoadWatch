import SeverityBadge from '../ui/SeverityBadge';
import AIStatusLabel from '../ui/AIStatusLabel';
import TimelineProgress from '../ui/TimelineProgress';
import { X } from 'lucide-react';

/**
 * Complaint detail view with full timeline.
 *
 * Props:
 *  - complaint: object
 *  - onClose: () => void
 */
export default function ComplaintTimeline({ complaint, onClose }) {
  if (!complaint) return null;

  // Generate timestamps based on created date and stage
  const created = new Date(complaint.created);
  const timestamps = {
    submitted: complaint.created,
  };
  if (complaint.stage >= 1) {
    const d = new Date(created);
    d.setHours(d.getHours() + 2);
    timestamps.ai_verified = d.toISOString().slice(0, 10) + ' ' + d.toTimeString().slice(0, 5);
  }
  if (complaint.stage >= 2) {
    const d = new Date(created);
    d.setDate(d.getDate() + 1);
    timestamps.assigned = d.toISOString().slice(0, 10);
  }
  if (complaint.stage >= 3) {
    const d = new Date(created);
    d.setDate(d.getDate() + 3);
    timestamps.under_review = d.toISOString().slice(0, 10);
  }
  if (complaint.stage >= 4) {
    const d = new Date(created);
    d.setDate(d.getDate() + 7);
    timestamps.resolved = d.toISOString().slice(0, 10);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-white font-bold text-sm">{complaint.id}</h2>
            <p className="text-slate-500 text-[10px] mt-0.5">Complaint Details & Timeline</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="Citizen" value={complaint.citizen} />
            <InfoItem label="Zone" value={complaint.zone} />
            <InfoItem label="Road Type" value={complaint.road_type} />
            <InfoItem label="Filed" value={complaint.created} />
          </div>

          {/* Issue */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-3">
            <p className="text-[10px] text-slate-500 font-semibold mb-1">ISSUE DESCRIPTION</p>
            <p className="text-sm text-slate-300 leading-relaxed">{complaint.issue}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <SeverityBadge severity={complaint.severity} glow />
            {complaint.ai_confidence > 0.8 && <AIStatusLabel variant="verified" />}
            {complaint.ai_confidence > 0 && <AIStatusLabel variant="analysis" />}
            {complaint.severity === 'Critical' || complaint.severity === 'High' ? (
              <AIStatusLabel variant="high-risk" />
            ) : null}
          </div>

          {/* AI Confidence */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-3">
            <p className="text-[10px] text-slate-500 font-semibold mb-2">AI CONFIDENCE ANALYSIS</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 confidence-bar-fill"
                  style={{ width: `${(complaint.ai_confidence || 0) * 100}%` }}
                />
              </div>
              <span className="text-indigo-300 font-bold text-sm">{Math.round((complaint.ai_confidence || 0) * 100)}%</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
            <p className="text-[10px] text-slate-500 font-semibold mb-4">COMPLAINT LIFECYCLE</p>
            <TimelineProgress currentStage={complaint.stage ?? 0} timestamps={timestamps} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="bg-slate-800/30 rounded-lg p-2.5">
      <p className="text-[9px] text-slate-600 font-semibold uppercase">{label}</p>
      <p className="text-xs text-white font-medium mt-0.5">{value || '—'}</p>
    </div>
  );
}
