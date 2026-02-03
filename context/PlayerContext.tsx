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
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    localStorage.setItem('gsa_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const revokeOldUrl = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const playTrack = async (track: Track, fromQueue?: Track[]) => {
    if (!audioRef.current) return;

    if (!track.preview) {
      alert("Prévia não disponível.");
      return;
    }

    try {
      if (fromQueue && fromQueue.length > 0) setQueue(fromQueue);

      audioRef.current.pause();
      revokeOldUrl();
      setCurrentTrack(track);

      // Usando AllOrigins que é mais estável para deploy em HTTPS
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(track.preview)}`;

      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Erro no Proxy");

      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);
      blobUrlRef.current = localUrl;

      audioRef.current.src = localUrl;
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.warn("Falha no Proxy, tentando link direto...");
      try {
        if (audioRef.current) {
          audioRef.current.src = track.preview;
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (e) {
        console.error("Falha total no playback");
      }
    }
  };

  const togglePlay = () => {
    if (!currentTrack || !audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    const nextIndex = isShuffle ? Math.floor(Math.random() * queue.length) : (currentIndex + 1) % queue.length;
    playTrack(queue[nextIndex]);
  };

  const prevTrack = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    playTrack(queue[prevIndex]);
  };

  const closePlayer = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    revokeOldUrl();
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  const seek = (time: number) => { if (audioRef.current) audioRef.current.currentTime = time; };
  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);

  const addToPlaylist = (track: Track, playlistId: string) => {
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, tracks: p.tracks.some(t => t.id === track.id) ? p.tracks : [...p.tracks, track] } : p));
  };

  const removeFromPlaylist = (trackId: number, playlistId: string) => {
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) } : p));
  };

  const createPlaylist = (name: string) => {
    const id = Date.now().toString();
    setPlaylists(prev => [...prev, { id, name, tracks: [] }]);
    return id;
  };

  const deletePlaylist = (id: string) => { if (id !== 'default') setPlaylists(prev => prev.filter(p => p.id !== id)); };

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
        onEnded={() => isRepeat ? (audioRef.current!.currentTime = 0, audioRef.current!.play()) : nextTrack()}
      />
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};