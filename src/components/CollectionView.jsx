import React, { useState, useEffect } from 'react';
import { albumData } from '../data/albumData';
import { StickerCard } from './StickerCard';
import { Search, LayoutGrid, List, X } from 'lucide-react';
import { getSectionTheme, getSectionStickerIds } from '../utils/albumUtils';
import { clsx } from 'clsx';

export const CollectionView = ({ stickers = {}, onToggle, onUpdateStock, initialSection, role, stickerNames = {} }) => {
  const [activeSection, setActiveSection] = useState(initialSection || albumData.sections[0]?.id || null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('sections');
  const viewRef = React.useRef(null);

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

  useEffect(() => {
    if (initialSection) {
      selectSection(initialSection);
      setSearch('');
      setViewMode('sections');
    }
  }, [initialSection]);

  const currentSection = activeSection ? albumData.sections.find(s => s.id === activeSection) : null;

  const handleSearch = (val) => {
    setSearch(val);
    if (val.trim() !== '') {
      setActiveSection(null);
    } else if (!activeSection) {
      setActiveSection(albumData.sections[0].id);
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
    <div className={clsx("space-y-6 animate-in fade-in duration-500", (activeSection || viewMode === 'all' || search.trim() !== '') ? "pb-24" : "pb-2")}>
      {/* HEADER CONTROLS */}
      <div className="flex flex-col gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input 
            type="text"
            placeholder="Buscar por número o nombre..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
          />
          {search && (
            <button onClick={() => handleSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/5 w-full shadow-inner">
          <button 
            onClick={() => setViewMode('sections')} 
            className={clsx(
              "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              viewMode === 'sections' ? "bg-gold text-dark shadow-lg" : "text-gray-500 hover:text-gray-300"
            )}
          >
            EQUIPOS
          </button>
          <button 
            onClick={() => setViewMode('all')} 
            className={clsx(
              "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              viewMode === 'all' ? "bg-gold text-dark shadow-lg" : "text-gray-500 hover:text-gray-300"
            )}
          >
            TODO
          </button>
        </div>
      </div>

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
              {/* NAVIGATION */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {albumData.sections.map(section => {
                  const theme = getSectionTheme(section.id);
                  const pureColor = theme.color.includes('[') ? theme.color.split('[')[1].split(']')[0] : '#D4AF37';
                  return (
                    <button
                      key={section.id}
                      onClick={() => selectSection(section.id)}
                      className={clsx(
                        "h-10 w-[62px] rounded-xl text-[13px] font-black transition-all border-2",
                        activeSection === section.id ? "scale-110 border-white" : "opacity-60 border-transparent"
                      )}
                      style={{ backgroundColor: pureColor, color: '#fff' }}
                    >
                      {section.id}
                    </button>
                  );
                })}
              </div>

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
                ) : null}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {albumData.sections.map(section => {
            const theme = getSectionTheme(section.id);
            const pureColor = theme.color.includes('[') ? theme.color.split('[')[1].split(']')[0] : '#D4AF37';
            
            return (
              <div key={section.id} className="space-y-4">
                <div className="flex items-center gap-4 sticky top-[72px] z-20 py-4 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm border-2 shadow-2xl shrink-0"
                    style={{ backgroundColor: pureColor, borderColor: 'rgba(255,255,255,0.2)' }}
                  >
                    {section.id}
                  </div>
                  
                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-white uppercase tracking-tight italic">
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

                  {theme.flag && (
                    <div className="shrink-0 ml-2">
                      <img 
                        src={`https://flagcdn.com/w160/${theme.flag}.png`} 
                        className="w-12 h-8 object-cover rounded-lg border-2 border-white/10 shadow-lg" 
                        alt="" 
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
