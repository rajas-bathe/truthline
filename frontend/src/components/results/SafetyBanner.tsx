import React from 'react';
import type { Verdict } from '../../types';
import { AlertOctagon, CheckCircle2, History, AlertTriangle, HelpCircle, ArrowRight } from 'lucide-react';

interface SafetyBannerProps {
  verdict: Verdict;
  onScrollToRebuttal?: () => void;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({ verdict, onScrollToRebuttal }) => {
  const configs = {
    false: {
      bg: 'bg-red-600 text-white',
      badgeBg: 'bg-red-800 text-red-100',
      icon: AlertOctagon,
      title: 'DO NOT FORWARD THIS MESSAGE',
      subtitle:
        'This message contains fabricated or debunked claims. Forwarding it causes unnecessary panic and spreads false information.',
      actionText: 'Copy Rebuttal to send back to sender',
    },
    verified: {
      bg: 'bg-emerald-600 text-white',
      badgeBg: 'bg-emerald-800 text-emerald-100',
      icon: CheckCircle2,
      title: 'SAFE TO SHARE: CONFIRMED FACTUAL',
      subtitle:
        'This message has been cross-referenced with official records and authoritative reporting. The key claims are factual.',
      actionText: 'View supporting evidence sources',
    },
    outdated: {
      bg: 'bg-amber-600 text-white',
      badgeBg: 'bg-amber-800 text-amber-100',
      icon: History,
      title: 'CAUTION: OUTDATED INFORMATION',
      subtitle:
        'This notice was valid in the past, but is no longer true today. Do not forward it as breaking or current news.',
      actionText: 'See historical context details',
    },
    partly_supported: {
      bg: 'bg-orange-600 text-white',
      badgeBg: 'bg-orange-800 text-orange-100',
      icon: AlertTriangle,
      title: 'MISLEADING: PARTIALLY ACCURATE',
      subtitle:
        'Contains real elements mixed with exaggerated or false assertions. Needs context before sharing.',
      actionText: 'Inspect verified vs unverified parts',
    },
    cannot_confirm: {
      bg: 'bg-slate-700 text-white',
      badgeBg: 'bg-slate-800 text-slate-200',
      icon: HelpCircle,
      title: 'UNCONFIRMED: EXERCISE SKEPTICISM',
      subtitle:
        'Insufficient credible public evidence exists to support or refute this claim at this time.',
      actionText: 'Review available search queries',
    },
  };

  const current = configs[verdict] || configs.cannot_confirm;
  const Icon = current.icon;

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${current.bg}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-xs shrink-0 mt-0.5">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black tracking-tight uppercase">
              {current.title}
            </h2>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${current.badgeBg}`}>
              Forward Advisory
            </span>
          </div>
          <p className="text-sm text-white/90 font-medium max-w-2xl leading-relaxed">
            {current.subtitle}
          </p>
        </div>
      </div>

      {onScrollToRebuttal && (
        <button
          type="button"
          onClick={onScrollToRebuttal}
          className="self-start md:self-center shrink-0 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <span>{current.actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
