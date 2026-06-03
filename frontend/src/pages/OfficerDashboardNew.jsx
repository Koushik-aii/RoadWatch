import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Loader2, ArrowLeft, Shield, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listComplaints } from '../services/complaintsApi';
import { officerGetMetrics, officerUpdateComplaintStatus } from '../services/authApi';
import ComplaintTable from '../components/authority/ComplaintTable';
import ComplaintTimeline from '../components/authority/ComplaintTimeline';

export default function OfficerDashboardNew() {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [metrics, setMetrics] = useState({ open: 0, resolved: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [m, c] = await Promise.all([
          officerGetMetrics(),
          listComplaints({ page_size: 50 }),
        ]);
        
        setMetrics(m);
        
        const formatted = (c.items || []).map(complaint => ({
          ...complaint,
          citizen: complaint.user_id || 'Citizen User', 
          zone: `${complaint.district || 'Unknown'}, ${complaint.state || 'AP'}`,
          created: complaint.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        }));
        
        setComplaints(formatted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleStatusChange = useCallback(async (id, newStatus) => {
    try {
      let resolutionNotes = undefined;
      if (newStatus === 'Resolved') {
        resolutionNotes = window.prompt("Please enter resolution notes to close this complaint:");
        if (resolutionNotes === null) return; // User cancelled
      }
      
      await officerUpdateComplaintStatus(id, newStatus, undefined, resolutionNotes);
      const stageMap = { 'Filed': 0, 'Assigned': 2, 'Under Review': 3, 'Resolved': 4 };
      
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus, stage: stageMap[newStatus] ?? c.stage, resolution_notes: resolutionNotes || c.resolution_notes } : c)),
      );
      
      // Refresh metrics silently
      officerGetMetrics().then(setMetrics).catch(console.error);
    } catch (err) {
      alert(err.message);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm">Officer Console</h1>
              <p className="text-slate-500 text-[10px]">{user?.full_name} · {user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/app" className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors">
              <ArrowLeft size={14} /> Citizen App
            </Link>
            <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {loading && <Loader2 className="animate-spin text-indigo-400 mx-auto" />}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Analytics Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Clock size={24} />
            </div>
            <div>
              <div className="text-slate-400 text-xs">Open Complaints</div>
              <div className="text-2xl font-bold font-display">{metrics.open}</div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-slate-400 text-xs">Resolved Complaints</div>
              <div className="text-2xl font-bold font-display">{metrics.resolved}</div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="text-slate-400 text-xs">Overdue / Escalated</div>
              <div className="text-2xl font-bold font-display text-orange-400">{metrics.overdue}</div>
            </div>
          </div>
        </div>

        {/* Complaint Table */}
        <section className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 lg:p-5">
          <div className="mb-4">
            <h2 className="font-display font-bold text-base">Assigned Complaints</h2>
            <p className="text-slate-500 text-[10px] mt-0.5">Manage SLA tracking, resolution notes, and status updates.</p>
          </div>

          <ComplaintTable
            complaints={complaints}
            onStatusChange={handleStatusChange}
            onSelectComplaint={setSelectedComplaint}
          />
        </section>
      </main>

      {/* Detail Modal */}
      {selectedComplaint && (
        <ComplaintTimeline
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
}
