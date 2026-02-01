
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, 
  Volume2, VolumeX, Shuffle, Repeat, 
  Heart, ListPlus, Check, X
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const PlayerBar: React.FC = () => {
  const { 
    currentTrack, isPlaying, togglePlay, 
    nextTrack, prevTrack, volume, setVolume,
    isShuffle, toggleShuffle, isRepeat, toggleRepeat,
    currentTime, duration, seek, playlists, addToPlaylist, removeFromPlaylist,
    closePlayer
  } = usePlayer();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [heartAnimate, setHeartAnimate] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPlaylistMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentTrack) return null;

  const isFavorite = playlists[0]?.tracks.some(t => t.id === currentTrack.id);

  const handleToggleFavorite = () => {
    setHeartAnimate(true);
    setTimeout(() => setHeartAnimate(false), 300);
    
    if (isFavorite) {
      removeFromPlaylist(currentTrack.id, playlists[0].id);
    } else {
      addToPlaylist(currentTrack, playlists[0].id);
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-20 md:h-24 glass fixed bottom-16 md:bottom-0 left-0 right-0 z-50 px-4 md:px-6 flex items-center justify-between gap-4 md:gap-8 animate-in slide-in-from-bottom duration-300">
      {/* Current Track Info */}
      <div className="flex items-center gap-3 md:gap-4 w-auto md:w-1/4 min-w-0">
        <img 
          src={currentTrack.album.cover_small} 
          alt={currentTrack.title}
          className="w-10 h-10 md:w-14 md:h-14 rounded-md shadow-lg"
        />
        <div className="min-w-0 max-w-[120px] md:max-w-none">
          <h4 className="font-bold text-slate-100 truncate text-xs md:text-base">{currentTrack.title}</h4>
          <p className="text-slate-400 text-[10px] md:text-xs truncate">{currentTrack.artist.name}</p>
        </div>
        
        <div className="hidden sm:flex items-center gap-1 ml-2">
          <button 
            onClick={handleToggleFavorite}
            className={`transition-all duration-300 p-1.5 rounded-full hover:bg-slate-800/50 ${isFavorite ? 'text-red-500' : 'text-slate-400 hover:text-white'} ${heartAnimate ? 'animate-heart-pop' : ''}`}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} strokeWidth={isFavorite ? 0 : 2} />
          </button>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex flex-col items-center flex-1 max-w-2xl">
        <div className="flex items-center gap-4 md:gap-6 mb-1 md:mb-2">
          <button 
            onClick={toggleShuffle}
            className={`transition-colors hidden lg:block ${isShuffle ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
          >
            <Shuffle size={18} />
          </button>
          <button onClick={prevTrack} className="text-slate-100 hover:text-emerald-400 transition-colors hidden sm:block">
            <SkipBack size={24} fill="currentColor" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-10 h-10 bg-slate-100 text-slate-950 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {/* Fix: removed invalid md:size prop which is not supported by Lucide React */}
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5 md:ml-1" />}
          </button>
          <button onClick={nextTrack} className="text-slate-100 hover:text-emerald-400 transition-colors">
            {/* Fix: removed invalid md:size prop which is not supported by Lucide React */}
            <SkipForward size={24} fill="currentColor" />
          </button>
          <button 
            onClick={toggleRepeat}
            className={`transition-colors hidden lg:block ${isRepeat ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
          >
            <Repeat size={18} />
          </button>
        </div>
        
        {/* Progress bar - Hidden on very small screens, simpler on mobile */}
        <div className="w-full hidden md:flex items-center gap-3">
          <span className="text-[10px] font-medium text-slate-500 tabular-nums w-10 text-right">{formatTime(currentTime)}</span>
          <div className="relative group flex-1 h-1.5 bg-slate-800 rounded-full cursor-pointer">
            <input 
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              step={0.1}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="absolute h-full bg-emerald-500 rounded-full group-hover:bg-emerald-400 transition-all"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-medium text-slate-500 tabular-nums w-10">{formatTime(duration)}</span>
        </div>

        {/* Mini progress bar for mobile */}
        <div className="md:hidden absolute top-0 left-0 right-0 h-0.5 bg-slate-800">
           <div 
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Volume & Close */}
      <div className="flex items-center justify-end gap-2 md:gap-4 w-auto md:w-1/4">
        <div className="hidden lg:flex items-center gap-2 group w-32">
          <button onClick={handleToggleMute} className="text-slate-400 hover:text-emerald-400">
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="relative flex-1 h-1 bg-slate-800 rounded-full cursor-pointer">
            <input 
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="absolute h-full bg-slate-300 rounded-full group-hover:bg-emerald-400"
              style={{ width: `${volume * 100}%` }}
            />
          </div>
        </div>
        
        <button 
          onClick={closePlayer}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-800/50 rounded-full transition-all flex items-center justify-center"
          title="Fechar player"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default PlayerBar;
