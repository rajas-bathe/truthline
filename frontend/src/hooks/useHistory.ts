import { useState, useEffect, useCallback } from 'react';
import type { VerificationJob } from '../types';
import { getHistory } from '../api/client';

export function useHistory(limit = 20) {
  const [jobs, setJobs] = useState<VerificationJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(limit);
      setJobs(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    jobs,
    loading,
    error,
    refresh: fetchHistory,
  };
}
