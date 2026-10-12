import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJob } from '../api/client';
import type { VerificationResult } from '../types';
import { ResultsView } from '../components/results/ResultsView';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { ArrowLeft } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const fetchJobData = async () => {
    if (!jobId) {
      setError('No job ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getJob(jobId);
      if (!data || !data.job) {
        throw new Error('Verification job not found.');
      }

      // If job already has structured results
      if (data.job.results) {
        setResult(data.job.results);
      } else {
        // Construct VerificationResult from job + claims + evidence
        const reconstructedResult: VerificationResult = {
          jobId: data.job.id,
          status: (data.job.status as any) || 'completed',
          summary: `Verification completed for ${data.job.input_type} content.`,
          claims: (data.claims || []).map((c: any) => ({
            id: c.id,
            claimText: c.claim_text || c.claimText,
            originalSpan: c.original_span || c.originalSpan,
            verdict: c.verdict,
            confidence: c.confidence ?? 0.9,
            explanation: c.explanation || '',
            evidence: (c.evidence || data.evidence || []).filter((e: any) => !e.claim_id || e.claim_id === c.id),
            temporalInfo: c.temporal_info || c.temporalInfo,
          })),
          metadata: {
            inputType: data.job.input_type || 'text',
            processingTimeMs: data.job.processing_time_ms || 0,
            totalClaims: (data.claims || []).length,
            checkedClaims: (data.claims || []).length,
            language: data.job.language || 'en',
            checkedAt: data.job.created_at || new Date().toISOString(),
          },
        };
        setResult(reconstructedResult);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load verification results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobData();
  }, [jobId]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {loading && <LoadingSpinner message="Retrieving verification report..." />}

      {error && !loading && (
        <ErrorDisplay message={error} onRetry={fetchJobData} />
      )}

      {result && !loading && (
        <ResultsView result={result} />
      )}
    </div>
  );
};
