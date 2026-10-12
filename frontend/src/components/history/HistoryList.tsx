import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { VerificationJob, Verdict } from '../../types';
import { getFileTypeIcon, formatDate, truncateText } from '../../utils/formatters';
import { VERDICT_CONFIG } from '../../types';
import { ChevronRight, ArrowUpRight, History } from 'lucide-react';

interface HistoryListProps {
  jobs: VerificationJob[];
  loading?: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({ jobs, loading = false }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-slate-200" />
              <div className="space-y-2 flex-1 max-w-md">
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 rounded-md w-1/3" />
              </div>
            </div>
            <div className="w-16 h-6 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="card text-center p-12 border-dashed border-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">No verifications yet</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
          You haven't checked any claims yet. Submit text, an image, or a URL to see history here.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <span>Start Checking</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const IconComponent = getFileTypeIcon(job.input_type);
        const firstLine = job.input_text
          ? job.input_text.split('\n')[0].trim()
          : `${job.input_type.toUpperCase()} verification`;

        // Calculate verdict summary if results exist
        const claims = job.results?.claims || [];
        const verdictCounts: Partial<Record<Verdict, number>> = {};
        claims.forEach((c) => {
          verdictCounts[c.verdict] = (verdictCounts[c.verdict] || 0) + 1;
        });

        return (
          <div
            key={job.id}
            onClick={() => navigate(`/results/${job.id}`)}
            className="card-hover p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-900 truncate">
                    {truncateText(firstLine, 70)}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                    {job.input_type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{formatDate(job.created_at)}</span>
                  {claims.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{claims.length} claims</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Verdict summary pills on right */}
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              {claims.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {(Object.keys(verdictCounts) as Verdict[]).map((v) => {
                    const count = verdictCounts[v];
                    if (!count) return null;
                    const config = VERDICT_CONFIG[v];
                    return (
                      <span
                        key={v}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${config.bgColor} ${config.color}`}
                        title={`${config.label}: ${count}`}
                      >
                        {count} {config.label}
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="text-slate-400 group-hover:text-indigo-600 transition">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
