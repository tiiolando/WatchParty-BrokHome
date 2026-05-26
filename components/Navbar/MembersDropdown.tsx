// Author: SyncStream Engineer
// OS support: Cross-platform
// Description: Liste déroulante des membres pour la barre de navigation

import React, { useState, useEffect } from 'react';
import { User } from '../../types.ts';

interface MembersDropdownProps {
  onClose: () => void;
  onViewProfile: (u: User) => void;
}

export const MembersDropdown: React.FC<MembersDropdownProps> = ({ onClose, onViewProfile }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setAllUsers(Array.isArray(data) ? data : []))
      .catch(() => setAllUsers([]));
  }, []);

  const filteredUsers = allUsers.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-6 animate-fade-in mx-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-black uppercase italic text-red-600">Communauté</h4>
        <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
      </div>
      <input 
        type="text" 
        placeholder="Chercher un membre..."
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold outline-none mb-4 focus:ring-1 focus:ring-red-600"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-hide">
        {filteredUsers.map(u => (
          <div 
            key={u.id} 
            onClick={() => { onViewProfile(u); onClose(); }}
            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group"
          >
            <img src={u.avatar} className="w-8 h-8 rounded-lg bg-gray-900" />
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase group-hover:text-red-600">{u.username}</p>
              <p className="text-[8px] font-bold text-gray-600 uppercase italic">{u.role?.name || 'Membre'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- End of MembersDropdown.tsx ---
