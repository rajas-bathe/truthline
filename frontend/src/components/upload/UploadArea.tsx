import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Globe, Search, ArrowRight } from 'lucide-react';
import { TextInput } from './TextInput';
import { DropZone } from './DropZone';
import { UrlInput } from './UrlInput';
import { LanguageSelector } from '../common/LanguageSelector';
import type { VerificationResult } from '../../types';
import { verifyText, verifyFile, verifyUrl } from '../../api/client';

type Tab = 'text' | 'file' | 'url';

interface UploadAreaProps {
  onStart?: () => void;
  onResult?: (result: VerificationResult) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
  presetText?: string;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  onStart,
  onResult,
  onError,
  isLoading = false,
  presetText,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [language, setLanguage] = useState<string>('en');

  // Input states
  const [text, setText] = useState<string>(presetText || '');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');

  React.useEffect(() => {
    if (presetText) {
      setText(presetText);
      setActiveTab('text');
    }
  }, [presetText]);

  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isBusy = isLoading || submitting;

  const isSubmitDisabled = () => {
    if (isBusy) return true;
    if (activeTab === 'text') return !text.trim();
    if (activeTab === 'file') return !file;
    if (activeTab === 'url') {
      try {
        const u = new URL(url.trim());
        return !u.protocol.startsWith('http');
      } catch {
        return true;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled()) return;

    setLocalError(null);
    setSubmitting(true);
    if (onStart) onStart();

    try {
      let result: VerificationResult;
      if (activeTab === 'text') {
        result = await verifyText(text.trim(), language);
      } else if (activeTab === 'file' && file) {
        result = await verifyFile(file, language);
      } else if (activeTab === 'url') {
        result = await verifyUrl(url.trim(), language);
      } else {
        throw new Error('Please provide input to verify.');
      }

      if (onResult) {
        onResult(result);
      } else if (result.jobId) {
        navigate(`/results/${result.jobId}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Verification failed. Please try again.';
      setLocalError(msg);
      if (onError) onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card shadow-lg border-slate-200/80 bg-white/95 backdrop-blur-sm transition-all duration-200">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 pb-3 mb-6 gap-2 sm:gap-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab('text');
            setLocalError(null);
          }}
          disabled={isBusy}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
            activeTab === 'text'
              ? 'bg-indigo-50 text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Text & Messages</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('file');
            setLocalError(null);
          }}
          disabled={isBusy}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
            activeTab === 'file'
              ? 'bg-indigo-50 text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>File Upload</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('url');
            setLocalError(null);
          }}
          disabled={isBusy}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
            activeTab === 'url'
              ? 'bg-indigo-50 text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Article / Web URL</span>
        </button>
      </div>

      {/* Input panel */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          {activeTab === 'text' && (
            <div className="space-y-3">
              <TextInput value={text} onChange={setText} disabled={isBusy} />
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  ⚡ 1-Click Samples:
                </span>
                <button
                  type="button"
                  onClick={() => setText('Urgent Alert: RBI has announced that old ₹100 currency notes will be completely banned and demonetized from next month. Please exchange them immediately!')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span>₹100 Currency Ban (Hoax)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setText('Bengal tiger is the national animal of India, chosen in 1972 by the Indian Wildlife Board.')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>National Animal (Fact)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setText('Massive tsunami alert issued for Mumbai and Konkan coastline tonight, authorities advising all citizens to evacuate immediately.')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                  <span>Mumbai Tsunami (Panic)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setText('PM-KUSUM scheme provides up to 60% subsidy to farmers for installing solar agricultural water pumps through official state nodal agencies.')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span>PM Solar Pump (Scheme)</span>
                </button>
              </div>
            </div>
          )}
          {activeTab === 'file' && (
            <DropZone acceptedFile={file} onFileSelect={setFile} disabled={isBusy} />
          )}
          {activeTab === 'url' && (
            <UrlInput value={url} onChange={setUrl} disabled={isBusy} />
          )}
        </div>

        {localError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {localError}
          </div>
        )}

        {/* Action Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-slate-100">
          <LanguageSelector value={language} onChange={setLanguage} disabled={isBusy} />

          <button
            type="submit"
            disabled={isSubmitDisabled()}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto text-base py-3 px-8 shadow-md hover:shadow-indigo-200/60"
          >
            {isBusy ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Check Claims</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
