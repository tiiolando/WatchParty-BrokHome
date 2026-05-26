// Author: Senior Frontend Engineer
// OS support: Cross-platform
// Description: Vue Tarification expliquant les avantages de l'abonnement Premium

import React from 'react';
import { User } from '../types.ts';
import { Navbar } from '../components/Navbar.tsx';

interface PricingViewProps {
    user: User;
    onBack: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ user, onBack }) => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-20">
            <Navbar 
                user={user} 
                onLogout={() => window.location.reload()} 
                onViewProfile={() => {}} 
                onFilterChange={() => onBack()}
            />
            
            <div className="max-w-5xl mx-auto px-6 pt-32 text-center">
                <h1 className="text-6xl font-black italic uppercase text-red-600 tracking-tighter mb-4">Accès Premium</h1>
                <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em] mb-16 italic">Soutenez BrokHomeTV et débloquez tout le potentiel</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="bg-[#111] p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] -mr-32 -mt-32"></div>
                        <h2 className="text-3xl font-black italic uppercase text-white mb-8">Instructions d'activation</h2>
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <span className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center font-black shrink-0">1</span>
                                <div>
                                    <p className="text-[11px] font-black uppercase italic text-white">Abonnement Ko-fi</p>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase mt-1 italic">Souscrivez à l'abonnement mensuel de 3€ sur notre page Ko-fi.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <span className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center font-black shrink-0">2</span>
                                <div>
                                    <p className="text-[11px] font-black uppercase italic text-white">Lier sur votre profil</p>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase mt-1 italic">Entrez simplement votre pseudo ou nom d'utilisateur Ko-fi directement de votre espace Profil.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <span className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center font-black shrink-0">3</span>
                                <div>
                                    <p className="text-[11px] font-black uppercase italic text-white">Vérification</p>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase mt-1 italic">Notre système vérifiera automatiquement votre statut d'abonné.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-600 to-red-900 p-12 rounded-[4rem] shadow-2xl shadow-red-600/20 flex flex-col items-center justify-center gap-8 transform hover:scale-105 transition-all">
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-2">Tarif Unique</p>
                            <p className="text-7xl font-black italic tracking-tighter">3€</p>
                            <p className="text-[10px] font-black uppercase mt-2">Par mois</p>
                        </div>
                        
                        <div className="w-full h-px bg-white/20"></div>
                        
                        <a 
                            href="https://ko-fi.com/yourpage" 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full bg-white text-black py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all shadow-xl italic"
                        >
                            S'abonner via Ko-fi →
                        </a>
                        
                        <p className="text-[8px] font-bold uppercase italic opacity-60">Pensez à utiliser le même pseudo ici et sur Ko-fi</p>
                    </div>
                </div>

                <button 
                    onClick={onBack}
                    className="mt-20 text-gray-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all italic"
                >
                    ← Retour au Dashboard
                </button>
            </div>
        </div>
    );
};

// --- End of PricingView.tsx ---
