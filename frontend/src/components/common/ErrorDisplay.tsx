import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="card my-6 border-red-200 bg-red-50/60 p-6 sm:p-8 text-center flex flex-col items-center justify-center animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-red-900 mb-1">Verification Failed</h3>
      <p className="text-sm text-red-700 max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-red-700 border border-red-200 text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
