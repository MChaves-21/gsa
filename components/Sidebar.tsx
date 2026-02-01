
import React, { useState } from 'react';
import { Home, Search, Library, PlusCircle, Settings, Music2, Check, X, Trash2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const { playlists, createPlaylist, deletePlaylist } = usePlayer();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const navItems = [
    { id: View.HOME, label: 'Início', icon: Home },
    { id: View.SEARCH, label: 'Buscar', icon: Search },
    { id: View.PLAYLISTS, label: 'Sua Biblioteca', icon: Library },
  ];

  const handleCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
      setView(View.PLAYLISTS);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (id === 'default') return;
    deletePlaylist(id);
  };

  return (
    <div className="hidden md:flex w-64 bg-slate-950 flex-col h-full border-r border-slate-900 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-3 text-emerald-400 mb-8 cursor-pointer" onClick={() => setView(View.HOME)}>
          <Music2 size={32} strokeWidth={2.5} />
          <span className="text-2xl font-black tracking-tighter">GSA PLAYER</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group ${
                currentView === item.id 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <item.icon size={20} className={currentView === item.id ? 'text-emerald-400' : 'group-hover:text-emerald-400'} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-8">
          <div className="flex items-center justify-between text-slate-400 px-3 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest">Playlists</span>
            <button 
              onClick={() => setIsCreating(true)}
              className={`hover:text-emerald-400 transition-colors ${isCreating ? 'text-emerald-400' : ''}`}
              title="Nova Playlist"
            >
              <PlusCircle size={18} />
            </button>
          </div>
          
          <div className="space-y-1">
            {isCreating && (
              <form onSubmit={handleCreate} className="px-3 py-2 mb-2 bg-slate-900/50 rounded-lg border border-emerald-500/30">
                <input
                  autoFocus
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onBlur={() => !newPlaylistName && setIsCreating(false)}
                  placeholder="Nome da Playlist"
                  className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none mb-2"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-white">
                    <X size={14} />
                  </button>
                  <button type="submit" className="text-emerald-500 hover:text-emerald-400">
                    <Check size={14} />
                  </button>
                </div>
              </form>
            )}

            {playlists.map((pl) => (
              <div key={pl.id} className="group relative">
                <button
                  onClick={() => setView(View.PLAYLISTS)}
                  className="w-full text-left px-3 py-2 text-slate-400 hover:text-white truncate rounded-md hover:bg-slate-900/50 transition-all text-sm flex items-center justify-between pr-8"
                >
                  <span className="truncate flex-1">{pl.name}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 rounded transition-opacity">
                    {pl.tracks.length}
                  </span>
                </button>
                {pl.id !== 'default' && (
                  <button 
                    onClick={(e) => handleDelete(e, pl.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 bg-slate-950/80 rounded-md"
                    title="Excluir Playlist"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-slate-900">
        <button 
          onClick={() => setView(View.SETTINGS)}
          className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors"
        >
          <Settings size={20} />
          <span className="font-medium">Configurações</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
