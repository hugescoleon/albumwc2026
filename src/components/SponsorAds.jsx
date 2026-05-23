import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Clock } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const SponsorLogos = ({ sponsors = [] }) => {
  if (sponsors.length === 0) return null;
  
  return (
    <div className="w-full py-6 mt-6 border-t border-white/5 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap px-6">
        {sponsors.map(sponsor => (
          <a 
            key={sponsor.id} 
            href={sponsor.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group relative"
          >
            <div className="bg-white px-6 py-3 rounded-xl flex items-center justify-center h-14 w-28 sm:w-32 shadow-lg group-hover:scale-110 transition-all duration-300">
              <img 
                src={sponsor.logo} 
                alt={sponsor.name} 
                className="h-full w-full object-contain" 
              />
            </div>
            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform rounded-full" />
          </a>
        ))}
      </div>
    </div>
  );
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`
    : url;
};

export const InterstitialAd = ({ isOpen, onClose, adConfig }) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [canClose, setCanClose] = useState(true);

  const forceCountdown = adConfig?.forceCountdown || false;

  useEffect(() => {
    if (!isOpen) return;

    if (forceCountdown) {
      setSecondsLeft(5);
      setCanClose(false);
      
      const interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCanClose(true);
      setSecondsLeft(0);
    }
  }, [isOpen, forceCountdown]);

  if (!isOpen || !adConfig) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/85 animate-in fade-in duration-200">
      <div className="max-w-sm w-full relative">
        {canClose ? (
          <button 
            onClick={onClose}
            className="absolute -top-12 right-0 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10 animate-in zoom-in duration-200"
          >
            <X size={24} />
          </button>
        ) : (
          <div className="absolute -top-12 right-0 px-3 h-10 bg-black/60 border border-white/10 rounded-full flex items-center gap-1.5 text-[10px] font-black text-gold/90 uppercase tracking-widest shrink-0 select-none">
            <Clock size={12} className="animate-spin text-gold" />
            <span>{secondsLeft}s</span>
          </div>
        )}

        <GlassCard variant="gold" className="overflow-hidden border-gold/50 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
          {adConfig.video_url ? (
            <div className="w-full h-48 sm:h-56 relative overflow-hidden bg-black pointer-events-none">
              <iframe
                className="absolute w-full h-[calc(100%+120px)] -top-[60px]"
                src={getYouTubeEmbedUrl(adConfig.video_url)}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            adConfig.image && <img src={adConfig.image} className="w-full h-48 sm:h-56 object-cover" alt="" />
          )}
          <div className="p-6 space-y-4">
            <div className="inline-block px-2 py-0.5 bg-gold/20 border border-gold/50 rounded text-[10px] font-bold text-gold uppercase tracking-widest">
              Patrocinado
            </div>
            <h3 className="text-xl font-black text-white leading-tight uppercase italic">{adConfig.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{adConfig.description}</p>
            
            <a 
              href={adConfig.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gold hover:bg-gold-light text-dark font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-xl cursor-pointer"
            >
              {adConfig.buttonText} <ExternalLink size={16} />
            </a>

            {canClose ? (
              <button 
                onClick={onClose}
                className="w-full text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest pt-2 transition-colors"
              >
                Cerrar anuncio
              </button>
            ) : (
              <div className="w-full text-gray-600 text-xs font-bold uppercase tracking-widest text-center pt-2 select-none">
                Cerrar en {secondsLeft}s
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
