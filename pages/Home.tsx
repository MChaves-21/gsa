import React, { useEffect, useState, useCallback, useRef } from 'react';
import { deezerService } from '../services/deezerService';
import { Track, View } from '../types';
import TrackCard from '../components/TrackCard';
import { TrendingUp, Radio, RefreshCcw, Play, Loader2, Music } from 'lucide-react';
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

  const keywords = [
    'hits 2025', 'top brasil', 'pop international', 'rock classics',
    'dance hits', 'lofi hip hop', 'viral tracks', 'rnb party',
    'reggae vibe', 'electronic 2024', 'jazz smooth', 'workout energy'
  ];

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
          // Busca inicial: Charts + Artistas
          const [chartTracks, artistsData] = await Promise.all([
            deezerService.getChartTracks(0),
            deezerService.getTopArtists()
          ]);
          newTracks = chartTracks;
          setArtists(artistsData);
          setCurrentQuery(null);
        } else {
          // Atualização manual: Aleatoriedade para variar o conteúdo
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
        // Scroll Infinito: Continua a busca atual
        if (currentQuery) {
          newTracks = await deezerService.searchTracks(currentQuery, currentIndex);
        } else {
          newTracks = await deezerService.getChartTracks(currentIndex);
        }
      }

      setTracks(prev => isRefresh ? newTracks : [...prev, ...newTracks]);
      setTrackIndex(prev => isRefresh ? newTracks.length : prev + newTracks.length);
    } catch (err: any) {
      console.error("Erro ao carrerar dados no Home:", err);
      setError("Não foi possível carregar as músicas. Verifique sua conexão.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [trackIndex, currentQuery]);

  useEffect(() => {
    loadData(true, true);
  }, []);

  // Intersection Observer para Scroll Infinito
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
        playTrack(topTracks[0], topTracks);
      }
    } catch (err) {
      console.error("Erro ao carregar músicas do artista:", err);
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
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Sintonizando GSA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 md:space-y-12 animate-in fade-in duration-700">

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 to-slate-950 p-6 md:p-12 shadow-2xl border border-white/10">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md text-emerald-300 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full mb-6 border border-white/10">
            <Music size={12} /> Bombando no GSA
          </span>
          <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter leading-[0.9] text-white">
            O som que <br /> <span className="text-emerald-400">liberta você.</span>
          </h1>
          <p className="text-emerald-100/80 text-sm md:text-lg mb-8 leading-relaxed font-medium">
            Explore milhões de faixas em alta fidelidade. Crie sua vibe, defina seu ritmo e deixe a música fluir.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleListenNow}
              className="px-8 py-4 bg-emerald-500 text-slate-950 text-sm md:text-base font-black rounded-full hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              Começar a Ouvir
            </button>
            <button
              onClick={() => loadData(true)}
              disabled={loading}
              className="px-6 py-4 bg-slate-900/50 text-white text-sm md:text-base font-black rounded-full hover:bg-slate-800 transition-all border border-white/10 flex items-center gap-2 group"
            >
              <RefreshCcw size={18} className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"}`} />
              Descobrir Novo
            </button>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-[120px]" />
      </section>

      {/* Artistas Populares */}
      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Radio className="text-emerald-400 w-6 h-6" />
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter">Artistas em Destaque</h2>
          </div>
        </div>

        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-6 px-2 -mx-2 custom-scrollbar-x snap-x">
          {artists.map((artist) => (
            <div
              key={artist.id}
              onClick={() => handleArtistClick(artist.id)}
              className="flex-shrink-0 group cursor-pointer w-32 md:w-48 snap-start"
            >
              <div className="relative aspect-square mb-4">
                <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-slate-900 group-hover:ring-emerald-500/50 transition-all duration-500 shadow-2xl">
                  <img
                    src={artist.picture_medium}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    {fetchingArtist === artist.id ? (
                      <Loader2 className="animate-spin text-white" size={32} />
                    ) : (
                      <Play size={32} className="text-white fill-current" />
                    )}
                  </div>
                </div>
              </div>
              <p className="font-bold text-slate-200 text-sm md:text-base text-center truncate group-hover:text-emerald-400 transition-colors">
                {artist.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Grid de Músicas */}
      <section>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <TrendingUp className="text-emerald-400 w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter">Explorar Feed</h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
          {tracks.map((track, index) => (
            <TrackCard
              key={`${track.id}-${index}`}
              track={track}
              contextTracks={tracks}
            />
          ))}
        </div>

        {/* Alvo do Scroll Infinito */}
        <div ref={observerTarget} className="w-full h-32 flex items-center justify-center mt-12 border-t border-white/5">
          {loadingMore && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Carregando mais...</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;