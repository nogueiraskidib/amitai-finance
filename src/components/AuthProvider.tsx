'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from './Sidebar';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError('E-mail ou senha incorretos.');
    }
    setAuthLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen w-full bg-brand-bg flex items-center justify-center p-4">
        <div className="glass-card w-full max-w-md p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Amitai <span className="text-brand-primary">Finance</span></h1>
            <p className="text-brand-muted mt-2">Acesso restrito para sócios.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-2">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-2">Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {authError && <p className="text-brand-danger text-sm">{authError}</p>}

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
            >
              {authLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-brand-bg text-brand-text">
      <Sidebar />
      <main className="flex-1 w-full flex flex-col overflow-x-hidden p-6 md:p-10 custom-scrollbar h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
