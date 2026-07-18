import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Save, Lock, User, Globe, Calendar, Loader2, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    email: '', first_name: '', last_name: '', dob: '', country_code: '', password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/user/profile')
      .then(res => {
        const d = res.data;
        setFormData({
          email: d.email || '', first_name: d.first_name || '',
          last_name: d.last_name || '', dob: d.dob ? d.dob.split('T')[0] : '',
          country_code: d.country_code || '', password: ''
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.put('/user/profile', formData);
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-red-500" size={32} />
    </div>
  );

  const inputClass = "w-full pl-11 pr-4 py-3.5 bg-black/60 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all placeholder-gray-700";

  return (
    <div className="min-h-screen bg-black pb-20" style={{ fontFamily: "'Inter', monospace" }}>
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #991b1b, #dc2626)' }} />

      <div className="max-w-lg mx-auto px-6 pt-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={18} className="text-red-500" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">Edit HQ Personnel File</h1>
            <p className="text-gray-600 text-xs uppercase tracking-widest mt-0.5 font-mono">Secure record update</p>
          </div>
        </div>

        {success && (
          <div className="mb-5 flex items-center gap-3 bg-green-950/40 border border-green-800 text-green-400 p-4 rounded-2xl text-sm">
            <CheckCircle size={16} /> Records updated. Redirecting...
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-center gap-3 bg-red-950/40 border border-red-800 text-red-400 p-4 rounded-2xl text-sm">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'first_name', label: 'First Name', ph: 'Raj' },
                { name: 'last_name', label: 'Last Name', ph: 'Kumar' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">{f.label}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={14} />
                    <input name={f.name} value={formData[f.name]} required onChange={handleChange} placeholder={f.ph} className={inputClass} />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Badge Email</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800" size={14} />
                <input value={formData.email} readOnly className="w-full pl-11 pr-4 py-3.5 bg-black/30 border border-gray-900 rounded-xl text-sm text-gray-600 cursor-not-allowed" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={14} />
                  <input name="dob" type="date" value={formData.dob} required onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Country Code</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={14} />
                  <input name="country_code" value={formData.country_code} required onChange={handleChange} placeholder="IN" maxLength={3} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800">
              <p className="text-[10px] text-gray-700 uppercase tracking-widest font-mono mb-3">Confirm passphrase to authorize changes</p>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={14} />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  onChange={handleChange}
                  placeholder="Current passphrase"
                  className="w-full pl-11 pr-12 py-3.5 bg-black/60 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all placeholder-gray-700"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-400">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl font-black text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all disabled:opacity-50"
              style={{ background: saving ? '#7f1d1d' : 'linear-gradient(135deg, #991b1b, #dc2626)' }}
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Updating Records...</> : <><Save size={14} /> Commit Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;