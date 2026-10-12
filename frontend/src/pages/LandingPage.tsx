import React, { useState, useRef } from 'react';
import { UploadArea } from '../components/upload/UploadArea';
import { QuickTestCard } from '../components/upload/QuickTestCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { ResultsView } from '../components/results/ResultsView';
import type { VerificationResult } from '../types';
import { verifyText } from '../api/client';
import { CheckCircle2, Search, Calendar, Sparkles } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [presetText, setPresetText] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const resultsRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setTimeout(() => {
      if (loadingRef.current) {
        const yOffset = -90;
        const y = loadingRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }, 60);
  };

  const handleResult = (newResult: VerificationResult) => {
    setLoading(false);
    setError(null);
    setResult(newResult);
  };

  // Automatically and reliably scroll to results whenever new results are received
  React.useEffect(() => {
    if (result && resultsRef.current) {
      const scrollTimer = setTimeout(() => {
        const yOffset = -80; // Account for 64px sticky header + 16px buffer
        const y = resultsRef.current!.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(scrollTimer);
    }
  }, [result]);

  const handleError = (err: string) => {
    setLoading(false);
    setError(err);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setLoading(false);
    setPresetText('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectScenario = async (scenarioText: string) => {
    setPresetText(scenarioText);
    handleStart();
    try {
      const res = await verifyText(scenarioText, selectedLanguage);
      handleResult(res);
    } catch (err: any) {
      handleError(err.response?.data?.message || err.message || 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto pt-4 sm:pt-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TruthLine AI — Multi-Source Fact Verification Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Is This Forward <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">True?</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Upload a forward, screenshot, voice note, PDF or link. TruthLine separates its claims, checks relevant sources and dates, and shows a clear verdict for each.
        </p>
      </section>

      {/* Featured Trending Examples Card */}
      <section className="max-w-4xl mx-auto">
        <QuickTestCard onSelectScenario={handleSelectScenario} disabled={loading} />
      </section>

      {/* Upload Orchestrator for Custom Verification */}
      <section ref={uploadRef} className="max-w-4xl mx-auto space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Custom Forward & Document Verification
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Paste text or drop files (Image, Audio, PDF, Link)
          </span>
        </div>

        <UploadArea
          presetText={presetText}
          language={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          onStart={handleStart}
          onResult={handleResult}
          onError={handleError}
          isLoading={loading}
        />

        {/* Loading state */}
        {loading && (
          <div ref={loadingRef} className="pt-4 scroll-mt-24">
            <LoadingSpinner />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <ErrorDisplay message={error} onRetry={() => setError(null)} />
        )}
      </section>

      {/* Inline Results Section */}
      {result && (
        <section ref={resultsRef} className="pt-6 border-t border-slate-200 scroll-mt-20">
          <ResultsView result={result} onCheckAnother={handleReset} />
        </section>
      )}

      {/* Feature cards below upload */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 max-w-5xl mx-auto">
        <div className="card-hover">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">
            Claim-by-Claim Results
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Long messages often mix facts with falsehoods. TruthLine isolates each factual claim and assigns individual verdicts with clear confidence metrics.
          </p>
        </div>

        <div className="card-hover">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">
            Evidence You Can Inspect
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            No black box answers. Every verdict links directly to primary sources, quotes the exact supporting or contradictory passages, and rates relevance.
          </p>
        </div>

        <div className="card-hover">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">
            Dates & Context Matter
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Many viral forwards were true years ago but are obsolete today. TruthLine verifies publication timelines to flag outdated or recycled misinformation.
          </p>
        </div>
      </section>
    </div>
  );
};
