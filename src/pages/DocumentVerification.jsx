import React, { useState, useEffect } from 'react';
import api from '../api';
import { FileCheck, CheckCircle, XCircle, FileImage, User as UserIcon, Upload } from 'lucide-react';

const DocumentVerification = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [originalImage, setOriginalImage] = useState(null);
  const [originalImagePreview, setOriginalImagePreview] = useState(null);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/security/pending-verifications');
      setPendingUsers(res.data);
      if (res.data.length > 0 && !selectedUser) {
        handleSelectUser(res.data[0]);
      } else if (res.data.length === 0) {
        handleSelectUser(null);
      } else {
        const stillExists = res.data.find(u => u.id === selectedUser.id);
        if (!stillExists) handleSelectUser(res.data[0] || null);
      }
    } catch (err) {
      console.error("Error fetching pending verifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setOriginalImage(null);
    if (originalImagePreview) {
      URL.revokeObjectURL(originalImagePreview);
    }
    setOriginalImagePreview(null);
  };

  const handleOriginalImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalImage(file);
      setOriginalImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVerify = async (action) => {
    if (!selectedUser) return;
    try {
      const formData = new FormData();
      if (originalImage) {
        formData.append('original_document', originalImage);
      }
      
      await api.post(`/security/verifications/${selectedUser.id}/verify?action=${action}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`Document successfully ${action}d.`);
      handleSelectUser(null);
      fetchPendingVerifications();
    } catch (err) {
      console.error(`Error ${action}ing document`, err);
      alert("Failed to process verification. Please try again.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050308', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar: Tactical Queue */}
      <div className="w-96 border-r border-red-950/30 flex flex-col bg-black/40 backdrop-blur-xl">
        <div className="p-8 border-b border-red-950/30">
          <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.25em] mb-3">Priority Queue</p>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
             Verifications
          </h2>
        </div>
        
        <div className="overflow-y-auto flex-1 p-6 space-y-4 custom-scrollbar">
          {loading && (
             <div className="py-20 text-center flex flex-col items-center opacity-40">
                <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Retrieving Data...</p>
             </div>
          )}
          {!loading && pendingUsers.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center opacity-40">
               <CheckCircle size={40} className="text-green-500 mb-4" />
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Queue Fully Cleared</p>
            </div>
          )}
          {pendingUsers.map(u => (
            <button
              key={u.id}
              onClick={() => handleSelectUser(u)}
              className={`w-full text-left p-5 rounded-2xl border transition-all relative group ${selectedUser?.id === u.id ? 'bg-red-500/10 border-red-500/30 shadow-2xl' : 'bg-slate-900/20 border-red-950/20 hover:border-red-500/20'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${selectedUser?.id === u.id ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-slate-700'}`} />
                <div className="overflow-hidden flex-1">
                  <span className={`block font-black text-sm truncate ${selectedUser?.id === u.id ? 'text-white' : 'text-slate-400'}`}>{u.email}</span>
                  <span className="block text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">
                    REFERENCE_ID::{u.id}
                  </span>
                </div>
              </div>
              {selectedUser?.id === u.id && <div className="absolute top-0 right-0 w-1 h-full bg-red-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Area: Tactical Analysis */}
      <div className="flex-1 flex flex-col bg-[#050308] relative">
        {selectedUser ? (
          <>
            <div className="p-8 border-b border-red-950/30 bg-black/40 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-red-950/30 flex items-center justify-center text-slate-500">
                   <UserIcon size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                    Cross-Analysis: {selectedUser.email}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="w-1 h-1 rounded-full bg-orange-500" />
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                        Visual Identity Matching Required
                     </p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                 <span className="text-[10px] text-orange-500 font-black uppercase tracking-widest animate-pulse">Subject Pending Approval</span>
              </div>
            </div>

            <div className="flex-1 p-10 flex flex-col gap-10 overflow-y-auto custom-scrollbar">
              {/* Profile Intelligence */}
              <div className="bg-slate-900/30 border border-red-950/20 p-8 rounded-[2rem] grid grid-cols-2 lg:grid-cols-5 gap-8 backdrop-blur-xl">
                {[
                  { label: 'Subject Name', value: `${selectedUser.first_name || '---'} ${selectedUser.last_name || ''}`, color: 'text-white' },
                  { label: 'Origin Jurisdiction', value: selectedUser.country_code || 'UNSPECIFIED', color: 'text-slate-300' },
                  { label: 'Chronology (DOB)', value: selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : 'N/A', color: 'text-slate-300' },
                  { label: 'Credential Schema', value: selectedUser.document_type || 'PASSPORT', color: 'text-red-400' },
                  { label: 'Queue Priority', value: 'IMMEDIATE', color: 'text-orange-500' }
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.25em] mb-2">{item.label}</p>
                    <p className={`font-black text-xs uppercase tracking-widest ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Tactical Comparison Console */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-[500px]">
                {/* Visual A: Remote Upload */}
                <div className="bg-slate-900/30 border border-red-950/20 rounded-[2.5rem] overflow-hidden flex flex-col group backdrop-blur-xl">
                  <div className="p-6 border-b border-red-950/10 bg-slate-950/30 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">REMOTE_UPLOAD_STREAM</span>
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">SOURCE::CLIENT</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center p-8 relative">
                    {selectedUser.document_url ? (
                      <img 
                        src={selectedUser.document_url} 
                        alt="Remote Document" 
                        className="max-h-[450px] w-full object-contain rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-700 shadow-2xl border border-red-950/20"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=DATA_STREAM_ERROR' }}
                      />
                    ) : (
                      <div className="text-slate-800 flex flex-col items-center gap-4">
                        <FileImage size={64} className="opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">NO REMOTE SIGNAL</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual B: HQ Verification */}
                <div className="bg-slate-900/30 border border-red-950/20 rounded-[2.5rem] overflow-hidden flex flex-col group backdrop-blur-xl">
                  <div className="p-6 border-b border-red-950/10 bg-slate-950/30 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HQ_OPTICAL_SCAN</span>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">SOURCE::TACTICAL_UNIT</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                    {originalImagePreview ? (
                      <div className="relative group/img w-full h-full flex items-center justify-center">
                        <img 
                          src={originalImagePreview} 
                          alt="HQ Document" 
                          className="max-h-[450px] w-full object-contain rounded-2xl shadow-2xl border border-red-950/20"
                        />
                        <button 
                          onClick={() => { setOriginalImage(null); setOriginalImagePreview(null); }}
                          className="absolute top-4 right-4 bg-red-600/80 hover:bg-red-600 text-white p-3 rounded-2xl opacity-0 group-hover/img:opacity-100 transition-all backdrop-blur-xl"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer group/upload text-slate-600 hover:text-red-500 transition-all flex flex-col items-center border-2 border-dashed border-red-950/30 hover:border-red-500/50 rounded-[2rem] p-16 w-full max-w-md text-center bg-slate-950/30">
                        <Upload size={48} className="mb-6 opacity-20 group-hover/upload:opacity-100 transition-all" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3">Capture Field Identity</p>
                        <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest leading-relaxed">Optical scan required for matching verification protocol</p>
                        <input type="file" className="hidden" accept="image/*" onChange={handleOriginalImageUpload} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Actions */}
            <div className="p-10 bg-black/40 border-t border-red-950/20 backdrop-blur-xl flex gap-6">
              <button
                onClick={() => handleVerify('reject')}
                className="flex-1 bg-slate-950 border border-red-900/30 text-red-500 py-6 hover:bg-red-500/10 transition-all flex items-center justify-center gap-4 font-black uppercase tracking-[0.2em] text-xs rounded-3xl"
              >
                <XCircle size={20} /> Terminate Process
              </button>
              <button
                onClick={() => handleVerify('approve')}
                disabled={!originalImagePreview}
                className={`flex-1 flex items-center justify-center gap-4 font-black uppercase tracking-[0.2em] text-xs rounded-3xl py-6 transition-all ${originalImagePreview ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-2xl shadow-green-900/30 hover:scale-[1.02]' : 'bg-slate-900/50 border border-red-950/10 text-slate-700 cursor-not-allowed'}`}
              >
                <ShieldCheck size={20} /> Validate & Authorized
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-800">
            <div className="w-32 h-32 rounded-[3rem] bg-slate-900/30 border border-red-950/10 flex items-center justify-center mb-8">
               <FileCheck size={64} className="opacity-20" />
            </div>
            <h2 className="text-3xl font-black text-slate-400 uppercase tracking-widest">Protocol Nominal</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 opacity-40">Operational Status: Standing By for New Intelligence</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentVerification;  
