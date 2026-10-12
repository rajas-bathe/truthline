import React from 'react';
import { Sparkles, AlertTriangle, ShieldCheck, Waves, FileText, ArrowRight, Share2 } from 'lucide-react';

interface Scenario {
  id: string;
  category: string;
  platform: string;
  badgeBg: string;
  accentBar: string;
  cardHoverBg: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  text: string;
}

interface QuickTestCardProps {
  onSelectScenario: (text: string) => void;
  disabled?: boolean;
}

export const QuickTestCard: React.FC<QuickTestCardProps> = ({ onSelectScenario, disabled }) => {
  const scenarios: Scenario[] = [
    {
      id: 'rbi-hoax',
      category: 'Banking & Currency',
      platform: 'WhatsApp Viral Forward',
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
      accentBar: 'from-red-500 to-rose-400',
      cardHoverBg: 'group-hover:border-red-300',
      icon: AlertTriangle,
      iconColor: 'text-red-600 bg-red-50',
      title: 'RBI ₹100 Currency Ban Rumor',
      text: 'Urgent Alert: RBI has announced that old ₹100 currency notes will be completely banned and demonetized from next month. Please exchange them immediately!',
    },
    {
      id: 'tiger-fact',
      category: 'National Identity',
      platform: 'Official Record',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      accentBar: 'from-emerald-500 to-teal-400',
      cardHoverBg: 'group-hover:border-emerald-300',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 bg-emerald-50',
      title: 'National Animal of India',
      text: 'Bengal tiger is the national animal of India, chosen in 1972 by the Indian Wildlife Board.',
    },
    {
      id: 'tsunami-panic',
      category: 'Emergency & Weather',
      platform: 'Viral Audio / Forward',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
      accentBar: 'from-orange-500 to-amber-400',
      cardHoverBg: 'group-hover:border-orange-300',
      icon: Waves,
      iconColor: 'text-orange-600 bg-orange-50',
      title: 'Mumbai Tsunami Evacuation Panic',
      text: 'Massive tsunami alert issued for Mumbai and Konkan coastline tonight, authorities advising all citizens to evacuate immediately.',
    },
    {
      id: 'kusum-scheme',
      category: 'Agriculture & Energy',
      platform: 'Gov Scheme Announcement',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      accentBar: 'from-blue-500 to-indigo-400',
      cardHoverBg: 'group-hover:border-blue-300',
      icon: FileText,
      iconColor: 'text-blue-600 bg-blue-50',
      title: 'PM-KUSUM 60% Solar Pump Subsidy',
      text: 'PM-KUSUM scheme provides up to 60% subsidy to farmers for installing solar agricultural water pumps through state nodal agencies.',
    },
  ];

  return (
    <div className="card bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6 rounded-2xl relative overflow-hidden">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              TRENDING EXAMPLES
            </span>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              1-Click Verification
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Try Real-World Trending Forwards
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
            Click any viral message or claim below to run it through TruthLine's multi-source verification pipeline in real time:
          </p>
        </div>
      </div>

      {/* Grid of 4 Clean, Modern Cards - No Spoilers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          return (
            <div
              key={sc.id}
              onClick={() => !disabled && onSelectScenario(sc.text)}
              className={`relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white p-5 shadow-2xs hover:shadow-md ${sc.cardHoverBg} transition-all duration-200 cursor-pointer flex flex-col justify-between group text-left`}
            >
              {/* Colored top gradient line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${sc.accentBar}`}
              />

              <div className="space-y-3 pt-1">
                {/* Header row with Category & Platform Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${sc.iconColor} transition`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${sc.badgeBg}`}
                    >
                      {sc.category}
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    {sc.platform}
                  </span>
                </div>

                {/* Scenario Title */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-900 transition leading-snug">
                  {sc.title}
                </h3>

                {/* Forwarded Claim Quote in clean message box */}
                <div className="text-xs text-slate-700 leading-relaxed font-sans bg-white group-hover:bg-indigo-50/30 p-3 rounded-lg border border-slate-200/80 transition shadow-2xs">
                  <span className="text-slate-400 font-serif text-sm mr-1">“</span>
                  {sc.text}
                  <span className="text-slate-400 font-serif text-sm ml-1">”</span>
                </div>
              </div>

              {/* Action Button at Bottom */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  Ready to verify with live sources
                </span>

                <button
                  type="button"
                  disabled={disabled}
                  className="text-xs font-bold text-white bg-indigo-600 group-hover:bg-indigo-700 px-3.5 py-1.5 rounded-lg transition-all shadow-2xs flex items-center gap-1.5 group-hover:shadow-xs"
                >
                  <span>Verify Claim</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
