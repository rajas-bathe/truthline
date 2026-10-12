import React from 'react';
import { useHistory } from '../hooks/useHistory';
import { HistoryList } from '../components/history/HistoryList';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { History, RefreshCw } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { jobs, loading, error, refresh } = useHistory(30);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-indigo-600" />
            <span>Verification History</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review your previously checked messages, images, and links.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
          title="Refresh history"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && !loading && (
        <ErrorDisplay message={error} onRetry={refresh} />
      )}

      <HistoryList jobs={jobs} loading={loading} />
    </div>
  );
};
