import React, { useState } from 'react';
import type { VerificationResult } from '../../types';
import { Copy, Check, MessageSquare, ExternalLink, Share2 } from 'lucide-react';

interface WhatsAppRebuttalCardProps {
  result: VerificationResult;
}

export const WhatsAppRebuttalCard: React.FC<WhatsAppRebuttalCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  // Generate rebuttal text if not already explicitly provided
  const generateDefaultRebuttal = (): string => {
    if (result.whatsappRebuttal) {
      return result.whatsappRebuttal;
    }

    const verdictLabel = (result.overallVerdict || 'cannot_confirm').toUpperCase();
    const claims = result.claims || [];
    const mainClaim = claims[0]?.claimText || 'This message';
    const explanation = result.summary || claims[0]?.explanation || 'No supporting evidence found.';

    let symbol = '⚠️';
    if (result.overallVerdict === 'false') symbol = '❌ [HOAX / FAKE NEWS ALERT]';
    else if (result.overallVerdict === 'verified') symbol = '✅ [FACT CHECK: VERIFIED]';
    else if (result.overallVerdict === 'outdated') symbol = '⏳ [FACT CHECK: OUTDATED]';
    else if (result.overallVerdict === 'partly_supported') symbol = '⚠️ [FACT CHECK: MISLEADING]';

    return `${symbol}
Re: "${mainClaim}"

*Verdict:* ${verdictLabel}
*Explanation:* ${explanation}

*Fact-Checked with TruthLine AI (Multi-Source Verification Pipeline)*
Please do not forward unverified claims in this group. Let's keep our chats factual! 🙏`;
  };

  const rebuttalText = generateDefaultRebuttal();

  const handleCopy = () => {
    navigator.clipboard.writeText(rebuttalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(rebuttalText)}`;

  return (
    <div id="whatsapp-rebuttal-section" className="card bg-white border-slate-200 shadow-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              1-Click WhatsApp Debunk Reply
            </h3>
            <p className="text-xs text-slate-500">
              Polite, factual rebuttal formatted for instant sharing in chats and groups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Send on WhatsApp</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
              copied
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* WhatsApp Message Preview Bubble */}
      <div className="relative rounded-2xl p-4 bg-[#e5ddd5]/40 border border-[#d1d7db] shadow-inner">
        <div className="max-w-xl bg-white rounded-2xl rounded-tl-xs p-4 shadow-xs text-xs sm:text-sm text-slate-800 whitespace-pre-line font-sans leading-relaxed border border-slate-200/60 relative">
          {rebuttalText}
          <div className="text-[10px] text-slate-400 text-right mt-2 flex items-center justify-end gap-1 font-mono">
            <span>Just now</span>
            <span className="text-emerald-500 font-bold">✓✓</span>
          </div>
        </div>
      </div>
    </div>
  );
};
