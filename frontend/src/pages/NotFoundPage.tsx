import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, History, HelpCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* 404 Visual Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <HelpCircle className="w-12 h-12 stroke-[1.75]" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-500 text-white shadow-xs">
            404
          </span>
        </div>

        {/* Heading & Explanation */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Claim Record Not Found
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto">
            The verification report, URL, or page you are looking for does not exist, has expired, or the link was typed incorrectly.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 py-2.5 px-6"
          >
            <Home className="w-4 h-4" />
            <span>Verify a Claim</span>
          </Link>

          <Link
            to="/history"
            className="w-full sm:w-auto btn-secondary flex items-center justify-center gap-2 py-2.5 px-6"
          >
            <History className="w-4 h-4" />
            <span>View Past Reports</span>
          </Link>
        </div>

        {/* Informative Tip Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 text-left flex items-start gap-3">
          <Search className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p>
            Looking to check a viral WhatsApp message, screenshot, PDF, or audio? Go to the{' '}
            <Link to="/" className="text-indigo-600 font-semibold hover:underline">
              home page
            </Link>{' '}
            to run our multi-source verification pipeline.
          </p>
        </div>
      </div>
    </div>
  );
};
