import { useState } from 'react';
<<<<<<< Updated upstream
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { UserPlus, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, fullName);
      navigate('/');
=======
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader2, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.fullName
      );
      navigate('/app');
>>>>>>> Stashed changes
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

<<<<<<< Updated upstream
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="text-indigo-400" size={24} />
          <div>
            <h1 className="text-white font-bold text-lg">Create account</h1>
            <p className="text-slate-400 text-xs">Citizen registration</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-slate-400 text-xs block mb-1">Full name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm"
            />
            <p className="text-slate-600 text-[10px] mt-1">Min 8 chars, upper, lower, digit</p>
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">Confirm password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            Register
          </button>
        </form>

        <p className="text-slate-500 text-xs text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline">Sign in</Link>
        </p>
=======
  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
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
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
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
              <h1 className="text-white font-display font-bold text-lg">Join RoadWatch</h1>
              <p className="text-slate-500 text-xs">Create a citizen account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Full Name</label>
              <input
                name="fullName"
                type="text"
                required
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Phone (Optional)</label>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                placeholder="Minimum 6 characters"
              />
            </div>

            {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              Create Account
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-xs">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
