import React from 'react';
import { Languages } from 'lucide-react';

interface LanguageSelectorProps {
  value: string;
  onChange: (lang: string) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="text-xs font-medium text-slate-500 flex items-center gap-1.5 cursor-pointer">
        <Languages className="w-4 h-4 text-slate-400" />
        <span>Output Language:</span>
      </label>
      <div className="relative">
        <select
          id="language-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="appearance-none bg-white border border-slate-200 text-slate-800 text-sm font-medium rounded-lg pl-3 pr-8 py-1.5 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.native} ({lang.label})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
