// Author: Senior Frontend Engineer
// OS support: Cross-platform
// Description: Vue "Mes Films" listant les films indexés sur les disques G: et H:

import React, { useState, useEffect } from 'react';
import { User, LocalFile } from '../types.ts';
import { Navbar } from '../components/Navbar.tsx';

interface MoviesViewProps {
    user: User;
    onBack: () => void;
}

export const MoviesView: React.FC<MoviesViewProps> = ({ user, onBack }) => {
    const [movies, setMovies] = useState<LocalFile[]>([]);
    const [search, setSearch] = useState('');
    const [selectedPath, setSelectedPath] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/local-movies?userId=${user.id}`)
            .then(res => res.json())
            .then(data => {
                setMovies(data.filter((f: LocalFile) => !f.isDirectory));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user.id]);

    const filteredMovies = movies.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
        const matchesPath = selectedPath === 'all' || (m.rootPath && m.rootPath.startsWith(selectedPath));
        return matchesSearch && matchesPath;
    });

    return (
        <div className="min-h-screen bg-[#141414] text-white font-sans pb-20">
            <Navbar 
                user={user} 
                onLogout={() => window.location.reload()} 
                onViewProfile={() => {}} 
                onFilterChange={() => onBack()}
            />
            
            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-white">Films</h1>
                        <div className="flex items-center gap-4 mt-4">
                            <select 
                                value={selectedPath}
                                onChange={(e) => setSelectedPath(e.target.value)}
                                className="bg-black border border-white/20 rounded px-4 py-1 text-xs font-bold outline-none focus:border-white transition-all text-white"
                            >
                                <option value="all">Tous les dossiers</option>
                                {Array.from(new Set(movies.map(m => m.rootPath).filter(Boolean))).map(rp => (
                                    <option key={rp} value={rp}>{rp}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="relative w-full md:w-64">
                        <input 
                            type="text" 
                            placeholder="Titres, personnes, genres" 
                            className="w-full bg-black border border-white/20 rounded py-2 px-4 text-xs font-medium outline-none focus:border-white transition-all"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center animate-pulse text-gray-500 font-bold uppercase tracking-widest">Chargement...</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-12">
                        {filteredMovies.map((movie, idx) => (
                            <div key={idx} className="group cursor-pointer transition-transform duration-300 hover:scale-110 hover:z-50">
                                <div className="aspect-video bg-[#141414] rounded overflow-hidden shadow-lg relative">
                                    <img 
                                        src={`https://picsum.photos/seed/${movie.name}/400/225`} 
                                        alt={movie.name}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center">▶</button>
                                    </div>
                                </div>
                                <p className="text-[11px] font-bold mt-2 text-gray-200 line-clamp-1">{movie.name}</p>
                                <p className="text-[9px] text-gray-500 mt-1 uppercase font-bold">{movie.isPremium ? 'Premium' : 'Standard'}</p>
                            </div>
                        ))}
                        {filteredMovies.length === 0 && (
                            <div className="col-span-full py-32 text-center opacity-30 font-bold text-sm tracking-widest">Aucun résultat pour votre recherche</div>
                        )}
                    </div>
                )}

                <button 
                    onClick={onBack}
                    className="mt-12 bg-white/5 border border-white/10 px-10 py-4 rounded-full font-black text-[10px] uppercase hover:bg-red-600 transition-all italic"
                >
                    ← Retour Dashboard
                </button>
            </div>
        </div>
    );
};

// --- End of MoviesView.tsx ---
