import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ value, onChange, disabled = false }) => {
  return (
    <div className="relative">
      <textarea
        rows={7}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Paste a forwarded message, WhatsApp text, social media post, or claim here..."
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed resize-y transition font-normal text-base leading-relaxed"
      />
      <div className="flex justify-end pt-1">
        <span className="text-xs text-slate-400 font-mono">
          {value.length.toLocaleString()} characters
        </span>
      </div>
    </div>
  );
};
