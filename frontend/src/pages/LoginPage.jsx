import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
<<<<<<< Updated upstream
import { LogIn, Loader2, Shield } from 'lucide-react';
=======
import { LogIn, Loader2, Shield, ArrowLeft } from 'lucide-react';
>>>>>>> Stashed changes
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
<<<<<<< Updated upstream
  const from = location.state?.from?.pathname || '/';
=======
  const from = location.state?.from?.pathname || '/app';
>>>>>>> Stashed changes

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    if (user?.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'Road Authority Officer') return <Navigate to="/officer" replace />;
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user.role === 'Admin') navigate('/admin');
      else if (data.user.role === 'Road Authority Officer') navigate('/officer');
      else navigate(from);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
<<<<<<< Updated upstream
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="text-indigo-400" size={24} />
          <div>
            <h1 className="text-white font-bold text-lg">RoadWatch</h1>
            <p className="text-slate-400 text-xs">Sign in to your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs block mb-1">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            Sign in
          </button>
        </form>

        <p className="text-slate-500 text-xs text-center mt-4">
          No account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Register as citizen
          </Link>
        </p>
=======
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0 animated-gradient"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 40%, #0c1220 60%, #1a0b2e 100%)',
          }}
        />
      </div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-display font-bold text-lg">RoadWatch</h1>
              <p className="text-slate-500 text-xs">Sign in to your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              Sign in
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-800 flex items-center justify-between">
            <p className="text-slate-500 text-xs">
              No account?{' '}
              <Link to="/register" className="text-indigo-400 hover:underline font-medium">
                Register
              </Link>
            </p>
            <Link to="/authority-login" className="text-xs text-slate-600 hover:text-amber-400 transition-colors flex items-center gap-1">
              <Shield size={10} /> Authority
            </Link>
          </div>
        </div>
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
