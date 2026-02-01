
import React from 'react';
import { Track } from '../types';
import TrackCard from '../components/TrackCard';
import { Search } from 'lucide-react';

interface SearchResultsProps {
  tracks: Track[];
  query: string;
  isLoading: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ tracks, query, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!query) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-50">
        <Search size={80} strokeWidth={1} className="mb-4" />
        <p className="text-xl font-medium">Busque suas músicas favoritas</p>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32">
      <h2 className="text-3xl font-black mb-8 text-slate-100 flex items-center gap-4">
        Resultados para <span className="text-emerald-400">"{query}"</span>
      </h2>
      
      {tracks.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} contextTracks={tracks} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg">Nenhum resultado encontrado para sua busca.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
