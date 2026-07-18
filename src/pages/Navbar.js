import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, LogOut, Radio, FileCheck, Scan, AlertTriangle } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('security_token');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-red-950/40 backdrop-blur-xl bg-black/80" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-full px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-600 to-rose-900 shadow-lg shadow-red-900/20 group-hover:scale-105 transition-transform">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="hidden md:block">
                <span className="text-white font-black text-xl leading-none block tracking-tight">SecurityHQ</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] block">Tactical Unit</span>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-1 md:gap-3">
            {[
              { to: "/", icon: <Radio size={18} />, label: "Strategic Map" },
              { to: "/alerts", icon: <AlertTriangle size={18} />, label: "SOS Response", badge: "Live" },
              { to: "/checkpoint", icon: <Scan size={18} />, label: "Checkpost" },
              { to: "/verifications", icon: <FileCheck size={18} />, label: "Verifications" },
              { to: "/chat", icon: <Radio size={18} />, label: "Secure Comms" },
              { to: "/profile", icon: <User size={18} />, label: "Personnel ID" }
            ].map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-900 transition-all font-black text-[10px] uppercase tracking-widest relative group"
              >
                {link.icon}
                <span className="hidden lg:block">{link.label}</span>
                {link.badge && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-600 text-white text-[8px] rounded-md animate-bounce">
                    {link.badge}
                  </span>
                )}
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
              </Link>
            ))}
            
            <div className="w-px h-8 bg-slate-800 mx-3 hidden md:block" />
            
            <button 
              onClick={handleLogout} 
              className="p-3 rounded-xl text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
              title="Deauthorize Session"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;