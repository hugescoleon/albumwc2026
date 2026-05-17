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

  // Configuration with Fallback Defaults - Easy to modify contact data!
  const EMAIL_CONTACT = developerConfig?.email || "info@koisoftware.com";
  const WHATSAPP_NUMBER = developerConfig?.whatsapp || "50245885656"; // Without + or spaces for the API link
  const WHATSAPP_DISPLAY = developerConfig?.whatsappDisplay || "+502 4588-5656";
  const ABOUT_TEXT = developerConfig?.aboutText || "Elevamos ideas innovadoras a experiencias de software premium y aplicaciones a medida de alto impacto visual y tecnológico.";
  const THANKS_TEXT = developerConfig?.thanksText || "Nuestro más sincero agradecimiento a José Emilio Escobar Gómez, así como a los patrocinadores, socios estratégicos, empresas y colaboradores de la comunidad que han depositado su confianza y apoyo incondicional en el desarrollo, pruebas y puesta en marcha de esta gran plataforma para el coleccionismo 2026.";
  const WHATSAPP_MESSAGE = encodeURIComponent("¡Hola KOI Software! Vengo desde la App Collector 2026 y me interesa conocer más sobre sus servicios de desarrollo.");

  const modalContent = (
    <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#0e0e0e]/95 border border-white/10 rounded-3xl p-4 sm:p-6 overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        
        {/* Ambience glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
        
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
          <div className="space-y-2 pt-1.5">
            <div className="text-center">
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-[0.15em]">¿Tienes una gran idea? ¡Hablemos!</span>
            </div>

            <div className="flex items-center gap-2 w-full">
              {/* WhatsApp Button */}
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-[10px] uppercase tracking-widest py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_15px_rgba(37,211,102,0.15)] active:scale-95 duration-300"
              >
                <MessageCircle size={14} fill="black" />
                <span>WhatsApp</span>
              </a>

              {/* Email Icon Button */}
              <a 
                href={`mailto:${EMAIL_CONTACT}`}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 hover:text-gold border border-white/10 text-white rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-95 duration-300"
                title="Escríbenos por Correo"
              >
                <Mail size={14} />
              </a>

              {/* Portfolio / Website Icon Button */}
              <a 
                href="https://koisoftware.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 hover:bg-white/10 hover:text-gold border border-white/10 text-white rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-95 duration-300"
                title="Visitar Sitio Web"
              >
                <Code size={14} />
              </a>
            </div>
            
            <div className="text-center text-[8px] text-gray-500 font-bold uppercase tracking-wider">
              {EMAIL_CONTACT} • WhatsApp: {WHATSAPP_DISPLAY}
            </div>
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
