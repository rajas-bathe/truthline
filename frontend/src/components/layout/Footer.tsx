import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/50 backdrop-blur-sm py-8 text-center text-sm text-slate-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-700">TruthLine</span>
          <span>— Every claim gets a verdict you can inspect</span>
        </div>
        <div>
          &copy; {new Date().getFullYear()} TruthLine AI. Multi-source evidence-backed fact verification.
        </div>
      </div>
    </footer>
  );
};
