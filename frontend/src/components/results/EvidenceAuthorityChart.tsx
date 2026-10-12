import React from 'react';
import type { EvidenceItem } from '../../types';
import { Shield, ExternalLink, ThumbsUp, ThumbsDown, Award, Globe } from 'lucide-react';

interface EvidenceAuthorityChartProps {
  evidence: EvidenceItem[];
}

export const EvidenceAuthorityChart: React.FC<EvidenceAuthorityChartProps> = ({ evidence }) => {
  if (!evidence || evidence.length === 0) {
    return null;
  }

  // Count relationships
  const supporting = evidence.filter((e) => e.relationship === 'supports').length;
  const contradicting = evidence.filter((e) => e.relationship === 'contradicts').length;
  const neutral = Math.max(0, evidence.length - supporting - contradicting);

  // Categorize sources
  const categories = {
    official: 0,
    factCheck: 0,
    news: 0,
    other: 0,
  };

  evidence.forEach((item) => {
    const url = (item.sourceUrl || '').toLowerCase();
    const title = (item.sourceTitle || '').toLowerCase();
    if (
      url.includes('.gov') ||
      url.includes('.nic') ||
      url.includes('rbi.org') ||
      url.includes('pib.gov') ||
      url.includes('who.int')
    ) {
      categories.official++;
    } else if (
      url.includes('altnews') ||
      url.includes('boomlive') ||
      url.includes('factly') ||
      url.includes('vishvas') ||
      url.includes('snopes') ||
      title.includes('fact check')
    ) {
      categories.factCheck++;
    } else if (
      url.includes('hindu') ||
      url.includes('indianexpress') ||
      url.includes('ndtv') ||
      url.includes('reuters') ||
      url.includes('bbc') ||
      url.includes('timesofindia')
    ) {
      categories.news++;
    } else {
      categories.other++;
    }
  });

  return (
    <div className="card bg-white border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Evidence Authority & Source Distribution
          </h3>
          <p className="text-xs text-slate-500">
            Breakdown of {evidence.length} retrieved independent evidence records
          </p>
        </div>

        {/* Supports vs Contradicts quick summary */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <ThumbsUp className="w-3.5 h-3.5" /> {supporting} Supports
          </span>
          <span className="flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
            <ThumbsDown className="w-3.5 h-3.5" /> {contradicting} Contradicts
          </span>
          {neutral > 0 && (
            <span className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              {neutral} Contextual
            </span>
          )}
        </div>
      </div>

      {/* Grid of source authority tiers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Gov & Official</span>
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-1">{categories.official}</div>
          <div className="text-[10px] text-slate-500">Tier 1 Authority (95%)</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Fact-Checkers</span>
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">{categories.factCheck}</div>
          <div className="text-[10px] text-slate-500">IFCN Verified (90%)</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>News & Press</span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{categories.news}</div>
          <div className="text-[10px] text-slate-500">Reputable Media (80%)</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>General Web</span>
          </div>
          <div className="text-2xl font-black text-slate-700 mt-1">{categories.other}</div>
          <div className="text-[10px] text-slate-500">Contextual Web</div>
        </div>
      </div>

      {/* Top 3 Cited Sources Pills */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Primary Cited References:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {evidence.slice(0, 4).map((item, idx) => (
            <a
              key={idx}
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/70 transition flex items-start justify-between gap-2 group"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600">
                  {item.sourceTitle}
                </p>
                <p className="text-[11px] text-slate-400 truncate font-mono">
                  {item.sourceUrl.replace(/^https?:\/\/(www\.)?/, '')}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  item.relationship === 'contradicts'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {item.relationship === 'contradicts' ? 'Contradicts' : 'Supports'}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
