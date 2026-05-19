import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard } from './GlassCard';
import { Save, Image as ImageIcon, Type, Target, Plus, Trash2, X, Users, Search, Eye, Copy, Check } from 'lucide-react';
import { albumData } from '../data/albumData';
import { getSectionStickerIds } from '../utils/albumUtils';

export const AdminSettings = ({ config, onUpdate, onClose }) => {
  const [localConfig, setLocalConfig] = useState({
    ...config,
    sponsors: config?.sponsors || [],
    popupAd: {
      frequency: 5,
      ads: [],
      ...(config?.popupAd || {})
    }
  });

  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'users'
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [copiedUserId, setCopiedUserId] = useState(null);

  const handleCopyLink = (code, id) => {
    const link = `${window.location.origin}/?code=${code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedUserId(id);
      setTimeout(() => setCopiedUserId(null), 2000);
    });
  };

  const handleViewCollection = (code) => {
    window.open(`${window.location.origin}/?code=${code}`, '_blank');
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const itemsPerPage = 25;
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });
        
      if (searchTerm.trim() !== '') {
        const term = `%${searchTerm.trim()}%`;
        query = query.or(`display_name.ilike.${term},email.ilike.${term},collector_code.ilike.${term}`);
      }
      
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (!error && data) {
        setUsers(data);
        setTotalUsersCount(count || 0);
      }
    } catch (err) {
      console.error("Error fetching users list:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, currentPage, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const [stickerFilter, setStickerFilter] = useState('');
  const totalPages = Math.ceil(totalUsersCount / 25) || 1;

  const handleSave = () => {
    onUpdate(localConfig);
    onClose();
  };

  const handleFileUpload = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Base64 storage
        alert('La imagen es muy pesada. Máximo 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSponsor = (id, field, value) => {
    setLocalConfig(prev => ({
      ...prev,
      sponsors: prev.sponsors.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const addSponsor = () => {
    const newId = Math.max(...localConfig.sponsors.map(s => s.id), 0) + 1;
    setLocalConfig(prev => ({
      ...prev,
      sponsors: [...prev.sponsors, { id: newId, name: 'Nuevo Sponsor', logo: '', url: '#' }]
    }));
  };

  const removeSponsor = (id) => {
    setLocalConfig(prev => ({
      ...prev,
      sponsors: prev.sponsors.filter(s => s.id !== id)
    }));
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-8 pb-24">
        <header className="flex items-center justify-between sticky top-0 bg-black/50 py-4 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-dark font-black">SA</div>
            <h2 className="text-xl font-black text-white italic uppercase">SUPER ADMIN PANEL</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white">
            <X size={24} />
          </button>
        </header>

        {/* TABS SELECTOR */}
        <div className="flex gap-2 border-b border-white/5 pb-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              activeTab === 'config' 
                ? 'bg-gold text-dark font-black shadow-[0_2px_10px_rgba(212,175,55,0.2)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Ajustes de Plataforma
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users' 
                ? 'bg-gold text-dark font-black shadow-[0_2px_10px_rgba(212,175,55,0.2)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={14} />
            Usuarios Registrados
          </button>
        </div>

        {activeTab === 'config' ? (
          <>
            {/* APP BRANDING */}
            <section className="space-y-4">
          <div className="flex items-center gap-2 text-gold">
            <Type size={18} />
            <h3 className="text-xs font-black uppercase tracking-widest">Identidad de Marca</h3>
          </div>
          <GlassCard className="p-6 space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Nombre de la App</label>
              <input 
                value={localConfig.appName}
                onChange={e => setLocalConfig(prev => ({ ...prev, appName: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gold/50 outline-none"
              />
            </div>
            <div className="border-t border-white/5 pt-4">
              <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block">Logotipo de la App (Opcional)</label>
              <div className="flex items-center gap-4">
                {localConfig.appLogo ? (
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center p-1 border border-white/10 shrink-0">
                    <img src={localConfig.appLogo} className="max-w-full max-h-full object-contain" alt="Logo preview" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-center shrink-0 select-none p-1">
                    <span className="text-[8px] text-gray-500 font-black uppercase tracking-tighter leading-none">NO LOGO</span>
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <input 
                    value={localConfig.appLogo || ''}
                    onChange={e => setLocalConfig(prev => ({ ...prev, appLogo: e.target.value || null }))}
                    placeholder="URL del Logo (https://...)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-gold/30"
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, (base64) => setLocalConfig(prev => ({ ...prev, appLogo: base64 })))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <button className="w-full bg-white/5 hover:bg-white/10 text-[9px] font-black py-2 rounded-lg border border-dashed border-white/20 flex items-center justify-center gap-2 transition-all">
                        <ImageIcon size={12} /> SUBIR LOGO (LOCAL)
                      </button>
                    </div>
                    {localConfig.appLogo && (
                      <button 
                        onClick={() => setLocalConfig(prev => ({ ...prev, appLogo: null }))}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[9px] font-black px-3 py-2 rounded-lg border border-red-500/20 transition-all"
                      >
                        REMOVER
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* DEVELOPER DETAILS (KOI) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-gold">
            <Users size={18} />
            <h3 className="text-xs font-black uppercase tracking-widest">Contacto y Desarrollador (KOI)</h3>
          </div>
          <GlassCard className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">WhatsApp de Consultas (Ej: 50245885656)</label>
                <input 
                  value={localConfig.developerDetails?.whatsapp || ''}
                  placeholder="50245885656"
                  onChange={e => setLocalConfig(prev => ({
                    ...prev,
                    developerDetails: {
                      ...(prev.developerDetails || {}),
                      whatsapp: e.target.value
                    }
                  }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-gold/50 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">WhatsApp Visual (Ej: +502 4588-5656)</label>
                <input 
                  value={localConfig.developerDetails?.whatsappDisplay || ''}
                  placeholder="+502 4588-5656"
                  onChange={e => setLocalConfig(prev => ({
                    ...prev,
                    developerDetails: {
                      ...(prev.developerDetails || {}),
                      whatsappDisplay: e.target.value
                    }
                  }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-gold/50 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Correo de Contacto (Ej: info@koisoftware.com)</label>
              <input 
                value={localConfig.developerDetails?.email || ''}
                placeholder="info@koisoftware.com"
                onChange={e => setLocalConfig(prev => ({
                  ...prev,
                  developerDetails: {
                    ...(prev.developerDetails || {}),
                    email: e.target.value
                  }
                }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-gold/50 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Slogan / Descripción de KOI</label>
              <textarea 
                value={localConfig.developerDetails?.aboutText || ''}
                placeholder="Elevamos ideas innovadoras a experiencias de software premium..."
                rows="2"
                onChange={e => setLocalConfig(prev => ({
                  ...prev,
                  developerDetails: {
                    ...(prev.developerDetails || {}),
                    aboutText: e.target.value
                  }
                }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-gold/50 outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Texto de Agradecimientos</label>
              <textarea 
                value={localConfig.developerDetails?.thanksText || ''}
                placeholder="Nuestro más sincero agradecimiento a los patrocinadores..."
                rows="3"
                onChange={e => setLocalConfig(prev => ({
                  ...prev,
                  developerDetails: {
                    ...(prev.developerDetails || {}),
                    thanksText: e.target.value
                  }
                }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-gold/50 outline-none resize-none"
              />
            </div>
          </GlassCard>
        </section>

        {/* POPUP ADS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gold">
              <Target size={18} />
              <h3 className="text-xs font-black uppercase tracking-widest">Ventanas Emergentes (Ads)</h3>
            </div>
            <button 
              onClick={() => {
                const newId = Math.max(...(localConfig.popupAd?.ads || []).map(a => a.id), 0) + 1;
                setLocalConfig(prev => ({
                  ...prev,
                  popupAd: {
                    ...prev.popupAd,
                    ads: [...(prev.popupAd?.ads || []), { id: newId, title: 'Nuevo Anuncio', image: '', buttonText: 'Saber Más', url: '#', description: '' }]
                  }
                }));
              }}
              className="text-[10px] bg-gold hover:bg-gold-light text-dark font-black px-4 py-1.5 rounded-full flex items-center gap-1 transition-all shadow-[0_2px_10px_rgba(212,175,55,0.2)] cursor-pointer"
            >
              <Plus size={12} /> AÑADIR AD
            </button>
          </div>

          <GlassCard className="p-5 space-y-4">
            <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-wider border-b border-white/5 pb-2">Configuración de Disparadores</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {/* Clicks Frequency */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-bold uppercase block">Frecuencia por Clics</label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <span className="text-[10px] text-gray-400">Cada</span>
                  <input 
                    type="number"
                    min="1"
                    value={localConfig.popupAd?.frequency || 5}
                    onChange={e => setLocalConfig(prev => ({ 
                      ...prev, 
                      popupAd: { ...prev.popupAd, frequency: Math.max(1, parseInt(e.target.value) || 5) } 
                    }))}
                    className="w-12 bg-transparent text-xs text-gold text-center font-bold outline-none"
                  />
                  <span className="text-[10px] text-gray-400">clics</span>
                </div>
              </div>

              {/* Time Frequency */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-bold uppercase block">Frecuencia por Tiempo</label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <span className="text-[10px] text-gray-400">Cada</span>
                  <input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={localConfig.popupAd?.timeFrequency || 0}
                    onChange={e => setLocalConfig(prev => ({ 
                      ...prev, 
                      popupAd: { ...prev.popupAd, timeFrequency: Math.max(0, parseInt(e.target.value) || 0) } 
                    }))}
                    className="w-12 bg-transparent text-xs text-gold text-center font-bold outline-none"
                  />
                  <span className="text-[10px] text-gray-400">segundos</span>
                </div>
                <p className="text-[8px] text-gray-600 font-medium leading-tight">Usa 0 para desactivar por tiempo.</p>
              </div>

              {/* Rotation Mode */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-bold uppercase block">Modo de Rotación</label>
                <select
                  value={localConfig.popupAd?.rotationMode || 'sequential'}
                  onChange={e => setLocalConfig(prev => ({
                    ...prev,
                    popupAd: { ...prev.popupAd, rotationMode: e.target.value }
                  }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer focus:border-gold/30"
                >
                  <option value="sequential" className="bg-dark text-white">Secuencial (En Orden)</option>
                  <option value="random" className="bg-dark text-white">Aleatorio</option>
                </select>
              </div>
            </div>
          </GlassCard>
          
          <div className="space-y-4">
            {localConfig.popupAd.ads.map((ad, index) => (
              <GlassCard key={ad.id} className="p-4 space-y-4 relative group">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-black text-gold uppercase tracking-tighter">ANUNCIO #{index + 1}</span>
                  <button 
                    onClick={() => {
                      setLocalConfig(prev => ({
                        ...prev,
                        popupAd: {
                          ...prev.popupAd,
                          ads: prev.popupAd.ads.filter(a => a.id !== ad.id)
                        }
                      }));
                    }}
                    className="text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Imagen del Anuncio</label>
                    <div className="flex items-center gap-3">
                      {ad.image && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
                          <img src={ad.image} className="w-full h-full object-cover" alt="" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <input 
                          value={ad.image || ''}
                          onChange={e => {
                            const newAds = localConfig.popupAd.ads.map(a => a.id === ad.id ? { ...a, image: e.target.value } : a);
                            setLocalConfig(prev => ({ ...prev, popupAd: { ...prev.popupAd, ads: newAds } }));
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-gold/30"
                          placeholder="URL de la imagen..."
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, (base64) => {
                              const newAds = localConfig.popupAd.ads.map(a => a.id === ad.id ? { ...a, image: base64 } : a);
                              setLocalConfig(prev => ({ ...prev, popupAd: { ...prev.popupAd, ads: newAds } }));
                            })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <button className="w-full bg-white/5 hover:bg-white/10 text-[9px] font-black py-2 rounded-lg border border-dashed border-white/20 flex items-center justify-center gap-2 transition-all">
                            <Plus size={12} /> SUBIR IMAGEN (LOCAL)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 border-t border-white/5 pt-2">
                    <label className="text-[9px] text-gold font-bold uppercase block mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      Video de YouTube (Opcional - Reemplaza a la imagen)
                    </label>
                    <input 
                      value={ad.video_url || ''}
                      onChange={e => {
                        const newAds = localConfig.popupAd.ads.map(a => a.id === ad.id ? { ...a, video_url: e.target.value } : a);
                        setLocalConfig(prev => ({ ...prev, popupAd: { ...prev.popupAd, ads: newAds } }));
                      }}
                      className="w-full bg-red-900/10 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-red-500/50"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Título</label>
                      <input 
                        value={ad.title}
                        onChange={e => {
                          const newAds = localConfig.popupAd.ads.map(a => a.id === ad.id ? { ...a, title: e.target.value } : a);
                          setLocalConfig(prev => ({ ...prev, popupAd: { ...prev.popupAd, ads: newAds } }));
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-gold/30"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Texto Botón</label>
                      <input 
                        value={ad.buttonText}
                        onChange={e => {
                          const newAds = localConfig.popupAd.ads.map(a => a.id === ad.id ? { ...a, buttonText: e.target.value } : a);
                          setLocalConfig(prev => ({ ...prev, popupAd: { ...prev.popupAd, ads: newAds } }));
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-gold/30"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Enlace de Destino (URL)</label>
                      <input 
                        value={ad.url || ''}
                        onChange={e => {
                          const newAds = localConfig.popupAd.ads.map(a => a.id === ad.id ? { ...a, url: e.target.value } : a);
                          setLocalConfig(prev => ({ ...prev, popupAd: { ...prev.popupAd, ads: newAds } }));
                        }}
                        placeholder="https://..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-gold/30"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Descripción Corta</label>
                    <textarea 
                      value={ad.description}
                      onChange={e => {
                        const newAds = localConfig.popupAd.ads.map(a => a.id === ad.id ? { ...a, description: e.target.value } : a);
                        setLocalConfig(prev => ({ ...prev, popupAd: { ...prev.popupAd, ads: newAds } }));
                      }}
                      rows="2"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-gold/30 resize-none"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 mt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white font-bold uppercase tracking-wider">Cierre Forzado (5 segundos)</span>
                      <span className="text-[9px] text-gray-500">Obliga al usuario a esperar 5 segundos antes de poder cerrar el anuncio</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={ad.forceCountdown || false}
                        onChange={e => {
                          const newAds = localConfig.popupAd.ads.map(a => a.id === ad.id ? { ...a, forceCountdown: e.target.checked } : a);
                          setLocalConfig(prev => ({ ...prev, popupAd: { ...prev.popupAd, ads: newAds } }));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-gold after:border-transparent after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold/20 peer-checked:border-gold/30 border border-white/5"></div>
                    </label>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* SPONSORS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gold">
              <ImageIcon size={18} />
              <h3 className="text-xs font-black uppercase tracking-widest">Patrocinadores</h3>
            </div>
            <button onClick={addSponsor} className="text-[10px] bg-white/5 hover:bg-white/10 text-white font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-all">
              <Plus size={12} /> AÑADIR
            </button>
          </div>
          
          <div className="space-y-3">
            {localConfig.sponsors.map(sponsor => (
              <GlassCard key={sponsor.id} className="p-4 space-y-3 relative group">
                <button 
                  onClick={() => removeSponsor(sponsor.id)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    value={sponsor.name}
                    onChange={e => updateSponsor(sponsor.id, 'name', e.target.value)}
                    placeholder="Nombre"
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                  <input 
                    value={sponsor.url}
                    onChange={e => updateSponsor(sponsor.id, 'url', e.target.value)}
                    placeholder="URL Web"
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center gap-3">
                      {sponsor.logo && (
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center p-1 border border-white/10">
                          <img src={sponsor.logo} className="max-w-full max-h-full object-contain" alt="" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <input 
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none"
                          value={sponsor.logo}
                          onChange={e => updateSponsor(sponsor.id, 'logo', e.target.value)}
                          placeholder="URL del Logo (https://...)"
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, (base64) => updateSponsor(sponsor.id, 'logo', base64))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <button className="w-full bg-white/5 hover:bg-white/10 text-[9px] font-black py-2 rounded-lg border border-dashed border-white/20 flex items-center justify-center gap-2 transition-all">
                            <Plus size={12} /> SUBIR LOGO (LOCAL)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* STICKER NAMES MANAGEMENT */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 text-gold">
            <Users size={18} />
            <h3 className="text-xs font-black uppercase tracking-widest">Base de Datos de Cromos</h3>
          </div>
          <GlassCard className="p-6 space-y-4">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
               <input 
                 placeholder="Filtrar por ID (ej: MEX-1) o Nombre..."
                 className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-xs outline-none focus:border-gold/30"
                 value={stickerFilter}
                 onChange={e => setStickerFilter(e.target.value)}
               />
             </div>
             
             <div className="max-h-60 overflow-y-auto space-y-1 pr-2">
                {(() => {
                  const validIds = new Set(albumData.sections.flatMap(s => getSectionStickerIds(s.id, s.total)));
                  return Object.entries(localConfig.stickerNames || {})
                    .filter(([id]) => validIds.has(id))
                    .filter(([id, name]) => 
                       id.toLowerCase().includes(stickerFilter.toLowerCase()) || 
                       name.toLowerCase().includes(stickerFilter.toLowerCase())
                    )
                    .map(([id, name]) => (
                    <div key={id} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5 group">
                      <span className="text-[10px] font-black text-gold w-14 shrink-0">{id}</span>
                      <input 
                        value={name}
                        onChange={e => {
                          const newNames = { ...localConfig.stickerNames, [id]: e.target.value };
                          setLocalConfig(prev => ({ ...prev, stickerNames: newNames }));
                        }}
                        className="flex-1 bg-transparent text-xs text-white outline-none border-b border-transparent focus:border-gold/30 transition-colors"
                      />
                    </div>
                  ));
                })()}
              </div>
              <p className="text-[9px] text-gray-600 font-bold italic">Se muestra la base de datos completa.</p>
          </GlassCard>
        </section>

            <button 
              onClick={handleSave}
              className="w-full bg-gold hover:bg-gold-light text-dark font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-2xl transition-all sticky bottom-4 z-20 cursor-pointer"
            >
              <Save size={20} /> GUARDAR CONFIGURACIÓN
            </button>
          </>
        ) : (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input 
                  placeholder="Buscar por nombre, email o código..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs outline-none focus:border-gold/30"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-xl text-center shrink-0">
                <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider block">Registrados</span>
                <span className="text-xs font-black text-gold block">{totalUsersCount} usuarios</span>
              </div>
            </div>

            <GlassCard className="p-4 overflow-hidden border-white/5">
              {usersLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Cargando coleccionistas...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="py-20 text-center text-gray-500 text-xs">
                  No se encontraron usuarios registrados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] text-gray-500 font-black uppercase tracking-wider">
                        <th className="pb-3 pr-2">Coleccionista</th>
                        <th className="pb-3 px-2">Código</th>
                        <th className="pb-3 px-2">Ubicación</th>
                        <th className="pb-3 px-2">Registro</th>
                        <th className="pb-3 pl-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((u) => {
                        const dateStr = u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A';
                        
                        return (
                          <tr key={u.id} className="text-xs hover:bg-white/5 transition-colors">
                            <td className="py-3.5 pr-2">
                              <div className="font-bold text-white leading-snug">{u.display_name || 'Sin nombre'}</div>
                              <div className="text-[10px] text-gray-500 leading-none mt-0.5">{u.email}</div>
                            </td>
                            <td className="py-3.5 px-2">
                              <span className="bg-gold/10 border border-gold/30 text-gold px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                                {u.collector_code || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3.5 px-2">
                              <div className="text-gray-400">{u.department || 'N/A'}</div>
                              <div className="text-[10px] text-gray-600 mt-0.5">{u.country || 'Guatemala'}</div>
                            </td>
                            <td className="py-3.5 px-2 text-gray-400 font-medium">
                              {dateStr}
                            </td>
                            <td className="py-3.5 pl-2 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleViewCollection(u.collector_code)}
                                  className="p-1.5 hover:bg-gold/10 rounded text-gold hover:text-gold-light transition-all cursor-pointer flex items-center justify-center"
                                  title="Ver Colección (Modo Invitado)"
                                >
                                  <Eye size={13} />
                                </button>
                                <button
                                  onClick={() => handleCopyLink(u.collector_code, u.id)}
                                  className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                                  title="Copiar Enlace de Invitado"
                                >
                                  {copiedUserId === u.id ? (
                                    <Check size={13} className="text-emerald-500" />
                                  ) : (
                                    <Copy size={13} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl px-4 py-3">
                <button
                  disabled={currentPage === 1 || usersLoading}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-black uppercase rounded-lg transition-all cursor-pointer"
                >
                  Anterior
                </button>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Página <span className="text-white font-black">{currentPage}</span> de <span className="text-white font-black">{totalPages}</span>
                </span>
                <button
                  disabled={currentPage === totalPages || usersLoading}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-black uppercase rounded-lg transition-all cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
