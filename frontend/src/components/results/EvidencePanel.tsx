import React, { useState } from 'react';
import { ExternalLink, Calendar, ChevronDown, ChevronUp, Check, X, Minus } from 'lucide-react';
import type { EvidenceItem } from '../../types';
import { formatDate } from '../../utils/formatters';

interface EvidencePanelProps {
  evidence: EvidenceItem[];
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ evidence }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="text-xs text-slate-400 italic py-2">
        No direct external evidence passages found.
      </div>
    );
  }

  const getRelationshipBadge = (rel: EvidenceItem['relationship']) => {
    switch (rel) {
      case 'supports':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            <Check className="w-3 h-3" /> Supports
          </span>
        );
      case 'contradicts':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
            <X className="w-3 h-3" /> Contradicts
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
            <Minus className="w-3 h-3" /> Context
          </span>
        );
    }
  };

  return (
    <div className="mt-4 border-t border-slate-100 pt-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-indigo-600 py-1 transition group"
      >
        <span className="flex items-center gap-2">
          <span>Sources & Evidence ({evidence.length})</span>
          <span className="text-[10px] font-normal text-slate-400 group-hover:text-indigo-400">
            {isOpen ? 'Click to collapse' : 'Click to inspect sources'}
          </span>
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3 animate-fade-in">
          {evidence.map((item, idx) => {
            const scorePercent = Math.round(Math.min(Math.max(item.relevanceScore || 0, 0), 1) * 100);

            return (
              <div
                key={item.id || idx}
                className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2 hover:bg-slate-50 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getRelationshipBadge(item.relationship)}
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-xs text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 max-w-[260px] sm:max-w-md truncate"
                      title={item.sourceTitle || item.sourceUrl}
                    >
                      <span>{item.sourceTitle || item.sourceUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  {item.publicationDate && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.publicationDate)}</span>
                    </div>
                  )}
                </div>

                {/* Quoted passage */}
                <blockquote className="text-xs text-slate-700 bg-white border-l-2 border-indigo-400 pl-3 py-1.5 rounded-r-md italic leading-relaxed">
                  "{item.passage}"
                </blockquote>

                {/* Relevance score bar */}
                <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500">
                  <span className="shrink-0">Relevance score:</span>
                  <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full"
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                  <span className="font-mono text-slate-600">{scorePercent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
