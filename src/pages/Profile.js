import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Shield, Mail, Globe, Calendar, Fingerprint, User, Radio, LogOut, Badge } from 'lucide-react';

const Profile = () => {
  const [personnel, setPersonnel] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/user/profile')
      .then(res => setPersonnel(res.data))
      .catch(err => console.error('Failed to fetch profile:', err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('security_token');
    navigate('/login');
  };

  if (!personnel) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex items-center gap-3 text-red-500 font-mono text-sm">
        <Radio size={16} className="animate-pulse" /> Accessing Personnel Files...
      </div>
    </div>
  );

  const initials = `${personnel.first_name?.[0] || ''}${personnel.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-black pb-20" style={{ fontFamily: "'Inter', monospace" }}>
      {/* Top accent */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #991b1b, #dc2626, #7f1d1d)' }} />

      {/* Header Banner */}
      <div className="bg-gray-950 border-b border-red-900/30 px-6 py-10">
        <div className="max-w-2xl mx-auto flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl border-2 border-red-700/50 bg-red-950/30 flex items-center justify-center text-red-400 text-2xl font-black">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.3em]">Active Duty</p>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {personnel.first_name} {personnel.last_name}
            </h1>
            <p className="text-red-400 text-xs font-bold uppercase tracking-widest mt-0.5">
              {personnel.role} Enforcement Division
            </p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 border border-red-900/50 rounded-xl text-red-500 hover:bg-red-950/30 text-xs font-bold uppercase tracking-widest transition-colors">
            <LogOut size={14} /> Deauth
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-6 space-y-4">
        {/* Personnel Details */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 bg-gray-950">
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <User size={12} /> Personnel Intelligence File
            </h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-6">
            {[
              { label: 'Badge Email', value: personnel.email, icon: <Mail size={14} /> },
              { label: 'Clearance Level', value: 'Field Response / Tactical', icon: <Shield size={14} /> },
              { label: 'Country Code', value: personnel.country_code || '—', icon: <Globe size={14} /> },
              { label: 'Date of Birth', value: personnel.dob ? new Date(personnel.dob).toLocaleDateString() : '—', icon: <Calendar size={14} /> },
            ].map(item => (
              <div key={item.label}>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-white text-sm font-medium flex items-center gap-1.5 text-gray-300">
                  <span className="text-gray-600">{item.icon}</span> {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Badge / ID */}
        <div className="bg-gray-900 border border-red-900/30 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Fingerprint size={12} className="text-red-500" /> Service Identity
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest">Personnel ID</p>
              <p className="text-white font-black font-mono mt-1">{personnel.tourist_id || `SEC-${personnel.id}`}</p>
            </div>
            <div className="px-3 py-1 bg-red-950/40 border border-red-800 rounded-lg text-red-400 text-xs font-bold uppercase tracking-wider">
              {personnel.role}
            </div>
          </div>
        </div>

        {/* Session Warning */}
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">
            All activity is logged · Session expires on browser close
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;