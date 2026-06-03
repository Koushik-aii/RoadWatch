import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Shield, LogIn, Loader2, Lock, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthorityLoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    if (user?.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'Road Authority Officer') return <Navigate to="/officer" replace />;
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user.role === 'Admin') navigate('/admin');
      else if (data.user.role === 'Road Authority Officer') navigate('/officer');
      else {
        setError('This portal is for authorized government personnel only.');
        return;
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0 animated-gradient"
          style={{
            background: 'linear-gradient(135deg, #1a0b2e 0%, #0f172a 40%, #0c1a14 60%, #0f172a 100%)',
          }}
        />
      </div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 shadow-xl shadow-amber-500/20 mb-4">
            <Shield size={30} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Authority Portal</h1>
          <p className="text-slate-500 text-xs mt-1">RoadWatch Government Access</p>
        </div>

        {/* Login card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 shadow-2xl">
          {/* Security notice */}
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/5 border border-amber-500/15 rounded-lg mb-5">
            <Lock size={12} className="text-amber-400 shrink-0" />
            <span className="text-[10px] text-amber-400/80">
              Authorized government personnel only. All access is logged.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">
                Official Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@authority.gov.in"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 placeholder-slate-600 transition-all"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-amber-600/20 transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              Access Authority Dashboard
            </button>
          </form>

          {/* Role badges */}
          <div className="mt-5 pt-5 border-t border-slate-800 space-y-2">
            <p className="text-[10px] text-slate-600 uppercase tracking-wide font-semibold">Supported roles</p>
            <div className="flex gap-2">
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium flex items-center gap-1">
                <Building2 size={10} /> Road Authority Officer
              </span>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium flex items-center gap-1">
                <Shield size={10} /> System Administrator
              </span>
            </div>
          </div>
        </div>

        {/* Back to citizen portal */}
        <p className="text-slate-600 text-xs text-center mt-6">
          Citizen?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Sign in here
          </Link>
          {' · '}
          <Link to="/" className="text-slate-500 hover:text-white transition-colors">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
