// Author: Senior Frontend Engineer
// OS support: Cross-platform
// Description: Dashboard BrokHomeTV avec gestion de salon et bibliothèque multimédia

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar.tsx';
import { Hero } from '../components/Hero.tsx';
import { MovieCarousel } from '../components/MovieCarousel.tsx';
import { Toast, ToastType } from '../components/Toast.tsx';
import { User, Room, LocalFile } from '../types.ts';
import { SocketService } from '../services/socket.ts';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onJoinRoom: (id: string, password?: string) => void;
  onGoToAdmin: () => void;
  onGoToMovies: () => void;
  onGoToPricing: () => void;
  onGoToAwareness: () => void;
  onOpenProfile: (u: User) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user: initialUser, onLogout, onJoinRoom, onGoToAdmin, onGoToMovies, onGoToPricing, onGoToAwareness, onOpenProfile }) => {
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [filter, setFilter] = useState<'all' | 'mine' | 'public'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [globalMessages, setGlobalMessages] = useState<any[]>([]);
  const [globalChatInput, setGlobalChatInput] = useState('');
  const [movies, setMovies] = useState<LocalFile[]>([]);
  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [showCarousels, setShowCarousels] = useState(true);
  const [movieActionModal, setMovieActionModal] = useState<{movie: LocalFile, isOpen: boolean} | null>(null);
  
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPassword, setNewRoomPassword] = useState('');
  const [newRoomIsVisible, setNewRoomIsVisible] = useState(true);
  const [newRoomHasChat, setNewRoomHasChat] = useState(true);

  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [suggestionType, setSuggestionType] = useState<'movie' | 'feature'>('movie');
  const [suggestionContent, setSuggestionContent] = useState('');

  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [editPasswordInput, setEditPasswordInput] = useState('');
  const [editIsVisible, setEditIsVisible] = useState(true);
  const [editHasChat, setEditHasChat] = useState(true);
  const [editIsPremium, setEditIsPremium] = useState(false);

  const isAdmin = currentUser.roleId === 'admin' || currentUser.role?.id === 'admin';

  useEffect(() => {
    setCurrentUser(initialUser);
  }, [initialUser]);

  const fetchRooms = () => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => setAllRooms(Array.isArray(data) ? data : []))
      .catch(() => setAllRooms([]));
  };

  useEffect(() => {
    fetchRooms();
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => setLeaderboard(Array.isArray(data) ? data : []))
      .catch(() => setLeaderboard([]));
    
    fetch('/api/global-chat')
      .then(res => res.json())
      .then(data => setGlobalMessages(data))
      .catch(() => setGlobalMessages([]));
    
    fetch(`/api/local-movies?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => setMovies(Array.isArray(data) ? data.filter((f: any) => !f.isDirectory) : []))
      .catch(() => setMovies([]));
    
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setShowCarousels(data.showCarousels))
      .catch(() => setShowCarousels(true));
    
    fetch('/api/catalogue')
      .then(res => res.json())
      .then(data => setCatalogue(data))
      .catch(() => setCatalogue([]));
    
    // Rafraîchir les infos utilisateur pour avoir le rôle à jour
    fetch(`/api/users`).then(res => res.json()).then(users => {
        const me = users.find((u: any) => u.id === currentUser.id);
        if (me) {
            setCurrentUser(me);
            localStorage.setItem('ss_session', JSON.stringify(me));
            SocketService.socket.emit('identify', me);
        }
    });

    const handleRoomsUpdate = (rooms: Room[]) => setAllRooms(rooms);
    const handleGlobalMessage = (msg: any) => setGlobalMessages(prev => [...prev.slice(-99), msg]);

    SocketService.socket.on('rooms-updated', handleRoomsUpdate);
    SocketService.socket.on('new-global-message', handleGlobalMessage);
    
    return () => { 
        SocketService.socket.off('rooms-updated', handleRoomsUpdate); 
        SocketService.socket.off('new-global-message', handleGlobalMessage);
    };
  }, []);

  const sendGlobalMessage = () => {
    if (!globalChatInput.trim()) return;
    SocketService.socket.emit('send-global-message', {
        userId: currentUser.id,
        username: currentUser.username,
        text: globalChatInput,
        avatar: currentUser.avatar
    });
    setGlobalChatInput('');
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    if (!currentUser.isPremium && !isAdmin) {
        setToast({ message: "Seuls les membres Premium peuvent créer des salons.", type: 'error' });
        return;
    }

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name: newRoomName, 
            ownerId: currentUser.id,
            password: newRoomPassword || null,
            isVisible: newRoomIsVisible,
            hasChat: newRoomHasChat
        })
      });
      
      if (!res.ok) {
        let errMsg = "Le serveur de salons est injoignable ou en cours de redémarrage.";
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errData = await res.json();
            errMsg = errData.error || errMsg;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }
      
      const data = await res.json();
      
      const updatedUser = data.user;
      if(updatedUser) {
        localStorage.setItem('ss_session', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }

      setToast({ message: "Salon créé !", type: 'success' });
      setIsModalOpen(false);
      setNewRoomName('');
      setNewRoomPassword('');
      fetchRooms();
      onJoinRoom(data.room.id);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce salon ?")) {
        try {
            const res = await fetch(`/api/rooms/${roomId}?userId=${currentUser.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setToast({ message: "Salon supprimé.", type: 'info' });
                fetchRooms();
            } else {
                const data = await res.json();
                setToast({ message: data.error || "Erreur lors de la suppression.", type: 'error' });
            }
        } catch (err: any) {
            setToast({ message: "Erreur réseau lors de la suppression.", type: 'error' });
        }
    }
  };

  const handleSendSuggestion = async () => {
    if (!suggestionContent.trim()) return;
    try {
        const res = await fetch('/api/suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                username: currentUser.username,
                type: suggestionType,
                content: suggestionContent
            })
        });
        if (res.ok) {
            setToast({ message: "Suggestion envoyée ! Merci.", type: 'success' });
            setSuggestionContent('');
            setIsSuggestionModalOpen(false);
        }
    } catch (e) {
        setToast({ message: "Erreur lors de l'envoi", type: 'error' });
    }
  };
  const handleRenameRoom = async () => {
    if (editingRoom && renameInput.trim()) {
        try {
            const res = await fetch(`/api/rooms/${editingRoom.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newName: renameInput,
                    password: editPasswordInput,
                    isVisible: editIsVisible,
                    hasChat: editHasChat,
                    isPremium: editIsPremium,
                    userId: currentUser.id
                })
            });
            if (res.ok) {
                setEditingRoom(null);
                setToast({ message: "Salon modifié.", type: 'success' });
                fetchRooms();
            } else {
                const data = await res.json();
                setToast({ message: data.error || "Erreur lors de la modification.", type: 'error' });
            }
        } catch (err: any) {
            setToast({ message: "Erreur réseau lors de la modification.", type: 'error' });
        }
    }
  };

  const handleResumePlayback = async () => {
    if (!currentUser.lastPlayback) return;
    
    const { video, currentTime, roomId: savedRoomId } = currentUser.lastPlayback;
    const existingRoom = allRooms.find(r => r.id === savedRoomId);
    
    if (existingRoom) {
      onJoinRoom(existingRoom.id, existingRoom.password);
      setToast({ message: "Reprise de la lecture dans le salon existant...", type: 'success' });
      return;
    }

    try {
      setToast({ message: "Création du salon et reprise de la vidéo...", type: 'info' });
      const roomRes = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `SALON DE ${currentUser.username.toUpperCase()}`,
          ownerId: currentUser.id,
          isVisible: true,
          hasChat: true,
          initialMovie: video,
          initialPlaybackState: {
            isPlaying: true,
            currentTime: currentTime,
            lastUpdated: Date.now()
          }
        })
      });

      if (!roomRes.ok) throw new Error("Erreur lors de la création du salon");

      const data = await roomRes.json();
      if (data && data.room) {
        onJoinRoom(data.room.id, undefined);
        setToast({ message: "Reprise réussie !", type: 'success' });
      }
    } catch (err: any) {
      setToast({ message: err.message || "Impossible de relancer le salon", type: 'error' });
    }
  };

  const handleMovieClick = (movie: LocalFile) => {
    setMovieActionModal({ movie, isOpen: true });
  };

  const handleAddToExistingRoom = async (roomId: string) => {
    if (!movieActionModal) return;
    const movie = movieActionModal.movie;
    try {
      const res = await fetch(`/api/rooms/${roomId}/playlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          item: {
            title: movie.name,
            url: `/video/local/${encodeURIComponent(movie.path)}`,
            addedBy: currentUser.username,
            isLocal: true,
            localPath: movie.path
          }
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'ajout");
      }
      setToast({ message: "Film ajouté au salon !", type: 'success' });
      setMovieActionModal(null);
      onJoinRoom(roomId);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleCreateRoomWithMovie = async () => {
    if (!movieActionModal) return;
    const movie = movieActionModal.movie;
    const roomName = `Salon ${movie.name}`;
    
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name: roomName, 
            ownerId: currentUser.id,
            isVisible: true,
            initialMovie: {
              title: movie.name,
              url: `/video/local/${encodeURIComponent(movie.path)}`,
              addedBy: currentUser.username,
              isLocal: true,
              localPath: movie.path
            }
        })
      });
      
      if (!res.ok) {
        let errMsg = "Le serveur de salons est injoignable ou en cours de redémarrage.";
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errData = await res.json();
            errMsg = errData.error || errMsg;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }
      
      const data = await res.json();
      
      setToast({ message: "Salon créé avec le film !", type: 'success' });
      setMovieActionModal(null);
      fetchRooms();
      onJoinRoom(data.room.id);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const groupedMovies = movies.reduce((acc, movie) => {
    const parts = movie.path.split('/');
    const folder = parts.length > 1 ? parts[0] : 'Autres';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(movie);
    return acc;
  }, {} as Record<string, LocalFile[]>);

  const handleRefreshLibrary = async () => {
      setIsScanning(true);
      try {
          const res = await fetch('/api/admin/refresh-movies', { method: 'POST' });
          const data = await res.json();
          setToast({ message: `Scan terminé : ${data.count} titres.`, type: 'success' });
      } catch (e) {
          setToast({ message: "Erreur lors du scan", type: 'error' });
      } finally {
          setIsScanning(false);
      }
  };

  const [roomFilter, setRoomFilter] = useState<'all' | 'mine' | 'public' | 'premium'>('all');
  const [minMembers, setMinMembers] = useState(0);
  const [roomSort, setRoomSort] = useState<'name' | 'members'>('name');
  const [roomSortOrder, setRoomSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredRooms = allRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    const matchesMembers = (room.memberCount || 0) >= minMembers;
    if (!matchesMembers) return false;

    if (roomFilter === 'mine') return room.ownerId === currentUser.id;
    if (roomFilter === 'public') return !room.isPremium;
    if (roomFilter === 'premium') return room.isPremium;
    return room.isVisible || room.ownerId === currentUser.id;
  }).sort((a, b) => {
      let comparison = 0;
      if (roomSort === 'name') {
          comparison = a.name.localeCompare(b.name);
      } else if (roomSort === 'members') {
          comparison = (a.memberCount || 0) - (b.memberCount || 0);
      }
      return roomSortOrder === 'asc' ? comparison : -comparison;
  });

  const getRoleDisplay = () => {
      if (currentUser.role?.name) return currentUser.role.name;
      if (currentUser.roleId === 'admin') return 'Administrateur';
      if (currentUser.roleId === 'member') return 'Membre';
      return 'Spectateur';
  };

  const badgeColor = (mins: number) => {
      if (mins > 500) return 'bg-indigo-600';
      if (mins > 200) return 'bg-yellow-600';
      if (mins > 50) return 'bg-gray-600';
      return 'bg-red-800';
  };

  return (
    <div className="pb-20 bg-[#141414] min-h-screen text-white font-sans overflow-y-auto">
      <Navbar 
        user={currentUser} 
        onLogout={onLogout} 
        onGoToAdmin={onGoToAdmin} 
        onGoToMovies={onGoToMovies}
        onGoToPricing={onGoToPricing}
        onGoToAwareness={onGoToAwareness}
        onFilterChange={setFilter} 
        onViewProfile={onOpenProfile} 
      />

      <Hero 
        onQuickJoin={() => filteredRooms.length > 0 && onJoinRoom(filteredRooms[0].id)} 
        onLearnMore={() => document.getElementById('salons-section')?.scrollIntoView({ behavior: 'smooth' })} 
      />

      {showCarousels && (
        <div className="space-y-12 -mt-32 relative z-30">
          {catalogue.length > 0 && (
            <div className="px-6 md:px-12">
                <h3 className="text-2xl font-black italic uppercase text-red-600 mb-6 tracking-tighter">Catalogue</h3>
                <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
                    {catalogue.map((item, idx) => (
                        <div key={idx} className="min-w-[200px] bg-[#111] rounded-2xl border border-white/5 p-4 hover:border-red-600 transition-all cursor-pointer group" onClick={() => handleMovieClick({ name: item.name, path: item.path, isDirectory: false } as any)}>
                            <div className="aspect-[2/3] bg-black/40 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                                <span className="text-4xl opacity-20 group-hover:scale-110 transition-transform">🎬</span>
                                {item.seasons > 0 && (
                                    <span className="absolute top-2 right-2 bg-red-600 text-[8px] font-black px-2 py-1 rounded-full">{item.seasons} SAISONS</span>
                                )}
                            </div>
                            <h4 className="text-[11px] font-black uppercase italic truncate">{item.name}</h4>
                            <p className="text-[8px] font-bold text-gray-600 uppercase mt-1">{item.seasons > 0 ? `${item.seasons} Saisons` : 'Film'}</p>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {Object.entries(groupedMovies).map(([folder, folderMovies]) => (
            <MovieCarousel 
              key={folder}
              title={folder} 
              movies={folderMovies} 
              onMovieClick={handleMovieClick}
            />
          ))}
        </div>
      )}

      <div id="salons-section" className={`px-6 md:px-12 relative z-20 grid grid-cols-12 gap-10 ${showCarousels ? 'mt-12' : '-mt-24'}`}>
        <div className="col-span-12 lg:col-span-9 space-y-10">
            <div className="bg-[#141414] p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[3rem] border border-white/5 shadow-2xl flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-1 w-full">
                    <input type="text" placeholder="Chercher un salon..." className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 px-6 text-xs font-black uppercase tracking-widest outline-none focus:border-red-600 transition-all italic" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">🔍</span>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button onClick={() => setRoomFilter('all')} className={`px-4 py-3 rounded-xl text-[8px] font-black uppercase transition-all ${roomFilter === 'all' ? 'bg-red-600' : 'bg-white/5'}`}>TOUS</button>
                    <button onClick={() => setRoomFilter('public')} className={`px-4 py-3 rounded-xl text-[8px] font-black uppercase transition-all ${roomFilter === 'public' ? 'bg-red-600' : 'bg-white/5'}`}>PUBLICS</button>
                    <button onClick={() => setRoomFilter('premium')} className={`px-4 py-3 rounded-xl text-[8px] font-black uppercase transition-all ${roomFilter === 'premium' ? 'bg-red-600' : 'bg-white/5'}`}>PREMIUM</button>
                    <button onClick={() => setRoomFilter('mine')} className={`px-4 py-3 rounded-xl text-[8px] font-black uppercase transition-all ${roomFilter === 'mine' ? 'bg-red-600' : 'bg-white/5'}`}>MES SALONS</button>
                    
                    <div className="flex items-center gap-2 ml-auto">
                        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2">
                            <span className="text-[7px] font-black uppercase text-gray-500 italic">Membres min:</span>
                            <input 
                                type="number" 
                                min="0" 
                                value={minMembers} 
                                onChange={(e) => setMinMembers(parseInt(e.target.value) || 0)}
                                className="w-10 bg-transparent text-[8px] font-black uppercase outline-none text-red-600"
                            />
                        </div>
                        <select 
                            value={roomSort}
                            onChange={(e) => setRoomSort(e.target.value as any)}
                            className="bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-[8px] font-black uppercase outline-none focus:border-red-600 transition-all italic"
                        >
                            <option value="name">Nom</option>
                            <option value="members">Membres</option>
                        </select>
                        <button 
                            onClick={() => setRoomSortOrder(roomSortOrder === 'asc' ? 'desc' : 'asc')}
                            className="bg-white/5 border border-white/10 p-3 rounded-xl text-[8px] font-black uppercase hover:bg-red-600 transition-all"
                        >
                            {roomSortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>
            </div>

            {currentUser.lastPlayback && (
                <div className="bg-gradient-to-r from-red-600/10 to-transparent border border-red-600/20 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                        <span className="text-3xl animate-pulse">⏰</span>
                        <div>
                            <span className="text-[8px] font-black uppercase text-red-600 tracking-widest block italic mb-0.5">REPRENDRE LA LECTURE</span>
                            <h4 className="text-sm font-black uppercase italic text-white line-clamp-1">{currentUser.lastPlayback.video.title}</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase italic mt-0.5">
                                Dernière position : {Math.floor(currentUser.lastPlayback.currentTime / 60)}m {Math.floor(currentUser.lastPlayback.currentTime % 60)}s
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleResumePlayback} 
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 text-white py-3 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest italic transition-all shadow-lg text-center"
                    >
                        ➜ REPRENDRE ICI
                    </button>
                </div>
            )}

                <div className="flex items-center justify-between">
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg">SALONS ACTIFS</h3>
                    <div className="flex items-center gap-4">
                        {!currentUser.isPremium && !isAdmin && (
                            <p className="hidden md:block text-[8px] font-bold text-gray-500 uppercase italic max-w-[150px] text-right">
                                Devenez Premium pour créer vos propres salons
                            </p>
                        )}
                        <button 
                            onClick={() => setIsModalOpen(true)} 
                            className={`px-10 py-4 rounded-full font-black text-[11px] uppercase shadow-2xl transition-all ${(!currentUser.isPremium && !isAdmin) ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white shadow-red-600/40 hover:scale-105'}`}
                        >
                            + CRÉER SALON
                        </button>
                    </div>
                </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {filteredRooms.length > 0 ? filteredRooms.map(room => (
                    <div key={room.id} className="group bg-[#111] rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden border border-white/5 cursor-pointer hover:border-red-600/60 transition-all p-4 sm:p-8 flex flex-col gap-6 shadow-2xl relative hover:-translate-y-2" onClick={() => onJoinRoom(room.id)}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 blur-[40px] -mr-12 -mt-12 group-hover:bg-red-600/10 transition-colors"></div>
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <h4 className="font-black italic text-2xl uppercase group-hover:text-red-600 transition-colors tracking-tighter max-w-[80%] leading-tight">{room.name}</h4>
                                {room.isPremium && (
                                    <span className="text-[7px] font-black uppercase bg-yellow-600 text-black px-2 py-0.5 rounded-full w-fit italic">Premium Room</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {(room.ownerId === currentUser.id || isAdmin) && (
                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={(e) => { 
                                            e.stopPropagation();
                                            setEditingRoom(room); 
                                            setRenameInput(room.name); 
                                            setEditPasswordInput(room.password || '');
                                            setEditIsVisible(room.isVisible);
                                            setEditHasChat(room.hasChat);
                                            setEditIsPremium(room.isPremium || false);
                                        }} className="p-2 bg-white/5 hover:bg-blue-600 rounded-xl transition-all">✏️</button>
                                        <button onClick={(e) => { 
                                            e.stopPropagation();
                                            handleDeleteRoom(room.id); 
                                        }} className="p-2 bg-white/5 hover:bg-red-600 rounded-xl transition-all">🗑️</button>
                                    </div>
                                )}
                                {room.password && <span className="text-xs bg-black/40 p-2 rounded-xl border border-white/5">🔒</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">{(room.playlist || []).length} MÉDIAS EN FILE</span>
                        </div>
                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className="text-[8px] font-bold text-gray-600 uppercase italic">REJOINDRE LA SESSION</span>
                            <span className="text-[10px] font-black uppercase text-red-600 italic">ENTRER →</span>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-32 bg-white/[0.02] rounded-[4rem] border border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-40">
                        <span className="text-5xl mb-6 grayscale">📺</span>
                        <p className="text-xs font-black uppercase tracking-widest italic">Aucun salon ne correspond à votre recherche</p>
                    </div>
                )}
            </div>
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-10">
            <div className="bg-[#111] p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[3rem] border border-white/10 hover:border-red-600 transition-all cursor-pointer group shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[50px] -mr-16 -mt-16"></div>
                <div className="flex items-center gap-5 mb-6 relative z-10">
                    <img src={currentUser.avatar} className="w-16 h-16 rounded-[1.5rem] bg-gray-950 border border-white/10 shadow-lg group-hover:scale-105 transition-transform" alt="avatar" />
                    <div>
                        <h4 className="font-black italic uppercase text-lg group-hover:text-red-600 transition-colors leading-none truncate max-w-[120px]">{currentUser.username}</h4>
                        <span className={`inline-block mt-2 text-[7px] px-3 py-1 rounded-full font-black uppercase ${badgeColor(currentUser.stats?.totalMinutes || 0)}`}>
                            {getRoleDisplay()}
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center relative z-10">
                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                        <p className="text-[8px] uppercase font-black text-gray-500 mb-1">Watchtime</p>
                        <p className="text-lg font-black italic">{currentUser.stats?.totalMinutes || 0}m</p>
                    </div>
                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                        <p className="text-[8px] uppercase font-black text-gray-500 mb-1">Rooms</p>
                        <p className="text-lg font-black italic">{currentUser.stats?.roomsCreated || 0}</p>
                    </div>
                </div>
                <div className="mt-4 flex gap-2 relative z-10">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsSuggestionModalOpen(true); }}
                        className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl text-[8px] font-black uppercase transition-all"
                    >
                        💡 Suggestion
                    </button>
                </div>
            </div>

            <div 
                onClick={onGoToAwareness}
                className="bg-gradient-to-br from-[#111] to-[#0a0a0a] p-8 rounded-[3rem] border border-emerald-500/20 shadow-2xl relative overflow-hidden group cursor-pointer hover:border-emerald-500/40 transition-all"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] -mr-16 -mt-16"></div>
                <h4 className="text-xs font-black uppercase italic text-emerald-500 mb-4 tracking-widest">SENSIBILISATION</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed mb-6 italic">
                    Découvrez les réalités et enjeux des Antilles françaises (Guadeloupe & Martinique).
                </p>
                <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-center py-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-xl shadow-emerald-600/20">
                    Explorer l'Espace
                </button>
            </div>

            {!currentUser.isPremium && !isAdmin && (
                <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] p-8 rounded-[3rem] border border-yellow-500/20 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-[50px] -mr-16 -mt-16"></div>
                    <h4 className="text-xs font-black uppercase italic text-yellow-500 mb-4 tracking-widest">DEVENIR PREMIUM</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed mb-6 italic">
                        Débloquez la création de salons et soutenez le projet BrokHomeTV.
                    </p>
                    <a 
                        href="https://ko-fi.com/yourpage" 
                        target="_blank" 
                        rel="noreferrer"
                        className="block w-full bg-yellow-600 hover:bg-yellow-500 text-black text-center py-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-xl shadow-yellow-600/20"
                    >
                        Soutenir sur Ko-fi
                    </a>
                    <p className="text-[7px] text-gray-600 mt-4 text-center uppercase font-bold">
                        Activation automatique après don
                    </p>
                </div>
            )}

            <div className="bg-[#111] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
                <div className="p-6 bg-gradient-to-br from-red-600 to-red-900 font-black italic uppercase text-sm tracking-tighter flex justify-between items-center shadow-lg">
                    <span>Chat Global</span>
                    <span className="text-[8px] opacity-40 italic">Live</span>
                </div>
                <div className="h-[400px] flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {globalMessages.map((m, idx) => (
                            <div key={m.id || idx} className="flex gap-3 animate-fade-in">
                                <img src={m.avatar} className="w-6 h-6 rounded-lg shrink-0" alt="" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[8px] font-black uppercase text-red-600 italic mb-1">{m.username}</p>
                                    <p className="text-[10px] bg-white/5 p-3 rounded-2xl border border-white/5 break-words leading-relaxed">{m.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/5 bg-black/20">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={globalChatInput}
                                onChange={e => setGlobalChatInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && sendGlobalMessage()}
                                placeholder="Message global..." 
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-[9px] font-black uppercase italic outline-none focus:border-red-600 transition-all"
                            />
                            <button onClick={sendGlobalMessage} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 font-black text-[10px]">OK</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#111] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
                <div className="p-6 bg-gradient-to-br from-red-600 to-red-900 font-black italic uppercase text-sm tracking-tighter flex justify-between items-center shadow-lg">
                    <span>Classement</span>
                    <span className="text-[8px] opacity-40 italic">Global</span>
                </div>
                <div className="p-4 space-y-3">
                    {leaderboard.map((u, i) => (
                        <div key={u.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-[2rem] transition-all group/user cursor-pointer" onClick={() => onOpenProfile(u)}>
                            <span className="font-black text-gray-700 w-4 text-xs italic group-hover/user:text-red-600">{(i + 1).toString().padStart(2, '0')}</span>
                            <img src={u.avatar} className="w-10 h-10 rounded-[1.2rem] bg-gray-900 border border-white/10 shadow-lg" alt="avatar" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase italic truncate group-hover/user:text-red-600 transition-colors">{u.username}</p>
                                <p className="text-[7px] font-bold text-gray-600 uppercase mt-0.5">{(u.stats?.totalMinutes || 0)} MIN</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6">
          <div className="bg-[#111] p-12 rounded-[4rem] w-full max-w-xl shadow-2xl border border-white/10 relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] -mr-32 -mt-32"></div>
            {(!currentUser.isPremium && !isAdmin) ? (
                <div className="text-center space-y-8 relative z-10">
                    <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
                        <span className="text-4xl">👑</span>
                    </div>
                    <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">ACCÈS PREMIUM REQUIS</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase italic max-w-xs mx-auto leading-relaxed">
                        La création de salons est une fonctionnalité réservée aux membres qui soutiennent le projet.
                    </p>
                    <div className="space-y-4 pt-4">
                        <a 
                            href="https://ko-fi.com/yourpage" 
                            target="_blank" 
                            rel="noreferrer"
                            className="block w-full bg-yellow-600 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest text-black shadow-2xl shadow-yellow-600/40 hover:bg-yellow-500 transition-all italic"
                        >
                            DEVENIR PREMIUM SUR KO-FI →
                        </a>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-4 font-black uppercase text-[9px] tracking-widest text-gray-500 hover:text-white transition-colors">Plus tard</button>
                    </div>
                </div>
            ) : (
                <>
                    <h2 className="text-4xl font-black italic uppercase mb-10 text-center text-red-600 tracking-tighter relative z-10">Initialiser Salon</h2>
                    <form onSubmit={handleCreateRoom} className="space-y-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest block px-2 italic">Désignation du salon</label>
                            <input autoFocus type="text" className="w-full bg-[#0a0a0a] border border-white/5 rounded-3xl p-5 text-sm font-black italic uppercase outline-none focus:border-red-600 transition-all shadow-inner" placeholder="Nom du salon" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest block px-2 italic">Protection</label>
                            <input type="password" className="w-full bg-[#0a0a0a] border border-white/5 rounded-3xl p-5 text-sm font-black italic uppercase outline-none focus:border-red-600 transition-all shadow-inner" placeholder="Code (optionnel)" value={newRoomPassword} onChange={e => setNewRoomPassword(e.target.value)} />
                        </div>
                        <div onClick={() => setNewRoomIsVisible(!newRoomIsVisible)} className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-3xl cursor-pointer hover:bg-black/60 transition-all group">
                            <div>
                                <p className="text-[10px] font-black uppercase italic group-hover:text-red-600 transition-colors">Visibilité publique</p>
                                <p className="text-[8px] font-bold text-gray-600 uppercase mt-1 italic">{newRoomIsVisible ? 'Visible par toute la communauté' : 'Invitation directe'}</p>
                            </div>
                            <div className={`w-14 h-7 rounded-full relative transition-all ${newRoomIsVisible ? 'bg-red-600' : 'bg-gray-800'}`}>
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all ${newRoomIsVisible ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>
                        <div onClick={() => setNewRoomHasChat(!newRoomHasChat)} className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-3xl cursor-pointer hover:bg-black/60 transition-all group">
                            <div>
                                <p className="text-[10px] font-black uppercase italic group-hover:text-red-600 transition-colors">Activer le Chat</p>
                                <p className="text-[8px] font-bold text-gray-600 uppercase mt-1 italic">{newRoomHasChat ? 'Chat et Playlist visibles' : 'Playlist uniquement'}</p>
                            </div>
                            <div className={`w-14 h-7 rounded-full relative transition-all ${newRoomHasChat ? 'bg-red-600' : 'bg-gray-800'}`}>
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all ${newRoomHasChat ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 font-black uppercase text-[10px] tracking-widest text-gray-500 hover:text-white transition-colors">Annuler</button>
                            <button type="submit" className="flex-1 bg-red-600 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-red-600/40 hover:bg-red-700 transition-all italic">DÉPLOYER SALON →</button>
                        </div>
                    </form>
                </>
            )}
          </div>
        </div>
      )}

      {editingRoom && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-6 backdrop-blur-md">
            <div className="bg-[#111] p-10 rounded-[3rem] w-full max-w-md border border-white/10 animate-fade-in shadow-2xl overflow-y-auto max-h-[90vh]">
                <h3 className="text-xl font-black uppercase italic text-red-600 mb-6">Modifier Salon</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[8px] font-black uppercase mb-1.5 text-gray-500">Nom du Salon</label>
                        <input type="text" value={renameInput} onChange={e => setRenameInput(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] font-black uppercase outline-none focus:border-red-600 transition-all" placeholder="Nom du salon..." autoFocus />
                    </div>

                    <div>
                        <label className="block text-[8px] font-black uppercase mb-1.5 text-gray-500">Mot de Passe (Optionnel)</label>
                        <input type="text" value={editPasswordInput} onChange={e => setEditPasswordInput(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] font-black uppercase outline-none focus:border-red-600 transition-all" placeholder="Laissez vide pour aucun..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            type="button" 
                            onClick={() => setEditIsVisible(!editIsVisible)} 
                            className={`p-4 rounded-2xl border text-[9px] font-black uppercase transition-all ${editIsVisible ? 'bg-red-600/10 border-red-600/30 text-red-600' : 'bg-white/[0.02] border-white/5 text-gray-500'}`}
                        >
                            {editIsVisible ? '👁️ Public' : '🔒 Privé'}
                        </button>

                        <button 
                            type="button" 
                            onClick={() => setEditHasChat(!editHasChat)} 
                            className={`p-4 rounded-2xl border text-[9px] font-black uppercase transition-all ${editHasChat ? 'bg-red-600/10 border-red-600/30 text-red-600' : 'bg-white/[0.02] border-white/5 text-gray-500'}`}
                        >
                            {editHasChat ? '💬 Chat Activé' : '🔇 Chat Désactivé'}
                        </button>
                    </div>

                    <div>
                        <button 
                            type="button" 
                            onClick={() => setEditIsPremium(!editIsPremium)} 
                            className={`w-full p-4 rounded-2xl border text-[9px] font-black uppercase transition-all ${editIsPremium ? 'bg-red-600/20 border-red-600/40 text-red-600' : 'bg-white/[0.02] border-white/5 text-gray-500'}`}
                        >
                            👑 Salon Réservé Premium : {editIsPremium ? 'Oui' : 'Non'}
                        </button>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/5">
                        <button onClick={() => setEditingRoom(null)} className="flex-1 p-3 rounded-xl font-black text-[10px] uppercase text-gray-500 hover:text-white transition-colors">Annuler</button>
                        <button onClick={handleRenameRoom} className="flex-1 bg-red-600 p-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-red-600/20">Confirmer</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {isSuggestionModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6">
          <div className="bg-[#111] p-12 rounded-[4rem] w-full max-w-xl shadow-2xl border border-white/10 relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] -mr-32 -mt-32"></div>
            <h2 className="text-3xl font-black italic uppercase mb-10 text-center text-red-600 tracking-tighter relative z-10">Suggérer une idée</h2>
            <div className="space-y-8 relative z-10">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setSuggestionType('movie')}
                        className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase transition-all ${suggestionType === 'movie' ? 'bg-red-600' : 'bg-white/5'}`}
                    >
                        Film / Série
                    </button>
                    <button 
                        onClick={() => setSuggestionType('feature')}
                        className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase transition-all ${suggestionType === 'feature' ? 'bg-red-600' : 'bg-white/5'}`}
                    >
                        Fonctionnalité
                    </button>
                </div>
                <textarea 
                    value={suggestionContent}
                    onChange={e => setSuggestionContent(e.target.value)}
                    placeholder={suggestionType === 'movie' ? "Nom du film ou de la série..." : "Décrivez votre idée de fonctionnalité..."}
                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 text-sm font-black italic uppercase outline-none focus:border-red-600 transition-all shadow-inner h-48 resize-none"
                />
                <div className="flex gap-4">
                    <button onClick={() => setIsSuggestionModalOpen(false)} className="flex-1 py-5 font-black uppercase text-[10px] tracking-widest text-gray-500 hover:text-white transition-colors">Annuler</button>
                    <button onClick={handleSendSuggestion} className="flex-1 bg-red-600 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-red-600/40 hover:bg-red-700 transition-all italic">ENVOYER →</button>
                </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {movieActionModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6">
          <div className="bg-[#111] p-12 rounded-[4rem] w-full max-w-2xl shadow-2xl border border-white/10 relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] -mr-32 -mt-32"></div>
            <h2 className="text-3xl font-black italic uppercase mb-4 text-white tracking-tighter relative z-10">
              {movieActionModal.movie.name}
            </h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-8 italic relative z-10">
              Que souhaitez-vous faire avec ce film ?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {(currentUser.isPremium || isAdmin) && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-red-600 italic">Nouveau Salon</h3>
                  <button 
                    onClick={handleCreateRoomWithMovie}
                    className="w-full bg-white text-black py-6 rounded-3xl font-black text-[10px] uppercase hover:bg-gray-200 transition-all shadow-xl italic"
                  >
                    Créer et lancer
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-red-600 italic">Ajouter à un salon</h3>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                  {allRooms
                    .filter(r => {
                      if (isAdmin || currentUser.isPremium) return true;
                      return r.isVisible && !r.password;
                    })
                    .map(room => (
                      <button 
                        key={room.id}
                        onClick={() => handleAddToExistingRoom(room.id)}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-[9px] font-black uppercase hover:bg-red-600 transition-all text-left flex justify-between items-center group"
                      >
                        <span className="truncate max-w-[150px]">{room.name}</span>
                        <span className="opacity-0 group-hover:opacity-100 italic">Ajouter →</span>
                      </button>
                    ))}
                  {allRooms.length === 0 && (
                    <p className="text-[9px] text-gray-600 uppercase italic text-center py-4">Aucun salon disponible</p>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setMovieActionModal(null)}
              className="mt-12 w-full py-4 font-black uppercase text-[9px] tracking-widest text-gray-500 hover:text-white transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

        {/* Catalogue Section */}
        <div className="mt-40">
            <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black italic uppercase text-red-600 tracking-tighter">Catalogue</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-red-600/30 to-transparent ml-12"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                {catalogue.map((item, idx) => (
                    <div key={idx} className="group cursor-pointer" onClick={() => handleMovieClick(item)}>
                        <div className="aspect-[2/3] bg-[#111] rounded-[2rem] border border-white/5 overflow-hidden relative shadow-2xl group-hover:border-red-600/50 transition-all duration-500">
                            <img 
                                src={item.image || `https://picsum.photos/seed/${item.name}/400/600`} 
                                className="w-full h-full object-cover opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" 
                                alt={item.name}
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                <p className="text-[11px] font-black uppercase italic leading-tight mb-2 group-hover:text-red-600 transition-colors">{item.name}</p>
                                {item.seasons > 0 && (
                                    <p className="text-[8px] font-bold text-gray-500 uppercase italic">{item.seasons} Saisons</p>
                                )}
                            </div>
                            {item.isPremium && (
                                <div className="absolute top-4 right-4 bg-yellow-500 text-black text-[7px] font-black px-2 py-1 rounded uppercase shadow-lg">Premium</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

      <footer className="mt-40 px-6 md:px-12 py-20 border-t border-white/5 text-center">
        <div className="max-w-5xl mx-auto space-y-10">
          <h3 className="text-2xl font-black italic uppercase text-red-600 tracking-tighter">Nous contacter</h3>
          <div className="flex justify-center flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase text-gray-400 italic">Pour toute demande ou support :</span>
            <span className="text-sm font-black text-white italic underline">contact@brokhometv.com</span>
          </div>
          <p className="text-[10px] font-bold uppercase italic tracking-widest opacity-30 mt-10">© 2024 BrokHomeTV - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
};