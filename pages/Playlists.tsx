
import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { View } from '../types';
import { Play, Trash2, Clock, Music, ArrowRight, Search } from 'lucide-react';

interface PlaylistsProps {
  setView?: (view: View) => void;
}

const Playlists: React.FC<PlaylistsProps> = ({ setView }) => {
  const { playlists, playTrack, deletePlaylist, removeFromPlaylist } = usePlayer();
  const [activePlaylistId, setActivePlaylistId] = useState(playlists[0]?.id || '');

  // Garante que se a playlist ativa for deletada, voltamos para a primeira disponível
  useEffect(() => {
    if (!playlists.find(p => p.id === activePlaylistId)) {
      setActivePlaylistId(playlists[0]?.id || '');
    }
  }, [playlists, activePlaylistId]);

  const activePlaylist = playlists.find(p => p.id === activePlaylistId);

  const formatDuration = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleDeletePlaylist = (id: string, name: string) => {
    if (id === 'default') return;
    if (window.confirm(`Tem certeza que deseja excluir a playlist "${name}"? Esta ação não pode ser desfeita.`)) {
      deletePlaylist(id);
    }
  };

  const handleRemoveTrack = (e: React.MouseEvent, trackId: number, trackTitle: string) => {
    e.stopPropagation();
    removeFromPlaylist(trackId, activePlaylistId);
  };

  return (
    <div className="p-4 md:p-8 pb-32">
      {/* Playlist Selector Bar */}
      <div className="flex items-center gap-3 overflow-x-auto mb-8 md:mb-12 pb-4 custom-scrollbar-x -mx-2 px-2 snap-x">
        {playlists.map(pl => (
          <button
            key={pl.id}
            onClick={() => setActivePlaylistId(pl.id)}
            className={`px-6 md:px-8 py-3 md:py-4 rounded-3xl font-black whitespace-nowrap transition-all flex items-center gap-3 snap-start border ${
              activePlaylistId === pl.id 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xl shadow-emerald-500/20 scale-105' 
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-slate-800 hover:text-white'
            }`}
          >
            <span className="text-sm md:text-base uppercase tracking-tighter">{pl.name}</span>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${
              activePlaylistId === pl.id ? 'bg-slate-950/20' : 'bg-slate-800'
            }`}>
              {pl.tracks.length}
            </span>
          </button>
        ))}
      </div>

      {activePlaylist ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Playlist Header */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 bg-gradient-to-t from-slate-950/50 to-transparent pb-8 border-b border-slate-900/50">
            <div className="w-44 h-44 md:w-64 md:h-64 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl relative group overflow-hidden border border-slate-800/50">
              {activePlaylist.tracks[0] ? (
                <img 
                  src={activePlaylist.tracks[0].album.cover_big} 
                  alt={activePlaylist.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 opacity-10">
                  <Music size={80} strokeWidth={1.5} />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                <button 
                  disabled={activePlaylist.tracks.length === 0}
                  onClick={() => activePlaylist.tracks[0] && playTrack(activePlaylist.tracks[0], activePlaylist.tracks)}
                  className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 shadow-2xl hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={40} fill="currentColor" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                 <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">Playlist Premium</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-slate-100 mb-6 tracking-tighter leading-none">{activePlaylist.name}</h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg">
                    <Music size={14} strokeWidth={3} />
                  </div>
                  <span className="font-black text-slate-200 tracking-tight">GSA User</span>
                </div>
                <span className="opacity-30">•</span>
                <span className="font-bold">{activePlaylist.tracks.length} músicas salvas</span>
                
                {activePlaylistId !== 'default' && (
                  <button 
                    onClick={() => handleDeletePlaylist(activePlaylist.id, activePlaylist.name)}
                    className="flex items-center gap-1.5 text-red-400 hover:text-white transition-all bg-red-500/5 hover:bg-red-500 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-red-500/20"
                  >
                    <Trash2 size={14} />
                    Excluir Playlist
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tracks Table */}
          <div className="w-full overflow-hidden">
            {activePlaylist.tracks.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-900/50">
                    <th className="py-5 px-2 md:px-4 w-12 text-center">#</th>
                    <th className="py-5 px-2 md:px-4">Título / Artista</th>
                    <th className="py-5 px-4 hidden lg:table-cell">Álbum</th>
                    <th className="py-5 px-4 w-24 text-center"><Clock size={16} className="mx-auto" /></th>
                    <th className="py-5 px-2 md:px-4 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/30">
                  {activePlaylist.tracks.map((track, index) => (
                    <tr 
                      key={track.id}
                      className="group hover:bg-slate-900/60 transition-all cursor-pointer"
                    >
                      <td 
                        onClick={() => playTrack(track, activePlaylist.tracks)}
                        className="py-5 px-2 md:px-4 text-center text-slate-500 font-black group-hover:text-emerald-400 transition-colors"
                      >
                        {index + 1}
                      </td>
                      <td onClick={() => playTrack(track, activePlaylist.tracks)} className="py-5 px-2 md:px-4">
                        <div className="flex items-center gap-3 md:gap-5">
                          <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0 shadow-2xl overflow-hidden rounded-xl border border-white/5">
                            <img src={track.album.cover_small} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                            <div className="absolute inset-0 bg-emerald-500/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play size={18} fill="white" className="text-white" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-200 group-hover:text-emerald-400 transition-colors truncate text-sm md:text-lg tracking-tight">{track.title}</p>
                            <p className="text-[10px] md:text-xs text-slate-500 font-bold truncate mt-0.5">{track.artist.name}</p>
                          </div>
                        </div>
                      </td>
                      <td onClick={() => playTrack(track, activePlaylist.tracks)} className="py-5 px-4 hidden lg:table-cell text-slate-400 text-sm font-medium truncate max-w-xs">
                        {track.album.title}
                      </td>
                      <td onClick={() => playTrack(track, activePlaylist.tracks)} className="py-5 px-4 text-center text-slate-500 font-bold tabular-nums">
                        {formatDuration(track.duration)}
                      </td>
                      <td className="py-5 px-2 md:px-4 text-right">
                        <button 
                          onClick={(e) => handleRemoveTrack(e, track.id, track.title)}
                          className="text-slate-600 hover:text-red-500 transition-all p-2.5 rounded-full hover:bg-red-500/10 focus:outline-none group/btn"
                          title="Remover desta playlist"
                        >
                          <Trash2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-24 md:py-40 flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-700">
                <div className="w-28 h-28 md:w-40 md:h-40 bg-slate-900/60 rounded-full flex items-center justify-center mb-10 border border-slate-800/50 shadow-inner">
                  <Music className="text-slate-700 w-14 h-14 md:w-20 md:h-20 opacity-40" />
                </div>
                <h3 className="text-2xl md:text-4xl font-black text-slate-100 mb-4 tracking-tighter">Sua playlist está em silêncio</h3>
                <p className="text-slate-500 text-sm md:text-lg max-w-md mb-12 font-medium">
                  Parece que você ainda não adicionou nenhuma música a esta coleção. Que tal explorar novos sucessos?
                </p>
                <button 
                  onClick={() => setView?.(View.HOME)}
                  className="flex items-center gap-4 bg-emerald-500 text-slate-950 px-10 py-4 rounded-full font-black text-sm md:text-base uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-emerald-500/20 active:scale-95"
                >
                  <Search size={20} strokeWidth={3} />
                  Encontrar Músicas
                  <ArrowRight size={20} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-40 opacity-20 text-center grayscale">
          <Music size={120} strokeWidth={1} className="mb-10 mx-auto" />
          <p className="text-3xl font-black tracking-tighter">Selecione uma playlist para começar</p>
        </div>
      )}
    </div>
  );
};

export default Playlists;
