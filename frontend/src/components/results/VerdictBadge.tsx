import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, HelpCircle } from 'lucide-react';
import type { Verdict } from '../../types';
import { VERDICT_CONFIG } from '../../types';

interface VerdictBadgeProps {
  verdict: Verdict;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ICON_MAP = {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  HelpCircle,
};

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  showDescription = false,
  size = 'md',
}) => {
  const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG['cannot_confirm'];
  const IconComponent = ICON_MAP[config.icon as keyof typeof ICON_MAP] || HelpCircle;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-4 py-1.5 text-sm font-semibold gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center rounded-full border shadow-2xs font-medium uppercase tracking-wider ${config.bgColor} ${config.color} ${sizeClasses}`}
      >
        <IconComponent className={`${iconSizes} shrink-0`} />
        <span>{config.label}</span>
      </span>
      {showDescription && (
        <span className="text-[11px] text-slate-500 font-normal">
          {config.description}
        </span>
      )}
    </div>
  );
};
