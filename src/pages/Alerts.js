import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  ShieldAlert, AlertTriangle, CheckCircle, Radio, MapPin,
  Clock, Loader2, MessageSquare, X
} from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, dispatched, resolved
  const [modal, setModal] = useState(null); // { alert, action }
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/security/sos-alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to load SOS alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!modal) return;
    setSubmitting(true);
    try {
      await api.patch(
        `/security/sos-alerts/${modal.alert.id}/respond?status=${modal.action}&reason=${encodeURIComponent(reason)}`
      );
      setModal(null);
      setReason('');
      fetchAlerts();
    } catch (err) {
      alert('Action failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-900/40 text-red-400 border border-red-800"><Radio size={10} className="animate-pulse" /> PENDING</span>,
      dispatched: <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-900/30 text-yellow-400 border border-yellow-800"><AlertTriangle size={10} /> DISPATCHED</span>,
      resolved: <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-900/30 text-green-400 border border-green-800"><CheckCircle size={10} /> RESOLVED</span>,
    };
    return map[status] || <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-700 text-gray-300">{status}</span>;
  };

  const filtered = alerts.filter(a => filter === 'all' || a.status === filter);
  const counts = {
    all: alerts.length,
    pending: alerts.filter(a => a.status === 'pending').length,
    dispatched: alerts.filter(a => a.status === 'dispatched').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: '#050308', fontFamily: "'Inter', sans-serif" }}>
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #dc2626, #ef4444)' }} />
      
      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.25em] mb-3">Emergency Response</p>
            <h1 className="text-4xl font-black text-white flex items-center gap-4">
               SOS Operations
            </h1>
          </div>
          <div className="flex bg-slate-900/50 rounded-2xl border border-red-950/40 p-2 backdrop-blur-xl">
             <div className="px-4 py-2 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Global Watch Active</span>
             </div>
          </div>
        </div>

        {/* Tactical Filters / Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {Object.entries(counts).map(([key, val]) => {
            const isActive = filter === key;
            const config = {
              all: { color: 'text-white', bg: 'bg-slate-900/40', border: 'border-slate-800' },
              pending: { color: 'text-red-500', bg: 'bg-red-500/5', border: 'border-red-900/20' },
              dispatched: { color: 'text-orange-500', bg: 'bg-orange-500/5', border: 'border-orange-900/20' },
              resolved: { color: 'text-green-500', bg: 'bg-green-500/5', border: 'border-green-900/20' }
            };
            const current = config[key];
            
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`relative overflow-hidden p-8 rounded-[2rem] border transition-all text-left group ${isActive ? `${current.bg} ${current.border} shadow-2xl` : 'bg-transparent border-slate-900/50 hover:border-slate-800'}`}
              >
                <p className={`text-4xl font-black mb-1 ${isActive ? current.color : 'text-slate-600'}`}>{val.toString().padStart(2, '0')}</p>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-slate-400' : 'text-slate-700'}`}>{key}</p>
                {isActive && <div className={`absolute top-0 left-0 w-1 h-full ${current.color.replace('text-', 'bg-')}`} />}
              </button>
            );
          })}
        </div>

        {/* Alert Feed */}
        <div className="bg-slate-900/40 rounded-[2.5rem] border border-red-950/40 overflow-hidden backdrop-blur-xl">
          <div className="p-8 border-b border-red-950/20 flex justify-between items-center">
             <h3 className="text-white font-black text-sm uppercase tracking-widest">Active Incident Stream</h3>
             <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Showing {filtered.length} Dispatches</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-600 font-black uppercase tracking-widest border-b border-red-950/10">
                  <th className="p-8">Subject Identity</th>
                  <th className="p-8">Deployment Zone</th>
                  <th className="p-8 text-center">Status</th>
                  <th className="p-8 text-right">Directives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-950/10">
                {filtered.map(alert => (
                  <tr key={alert.id} className="hover:bg-red-500/[0.02] transition-colors group">
                    <td className="p-8">
                      <p className="font-black text-white text-base group-hover:text-red-500 transition-colors">{alert.tourist_name || alert.tourist_email}</p>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-mono text-slate-600">AUTH::</span>
                         <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">{alert.tourist_id || `UID#${alert.user_id}`}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-red-950/30 flex items-center justify-center text-red-500">
                            <MapPin size={14} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-300 uppercase tracking-tight">{alert.location || 'UNDETERMINED'}</p>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-0.5">{alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : '---'}</p>
                         </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex justify-center">
                         {getStatusBadge(alert.status)}
                      </div>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {alert.status === 'pending' && (
                          <button
                            onClick={() => setModal({ alert, action: 'dispatched' })}
                            className="px-6 py-2.5 bg-orange-600/10 text-orange-500 border border-orange-500/20 hover:bg-orange-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            Dispatch Unit
                          </button>
                        )}
                        {alert.status !== 'resolved' && (
                          <button
                            onClick={() => setModal({ alert, action: 'resolved' })}
                            className="px-6 py-2.5 bg-green-600/10 text-green-500 border border-green-500/20 hover:bg-green-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            Resolve Alert
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filtered.length === 0 && (
              <div className="py-24 text-center">
                 <div className="w-20 h-20 rounded-[2rem] bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-700 mb-6">
                    <ShieldAlert size={40} />
                 </div>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em]">No Threats Detected in this Sector</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tactical Response Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0f0b1a] border border-red-950/40 rounded-[2.5rem] max-w-lg w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className={`p-10 border-b border-red-950/20 ${modal.action === 'dispatched' ? 'bg-orange-600/5' : 'bg-green-600/5'}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-6">
                   <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-2xl ${modal.action === 'dispatched' ? 'bg-orange-600/20 text-orange-500' : 'bg-green-600/20 text-green-500'}`}>
                      {modal.action === 'dispatched' ? <Radio className="animate-pulse" size={32} /> : <CheckCircle size={32} />}
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-white tracking-tight uppercase">{modal.action === 'dispatched' ? 'Deploy Response' : 'Signal Resolution'}</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Incident Reference #{modal.alert.id}</p>
                   </div>
                </div>
                <button onClick={() => setModal(null)} className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-900 text-slate-600 hover:text-white transition-all flex items-center justify-center">
                   <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-10">
              <div className="mb-8 bg-slate-950/60 rounded-2xl p-6 border border-red-950/10">
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Target Identity</p>
                 <p className="text-lg font-black text-white">{modal.alert.tourist_name || modal.alert.tourist_email}</p>
                 <p className="text-xs text-slate-500 font-mono mt-1 uppercase">POS::{modal.alert.location || 'LAT_LNG_MISSING'}</p>
              </div>

              <div className="mb-2">
                 <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4 block ml-1">Directive Rationale</label>
                 <textarea
                   value={reason}
                   onChange={(e) => setReason(e.target.value)}
                   placeholder="ENTER RESPONSE PROTOCOL DETAILS..."
                   className="w-full bg-slate-950/40 border border-red-950/30 text-white rounded-2xl p-6 text-sm focus:outline-none focus:border-red-500/50 transition-all placeholder-slate-800 h-32 resize-none font-medium"
                 />
              </div>
            </div>

            <div className="p-10 bg-slate-900/20 border-t border-red-950/10 flex justify-end gap-4">
               <button onClick={() => setModal(null)} className="px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-slate-600 hover:text-white transition-all">
                  Cancel
               </button>
               <button
                 onClick={handleRespond}
                 disabled={submitting}
                 className={`px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white flex items-center gap-4 shadow-2xl transition-all ${
                   modal.action === 'dispatched' ? 'bg-gradient-to-r from-orange-600 to-amber-600 shadow-orange-900/40' : 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-green-900/40'
                 } ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
               >
                 {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                 Authorize {modal.action === 'dispatched' ? 'Deployment' : 'Resolution'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default Alerts;
