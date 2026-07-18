import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Shield, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle, Badge } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '', password: '', first_name: '', last_name: '', dob: '', country_code: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Contact your HQ administrator.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const inputClass = "w-full pl-11 pr-4 py-3.5 bg-black/60 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all placeholder-gray-700";

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden py-12"
      style={{
        background: 'radial-gradient(ellipse at top left, #1a0a0a 0%, #0a0a0a 50%, #0d1117 100%)',
        fontFamily: "'Inter', 'Segoe UI', monospace"
      }}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#ff0000 1px, transparent 1px), linear-gradient(90deg, #ff0000 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-red-600 opacity-60 blur-sm" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #7f1d1d, #dc2626)' }}>
            <Shield size={28} className="text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-500 text-[10px] font-bold uppercase tracking-[0.3em]">HQ Personnel Registration</span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-2">Register at HQ</h1>
        </div>

        <div className="bg-gray-900/80 backdrop-blur border border-red-900/30 rounded-3xl p-8 shadow-2xl">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-900/40 border border-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-400" size={32} />
              </div>
              <p className="text-white font-black text-lg">Registration Submitted</p>
              <p className="text-gray-500 text-sm mt-2">Redirecting to login...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 flex items-center gap-3 bg-red-950/60 border border-red-800 text-red-400 p-4 rounded-2xl text-sm">
                  <AlertTriangle size={16} className="shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'first_name', label: 'First Name', placeholder: 'Raj' },
                    { name: 'last_name', label: 'Last Name', placeholder: 'Kumar' },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">{f.label}</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                        <input name={f.name} required onChange={handleChange} placeholder={f.placeholder} className={inputClass} />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Official Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                    <input name="email" type="email" required onChange={handleChange} placeholder="officer@police.gov" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Set Passphrase</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className="w-full pl-11 pr-12 py-3.5 bg-black/60 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all placeholder-gray-700"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Date of Birth</label>
                    <input name="dob" type="date" required onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Country Code</label>
                    <input name="country_code" required onChange={handleChange} placeholder="IN, US…" className={inputClass} maxLength={3} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-black text-white flex items-center justify-center gap-2 text-sm uppercase tracking-widest transition-all disabled:opacity-50 mt-2"
                  style={{ background: loading ? '#7f1d1d' : 'linear-gradient(135deg, #991b1b, #dc2626)' }}
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Shield size={16} /> Register Personnel</>}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-gray-800 text-center">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                  Already registered?{' '}
                  <Link to="/login" className="text-red-500 hover:text-red-400 font-bold">Sign In</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;