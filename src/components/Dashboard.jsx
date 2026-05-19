import React from 'react';
import { GlassCard } from './GlassCard';
import { Trophy, Package, CheckCircle2, TrendingUp, AlertCircle, Bookmark, Grid3x3, ArrowUpDown, Filter, SortDesc, Copy, Check, QrCode, Share2, X } from 'lucide-react';
import { getSectionTheme } from '../utils/albumUtils';

const SortButton = ({ active, onClick, icon, children }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
      active ? 'bg-gold text-dark' : 'bg-white/5 text-gray-500 hover:bg-white/10'
    }`}
  >
    {icon}
    {children}
  </button>
);

const StatItem = ({ icon, label, value, subtext }) => (
  <GlassCard className="p-3 sm:p-4 flex flex-col gap-1 sm:gap-2 hover:border-white/20 transition-all hover:-translate-y-1">
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="p-1 sm:p-1.5 rounded-lg bg-white/5">{icon}</div>
      <span className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
    <div>
      <p className="text-2xl sm:text-3xl font-black text-white tracking-tighter">{value || 0}</p>
      <p className="text-[7px] sm:text-[8px] text-gray-600 font-bold uppercase tracking-tight">{subtext}</p>
    </div>
  </GlassCard>
);

const StatItemFill = ({ percentage, collected, total }) => (
  <GlassCard className="p-3 sm:p-4 flex flex-col gap-1 sm:gap-2 relative overflow-hidden group border-gold/30">
    <div className="absolute -right-2 -bottom-2 opacity-[0.1] text-gold group-hover:scale-110 transition-transform duration-700 group-hover:rotate-12">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7.5L8.5 10v4l3.5 2.5 3.5-2.5v-4L12 7.5z" />
        <path d="M12 2v5.5M12 16.5V22M2 12h5.5M16.5 12H22M4.93 4.93l3.57 3.57M15.5 8.5l3.57-3.57M4.93 19.07l3.57-3.57M15.5 15.5l3.57 3.57" />
      </svg>
    </div>
    
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="p-1 sm:p-1.5 rounded-lg bg-gold/10">
        <Trophy className="text-gold" size={16} />
      </div>
      <span className="text-[8px] sm:text-[9px] font-black text-gold uppercase tracking-widest">Progreso</span>
    </div>
    <div className="mt-auto">
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-2xl sm:text-3xl font-black text-white tracking-tighter">{percentage}%</p>
        <span className="text-[9px] font-bold text-gray-500">{collected}/{total}</span>
      </div>
      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gold rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(212,175,55,0.4)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  </GlassCard>
);

export const Dashboard = ({ stats = {}, user = {}, onNavigateToSection }) => {
  const [sortBy, setSortBy] = React.useState('page');
  const [copied, setCopied] = React.useState(false);
  const [showQrModal, setShowQrModal] = React.useState(false);

  const shareUrl = `${window.location.origin}${window.location.pathname}?code=${user?.collectorCode || ''}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;

  const handleCopyCode = () => {
    if (user?.collectorCode) {
      navigator.clipboard.writeText(user.collectorCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sortedSections = React.useMemo(() => {
    if (!stats?.sectionsProgress) return [];
    const list = [...stats.sectionsProgress];
    if (sortBy === 'percent-desc') return list.sort((a, b) => (b.percent || 0) - (a.percent || 0));
    if (sortBy === 'group') {
      return list.sort((a, b) => {
        const themeA = getSectionTheme(a.id);
        const themeB = getSectionTheme(b.id);
        return (themeA.g || '').localeCompare(themeB.g || '');
      });
    }
    if (sortBy === 'page') {
      return list.sort((a, b) => {
        const pA = getSectionTheme(a.id).p;
        const pB = getSectionTheme(b.id).p;
        return (pA === '?' ? 999 : pA) - (pB === '?' ? 999 : pB);
      });
    }
    return list;
  }, [stats?.sectionsProgress, sortBy]);

  if (!stats) return null;

  return (
    <div className="space-y-4 sm:space-y-8 pb-10">
      {/* Welcome & Sharing Banner */}
      {user?.collectorCode && (
        <GlassCard className="p-3 sm:p-6 border-gold/30 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -z-10 group-hover:bg-gold/10 transition-colors duration-500" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-0.5 sm:space-y-1 text-left">
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight italic flex flex-wrap items-center gap-1.5 leading-tight">
                ¡Hola, <span className="text-gold-light drop-shadow-[0_2px_5px_rgba(212,175,55,0.35)] uppercase">{user.displayName || 'Coleccionista'}</span>! 👋
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 font-medium max-w-lg leading-relaxed">
                Este es tu código de coleccionista único. Compártelo con tus amigos para que puedan ingresar como invitados y ver el progreso de tu colección.
              </p>
            </div>
            
            <div className="flex items-center gap-2.5 self-stretch sm:self-center justify-between sm:justify-start shrink-0">
              <div className="bg-[#18181b] border border-white/10 rounded-xl px-3 py-1.5 flex flex-col gap-0.5 min-w-[120px] sm:min-w-[140px] shadow-inner text-left">
                <span className="text-[7px] sm:text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none">Código Compartido</span>
                <span className="text-sm sm:text-base font-black text-gold tracking-widest font-mono select-all">
                  {user.collectorCode}
                </span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className={`h-[38px] sm:h-[42px] px-3 sm:px-4 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                    copied 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                  title="Copiar Código"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span className="hidden xs:inline">{copied ? 'Copiado' : 'Copiar'}</span>
                </button>

                <button
                  onClick={() => setShowQrModal(true)}
                  className="h-[38px] sm:h-[42px] px-3 sm:px-4 bg-gold hover:bg-gold-light hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] text-dark rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  title="Compartir Código QR"
                >
                  <QrCode size={12} />
                  <span>Código QR</span>
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <StatItem 
          icon={<CheckCircle2 className="text-green-500" size={16} />}
          label="Pegadas"
          value={stats.collected}
          subtext="En el álbum"
        />
        <StatItem 
          icon={<AlertCircle className="text-red-400" size={16} />}
          label="Faltantes"
          value={stats.missing}
          subtext="Por conseguir"
        />
        <StatItem 
          icon={<Package className="text-gold" size={16} />}
          label="Repetidas"
          value={stats.repeated}
          subtext="Total copias"
        />
        <StatItemFill percentage={stats.percentage} collected={stats.collected} total={stats.total} />
      </div>

      {/* Matrix Grid */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <h3 className="text-[10px] sm:text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <Grid3x3 size={12} className="text-gold" /> Mapa de Colección
          </h3>
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <SortButton active={sortBy === 'page'} onClick={() => setSortBy('page')} icon={<ArrowUpDown size={10}/>}>Por Página</SortButton>
            <SortButton active={sortBy === 'group'} onClick={() => setSortBy('group')} icon={<Filter size={10}/>}>Grupo</SortButton>
            <SortButton active={sortBy === 'percent-desc'} onClick={() => setSortBy('percent-desc')} icon={<SortDesc size={10}/>}>% Max</SortButton>
          </div>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {(sortedSections || []).map((section) => {
            const theme = getSectionTheme(section.id);
            const isCompleted = section.percent === 100;
            const pureColor = theme.color.includes('[') ? theme.color.split('[')[1].split(']')[0] : '#D4AF37';
            const hue = (section.percent || 0) * 1.2; 
            const dynamicColor = isCompleted ? '#4CAF50' : `hsl(${hue}, 80%, 50%)`;

            return (
              <button
                key={section.id}
                onClick={() => onNavigateToSection?.(section.id)}
                className="aspect-square relative group w-full"
              >
                <div 
                  className="w-full h-full rounded-[1.25rem] overflow-hidden flex flex-col border-[3px] transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-md bg-black"
                  style={{ borderColor: pureColor }}
                >
                  <div className="flex items-center justify-between px-2 py-1 shrink-0" style={{ backgroundColor: pureColor }}>
                    <span className="text-[8px] font-black text-white uppercase tracking-tighter">Pag. {theme.p.toString().replace("-", " a ")}</span>
                    <span className="text-[11px] font-black text-white uppercase tracking-tighter">{theme.g}</span>
                    {theme.flag ? (
                      <img src={`https://flagcdn.com/w40/${theme.flag}.png`} className="w-4 h-3 object-cover rounded-sm border border-white/20" alt="" />
                    ) : (
                      <div className="text-white scale-75">{theme.icon}</div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-around py-1">
                    <span className="text-[18px] font-black text-white leading-none uppercase truncate w-full px-1 text-center">
                      {section.id}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[28px] font-black leading-none" style={{ color: dynamicColor }}>
                        {section.percent || 0}
                      </span>
                      <span className="text-[8px] font-black text-gray-500">%</span>
                    </div>
                    <span className="text-[10px] font-black text-gold/80">
                      {section.collected || 0}/{section.total || 0}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* GORGEOUS QR CODE INTERACTIVE OVERLAY MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          <GlassCard className="w-full max-w-sm p-6 sm:p-8 border-gold/30 text-center relative space-y-6 animate-fade-slide-down">
            {/* Close Button */}
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Tu Invitación QR ⚽️</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                ¡Escanea para visitar mi colección!
              </p>
            </div>

            {/* QR Code Container */}
            <div className="relative inline-block mx-auto bg-white p-4 rounded-3xl shadow-[0_8px_30px_rgba(255,255,255,0.05)] border border-white/15 group overflow-hidden">
              <img 
                src={qrCodeUrl} 
                alt="Código QR de Invitación" 
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-2xl select-none"
              />
              <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
            </div>

            {/* Info details */}
            <div className="bg-[#18181b] border border-white/5 rounded-2xl p-3 space-y-1 text-left">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Coleccionista</span>
                <span className="text-xs font-black text-white uppercase">{user?.displayName || 'Mi Colección'}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Código Único</span>
                <span className="text-xs font-mono font-black text-gold tracking-wider">{user?.collectorCode}</span>
              </div>
            </div>

            {/* Explanatory text */}
            <p className="text-[9px] text-gray-400 font-semibold leading-relaxed">
              Cualquier coleccionista puede escanear este código con su cámara para entrar directamente como invitado a ver tus repetidas y faltantes al instante.
            </p>

            {/* Copy Guest Link Button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white font-black text-[10px] uppercase py-2 px-4 rounded-full shadow-lg z-[1200] animate-fade-slide-down';
                toast.innerText = 'Enlace de Invitado Copiado';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2000);
              }}
              className="w-full bg-gold hover:bg-gold-light text-dark font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[0_4px_15px_rgba(212,175,55,0.2)]"
            >
              <Share2 size={14} />
              <span>Copiar Enlace de Invitación</span>
            </button>
          </GlassCard>
        </div>
      )}

    </div>
  );
};
