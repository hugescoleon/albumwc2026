import React from 'react';
import { Plus, Minus, CheckCircle2, Ban } from 'lucide-react';
import { clsx } from 'clsx';
import { getSectionTheme } from '../utils/albumUtils';

export const StickerCard = React.memo(({ id = "", data, onToggle, onUpdateStock, role, name, hideControls = false }) => {
  const [showConfirm, setShowConfirm] = React.useState(false);
  const inAlbum = data?.inAlbum || false;
  const stock = data?.stock || 0;
  
  // CRITICAL SAFETY FIX: Ensure ID exists before splitting
  const safeId = typeof id === 'string' ? id : '';
  const [prefix = "?", num = "?"] = safeId.split('-');
  
  const isAdmin = role === 'ADMIN';
  const theme = getSectionTheme(prefix);
  const pureColor = theme?.color?.includes('[') ? theme.color.split('[')[1].split(']')[0] : '#D4AF37';

  const handleToggle = () => {
    if (!isAdmin) return; // Guest can't toggle
    if (inAlbum) {
      setShowConfirm(true);
    } else {
      onToggle(id);
    }
  };

  const confirmAction = (e) => {
    e.stopPropagation();
    onToggle(id);
    setShowConfirm(false);
  };

  const cancelAction = (e) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <div className={clsx(
      "relative group rounded-2xl overflow-hidden transition-all duration-300 border-2 flex flex-col",
      inAlbum 
        ? "bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
        : "bg-white/5 border-white/10 hover:border-white/20",
      !isAdmin && "cursor-default"
    )}>
      {/* Interaction Area */}
      <div 
        onClick={handleToggle}
        className={clsx(
          "aspect-square relative flex items-center justify-center",
          isAdmin ? "cursor-pointer" : "cursor-default"
        )}
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity text-white">
          {!inAlbum ? (
            <Ban size={80} strokeWidth={1.5} className="opacity-40" />
          ) : (
            <CheckCircle2 size={80} strokeWidth={1.5} className="opacity-20" />
          )}
        </div>

        {/* Sticker Number and Team ID */}
        <div className="relative z-10 flex flex-col items-center leading-none text-center px-1">
          <span 
            className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 drop-shadow-sm"
            style={{ color: pureColor }}
          >
            {prefix}
          </span>
          <span className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] mb-1">
            {num}
          </span>
          {name && (
            <span className="text-[9px] font-black text-white/60 uppercase tracking-tighter line-clamp-2 leading-tight drop-shadow-sm max-w-[80%]">
              {name}
            </span>
          )}
        </div>

        {/* Status Icon Overlay */}
        <div className="absolute top-1.5 right-1.5 z-20">
          {inAlbum ? (
            <CheckCircle2 size={16} className="text-green-500 fill-green-500/20 drop-shadow-lg" />
          ) : (
            <div className="w-3.5 h-3.5 rounded-full border border-white/10" />
          )}
        </div>

        {/* Stock Label */}
        {stock > 0 && (
          <div className="absolute top-1.5 left-1.5 z-20 bg-gold text-dark px-1.5 py-0.5 rounded-md text-[9px] font-black shadow-lg">
            x{stock}
          </div>
        )}

        {/* Custom Confirmation Overlay */}
        {showConfirm && (
          <div className="absolute inset-0 z-50 bg-dark/90 backdrop-blur-sm flex flex-col items-center justify-center p-2 animate-in fade-in zoom-in duration-200">
            <span className="text-[10px] font-black text-white uppercase mb-3 tracking-tighter text-center">
              ¿Quitar del álbum?
            </span>
            <div className="flex gap-2 w-full px-2">
              <button 
                onClick={confirmAction}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black py-2 rounded-lg transition-colors"
              >
                SÍ
              </button>
              <button 
                onClick={cancelAction}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black py-2 rounded-lg transition-colors"
              >
                NO
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stock Controls (Only for Admin) */}
      {isAdmin && !hideControls ? (
        <div className="bg-black/60 backdrop-blur-md border-t border-white/10 px-2 py-1.5 flex items-center justify-between">
          <button 
            onClick={(e) => { e.stopPropagation(); onUpdateStock(id, -1); }}
            className="p-1 hover:text-red-500 transition-colors text-gray-500"
            disabled={stock === 0}
          >
            <Minus size={14} />
          </button>
          
          <span className={clsx(
            "text-[11px] font-black",
            stock > 0 ? "text-gold" : "text-gray-600"
          )}>
            {stock}
          </span>

          <button 
            onClick={(e) => { e.stopPropagation(); onUpdateStock(id, 1); }}
            className="p-1 hover:text-green-500 transition-colors text-gray-500"
          >
            <Plus size={14} />
          </button>
        </div>
      ) : (
        stock > 0 && (
          <div className="bg-black/40 border-t border-white/5 px-2 py-1 flex items-center justify-center">
            <span className="text-[9px] font-bold text-gold uppercase tracking-widest">
              {stock} Disponibles
            </span>
          </div>
        )
      )}
    </div>
  );
});
