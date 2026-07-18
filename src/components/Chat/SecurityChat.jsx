import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { Send, ShieldAlert, Radio, AlertTriangle } from 'lucide-react';

const SecurityChat = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState('broadcast');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // In security frontend, profile is fetched from /user/profile
    api.get('/user/profile').then(res => {
      setCurrentUser(res.data);
    }).catch(err => console.error("Error fetching security profile", err));

    api.get('/chat/users').then(res => {
      setUsers(res.data);
    }).catch(err => console.error("Error fetching users", err));
  }, []);

  useEffect(() => {
    if (currentUser) {
      const websocket = new WebSocket(`ws://localhost:8000/api/chat/ws/${currentUser.id}/security`);
      websocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages(prev => {
          if (prev.find(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
        scrollToBottom();
      };
      setWs(websocket);

      return () => {
        websocket.close();
      };
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      let endpoint = `/chat/history/${currentUser.id}`;
      if (activeChat !== 'broadcast') {
        endpoint += `?other_user_id=${activeChat}`;
      }
      
      api.get(endpoint).then(res => {
        setMessages(res.data);
        scrollToBottom();
      }).catch(err => console.error("Error fetching chat history", err));
    }
  }, [activeChat, currentUser]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && ws) {
      const isBroadcast = activeChat === 'broadcast';
      ws.send(JSON.stringify({
        receiver_id: isBroadcast ? null : activeChat,
        message: newMessage,
        is_broadcast: isBroadcast
      }));
      setNewMessage('');
    }
  };

  const displayMessages = messages.filter(msg => {
    if (activeChat === 'broadcast') return msg.is_broadcast;
    return (msg.sender_id === activeChat || msg.receiver_id === activeChat) && !msg.is_broadcast;
  });

  return (
    <div className="flex flex-1 h-[calc(100vh-56px)] bg-black text-gray-200 font-mono">
      {/* Sidebar */}
      <div className="w-72 border-r border-red-900/30 flex flex-col bg-black">
        <div className="p-4 border-b border-red-900/30 bg-red-950/20">
          <h2 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
            <ShieldAlert size={16} /> SECURE COMMS LINK
          </h2>
        </div>
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          <button
            onClick={() => setActiveChat('broadcast')}
            className={`w-full text-left px-4 py-3 rounded border transition-all ${activeChat === 'broadcast' ? 'bg-red-900/40 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-black border-red-900/30 hover:border-red-500/50 text-gray-500'}`}
          >
            <div className="flex items-center gap-3">
              <Radio size={18} className={activeChat === 'broadcast' ? 'text-red-400 animate-pulse' : 'text-gray-600'} />
              <span className="font-bold text-sm tracking-wider">EMERGENCY BROADCAST</span>
            </div>
          </button>
          
          <div className="mt-6 mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-red-800">Active Units & Civilians</div>
          
          {users.filter(u => u.id !== currentUser?.id).map(u => (
            <button
              key={u.id}
              onClick={() => setActiveChat(u.id)}
              className={`w-full text-left px-4 py-3 rounded border transition-all ${activeChat === u.id ? 'bg-gray-900 border-gray-500 text-white' : 'bg-black border-gray-900 hover:border-gray-700 text-gray-500'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${u.role === 'user' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                <div className="overflow-hidden">
                  <span className="block font-bold text-xs truncate">{u.email}</span>
                  <span className="block text-[10px] text-gray-600 uppercase tracking-widest mt-1">ROLE: {u.role}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a]">
        <div className="p-4 border-b border-red-900/30 bg-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeChat === 'broadcast' ? (
              <AlertTriangle className="text-red-500" />
            ) : (
              <ShieldAlert className="text-gray-500" />
            )}
            <div>
              <h2 className={`font-black tracking-widest uppercase ${activeChat === 'broadcast' ? 'text-red-500' : 'text-white'}`}>
                {activeChat === 'broadcast' ? 'GLOBAL EMERGENCY CHANNEL' : `SECURE LINK: ${users.find(u => u.id === activeChat)?.email}`}
              </h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                {activeChat === 'broadcast' ? 'WARNING: ALL UNITS WILL RECEIVE THIS TRANSMISSION' : 'ENCRYPTED P2P CONNECTION ESTABLISHED'}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest animate-pulse">
            LINK ACTIVE
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {displayMessages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUser?.id;
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl p-4 text-sm border ${isMe ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-red-950/20 border-red-900/50 text-red-100'} ${isMe ? 'rounded-tl-xl rounded-bl-xl rounded-tr-xl' : 'rounded-tr-xl rounded-br-xl rounded-tl-xl'}`}>
                  {!isMe && (
                    <div className="text-[10px] text-red-500 mb-2 font-bold uppercase tracking-widest flex items-center gap-2">
                      <Radio size={10} />
                      {users.find(u => u.id === msg.sender_id)?.email || 'UNKNOWN_ORIGIN'}
                    </div>
                  )}
                  <div className="font-mono">{msg.message}</div>
                  <div className="text-[9px] opacity-40 mt-3 text-right">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-black border-t border-red-900/30">
          <form onSubmit={sendMessage} className="flex gap-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={activeChat === 'broadcast' ? "ENTER BROADCAST TRANSMISSION..." : "ENTER SECURE MESSAGE..."}
              className="flex-1 bg-[#0f0f0f] border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors font-mono text-sm placeholder:text-gray-700"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-red-900/20 border border-red-900 text-red-500 px-8 hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs"
            >
              TRANSMIT <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SecurityChat;
