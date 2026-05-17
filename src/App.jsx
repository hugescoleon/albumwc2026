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

// LAZY LOAD HEAVY COMPONENTS
const AdminSettings = lazy(() => import('./components/AdminSettings').then(m => ({ default: m.AdminSettings })));
const SellerMode = lazy(() => import('./components/SellerMode').then(m => ({ default: m.SellerMode })));



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
  
  // SUPER ADMIN STATE
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showKoiModal, setShowKoiModal] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

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
        setActiveTab('seller');
      }
    }
  }, [user, isAdmin]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTabChanges(prev => {
      const next = prev + 1;
      const frequency = platformConfig.popupAd?.frequency || 5;
      const ads = platformConfig.popupAd?.ads || [];
      
      if (ads.length > 0 && next % frequency === 0) {
        setShowAd(true);
      }
      return next;
    });
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
    { id: 'collection', label: 'Álbum', icon: Grid3x3, adminOnly: true },
    { id: 'seller', label: 'Intercambio', icon: ShoppingBag, adminOnly: false },
  ].filter(tab => isAdmin || !tab.adminOnly);

  const adConfig = platformConfig.popupAd || { frequency: 5, ads: [] };
  const currentAdIndex = Math.floor(tabChanges / (adConfig.frequency || 5)) % (adConfig.ads?.length || 1);
  const currentAd = adConfig.ads?.[currentAdIndex];

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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            {platformConfig.appLogo && (
              <div className="h-8 flex items-center shrink-0">
                <img 
                  src={platformConfig.appLogo} 
                  alt="App Logo" 
                  className="h-8 max-w-[64px] object-contain rounded-lg"
                />
              </div>
            )}
            <h1 className="text-xl font-black text-gold tracking-tight italic uppercase">
              {platformConfig.appName}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {adminUser && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-full">
                <div className="w-2 h-2 bg-gold animate-pulse rounded-full" />
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">
                  {isSuperAdmin ? 'Super Admin' : 'Coleccionista'}
                </span>
              </div>
            )}
            {isSuperAdmin && (
              <button 
                onClick={() => setShowAdminPanel(true)}
                className="p-2 hover:bg-gold/10 rounded-lg text-gold hover:text-gold-light transition-all duration-300 group"
                title="Panel de Super Administrador"
              >
                <Settings size={20} className="group-hover:rotate-45 transition-transform duration-500" />
              </button>
            )}
            <button 
              onClick={async () => {
                if (adminUser) await supabase.auth.signOut();
                logoutDummy();
              }}
              className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pt-10">
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
            role={isAdmin ? user?.role : 'GUEST'}
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
      </div>
    </ErrorBoundary>
  );
}

export default App;
