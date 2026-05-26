// Author: Senior Frontend Engineer
// OS support: Windows, macOS, Linux
// Description: Interface de contrôle du bot Discord avec recherche Spotify et gestion de playlist
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Music, Search, Play, SkipForward, Volume2, List, Settings, Users, MessageSquare } from 'lucide-react';

export const BotDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [queueFilter, setQueueFilter] = useState('');
  const [queue, setQueue] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [voiceChannels, setVoiceChannels] = useState<any[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const GUILD_ID = "1175391905463422997";

  // Fetch voice channels
  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/discord/voice-channels');
      const data = await res.json();
      setVoiceChannels(data);
      
      const connected = data.find((c: any) => c.botConnected);
      if (connected) {
        setActiveChannelId(connected.id);
        if (!selectedChannelId) setSelectedChannelId(connected.id);
      }
    } catch (e) {
      console.error("Error fetching channels", e);
    }
  };

  // Fetch playlist for selected channel
  const fetchPlaylist = async () => {
    if (!selectedChannelId) return;
    try {
      const playlistRes = await fetch(`/api/discord/playlist/${selectedChannelId}`);
      const playlistData = await playlistRes.json();
      setQueue(playlistData);
      if (playlistData.length > 0 && activeChannelId === selectedChannelId) {
        setCurrentTrack(playlistData[0]);
      } else if (activeChannelId !== selectedChannelId) {
        setCurrentTrack(null);
      } else {
        setCurrentTrack(null);
      }
    } catch (e) {
      console.error("Error fetching playlist", e);
    }
  };

  useEffect(() => {
    fetchChannels();
    const interval = setInterval(fetchChannels, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchPlaylist();
  }, [selectedChannelId, activeChannelId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error("Search error", e);
    } finally {
      setIsSearching(false);
    }
  };

  const addToQueue = async (track: any) => {
    if (!selectedChannelId) return;
    try {
      const res = await fetch(`/api/discord/playlist/${selectedChannelId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track, guildId: GUILD_ID })
      });
      const data = await res.json();
      setQueue(data);
      setSearchResults([]);
      setSearchQuery('');
    } catch (e) {
      console.error("Error adding to queue", e);
    }
  };

  const removeFromQueue = async (trackId: string) => {
    if (!selectedChannelId) return;
    try {
      const res = await fetch(`/api/discord/playlist/${selectedChannelId}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId, guildId: GUILD_ID })
      });
      const data = await res.json();
      setQueue(data);
    } catch (e) {
      console.error("Error removing from queue", e);
    }
  };

  const handleJoinChannel = async (channelId: string) => {
    try {
      await fetch('/api/discord/voice/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, guildId: GUILD_ID })
      });
      setActiveChannelId(channelId);
      setSelectedChannelId(channelId);
      fetchChannels();
    } catch (e) {
      console.error("Error joining channel", e);
    }
  };

  const handleLeaveChannel = async () => {
    try {
      await fetch('/api/discord/voice/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: GUILD_ID })
      });
      setActiveChannelId(null);
      fetchChannels();
    } catch (e) {
      console.error("Error leaving channel", e);
    }
  };

  const filteredQueue = queue.filter(track => 
    track.title.toLowerCase().includes(queueFilter.toLowerCase()) ||
    track.artist.toLowerCase().includes(queueFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl font-black italic uppercase tracking-tighter text-red-600 mb-2"
            >
              Bot Control Center
            </motion.h1>
            <p className="text-gray-500 font-bold uppercase italic text-sm tracking-widest">Gérez votre expérience audio et communautaire</p>
          </div>
          <button 
            onClick={onBack}
            className="px-8 py-4 bg-white/5 rounded-2xl font-black text-[10px] uppercase italic hover:bg-white/10 transition-all border border-white/5"
          >
            Retour Dashboard
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Voice Channels & Controls */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-red-600 w-5 h-5" />
                <h2 className="text-xl font-black italic uppercase">Salons Vocaux</h2>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
                {voiceChannels.length > 0 ? voiceChannels.map(channel => (
                  <div key={channel.id} className="relative group">
                    <button
                      onClick={() => setSelectedChannelId(channel.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        selectedChannelId === channel.id 
                        ? 'bg-white/10 border-red-600/50 text-white' 
                        : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Volume2 className={`w-4 h-4 ${channel.botConnected ? 'text-red-600' : ''}`} />
                        <span className="text-xs font-black uppercase italic truncate max-w-[120px]">{channel.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {channel.botConnected && <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>}
                        <span className="text-[10px] font-bold opacity-60">{channel.members}</span>
                      </div>
                    </button>
                    {!channel.botConnected && selectedChannelId === channel.id && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleJoinChannel(channel.id); }}
                        className="absolute -right-2 -top-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase italic shadow-lg hover:scale-110 transition-transform z-10"
                      >
                        Rejoindre
                      </button>
                    )}
                  </div>
                )) : (
                  <p className="text-center text-gray-600 text-[10px] py-4 uppercase italic font-bold">Aucun salon vocal trouvé</p>
                )}
              </div>
            </section>

            <section className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="text-red-600 w-5 h-5" />
                <h2 className="text-xl font-black italic uppercase">Réglages Bot</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black uppercase italic text-gray-400">Volume Global</span>
                  <input type="range" className="accent-red-600 w-24" />
                </div>
                <button 
                  onClick={handleLeaveChannel}
                  className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase italic hover:bg-white/10 transition-all"
                >
                  Déconnecter le Bot
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Music Search & Queue */}
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <form onSubmit={handleSearch} className="relative mb-4">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="RECHERCHER SUR YOUTUBE OU SPOTIFY..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-sm font-black outline-none focus:border-red-600 transition-all uppercase italic"
                />
                {isSearching && <div className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>}
              </form>

              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/60 rounded-3xl border border-white/10 p-4 mb-8 space-y-2"
                >
                  <p className="text-[9px] font-black uppercase italic text-gray-500 px-2 mb-2">Résultats Spotify</p>
                  {searchResults.map(result => (
                    <button 
                      key={result.id}
                      onClick={() => addToQueue(result)}
                      className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-red-600 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        {result.image ? (
                          <img src={result.image} alt={result.title} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <Music className="w-4 h-4 text-red-600 group-hover:text-white" />
                        )}
                        <div className="text-left">
                          <p className="text-[11px] font-black uppercase italic">{result.title}</p>
                          <p className="text-[9px] font-bold text-gray-500 group-hover:text-white/70 uppercase">{result.artist}</p>
                        </div>
                      </div>
                      <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </motion.div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <Music className="text-red-600 w-5 h-5" />
                <h2 className="text-xl font-black italic uppercase">En Lecture</h2>
              </div>

              {currentTrack ? (
                <div className="bg-black/40 p-6 rounded-3xl border border-red-600/20 flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 bg-red-600/10 rounded-2xl flex items-center justify-center overflow-hidden">
                    {currentTrack.image ? (
                      <img src={currentTrack.image} alt={currentTrack.title} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="text-red-600 w-10 h-10" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black uppercase italic">{currentTrack.title}</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase">{currentTrack.artist}</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="p-4 bg-red-600 rounded-full hover:scale-110 transition-transform shadow-lg shadow-red-600/20">
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                    <button 
                      onClick={() => removeFromQueue(currentTrack.id)}
                      className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-black/20 p-12 rounded-3xl border border-dashed border-white/5 text-center mb-8">
                  <p className="text-gray-600 font-black uppercase italic text-xs">Aucune musique en cours</p>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <List className="text-red-600 w-5 h-5" />
                  <h2 className="text-xl font-black italic uppercase">
                    File d'attente {selectedChannelId && `(${voiceChannels.find(c => c.id === selectedChannelId)?.name || '...'})`}
                  </h2>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-3 h-3" />
                  <input 
                    type="text"
                    placeholder="FILTRER LA FILE..."
                    value={queueFilter}
                    onChange={(e) => setQueueFilter(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[9px] font-black outline-none focus:border-red-600 transition-all uppercase italic w-full md:w-48"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredQueue.length > 0 && filteredQueue.map((track, i) => (
                  <div key={track.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 group hover:border-white/20 transition-all">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-gray-700 w-4">{i + 1}</span>
                      {track.image && (
                        <img src={track.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      )}
                      <div>
                        <h4 className="text-[11px] font-black uppercase italic">{track.title}</h4>
                        <p className="text-[9px] font-bold text-gray-500 uppercase">{track.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] font-black text-gray-600">{track.duration}</span>
                      <button 
                        onClick={() => removeFromQueue(track.id)}
                        className="text-red-600 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {filteredQueue.length === 0 && queue.length > 0 && (
                  <p className="text-center text-gray-700 py-8 italic text-[10px] uppercase font-bold">Aucun résultat pour "{queueFilter}"</p>
                )}
                {queue.length === 0 && (
                  <p className="text-center text-gray-700 py-8 italic text-[10px] uppercase font-bold">La file d'attente est vide</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- End of BotDashboard.tsx ---
