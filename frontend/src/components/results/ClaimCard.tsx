import React from 'react';
import type { ClaimResult, Verdict } from '../../types';
import { VerdictBadge } from './VerdictBadge';
import { EvidencePanel } from './EvidencePanel';
import { Clock, ShieldAlert, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface ClaimCardProps {
  claim: ClaimResult;
  index: number;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim, index }) => {
  const borderColors: Record<Verdict, string> = {
    false: 'border-l-4 border-l-red-500',
    verified: 'border-l-4 border-l-emerald-500',
    outdated: 'border-l-4 border-l-amber-500',
    partly_supported: 'border-l-4 border-l-orange-500',
    cannot_confirm: 'border-l-4 border-l-slate-400',
  };

  const scoreMap: Record<Verdict, number> = {
    verified: 95,
    partly_supported: 55,
    cannot_confirm: 35,
    outdated: 15,
    false: 0,
  };

  const claimTruthScore = scoreMap[claim.verdict] ?? 50;

  return (
    <div
      className={`card-hover relative overflow-hidden bg-white shadow-xs rounded-2xl border border-slate-200 ${
        borderColors[claim.verdict] || 'border-l-4 border-l-slate-400'
      } p-6 space-y-4`}
    >
      {/* Index marker & Verdict */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
            #{index + 1}
          </div>
          <VerdictBadge verdict={claim.verdict} />
        </div>

        {/* Claim Truth meter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {claim.verdict === 'false' ? (
              <span className="text-red-600 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> 0% True
              </span>
            ) : claim.verdict === 'verified' ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {claimTruthScore}% True
              </span>
            ) : (
              <span className="text-slate-600">{claimTruthScore}% True</span>
            )}
          </div>
          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                claim.verdict === 'false'
                  ? 'bg-red-500'
                  : claim.verdict === 'verified'
                  ? 'bg-emerald-500'
                  : claim.verdict === 'outdated'
                  ? 'bg-amber-500'
                  : 'bg-orange-500'
              }`}
              style={{ width: `${claimTruthScore}%` }}
            />
          </div>
          {claim.confidence !== undefined && (
            <span className="text-[11px] font-medium text-slate-400 pl-1 border-l border-slate-200">
              Conf: {Math.round(claim.confidence * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Claim statement */}
      <div className="space-y-2">
        <h4 className="text-base font-bold text-slate-900 leading-snug">
          "{claim.claimText}"
        </h4>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed font-normal">
          <span className="font-semibold text-slate-800">Factual Analysis: </span>
          {claim.explanation}
        </div>
      </div>

      {/* Temporal context callout if present */}
      {claim.temporalInfo?.isTimeSensitive && (
        <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Time context:</strong> This statement relates to{' '}
            {claim.temporalInfo.claimDate ? formatDate(claim.temporalInfo.claimDate) : 'a specific timeframe'}{' '}
            and may not represent current regulations or conditions.
          </span>
        </div>
      )}

      {/* Original span if extracted from longer text */}
      {claim.originalSpan && claim.originalSpan !== claim.claimText && (
        <div className="text-xs text-slate-400 border-l-2 border-slate-200 pl-2.5 py-0.5">
          <span className="font-semibold text-slate-500">Extracted from original text:</span> "{claim.originalSpan}"
        </div>
      )}

      {/* Evidence Panel */}
      <EvidencePanel evidence={claim.evidence || []} />
    </div>
  );
};
