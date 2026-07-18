import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('security_token', res.data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Unauthorized. Restricted personnel only.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at top left, #1a0a0a 0%, #0a0a0a 50%, #0d1117 100%)',
        fontFamily: "'Inter', 'Segoe UI', monospace"
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#ff0000 1px, transparent 1px), linear-gradient(90deg, #ff0000 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Glowing accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-red-600 opacity-60 blur-sm" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 relative"
            style={{ background: 'linear-gradient(135deg, #7f1d1d, #dc2626)' }}>
            <Shield size={36} className="text-white" />
            <div className="absolute -inset-1 rounded-2xl border border-red-700/50" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-500 text-[10px] font-bold uppercase tracking-[0.3em]">Restricted Access</span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-2">POLICE PORTAL</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Security Operations Centre</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur border border-red-900/30 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-950/60 border border-red-800 text-red-400 p-4 rounded-2xl text-sm">
              <AlertTriangle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Official ID / Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@police.gov"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/60 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all placeholder-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Passphrase</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-black/60 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all placeholder-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
              style={{ background: loading ? '#7f1d1d' : 'linear-gradient(135deg, #991b1b, #dc2626)' }}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Verifying Identity...</>
              ) : (
                <><Shield size={16} /> Authorize Session</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">
              New to the unit?{' '}
              <Link to="/register" className="text-red-500 hover:text-red-400 font-bold transition-colors">
                Register at HQ
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-700 mt-6 uppercase tracking-widest">
          All sessions are logged and monitored · Unauthorized access is a criminal offence
        </p>
      </div>
    </div>
  );
};

export default Login;