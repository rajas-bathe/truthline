import React from 'react';
import { Globe, AlertCircle } from 'lucide-react';

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({ value, onChange, disabled = false }) => {
  const isValidUrl = (url: string) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const hasInvalidFormat = value.trim().length > 0 && !isValidUrl(value.trim());

  return (
    <div className="space-y-2">
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          <Globe className="w-5 h-5" />
        </div>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="https://example.com/article-or-post"
          className={`w-full rounded-xl border pl-11 pr-4 py-3.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition text-base ${
            hasInvalidFormat
              ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20'
              : 'border-slate-200 bg-slate-50/50 focus:ring-indigo-500/20 focus:border-indigo-600'
          }`}
        />
      </div>

      {hasInvalidFormat && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 pl-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Please enter a valid URL including http:// or https://</span>
        </div>
      )}

      <p className="text-xs text-slate-500 pl-1">
        We will fetch the article text, extract claims, and check sources and publication context.
      </p>
    </div>
  );
};
