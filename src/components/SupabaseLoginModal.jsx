import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard } from './GlassCard';
import { User, Lock, Mail, X, Loader2, AlertCircle } from 'lucide-react';

export const SupabaseLoginModal = ({ onLoginSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // BACKDOOR FOR TEST MODE
      if (email === 'hugoescobarleon@gmail.com' && password === 'hugo2026') {
        onLoginSuccess({ email: 'hugoescobarleon@gmail.com', id: 'hugo-admin-id' });
        onClose();
        return;
      }
      if (email === 'admin@admin.com' && password === 'admin123') {
        onLoginSuccess({ email: 'admin@admin.com', id: 'test-admin-id' });
        onClose();
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if user is admin (optional: you can use app_metadata or a specific table)
      // For now, we'll assume successful login to Supabase means you're an authorized admin
      // since the RLS will protect the data anyway.
      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/85">
      <GlassCard className="max-w-md w-full p-8 space-y-6 border-gold/30">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold border border-gold/30">
            <Lock size={24} />
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Acceso Administrativo</h3>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Inicie sesión para gestionar la plataforma</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0" size={18} />
            <p className="text-xs text-red-200 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all"
                placeholder="admin@ejemplo.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-light disabled:bg-gray-800 disabled:text-gray-600 text-dark py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-[9px] text-gray-600 font-bold uppercase tracking-widest italic">
          Protegido por Supabase Auth & RLS
        </p>
      </GlassCard>
    </div>
  );
};
