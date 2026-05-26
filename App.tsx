// Author: SyncStream Engineer
// OS support: Cross-platform
// Description: Racine de l'application avec gestion sécurisée de l'authentification

import React, { useState, useEffect } from 'react';
import { Dashboard } from './views/Dashboard.tsx';
import { RoomView } from './views/RoomView.tsx';
import { ProfileView } from './views/ProfileView.tsx';
import { AuthView } from './views/AuthView.tsx';
import { AdminDashboard } from './views/AdminDashboard.tsx';
import { MoviesView } from './views/MoviesView.tsx';
import { PricingView } from './views/PricingView.tsx';
import { AntillesAwareness } from './views/AntillesAwareness.tsx';
import { SocketService } from './services/socket.ts';
import { User } from './types.ts';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [roomPassword, setRoomPassword] = useState<string | undefined>(undefined);
  const [view, setView] = useState<'auth' | 'dashboard' | 'room' | 'profile' | 'admin' | 'movies' | 'pricing' | 'awareness'>('auth');
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [systemNotif, setSystemNotif] = useState<any>(null);
  const [isNotifVisible, setIsNotifVisible] = useState(true);

  useEffect(() => {
    fetch('/api/system-notification')
      .then(res => res.json())
      .then(data => {
          setSystemNotif(data);
          setIsNotifVisible(true);
      })
      .catch(() => setSystemNotif(null));

    const handleSystemNotif = (notif: any) => {
        setSystemNotif(notif);
        setIsNotifVisible(true);
    };

    const handleUserUpdated = (updatedUser: User) => {
      if (currentUser && updatedUser.id === currentUser.id) {
        setCurrentUser(updatedUser);
        localStorage.setItem('ss_session', JSON.stringify(updatedUser));
      }
    };

    SocketService.socket.on('system-notification', handleSystemNotif);
    SocketService.socket.on('user-updated', handleUserUpdated);
    
    return () => { 
      SocketService.socket.off('system-notification', handleSystemNotif);
      SocketService.socket.off('user-updated', handleUserUpdated);
    };
  }, [currentUser?.id]);

  useEffect(() => {
    const savedUser = localStorage.getItem('ss_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
          setView('dashboard');
        }
      } catch (e) {
        localStorage.removeItem('ss_session');
      }
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const audio = new Audio('/start.mp3');
      audio.play().catch(err => {
        console.log("Audio autoplay blocked or file missing", err);
      });
    }
  }, [currentUser?.id]);

  if (!isReady) {
    return (
        <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-red-600 font-black italic uppercase animate-pulse">Chargement...</div>
        </div>
    );
  }

  const handleLogin = (u: User) => {
      setCurrentUser(u);
      setView('dashboard');
  };

  const handleOpenProfile = (u: User) => {
      setProfileUser(u);
      setView('profile');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {systemNotif && isNotifVisible && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-full max-w-2xl px-4 animate-bounce-in">
              <div className="bg-red-600 p-6 rounded-3xl shadow-2xl flex items-center justify-between gap-6 border border-white/20">
                  <div className="flex items-center gap-4">
                      <span className="text-2xl">📢</span>
                      <p className="text-[10px] font-black uppercase italic leading-relaxed">{systemNotif.message}</p>
                  </div>
                  <button onClick={() => setIsNotifVisible(false)} className="bg-black/20 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/40 transition-all font-bold">✕</button>
              </div>
          </div>
      )}

      {view === 'auth' && <AuthView onLogin={handleLogin} />}
      
      {view === 'dashboard' && currentUser && (
        <Dashboard 
          user={currentUser} 
          onLogout={() => { localStorage.removeItem('ss_session'); setCurrentUser(null); setView('auth'); }} 
          onJoinRoom={(id, pwd) => { 
              setCurrentRoomId(id); 
              setRoomPassword(pwd); 
              setView('room');
          }}
          onGoToAdmin={() => setView('admin')}
          onGoToMovies={() => setView('movies')}
          onGoToPricing={() => setView('pricing')}
          onGoToAwareness={() => setView('awareness')}
          onOpenProfile={handleOpenProfile}
        />
      )}

      {view === 'room' && currentUser && currentRoomId && (
        <RoomView 
          user={currentUser} 
          roomId={currentRoomId} 
          password={roomPassword}
          onLeave={() => { 
              setCurrentRoomId(null); 
              setView('dashboard'); 
          }} 
          onViewProfile={handleOpenProfile}
        />
      )}

      {view === 'profile' && profileUser && currentUser && (
          <ProfileView 
            user={profileUser} 
            loggedUser={currentUser}
            onBack={() => setView(currentRoomId ? 'room' : 'dashboard')} 
            onUpdateUser={(u) => {
                if (u.id === currentUser?.id) setCurrentUser(u);
            }}
          />
      )}

      {view === 'admin' && currentUser && (
          <AdminDashboard 
            user={currentUser} 
            onBack={() => setView('dashboard')} 
          />
      )}

      {view === 'movies' && currentUser && (
          <MoviesView 
            user={currentUser} 
            onBack={() => setView('dashboard')} 
          />
      )}

      {view === 'pricing' && currentUser && (
          <PricingView 
            user={currentUser} 
            onBack={() => setView('dashboard')} 
          />
      )}

      {view === 'awareness' && (
          <AntillesAwareness 
            onBack={() => setView('dashboard')} 
          />
      )}
    </div>
  );
};

export default App;

// --- End of App.tsx ---