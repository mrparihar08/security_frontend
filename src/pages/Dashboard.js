import React, { useState, useEffect } from 'react';
import api from '../api';
import { AlertTriangle, Radio, Navigation2, Search, ShieldAlert, Map as MapIcon } from 'lucide-react'; // Added MapIcon
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom Blue Security Icon
const securityIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const mapCenter = [20.5937, 78.9629];

// Helper component to change map view
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center);
  return null;
}

const Dashboard = () => {
  const [locations, setLocations] = useState([]);
  const [aiAlerts, setAiAlerts] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    const interval = setInterval(fetchUpdates, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUpdates = async () => {
    try {
      const [locRes, alertRes] = await Promise.all([
        api.get('/monitoring/users/locations'),
        api.get('/monitoring/ai-alerts')
      ]);
      setLocations(locRes.data);
      setAiAlerts(alertRes.data);
      setIsAuthorized(true);
    } catch (err) {
      if (err.response?.status === 403) {
        setIsAuthorized(false);
      }
      console.error("Dashboard Sync Error:", err);
    }
  };

  const parseCoords = (locStr) => {
    if (!locStr) return null;
    const parts = locStr.split(',');
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    return isNaN(lat) || isNaN(lng) ? null : [lat, lng];
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#050308] p-6 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="w-24 h-24 rounded-3xl bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20">
          <ShieldAlert size={48} className="text-red-500" />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Access Restricted</h1>
        <p className="text-slate-500 max-w-md text-sm leading-relaxed mb-8">
          Operational clearance insufficient. This terminal is reserved for 
          <strong className="text-red-400 mx-1 uppercase tracking-wider">Security Personnel</strong> and 
          <strong className="text-red-400 mx-1 uppercase tracking-wider">Monitors</strong> only.
        </p>
        <button className="px-8 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-900/40">
          Request Clearance
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050308', fontFamily: "'Inter', sans-serif" }}>
      {/* Tactical Status Sidebar */}
      <div className="w-96 border-r border-red-950/30 flex flex-col bg-black/40 backdrop-blur-xl">
        <div className="p-8 border-b border-red-950/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.25em]">Live Monitoring</p>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
               <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Active</span>
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Security Intel</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {aiAlerts.map(alert => (
            <div key={alert.id} className="group relative overflow-hidden bg-slate-900/30 border border-red-900/20 p-5 rounded-2xl hover:border-red-500/40 transition-all hover:bg-red-500/[0.02]">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-0.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded text-[9px] font-black uppercase tracking-widest">
                  {alert.alert_type.replace('_', ' ')}
                </span>
                <span className="text-[9px] font-bold text-slate-600">SEQ_{alert.id.toString().padStart(4, '0')}</span>
              </div>
              <p className="text-slate-300 text-sm font-medium leading-relaxed mb-4 group-hover:text-white transition-colors">{alert.description}</p>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2 text-slate-500">
                  <Navigation2 size={12} className="text-red-600" />
                  {alert.location}
                </div>
                <span className="text-slate-600">2M AGO</span>
              </div>
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-60" />
            </div>
          ))}
          {aiAlerts.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center opacity-40">
               <Radio size={40} className="text-slate-700 mb-4" />
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">All Systems Nominal</p>
            </div>
          )}
        </div>
      </div>

      {/* Strategic Visualization Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-8 left-8 right-8 z-10 pointer-events-none">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 pointer-events-auto">
              <div className="bg-black/60 backdrop-blur-xl border border-red-950/40 p-1.5 rounded-2xl flex items-center gap-1.5">
                <div className="px-4 py-2.5 bg-slate-900/50 rounded-xl flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tourists Tracked: </span>
                  <span className="text-[10px] font-black text-white">{locations.length}</span>
                </div>
                <div className="px-4 py-2.5 bg-red-900/10 rounded-xl flex items-center gap-3 border border-red-500/10">
                  <AlertTriangle size={14} className="text-red-500" />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Critical Sectors: 02</span>
                </div>
              </div>
            </div>

            <div className="bg-black/60 backdrop-blur-xl border border-red-950/40 p-4 rounded-2xl pointer-events-auto flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  className="w-full bg-slate-950/50 border border-red-950/30 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50 transition-all placeholder-slate-700 font-bold tracking-tight" 
                  placeholder="ID ENTITY SCANNER..." 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#0a0a0a] overflow-hidden">
          <MapContainer center={mapCenter} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <ChangeView center={mapCenter} />
            {locations.map(u => {
              const pos = parseCoords(u.location);
              return pos ? (
                <Marker key={u.user_id} position={pos} icon={securityIcon}>
                  <Popup className="custom-popup">
                    <div className="p-3 bg-[#0f0b1a] border border-red-900/20 rounded-xl text-white">
                      <p className="font-black text-xs uppercase tracking-widest text-red-400 mb-1">{u.email}</p>
                      <p className="text-[10px] font-mono text-slate-500">IDREF::{u.user_id}</p>
                    </div>
                  </Popup>
                </Marker>
              ) : null;
            })}
          </MapContainer>
        </div>

        {/* Quick Action Overlay */}
        <div className="absolute bottom-8 left-8 right-8 z-10 pointer-events-none">
          <div className="flex justify-center gap-4 pointer-events-auto">
             <button className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-red-900/40 flex items-center gap-4 transition-all">
                <AlertTriangle size={18} className="animate-pulse" />
                Initiate Emergency Broadcast
             </button>
             <button className="px-8 py-4 bg-slate-900/80 backdrop-blur-xl border border-red-950/40 hover:border-red-500 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all">
                Dispatch Response Unit
             </button>
             <button className="px-8 py-4 bg-slate-900/80 backdrop-blur-xl border border-red-950/40 hover:border-red-500 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all">
                Lockdown Sub-Sector
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;