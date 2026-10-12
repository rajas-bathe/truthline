import React from 'react';
import type { Verdict } from '../../types';
import { VERDICT_CONFIG } from '../../types';
import { ShieldAlert, ShieldCheck, HelpCircle, AlertTriangle, History } from 'lucide-react';

interface TruthGaugeProps {
  truthScore: number; // 0 to 100
  verdict: Verdict;
  evidenceStrength?: number; // 0 to 100
  confidence?: number; // 0 to 1
}

export const TruthGauge: React.FC<TruthGaugeProps> = ({
  truthScore,
  verdict,
  evidenceStrength = 85,
  confidence = 0.9,
}) => {
  // Clamp score between 0 and 100
  const score = Math.max(0, Math.min(100, Math.round(truthScore)));

  // Arc geometry:
  // Semi-circle arc with radius = 68, cx = 100, cy = 88
  // Arc length = PI * 68 = 213.63
  const radius = 68;
  const cx = 100;
  const cy = 88;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Indicator tip coordinates on arc perimeter
  const angleRad = (score / 100) * Math.PI;
  const tipX = cx - radius * Math.cos(angleRad);
  const tipY = cy - radius * Math.sin(angleRad);

  // Color mapping based on score & verdict
  let scoreColor = '#ef4444'; // Red
  let scoreBg = 'from-red-500/10 to-red-500/5 text-red-700 border-red-200';
  let statusTitle = 'DEBUNKED HOAX / FALSE';
  let StatusIcon = ShieldAlert;

  if (score >= 75) {
    scoreColor = '#10b981'; // Emerald
    scoreBg = 'from-emerald-500/10 to-emerald-500/5 text-emerald-700 border-emerald-200';
    statusTitle = 'CONFIRMED TRUE';
    StatusIcon = ShieldCheck;
  } else if (score >= 45) {
    scoreColor = '#f97316'; // Orange / Partly supported
    scoreBg = 'from-orange-500/10 to-orange-500/5 text-orange-700 border-orange-200';
    statusTitle = 'PARTIALLY SUPPORTED';
    StatusIcon = AlertTriangle;
  } else if (verdict === 'outdated') {
    scoreColor = '#f59e0b'; // Amber
    scoreBg = 'from-amber-500/10 to-amber-500/5 text-amber-700 border-amber-200';
    statusTitle = 'OUTDATED INFORMATION';
    StatusIcon = History;
  } else if (verdict === 'cannot_confirm') {
    scoreColor = '#64748b'; // Slate
    scoreBg = 'from-slate-500/10 to-slate-500/5 text-slate-700 border-slate-200';
    statusTitle = 'CANNOT BE CONFIRMED';
    StatusIcon = HelpCircle;
  }

  return (
    <div className="card bg-white border-slate-200 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden">
      {/* Background radial highlight */}
      <div
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: scoreColor }}
      />

      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Factuality & Truth Gauge
        </span>
        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
          TruthLine Index
        </span>
      </div>

      {/* Main Semi-Circle Vector Gauge without any needle overlap */}
      <div className="relative w-64 h-40 flex items-center justify-center">
        <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="truthLineGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="35%" stopColor="#f97316" />
              <stop offset="65%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 32 88 A 68 68 0 0 1 168 88"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Colored Progress Arc */}
          <path
            d="M 32 88 A 68 68 0 0 1 168 88"
            fill="none"
            stroke="url(#truthLineGaugeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />

          {/* Active Tip Indicator Dot on Arc Perimeter */}
          <circle
            cx={tipX}
            cy={tipY}
            r="7"
            fill="#ffffff"
            stroke={scoreColor}
            strokeWidth="3.5"
            filter="url(#glowFilter)"
            className="transition-all duration-1000 ease-out"
          />

          {/* Centered Typography Inside the Hollow Arch - No overlapping lines */}
          <text
            x={cx}
            y={cy - 16}
            textAnchor="middle"
            fill={scoreColor}
            fontSize="38"
            fontWeight="900"
            letterSpacing="-0.03em"
            className="transition-all duration-500 select-none font-sans"
          >
            {score}%
          </text>
          <text
            x={cx}
            y={cy + 2}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="9"
            fontWeight="700"
            letterSpacing="0.12em"
            className="uppercase select-none"
          >
            Truth Score
          </text>

          {/* Outer Scale Extremes */}
          <text x="24" y="106" textAnchor="start" fill="#ef4444" fontSize="9.5" fontWeight="700">
            0% FALSE
          </text>
          <text x="176" y="106" textAnchor="end" fill="#10b981" fontSize="9.5" fontWeight="700">
            100% TRUE
          </text>
        </svg>
      </div>

      {/* Prominent Verdict Callout Badge */}
      <div
        className={`mt-2 px-4 py-2 rounded-xl border bg-gradient-to-r flex items-center gap-2 ${scoreBg} shadow-2xs`}
      >
        <StatusIcon className="w-5 h-5 shrink-0" />
        <span className="font-bold text-sm tracking-wide">{statusTitle}</span>
      </div>

      <p className="text-xs text-slate-600 mt-2 max-w-xs leading-relaxed">
        {VERDICT_CONFIG[verdict]?.description || 'Based on multi-source verified evidence.'}
      </p>

      {/* Secondary Metrics Bar */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-left">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Evidence Authority</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-bold text-slate-800">{evidenceStrength}%</span>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                style={{ width: `${evidenceStrength}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Analysis Confidence</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-bold text-slate-800">{Math.round(confidence * 100)}%</span>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.round(confidence * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
