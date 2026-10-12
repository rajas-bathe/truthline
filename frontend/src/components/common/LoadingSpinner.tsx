import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

const STAGES = [
  'Extracting text and media content...',
  'Identifying factual claims...',
  'Searching verified evidence and sources...',
  'Comparing dates, context, and findings...',
  'Synthesizing claim verdicts and explanations...',
];

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (message) return;
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % STAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [message]);

  const currentMessage = message || STAGES[stageIndex];

  return (
    <div className="card flex flex-col items-center justify-center p-12 text-center my-6 border-indigo-100 bg-white/90 backdrop-blur-sm shadow-md animate-fade-in">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin flex items-center justify-center" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-semibold text-slate-800">
          Analyzing Claims
        </h3>
        <p className="text-sm text-slate-600 min-h-[24px] transition-all duration-300">
          {currentMessage}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-1.5 mt-6">
        {STAGES.map((_, idx) => (
          <span
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === stageIndex && !message
                ? 'w-6 bg-indigo-600'
                : 'w-2 bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
