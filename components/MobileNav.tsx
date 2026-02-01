
import React from 'react';
import { Home, Search, Library, Settings } from 'lucide-react';
import { View } from '../types';

interface MobileNavProps {
  currentView: View;
  setView: (view: View) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, setView }) => {
  const items = [
    { id: View.HOME, label: 'Início', icon: Home },
    { id: View.SEARCH, label: 'Buscar', icon: Search },
    { id: View.PLAYLISTS, label: 'Biblioteca', icon: Library },
    { id: View.SETTINGS, label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 z-[60] flex items-center justify-around px-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
            currentView === item.id ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileNav;
