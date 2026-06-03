<<<<<<< Updated upstream
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, LogOut, Loader2, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listComplaints } from '../services/complaintsApi';
import { officerGetZones, officerSetZones, officerUpdateComplaintStatus } from '../services/authApi';

const ROAD_TYPES = ['NH', 'SH', 'MDR', 'ODR', 'VR', 'Urban'];
const STATUSES = ['Pending', 'Under Review', 'Resolved'];
=======
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, LogOut, Loader2, ArrowLeft, Save, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listComplaints } from '../services/complaintsApi';
import { officerGetZones, officerSetZones, officerUpdateComplaintStatus } from '../services/authApi';
import ComplaintTable from '../components/authority/ComplaintTable';
import ComplaintTimeline from '../components/authority/ComplaintTimeline';

const ROAD_TYPES = ['NH', 'SH', 'MDR', 'ODR', 'VR', 'Urban'];
>>>>>>> Stashed changes

export default function OfficerDashboard() {
  const { user, logout } = useAuth();
  const [zones, setZones] = useState([{ district: 'Krishna', state: 'Andhra Pradesh', road_types: ['SH'] }]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
<<<<<<< Updated upstream
=======
  const [selectedComplaint, setSelectedComplaint] = useState(null);
>>>>>>> Stashed changes

  useEffect(() => {
    async function load() {
      try {
        const [z, c] = await Promise.all([
          officerGetZones(),
          listComplaints({ page_size: 50 }),
        ]);
        if (z?.length) {
          setZones(
            z.map((x) => ({
              district: x.district,
              state: x.state,
              road_types: x.road_types || [],
            })),
          );
        }
<<<<<<< Updated upstream
        setComplaints(c.items || []);
=======
        
        // Map backend complaint format to ComplaintTable format
        const formatted = (c.items || []).map(complaint => ({
          ...complaint,
          citizen: complaint.user_id || 'Citizen User', // Mock citizen name if not provided
          zone: `${complaint.district || 'Unknown'}, ${complaint.state || 'AP'}`,
          created: complaint.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        }));
        
        setComplaints(formatted);
>>>>>>> Stashed changes
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveZones() {
    setSaving(true);
    try {
      await officerSetZones(zones);
      const c = await listComplaints({ page_size: 50 });
<<<<<<< Updated upstream
      setComplaints(c.items || []);
=======
      const formatted = (c.items || []).map(complaint => ({
        ...complaint,
        citizen: complaint.user_id || 'Citizen User',
        zone: `${complaint.district || 'Unknown'}, ${complaint.state || 'AP'}`,
        created: complaint.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      }));
      setComplaints(formatted);
>>>>>>> Stashed changes
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

<<<<<<< Updated upstream
  async function updateStatus(id, status) {
    try {
      await officerUpdateComplaintStatus(id, status);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status, stage: status === 'Resolved' ? 2 : status === 'Under Review' ? 1 : 0 } : c)),
=======
  const handleStatusChange = useCallback(async (id, newStatus) => {
    try {
      await officerUpdateComplaintStatus(id, newStatus);
      const stageMap = { 'Filed': 0, 'Assigned': 2, 'Under Review': 3, 'Resolved': 4 };
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus, stage: stageMap[newStatus] ?? c.stage } : c)),
>>>>>>> Stashed changes
      );
    } catch (err) {
      alert(err.message);
    }
<<<<<<< Updated upstream
  }
=======
  }, []);
>>>>>>> Stashed changes

  function addZone() {
    setZones([...zones, { district: '', state: 'Andhra Pradesh', road_types: [] }]);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
<<<<<<< Updated upstream
      <header className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="text-amber-400" size={20} />
          <span className="font-bold text-sm">Officer Console</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-400 text-xs flex items-center gap-1">
            <ArrowLeft size={14} /> App
          </Link>
          <button onClick={logout} className="text-slate-400 hover:text-red-400">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <p className="text-slate-400 text-xs">{user?.full_name} · {user?.email}</p>

        {loading && <Loader2 className="animate-spin text-amber-400 mx-auto" />}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <section className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
          <h2 className="font-bold text-sm mb-3">Assigned zones</h2>
          {zones.map((z, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 mb-3">
              <input
                placeholder="District"
                value={z.district}
                onChange={(e) => {
                  const next = [...zones];
                  next[i].district = e.target.value;
                  setZones(next);
                }}
                className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs"
              />
              <input
                placeholder="State"
                value={z.state}
                onChange={(e) => {
                  const next = [...zones];
                  next[i].state = e.target.value;
                  setZones(next);
                }}
                className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs"
              />
              <select
                multiple
                className="col-span-2 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-xs h-16"
                value={z.road_types}
                onChange={(e) => {
                  const next = [...zones];
                  next[i].road_types = Array.from(e.target.selectedOptions, (o) => o.value);
                  setZones(next);
                }}
              >
                {ROAD_TYPES.map((rt) => (
                  <option key={rt} value={rt}>{rt}</option>
                ))}
              </select>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={addZone} className="text-xs text-indigo-400">+ Add zone</button>
            <button
              onClick={saveZones}
              disabled={saving}
              className="ml-auto flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-lg"
            >
              <Save size={12} /> Save zones
            </button>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-sm mb-3">Complaints in your zones ({complaints.length})</h2>
          <div className="space-y-2">
            {complaints.map((c) => (
              <div key={c.id} className="bg-slate-900 border border-slate-700 rounded-xl p-3">
                <div className="font-bold text-sm">{c.id}</div>
                <p className="text-slate-400 text-xs truncate">{c.issue}</p>
                <p className="text-slate-500 text-[10px]">{c.district}, {c.state}</p>
                <select
                  value={c.status}
                  onChange={(e) => updateStatus(c.id, e.target.value)}
                  className="mt-2 w-full bg-slate-800 border border-slate-600 rounded-lg text-xs py-1.5"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
=======
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-md shadow-amber-500/20">
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
        {loading && <Loader2 className="animate-spin text-amber-400 mx-auto" />}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Zone Management */}
        <section className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 lg:p-5 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-amber-400" size={16} />
            <h2 className="font-display font-bold text-base">Assigned Zones</h2>
          </div>
          
          <div className="space-y-3">
            {zones.map((z, i) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-800/30 p-3 rounded-xl border border-slate-700/30">
                <input
                  placeholder="District"
                  value={z.district}
                  onChange={(e) => {
                    const next = [...zones];
                    next[i].district = e.target.value;
                    setZones(next);
                  }}
                  className="bg-slate-800 border border-slate-600 focus:border-amber-500 focus:outline-none rounded-lg px-3 py-2 text-xs"
                />
                <input
                  placeholder="State"
                  value={z.state}
                  onChange={(e) => {
                    const next = [...zones];
                    next[i].state = e.target.value;
                    setZones(next);
                  }}
                  className="bg-slate-800 border border-slate-600 focus:border-amber-500 focus:outline-none rounded-lg px-3 py-2 text-xs"
                />
                <select
                  multiple
                  className="col-span-2 md:col-span-2 bg-slate-800 border border-slate-600 focus:border-amber-500 focus:outline-none rounded-lg px-3 py-2 text-xs h-16"
                  value={z.road_types}
                  onChange={(e) => {
                    const next = [...zones];
                    next[i].road_types = Array.from(e.target.selectedOptions, (o) => o.value);
                    setZones(next);
                  }}
                >
                  {ROAD_TYPES.map((rt) => (
                    <option key={rt} value={rt}>{rt}</option>
>>>>>>> Stashed changes
                  ))}
                </select>
              </div>
            ))}
          </div>
<<<<<<< Updated upstream
        </section>
      </main>
=======
          
          <div className="flex items-center justify-between mt-4">
            <button onClick={addZone} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-3 py-2 bg-indigo-500/10 rounded-lg">
              + Add zone
            </button>
            <button
              onClick={saveZones}
              disabled={saving}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md shadow-amber-500/20 transition-all"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
              Save zones
            </button>
          </div>
        </section>

        {/* Complaint Table */}
        <section className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 lg:p-5">
          <div className="mb-4">
            <h2 className="font-display font-bold text-base">Complaints in your zones</h2>
            <p className="text-slate-500 text-[10px] mt-0.5">Manage and update active citizen complaints</p>
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
>>>>>>> Stashed changes
    </div>
  );
}
