import React, { useState } from 'react';
import type { VerificationResult, EvidenceItem } from '../../types';
import { Summary } from './Summary';
import { ClaimCard } from './ClaimCard';
import { SafetyBanner } from './SafetyBanner';
import { WhatsAppRebuttalCard } from './WhatsAppRebuttalCard';
import { EvidenceAuthorityChart } from './EvidenceAuthorityChart';
import { LanguageSelector } from '../common/LanguageSelector';
import { getFileTypeIcon } from '../../utils/formatters';
import { RotateCcw, Share2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResultsViewProps {
  result: VerificationResult;
  onCheckAnother?: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onCheckAnother }) => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    result.metadata?.language || 'en'
  );
  const [copied, setCopied] = useState(false);

  const InputTypeIcon = getFileTypeIcon(result.metadata?.inputType || 'text');
  const activeVerdict = result.overallVerdict || result.claims?.[0]?.verdict || 'cannot_confirm';

  // Aggregate all unique evidence across claims
  const allEvidence: EvidenceItem[] = React.useMemo(() => {
    const list: EvidenceItem[] = [];
    const seenUrls = new Set<string>();

    result.claims?.forEach((claim) => {
      claim.evidence?.forEach((ev) => {
        if (!seenUrls.has(ev.sourceUrl)) {
          seenUrls.add(ev.sourceUrl);
          list.push(ev);
        }
      });
    });

    return list;
  }, [result]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartAnother = () => {
    if (onCheckAnother) {
      onCheckAnother();
    } else {
      navigate('/');
    }
  };

  const scrollToRebuttal = () => {
    const el = document.getElementById('whatsapp-rebuttal-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Top action toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
            <InputTypeIcon className="w-4 h-4" />
          </div>
          <span>Input Format:</span>
          <span className="capitalize font-semibold text-slate-800">
            {result.metadata?.inputType || 'Text'}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <LanguageSelector
            value={selectedLanguage}
            onChange={(lang) => setSelectedLanguage(lang)}
          />

          <button
            type="button"
            onClick={handleCopyLink}
            className="btn-secondary py-2 px-3 flex items-center gap-1.5 text-xs"
            title="Share or copy report link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            type="button"
            onClick={handleStartAnother}
            className="btn-primary py-2 px-4 flex items-center gap-1.5 text-xs shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Check Another</span>
          </button>
        </div>
      </div>

      {/* Safety / Forwarding Advisory Banner */}
      <SafetyBanner verdict={activeVerdict} onScrollToRebuttal={scrollToRebuttal} />

      {/* Hero Visuals + Summary (Truth Gauge + Three.js 3D Sphere + Breakdown) */}
      <Summary result={result} />

      {/* WhatsApp Ready-to-Send Rebuttal Card */}
      <WhatsAppRebuttalCard result={result} />

      {/* Evidence Authority & Source Distribution Chart */}
      {allEvidence.length > 0 && <EvidenceAuthorityChart evidence={allEvidence} />}

      {/* Individual Claims Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Independent Claim-by-Claim Verification ({result.claims?.length || 0})
          </h3>
          <span className="text-xs text-slate-500">
            Every statement checked individually against official records
          </span>
        </div>

        {result.claims && result.claims.length > 0 ? (
          <div className="space-y-5">
            {result.claims.map((claim, idx) => (
              <ClaimCard key={claim.id || idx} claim={claim} index={idx} />
            ))}
          </div>
        ) : (
          <div className="card text-center p-8 text-slate-500 text-sm">
            No specific verifiable claims were isolated in this input.
          </div>
        )}
      </div>

      {/* Footer check another prompt */}
      <div className="pt-6 border-t border-slate-200 text-center">
        <button
          type="button"
          onClick={handleStartAnother}
          className="btn-secondary inline-flex items-center gap-2 hover:bg-slate-100"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Verify Another Forward, Document, or Audio</span>
        </button>
      </div>
    </div>
  );
};
