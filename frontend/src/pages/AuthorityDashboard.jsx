import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shield, LogOut, ArrowLeft, BarChart3, Activity, AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ComplaintTable from '../components/authority/ComplaintTable';
import ComplaintTimeline from '../components/authority/ComplaintTimeline';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { MOCK_AUTHORITY_COMPLAINTS } from '../data/mockAuthority';

export default function AuthorityDashboard() {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState(MOCK_AUTHORITY_COMPLAINTS);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const handleStatusChange = useCallback((id, newStatus) => {
    const stageMap = { 'Filed': 0, 'Assigned': 2, 'Under Review': 3, 'Resolved': 4 };
    setComplaints(prev =>
      prev.map(c => c.id === id ? { ...c, status: newStatus, stage: stageMap[newStatus] ?? c.stage } : c)
    );
  }, []);

  // Stats
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const critical = complaints.filter(c => c.severity === 'Critical').length;
  const avgConf = complaints.reduce((sum, c) => sum + (c.ai_confidence || 0), 0) / (total || 1);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm">Authority Dashboard</h1>
              <p className="text-slate-500 text-[10px]">{user?.full_name} · {user?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/app" className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors">
              <ArrowLeft size={14} /> Citizen App
            </Link>
            <Link to="/admin" className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors">
              <BarChart3 size={14} /> Admin
            </Link>
            <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={Activity}
            label="Total Complaints"
            value={total}
            tone="cyan"
          />
          <StatCard
            icon={AlertTriangle}
            label="Critical"
            value={critical}
            tone="red"
          />
          <StatCard
            icon={CheckCircle2}
            label="Resolved"
            value={resolved}
            tone="emerald"
            detail={`${total > 0 ? Math.round((resolved / total) * 100) : 0}% rate`}
          />
          <StatCard
            icon={Clock3}
            label="Avg AI Confidence"
            value={Math.round(avgConf * 100)}
            suffix="%"
            tone="purple"
          />
        </div>

        {/* Complaint Table */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-base">Complaint Management</h2>
              <p className="text-slate-500 text-[10px] mt-0.5">View, filter, and manage citizen complaints</p>
            </div>
          </div>

          <ComplaintTable
            complaints={complaints}
            onStatusChange={handleStatusChange}
            onSelectComplaint={setSelectedComplaint}
          />
        </div>
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

function StatCard({ icon: Icon, label, value, tone = 'cyan', detail, suffix = '' }) {
  const tones = {
    cyan: 'border-cyan-500/20 bg-cyan-500/5',
    red: 'border-red-500/20 bg-red-500/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    purple: 'border-purple-500/20 bg-purple-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
  };
  const textTones = {
    cyan: 'text-cyan-400',
    red: 'text-red-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
  };

  return (
    <div className={`rounded-xl border ${tones[tone]} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">{label}</span>
        <Icon size={16} className={textTones[tone]} />
      </div>
      <div className={`text-2xl font-bold font-display ${textTones[tone]}`}>
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      {detail && <p className="text-[10px] text-slate-500 mt-1">{detail}</p>}
    </div>
  );
}
