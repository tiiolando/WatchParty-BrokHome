// Author: SyncStream Engineer
// OS support: Cross-platform
// Description: Menu mobile pour la barre de navigation

import React from 'react';

interface MobileMenuProps {
  onFilterChange?: (filter: 'all' | 'mine' | 'public') => void;
  onGoToMovies?: () => void;
  onGoToPricing?: () => void;
  onGoToAwareness?: () => void;
  onGoToAdmin?: () => void;
  onLogout: () => void;
  setShowMembers: (show: boolean) => void;
  setShowMobileMenu: (show: boolean) => void;
  canAdmin: boolean;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  onFilterChange,
  onGoToMovies,
  onGoToPricing,
  onGoToAwareness,
  onGoToAdmin,
  onLogout,
  setShowMembers,
  setShowMobileMenu,
  canAdmin
}) => {
  return (
    <div className="absolute top-full left-0 w-full bg-[#141414] border-t border-white/5 p-6 flex flex-col gap-6 lg:hidden animate-fade-in shadow-2xl">
      <button className="text-left text-xs font-black uppercase italic" onClick={() => { onFilterChange?.('all'); setShowMobileMenu(false); }}>Accueil</button>
      <button className="text-left text-xs font-black uppercase italic" onClick={() => { onFilterChange?.('mine'); setShowMobileMenu(false); }}>Mes Salons</button>
      <button className="text-left text-xs font-black uppercase italic" onClick={() => { onGoToMovies?.(); setShowMobileMenu(false); }}>Films</button>
      <button className="text-left text-xs font-black uppercase italic" onClick={() => { onGoToPricing?.(); setShowMobileMenu(false); }}>Premium</button>
      <button className="text-left text-xs font-black uppercase italic text-emerald-500" onClick={() => { onGoToAwareness?.(); setShowMobileMenu(false); }}>Antilles</button>
      <button className="text-left text-xs font-black uppercase italic" onClick={() => { setShowMembers(true); setShowMobileMenu(false); }}>Membres</button>
      {canAdmin && (
        <button className="text-left text-xs font-black uppercase italic text-red-600" onClick={() => { onGoToAdmin?.(); setShowMobileMenu(false); }}>Admin</button>
      )}
      <button className="text-left text-xs font-black uppercase italic text-red-600 border-t border-white/5 pt-4" onClick={onLogout}>Déconnexion</button>
    </div>
  );
};

// --- End of MobileMenu.tsx ---
