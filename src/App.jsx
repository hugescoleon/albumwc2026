import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useStickers } from './hooks/useStickers';
import { Dashboard } from './components/Dashboard';
import { CollectionView } from './components/CollectionView';
import { Login } from './components/Login';
import { 
  LayoutDashboard, 
  Grid3x3, 
  ShoppingBag, 
  LogOut,
  User as UserIcon,
  Settings
} from 'lucide-react';
import { SponsorLogos, InterstitialAd } from './components/SponsorAds';
import { GlassCard } from './components/GlassCard';
import { supabase } from './lib/supabase';
import { KoiInfoModal } from './components/KoiInfoModal';

// RESILIENT LAZY LOAD HELPER: Auto-reloads page on chunk loading failure (e.g., after new Vercel deployments)
const lazyWithRetry = (importFn) => {
  return lazy(() => {
    return importFn().catch((error) => {
      console.error("Chunk loading failed, auto-healing by reloading page...", error);
      window.location.reload();
      return new Promise(() => {}); // Pending promise so React does not throw error before reload
    });
  });
};

const AdminSettings = lazyWithRetry(() => import('./components/AdminSettings').then(m => ({ default: m.AdminSettings })));
const SellerMode = lazyWithRetry(() => import('./components/SellerMode').then(m => ({ default: m.SellerMode })));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("APP CRASH:", error, errorInfo);
    
    // Auto-heal chunk loading failures
    const errorStr = error?.toString() || '';
    if (
      errorStr.includes('Importing a module script failed') || 
      errorStr.includes('dynamically imported module') || 
      errorStr.includes('Failed to fetch')
    ) {
      console.warn("Auto-healing chunk loading failure by reloading page...");
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-900 text-white p-8 overflow-auto">
          <h1 className="text-3xl font-black mb-4">¡ERROR FATAL DETECTADO!</h1>
          <p className="mb-4">Por favor, toma una captura de pantalla de este error y envíasela al asistente:</p>
          <div className="bg-black/50 p-4 rounded-xl font-mono text-sm whitespace-pre-wrap">
            <p className="text-red-400 font-bold">{this.state.error && this.state.error.toString()}</p>
            <p className="text-gray-400 mt-4">{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-white text-red-900 px-6 py-2 rounded-lg font-bold"
          >
            Recargar Aplicación
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const { 
    user, 
    stickers, 
    loading, 
    syncStatus,
    platformConfig,
    toggleInAlbum, 
    updateStock, 
    stats, 
    loginAsDummy, 
    logoutDummy,
    updatePlatformConfig
  } = useStickers();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSection, setSelectedSection] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const [tabChanges, setTabChanges] = useState(0);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  
  // Background timer for popup ads
  useEffect(() => {
    const timeFrequency = platformConfig.popupAd?.timeFrequency || 0;
    const ads = platformConfig.popupAd?.ads || [];
    
    if (timeFrequency > 0 && ads.length > 0 && user) {
      const interval = setInterval(() => {
        if (!showAd) {
          const rotationMode = platformConfig.popupAd?.rotationMode || 'sequential';
          setCurrentAdIndex(prevIndex => {
            if (rotationMode === 'random') {
              return Math.floor(Math.random() * ads.length);
            } else {
              return (prevIndex + 1) % ads.length;
            }
          });
          setShowAd(true);
        }
      }, timeFrequency * 1000);
      
      return () => clearInterval(interval);
    }
  }, [platformConfig.popupAd?.timeFrequency, platformConfig.popupAd?.ads, user, showAd]);
  
  // SUPER ADMIN STATE
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showKoiModal, setShowKoiModal] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Check Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Listen to browser network connectivity status changes
  useEffect(() => {
    const handleOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Client-side code protection in production (disable inspect element, keys, and halt DevTools execution)
  useEffect(() => {
    if (import.meta.env.PROD) {
      // 1. Disable Right Click (context menu)
      const preventDefault = (e) => e.preventDefault();
      document.addEventListener('contextmenu', preventDefault);

      // 2. Disable DevTools Shortcuts
      const handleKeyDown = (e) => {
        // F12 key
        if (e.key === 'F12') {
          e.preventDefault();
          return false;
        }
        // Ctrl+Shift+I, J, C or Cmd+Opt+I, J, C
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
          e.preventDefault();
          return false;
        }
        // Cmd+Opt+I / J / U (U is View Source)
        if (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'U' || e.key === 'u')) {
          e.preventDefault();
          return false;
        }
        // Ctrl+U (View Source)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
          e.preventDefault();
          return false;
        }
      };
      document.addEventListener('keydown', handleKeyDown);

      // 3. Dynamic Debugger loop to freeze window if DevTools is opened
      let devtoolsInterval;
      try {
        devtoolsInterval = setInterval(() => {
          const startTime = performance.now();
          debugger;
          const endTime = performance.now();
          if (endTime - startTime > 100) {
            console.warn('Developer tools detected.');
          }
        }, 1000);
      } catch (err) {}

      return () => {
        document.removeEventListener('contextmenu', preventDefault);
        document.removeEventListener('keydown', handleKeyDown);
        if (devtoolsInterval) clearInterval(devtoolsInterval);
      };
    }
  }, []);

  // Auto collector login if super admin is authenticated
  useEffect(() => {
    if (adminUser && !user) {
      const code = adminUser.email === 'hugoescobarleon@gmail.com' ? 'HUGO-2026' : 'ADMIN-HUB';
      loginAsDummy('ADMIN', code);
    }
  }, [adminUser, user]);

  const handleNavigateToSection = (sectionId) => {
    setSelectedSection(sectionId);
    setActiveTab('collection');
  };

  const isSuperAdmin = adminUser && (platformConfig.adminEmails || ['hugoescobarleon@gmail.com']).includes(adminUser.email);
  const isAdmin = user?.role === 'ADMIN' || isSuperAdmin;

  // Handle default tab based on role after login
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        setActiveTab('dashboard');
      } else {
        setActiveTab('collection'); // Los invitados van directo a ver el Álbum del amigo
      }
    }
  }, [user, isAdmin]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const ads = platformConfig.popupAd?.ads || [];
    if (ads.length > 0) {
      setTabChanges(prev => {
        const next = prev + 1;
        const frequency = platformConfig.popupAd?.frequency || 5;
        
        if (next % frequency === 0) {
          const rotationMode = platformConfig.popupAd?.rotationMode || 'sequential';
          setCurrentAdIndex(prevIndex => {
            if (rotationMode === 'random') {
              return Math.floor(Math.random() * ads.length);
            } else {
              return (prevIndex + 1) % ads.length;
            }
          });
          setShowAd(true);
        }
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login 
          onLogin={loginAsDummy} 
          onAdminLogin={(adminUserData) => {
            setAdminUser(adminUserData);
            const code = adminUserData.email === 'hugoescobarleon@gmail.com' ? 'HUGO-2026' : 'ADMIN-HUB';
            loginAsDummy('ADMIN', code);
          }}
          onShowCredits={() => setShowKoiModal(true)}
        />
        <KoiInfoModal 
          isOpen={showKoiModal} 
          onClose={() => setShowKoiModal(false)} 
        />
      </>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard, adminOnly: true },
    { id: 'collection', label: 'Álbum', icon: Grid3x3, adminOnly: false },
    { id: 'seller', label: 'Intercambio', icon: ShoppingBag, adminOnly: false },
  ].filter(tab => isAdmin || !tab.adminOnly);

  const adsList = platformConfig.popupAd?.ads || [];
  const currentAd = adsList[currentAdIndex] || adsList[0] || null;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black text-white selection:bg-gold/30 pb-24">
        <InterstitialAd 
          isOpen={showAd} 
          onClose={() => setShowAd(false)} 
          adConfig={currentAd}
        />

      {showAdminPanel && (
        <Suspense fallback={null}>
          <AdminSettings 
            config={platformConfig}
            onUpdate={updatePlatformConfig}
            onClose={() => setShowAdminPanel(false)}
          />
        </Suspense>
      )}

      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 select-none min-w-0">
            {platformConfig.appLogo && (
              <div className="h-8 flex items-center shrink-0">
                <img 
                  src={platformConfig.appLogo} 
                  alt="App Logo" 
                  className="h-8 max-w-[56px] sm:max-w-[64px] object-contain rounded-lg"
                />
              </div>
            )}
            <h1 className="text-base sm:text-xl font-black text-gold tracking-tight italic uppercase truncate">
              {platformConfig.appName}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {user && (
              <div 
                className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full bg-white/5 border border-white/10 select-none cursor-help"
                title={
                  syncStatus === 'saving' ? 'Guardando en la nube...' :
                  syncStatus === 'saved' ? 'Todos los cambios guardados' :
                  'Sin conexión: Los cambios se guardarán cuando se restablezca la red'
                }
              >
                {syncStatus === 'saving' && (
                  <>
                    <div className="w-1.5 h-1.5 bg-yellow-400 animate-pulse rounded-full shrink-0" />
                    <span className="hidden sm:inline text-[9px] font-black text-yellow-400 uppercase tracking-widest">Sincronizando</span>
                  </>
                )}
                {syncStatus === 'saved' && (
                  <>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981] shrink-0" />
                    <span className="hidden sm:inline text-[9px] font-black text-emerald-500 uppercase tracking-widest">Sincronizado</span>
                  </>
                )}
                {syncStatus === 'error' && (
                  <>
                    <div className="w-1.5 h-1.5 bg-red-500 animate-ping rounded-full shrink-0" />
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Sin Conexión</span>
                  </>
                )}
              </div>
            )}
            {adminUser && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-full">
                <div className="w-2 h-2 bg-gold animate-pulse rounded-full shrink-0" />
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">
                  {isSuperAdmin ? 'Super Admin' : 'Coleccionista'}
                </span>
              </div>
            )}
            {isSuperAdmin && (
              <button 
                onClick={() => setShowAdminPanel(true)}
                className="shrink-0 p-1.5 sm:p-2 hover:bg-gold/10 rounded-lg text-gold hover:text-gold-light transition-all duration-300 group"
                title="Panel de Super Administrador"
              >
                <Settings size={18} className="sm:w-5 sm:h-5 group-hover:rotate-45 transition-transform duration-500" />
              </button>
            )}
            <button 
              onClick={async () => {
                if (adminUser) await supabase.auth.signOut();
                logoutDummy();
              }}
              className="shrink-0 p-1.5 sm:p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {user && (
          <div className="bg-[#111111]/95 border-t border-white/10 py-1.5 px-4 text-center select-none shadow-inner">
            <div className="inline-flex items-center justify-center gap-2">
              {user.role === 'USER' ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee] shrink-0" />
                  <span className="text-cyan-400 font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs">VISITANDO A:</span>
                  <span className="text-cyan-300 font-black italic tracking-wide text-sm sm:text-base drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)] uppercase">
                    {user.displayName.replace('Visitando a: ', '')}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-[0_0_8px_#d4af37] shrink-0" />
                  <span className="text-gold font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs">MI ÁLBUM:</span>
                  <span className="text-gold-light font-black italic tracking-wide text-sm sm:text-base drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)] uppercase">
                    {user.displayName || 'Coleccionista'}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto p-3 sm:p-4 pt-1 sm:pt-10 pb-24 sm:pb-12">
        {activeTab === 'dashboard' && isAdmin && (
          <Dashboard 
            stats={stats} 
            user={user}
            onNavigateToSection={handleNavigateToSection} 
          />
        )}
        
        {(activeTab === 'collection') && (
          <CollectionView 
            stickers={stickers} 
            onToggle={toggleInAlbum} 
            onUpdateStock={updateStock} 
            initialSection={selectedSection}
            role={user?.role === 'ADMIN' ? 'ADMIN' : 'GUEST'}
            stickerNames={platformConfig?.stickerNames || {}}
          />
        )}

        {activeTab === 'seller' && (
          <Suspense fallback={<div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>}>
            <SellerMode 
              stickers={stickers} 
              user={user}
              role={user?.role}
              stickerNames={platformConfig?.stickerNames || {}}
              onToggle={toggleInAlbum}
              onUpdateStock={updateStock}
              appName={platformConfig.appName}
              sponsors={platformConfig.sponsors}
            />
          </Suspense>
        )}

        <SponsorLogos sponsors={platformConfig.sponsors} />
        
        <footer className="mt-12 mb-8 text-center space-y-4">
          <div className="flex justify-center">
            <button 
              onClick={() => setShowKoiModal(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 hover:border-white/20 border border-white/10 rounded-full text-[10px] font-black text-white hover:text-gold transition-all duration-300 shadow-md cursor-pointer select-none tracking-widest uppercase"
            >
              <span>ℹ️</span>
              <span>SOPORTE Y CONTACTO</span>
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em]">
              © 2026 {platformConfig.appName}
            </p>
            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.15em] mt-1 select-none">
              Desarrollado por <button onClick={() => setShowKoiModal(true)} className="hover:text-white transition-all underline decoration-white/10 hover:decoration-red-500 underline-offset-2 font-black cursor-pointer bg-transparent border-none p-0 outline-none"><span className="text-red-500">KOI</span> <span className="text-white/60">software</span></button>
            </p>
          </div>
        </footer>
      </main>

      {tabs.length > 1 && (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-[#0a0a0a] border-t border-white/5 shadow-2xl pb-[env(safe-area-inset-bottom,12px)]">
          <div className="max-w-4xl mx-auto flex items-stretch h-[54px]">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              if (!Icon) return null;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-500 ${
                    isActive 
                      ? "bg-gold text-black shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]" 
                      : "bg-[#161616] text-gray-600 hover:text-gray-400"
                  } ${index !== 0 ? 'border-l border-white/5' : ''}`}
                >
                  <Icon size={18} strokeWidth={isActive ? 3 : 2} />
                  <span className={`text-[8px] font-black uppercase tracking-[0.15em]`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <KoiInfoModal 
        isOpen={showKoiModal} 
        onClose={() => setShowKoiModal(false)} 
      />

      {/* FLOATING OFFLINE WARNING BANNER */}
      {isOffline && (
        <div className="fixed bottom-[70px] left-4 right-4 z-[99] animate-fade-slide-down max-w-sm mx-auto">
          <div className="bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border border-amber-500/30 text-amber-200 px-4 py-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md flex items-start gap-3 select-none">
            <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-0.5">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-300">Modo Sin Conexión Activo</h4>
              <p className="text-[10px] text-amber-200/80 leading-relaxed font-semibold">
                Tus cambios se guardan localmente. Se sincronizarán en la nube automáticamente al recuperar tu conexión.
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
