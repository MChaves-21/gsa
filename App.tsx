
import React, { useState } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import PlayerBar from './components/PlayerBar';
import SearchBar from './components/SearchBar';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Playlists from './pages/Playlists';
import { View, Track } from './types';
import { deezerService } from './services/deezerService';
import { Bell, User } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setCurrentView(View.SEARCH);
    setIsSearching(true);
    try {
      const results = await deezerService.searchTracks(query);
      setSearchResults(results);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.HOME:
        return <Home setView={setCurrentView} />;
      case View.SEARCH:
        return <SearchResults tracks={searchResults} query={searchQuery} isLoading={isSearching} />;
      case View.PLAYLISTS:
        return <Playlists setView={setCurrentView} />;
      case View.SETTINGS:
        return (
          <div className="p-8 text-center text-slate-400">
            <h2 className="text-2xl font-bold mb-4">Configurações</h2>
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-between">
                <span>Modo Escuro</span>
                <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-between">
                <span>Qualidade de Áudio</span>
                <span className="text-emerald-400 font-bold">Alta (Lossless)</span>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-between">
                <span>Equalizador</span>
                <span className="text-slate-500 text-sm">Desativado</span>
              </div>
              <p className="text-xs pt-8 text-slate-600 uppercase tracking-widest font-black">GSA Player v1.5.0 • Build 2025</p>
            </div>
          </div>
        );
      default:
        return <Home setView={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 flex-col md:flex-row">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 relative flex flex-col min-w-0 bg-slate-950/40 pb-32 md:pb-24">
        {/* Header */}
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 z-40 bg-slate-950/20 backdrop-blur-md sticky top-0">
          <div className="flex-1 mr-4">
            <SearchBar onSearch={handleSearch} isLoading={isSearching} />
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button className="hidden sm:block p-2 text-slate-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </button>
            <button className="flex items-center gap-2 md:gap-3 bg-slate-900 hover:bg-slate-800 transition-colors p-1.5 md:pr-4 rounded-full border border-slate-800">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950">
                <User size={18} />
              </div>
              <span className="hidden md:inline text-sm font-bold text-slate-200">GSA Pro</span>
            </button>
          </div>
        </header>

        <div id="main-content-area" className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar-y">
          {renderView()}
        </div>
      </main>

      <PlayerBar />
      <MobileNav currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
};

export default App;
