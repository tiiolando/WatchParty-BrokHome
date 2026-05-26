// Author: SyncStream Engineer
// OS support: Cross-platform
// Description: Console d'administration avec gestion des rôles, membres et stockage dynamique

import React, { useState, useEffect } from 'react';
import { User, Role, Permission } from '../types.ts';

interface AdminDashboardProps {
  user: User;
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab ] = useState<'monitoring' | 'roles' | 'members' | 'storage' | 'rooms' | 'notifications' | 'catalog'>('monitoring');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [paths, setPaths] = useState<{path: string, isPremium: boolean}[]>([]);
  const [catalogFolders, setCatalogFolders] = useState<{path: string, image: string | null}[]>([]);
  const [userGoals, setUserGoals] = useState<any[]>([]);
  const [newGoal, setNewGoal] = useState({ title: '', target: 0 });
  const [rooms, setRooms] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<{username: string, rooms: string[]}[]>([]);
  const [disks, setDisks] = useState<string[]>([]);
  const [fonts, setFonts] = useState<string[]>([]);
  const [config, setConfig] = useState<{ showCarousels: boolean, brokhometvFont?: string }>({ showCarousels: true, brokhometvFont: 'Inter' });
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);
  const [newPathInput, setNewPathInput] = useState('');
  const [newPathIsPremium, setNewPathIsPremium] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const [discordStatus, setDiscordStatus] = useState<string>('OFFLINE');
  const [discordConfig, setDiscordConfig] = useState({ token: '', clientId: '', autoStart: true });
  const [discordLogs, setDiscordLogs] = useState<any[]>([]);
  const [isSavingDiscord, setIsSavingDiscord] = useState(false);
  const [isTogglingDiscord, setIsTogglingDiscord] = useState(false);

  const [notifMessage, setNotifMessage] = useState('');
  const [notifDuration, setNotifDuration] = useState('60');
  const [currentNotif, setCurrentNotif] = useState<any>(null);

  const ALL_PERMISSIONS = [
    'MANAGE_ROLES', 'MANAGE_USERS', 'MANAGE_ROOMS', 'MANAGE_PATHS', 
    'KICK_MEMBERS', 'ADD_TO_PLAYLIST', 'VIEW_STATS', 'BYPASS_PASSWORD', 'VIEW_PERFORMANCE'
  ];

  const diceBearStyles = [
    'avataaars', 'bottts', 'adventurer', 'fun-emoji', 'pixel-art', 
    'big-ears', 'croodles', 'miniavs', 'notionists', 'lorelei'
  ];

  const fetchData = async () => {
    try {
        const [uRes, rRes, pRes, roomsRes, notifRes, configRes, onlineRes, disksRes, fontsRes, catRes, goalsRes] = await Promise.all([
            fetch('/api/users'),
            fetch('/api/admin/roles'),
            fetch('/api/admin/paths'),
            fetch('/api/admin/rooms'),
            fetch('/api/system-notification'),
            fetch('/api/config'),
            fetch('/api/admin/online-users'),
            fetch('/api/admin/disks'),
            fetch('/api/admin/fonts'),
            fetch('/api/admin/catalog-folders'),
            fetch('/api/admin/user-goals')
        ]);
        if (uRes.ok) setUsers(await uRes.json());
        if (rRes.ok) setRoles(await rRes.json());
        if (pRes.ok) setPaths(await pRes.json());
        if (roomsRes.ok) setRooms(await roomsRes.json());
        if (notifRes.ok) setCurrentNotif(await notifRes.json());
        if (configRes.ok) setConfig(await configRes.json());
        if (onlineRes.ok) setOnlineUsers(await onlineRes.json());
        if (disksRes.ok) setDisks(await disksRes.json());
        if (fontsRes.ok) setFonts(await fontsRes.json());
        if (catRes.ok) setCatalogFolders(await catRes.json());
        if (goalsRes.ok) setUserGoals(await goalsRes.json());

        const discordRes = await fetch('/api/admin/discord/status');
        if (discordRes.ok) {
            const dData = await discordRes.json();
            setDiscordStatus(dData.status);
            setDiscordConfig(dData.config);
        }

        const logsRes = await fetch('/api/admin/discord/logs');
        if (logsRes.ok) setDiscordLogs(await logsRes.json());
    } catch (e) { console.error("Erreur de récupération:", e); } finally { setLoading(false); }
  };

  useEffect(() => {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
  }, []);

  const handleSaveRole = async () => {
    if (!editingRole?.id || !editingRole?.name) return;
    const finalRole = {
        ...editingRole,
        permissions: editingRole.permissions || []
    };
    await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: finalRole })
    });
    setEditingRole(null);
    fetchData();
  };

  const handleDeleteRole = async (id: string) => {
    if (!window.confirm("Supprimer ce rôle ?")) return;
    await fetch(`/api/admin/roles/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const togglePermission = (perm: string) => {
    if (!editingRole) return;
    const perms = editingRole.permissions || [];
    const newPerms = perms.includes(perm as any) 
        ? perms.filter(p => p !== perm) 
        : [...perms, perm as any];
    setEditingRole({ ...editingRole, permissions: newPerms });
  };

  const handleUpdateUserRole = async (userId: string, roleId: string) => {
      await fetch('/api/admin/users/role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, roleId })
      });
      fetchData();
  };

  const handleAddPath = async () => {
      if (!newPathInput.trim()) return;
      setIsScanning(true);
      try {
          const res = await fetch('/api/admin/paths', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path: newPathInput, isPremium: newPathIsPremium })
          });
          const data = await res.json();
          if (res.ok) {
              setPaths(data.paths);
              setNewPathInput('');
              setNewPathIsPremium(false);
              alert(`Succès ! Index mis à jour avec ${data.count} titres.`);
          } else {
              alert(data.error);
          }
      } finally { setIsScanning(false); }
  };

  const handleDeletePath = async (target: string) => {
      if (!window.confirm(`Supprimer ${target} de l'indexation ? Les fichiers ne seront plus visibles.`)) return;
      const res = await fetch('/api/admin/paths', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: target })
      });
      const data = await res.json();
      if (res.ok) setPaths(data.paths);
  };

  const handleManualScan = async () => {
      setIsScanning(true);
      try {
          const res = await fetch('/api/admin/refresh-movies', { method: 'POST' });
          const data = await res.json();
          alert(`Scan terminé : ${data.count} fichiers indexés.`);
      } finally { setIsScanning(false); }
  };

  const handleToggleRoomPremium = async (roomId: string, isPremium: boolean) => {
      await fetch('/api/admin/rooms/premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, isPremium })
      });
      fetchData();
  };

  const handleTogglePathPremium = async (path: string) => {
      const res = await fetch('/api/admin/paths/toggle-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path })
      });
      if (res.ok) {
          const data = await res.json();
          setPaths(data.paths);
      }
  };

  const handleUpdateFont = async (font: string) => {
      const res = await fetch('/api/admin/config/font', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ font })
      });
      if (res.ok) {
          const data = await res.json();
          setConfig(data);
      }
  };

  const handleSendNotification = async () => {
      await fetch('/api/admin/notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: notifMessage, duration: parseInt(notifDuration) })
      });
      setNotifMessage('');
      fetchData();
  };

  const handleClearNotification = async () => {
      await fetch('/api/admin/notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: '' })
      });
      fetchData();
  };

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.target) return;
    await fetch('/api/admin/user-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: newGoal })
    });
    setNewGoal({ title: '', target: 0 });
    fetchData();
  };

  const handleDeleteGoal = async (id: string) => {
    await fetch(`/api/admin/user-goals/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const [newCatalogPath, setNewCatalogPath] = useState('');
  const [newCatalogImage, setNewCatalogImage] = useState('');

  const handleAddCatalogFolder = async () => {
      if (!newCatalogPath.trim()) return;
      await fetch('/api/admin/catalog-folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder: { path: newCatalogPath, image: newCatalogImage || null } })
      });
      setNewCatalogPath('');
      setNewCatalogImage('');
      fetchData();
  };

  const handleDeleteCatalogFolder = async (path: string) => {
      await fetch('/api/admin/catalog-folders', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path })
      });
      fetchData();
  };

  const handleToggleCarousels = async (show: boolean) => {
    try {
        const res = await fetch('/api/admin/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ showCarousels: show })
        });
        if (res.ok) {
            setConfig(await res.json());
        }
    } catch (e) { console.error(e); }
  };

  const handleSaveDiscordConfig = async () => {
    setIsSavingDiscord(true);
    try {
        const res = await fetch('/api/admin/discord/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordConfig)
        });
        if (res.ok) alert("Configuration Discord enregistrée !");
    } catch (e) { console.error(e); }
    finally { setIsSavingDiscord(false); }
  };

  const handleToggleDiscordBot = async (action: 'start' | 'stop') => {
    setIsTogglingDiscord(true);
    try {
        const res = await fetch('/api/admin/discord/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        if (res.ok) {
            const data = await res.json();
            setDiscordStatus(data.status);
        }
    } catch (e) { console.error(e); }
    finally { setIsTogglingDiscord(false); }
  };

  const handleClearDiscordLogs = async () => {
    await fetch('/api/admin/discord/logs/clear', { method: 'POST' });
    setDiscordLogs([]);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center font-black text-red-600 animate-pulse italic">SYNCHRONISATION...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-12 font-sans overflow-y-auto">
      <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-20">
        <div className="flex justify-between items-center">
            <h1 className="text-4xl font-black italic uppercase text-red-600 tracking-tighter">Console Admin v2.5</h1>
            <button onClick={onBack} className="bg-red-600 px-8 py-3 rounded-full text-[10px] font-black uppercase shadow-xl hover:scale-105 transition-all">Retour Dashboard</button>
        </div>

        <nav className="flex gap-6 border-b border-white/5 pb-4 overflow-x-auto scrollbar-hide">
            {([
                ['monitoring', 'Monitoring'],
                ['storage', 'Stockage & Index'],
                ['catalog', 'Catalogue'],
                ['roles', 'Rôles & Permissions'],
                ['members', 'Membres'],
                ['rooms', 'Salons'],
                ['notifications', 'Notifications']
            ] as const).map(([id, label]) => (
                <button 
                    key={id} 
                    onClick={() => setActiveTab(id)}
                    className={`text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === id ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-white'}`}
                >
                    {label}
                </button>
            ))}
        </nav>

        {activeTab === 'storage' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
                <div className="lg:col-span-7 space-y-8">
                    <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] -mr-32 -mt-32"></div>
                        <h2 className="text-2xl font-black italic uppercase text-red-600 mb-8 relative z-10">Points de Montage</h2>
                        
                        <div className="flex flex-col gap-4 mb-10 relative z-10">
                            <div className="flex gap-4">
                                <input 
                                    type="text" 
                                    placeholder="C:\Vidéos ou /mnt/movies..." 
                                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-5 text-[11px] font-black uppercase outline-none focus:border-red-600 transition-all italic"
                                    value={newPathInput}
                                    onChange={e => setNewPathInput(e.target.value)}
                                />
                                <button 
                                    onClick={handleAddPath}
                                    disabled={isScanning}
                                    className={`bg-red-600 px-8 rounded-2xl font-black text-[10px] uppercase shadow-xl transition-all ${isScanning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                                >
                                    {isScanning ? 'SCAN...' : 'AJOUTER'}
                                </button>
                            </div>
                            <div className="flex items-center gap-3 px-2">
                                <input 
                                    type="checkbox" 
                                    id="isPremiumPath"
                                    checked={newPathIsPremium}
                                    onChange={e => setNewPathIsPremium(e.target.checked)}
                                    className="w-4 h-4 accent-red-600"
                                />
                                <label htmlFor="isPremiumPath" className="text-[10px] font-black uppercase italic text-gray-400 cursor-pointer">Marquer comme chemin PREMIUM</label>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {paths.map(p => (
                                <div key={p.path} className="flex items-center justify-between p-6 bg-black/20 rounded-[2rem] border border-white/5 group hover:border-red-600/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xl">💾</span>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black uppercase italic tracking-widest opacity-80">{p.path}</span>
                                            <span className={`text-[8px] font-black uppercase italic ${p.isPremium ? 'text-yellow-500' : 'text-green-500'}`}>
                                                {p.isPremium ? 'PREMIUM' : 'FREE'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => handleTogglePathPremium(p.path)}
                                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${p.isPremium ? 'bg-yellow-600 text-black' : 'bg-green-600 text-white'}`}
                                        >
                                            {p.isPremium ? 'PREMIUM' : 'FREE'}
                                        </button>
                                        <button onClick={() => handleDeletePath(p.path)} className="p-3 bg-red-600/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {paths.length === 0 && (
                                <p className="text-center py-10 text-[9px] font-black uppercase italic text-gray-600">Aucun chemin configuré. Indexation vide.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                        <h2 className="text-xl font-black italic uppercase text-red-600 mb-6">Disques Détectés</h2>
                        <div className="flex flex-wrap gap-3">
                            {disks.map(d => (
                                <button 
                                    key={d} 
                                    onClick={() => setNewPathInput(d + (d.includes(':') ? '\\' : ''))}
                                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:border-red-600 transition-all"
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                        <h2 className="text-xl font-black italic uppercase text-red-600 mb-6">Actions Index</h2>
                        <button 
                            onClick={handleManualScan}
                            disabled={isScanning}
                            className={`w-full bg-white/5 border border-white/10 p-8 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all flex flex-col items-center gap-4 ${isScanning ? 'animate-pulse' : ''}`}
                        >
                            <span className="text-3xl">🔄</span>
                            {isScanning ? 'INDEXATION EN COURS...' : 'RE-SCAN COMPLET'}
                        </button>
                        <p className="mt-6 text-[8px] font-bold text-gray-600 uppercase italic text-center px-4 leading-relaxed">
                            Le scan analyse récursivement tous les sous-dossiers des points de montage configurés. Supporte .mp4, .mkv, .webm.
                        </p>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'members' && (
            <div className="bg-[#111] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl animate-fade-in">
                <div className="p-8 border-b border-white/5 bg-black/40">
                    <h2 className="text-xl font-black italic uppercase text-red-600">Membres</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 text-[9px] font-black uppercase tracking-widest text-gray-500">
                            <tr>
                                <th className="px-8 py-6">Identité</th>
                                <th className="px-8 py-6">Rôle</th>
                                <th className="px-8 py-6">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6 flex items-center gap-5">
                                        <img src={u.avatar} className="w-12 h-12 rounded-[1.5rem] bg-gray-950 border border-white/10 shadow-lg" alt="avatar" />
                                        <span className="text-xs font-black uppercase italic">{u.username}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <select 
                                            className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-[9px] font-black uppercase outline-none focus:border-red-600 transition-all"
                                            value={u.roleId}
                                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                                        >
                                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-8 py-6 text-[9px] font-black text-green-500 uppercase italic">Actif</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'rooms' && (
            <div className="bg-[#111] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl animate-fade-in">
                <div className="p-8 border-b border-white/5 bg-black/40">
                    <h2 className="text-xl font-black italic uppercase text-red-600">Gestion des Salons</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 text-[9px] font-black uppercase tracking-widest text-gray-500">
                            <tr>
                                <th className="px-8 py-6">Nom du Salon</th>
                                <th className="px-8 py-6">Propriétaire</th>
                                <th className="px-8 py-6">Type</th>
                                <th className="px-8 py-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {rooms.map(r => (
                                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black uppercase italic">{r.name}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{users.find(u => u.id === r.ownerId)?.username || 'Inconnu'}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[9px] font-black uppercase italic ${r.isPremium ? 'text-yellow-500' : 'text-gray-500'}`}>
                                            {r.isPremium ? 'PREMIUM' : 'GRATUIT'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button 
                                            onClick={() => handleToggleRoomPremium(r.id, !r.isPremium)}
                                            className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${r.isPremium ? 'bg-gray-800 text-white' : 'bg-yellow-600 text-black'}`}
                                        >
                                            {r.isPremium ? 'PASSER EN GRATUIT' : 'PASSER EN PREMIUM'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'notifications' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
                <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                    <h2 className="text-2xl font-black italic uppercase text-red-600 mb-8">Nouvelle Notification</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Message d'annonce</label>
                            <textarea 
                                value={notifMessage}
                                onChange={e => setNotifMessage(e.target.value)}
                                placeholder="Maintenance prévue à 14h..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[11px] font-black uppercase outline-none focus:border-red-600 transition-all italic h-32 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Durée (minutes)</label>
                            <input 
                                type="number"
                                value={notifDuration}
                                onChange={e => setNotifDuration(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[11px] font-black uppercase outline-none focus:border-red-600 transition-all italic"
                            />
                        </div>
                        <button 
                            onClick={handleSendNotification}
                            className="w-full bg-red-600 py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all italic"
                        >
                            Diffuser l'annonce
                        </button>
                    </div>
                </div>

                <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                    <h2 className="text-2xl font-black italic uppercase text-red-600 mb-8">Notification Active</h2>
                    {currentNotif ? (
                        <div className="space-y-6">
                            <div className="bg-red-600/10 border border-red-600/20 p-8 rounded-[2rem]">
                                <p className="text-xs font-black uppercase italic leading-relaxed">{currentNotif.message}</p>
                                {currentNotif.expiresAt && (
                                    <p className="text-[8px] font-bold text-red-600 uppercase mt-4 italic">
                                        Expire le : {new Date(currentNotif.expiresAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <button 
                                onClick={handleClearNotification}
                                className="w-full bg-white/5 border border-white/10 py-5 rounded-2xl font-black text-[10px] uppercase hover:bg-red-600 transition-all italic"
                            >
                                Retirer la notification
                            </button>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-[2rem]">
                            <p className="text-[10px] font-black uppercase text-gray-600 italic">Aucune notification active</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
                <div className="lg:col-span-12 space-y-8">
                    <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                        <h2 className="text-2xl font-black italic uppercase text-red-600 mb-8">Gestion du Catalogue</h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-8 italic">Définissez les dossiers à afficher dans le catalogue public et attribuez-leur une image de couverture.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                            <input 
                                type="text" 
                                placeholder="Chemin du dossier (ex: Series/Violetta)" 
                                className="bg-black/40 border border-white/10 rounded-2xl p-5 text-[11px] font-black uppercase outline-none focus:border-red-600 transition-all italic"
                                value={newCatalogPath}
                                onChange={e => setNewCatalogPath(e.target.value)}
                            />
                            <input 
                                type="text" 
                                placeholder="URL de l'image (optionnel)" 
                                className="bg-black/40 border border-white/10 rounded-2xl p-5 text-[11px] font-black uppercase outline-none focus:border-red-600 transition-all italic"
                                value={newCatalogImage}
                                onChange={e => setNewCatalogImage(e.target.value)}
                            />
                            <button 
                                onClick={handleAddCatalogFolder}
                                className="bg-red-600 px-8 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all"
                            >
                                AJOUTER AU CATALOGUE
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {catalogFolders.map(f => (
                                <div key={f.path} className="bg-black/20 rounded-[2rem] border border-white/5 overflow-hidden group hover:border-red-600/30 transition-all">
                                    <div className="h-40 bg-gray-900 relative">
                                        {f.image ? (
                                            <img src={f.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={f.path} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🎬</div>
                                        )}
                                        <button 
                                            onClick={() => handleDeleteCatalogFolder(f.path)}
                                            className="absolute top-4 right-4 bg-red-600 w-8 h-8 rounded-full flex items-center justify-center font-bold hover:scale-110 transition-all"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-[11px] font-black uppercase italic tracking-widest truncate">{f.path}</p>
                                    </div>
                                </div>
                            ))}
                            {catalogFolders.length === 0 && (
                                <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-[3rem]">
                                    <p className="text-[10px] font-black uppercase italic text-gray-600">Aucun dossier spécifique au catalogue. Tout le contenu indexé est affiché par défaut.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'monitoring' && (
            <div className="space-y-10 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl text-center">
                        <p className="text-[10px] font-black text-gray-600 uppercase mb-2 tracking-widest">Utilisateurs</p>
                        <p className="text-5xl font-black italic text-red-600">{users.length}</p>
                    </div>
                    <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl text-center">
                        <p className="text-[10px] font-black text-gray-600 uppercase mb-2 tracking-widest">Points de Montage</p>
                        <p className="text-5xl font-black italic text-red-600">{paths.length}</p>
                    </div>
                    <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-red-600/5 group-hover:bg-red-600/10 transition-colors"></div>
                        <p className="text-[10px] font-black text-gray-600 uppercase mb-2 tracking-widest relative z-10">Système</p>
                        <p className="text-4xl font-black italic uppercase relative z-10">ONLINE</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                        <h2 className="text-xl font-black italic uppercase text-red-600 mb-6">Utilisateurs en Ligne</h2>
                        <div className="space-y-4">
                            {onlineUsers.map((u, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase italic">{u.username}</span>
                                        <span className="text-[8px] font-bold text-gray-500 uppercase italic">
                                            {u.rooms.length > 0 ? `Dans : ${u.rooms.join(', ')}` : 'Au Dashboard'}
                                        </span>
                                    </div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                </div>
                            ))}
                            {onlineUsers.length === 0 && (
                                <p className="text-center py-10 text-[9px] font-black uppercase italic text-gray-600">Personne en ligne actuellement.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                        <h2 className="text-xl font-black italic uppercase text-red-600 mb-6">Objectifs Utilisateurs</h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Titre de l'objectif (ex: 1000 Users)" 
                                    value={newGoal.title}
                                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                    className="bg-black/40 border border-white/10 rounded-2xl p-4 text-[10px] font-black uppercase outline-none focus:border-red-600 transition-all italic"
                                />
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="Cible" 
                                        value={newGoal.target || ''}
                                        onChange={e => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 text-[10px] font-black uppercase outline-none focus:border-red-600 transition-all italic"
                                    />
                                    <button 
                                        onClick={handleAddGoal}
                                        className="bg-red-600 px-6 rounded-2xl font-black text-[10px] uppercase hover:scale-105 transition-all"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {userGoals.map(goal => {
                                    const progress = Math.min(100, (users.length / goal.target) * 100);
                                    return (
                                        <div key={goal.id} className="p-6 bg-black/20 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                                            <div className="flex justify-between items-center mb-4 relative z-10">
                                                <div>
                                                    <p className="text-xs font-black uppercase italic">{goal.title}</p>
                                                    <p className="text-[8px] font-bold text-gray-500 uppercase mt-1 italic">
                                                        {users.length} / {goal.target} Utilisateurs
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteGoal(goal.id)}
                                                    className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                            <div className="h-2 bg-black/40 rounded-full overflow-hidden relative z-10">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                                <span className="text-4xl font-black italic">{Math.round(progress)}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {userGoals.length === 0 && (
                                    <p className="text-center py-6 text-[9px] font-black uppercase italic text-gray-600">Aucun objectif défini.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                        <h2 className="text-xl font-black italic uppercase text-red-600 mb-6">Configuration Interface</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-black/20 rounded-[2rem] border border-white/5">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[11px] font-black uppercase italic tracking-widest text-white">Affichage des Carrousels</span>
                                    <span className="text-[9px] font-bold text-gray-500 uppercase italic">Activer ou désactiver les carrousels de films sur le Dashboard</span>
                                </div>
                                <button 
                                    onClick={() => handleToggleCarousels(!config.showCarousels)}
                                    className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${config.showCarousels ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                                >
                                    {config.showCarousels ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
                                </button>
                            </div>

                            <div className="flex flex-col gap-4 p-6 bg-black/20 rounded-[2rem] border border-white/5">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[11px] font-black uppercase italic tracking-widest text-white">Police BROKHOMETV</span>
                                    <span className="text-[9px] font-bold text-gray-500 uppercase italic">Choisir la police pour le logo principal</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {fonts.map(f => (
                                        <button 
                                            key={f}
                                            onClick={() => handleUpdateFont(f)}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${config.brokhometvFont === f ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400'}`}
                                            style={{ fontFamily: f }}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'roles' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                        <h2 className="text-xl font-black italic uppercase text-red-600 mb-8">{editingRole?.id ? 'Modifier Rôle' : 'Nouveau Rôle'}</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[9px] font-black uppercase text-gray-500 mb-2 italic">ID du Rôle</label>
                                <input 
                                    type="text" 
                                    disabled={!!editingRole?.id}
                                    value={editingRole?.id || ''}
                                    onChange={e => setEditingRole(prev => ({ ...(prev || {}), id: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[10px] font-black uppercase outline-none focus:border-red-600 transition-all italic"
                                    placeholder="ex: moderator"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase text-gray-500 mb-2 italic">Nom d'affichage</label>
                                <input 
                                    type="text" 
                                    value={editingRole?.name || ''}
                                    onChange={e => setEditingRole(prev => ({ ...(prev || {}), name: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[10px] font-black uppercase outline-none focus:border-red-600 transition-all italic"
                                    placeholder="ex: Modérateur"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase text-gray-500 mb-2 italic">Couleur (HEX)</label>
                                <input 
                                    type="color" 
                                    value={editingRole?.color || '#ffffff'}
                                    onChange={e => setEditingRole(prev => ({ ...(prev || {}), color: e.target.value }))}
                                    className="w-full h-12 bg-black/40 border border-white/10 rounded-xl p-1 outline-none focus:border-red-600 transition-all cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase text-gray-500 mb-3 italic">Permissions</label>
                                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-none">
                                    {ALL_PERMISSIONS.map(p => {
                                        const isSelected = (editingRole?.permissions || []).includes(p as any);
                                        return (
                                            <button 
                                                key={p}
                                                type="button"
                                                onClick={() => {
                                                    const perms = editingRole?.permissions || [];
                                                    const newPerms = perms.includes(p as any)
                                                        ? perms.filter(x => x !== p)
                                                        : [...perms, p as any];
                                                    setEditingRole(prev => ({ ...(prev || {}), permissions: newPerms as any[] }));
                                                }}
                                                className={`text-[8px] font-black uppercase p-3 rounded-xl border text-left transition-all flex justify-between items-center ${isSelected ? 'bg-red-600/10 border-red-600/30 text-red-600' : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/10'}`}
                                            >
                                                <span>{p.replace('MANAGE_', '').replace('_', ' ')}</span>
                                                <span>{isSelected ? '✓' : ''}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <button 
                                onClick={handleSaveRole}
                                className="w-full bg-red-600 py-4 rounded-xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all italic"
                            >
                                Enregistrer Rôle
                            </button>
                            {editingRole && (
                                <button 
                                    onClick={() => setEditingRole(null)}
                                    className="w-full bg-white/5 py-4 rounded-xl font-black text-[10px] uppercase hover:bg-white/10 transition-all italic"
                                >
                                    Annuler
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                        <h2 className="text-xl font-black italic uppercase text-red-600 mb-8">Permissions & Rôles Existants</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {roles.map(r => (
                                <div key={r.id} className="p-6 bg-black/20 rounded-[2rem] border border-white/5 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }}></div>
                                            <span className="text-xs font-black uppercase italic">{r.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingRole(r)} className="text-[9px] font-black text-blue-500 uppercase hover:underline">Editer</button>
                                            <button onClick={() => handleDeleteRole(r.id)} className="text-[9px] font-black text-red-600 uppercase hover:underline">Supprimer</button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {ALL_PERMISSIONS.map(p => (
                                            <button 
                                                key={p}
                                                onClick={() => editingRole?.id === r.id && togglePermission(p)}
                                                className={`text-[7px] font-black uppercase px-2 py-1 rounded-md border transition-all ${r.permissions.includes(p as any) ? 'bg-red-600/20 border-red-600/40 text-red-600' : 'bg-white/5 border-white/10 text-gray-600'}`}
                                            >
                                                {p.replace('MANAGE_', '').replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};