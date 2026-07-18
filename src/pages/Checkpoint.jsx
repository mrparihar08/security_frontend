import React, { useState } from 'react';
import api from '../api';
import { Scan, Search, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const Checkpoint = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tourist, setTourist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remarks, setRemarks] = useState('');
  const [recentLogs, setRecentLogs] = useState([]);

  const fetchRecentLogs = async (touristId) => {
    try {
      const res = await api.get(`/security/tourist/${touristId}/logs`);
      setRecentLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError('');
    setTourist(null);
    setRecentLogs([]);
    setRemarks('');
    
    try {
      const res = await api.get(`/security/tourist/${searchQuery}`);
      setTourist(res.data);
      fetchRecentLogs(res.data.id);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No tourist found with that ID or Email.');
      } else {
        setError('Error fetching tourist data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogEncounter = async (status) => {
    if (!tourist) return;
    try {
      await api.post(`/security/checkpoint-log`, {
        tourist_id: tourist.id,
        checkpoint_name: "Main Entrance", // Could be dynamic
        result: status,
        remarks: remarks
      });
      alert(`Checkpoint logged: ${status.toUpperCase()}`);
      setTourist(null);
      setSearchQuery('');
      setRemarks('');
      setRecentLogs([]);
    } catch (err) {
      console.error("Error logging checkpoint", err);
      alert("Failed to log the check. Please try again.");
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: '#050308', fontFamily: "'Inter', sans-serif" }}>
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #dc2626, #991b1b)' }} />
      
      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.25em] mb-3">Security Enforcement</p>
            <h1 className="text-4xl font-black text-white flex items-center gap-4">
               Checkpoint Control
            </h1>
          </div>
          <div className="flex bg-slate-900/50 rounded-2xl border border-red-950/40 p-2 backdrop-blur-xl">
             <div className="px-4 py-2 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Scanner Online</span>
             </div>
          </div>
        </div>

        {/* Search Bar Section */}
        <div className="mb-12">
          <form onSubmit={handleSearch} className="flex gap-4 group">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={24} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="INPUT SUBJECT IDENTIFIER OR BIOMETRIC DATA..."
                className="w-full bg-slate-950/40 border border-red-950/30 text-white rounded-[2rem] py-6 pl-16 pr-8 font-black text-lg focus:outline-none focus:border-red-500/50 transition-all placeholder-slate-800 tracking-tight"
                autoFocus
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !searchQuery.trim()}
              className="bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] px-12 rounded-[2rem] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-red-900/20 text-sm"
            >
              {loading ? 'PROCESSING...' : 'SCANN'}
            </button>
          </form>
          {error && (
            <div className="mt-6 flex justify-center">
               <p className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
                  <AlertTriangle size={16} /> {error}
               </p>
            </div>
          )}
        </div>

        {/* Result Container */}
        {tourist && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in zoom-in duration-500">
            {/* Identity Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/40 rounded-[2.5rem] border border-red-950/40 overflow-hidden backdrop-blur-xl">
                 <div className="aspect-[3/4] relative group">
                    {tourist.document_url ? (
                      <img 
                        src={tourist.document_url} 
                        alt="Subject Identification" 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-800">
                         <Scan size={64} />
                         <p className="text-[10px] font-black uppercase tracking-widest">No Biometric Visual</p>
                      </div>
                    )}
                    <div className={`absolute top-6 left-6 right-6 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-center backdrop-blur-md shadow-2xl border ${tourist.document_verified ? 'bg-green-500/80 text-black border-green-500/20' : 'bg-red-600/80 text-white border-red-500/20'}`}>
                       {tourist.document_verified ? 'CLEARANCE VERIFIED' : 'PENDING VERIFICATION'}
                    </div>
                 </div>
                 <div className="p-8">
                    <h2 className="text-2xl font-black text-white tracking-tight mb-2 truncate">
                       {tourist.first_name ? `${tourist.first_name} ${tourist.last_name}` : 'UNKNOWN SUBJECT'}
                    </h2>
                    <p className="text-slate-500 text-xs font-black tracking-widest mb-6 truncate uppercase">{tourist.email}</p>
                    
                    <div className="space-y-4">
                       {[
                         { label: 'System Identifier', value: tourist.id, color: 'text-slate-300' },
                         { label: 'Tourist Authority ID', value: tourist.tourist_id || 'NOT_ASSIGNED', color: 'text-red-400' },
                         { label: 'Origin Jurisdiction', value: tourist.country_code || 'GLOBAL', color: 'text-slate-300' },
                         { label: 'Credential Type', value: tourist.document_type || 'NONE', color: 'text-slate-300' }
                       ].map((item, i) => (
                         <div key={i} className="flex justify-between items-center py-3 border-b border-red-950/20">
                            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{item.label}</span>
                            <span className={`text-xs font-black uppercase tracking-widest ${item.color}`}>{item.value}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>

            {/* Tactical Control & History */}
            <div className="lg:col-span-8 space-y-8">
              {/* Disposition Controls */}
              <div className="bg-slate-900/40 rounded-[2.5rem] border border-red-950/40 p-8 backdrop-blur-xl">
                 <h3 className="text-white font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                    <ShieldCheck size={20} className="text-red-500" /> Operational Disposition
                 </h3>
                 
                 <div className="mb-8">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4 block ml-1">Enforcement Remarks</label>
                    <textarea 
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full bg-slate-950/40 border border-red-950/30 text-white rounded-2xl p-6 text-sm focus:outline-none focus:border-red-500/50 transition-all placeholder-slate-800 h-32 resize-none font-medium"
                      placeholder="ENTER TACTICAL NOTES FOR LOGGING..."
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleLogEncounter('Valid')}
                      disabled={tourist.status !== 'Active'}
                      className="md:col-span-1 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-green-900/20 flex flex-col items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <ShieldCheck size={24} />
                      <span className="text-[10px]">Authorize Entry</span>
                    </button>
                    <button
                      onClick={() => handleLogEncounter('Suspicious')}
                      className="md:col-span-1 py-5 bg-slate-950/60 border border-orange-500/30 text-orange-500 hover:bg-orange-500/10 font-black uppercase tracking-widest rounded-2xl transition-all flex flex-col items-center justify-center gap-2"
                    >
                      <AlertTriangle size={24} />
                      <span className="text-[10px]">Mark Suspicious</span>
                    </button>
                    <button
                      onClick={() => handleLogEncounter('Denied')}
                      className="md:col-span-1 py-5 bg-slate-950/60 border border-red-500/30 text-red-500 hover:bg-red-500/10 font-black uppercase tracking-widest rounded-2xl transition-all flex flex-col items-center justify-center gap-2"
                    >
                      <XCircle size={24} />
                      <span className="text-[10px]">Deny Clearance</span>
                    </button>
                 </div>
              </div>

              {/* History Log */}
              {recentLogs.length > 0 && (
                <div className="bg-slate-900/40 rounded-[2.5rem] border border-red-950/40 overflow-hidden backdrop-blur-xl">
                  <div className="p-8 border-b border-red-950/20 flex justify-between items-center">
                    <h3 className="text-white font-black text-sm uppercase tracking-widest">Historical Sequence</h3>
                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Last {recentLogs.length} Encounters</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] text-slate-600 font-black uppercase tracking-widest border-b border-red-950/20">
                          <th className="p-8">Timestamp</th>
                          <th className="p-8">Sector</th>
                          <th className="p-8">Result</th>
                          <th className="p-8">Log Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-950/10">
                        {recentLogs.map(log => (
                          <tr key={log.id} className="hover:bg-red-500/[0.02] transition-colors group">
                            <td className="p-8 text-slate-400 font-black text-[10px] uppercase">{new Date(log.check_time).toLocaleString()}</td>
                            <td className="p-8 text-white font-black text-[10px] uppercase">{log.checkpoint_name}</td>
                            <td className="p-8">
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                log.result === 'Valid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                log.result === 'Suspicious' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                                'bg-red-500/10 text-red-500 border-red-500/20'
                              }`}>
                                {log.result}
                              </span>
                            </td>
                            <td className="p-8 text-slate-600 font-black text-[10px] uppercase truncate max-w-[200px]">
                               {log.remarks || '---'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkpoint;  