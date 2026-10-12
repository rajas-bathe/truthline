import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, History, Home } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isHistory = location.pathname === '/history';

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:bg-indigo-700 transition">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">TruthLine</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                AI VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Don't Just Forward. Verify.
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              isHome
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <Link
            to="/history"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              isHistory
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
