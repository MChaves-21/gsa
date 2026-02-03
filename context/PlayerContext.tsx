
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Track, Playlist } from '../types';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  volume: number;
  queue: Track[];
  playlists: Playlist[];
  playTrack: (track: Track, fromQueue?: Track[]) => void;
  togglePlay: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setVolume: (v: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  addToPlaylist: (track: Track, playlistId: string) => void;
  removeFromPlaylist: (trackId: number, playlistId: string) => void;
  createPlaylist: (name: string) => string;
  deletePlaylist: (id: string) => void;
  closePlayer: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [queue, setQueue] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('gsa_playlists');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Meus Favoritos', tracks: [] }];
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    localStorage.setItem('gsa_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playTrack = (track: Track, fromQueue?: Track[]) => {
    if (fromQueue && fromQueue.length > 0) setQueue(fromQueue);
    setCurrentTrack(track);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = track.preview;
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(e => console.error("Playback failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);

  const nextTrack = () => {
    if (queue.length === 0 || !currentTrack) return;

    if (isRepeat) {
      seek(0);
      audioRef.current?.play();
      return;
    }

    let nextIndex;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }

    playTrack(queue[nextIndex]);
  };

  const prevTrack = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    playTrack(queue[prevIndex]);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const addToPlaylist = (track: Track, playlistId: string) => {
    setPlaylists(prev => {
      const updated = prev.map(p => {
        if (p.id === playlistId) {
          const exists = p.tracks.some(t => t.id === track.id);
          return { ...p, tracks: exists ? p.tracks : [...p.tracks, track] };
        }
        return p;
      });
      return updated;
    });
  };

  const removeFromPlaylist = (trackId: number, playlistId: string) => {
    setPlaylists(prev => {
      const updated = prev.map(p => {
        if (p.id === playlistId) {
          return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
        }
        return p;
      });
      return updated;
    });
  };

  const createPlaylist = (name: string): string => {
    const id = Date.now().toString();
    const newPlaylist: Playlist = {
      id,
      name,
      tracks: []
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    return id;
  };

  const deletePlaylist = (id: string) => {
    if (id === 'default') return;
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, isShuffle, isRepeat, volume, queue, playlists,
      playTrack, togglePlay, toggleShuffle, toggleRepeat, setVolume, nextTrack, prevTrack,
      addToPlaylist, removeFromPlaylist, createPlaylist, deletePlaylist, closePlayer,
      audioRef, currentTime, duration, seek
    }}>
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={nextTrack}
      />
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};
