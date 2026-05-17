import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Trophy, User as UserIcon, Mail, Lock, Loader2, ArrowLeft, Phone, MapPin, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';

const COUNTRIES = [
  'Guatemala',
  'Costa Rica',
  'El Salvador',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Colombia',
  'Ecuador',
  'Perú',
  'Estados Unidos',
  'España',
  'Argentina',
  'Chile'
];

const GUATEMALA_DEPARTMENTS = [
  'Guatemala',
  'Alta Verapaz',
  'Baja Verapaz',
  'Chimaltenango',
  'Chiquimula',
  'El Progreso',
  'Escuintla',
  'Huehuetenango',
  'Izabal',
  'Jalapa',
  'Jutiapa',
  'Petén',
  'Quetzaltenango',
  'Quiché',
  'Retalhuleu',
  'Sacatepéquez',
  'San Marcos',
  'Santa Rosa',
  'Sololá',
  'Suchitepéquez',
  'Totonicapán',
  'Zacapa'
];

export const Login = ({ onLogin, onAdminLogin, onShowCredits }) => {
  const [error, setError] = useState('');
  const [guestCode, setGuestCode] = useState('');
  
  // Toggle Views
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Email Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register States
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+502 ');
  const [regEmail, setRegEmail] = useState('');
  const [regDept, setRegDept] = useState('Guatemala');
  const [regCountry, setRegCountry] = useState('Guatemala');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regUseWhatsapp, setRegUseWhatsapp] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [loading, setLoading] = useState(false);

  const handleCountryChange = (val) => {
    setRegCountry(val);
    if (val === 'Guatemala') {
      setRegDept('Guatemala');
    } else {
      setRegDept('');
    }
  };

  const handlePhoneChange = (val) => {
    if (val.length < 5) {
      setRegPhone(val);
      return;
    }

    if (!val.startsWith('+502')) {
      setRegPhone(val);
      return;
    }

    const prefix = '+502 ';
    const suffix = val.substring(5).replace(/[-\s]/g, '');

    if (suffix.length > 4) {
      setRegPhone(`${prefix}${suffix.substring(0, 4)}-${suffix.substring(4)}`);
    } else {
      setRegPhone(`${prefix}${suffix}`);
    }
  };

  const generateCollectorCode = () => {
    return 'FWC-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const handleGuestLogin = async () => {
    if (!guestCode.trim()) {
      setError('Por favor ingresa un código');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setLoading(true);
    try {
      await onLogin('USER', guestCode.trim());
    } catch (err) {
      setError(err.message || 'Código no encontrado');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Ingresa correo y contraseña');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (authError) throw authError;

      onAdminLogin(data.user);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Honeypot bot protection
    if (honeypot) {
      console.warn('Bot registration blocked.');
      setError('Error al procesar el registro. Intente más tarde.');
      return;
    }
    
    if (!regName.trim() || !regPhone.trim() || !regEmail.trim() || !regDept.trim() || !regCountry.trim() || !regPassword.trim()) {
      setError('Completa todos los campos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Las contraseñas no coinciden');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (regPassword.length < 6) {
      setError('La contraseña debe tener mínimo 6 caracteres');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanEmail = regEmail.trim().toLowerCase();

      // 1. Sign up user in Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: regPassword,
      });

      if (authError) throw authError;

      if (!data.user) {
        throw new Error('Error al registrar usuario');
      }

      // 2. Insert profile metadata into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          display_name: regName.trim(),
          phone: regPhone.trim(),
          email: cleanEmail,
          department: regDept.trim(),
          country: regCountry.trim(),
          collector_code: generateCollectorCode(),
          use_whatsapp: regUseWhatsapp,
          created_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // 3. Auto login admin/collector session
      onAdminLogin(data.user);
    } catch (err) {
      setError(err.message || 'Error al registrarse');
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-green/20 via-dark to-dark">
      <GlassCard className={`w-full ${isRegistering ? 'max-w-xl' : 'max-w-md'} p-8 text-center space-y-8 border-gold/20 relative transition-all duration-300`}>
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white text-[10px] font-black py-2 px-4 rounded-full shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
            {error}
          </div>
        )}

        {/* Dynamic Header */}
        {!showEmailLogin ? (
          <>
            <div className="relative inline-block">
              <div className="absolute inset-0 blur-2xl bg-gold/20 rounded-full animate-pulse"></div>
              <div className="relative bg-dark border border-gold/50 p-6 rounded-3xl">
                <Trophy size={64} className="text-gold" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white tracking-tighter leading-tight uppercase">
                WORLD CUP <br />
                <span className="text-gold">COLLECTOR HUB</span>
              </h1>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Gestor de Colección Profesional</p>
            </div>

            <div className="space-y-4">
              {/* Trigger Email/Password Form */}
              <button 
                onClick={() => setShowEmailLogin(true)}
                className="w-full bg-gold hover:bg-gold/90 text-dark font-black py-4 rounded-2xl text-lg flex flex-col items-center justify-center gap-1 shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-all active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <Trophy size={20} />
                  <span>SOY COLECCIONISTA</span>
                </div>
                <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Ingresar / Crear Cuenta</span>
              </button>

              <div className="h-[1px] bg-white/10 my-6 flex items-center justify-center">
                <span className="bg-dark px-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center">O visita una colección</span>
              </div>

              {/* Guest Role with Code */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input 
                    type="text"
                    placeholder="Código de Coleccionista..."
                    value={guestCode}
                    onChange={(e) => setGuestCode(e.target.value.toUpperCase())}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-gold/50 transition-all uppercase placeholder:normal-case"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleGuestLogin();
                      }
                    }}
                  />
                </div>
                <button 
                  onClick={handleGuestLogin}
                  disabled={loading || !guestCode.trim()}
                  className="h-[46px] w-[46px] bg-gold hover:bg-gold-light text-dark font-black rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:hover:bg-gold shrink-0 cursor-pointer"
                  title="Ver Repetidas (Invitado)"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Email Auth Card (Login or Register) */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 text-left">
            <button 
              onClick={() => {
                setShowEmailLogin(false);
                setIsRegistering(false);
                setError('');
              }}
              className="flex items-center gap-2 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors mb-2"
            >
              <ArrowLeft size={16} />
              <span>Volver</span>
            </button>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                {isRegistering ? 'Crear Cuenta' : 'Acceso Coleccionista'}
              </h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                {isRegistering ? 'Regístrate para guardar tu colección en la nube' : 'Ingresa con tus credenciales de Supabase'}
              </p>
            </div>

            {!isRegistering ? (
              /* LOGIN FORM */
              <form onSubmit={handleEmailLogin} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all text-sm"
                      placeholder="ejemplo@correo.com"
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
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold hover:bg-gold-light disabled:bg-gray-800 disabled:text-gray-600 text-dark py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-6 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'INICIAR SESIÓN'}
                </button>

                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="text-gold hover:text-gold-light text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    ¿No tienes cuenta? Regístrate aquí
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTRATION FORM (Nombre, Teléfono, Correo, Departamento, País, Contraseñas) */
              <form onSubmit={handleRegister} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Nombre y Apellido</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all text-xs"
                        placeholder="Juan Pérez"
                      />
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Teléfono / Celular</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all text-xs"
                        placeholder="+502 1234 5678"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Checkbox */}
                  <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-3 text-left">
                    <input 
                      type="checkbox"
                      id="regUseWhatsapp"
                      checked={regUseWhatsapp}
                      onChange={(e) => setRegUseWhatsapp(e.target.checked)}
                      className="mt-0.5 accent-gold cursor-pointer scale-110"
                    />
                    <label htmlFor="regUseWhatsapp" className="cursor-pointer select-none">
                      <span className="block text-[10px] font-black text-white uppercase tracking-wider">Usar también para WhatsApp (Opcional)</span>
                      <span className="block text-[9px] text-gray-500 font-bold leading-normal mt-0.5">
                        Si aceptas, podrás recibir descuentos y promociones directamente en tu WhatsApp.
                      </span>
                    </label>
                  </div>

                  {/* Correo */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all text-xs"
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                  </div>

                  {/* País */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">País</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <select
                        required
                        value={regCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full bg-[#18181b] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all text-xs cursor-pointer"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c} value={c} className="bg-[#18181b] text-white">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Departamento */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Departamento / Estado</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      {regCountry === 'Guatemala' ? (
                        <select
                          required
                          value={regDept}
                          onChange={(e) => setRegDept(e.target.value)}
                          className="w-full bg-[#18181b] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all text-xs cursor-pointer"
                        >
                          {GUATEMALA_DEPARTMENTS.map(d => (
                            <option key={d} value={d} className="bg-[#18181b] text-white">{d}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type="text"
                          required
                          value={regDept}
                          onChange={(e) => setRegDept(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all text-xs"
                          placeholder="Departamento / Estado"
                        />
                      )}
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all text-xs"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* Confirmar Contraseña */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all text-xs"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                {/* Instrucciones de contraseña */}
                <div className="text-[10px] text-gray-500 font-bold leading-normal bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <span className="text-xs">🔒</span>
                  <span>Mínimo 6 caracteres (letras y números). No se requieren caracteres especiales.</span>
                </div>

                {/* Honeypot field - Invisible to humans, bait for bots */}
                <div className="hidden" aria-hidden="true">
                  <input 
                    type="text" 
                    name="website" 
                    value={honeypot} 
                    onChange={(e) => setHoneypot(e.target.value)} 
                    tabIndex="-1" 
                    autoComplete="off" 
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold hover:bg-gold-light disabled:bg-gray-800 disabled:text-gray-600 text-dark py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-6 shadow-[0_0_20px_rgba(212,175,55,0.15)] animate-in fade-in"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'REGISTRARME Y EMPEZAR'}
                </button>

                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-gold hover:text-gold-light text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    ¿Ya tienes cuenta? Inicia Sesión
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <p className="text-[9px] text-gray-600 uppercase tracking-[0.2em] pt-4 select-none">
          Acepto compartir mis datos para uso exclusivo de la app
        </p>
        
        <button 
          onClick={onShowCredits}
          className="mt-6 text-[10px] text-gray-500 hover:text-gold uppercase tracking-widest font-black transition-all underline decoration-white/10 hover:decoration-gold underline-offset-4 cursor-pointer bg-transparent border-none p-0 outline-none block mx-auto"
        >
          ℹ️ Soporte y Contacto
        </button>
      </GlassCard>
    </div>
  );
};
