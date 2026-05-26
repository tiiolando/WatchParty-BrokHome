// Author: Senior Frontend Engineer
// OS support: Cross-platform
// Description: Vue de visionnage avec lecteur vidéo stabilisé, navigation hiérarchique et Auto-Skip

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Room, ChatMessage, LocalFile, PlaylistItem } from '../types.ts';
import { SocketService } from '../services/socket.ts';
import { Toast, ToastType } from '../components/Toast.tsx';

interface RoomViewProps {
  user: User;
  roomId: string;
  password?: string;
  onLeave: () => void;
  onViewProfile: (u: User) => void;
}

export const RoomView: React.FC<RoomViewProps> = ({ user, roomId, password, onLeave, onViewProfile }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [localMovies, setLocalMovies] = useState<LocalFile[]>([]);
  const [librarySearch, setLibrarySearch] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'playlist'>('chat');
  const [currentPath, setCurrentPath] = useState<string>('');
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [autoSkip, setAutoSkip] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isRemoteEvent = useRef(false);
  const controlsTimeout = useRef<number | null>(null);

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const handleClearPlaylist = () => {
    SocketService.socket.emit('clear-playlist', { roomId });
  };

  const handleClearFolder = (folderPath: string) => {
    SocketService.socket.emit('clear-folder', { roomId, folderPath });
  };

  const addFolderToPlaylist = (f: LocalFile) => {
    SocketService.socket.emit('add-folder-to-playlist', { 
      roomId, 
      folderPath: f.path, 
      userId: user.id 
    });
    setToast({ message: "Demande d'ajout envoyée", type: 'info' });
  };

  const handleGoBack = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  useEffect(() => {
    fetch(`/api/rooms/${roomId}`).then(res => res.json()).then(setRoom);
    fetch(`/api/local-movies?userId=${user.id}&roomId=${roomId}`).then(res => res.json()).then(setLocalMovies);

    SocketService.joinRoom(roomId, user, password);
    SocketService.onRoomUpdate(setRoom);
    SocketService.onNewMessage(m => setMessages(p => [...p, m]));
    SocketService.socket.on('error-msg', (msg: string) => {
        setToast({ message: msg, type: 'error' });
    });
    SocketService.socket.on('room-deleted', () => {
        setToast({ message: "Ce salon a été supprimé.", type: 'info' });
        setTimeout(() => {
            onLeave();
        }, 2000);
    });
    SocketService.onPlaybackSync(state => {
        if (videoRef.current) {
            isRemoteEvent.current = true;
            if (Math.abs(videoRef.current.currentTime - state.currentTime) > 1.5) {
                videoRef.current.currentTime = state.currentTime;
            }
            state.isPlaying ? videoRef.current.play().catch(() => {}) : videoRef.current.pause();
            setTimeout(() => { isRemoteEvent.current = false; }, 200);
        }
    });
    return () => SocketService.disconnect();
  }, [roomId]);

  useEffect(() => {
    if (isSidebarVisible && activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSidebarVisible, activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused && room) {
        const currentVideo = room.playlist[room.currentVideoIndex];
        if (currentVideo) {
          SocketService.socket.emit('save-playback-history', {
            roomId: room.id,
            userId: user.id,
            video: currentVideo,
            currentTime: videoRef.current.currentTime
          });
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [room?.id, room?.currentVideoIndex, user?.id]);

  const filteredLibrary = useMemo(() => {
    const current = currentPath.split('/').filter(Boolean);
    const results: LocalFile[] = [];
    const seen = new Set<string>();

    localMovies.forEach(file => {
        if (librarySearch) {
            if (!file.isDirectory && file.name.toLowerCase().includes(librarySearch.toLowerCase())) {
                results.push(file);
            }
            return;
        }
        const parts = file.path.split('/').filter(Boolean);
        const isChild = current.every((part, i) => parts[i] === part);
        if (isChild && parts.length === current.length + 1) {
            const itemPath = parts.join('/');
            if (!seen.has(itemPath)) {
                results.push(file);
                seen.add(itemPath);
            }
        }
    });
    return results.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [localMovies, currentPath]);

  const breadcrumbs = useMemo(() => {
      const parts = currentPath.split('/').filter(Boolean);
      return [{ name: 'RACINE', path: '' }, ...parts.map((p, i) => ({
          name: p.toUpperCase(),
          path: parts.slice(0, i + 1).join('/')
      }))];
  }, [currentPath]);

  const syncPlayback = () => {
    if (!videoRef.current || isRemoteEvent.current || user.roleId === 'guest') return;
    const isPlaying = !videoRef.current.paused;
    const time = videoRef.current.currentTime;
    SocketService.sendPlayback(roomId, { 
      isPlaying, 
      currentTime: time, 
      lastUpdated: Date.now() 
    });

    if (room && room.ownerId === user.id) {
      const currentVideo = room.playlist[room.currentVideoIndex];
      if (currentVideo) {
        SocketService.socket.emit('save-playback-history', {
          roomId: room.id,
          userId: user.id,
          video: currentVideo,
          currentTime: time
        });
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) videoRef.current.play().catch(() => {}); else videoRef.current.pause();
    syncPlayback();
  };

  const handleVideoEnded = () => {
    if (autoSkip && room && room.playlist.length > room.currentVideoIndex + 1) {
      setToast({ message: "Auto-Skip: Vidéo suivante...", type: 'info' });
      SocketService.socket.emit('change-video', { 
        roomId, 
        index: room.currentVideoIndex + 1,
        userId: user.id
      });
      if (autoPlay) {
          setTimeout(() => {
              if (videoRef.current) videoRef.current.play().catch(() => {});
          }, 1000);
      }
    }
  };

  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = window.setTimeout(() => setShowControls(false), 3000);
  };

  const groupedPlaylist = useMemo(() => {
    if (!room) return {};
    return room.playlist.reduce((acc, item) => {
        let folder = 'Autres';
        if (item.localPath) {
            const parts = item.localPath.split('/');
            if (parts.length > 1) {
                folder = parts.slice(0, -1).join(' / ');
            } else {
                folder = 'Racine';
            }
        }
        if (!acc[folder]) acc[folder] = [];
        acc[folder].push(item);
        return acc;
    }, {} as Record<string, PlaylistItem[]>);
  }, [room?.playlist]);

  const needsInitialSync = useRef(true);
  const prevVideoIndex = useRef<number | null>(null);

  if (room && prevVideoIndex.current !== room.currentVideoIndex) {
    prevVideoIndex.current = room.currentVideoIndex;
    needsInitialSync.current = true;
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);

    if (room && room.playbackState && needsInitialSync.current) {
      needsInitialSync.current = false;
      const state = room.playbackState;
      let targetTime = state.currentTime;
      if (state.isPlaying && state.lastUpdated) {
        const elapsed = (Date.now() - state.lastUpdated) / 1000;
        targetTime += elapsed;
      }

      if (targetTime < 0) targetTime = 0;
      if (videoRef.current.duration && targetTime > videoRef.current.duration) {
        targetTime = videoRef.current.duration - 1;
      }

      videoRef.current.currentTime = targetTime;
      isRemoteEvent.current = true;
      if (state.isPlaying) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      setTimeout(() => { isRemoteEvent.current = false; }, 200);
    }
  };

  if (!room) return <div className="h-screen bg-black flex items-center justify-center font-black text-red-600 animate-pulse italic uppercase tracking-widest">Initialisation du Salon...</div>;

  const currentVideo = room.playlist[room.currentVideoIndex];

  const handleOpenLibrary = () => {
    const isPublicRoom = roomId.startsWith('public-room-');
    if (!user.isPremium && user.roleId !== 'admin' && !isPublicRoom) {
      setIsPremiumModalOpen(true);
      return;
    }
    fetch(`/api/local-movies?userId=${user.id}&roomId=${roomId}`).then(res => res.json()).then(setLocalMovies);
    setIsLibraryOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 bg-[#141414] border-b border-white/5 shrink-0 z-50 shadow-2xl">
        <div className="flex items-center gap-4 md:gap-8">
          <button onClick={onLeave} className="text-gray-500 hover:text-white uppercase font-black text-[8px] md:text-[10px] tracking-widest transition-all italic">Sortie</button>
          <div className="h-4 w-px bg-white/10 hidden md:block"></div>
          <h1 className="font-black italic uppercase text-[10px] md:text-xs text-red-600 truncate max-w-[120px] md:max-w-[300px] tracking-tight">{room.name}</h1>
        </div>
        <button onClick={handleOpenLibrary} className="bg-red-600 px-4 md:px-10 py-2 md:py-3 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all italic">Médiathèque</button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div 
            id="video-container" 
            onMouseMove={handleMouseMove} 
            onMouseLeave={() => setShowControls(false)} 
            className="flex-1 bg-black flex items-center justify-center group relative overflow-hidden border-b md:border-b-0 md:border-r border-white/5 h-[35%] md:h-auto"
        >
          <button 
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className={`absolute top-4 right-4 z-[60] bg-black/60 hover:bg-red-600 p-3 rounded-full border border-white/10 transition-all shadow-2xl flex items-center justify-center ${!isSidebarVisible ? 'rotate-180' : ''}`}
            title={isSidebarVisible ? "Masquer le panneau" : "Afficher le panneau"}
          >
            <span className="text-xs">❯</span>
          </button>

          {currentVideo ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
                <video 
                    ref={videoRef} 
                    src={currentVideo.url} 
                    className="w-full max-h-full" 
                    onPlay={() => { setIsPlaying(true); syncPlayback(); }} 
                    onPause={() => { setIsPlaying(false); syncPlayback(); }}
                    onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleVideoEnded}
                    onClick={user.roleId === 'guest' ? undefined : togglePlay}
                    preload="auto"
                />
                
                <div className={`absolute inset-x-0 bottom-0 p-4 md:p-10 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-all duration-700 z-10 flex flex-col gap-4 md:gap-6 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                    <div className="flex items-center gap-4 md:gap-6">
                        <span className="text-[8px] md:text-[10px] font-black italic tabular-nums w-12 md:w-16 text-right opacity-60">{formatTime(currentTime)}</span>
                        <div className="flex-1 relative group/seek">
                            <input 
                                type="range" min="0" max={duration || 0} step="0.1" value={currentTime} 
                                onChange={(e) => { 
                                    if (user.roleId === 'guest') return;
                                    if(videoRef.current) { videoRef.current.currentTime = parseFloat(e.target.value); setCurrentTime(parseFloat(e.target.value)); syncPlayback(); } 
                                }} 
                                disabled={user.roleId === 'guest'}
                                className={`w-full h-1 md:h-1.5 bg-white/10 rounded-full appearance-none ${user.roleId === 'guest' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} accent-red-600 hover:h-2 md:hover:h-2.5 transition-all`} 
                            />
                            <div className="absolute left-0 top-0 h-1 md:h-1.5 bg-red-600 rounded-full pointer-events-none group-hover/seek:h-2 md:group-hover/seek:h-2.5" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}></div>
                        </div>
                        <span className="text-[8px] md:text-[10px] font-black italic tabular-nums w-12 md:w-16 opacity-60">{formatTime(duration)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 md:gap-10">
                            {user.roleId !== 'guest' && (
                                <>
                                    <button onClick={() => {if(videoRef.current) videoRef.current.currentTime -= 10; syncPlayback();}} className="text-[8px] md:text-xs text-white/40 hover:text-red-600 italic font-black uppercase tracking-widest transition-all">↺ 10s</button>
                                    <button onClick={togglePlay} className="text-2xl md:text-5xl text-white hover:scale-125 hover:text-red-600 transition-all w-8 h-8 md:w-14 md:h-14">
                                        {isPlaying ? '⏸' : '▶'}
                                    </button>
                                    <button onClick={() => {if(videoRef.current) videoRef.current.currentTime += 10; syncPlayback();}} className="text-[8px] md:text-xs text-white/40 hover:text-red-600 italic font-black uppercase tracking-widest transition-all">10s ↻</button>
                                </>
                            )}
                            
                            {user.roleId === 'guest' && (
                                <span className="text-[8px] md:text-[10px] font-black uppercase text-gray-400 italic bg-white/[0.03] px-4 py-2 rounded-full border border-white/5">
                                    📺 Mode Invité • Synchronisé en continu sur le stream principal
                                </span>
                            )}
                            
                            {user.roleId !== 'guest' && (
                                <>
                                    <div className="hidden md:flex items-center gap-4 bg-black/40 px-4 py-2 rounded-full border border-white/5 ml-4">
                                        <span className={`text-[8px] font-black uppercase tracking-widest italic ${autoSkip ? 'text-red-600' : 'text-gray-600'}`}>Auto Skip</span>
                                        <button 
                                            onClick={() => setAutoSkip(!autoSkip)} 
                                            className={`w-8 h-4 rounded-full relative transition-all ${autoSkip ? 'bg-red-600 shadow-[0_0_10px_rgba(229,9,20,0.5)]' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoSkip ? 'right-0.5' : 'left-0.5'}`}></div>
                                        </button>
                                    </div>
                                    <div className="hidden md:flex items-center gap-4 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                                        <span className={`text-[8px] font-black uppercase tracking-widest italic ${autoPlay ? 'text-red-600' : 'text-gray-600'}`}>Auto Play</span>
                                        <button 
                                            onClick={() => setAutoPlay(!autoPlay)} 
                                            className={`w-8 h-4 rounded-full relative transition-all ${autoPlay ? 'bg-red-600 shadow-[0_0_10px_rgba(229,9,20,0.5)]' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoPlay ? 'right-0.5' : 'left-0.5'}`}></div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-4 md:gap-10">
                            <div className="text-[8px] md:text-[10px] font-black uppercase text-red-600 tracking-[0.2em] md:tracking-[0.4em] italic hidden sm:block opacity-60 truncate max-w-[100px] md:max-w-none">Stream • {currentVideo.title}</div>
                            <div className="flex items-center gap-3 md:gap-5">
                                <input type="range" min="0" max="1" step="0.1" value={isMuted ? 0 : volume} onChange={(e) => { const v = parseFloat(e.target.value); setVolume(v); if(videoRef.current) videoRef.current.volume = v; }} className="w-16 md:w-24 h-1 bg-white/10 rounded-full appearance-none accent-white opacity-40 hover:opacity-100 transition-all" />
                                <button onClick={() => { if(!document.fullscreenElement) document.getElementById('video-container')?.requestFullscreen(); else document.exitFullscreen(); }} className="text-xl md:text-3xl opacity-60 hover:opacity-100 transition-all">⛶</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            <div className="text-center opacity-20 uppercase font-black italic text-[10px] md:text-[12px] tracking-[0.3em] md:tracking-[0.5em] px-12 animate-pulse leading-loose">Connexion établie • En attente de médias...</div>
          )}
        </div>

        {isSidebarVisible && (
          <div className="w-full md:w-[400px] bg-[#0a0a0a] flex flex-col h-[65%] md:h-full z-40 shadow-[-40px_0_80px_rgba(0,0,0,0.9)] animate-fade-in">
            <div className="flex border-b border-white/5 shrink-0 bg-[#141414]">
              {room.hasChat !== false && (
                  <button onClick={() => setActiveTab('chat')} className={`flex-1 p-4 md:p-6 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.25em] transition-all italic ${activeTab === 'chat' ? 'text-red-600 border-b-2 border-red-600 bg-white/[0.03]' : 'text-gray-600 hover:text-white'}`}>Communication</button>
              )}
              <button onClick={() => setActiveTab('playlist')} className={`flex-1 p-4 md:p-6 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.25em] transition-all italic ${activeTab === 'playlist' || room.hasChat === false ? 'text-red-600 border-b-2 border-red-600 bg-white/[0.03]' : 'text-gray-600 hover:text-white'}`}>Playlist</button>
            </div>
            
            {room.isPremium && !user.isPremium && user.roleId !== 'admin' && (
                <div className="bg-yellow-600/10 p-3 md:p-4 border-b border-yellow-600/20 text-center">
                    <p className="text-[7px] md:text-[8px] font-black uppercase text-yellow-500 italic">Salon Premium • Playlist en lecture seule</p>
                </div>
            )}
            
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 scrollbar-hide scroll-smooth">
              {(activeTab === 'chat' && room.hasChat !== false) ? (
                  <>
                    {messages.map(m => (
                        <div key={m.id} className="animate-fade-in group/msg">
                            <span className="text-[8px] md:text-[9px] font-black text-red-600 uppercase italic block mb-1 md:mb-2 opacity-70">{m.username}</span>
                            <p className="text-[10px] md:text-[11px] bg-white/[0.04] p-3 md:p-5 rounded-[1.2rem] md:rounded-[1.8rem] border border-white/5 inline-block max-w-full break-words shadow-2xl transition-all font-medium leading-relaxed">{m.text}</p>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                  </>
              ) : (
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-3">
                        <span className="text-[8px] md:text-[10px] font-black uppercase text-gray-500 italic tracking-[0.2em] md:tracking-[0.3em]">File de lecture</span>
                        {user.roleId !== 'guest' && (
                            <button onClick={handleClearPlaylist} className="text-[8px] md:text-[9px] font-black uppercase text-red-600 hover:underline italic">Vider Tout</button>
                        )}
                    </div>
                    {Object.entries(groupedPlaylist).map(([folder, items]) => (
                        <div key={folder} className="space-y-3">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2 cursor-pointer group" onClick={() => toggleFolder(folder)}>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[8px] transition-transform ${expandedFolders[folder] ? 'rotate-90' : ''}`}>▶</span>
                                    <h4 className="text-[9px] font-black uppercase italic text-red-600">{folder}</h4>
                                </div>
                                {user.roleId !== 'guest' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleClearFolder(folder); }} className="text-[7px] font-bold uppercase text-gray-600 hover:text-red-600 transition-colors">Vider Dossier</button>
                                )}
                            </div>
                            {expandedFolders[folder] && (
                                <div className="space-y-2 animate-fade-in">
                                    {items.map((item) => {
                                        const idx = room.playlist.findIndex(p => p.id === item.id);
                                        const isGuest = user.roleId === 'guest';
                                        return (
                                            <div 
                                                key={item.id} 
                                                onClick={() => {
                                                    if (isGuest) return;
                                                    SocketService.socket.emit('change-video', { roomId, index: idx, userId: user.id });
                                                }} 
                                                className={`p-3 rounded-xl border transition-all flex justify-between items-center group/item ${isGuest ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} ${idx === room.currentVideoIndex ? 'border-red-600 bg-red-600/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}
                                            >
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className="text-[9px] font-black uppercase italic truncate">{item.title}</p>
                                                    <p className="text-[6px] font-bold text-gray-600 uppercase mt-1">{item.addedBy}</p>
                                                </div>
                                                {!isGuest && (
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            SocketService.socket.emit('remove-from-playlist', { roomId, playlistItemId: item.id });
                                                        }} 
                                                        className="text-gray-500 hover:text-red-500 p-2 rounded hover:bg-white/5 text-[10px] transition-colors font-bold"
                                                        title="Retirer de la file"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
          </div>

          {(activeTab === 'chat' && room.hasChat !== false) && (
            <div className="p-4 md:p-6 border-t border-white/5 bg-[#111]">
                {user.roleId === 'guest' ? (
                    <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl p-4 text-center text-[9px] md:text-[10px] font-black uppercase text-gray-500 italic">
                        🚫 Mode Invité • Lecture seule (spectateur uniquement)
                    </div>
                ) : (
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && chatInput.trim() && (SocketService.sendMessage(roomId, { id: Date.now().toString(), username: user.username, text: chatInput }), setChatInput(''))} className="w-full bg-[#0a0a0a] rounded-2xl md:rounded-3xl p-4 md:p-6 text-[10px] md:text-[11px] font-black outline-none border border-white/10 focus:border-red-600 transition-all uppercase italic" placeholder="Votre message..." />
                )}
            </div>
          )}
        </div>
        )}
      </div>

      {isLibraryOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 lg:p-16">
          <div className="bg-[#111] border border-white/10 p-12 rounded-[5rem] w-full max-w-7xl h-full flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 shrink-0">
                <div className="flex flex-col gap-4">
                    <h2 className="text-5xl font-black italic uppercase text-red-600 tracking-tighter">Médiathèque</h2>
                    <div className="flex items-center gap-4 text-[10px] font-black italic text-gray-500">
                        {currentPath && (
                            <button 
                                onClick={handleGoBack}
                                className="flex items-center gap-1.5 bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600 hover:text-white transition-all px-3 py-1.5 rounded-xl uppercase font-black text-[9px] mr-2 italic shrink-0"
                            >
                                ◀ Retour
                            </button>
                        )}
                        {breadcrumbs.map((crumb, i) => (
                            <React.Fragment key={crumb.path}>
                                <button onClick={() => { setCurrentPath(crumb.path); setLibrarySearch(''); }} className="hover:text-red-600 transition-colors">{crumb.name}</button>
                                {i < breadcrumbs.length - 1 && <span>/</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <input 
                            type="text" 
                            placeholder="Chercher un film..." 
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-xs font-black uppercase outline-none focus:border-red-600 transition-all italic"
                            value={librarySearch}
                            onChange={e => setLibrarySearch(e.target.value)}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">🔍</span>
                    </div>
                    <button onClick={() => setIsLibraryOpen(false)} className="bg-white/5 w-14 h-14 rounded-full flex items-center justify-center hover:bg-red-600 transition-all font-bold text-xl shrink-0">✕</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 pr-4 scrollbar-hide pb-12 items-start">
              {currentPath && !librarySearch && (
                <div 
                  onClick={handleGoBack}
                  className="group bg-white/[0.03] p-8 rounded-[3rem] border border-white/5 cursor-pointer hover:border-red-600 hover:bg-white/[0.06] transition-all flex flex-col items-center gap-6 shadow-2xl relative h-fit text-center"
                >
                  <div className="text-6xl group-hover:scale-110 transition-transform">↩️</div>
                  <p className="text-[11px] font-black uppercase italic tracking-tight leading-tight text-gray-400 group-hover:text-white">Retour</p>
                </div>
              )}
              {filteredLibrary.map((f, i) => (
                <div key={i} className="group bg-white/[0.03] p-8 rounded-[3rem] border border-white/5 cursor-pointer hover:border-red-600 hover:bg-white/[0.06] transition-all flex flex-col items-center gap-6 shadow-2xl relative h-fit">
                    <div onClick={() => {
                        if (f.isDirectory) {
                            setCurrentPath(f.path);
                        } else {
                            SocketService.socket.emit('add-to-playlist', { 
                                roomId, 
                                item: { 
                                    title: f.name, 
                                    url: `/video/local/${encodeURIComponent(f.path)}`, 
                                    addedBy: user.username, 
                                    isLocal: true, 
                                    localPath: f.path 
                                }, 
                                userId: user.id 
                            });
                            setToast({ message: `"${f.name}" ajouté à la playlist !`, type: 'success' });
                        }
                    }} className="flex flex-col items-center gap-6 w-full text-center">
                        <div className="text-6xl group-hover:scale-110 transition-transform">{f.isDirectory ? '📂' : '🎬'}</div>
                        <p className="text-[11px] font-black uppercase italic tracking-tight leading-tight line-clamp-2">{f.name}</p>
                    </div>
                    {f.isDirectory && (
                        <button onClick={() => addFolderToPlaylist(f)} className="w-full bg-red-600/10 text-red-600 border border-red-600/20 p-3 rounded-2xl text-[8px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Importer Dossier</button>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {isPremiumModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
          <div className="bg-[#111] p-12 rounded-[4rem] w-full max-w-xl shadow-2xl border border-white/10 relative overflow-hidden animate-fade-in text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[80px] -mr-32 -mt-32"></div>
            <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-yellow-500/20">
                <span className="text-4xl">🎬</span>
            </div>
            <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-6">MÉDIATHÈQUE RÉSERVÉE</h2>
            <p className="text-xs text-gray-400 font-bold uppercase italic max-w-xs mx-auto leading-relaxed mb-10">
                L'accès à la bibliothèque de films est réservé aux membres Premium qui soutiennent BrokHomeTV.
            </p>
            <div className="space-y-4">
                <a 
                    href="https://ko-fi.com/yourpage" 
                    target="_blank" 
                    rel="noreferrer"
                    className="block w-full bg-yellow-600 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest text-black shadow-2xl shadow-yellow-600/40 hover:bg-yellow-500 transition-all italic"
                >
                    DEVENIR PREMIUM SUR KO-FI →
                </a>
                <button onClick={() => setIsPremiumModalOpen(false)} className="w-full py-4 font-black uppercase text-[9px] tracking-widest text-gray-500 hover:text-white transition-colors">Fermer</button>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
// --- End of views/RoomView.tsx ---