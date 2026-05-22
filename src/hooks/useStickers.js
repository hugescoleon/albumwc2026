import { useState, useEffect, useMemo, useCallback } from 'react';
import { albumData } from '../data/albumData';
import { initialStickerNames } from '../data/stickerNames';
import { getSectionStickerIds } from '../utils/albumUtils';
import { supabase } from '../lib/supabase';

const generateCollectorCode = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // No O, 0, L, I, 1
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const DEFAULT_CONFIG = {
  appName: 'WORLDCUP COLLECTOR HUB',
  appLogo: null,
  adminEmails: ['hugoescobarleon@gmail.com'],
  stickerNames: initialStickerNames,
  sponsors: [
    { id: 1, name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/250px-Logo_NIKE.svg.png', url: 'https://nike.com' },
    { id: 2, name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/250px-Adidas_Logo.svg.png', url: 'https://adidas.com' },
    { id: 3, name: 'Coca-Cola', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/250px-Coca-Cola_logo.svg.png', url: 'https://cocacola.com' },
    { id: 4, name: 'Pepsi', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Pepsi_logo_2023.svg/250px-Pepsi_logo_2023.svg.png', url: 'https://pepsi.com' },
  ],
  popupAd: {
    frequency: 5,
    ads: [
      {
        id: 1,
        title: '¡Completa tu Álbum!',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800',
        description: '¿Te faltan las más difíciles? Encuentra sobres exclusivos y ofertas especiales en nuestra tienda oficial.',
        buttonText: 'Comprar Sobres',
        url: '#'
      }
    ]
  }
};

export const useStickers = () => {
  const [stickers, setStickers] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [platformConfig, setPlatformConfig] = useState(DEFAULT_CONFIG);

  const configKey = 'collector_platform_config';

  // Helper to save stickers to localStorage
  const saveStickersLocally = (userId, stickersMap) => {
    try {
      localStorage.setItem(`collector_stickers_${userId}`, JSON.stringify(stickersMap));
    } catch (e) {
      console.error("Error saving stickers to localStorage:", e);
    }
  };

  // Helper to load stickers from localStorage
  const loadStickersLocally = (userId) => {
    try {
      const data = localStorage.getItem(`collector_stickers_${userId}`);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error("Error reading stickers from localStorage:", e);
      return {};
    }
  };

  // Helper to sync all local stickers to cloud
  const syncStickersToCloud = async (userId, stickersMap) => {
    if (!userId) return;
    setSyncStatus('saving');
    try {
      const records = Object.entries(stickersMap).map(([stickerId, data]) => ({
        user_id: userId,
        sticker_id: stickerId,
        in_album: data.inAlbum || false,
        quantity: data.stock || 0,
        updated_at: new Date().toISOString()
      }));

      if (records.length === 0) {
        setSyncStatus('saved');
        return;
      }

      // Upsert full batch of stickers to Supabase
      const { error } = await supabase
        .from('user_stickers')
        .upsert(records, { onConflict: 'user_id,sticker_id' });

      if (error) throw error;
      setSyncStatus('saved');
    } catch (err) {
      console.error("Error batch syncing stickers to cloud:", err);
      setSyncStatus('error');
    }
  };

  // Auto-sync when regaining connectivity
  useEffect(() => {
    const handleOnline = () => {
      console.log("Device went online. Re-syncing local stickers to Supabase...");
      if (user?.id && user?.role === 'ADMIN') {
        const localCache = loadStickersLocally(user.id);
        if (Object.keys(localCache).length > 0) {
          syncStickersToCloud(user.id, localCache);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user]);

  // Load Platform Configurations from Supabase
  const loadConfig = async () => {
    let mergedConfig = { ...DEFAULT_CONFIG };
    let loadFromDbSuccess = false;

    try {
      const { data, error } = await supabase
        .from('config')
        .select('value')
        .eq('id', 'platform_config')
        .single();
      
      if (data && data.value) {
        mergedConfig = {
          ...mergedConfig,
          ...data.value,
          popupAd: {
            ...mergedConfig.popupAd,
            ...(data.value.popupAd || {}),
            ads: data.value.popupAd?.ads || mergedConfig.popupAd?.ads || []
          },
          sponsors: data.value.sponsors || mergedConfig.sponsors || [],
          stickerNames: { ...initialStickerNames, ...(data.value.stickerNames || {}) }
        };
        // Update local cache for offline fallback
        localStorage.setItem(configKey, JSON.stringify(mergedConfig));
        loadFromDbSuccess = true;
      }
    } catch (err) {
      console.warn('Supabase not available, using defaults', err);
    }

    // Only load from localStorage if database fetch failed (e.g., user is offline)
    if (!loadFromDbSuccess) {
      const savedConfig = localStorage.getItem(configKey);
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          mergedConfig = {
            ...mergedConfig,
            ...parsed,
            popupAd: {
              ...mergedConfig.popupAd,
              ...(parsed.popupAd || {}),
              ads: parsed.popupAd?.ads || mergedConfig.popupAd?.ads || []
            },
            sponsors: parsed.sponsors || mergedConfig.sponsors || [],
            stickerNames: { ...mergedConfig.stickerNames, ...(parsed.stickerNames || {}) }
          };
        } catch (e) {
          console.error("Error parsing local config", e);
        }
      }
    }

    setPlatformConfig(mergedConfig);
  };

  // Central Login/Sync Function
  const loginAsDummy = async (role = 'USER', codeOrProfile = null, silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    if (role === 'ADMIN') {
      let sessionUser = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        sessionUser = session?.user;
      } catch (e) {
        console.error("Error getting Supabase session", e);
      }

      if (sessionUser) {
        let loadedProfile = null;
        try {
          // 1. Fetch user profile from Supabase
          const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .single();

          if (profile) {
            loadedProfile = profile;
            
            // Self-heal display names for existing/old users
            const nameMappings = {
              'hugesco@gmail.com': 'Hugo Escobar',
              'hugoescobarleon@gmail.com': 'Hugo Escobar',
              'verticetester@gmail.com': 'Vértice Tester',
              'prueba2026@gmail.com': 'Prueba 2026',
              'huntereg2023@gmail.com': 'Hunter EG',
              'geescobar@elvallecolegio.edu.gt': 'G. Escobar'
            };

            const targetName = nameMappings[profile.email.toLowerCase()];
            const isEmailPrefix = profile.display_name === profile.email.split('@')[0];
            
            if (targetName && profile.display_name !== targetName) {
              // Apply specific map correction
              try {
                const { data: updatedProfile } = await supabase
                  .from('profiles')
                  .update({ display_name: targetName })
                  .eq('id', sessionUser.id)
                  .select()
                  .single();
                if (updatedProfile) {
                  loadedProfile = updatedProfile;
                  console.log("Self-healed profile name for old user:", targetName);
                }
              } catch (e) {
                console.error("Error auto-updating name:", e);
              }
            } else if (isEmailPrefix) {
              // General correction: Capitalize first letters of email prefix (e.g., "verticetester" -> "Verticetester")
              const capitalized = profile.display_name
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
                
              try {
                const { data: updatedProfile } = await supabase
                  .from('profiles')
                  .update({ display_name: capitalized })
                  .eq('id', sessionUser.id)
                  .select()
                  .single();
                if (updatedProfile) {
                  loadedProfile = updatedProfile;
                  console.log("Capitalized profile name automatically:", capitalized);
                }
              } catch (e) {
                console.error("Error auto-capitalizing name:", e);
              }
            }
          } else {
            // Try to self-heal by inserting a profile row
            const defaultName = sessionUser.email.split('@')[0];
            const allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluye 0, 1, O, I
            let code = '';
            for (let i = 0; i < 4; i++) {
              code += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
            }
            const newCode = 'FWC-' + code;
            
            const { data: newProfile, error: insertErr } = await supabase
              .from('profiles')
              .insert({
                id: sessionUser.id,
                display_name: sessionUser.user_metadata?.display_name || sessionUser.user_metadata?.full_name || defaultName,
                email: sessionUser.email,
                phone: sessionUser.user_metadata?.phone || '',
                department: sessionUser.user_metadata?.department || 'Guatemala',
                country: sessionUser.user_metadata?.country || 'Guatemala',
                collector_code: newCode,
                use_whatsapp: false,
                created_at: new Date().toISOString()
              })
              .select()
              .single();

            if (newProfile) {
              loadedProfile = newProfile;
            }
          }
        } catch (err) {
          console.error("Error fetching cloud collector profile:", err);
        }

        if (loadedProfile) {
          // Optimistically load from localStorage first for instant rendering!
          const localCache = loadStickersLocally(sessionUser.id);
          if (Object.keys(localCache).length > 0) {
            setStickers(localCache);
          }

          // 2. Fetch stickers progress from Supabase
          try {
            const { data: userStickers } = await supabase
              .from('user_stickers')
              .select('sticker_id, in_album, quantity')
              .eq('user_id', sessionUser.id);

            const map = {};
            if (userStickers) {
              userStickers.forEach(s => {
                map[s.sticker_id] = { inAlbum: s.in_album, stock: s.quantity };
              });
            }
            setStickers(map);
            saveStickersLocally(sessionUser.id, map);
          } catch (err) {
            console.error("Error fetching user stickers:", err);
          }

          const userData = {
            id: sessionUser.id,
            email: sessionUser.email,
            role: 'ADMIN',
            displayName: loadedProfile.display_name || sessionUser.user_metadata?.display_name || sessionUser.user_metadata?.full_name || sessionUser.email.split('@')[0],
            collectorCode: loadedProfile.collector_code,
            phone: loadedProfile.phone,
            department: loadedProfile.department,
            country: loadedProfile.country
          };
          
          localStorage.setItem('collector_user', JSON.stringify(userData));
          setUser(userData);
        } else {
          // RESILIENT FALLBACK: If profiles table doesn't exist yet, do not block the app loading!
          console.warn("Resilient Fallback: Profile tables not set up or query failed. Loading local session.");
          const code = sessionUser.email === 'hugoescobarleon@gmail.com' ? 'HUGO-2026' : 'ADMIN-HUB';
          const userData = {
            id: sessionUser.id,
            email: sessionUser.email,
            role: 'ADMIN',
            displayName: sessionUser.email === 'hugoescobarleon@gmail.com' 
              ? 'Hugo Escobar' 
              : (sessionUser.user_metadata?.display_name || sessionUser.user_metadata?.full_name || 'Super Administrador'),
            collectorCode: code,
            phone: '',
            department: 'Guatemala',
            country: 'Guatemala'
          };
          localStorage.setItem('collector_user', JSON.stringify(userData));
          setUser(userData);
          
          const localCache = loadStickersLocally(sessionUser.id);
          setStickers(localCache);
        }
      } else {
        // BACKDOOR FALLBACK
        const mockProfile = typeof codeOrProfile === 'object' ? codeOrProfile : { email: 'guest@guest.com' };
        const code = mockProfile.email === 'hugoescobarleon@gmail.com' ? 'HUGO-2026' : 'ADMIN-HUB';
        const userData = {
          id: mockProfile.id || 'mock-id',
          email: mockProfile.email,
          role: 'ADMIN',
          displayName: mockProfile.email === 'hugoescobarleon@gmail.com' ? 'Hugo Escobar' : 'Super Administrador',
          collectorCode: code,
          phone: '+12345678',
          department: 'Guatemala',
          country: 'Guatemala'
        };
        localStorage.setItem('collector_user', JSON.stringify(userData));
        setUser(userData);
        setStickers({});
      }
    } else if (role === 'USER' && codeOrProfile) {
      // Guest Collector View
      const code = String(codeOrProfile).trim().toUpperCase();
      try {
        const { data: friendProfile, error: profileErr } = await supabase
          .from('profiles')
          .select('id, display_name')
          .eq('collector_code', code)
          .single();

        if (friendProfile) {
          const { data: friendStickers } = await supabase
            .from('user_stickers')
            .select('sticker_id, in_album, quantity')
            .eq('user_id', friendProfile.id);

          const map = {};
          if (friendStickers) {
            friendStickers.forEach(s => {
              map[s.sticker_id] = { inAlbum: s.in_album, stock: s.quantity };
            });
          }
          setStickers(map);

          const userData = {
            role: 'USER',
            collectorCode: code,
            displayName: `Visitando a: ${friendProfile.display_name}`
          };
          localStorage.setItem('collector_user', JSON.stringify(userData));
          setUser(userData);
        } else {
          setLoading(false);
          throw new Error('Código de coleccionista no encontrado');
        }
      } catch (err) {
        setLoading(false);
        throw err;
      }
    }
    setLoading(false);
  };

  // Sign out
  const logoutDummy = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('collector_user');
    setUser(null);
    setStickers({});
  };

  // Listen to Auth sessions and load configuration
  useEffect(() => {
    let subscription = null;

    const initApp = async () => {
      try {
        await loadConfig();

        // Check if there is a QR code / invite query parameter in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const codeParam = urlParams.get('code') || urlParams.get('invite') || urlParams.get('codigo');

        if (codeParam) {
          console.log("Auto-logging in guest with code:", codeParam);
          // Clean URL so the parameter doesn't linger
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          
          await loginAsDummy('USER', codeParam.trim().toUpperCase());
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await loginAsDummy('ADMIN');
        } else {
          const savedUserStr = localStorage.getItem('collector_user');
          if (savedUserStr) {
            try {
              const parsed = JSON.parse(savedUserStr);
              if (parsed.role === 'USER') {
                // Restore guest view
                await loginAsDummy('USER', parsed.collectorCode);
              } else {
                // Restore admin view from localStorage for session persistence (offline & instant load)
                setUser(parsed);
                if (parsed.id) {
                  const localCache = loadStickersLocally(parsed.id);
                  setStickers(localCache);
                }
              }
            } catch (e) {
              console.error(e);
            }
          }
          setLoading(false);
        }

        // Only subscribe to auth changes if Supabase was successfully initialized
        if (supabase?.auth) {
          const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
              // Check if user is already logged in with the same ID to prevent double login / loading spinner
              const savedUserStr = localStorage.getItem('collector_user');
              let isDifferentUser = true;
              if (savedUserStr) {
                try {
                  const parsed = JSON.parse(savedUserStr);
                  if (parsed.role === 'USER') {
                    isDifferentUser = false;
                  } else if (parsed.id === session?.user?.id && parsed.role === 'ADMIN') {
                    isDifferentUser = false;
                  }
                } catch (e) {
                  console.error(e);
                }
              }
              if (isDifferentUser) {
                await loginAsDummy('ADMIN', null, true);
              }
            } else if (event === 'SIGNED_OUT') {
              // Only reset if they were not a guest user
              const savedUserStr = localStorage.getItem('collector_user');
              if (savedUserStr) {
                try {
                  const parsed = JSON.parse(savedUserStr);
                  if (parsed.role !== 'USER') {
                    localStorage.removeItem('collector_user');
                    setUser(null);
                    setStickers({});
                  }
                } catch (e) {
                  console.error(e);
                }
              }
            }
          });
          subscription = data?.subscription;
        }
      } catch (err) {
        console.warn("Failed to initialize app with Supabase. Operating in fallback mode:", err);
        // Recover local state gracefully
        const savedUserStr = localStorage.getItem('collector_user');
        if (savedUserStr) {
          try {
            const parsed = JSON.parse(savedUserStr);
            setUser(parsed);
            if (parsed.id) {
              const localCache = loadStickersLocally(parsed.id);
              setStickers(localCache);
            }
          } catch (e) {
            console.error(e);
          }
        }
        setLoading(false);
      }
    };

    initApp();

    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Handle warning when closing tab while changes are actively syncing
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (syncStatus === 'saving') {
        const msg = 'Tus cambios se están guardando en la nube. ¿Estás seguro de que deseas salir?';
        e.preventDefault();
        e.returnValue = msg;
        return msg;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [syncStatus]);

  const updatePlatformConfig = async (newConfig) => {
    setPlatformConfig(newConfig);
    localStorage.setItem(configKey, JSON.stringify(newConfig));
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try {
        await supabase
          .from('config')
          .upsert({ id: 'platform_config', value: newConfig });
      } catch (err) {
        console.error("Cloud Save failed", err);
      }
    }
  };

  // Toggle Sticker in Album with live database updates
  const toggleInAlbum = useCallback(async (stickerId) => {
    // Calculate new state first, synchronously
    const current = stickers[stickerId] || { inAlbum: false, stock: 0 };
    const newInAlbum = !current.inAlbum;
    const newStock = current.stock;

    // Update UI immediately
    setStickers(prev => {
      const next = {
        ...prev,
        [stickerId]: { ...current, inAlbum: newInAlbum }
      };
      if (user?.id) {
        saveStickersLocally(user.id, next);
      }
      return next;
    });

    if (user?.id) {
      setSyncStatus('saving');
      try {
        const { error } = await supabase
          .from('user_stickers')
          .upsert({
            user_id: user.id,
            sticker_id: stickerId,
            in_album: newInAlbum,
            quantity: newStock,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,sticker_id' });
        
        if (error) {
          console.error("Supabase upsert error:", error);
          throw error;
        }
        setSyncStatus('saved');
      } catch (err) {
        console.error("Error saving toggle in album to cloud:", err);
        setSyncStatus('error');
      }
    }
  }, [user, stickers]);

  // Update Stock count with live database updates
  const updateStock = useCallback(async (stickerId, delta) => {
    // Calculate new state first, synchronously
    const current = stickers[stickerId] || { inAlbum: false, stock: 0 };
    let newInAlbum = current.inAlbum;
    let newStock = Math.max(0, (current.stock || 0) + delta);

    if (delta > 0 && !current.inAlbum) {
      newInAlbum = true;
      newStock = 0;
    }

    // Update UI immediately
    setStickers(prev => {
      const next = {
        ...prev,
        [stickerId]: { ...current, inAlbum: newInAlbum, stock: newStock }
      };
      if (user?.id) {
        saveStickersLocally(user.id, next);
      }
      return next;
    });

    if (user?.id) {
      setSyncStatus('saving');
      try {
        const { error } = await supabase
          .from('user_stickers')
          .upsert({
            user_id: user.id,
            sticker_id: stickerId,
            in_album: newInAlbum,
            quantity: newStock,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,sticker_id' });
          
        if (error) {
          console.error("Supabase updateStock error:", error);
          throw error;
        }
        setSyncStatus('saved');
      } catch (err) {
        console.error("Error saving stock updates to cloud:", err);
        setSyncStatus('error');
      }
    }
  }, [user, stickers]);

  const stats = useMemo(() => {
    try {
      const totalStickers = albumData?.sections?.reduce((acc, s) => acc + (s.total || 0), 0) || 1;
      const stickersArray = Object.values(stickers || {});
      
      const collectedCount = stickersArray.filter(s => s?.inAlbum).length || 0;
      const repeatedCount = stickersArray.reduce((acc, s) => acc + (s?.stock || 0), 0) || 0;
      const uniqueRepeated = stickersArray.filter(s => (s?.stock || 0) > 0).length || 0;
      const percentage = Math.round((collectedCount / totalStickers) * 100) || 0;

      const sectionsProgress = (albumData?.sections || []).map(section => {
        const sectionIds = getSectionStickerIds(section.id, section.total);
        const collectedInSection = sectionIds.filter(id => stickers[id]?.inAlbum).length;
        const totalInSection = section.total || 1;
        return {
          ...section,
          collected: collectedInSection,
          percent: Math.round((collectedInSection / totalInSection) * 100) || 0
        };
      });

      const topSections = [...sectionsProgress]
        .filter(s => s.percent < 100)
        .sort((a, b) => (b.percent || 0) - (a.percent || 0))
        .slice(0, 3);

      return {
        total: totalStickers,
        collected: collectedCount,
        missing: Math.max(0, totalStickers - collectedCount),
        repeated: repeatedCount,
        uniqueRepeated,
        percentage,
        sectionsProgress,
        topSections
      };
    } catch (error) {
      console.error("Error in stats calculation", error);
      return { total: 0, collected: 0, missing: 0, repeated: 0, uniqueRepeated: 0, percentage: 0, sectionsProgress: [], topSections: [] };
    }
  }, [stickers]);

  return {
    stickers,
    loading,
    user,
    syncStatus,
    platformConfig,
    loginAsDummy,
    logoutDummy,
    toggleInAlbum,
    updateStock,
    stats,
    updatePlatformConfig
  };
};
