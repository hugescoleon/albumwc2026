import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, MessageCircle, Heart, Sparkles, Code } from 'lucide-react';
import { GlassCard } from './GlassCard';
import koiLogo from '../assets/koi-logo.png';

export const KoiInfoModal = ({ isOpen, onClose, developerConfig }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Hardcoded Configuration - Modificable únicamente desde el código
  const EMAIL_CONTACT = "info@koisoftware.com";
  const WHATSAPP_NUMBER = "50245885656"; // Sin + ni espacios para el link de la API
  const WHATSAPP_DISPLAY = "+502 4588-5656";
  const ABOUT_TEXT = "Elevamos ideas innovadoras a experiencias de software premium y aplicaciones a medida de alto impacto visual y tecnológico.";
  const THANKS_TEXT = "Nuestro más sincero agradecimiento a todos los patrocinadores, socios estratégicos, empresas y colaboradores de la comunidad que han depositado su confianza y apoyo incondicional en el desarrollo, pruebas y puesta en marcha de esta gran plataforma para el coleccionismo 2026.";
  const WHATSAPP_MESSAGE = encodeURIComponent("¡Hola KOI Software! Vengo desde la App Collector 2026 y me interesa conocer más sobre sus servicios de desarrollo.");

  const modalContent = (
    <div className="fixed inset-0 z-[2000] bg-black/85 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.08)_0%,_#0e0e0e_65%)] border border-white/10 rounded-3xl p-4 sm:p-6 overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-gray-400 hover:text-white transition-all duration-300 z-10"
        >
          <X size={14} />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto pr-1 space-y-3.5 scrollbar-none">
          
          {/* Header & Logo */}
          <div className="text-center pt-2 flex flex-col items-center">
            {/* Tight aspect ratio matching the wide logo card perfectly (w-32 h-12 bg-white p-1 mb-2) */}
            <div className="w-32 h-12 bg-white rounded-2xl flex items-center justify-center p-1 mb-2.5 shadow-[0_4px_25px_rgba(255,255,255,0.1)] border border-white/10 transition-transform hover:scale-105 duration-300">
              <img 
                src={koiLogo} 
                alt="KOI Software Logo" 
                className="w-full h-full object-contain select-none pointer-events-none"
              />
            </div>
            <h2 className="text-xl font-black italic tracking-widest text-white leading-none uppercase">
              KOI <span className="text-red-500">SOFTWARE</span>
            </h2>
            <p className="text-[9px] text-gray-500 font-black tracking-[0.2em] uppercase mt-1">
              Socio Tecnológico & Desarrollador
            </p>
          </div>

          {/* Core Description */}
          <div className="space-y-3 text-center">
            <p className="text-[11px] text-gray-400 leading-relaxed font-medium px-2">
              {ABOUT_TEXT}
            </p>
            
            {/* Agradecimientos / Acknowledgment Block */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-left space-y-1.5 relative overflow-hidden">
              <div className="flex items-center gap-2 text-gold">
                <Heart size={12} className="fill-gold/20 text-gold shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-wider">Agradecimientos y Apoyo</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                {THANKS_TEXT}
              </p>
            </div>
          </div>

          {/* Dynamic Grid of Badges / Supporters */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 border border-white/5 rounded-xl px-2.5 py-1.5 text-center">
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-wider block">Soporte y Hosting</span>
              <span className="text-[9px] text-white font-bold block mt-0.5">KOI Cloud Solutions</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl px-2.5 py-1.5 text-center">
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-wider block">Diseño & Frontend</span>
              <span className="text-[9px] text-white font-bold block mt-0.5">Vértice Labs</span>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="space-y-2 pt-2 text-center">
            <a 
              href={`mailto:${EMAIL_CONTACT}`}
              className="block text-gray-400 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              {EMAIL_CONTACT}
            </a>
          </div>

        </div>

        {/* Brand Footer */}
        <div className="border-t border-white/5 pt-3 mt-3 text-center select-none">
          <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">
            © 2026 KOI Software • Todos los Derechos Reservados.
          </p>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
