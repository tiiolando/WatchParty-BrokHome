// Author: SyncStream Engineer
// OS support: Cross-platform
// Description: Barre de navigation premium avec visibilité d'administration corrigée

import React, { useState, useEffect } from 'react';
import { User, Permission } from '../types.ts';
import { MobileMenu } from './Navbar/MobileMenu.tsx';
import { MembersDropdown } from './Navbar/MembersDropdown.tsx';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onGoToAdmin?: () => void;
  onGoToMovies?: () => void;
  onGoToPricing?: () => void;
  onGoToAwareness?: () => void;
  onFilterChange?: (filter: 'all' | 'mine' | 'public') => void;
  onViewProfile: (u: User) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onGoToAdmin, onGoToMovies, onGoToPricing, onGoToAwareness, onFilterChange, onViewProfile }) => {
  const [showMembers, setShowMembers] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [config, setConfig] = useState<any>({ brokhometvFont: 'Inter' });
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    fetch('/api/config').then(res => res.json()).then(setConfig).catch(() => {});
    fetch('/api/users/count').then(res => res.json()).then(data => setUserCount(data.count)).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const canAdmin = user.roleId === 'admin' || user.role?.id === 'admin' || user.role?.permissions?.includes(Permission.MANAGE_ROLES);

  return (
    <nav className={`fixed top-0 left-0 w-full z-[80] px-4 md:px-12 py-4 flex items-center justify-between transition-all duration-500 ${isScrolled ? 'bg-[#141414] shadow-2xl' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="flex items-center gap-4 md:gap-12">
        <div className="flex flex-col">
          <h1 
            className="text-2xl md:text-3xl font-black text-[#e50914] tracking-tighter cursor-pointer uppercase"
            style={{ fontFamily: config.brokhometvFont || 'Inter' }}
            onClick={() => onFilterChange?.('all')}
          >
            BROKHOMETV
          </h1>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[7px] font-black text-gray-500 uppercase italic tracking-widest">{userCount} UTILISATEURS</span>
          </div>
        </div>
        <ul className="hidden lg:flex gap-6 text-[11px] font-bold uppercase tracking-tight text-gray-200">
          <li className="cursor-pointer hover:text-gray-400 transition-colors" onClick={() => onFilterChange?.('all')}>Accueil</li>
          <li className="cursor-pointer hover:text-gray-400 transition-colors" onClick={() => onFilterChange?.('mine')}>Mes Salons</li>
          <li className="cursor-pointer hover:text-gray-400 transition-colors" onClick={onGoToMovies}>Films</li>
          <li className="cursor-pointer hover:text-gray-400 transition-colors" onClick={onGoToPricing}>Premium</li>
          <li className="cursor-pointer text-emerald-500 hover:text-emerald-400 transition-colors" onClick={onGoToAwareness}>Antilles</li>
          <li className="cursor-pointer hover:text-gray-400 transition-colors" onClick={() => setShowMembers(!showMembers)}>Membres</li>
          {canAdmin && (
            <li className="cursor-pointer text-red-600 hover:text-red-500 transition-colors" onClick={onGoToAdmin}>Admin</li>
          )}
        </ul>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onViewProfile(user)}>
          <div className="text-right hidden sm:block">
            <div className="flex items-center justify-end gap-2">
              {user.isPremium && (
                <span className="text-[7px] bg-[#e50914] text-white px-1.5 py-0.5 rounded font-black uppercase shadow-sm">Premium</span>
              )}
              <p className="text-[11px] font-bold uppercase leading-none group-hover:text-gray-300">{user.username}</p>
            </div>
          </div>
          <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-md border border-white/10 shadow-lg" />
        </div>
        <button 
          onClick={onLogout}
          className="hidden sm:block text-[10px] font-bold uppercase bg-[#e50914] px-4 py-2 hover:bg-[#b20710] transition-all rounded"
        >
          Sortie
        </button>
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden text-2xl p-2"
        >
          ☰
        </button>
      </div>

      {showMobileMenu && (
        <MobileMenu 
          onFilterChange={onFilterChange}
          onGoToMovies={onGoToMovies}
          onGoToPricing={onGoToPricing}
          onGoToAwareness={onGoToAwareness}
          onGoToAdmin={onGoToAdmin}
          onLogout={onLogout}
          setShowMembers={setShowMembers}
          setShowMobileMenu={setShowMobileMenu}
          canAdmin={canAdmin}
        />
      )}

      {showMembers && (
        <MembersDropdown 
          onClose={() => setShowMembers(false)}
          onViewProfile={onViewProfile}
        />
      )}
    </nav>
  );
};
