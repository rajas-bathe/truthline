import React, { useState } from 'react';
import type { VerificationResult } from '../../types';
import { Copy, Check, MessageSquare, ExternalLink, Share2 } from 'lucide-react';
import { getVerdictInfo, localizeContent, getUi } from '../../utils/translations';

interface WhatsAppRebuttalCardProps {
  result: VerificationResult;
}

export const WhatsAppRebuttalCard: React.FC<WhatsAppRebuttalCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const lang = result.metadata?.language || 'en';

  // Generate rebuttal text if not already explicitly provided
  const generateDefaultRebuttal = (): string => {
    if (result.whatsappRebuttal) {
      return localizeContent(result.whatsappRebuttal, lang);
    }

    const localizedVerdict = getVerdictInfo(result.overallVerdict || 'cannot_confirm', lang);
    const claims = result.claims || [];
    const mainClaim = claims[0]?.claimText || 'This message';
    const explanation = localizeContent(result.summary || claims[0]?.explanation || 'No supporting evidence found.', lang);

    if (lang === 'hi') {
      let symbol = '⚠️ [तथ्य जाँच: ध्यान दें]';
      if (result.overallVerdict === 'false') symbol = '❌ [फर्जी खबर / Hoax अलर्ट]';
      else if (result.overallVerdict === 'verified') symbol = '✅ [तथ्य जाँच: सत्य प्रमाणित]';
      else if (result.overallVerdict === 'outdated') symbol = '⏳ [तथ्य जाँच: पुरानी सूचना]';
      else if (result.overallVerdict === 'partly_supported') symbol = '⚠️ [तथ्य जाँच: भ्रामक / आंशिक सत्य]';

      return `${symbol}
विषय: "${mainClaim}"

*सत्यापन निष्कर्ष:* ${localizedVerdict.label}
*तथ्य व कारण:* ${explanation}

*ट्रूथलाइन एआई (TruthLine AI) द्वारा बहु-स्तरीय सत्यापित*
कृपया ग्रुप में अपुष्ट या भ्रामक संदेश आगे न भेजें। केवल सत्यापित जानकारी साझा करें! 🙏`;
    }

    if (lang === 'mr') {
      let symbol = '⚠️ [तथ्य पडताळणी: लक्ष द्या]';
      if (result.overallVerdict === 'false') symbol = '❌ [खोटी माहिती / अफवा अलर्ट]';
      else if (result.overallVerdict === 'verified') symbol = '✅ [तथ्य पडताळणी: सत्य सिद्ध]';
      else if (result.overallVerdict === 'outdated') symbol = '⏳ [तथ्य पडताळणी: जुनी माहिती]';
      else if (result.overallVerdict === 'partly_supported') symbol = '⚠️ [तथ्य पडताळणी: दिशाभूल करणारे]';

      return `${symbol}
विषय: "${mainClaim}"

*पडताळणी निष्कर्ष:* ${localizedVerdict.label}
*स्पष्टीकरण:* ${explanation}

*ट्रूथलाइन एआई (TruthLine AI) द्वारे बहु-स्तरीय पडताळणी केलेले*
कृपया ग्रुपमध्ये अपुष्ट संदेश पुढे पाठवू नका. तथ्ये तपासा, मगच शेअर करा! 🙏`;
    }

    let symbol = '⚠️';
    if (result.overallVerdict === 'false') symbol = '❌ [HOAX / FAKE NEWS ALERT]';
    else if (result.overallVerdict === 'verified') symbol = '✅ [FACT CHECK: VERIFIED]';
    else if (result.overallVerdict === 'outdated') symbol = '⏳ [FACT CHECK: OUTDATED]';
    else if (result.overallVerdict === 'partly_supported') symbol = '⚠️ [FACT CHECK: MISLEADING]';

    return `${symbol}
Re: "${mainClaim}"

*Verdict:* ${localizedVerdict.label}
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
              {getUi('rebuttalTitle', lang)}
            </h3>
            <p className="text-xs text-slate-500">
              {getUi('rebuttalSubtitle', lang)}
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
            <span>{getUi('shareWhatsApp', lang)}</span>
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
                <span>{getUi('copied', lang)}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{getUi('copyRebuttal', lang)}</span>
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
