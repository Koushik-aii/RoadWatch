import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, LogOut, Loader2, ArrowLeft, Save, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listComplaints } from '../services/complaintsApi';
import { officerGetZones, officerSetZones, officerUpdateComplaintStatus } from '../services/authApi';
import ComplaintTable from '../components/authority/ComplaintTable';
import ComplaintTimeline from '../components/authority/ComplaintTimeline';

const ROAD_TYPES = ['NH', 'SH', 'MDR', 'ODR', 'VR', 'Urban'];

export default function OfficerDashboard() {
  const { user, logout } = useAuth();
  const [zones, setZones] = useState([{ district: 'Krishna', state: 'Andhra Pradesh', road_types: ['SH'] }]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

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
        
        // Map backend complaint format to ComplaintTable format
        const formatted = (c.items || []).map(complaint => ({
          ...complaint,
          citizen: complaint.user_id || 'Citizen User', // Mock citizen name if not provided
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

  async function saveZones() {
    setSaving(true);
    try {
      await officerSetZones(zones);
      const c = await listComplaints({ page_size: 50 });
      const formatted = (c.items || []).map(complaint => ({
        ...complaint,
        citizen: complaint.user_id || 'Citizen User',
        zone: `${complaint.district || 'Unknown'}, ${complaint.state || 'AP'}`,
        created: complaint.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      }));
      setComplaints(formatted);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  const handleStatusChange = useCallback(async (id, newStatus) => {
    try {
      await officerUpdateComplaintStatus(id, newStatus);
      const stageMap = { 'Filed': 0, 'Assigned': 2, 'Under Review': 3, 'Resolved': 4 };
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus, stage: stageMap[newStatus] ?? c.stage } : c)),
      );
    } catch (err) {
      alert(err.message);
    }
  }, []);

  function addZone() {
    setZones([...zones, { district: '', state: 'Andhra Pradesh', road_types: [] }]);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
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
                  ))}
                </select>
              </div>
            ))}
          </div>
          
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
    </div>
  );
}
