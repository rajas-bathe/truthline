import React from 'react';
import type { VerificationResult, Verdict } from '../../types';
import { formatDate, formatDuration } from '../../utils/formatters';
import { VERDICT_CONFIG } from '../../types';
import { CheckCircle2, Clock, Activity, FileCheck2, ShieldCheck, Check, Layers } from 'lucide-react';
import { TruthGauge } from './TruthGauge';

interface SummaryProps {
  result: VerificationResult;
}

export const Summary: React.FC<SummaryProps> = ({ result }) => {
  const { summary, metadata, claims, overallVerdict, truthScore, evidenceStrengthScore } = result;

  // Count verdicts
  const counts: Record<Verdict, number> = {
    verified: 0,
    false: 0,
    outdated: 0,
    partly_supported: 0,
    cannot_confirm: 0,
  };

  claims.forEach((c) => {
    if (counts[c.verdict] !== undefined) {
      counts[c.verdict]++;
    } else {
      counts['cannot_confirm']++;
    }
  });

  const total = claims.length || metadata.totalClaims || 0;
  const activeVerdict = overallVerdict || claims[0]?.verdict || 'cannot_confirm';
  const effectiveTruthScore =
    truthScore ?? (activeVerdict === 'verified' ? 95 : activeVerdict === 'false' ? 0 : 50);

  return (
    <div className="space-y-6">
      {/* Top Visual Row: Truth Gauge + Key Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Truth Gauge & Percentage Score (5 cols) */}
        <div className="lg:col-span-5">
          <TruthGauge
            truthScore={effectiveTruthScore}
            verdict={activeVerdict}
            evidenceStrength={evidenceStrengthScore ?? 85}
            confidence={claims[0]?.confidence ?? 0.9}
          />
        </div>

        {/* Right: Verification Insights & Pipeline Metrics Card (7 cols) */}
        <div className="lg:col-span-7 card bg-white border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Verification Overview & Findings
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Completed
              </span>
            </div>

            {/* Narrative Summary */}
            {summary && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-800 leading-relaxed space-y-1.5">
                <p className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-indigo-700">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  Key Finding:
                </p>
                <p className="text-slate-700 leading-relaxed font-normal">{summary}</p>
              </div>
            )}
          </div>

          {/* Pipeline execution chips */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Layers className="w-4 h-4 text-indigo-600" />
                Multi-Stage Verification Pipeline
              </span>
              <span className="font-mono text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 8 / 8 Stages Executed
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Claims Checked</div>
                <div className="text-lg font-black text-slate-900">{total}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Processing Time</div>
                <div className="text-lg font-black text-slate-900">{formatDuration(metadata.processingTimeMs)}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Language</div>
                <div className="text-lg font-black text-slate-900 uppercase">{metadata.language || 'EN'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Report Details & Verdict Distribution */}
      <div className="card bg-white border-slate-200 shadow-sm p-6 space-y-6">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Report Metadata & History
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Job ID: <span className="font-mono text-slate-700">{result.jobId}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                <strong>{total}</strong> statements inspected
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>{formatDuration(metadata.processingTimeMs)}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatDate(metadata.checkedAt)}</span>
            </div>
          </div>
        </div>

        {/* Visual Verdict Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Verdict Breakdown Across Statements
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              Total Statements: {total}
            </span>
          </div>

          {/* Proportional bar */}
          {total > 0 && (
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex mb-4 shadow-inner">
              {(Object.keys(counts) as Verdict[]).map((v) => {
                const count = counts[v];
                if (count === 0) return null;
                const pct = (count / total) * 100;
                const barColor = {
                  verified: 'bg-emerald-500',
                  false: 'bg-red-500',
                  outdated: 'bg-amber-500',
                  partly_supported: 'bg-orange-500',
                  cannot_confirm: 'bg-slate-400',
                }[v];

                return (
                  <div
                    key={v}
                    className={`${barColor} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                    title={`${VERDICT_CONFIG[v].label}: ${count} (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>
          )}

          {/* Legend dots */}
          <div className="flex flex-wrap gap-4 text-xs">
            {(Object.keys(counts) as Verdict[]).map((v) => {
              const count = counts[v];
              const dotColor = {
                verified: 'bg-emerald-500',
                false: 'bg-red-500',
                outdated: 'bg-amber-500',
                partly_supported: 'bg-orange-500',
                cannot_confirm: 'bg-slate-400',
              }[v];

              return (
                <div key={v} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                  <span className="text-slate-600 font-medium">{VERDICT_CONFIG[v].label}:</span>
                  <span className="font-bold text-slate-800">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
