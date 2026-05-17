import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, ClipboardList, Package } from 'lucide-react';
import { albumData } from '../data/albumData';
import { getSectionTheme, getSectionStickerIds, getStickerDisplayNum } from '../utils/albumUtils';

export const ChecklistModal = ({ stickers = {}, mode = 'missing', user, onClose, appName, sponsors = [] }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div id="checklist-modal-portal" className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-0 sm:p-4 md:p-8 print:bg-white print:backdrop-blur-none print:overflow-visible">
      <div className="bg-white w-full max-w-5xl my-0 sm:my-8 sm:rounded-[2.5rem] shadow-2xl flex flex-col relative print:static print:shadow-none print:my-0 print:rounded-none">
        
        {/* Modal Header - Compact & Sticky */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 sticky top-0 bg-[#fef9c3] z-20 sm:rounded-t-[2.5rem] print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shrink-0">
              {mode === 'repeated' ? <Package size={20} className="text-gold" /> : <ClipboardList size={20} />}
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-tighter italic leading-tight">
                {mode === 'repeated' ? 'En Venta o Intercambio' : 'Faltantes / Por Comprar'}
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {mode === 'repeated' ? 'Plantilla de Ventas / Intercambio' : (appName || 'World Cup 2026')}
              </p>
              {user && (
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-wider mt-0.5 leading-none">
                  {user.displayName} • CÓDIGO: {user.collectorCode}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl transition-all flex items-center gap-2 text-[11px] font-black uppercase tracking-wider"
            >
              <Printer size={16} /> <span className="hidden xs:inline">Imprimir</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Plantilla Content */}
        <div id="printable-checklist" className="p-6 sm:p-10 md:p-12 space-y-10 bg-white text-black min-h-screen print:min-h-0 print:p-0 print:space-y-1">
          
          {/* Print Header - Ultra compact */}
          <div className="flex items-end justify-between border-b-[2px] border-black pb-3 print:pb-1 print:border-b relative">
            <div className="space-y-0.5">
              <h1 className="text-4xl font-black uppercase leading-[0.8] tracking-tighter print:text-lg">
                {mode === 'repeated' ? 'En Venta o Intercambio' : 'Faltantes / Por Comprar'}
              </h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] italic print:text-[6.5px]">
                {mode === 'repeated' ? 'Mundial 2026 - Mis Repetidas' : 'Mundial 2026 - Mi Progreso'}
              </p>
            </div>

            {/* Sponsor Logos - Centered, larger, and solid black */}
            <div className="hidden print:flex absolute left-1/2 -translate-x-1/2 bottom-0.5 items-end justify-center gap-4">
              {sponsors.map(s => (
                <img 
                  key={s.id} 
                  src={s.logo} 
                  className="h-5 object-contain" 
                  style={{ filter: 'brightness(0)' }} 
                  alt={s.name} 
                />
              ))}
            </div>

            <div className="text-right hidden sm:block print:block">
              <div className="text-5xl font-black italic text-gray-100 select-none leading-none tracking-tighter print:text-xl print:text-gray-200">#2026</div>
              {user && (
                <div className="mt-1 text-right">
                  <div className="text-[10px] font-black uppercase tracking-tight text-gray-900 print:text-[7.5px] leading-tight">
                    {user.displayName}
                  </div>
                  {user.collectorCode && (
                    <div className="text-[9px] font-black uppercase tracking-widest text-gold print:text-[6px] print:text-gray-500 leading-tight">
                      CÓDIGO: {user.collectorCode}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Grid Layout - 3 columns for print */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-6 print:grid-cols-3 print:gap-x-4 print:gap-y-1.5 print:text-[7.5px]">
            {albumData.sections.map(section => {
              const theme = getSectionTheme(section.id);
              return (
                <div key={section.id} className="break-inside-avoid-page flex flex-wrap items-center gap-x-1 gap-y-0.5 border-b border-gray-100/50 pb-1 print:pb-0.5">
                  <div className="flex items-center gap-1 shrink-0 print:mb-0.5">
                    <div className="px-1 py-0.5 bg-black text-white text-[8px] font-black rounded-sm print:text-[5.5px]">
                      {section.id}
                    </div>
                    <span className="font-black uppercase text-[9px] tracking-tight text-gray-900 print:text-[7.5px]">{section.name}:</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 print:gap-0.5 print:contents">
                    {getSectionStickerIds(section.id, section.total).map(id => {
                      const num = getStickerDisplayNum(id);
                      const data = stickers[id] || {};
                      
                      // In repeated mode, active means we have stock > 0
                      // In missing mode, active means we do NOT have it in album (!inAlbum)
                      const isActive = mode === 'repeated' 
                        ? data.stock > 0 
                        : !data.inAlbum;
                      
                      return (
                        <div 
                          key={id}
                          className={`
                            w-6 h-6 flex items-center justify-center text-[9px] font-bold rounded-sm border transition-all
                            print:w-[14px] print:h-[14px] print:text-[6px] print:mb-0.5
                            ${isActive 
                              ? 'bg-white text-black border-black/40 shadow-sm font-black' 
                              : 'bg-gray-50 text-gray-200 border-gray-50'
                            }
                          `}
                        >
                          {num}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <footer className="mt-8 pt-4 border-t border-gray-100 text-center print:mt-1 print:pt-1 print:border-t-0">
            <div className="flex flex-col items-center gap-0.5">
              <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] print:text-[5px]">
                {new Date().toLocaleDateString()} - {appName || 'WORLD CUP COLLECTOR'}
              </p>
              <p className="hidden print:block text-[5px] font-bold text-gray-400 uppercase tracking-widest">
                Desarrollado por <span className="font-black text-red-600">KOI</span> <span className="text-black">software</span>
              </p>
            </div>
          </footer>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: letter portrait; margin: 8mm; }
          #root { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          #checklist-modal-portal { 
            position: static !important; 
            display: block !important; 
            background: white !important; 
            padding: 0 !important;
            backdrop-filter: none !important;
          }
          #printable-checklist { width: 100% !important; margin: 0 !important; padding: 0 !important; }
          #printable-checklist * { visibility: visible !important; -webkit-print-color-adjust: exact !important; }
          #printable-checklist .grid { 
            display: grid !important; 
            grid-template-columns: repeat(3, 1fr) !important; 
            gap: 8px 12px !important; 
          }
          .print\\:hidden { display: none !important; }
        }
      `}} />
    </div>
  );

  return createPortal(modalContent, document.body);
};
