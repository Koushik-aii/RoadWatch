import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, LogOut, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminAnalytics, adminListUsers, adminUpdateUser } from '../services/authApi';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [a, u] = await Promise.all([adminAnalytics(), adminListUsers()]);
        setAnalytics(a);
        setUsers(u);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function toggleActive(u) {
    try {
      const updated = await adminUpdateUser(u.id, { is_active: !u.is_active });
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-indigo-400" size={20} />
          <span className="font-bold text-sm">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
            <ArrowLeft size={14} /> App
          </Link>
          <button onClick={logout} className="text-slate-400 hover:text-red-400">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <p className="text-slate-400 text-xs">Signed in as {user?.email}</p>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-indigo-400" />
          </div>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {analytics && (
          <section className="grid grid-cols-2 gap-3">
            <StatCard label="Users" value={analytics.total_users} />
            <StatCard label="Complaints" value={analytics.total_complaints} />
            <StatCard label="Last 7 days" value={analytics.complaints_last_7_days} />
            <StatCard
              label="By status"
              value={Object.entries(analytics.complaints_by_status)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')}
              small
            />
          </section>
        )}

        <section>
          <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
            <Users size={16} /> User management
          </h2>
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium text-sm">{u.full_name}</div>
                  <div className="text-slate-500 text-xs">{u.email}</div>
                  <div className="text-indigo-400 text-[10px]">{u.role}</div>
                </div>
                <button
                  onClick={() => toggleActive(u)}
                  className={`text-xs px-2 py-1 rounded-lg ${
                    u.is_active ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'
                  }`}
                >
                  {u.is_active ? 'Active' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, small }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3">
      <div className="text-slate-500 text-[10px] uppercase">{label}</div>
      <div className={`font-bold mt-1 ${small ? 'text-xs' : 'text-xl'}`}>{value}</div>
    </div>
  );
}
