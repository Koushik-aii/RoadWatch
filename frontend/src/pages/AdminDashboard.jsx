import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, Users, LogOut, Loader2, ArrowLeft,
  LayoutDashboard, ShieldAlert, FileText, Map as MapIcon,
  Plus, Trash2, Edit2, CheckCircle2, XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  adminAnalytics, adminListUsers, adminUpdateUser,
  adminListOfficerZones, adminCreateOfficerZone, adminDeleteOfficerZone,
  adminListJurisdictions, adminCreateJurisdiction, adminDeleteJurisdiction,
  adminListAllComplaints
} from '../services/authApi';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [zones, setZones] = useState([]);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'overview') {
        setAnalytics(await adminAnalytics());
      } else if (activeTab === 'users') {
        const [u, z] = await Promise.all([adminListUsers(), adminListOfficerZones()]);
        setUsers(u);
        setZones(z);
      } else if (activeTab === 'complaints') {
        const c = await adminListAllComplaints({ page_size: 50 });
        setComplaints(c.items || []);
      } else if (activeTab === 'jurisdictions') {
        setJurisdictions(await adminListJurisdictions());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users & Officers', icon: Users },
    { id: 'complaints', label: 'Complaints Oversight', icon: FileText },
    { id: 'jurisdictions', label: 'Authorities & Districts', icon: MapIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-indigo-500" size={24} />
          <div>
            <h1 className="font-bold text-white text-lg">RoadWatch Admin Console</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">System Administrator</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
            <ArrowLeft size={16} /> Back to App
          </Link>
          <div className="w-px h-6 bg-slate-700"></div>
          <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors" title="Log Out">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto mt-8 px-4 gap-8">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 space-y-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon size={18} /> {t.label}
              </button>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[500px]">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <XCircle size={16} /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <p className="text-sm font-medium">Loading data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab analytics={analytics} />}
              {activeTab === 'users' && <UsersTab users={users} setUsers={setUsers} zones={zones} setZones={setZones} />}
              {activeTab === 'complaints' && <ComplaintsTab complaints={complaints} />}
              {activeTab === 'jurisdictions' && <JurisdictionsTab jurisdictions={jurisdictions} setJurisdictions={setJurisdictions} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// TAB COMPONENTS
// -----------------------------------------------------------------------------

function OverviewTab({ analytics }) {
  if (!analytics) return null;
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">System Overview</h2>
        <Link to="/admin/analytics" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
          <BarChart3 size={16} /> Advanced Analytics
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Users</p>
          <p className="text-3xl font-black text-white mt-2">{analytics.total_users}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Complaints</p>
          <p className="text-3xl font-black text-white mt-2">{analytics.total_complaints}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Filed Last 7 Days</p>
          <p className="text-3xl font-black text-emerald-400 mt-2">+{analytics.complaints_last_7_days}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-300 mb-4">Complaints by Status</h3>
          <div className="space-y-3">
            {Object.entries(analytics.complaints_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{status}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-300 mb-4">Users by Role</h3>
          <div className="space-y-3">
            {Object.entries(analytics.users_by_role).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{role}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ users, setUsers, zones, setZones }) {
  const [assigningUserId, setAssigningUserId] = useState(null);
  const [district, setDistrict] = useState('Hyderabad');

  async function toggleActive(u) {
    try {
      const updated = await adminUpdateUser(u.id, { is_active: !u.is_active });
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      alert(err.message);
    }
  }

  async function changeRole(u, newRole) {
    try {
      const updated = await adminUpdateUser(u.id, { role: newRole });
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      alert(err.message);
    }
  }

  async function assignZone(e) {
    e.preventDefault();
    try {
      const newZone = await adminCreateOfficerZone({
        officer_id: assigningUserId,
        district,
        state: 'Telangana',
        road_types: 'NH,SH'
      });
      setZones([...zones, newZone]);
      setAssigningUserId(null);
    } catch (err) {
      alert(err.message);
    }
  }

  async function removeZone(zoneId) {
    try {
      await adminDeleteOfficerZone(zoneId);
      setZones(zones.filter(z => z.id !== zoneId));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-white">User & Officer Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-xs uppercase text-slate-500">
              <th className="pb-3 font-semibold">User</th>
              <th className="pb-3 font-semibold">Role</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Officer Zones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {users.map(u => {
              const userZones = zones.filter(z => z.officer_id === u.id);
              return (
                <tr key={u.id} className="text-sm">
                  <td className="py-4">
                    <p className="font-bold text-slate-200">{u.full_name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="py-4">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u, e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-300"
                    >
                      <option value="Citizen">Citizen</option>
                      <option value="Road Authority Officer">Officer</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => toggleActive(u)}
                      className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                        u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {u.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-4">
                    {u.role === 'Road Authority Officer' && (
                      <div className="space-y-2">
                        {userZones.map(z => (
                          <div key={z.id} className="flex items-center gap-2 bg-indigo-900/20 text-indigo-300 px-2 py-1 rounded text-xs w-max border border-indigo-500/20">
                            {z.district}, {z.state}
                            <button onClick={() => removeZone(z.id)} className="text-indigo-400 hover:text-red-400 ml-1">
                              <XCircle size={12} />
                            </button>
                          </div>
                        ))}
                        {assigningUserId === u.id ? (
                          <form onSubmit={assignZone} className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={district}
                              onChange={e => setDistrict(e.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs w-32"
                              placeholder="District"
                            />
                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-xs">Save</button>
                            <button type="button" onClick={() => setAssigningUserId(null)} className="text-slate-400 hover:text-white px-1"><XCircle size={14}/></button>
                          </form>
                        ) : (
                          <button onClick={() => setAssigningUserId(u.id)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1">
                            <Plus size={12} /> Assign Zone
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComplaintsTab({ complaints }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-white">Global Complaints Oversight</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-xs uppercase text-slate-500">
              <th className="pb-3 font-semibold">ID / Date</th>
              <th className="pb-3 font-semibold">Issue</th>
              <th className="pb-3 font-semibold">Location</th>
              <th className="pb-3 font-semibold">Status / Severity</th>
              <th className="pb-3 font-semibold">Assigned Dept</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {complaints.map(c => (
              <tr key={c.complaint_id} className="text-sm">
                <td className="py-4 text-slate-400">
                  <div className="font-mono text-xs">{c.complaint_id.split('-')[0]}</div>
                  <div className="text-[10px] mt-1">{new Date(c.created_at).toLocaleDateString()}</div>
                </td>
                <td className="py-4">
                  <div className="font-semibold text-slate-200">{c.title}</div>
                  <div className="text-xs text-slate-500 max-w-[200px] truncate">{c.description}</div>
                </td>
                <td className="py-4 text-xs text-slate-400">
                  {c.district}, {c.state} <br/>
                  <span className="text-[10px]">({c.latitude.toFixed(2)}, {c.longitude.toFixed(2)})</span>
                </td>
                <td className="py-4">
                  <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-xs text-slate-300 mr-2">{c.status}</span>
                  <span className={`px-2 py-0.5 rounded text-xs border ${
                    c.severity === 'Critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    c.severity === 'High' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>{c.severity}</span>
                </td>
                <td className="py-4 text-xs text-slate-300">
                  {c.assigned_department || 'Unassigned'}
                </td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr><td colSpan="5" className="py-8 text-center text-slate-500 text-sm">No complaints found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JurisdictionsTab({ jurisdictions, setJurisdictions }) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', level: 'District', contact_email: '' });

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const res = await adminCreateJurisdiction(formData);
      setJurisdictions([...jurisdictions, res]);
      setIsCreating(false);
      setFormData({ name: '', level: 'District', contact_email: '' });
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await adminDeleteJurisdiction(id);
      setJurisdictions(jurisdictions.filter(j => j.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Authority & Jurisdiction Management</h2>
        <button onClick={() => setIsCreating(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors">
          <Plus size={16} /> New Jurisdiction
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex items-end gap-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-slate-500 font-bold">Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="block w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm" placeholder="e.g. Hyderabad Municipal Corp" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-slate-500 font-bold">Level</label>
            <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="block w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm">
              <option>Country</option>
              <option>State</option>
              <option>District</option>
              <option>Local</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-slate-500 font-bold">Contact Email</label>
            <input type="email" value={formData.contact_email} onChange={e => setFormData({...formData, contact_email: e.target.value})} className="block w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm" placeholder="admin@hmc.gov.in" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium">Save</button>
            <button type="button" onClick={() => setIsCreating(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-1.5 rounded-lg text-sm font-medium border border-slate-700">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {jurisdictions.map(j => (
          <div key={j.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{j.level}</span>
                <button onClick={() => handleDelete(j.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={14}/></button>
              </div>
              <h3 className="font-bold text-slate-200 mt-2">{j.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{j.contact_email || 'No email provided'}</p>
            </div>
          </div>
        ))}
        {jurisdictions.length === 0 && (
          <p className="text-slate-500 text-sm col-span-3">No jurisdictions configured yet.</p>
        )}
      </div>
    </div>
  );
}
