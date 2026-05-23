import React, { useState, useEffect } from 'react';
import { albumData } from '../data/albumData';
import { StickerCard } from './StickerCard';
import { Search, LayoutGrid, List, X, Plus, Minus } from 'lucide-react';
import { getSectionTheme, getSectionStickerIds } from '../utils/albumUtils';
import { clsx } from 'clsx';

export const CollectionView = ({ stickers = {}, onToggle, onUpdateStock, initialSection, role, stickerNames = {} }) => {
  const [activeSection, setActiveSection] = useState(initialSection || null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [expandedSections, setExpandedSections] = useState({});
  const viewRef = React.useRef(null);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const selectSection = (sectionId) => {
    setActiveSection(sectionId);
    setTimeout(() => {
      if (viewRef.current) {
        const yOffset = -100; 
        const element = viewRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    if (viewMode === 'sections') {
      selectSection(sectionId);
    } else {
      setExpandedSections(prev => ({ ...prev, [sectionId]: true }));
      setTimeout(() => {
        const element = document.getElementById(`section-view-${sectionId}`);
        if (element) {
          const yOffset = -120; 
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (initialSection) {
      selectSection(initialSection);
      setSearch('');
      setViewMode(role === 'GUEST' ? 'all' : 'sections');
    }
  }, [initialSection]);

  const currentSection = activeSection ? albumData.sections.find(s => s.id === activeSection) : null;

  const handleSearch = (val) => {
    setSearch(val);
    if (val.trim() !== '') {
      setActiveSection(null);
    }
  };

  // Pre-calculate stats
  const allStickersIds = albumData.sections.flatMap(s => 
    getSectionStickerIds(s.id, s.total)
  );
  
  const searchResults = search.trim() !== '' 
    ? allStickersIds.filter(id => {
        const name = (stickerNames[id] || '').toLowerCase();
        const searchLow = search.toLowerCase();
        return name.includes(searchLow) || id.toLowerCase().includes(searchLow.replace(' ', '-'));
      })
    : [];

  return (
    <div className="space-y-4 pb-10">
      {/* Search & Global Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text"
            placeholder="Buscar por número o nombre..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
          />
        </div>
        
        {role !== 'GUEST' && (
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 w-full sm:w-auto shadow-inner">
            <button 
              onClick={() => setViewMode('all')}
              className={clsx(
                "flex-1 sm:flex-none py-2 px-4 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all cursor-pointer",
                viewMode === 'all' ? "bg-gold text-dark font-extrabold shadow-sm" : "text-gray-500 hover:text-gray-300"
              )}
            >
              Todo
            </button>
            <button 
              onClick={() => setViewMode('sections')}
              className={clsx(
                "flex-1 sm:flex-none py-2 px-4 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all cursor-pointer",
                viewMode === 'sections' ? "bg-gold text-dark font-extrabold shadow-sm" : "text-gray-500 hover:text-gray-300"
              )}
            >
              Equipos
            </button>
          </div>
        )}
      </div>

      {/* NAVIGATION BUTTONS (ALWAYS VISIBLE WHEN NOT SEARCHING) */}
      {viewMode === 'sections' && search.trim() === '' && (
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start select-none">
          {albumData.sections.map(section => {
            const theme = getSectionTheme(section.id);
            const pureColor = theme.color.includes('[') ? theme.color.split('[')[1].split(']')[0] : '#D4AF37';
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => handleNavClick(section.id)}
                className={clsx(
                  "h-10 w-[62px] rounded-xl text-[13px] font-black transition-all border-2 cursor-pointer active:scale-90",
                  isActive ? "scale-110 border-white shadow-lg" : "opacity-60 border-transparent hover:opacity-100 hover:scale-105"
                )}
                style={{ backgroundColor: pureColor, color: '#fff' }}
              >
                {section.id}
              </button>
            );
          })}
        </div>
      )}

      {viewMode === 'all' && search.trim() === '' && (
        <div className="flex justify-end gap-3 px-1 text-xs select-none">
          <button
            onClick={() => {
              const allExpanded = {};
              albumData.sections.forEach(s => { allExpanded[s.id] = true; });
              setExpandedSections(allExpanded);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:border-gold hover:bg-gold/10 text-gray-300 hover:text-gold rounded-lg transition-all font-bold cursor-pointer text-[10px] uppercase tracking-wider"
          >
            <Plus size={12} />
            Expandir todos
          </button>
          <button
            onClick={() => setExpandedSections({})}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:border-gold hover:bg-gold/10 text-gray-300 hover:text-gold rounded-lg transition-all font-bold cursor-pointer text-[10px] uppercase tracking-wider"
          >
            <Minus size={12} />
            Colapsar todos
          </button>
        </div>
      )}

      {viewMode === 'sections' ? (
        <div className="space-y-6">
          {search.trim() !== '' ? (
            <div className="space-y-12">
              {albumData.sections.map(section => {
                const sectionResults = searchResults.filter(id => id.startsWith(`${section.id}-`));
                if (sectionResults.length === 0) return null;

                const theme = getSectionTheme(section.id);
                const pureColor = theme.color.includes('[') ? theme.color.split('[')[1].split(']')[0] : '#D4AF37';

                return (
                  <div key={section.id} className="space-y-4">
                    <div className="flex items-center gap-4 py-4 border-b border-white/5">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs border-2 shadow-lg shrink-0"
                        style={{ backgroundColor: pureColor, borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        {section.id}
                      </div>
                      
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black text-white uppercase tracking-widest">
                            {section.name}
                          </h3>
                          {theme.g && (
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">
                              {theme.g.length === 1 ? `Grupo ${theme.g}` : theme.g}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-gold uppercase mt-1">
                          {sectionResults.length} coincidencias
                        </span>
                      </div>

                      {theme.flag && (
                        <img 
                          src={`https://flagcdn.com/w80/${theme.flag}.png`} 
                          className="w-8 h-5 object-cover rounded border border-white/10 opacity-60" 
                          alt="" 
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                      {sectionResults.map(id => (
                        <StickerCard 
                          key={id} 
                          id={id} 
                          data={stickers[id]} 
                          onToggle={onToggle} 
                          onUpdateStock={onUpdateStock} 
                          role={role} 
                          name={stickerNames[id] || stickerNames[id.replace('-', '')]} 
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              {/* GRID */}
              <div ref={viewRef} className="space-y-6 scroll-mt-24">
                {currentSection ? (
                  <>
                    {(() => {
                      const currentTheme = getSectionTheme(currentSection.id);
                      const pureColor = currentTheme.color.includes('[') ? currentTheme.color.split('[')[1].split(']')[0] : '#D4AF37';
                      
                      return (
                        <div className="flex items-center gap-4 py-6 border-b-2 border-white/5">
                          <div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-base border-2 shadow-2xl shrink-0"
                            style={{ backgroundColor: pureColor, borderColor: 'rgba(255,255,255,0.2)' }}
                          >
                            {currentSection.id}
                          </div>
                          
                          <div className="flex flex-col flex-1 gap-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">
                                {currentSection.name}
                              </h3>
                              {currentTheme.g && (
                                <span className="text-[11px] font-black bg-white/5 text-gray-400 px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest">
                                  {currentTheme.g.length === 1 ? `Grupo ${currentTheme.g}` : currentTheme.g}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-20 rounded-full shadow-sm" style={{ backgroundColor: pureColor }} />
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-white italic">
                                  {(() => {
                                    const collectedCount = getSectionStickerIds(currentSection.id, currentSection.total)
                                      .filter(id => stickers[id]?.inAlbum).length;
                                    return collectedCount;
                                  })()}
                                </span>
                                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                                  / {currentSection.total} Estampas
                                </span>
                              </div>
                            </div>
                          </div>

                          {currentTheme.flag && (
                            <div className="shrink-0 ml-4 hidden sm:block">
                              <img 
                                src={`https://flagcdn.com/w160/${currentTheme.flag}.png`} 
                                className="w-16 h-10 object-cover rounded-xl border-2 border-white/10 shadow-2xl" 
                                alt="" 
                              />
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                      {getSectionStickerIds(currentSection.id, currentSection.total).map(id => {
                        return (
                          <StickerCard 
                            key={id} 
                            id={id} 
                            data={stickers[id]} 
                            onToggle={onToggle} 
                            onUpdateStock={onUpdateStock} 
                            role={role} 
                            name={stickerNames[id] || stickerNames[id.replace('-', '')]} 
                          />
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-sm animate-fade-slide-down">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 border border-white/10 mb-4 shadow-inner">
                      <LayoutGrid size={24} className="text-gold" />
                    </div>
                    <h4 className="text-base font-black text-white uppercase tracking-wider mb-2">
                      Selecciona un equipo
                    </h4>
                    <p className="text-xs text-gray-500 max-w-[280px]">
                      Haz clic en cualquiera de los botones superiores para ver y coleccionar sus estampas.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {albumData.sections.map(section => {
            const theme = getSectionTheme(section.id);
            const pureColor = theme.color.includes('[') ? theme.color.split('[')[1].split(']')[0] : '#D4AF37';
            const isExpanded = !!expandedSections[section.id];
            
            return (
              <div key={section.id} id={`section-view-${section.id}`} className="space-y-4 scroll-mt-28">
                {/* Collapsible Header */}
                <div 
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center gap-4 sticky top-[112px] z-20 py-4 px-3 rounded-2xl bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] cursor-pointer select-none transition-all group"
                >
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm border-2 shadow-2xl shrink-0"
                    style={{ backgroundColor: pureColor, borderColor: 'rgba(255,255,255,0.2)' }}
                  >
                    {section.id}
                  </div>
                  
                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-white uppercase tracking-tight italic group-hover:text-gold transition-colors">
                        {section.name}
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
                        {section.total} Estampas
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className={clsx(
                      "w-8 h-8 rounded-full border flex items-center justify-center transition-all shadow-inner",
                      isExpanded 
                        ? "bg-gold/10 border-gold/30 text-gold scale-105" 
                        : "bg-white/5 border-white/10 text-gray-400 group-hover:border-white/20 group-hover:text-white"
                    )}>
                      {isExpanded ? <Minus size={14} /> : <Plus size={14} />}
                    </div>

                    {theme.flag && (
                      <div className="shrink-0 ml-2">
                        <img 
                          src={`https://flagcdn.com/w160/${theme.flag}.png`} 
                          className="w-12 h-8 object-cover rounded-lg border border-white/10 shadow-md group-hover:opacity-100 transition-opacity" 
                          alt="" 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 pt-2">
                    {getSectionStickerIds(section.id, section.total).map(id => {
                      return (
                        <StickerCard 
                          key={id} 
                          id={id} 
                          data={stickers[id]} 
                          onToggle={onToggle} 
                          onUpdateStock={onUpdateStock} 
                          role={role} 
                          name={stickerNames[id] || stickerNames[id.replace('-', '')]} 
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
