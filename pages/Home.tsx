import React, { useEffect, useState, useCallback, useRef } from 'react';
import { deezerService } from '../services/deezerService';
import { Track, View } from '../types';
import TrackCard from '../components/TrackCard';
import { TrendingUp, Radio, RefreshCcw, Loader2, Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface HomeProps {
  setView?: (view: View) => void;
}

const Home: React.FC<HomeProps> = () => {
  const { playTrack } = usePlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usamos Refs para evitar que loadData seja recriado em cada renderização
  const trackIndexRef = useRef(0);
  const currentQueryRef = useRef<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const keywords = ['hits 2025', 'top brasil', 'pop international', 'rock classics', 'dance hits'];

  const loadData = useCallback(async (isRefresh = false, isInitial = false) => {
    if (isRefresh) {
      setLoading(true);
      trackIndexRef.current = 0;
    } else {
      setLoadingMore(true);
    }

    setError(null);

    try {
      let newTracks: Track[] = [];

      if (isRefresh) {
        if (isInitial) {
          const [chartTracks, artistsData] = await Promise.all([
            deezerService.getChartTracks(0),
            deezerService.getTopArtists()
          ]);
          newTracks = chartTracks;
          setArtists(artistsData);
          currentQueryRef.current = null;
        } else {
          const shouldFetchCharts = Math.random() > 0.5;
          if (shouldFetchCharts) {
            newTracks = await deezerService.getChartTracks(0);
            currentQueryRef.current = null;
          } else {
            const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
            newTracks = await deezerService.searchTracks(randomKeyword, 0);
            currentQueryRef.current = randomKeyword;
          }
        }
      } else {
        if (currentQueryRef.current) {
          newTracks = await deezerService.searchTracks(currentQueryRef.current, trackIndexRef.current);
        } else {
          newTracks = await deezerService.getChartTracks(trackIndexRef.current);
        }
      }

      setTracks(prev => isRefresh ? newTracks : [...prev, ...newTracks]);
      trackIndexRef.current += newTracks.length;
    } catch (err: any) {
      setError("Erro ao carregar músicas. Tente novamente.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []); // Dependências limpas para evitar loops

  useEffect(() => {
    loadData(true, true);
  }, [loadData]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !loadingMore && tracks.length > 0) {
          loadData(false);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loading, loadingMore, tracks.length, loadData]);

  return (
    <div className="p-4 md:p-8 space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-emerald-950 p-10 border border-white/10">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">O som que move você</h1>
          <button onClick={() => loadData(true)} className="px-8 py-4 bg-white text-emerald-950 font-black rounded-full hover:scale-105 transition-transform">
            Atualizar Tudo
          </button>
        </div>
      </section>

      {/* Artistas */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <Radio className="text-emerald-400" />
          <h2 className="text-3xl font-black text-slate-100">Artistas Populares</h2>
        </div>
        <div className="flex gap-8 overflow-x-auto pb-8 custom-scrollbar-x">
          {artists.map(artist => (
            <div key={artist.id} className="flex-shrink-0 text-center w-40">
              <img src={artist.picture_medium} className="w-40 h-40 rounded-full mb-4 object-cover ring-4 ring-slate-900" alt={artist.name} />
              <p className="font-bold text-slate-100">{artist.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tracks */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="text-emerald-400" />
          <h2 className="text-3xl font-black text-slate-100">Descobertas</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {tracks.map((track, i) => (
            <TrackCard key={`${track.id}-${i}`} track={track} contextTracks={tracks} />
          ))}
        </div>
        <div ref={observerTarget} className="h-24 flex items-center justify-center">
          {loadingMore && <Loader2 className="animate-spin text-emerald-500" />}
        </div>
      </section>
    </div>
  );
};

export default Home;