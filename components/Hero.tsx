
// Author: SyncStream Engineer
// OS support: Cross-platform
// Description: Hero de présentation avec nouveaux textes immersifs soulignant l'aspect local

import React from 'react';

interface HeroProps {
  onQuickJoin: () => void;
  onLearnMore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onQuickJoin, onLearnMore }) => {
  return (
    <div className="relative w-full h-[95vh] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=1920&q=80)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-12 max-w-2xl gap-6">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-[#e50914] flex items-center justify-center text-[10px] font-black rounded-sm">N</span>
          <span className="text-[10px] tracking-[0.3em] text-gray-300 font-black uppercase">Film Original Master</span>
        </div>
        
        <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter uppercase italic drop-shadow-2xl">
          BROKHOME <br/> <span className="text-[#e50914]">ULTRA STREAM</span>
        </h2>
        
        <p className="text-sm md:text-base text-gray-200 font-medium max-w-lg leading-relaxed drop-shadow-lg">
          Vivez l'expérience ultime du streaming local. Accédez à une bibliothèque privée de films en haute définition, synchronisée en temps réel pour des soirées inoubliables.
        </p>
        
        <div className="flex gap-4 mt-2">
          <button 
            onClick={onQuickJoin}
            className="bg-white text-black px-10 py-3 rounded font-black flex items-center gap-3 hover:bg-gray-200 transition-all shadow-2xl text-xs uppercase tracking-widest"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            Lecture
          </button>
          <button 
            onClick={onLearnMore}
            className="bg-gray-500/40 text-white px-10 py-3 rounded font-black flex items-center gap-3 hover:bg-gray-500/60 backdrop-blur-xl transition-all text-xs uppercase tracking-widest border border-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Plus d'infos
          </button>
        </div>
      </div>
    </div>
  );
};

// --- End of components/Hero.tsx ---
