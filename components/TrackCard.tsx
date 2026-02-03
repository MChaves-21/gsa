
import React, { useState, useRef, useEffect } from 'react';
import { Play, ListPlus, Heart, Check, MoreVertical } from 'lucide-react';
import { Track } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface TrackCardProps {
  track: Track;
  contextTracks?: Track[];
}

const TrackCard: React.FC<TrackCardProps> = ({ track, contextTracks = [] }) => {
  const { playTrack, currentTrack, playlists, addToPlaylist, removeFromPlaylist } = usePlayer();
  const [showMenu, setShowMenu] = useState(false);
  const [addedStatus, setAddedStatus] = useState<string | null>(null);
  const [heartAnimate, setHeartAnimate] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isCurrent = currentTrack?.id === track.id;

  // Encontra a playlist de favoritos (primeira da lista)
  const isFavorite = playlists[0]?.tracks.some(t => t.id === track.id);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setHeartAnimate(true);
    setTimeout(() => setHeartAnimate(false), 400);

    if (isFavorite) {
      removeFromPlaylist(track.id, playlists[0].id);
    } else {
      addToPlaylist(track, playlists[0].id);
    }
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleAddToPlaylist = (e: React.MouseEvent, playlistId: string) => {
    e.preventDefault();
    e.stopPropagation();
    addToPlaylist(track, playlistId);
    setShowMenu(false);
    setAddedStatus(playlistId);
    setTimeout(() => setAddedStatus(null), 2000);
  };

  return (
    <div className="group bg-slate-900/40 p-3 rounded-xl hover:bg-slate-800/60 transition-all duration-300 border border-slate-800/50 relative">
      {/* Imagem do Álbum - Limpa */}
      <div className="relative aspect-square mb-3 rounded-lg overflow-hidden shadow-lg bg-slate-800">
        <img
          src={track.album.cover_medium}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay de Play */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => playTrack(track, contextTracks)}
            className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 shadow-xl hover:scale-110 transition-transform"
          >
            <Play size={20} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Informações e Ações */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className={`font-bold truncate text-sm sm:text-base mb-0.5 ${isCurrent ? 'text-emerald-400' : 'text-slate-100'}`}>
            {track.title}
          </h3>
          <p className="text-slate-400 text-xs truncate font-medium">{track.artist.name}</p>
        </div>

        <div className="flex items-center gap-1" ref={menuRef}>
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${isFavorite
              ? 'text-red-500'
              : 'text-slate-500 hover:text-white opacity-0 group-hover:opacity-100'
              } ${heartAnimate ? 'animate-heart-pop' : ''}`}
            title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} strokeWidth={isFavorite ? 0 : 2} />
          </button>

          <div className="relative">
            <button
              onClick={handleMenuToggle}
              className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${showMenu || addedStatus
                ? 'text-emerald-500'
                : 'text-slate-500 hover:text-white opacity-0 group-hover:opacity-100'
                }`}
              title="Adicionar à Playlist"
            >
              {addedStatus ? <Check size={16} strokeWidth={3} /> : <MoreVertical size={16} />}
            </button>

            {showMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-30 animate-in fade-in zoom-in-95 duration-200">
                <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 mb-1">Adicionar à Playlist</p>
                {playlists.map(pl => (
                  <button
                    key={pl.id}
                    onClick={(e) => handleAddToPlaylist(e, pl.id)}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors flex items-center justify-between group/item"
                  >
                    <span className="truncate">{pl.name}</span>
                    {pl.tracks.some(t => t.id === track.id) && <Check size={12} className="text-emerald-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackCard;
