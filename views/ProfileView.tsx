// Author: Senior Frontend Engineer
// OS support: Cross-platform
// Description: Vue Profil inspirée de Steam avec statistiques détaillées et timeline d'activité

import React, { useState, useEffect } from 'react';
import { User } from '../types.ts';

interface ProfileViewProps {
    user: User;
    loggedUser: User;
    onBack: () => void;
    onUpdateUser: (u: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user: initialUser, loggedUser, onBack, onUpdateUser }) => {
    const [user, setUser] = useState<User>(initialUser);
    const [kofiInput, setKofiInput] = useState(user.kofiUsername || '');
    const [isSaving, setIsSaving] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const isOwnProfile = loggedUser.id === user.id;

    const avatarStyles = [
        'adventurer', 'avataaars', 'big-ears', 'big-smile', 'bottts', 
        'croodles', 'fun-emoji', 'lorelei', 'notionists', 'open-peeps', 
        'pixel-art', 'shapes'
    ];

    const stats = user.stats || {
        totalMinutes: 0,
        filmsFinished: 0,
        roomsCreated: 0,
        messagesSent: 0,
        abandonRate: 0,
        favoriteGenre: 'Inconnu',
        avgWatchHour: '21:00',
        lastMovieTitle: 'Aucun',
        activityHistory: [],
        watchedHistory: []
    };

    const handleUpdateAvatar = async (style: string) => {
        const seed = Math.random().toString(36).substring(7);
        const newAvatar = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
        setIsSaving(true);
        try {
            const res = await fetch('/api/users/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, avatar: newAvatar })
            });
            if (res.ok) {
                const updated = await res.json();
                setUser(updated);
                localStorage.setItem('ss_session', JSON.stringify(updated));
                onUpdateUser(updated);
                setShowAvatarPicker(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveKofi = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/users/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, kofiUsername: kofiInput })
            });
            if (res.ok) {
                const updated = await res.json();
                setUser(updated);
                localStorage.setItem('ss_session', JSON.stringify(updated));
                alert("Pseudo Ko-fi enregistré !");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleVerifyPremium = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/users/verify-premium', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                localStorage.setItem('ss_session', JSON.stringify(data.user));
                alert("Félicitations ! Votre statut Premium est activé.");
            } else {
                alert(data.error || "Erreur de vérification");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#141414] text-white font-sans pb-20 selection:bg-[#e50914]/30">
            {/* Header Netflix Style */}
            <div className="relative pt-32 pb-12 px-6 md:px-12 border-b border-white/5 bg-gradient-to-b from-black/40 to-transparent">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-[#e50914] rounded-md blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <img 
                            src={user.avatar} 
                            className="w-40 h-40 rounded-md border border-white/10 shadow-2xl relative z-10 bg-black" 
                            alt="Avatar"
                        />
                        {isOwnProfile && (
                            <button 
                                onClick={() => setShowAvatarPicker(true)}
                                className="absolute bottom-2 right-2 z-20 bg-red-600 p-2 rounded-full shadow-xl hover:scale-110 transition-all text-xs"
                            >
                                ✏️
                            </button>
                        )}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                            <h1 className="text-5xl font-black tracking-tighter uppercase italic">{user.username}</h1>
                            {user.isPremium && (
                                <span className="bg-[#e50914] text-white text-[10px] font-black px-3 py-1 rounded-sm uppercase tracking-widest shadow-lg">Premium</span>
                            )}
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mb-6">
                            <span className="text-gray-400 font-black text-xs uppercase tracking-widest italic">{user.role?.name || 'Utilisateur'}</span>
                            <div className="h-4 w-px bg-white/10"></div>
                            <span className="text-[11px] text-green-500 font-bold uppercase tracking-widest">En ligne</span>
                        </div>
                        <p className="text-gray-400 text-sm max-w-xl italic font-medium leading-relaxed">
                            "Membre passionné de la communauté BrokHomeTV. Amateur de cinéma et de partage."
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl min-w-[220px] text-center backdrop-blur-xl">
                        <p className="text-white text-5xl font-black italic tracking-tighter leading-none">{Math.floor(stats.totalMinutes / 60)}</p>
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500 mt-3">Heures de visionnage</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-16 grid grid-cols-12 gap-12">
                {/* Colonne Gauche - Détails & Stats */}
                <div className="col-span-12 lg:col-span-8 space-y-10">
                    <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                        <h2 className="text-white text-xl font-black italic uppercase mb-8 border-b border-white/10 pb-4 tracking-tighter">Statistiques</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
                            <div>
                                <p className="text-3xl text-white font-black italic">{stats.filmsFinished}</p>
                                <p className="text-[9px] uppercase font-black text-gray-500 tracking-widest mt-1">Films Finis</p>
                            </div>
                            <div>
                                <p className="text-3xl text-white font-black italic">{stats.abandonRate}%</p>
                                <p className="text-[9px] uppercase font-black text-gray-500 tracking-widest mt-1">Abandon</p>
                            </div>
                            <div>
                                <p className="text-2xl text-[#e50914] font-black italic uppercase truncate px-2">{stats.favoriteGenre}</p>
                                <p className="text-[9px] uppercase font-black text-gray-500 tracking-widest mt-1">Genre</p>
                            </div>
                            <div>
                                <p className="text-3xl text-white font-black italic">{stats.avgWatchHour}</p>
                                <p className="text-[9px] uppercase font-black text-gray-500 tracking-widest mt-1">Moyenne</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                        <h2 className="text-white text-xl font-black italic uppercase mb-8 border-b border-white/10 pb-4 tracking-tighter">Historique de Visionnage</h2>
                        <div className="space-y-4">
                            {stats.watchedHistory && stats.watchedHistory.length > 0 ? (
                                stats.watchedHistory.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-[11px] font-black uppercase italic text-white">{item.title}</p>
                                            <p className="text-[8px] font-bold text-gray-600 uppercase mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                                        </div>
                                        <span className="text-[8px] font-black text-red-600 uppercase italic">Visionné</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-6 text-gray-600 text-[10px] font-black uppercase italic">Aucun historique</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                        <h2 className="text-white text-xl font-black italic uppercase mb-8 border-b border-white/10 pb-4 tracking-tighter">Activité Récente</h2>
                        <div className="space-y-4">
                            {stats.activityHistory && stats.activityHistory.length > 0 ? (
                                stats.activityHistory.map((act, i) => (
                                    <div key={i} className="flex gap-6 items-start p-6 bg-black/40 hover:bg-white/5 transition-all rounded-2xl border border-white/5 group">
                                        <div className="w-12 h-12 bg-[#e50914]/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🎬</div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-sm font-black uppercase italic text-white">{act.action}</p>
                                                <span className="text-[10px] font-bold text-gray-600 uppercase">{new Date(act.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium italic">{act.details || "Action enregistrée sur le serveur."}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-10 text-gray-600 text-sm italic font-bold uppercase tracking-widest">Aucune activité</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Colonne Droite - Infos Supplémentaires */}
                <div className="col-span-12 lg:col-span-4 space-y-10">
                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                        <h3 className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-6 italic">Accès & Salon Premium</h3>
                        {isOwnProfile ? (
                            <div className="space-y-6">
                                <div className="bg-emerald-600/10 p-6 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-white font-black uppercase italic">STATUT : ACCÈS ILLIMITÉ</p>
                                        <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">PROMOTION GRATUITE COMMENCÉE</p>
                                    </div>
                                    <span className="text-[8px] bg-emerald-600 text-white px-2 py-1 rounded-sm font-black uppercase italic shadow-lg">OUVERT</span>
                                </div>
                                <div className="bg-white/[0.02] p-4 border border-white/5 rounded-2xl">
                                    <p className="text-[9px] text-gray-400 italic leading-relaxed font-medium">
                                        BrokHomeTV est actuellement offert et gratuit pour toute la communauté !<br/>
                                        La création de salons, la lecture de films et toutes les caractéristiques avancées sont débloquées sans frais.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-black/40 p-6 border border-white/5 rounded-2xl flex items-center justify-between">
                                <p className="text-white text-xs font-black italic">Accès Intégral</p>
                                <span className="text-[8px] bg-emerald-600 text-white px-2 py-1 rounded-sm font-black uppercase italic shadow-lg">OUVERT</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                        <h3 className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-6 italic">Dernier Film Vu</h3>
                        <div className="bg-black/40 p-6 border border-white/5 rounded-2xl">
                            <p className="text-white text-sm font-black italic truncate">{stats.lastMovieTitle}</p>
                            <p className="text-[9px] text-[#e50914] font-black uppercase mt-2 italic">Visionné récemment</p>
                        </div>
                    </div>

                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                        <h3 className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-6 italic">Badges Community</h3>
                        <div className="flex flex-wrap gap-4">
                            <div title="Pionnier" className="w-12 h-12 bg-gradient-to-br from-[#e50914] to-black rounded-xl border border-white/10 flex items-center justify-center text-2xl shadow-xl transform hover:rotate-12 transition-transform">👑</div>
                            <div title="Cinéphile" className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-2xl shadow-xl transform hover:-rotate-12 transition-transform">🎬</div>
                            <div title="Nocturne" className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-2xl shadow-xl transform hover:rotate-12 transition-transform">🌙</div>
                        </div>
                    </div>

                    <button 
                        onClick={onBack}
                        className="w-full bg-white text-black py-4 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest shadow-2xl hover:bg-gray-200 italic"
                    >
                        Retour Dashboard
                    </button>
                </div>
            </div>
            {showAvatarPicker && (
                <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8">
                    <div className="bg-[#111] border border-white/10 p-12 rounded-[4rem] w-full max-w-4xl max-h-[80vh] overflow-y-auto scrollbar-hide">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-3xl font-black italic uppercase text-red-600 tracking-tighter">Choisir un Style</h2>
                            <button onClick={() => setShowAvatarPicker(false)} className="bg-white/5 w-12 h-12 rounded-full flex items-center justify-center hover:bg-red-600 transition-all font-bold">✕</button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {avatarStyles.map(style => (
                                <button 
                                    key={style}
                                    onClick={() => handleUpdateAvatar(style)}
                                    className="bg-black/40 p-6 rounded-3xl border border-white/5 hover:border-red-600 transition-all group"
                                >
                                    <img src={`https://api.dicebear.com/7.x/${style}/svg?seed=preview`} className="w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform" alt={style} />
                                    <p className="text-[10px] font-black uppercase italic text-gray-500 group-hover:text-white">{style}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
