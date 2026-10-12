import { useState, useCallback } from 'react';
import type { VerificationResult } from '../types';
import { verifyText as apiVerifyText, verifyFile as apiVerifyFile, verifyUrl as apiVerifyUrl } from '../api/client';

export function useVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
    setLoading(false);
  }, []);

  const verifyText = useCallback(async (text: string, language?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiVerifyText(text, language);
      setResult(res);
      return res;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to verify text';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyFile = useCallback(async (file: File, language?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiVerifyFile(file, language);
      setResult(res);
      return res;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to verify file';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyUrl = useCallback(async (url: string, language?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiVerifyUrl(url, language);
      setResult(res);
      return res;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to verify URL';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    result,
    setResult,
    reset,
    verifyText,
    verifyFile,
    verifyUrl,
  };
}
