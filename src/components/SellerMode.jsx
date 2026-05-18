import React, { useState, useMemo } from 'react';
import { GlassCard } from './GlassCard';
import { Share2, Package, Copy, Search, CheckCircle2, ClipboardList, Grid3x3 } from 'lucide-react';
import { albumData } from '../data/albumData';
import { getSectionTheme, getSectionStickerIds, getStickerDisplayNum } from '../utils/albumUtils';
import { StickerCard } from './StickerCard';
import { ChecklistModal } from './ChecklistModal';
import { clsx } from 'clsx';

export const SellerMode = ({ stickers, user, role, stickerNames = {}, onToggle, onUpdateStock, appName, sponsors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState('repeated'); // 'repeated' or 'missing'
  const [showChecklist, setShowChecklist] = useState(false);
  const isGuest = role === 'GUEST' || role === 'USER';
  const isAdmin = role === 'ADMIN';
  const friendName = user?.displayName?.replace('Visitando a: ', '') || 'este coleccionista';

  const itemsToShow = useMemo(() => {
    // Generate all possible sticker IDs
    const allStickers = albumData.sections.flatMap(s => 
      getSectionStickerIds(s.id, s.total)
    );

    const filtered = allStickers.filter(id => {
      const data = stickers[id] || {};
      if (mode === 'repeated') return data.stock > 0;
      return !data.inAlbum;
    });

    return filtered.reduce((acc, id) => {
      const sectionId = id.split('-')[0];
      if (!acc[sectionId]) acc[sectionId] = [];
      const data = stickers[id] || {};
      const num = getStickerDisplayNum(id);
      acc[sectionId].push({ id, num, stock: data.stock || 0 });
      return acc;
    }, {});
  }, [stickers, mode]);

  const filteredSections = useMemo(() => {
    return Object.entries(itemsToShow).filter(([sectionId]) => {
      const section = albumData.sections.find(s => s.id === sectionId);
      const nameMatch = section?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const idMatch = sectionId.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || idMatch;
    });
  }, [itemsToShow, searchTerm]);

  const generateTextList = () => {
    const title = (appName || 'WORLD CUP ALBUM 2026').toUpperCase();
    const isMissingMode = mode === 'missing';
    
    let text = isMissingMode 
      ? `👋 ¡Hola! Estas son las estampitas que me *FALTAN* para mi álbum *${title}*:\n\n`
      : `👋 ¡Hola! Te comparto mi lista de *estampitas disponibles* en *${title}*:\n\n`;
    
    Object.entries(itemsToShow).forEach(([sectionId, items]) => {
      const section = albumData.sections.find(s => s.id === sectionId);
      const theme = getSectionTheme(sectionId);
      
      let flagEmoji = '⚽';
      if (theme.flag) {
        if (theme.flag === 'gb-eng') flagEmoji = '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
        else if (theme.flag === 'gb-sct') flagEmoji = '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
        else if (theme.flag.length === 2) {
          flagEmoji = theme.flag.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
        }
      }

      text += `${flagEmoji} *${section?.name || sectionId}*\n`;
      text += `└─ ${items.map(item => `*${item.num}*${!isMissingMode && item.stock > 1 ? ` (x${item.stock})` : ''}`).join(', ')}\n\n`;
    });
    
    text += `✨ _Generado desde ${appName || 'Mi Inventario'}_`;
    return text;
  };

  const shareList = () => {
    const text = generateTextList();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyList = () => {
    const text = generateTextList();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalCount = Object.values(itemsToShow).reduce((acc, items) => acc + items.length, 0);

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-in fade-in duration-300">
      {showChecklist && (
        <ChecklistModal 
          stickers={stickers} 
          mode={mode}
          user={user}
          onClose={() => setShowChecklist(false)} 
          appName={appName} 
          sponsors={sponsors}
        />
      )}

      {/* Header & Stats */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
          {mode === 'repeated' ? (
            <Package className="text-gold shrink-0" size={20} />
          ) : (
            <ClipboardList className="text-blue-400 shrink-0" size={20} />
          )}
          {mode === 'repeated' ? (
            isGuest ? `Estampas que Vende / Cambia` : 'Mi Inventario de Ventas'
          ) : (
            isGuest ? `Estampas que Necesita` : 'Mis Faltantes'
          )}
        </h2>
        <p className="text-gray-500 text-xs leading-none">
          {mode === 'repeated' ? (
            isGuest ? (
              <>Tiene <span className="text-gold font-bold">{totalCount}</span> estampas disponibles para ti.</>
            ) : (
              <>Tienes <span className="text-gold font-bold">{totalCount}</span> estampas disponibles para venta.</>
            )
          ) : (
            isGuest ? (
              <>Le faltan <span className="text-blue-400 font-bold">{totalCount}</span> estampas para completar su álbum.</>
            ) : (
              <>Te faltan <span className="text-blue-400 font-bold">{totalCount}</span> estampas por conseguir.</>
            )
          )}
        </p>
      </div>

      {/* Mode Selector - Sticky & Top */}
      <div className="sticky top-[108px] sm:top-[72px] z-30 py-1.5 bg-black/95 backdrop-blur-xl -mx-4 px-4 sm:mx-0 sm:px-0 transition-all duration-300">
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 w-full shadow-inner">
          <button 
            onClick={() => setMode('repeated')}
            className={clsx(
              "flex-1 py-2.5 px-2 sm:px-4 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest sm:tracking-[0.2em] transition-all cursor-pointer",
              mode === 'repeated' ? "bg-gold text-dark font-extrabold shadow-sm" : "text-gray-500 hover:text-gray-300"
            )}
          >
            {isGuest ? 'SUS REPETIDAS' : 'MIS REPETIDAS'}
          </button>
          <button 
            onClick={() => setMode('missing')}
            className={clsx(
              "flex-1 py-2.5 px-2 sm:px-4 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest sm:tracking-[0.2em] transition-all cursor-pointer",
              mode === 'missing' ? "bg-gold text-dark font-extrabold shadow-sm" : "text-gray-500 hover:text-gray-300"
            )}
          >
            {isGuest ? 'SUS FALTANTES (COMPRA)' : 'MIS FALTANTES'}
          </button>
        </div>
      </div>

      {/* Action Buttons Below Selector */}
      <div className="flex gap-2 w-full">
        {isAdmin && (
          <>
            <button 
              onClick={copyList}
              className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
            >
              {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <button 
              onClick={shareList}
              className="flex-1 px-3 py-2 bg-[#25D366] hover:bg-[#128C7E] rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-green-500/20 cursor-pointer select-none"
            >
              <Share2 size={14} /> WhatsApp
            </button>
          </>
        )}
        <button 
          onClick={() => setShowChecklist(true)}
          className={clsx(
            "px-4 py-2 bg-white text-dark rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all hover:bg-gold cursor-pointer select-none",
            isAdmin ? "flex-1" : "w-full"
          )}
        >
          <Grid3x3 size={14} /> Plantilla
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input 
          type="text"
          placeholder="Buscar por país o siglas (ej: MEX, Brasil)..."
          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Inventory Grid */}
      {filteredSections.length === 0 ? (
        <GlassCard className="p-12 text-center border-dashed border-white/5">
          {mode === 'repeated' ? <Package size={48} className="mx-auto mb-4 text-gray-800" /> : <CheckCircle2 size={48} className="mx-auto mb-4 text-green-900/20" />}
          <p className="text-gray-500 font-medium">
            {searchTerm 
              ? 'No se encontraron resultados para tu búsqueda.' 
              : (mode === 'repeated' ? 'No tienes estampas repetidas aún.' : '¡Felicidades! Ya completaste tu álbum.')}
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredSections.map(([sectionId, items]) => {
            const section = albumData.sections.find(s => s.id === sectionId);
            const theme = getSectionTheme(sectionId);
            const pureColor = theme.color.includes('[') ? theme.color.split('[')[1].split(']')[0] : '#D4AF37';
            
            return (
              <div 
                key={sectionId} 
                className="space-y-4"
              >
                {/* Section Header (Album Style) */}
                <div className="flex items-center gap-4 py-4 border-b border-white/5">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm border-2 shadow-2xl shrink-0"
                    style={{ backgroundColor: pureColor, borderColor: 'rgba(255,255,255,0.2)' }}
                  >
                    {sectionId}
                  </div>
                  
                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-white uppercase tracking-tight italic">
                        {section?.name || sectionId}
                      </h3>
                      {theme.g && (
                        <span className="text-[10px] font-black bg-white/5 text-gray-400 px-2 py-1 rounded-md border border-white/5 uppercase tracking-widest">
                          {theme.g.length === 1 ? `Grupo ${theme.g}` : theme.g}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-16 rounded-full shadow-sm" style={{ backgroundColor: pureColor }} />
                      <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                        {items.length} {mode === 'repeated' ? 'Disponibles' : 'Faltantes'}
                      </span>
                    </div>
                  </div>

                  {theme.flag && (
                    <div className="shrink-0 ml-2">
                      <img 
                        src={`https://flagcdn.com/w160/${theme.flag}.png`} 
                        className="w-12 h-8 object-cover rounded-lg border-2 border-white/10 shadow-lg" 
                        alt="" 
                      />
                    </div>
                  )}
                </div>

                {/* Stickers Grid */}
                <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {items.map(item => (
                    <StickerCard 
                      key={item.id} 
                      id={item.id} 
                      data={stickers[item.id]} 
                      onToggle={onToggle} 
                      onUpdateStock={onUpdateStock} 
                      role={role} 
                      name={stickerNames[item.id] || stickerNames[item.id.replace('-', '')]} 
                      hideControls={mode === 'missing'}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
