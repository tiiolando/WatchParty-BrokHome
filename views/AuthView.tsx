
import React, { useState } from 'react';
import { User } from '../types';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const diceBearStyles = [
  'avataaars', 'bottts', 'adventurer', 'fun-emoji', 'pixel-art', 
  'big-ears', 'croodles', 'miniavs', 'notionists', 'lorelei'
];

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatarStyle] = useState(() => diceBearStyles[Math.floor(Math.random() * diceBearStyles.length)]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Échec de l'accès invité");
      }
      localStorage.setItem('ss_session', JSON.stringify(data));
      onLogin(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    const endpoint = isRegistering ? '/api/register' : '/api/login';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, avatarStyle })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
          throw new Error(data.error || "Échec de l'authentification");
      }
      
      localStorage.setItem('ss_session', JSON.stringify(data));
      onLogin(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden bg-[#141414]">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bca1-0746f9074b4b/da9a8803-20ed-445d-97c3-09974171b743/FR-fr-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg)' }}>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="absolute top-8 left-8 md:left-12">
        <h1 className="text-3xl md:text-5xl font-black text-[#e50914] tracking-tighter uppercase">BROKHOMETV</h1>
      </div>

      <div className="relative z-10 w-full max-w-[450px] p-6 sm:p-16 bg-black/75 rounded-md shadow-2xl">
        <h2 className="text-3xl font-bold mb-8 text-white">{isRegistering ? 'S\'inscrire' : 'S\'identifier'}</h2>
        
        {error && <div className="bg-red-600/20 text-red-500 p-3 rounded mb-6 text-sm border border-red-600/50">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#333] border-none rounded p-4 text-white focus:bg-[#444] outline-none transition-all text-sm"
            />
          </div>
          <div className="relative">
            <input 
              type="password" 
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#333] border-none rounded p-4 text-white focus:bg-[#444] outline-none transition-all text-sm"
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#e50914] py-4 rounded font-bold text-lg hover:bg-[#b20710] disabled:opacity-50 transition-colors shadow-lg uppercase"
          >
            {isLoading ? 'Chargement...' : (isRegistering ? 'Rejoindre l\'aventure' : 'Commencer à regarder')}
          </button>
          
          {!isRegistering && (
            <button 
              type="button"
              disabled={isLoading}
              onClick={handleGuestLogin}
              className="w-full mt-3 bg-transparent border-2 border-white/10 hover:border-white/25 hover:bg-white/[0.02] text-white py-3.5 rounded font-black text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 italic"
            >
              🎭 Continuer en tant qu'invité
            </button>
          )}
        </form>

        <p className="mt-8 text-center text-gray-400 text-sm">
          {isRegistering ? 'Vous avez déjà un compte ?' : 'Nouveau sur BrokHomeTV ?'}
          <button 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="ml-2 text-white font-bold hover:underline"
          >
            {isRegistering ? 'Se connecter' : 'S\'inscrire maintenant'}
          </button>
        </p>
      </div>
    </div>
  );
};
