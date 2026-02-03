import React, { useEffect, useState, useCallback, useRef } from 'react';
import { deezerService } from '../services/deezerService';
import { Track, View } from '../types';
import TrackCard from '../components/TrackCard';
import { TrendingUp, Radio, RefreshCcw, Play, Loader2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface HomeProps {
  setView?: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ setView }) => {
  const { playTrack } = usePlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchingArtist, setFetchingArtist] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [currentQuery, setCurrentQuery] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const keywords = ['hits 2025', 'top brasil', 'pop international', 'rock classics', 'dance hits', 'lofi hip hop', 'viral tracks', 'rnb party', 'reggae vibe', 'electronic 2024', 'jazz smooth', 'workout energy'];

  const loadData = useCallback(async (isRefresh = false, isInitial = false) => {
    if (isRefresh) {
      setLoading(true);
      setTrackIndex(0);
      setTracks([]);
      const scrollContainer = document.getElementById('main-content-area');
      if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLoadingMore(true);
    }

    setError(null);

    try {
      const currentIndex = isRefresh ? 0 : trackIndex;
      let newTracks: Track[] = [];

      if (isRefresh) {
        if (isInitial) {
          const [chartTracks, artistsData] = await Promise.all([
            deezerService.getChartTracks(0),
            deezerService.getTopArtists()
          ]);
          newTracks = chartTracks;
          setArtists(artistsData);
          setCurrentQuery(null);
        } else {
          const shouldFetchCharts = Math.random() > 0.5;
          if (shouldFetchCharts) {
            newTracks = await deezerService.getChartTracks(0);
            setCurrentQuery(null);
          } else {
            const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
            newTracks = await deezerService.searchTracks(randomKeyword, 0);
            setCurrentQuery(randomKeyword);
          }
        }
      } else {
        if (currentQuery) {
          newTracks = await deezerService.searchTracks(currentQuery, currentIndex);
        } else {
          newTracks = await deezerService.getChartTracks(currentIndex);
        }
      }

      setTracks(prev => isRefresh ? newTracks : [...prev, ...newTracks]);
      setTrackIndex(prev => isRefresh ? newTracks.length : prev + newTracks.length);
    } catch (err: any) {
      console.error("Error loading music:", err);
      setError(err.message || "Erro ao carregar as músicas.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [trackIndex, currentQuery]);

  useEffect(() => {
    loadData(true, true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !loadingMore && tracks.length > 0) {
          loadData(false);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loading, loadingMore, tracks.length, loadData]);

  const handleArtistClick = async (artistId: number) => {
    if (fetchingArtist === artistId) return;

    setFetchingArtist(artistId);
    try {
      const topTracks = await deezerService.getArtistTopTracks(artistId);

      if (topTracks && topTracks.length > 0) {
        // Mapeamento completo para respeitar a interface Track do seu types.ts
        const formattedTracks: Track[] = topTracks.map(t => ({
          ...t,
          id: t.id,
          title: t.title,
          title_short: t.title_short || t.title, // Resolve o erro TS2322
          preview: t.preview,
          duration: t.duration,
          artist: t.artist,
          album: t.album
        }));

        playTrack(formattedTracks[0], formattedTracks);
      }
    } catch (err) {
      console.error("Erro ao buscar músicas do artista:", err);
    } finally {
      setFetchingArtist(null);
    }
  };

  const handleListenNow = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  if (loading && tracks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Sintonizando GSA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 md:space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-emerald-950 p-6 md:p-10 shadow-2xl border border-white/10">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-emerald-400/20 text-emerald-200 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full mb-4 md:mb-6 border border-emerald-400/30">
            Bombando Agora
          </span>
          <h1 className="text-3xl md:text-6xl font-black mb-4 md:mb-6 tracking-tighter leading-none">O som que move você</h1>
          <p className="text-emerald-100 text-sm md:text-lg mb-6 md:mb-8 opacity-90 leading-relaxed font-medium">
            Sua trilha sonora definitiva sem interrupções. Descubra os maiores sucessos mundiais em alta fidelidade.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleListenNow}
              className="px-6 md:px-10 py-3 md:py-4 bg-white text-emerald-950 text-sm md:text-base font-black rounded-full hover:scale-105 transition-transform shadow-xl hover:bg-emerald-50"
            >
              Ouvir Agora
            </button>
            <button
              onClick={() => loadData(true)}
              disabled={loading}
              className="px-6 md:px-8 py-3 md:py-4 bg-emerald-800/40 text-white text-sm md:text-base font-black rounded-full hover:bg-emerald-700 transition-colors border border-emerald-400/30 flex items-center gap-2 backdrop-blur-sm group"
            >
              <RefreshCcw size={18} className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
              <span className="hidden sm:inline">Atualizar Tudo</span>
              <span className="sm:hidden">Atualizar</span>
            </button>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 md:w-96 md:h-96 bg-emerald-400/20 rounded-full blur-[100px] animate-pulse" />
      </section>

      {/* Featured Artists */}
      <section>
        <div className="flex items-center gap-3 mb-6 md:mb-8 px-2">
          <Radio className="text-emerald-400 w-6 h-6 md:w-8 md:h-8" />
          <h2 className="text-xl md:text-4xl font-black text-slate-100 tracking-tighter">Artistas Populares</h2>
        </div>

        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-8 px-2 -mx-2 custom-scrollbar-x snap-x scroll-pl-2">
          {artists.map((artist) => (
            <div
              key={artist.id}
              onClick={() => handleArtistClick(artist.id)}
              className="flex-shrink-0 group cursor-pointer text-center w-32 md:w-52 p-3 md:p-5 rounded-3xl transition-all duration-500 hover:bg-slate-900/60 hover:-translate-y-2 relative snap-start"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/10 rounded-3xl transition-all duration-500" />
              <div className="relative mb-3 md:mb-6 mx-auto">
                <div className="relative w-24 h-24 md:w-40 md:h-40 mx-auto overflow-hidden rounded-full shadow-2xl ring-2 md:ring-4 ring-slate-950 group-hover:ring-emerald-500/50 transition-all duration-500">
                  <img
                    src={artist.picture_medium}
                    alt={artist.name}
                    className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                    {fetchingArtist === artist.id ? (
                      <Loader2 size={32} className="text-emerald-500 animate-spin" />
                    ) : (
                      <Play size={32} className="text-emerald-500 drop-shadow-lg" fill="currentColor" />
                    )}
                  </div>
                </div>
              </div>
              <p className="font-black text-slate-100 text-xs md:text-lg truncate group-hover:text-emerald-400 transition-colors">
                {artist.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Tracks */}
      <section>
        <div className="flex items-center gap-3 mb-6 px-2">
          <TrendingUp className="text-emerald-400 w-6 h-6 md:w-8 md:h-8" />
          <h2 className="text-xl md:text-4xl font-black text-slate-100 tracking-tighter">Descobertas</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
          {tracks.map((track, index) => (
            <TrackCard key={`${track.id}-${index}`} track={track} contextTracks={tracks} />
          ))}
        </div>

        <div ref={observerTarget} className="w-full h-24 flex items-center justify-center mt-8">
          {loadingMore && <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />}
        </div>
      </section>
    </div>
  );
};

export default Home;