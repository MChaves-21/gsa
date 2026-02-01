
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className={`h-5 w-5 ${isLoading ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar músicas, artistas ou álbuns..."
        className="block w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-800 rounded-full text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-lg text-sm sm:text-base"
      />
      {query && (
        <button 
          type="button" 
          onClick={() => setQuery('')}
          className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-slate-300"
        >
          <X size={18} />
        </button>
      )}
    </form>
  );
};

export default SearchBar;
