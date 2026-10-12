export type InputType = 'text' | 'image' | 'audio' | 'pdf' | 'url';

export type Verdict = 'verified' | 'false' | 'outdated' | 'partly_supported' | 'cannot_confirm';

export interface EvidenceItem {
  id: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceType: string;
  passage: string;
  publicationDate?: string;
  retrievalDate: string;
  relevanceScore: number;
  relationship: 'supports' | 'contradicts' | 'irrelevant';
}

export interface ClaimResult {
  id: string;
  claimText: string;
  originalSpan?: string;
  verdict: Verdict;
  confidence: number;
  explanation: string;
  evidence: EvidenceItem[];
  temporalInfo?: {
    claimDate?: string;
    evidenceDate?: string;
    isTimeSensitive: boolean;
    temporalMatch: boolean;
  };
}

export interface VerificationResult {
  jobId: string;
  status: 'completed' | 'failed' | 'partial';
  summary: string;
  overallVerdict?: Verdict;
  truthScore?: number; // 0% (definitely false) to 100% (definitely true)
  evidenceStrengthScore?: number; // 0 to 100%
  whatsappRebuttal?: string;
  challengerNotes?: string;
  auditorNotes?: string;
  claims: ClaimResult[];
  metadata: {
    inputType: InputType;
    processingTimeMs: number;
    totalClaims: number;
    checkedClaims: number;
    language: string;
    checkedAt: string;
  };
}

export interface VerificationJob {
  id: string;
  input_type: InputType;
  input_text: string;
  status: string;
  results: VerificationResult | null;
  created_at: string;
  processing_time_ms: number;
  language: string;
}

export interface ProviderStatus {
  gemini: boolean;
  tavily: boolean;
  factCheck: boolean;
  demoMode: boolean;
}

export const VERDICT_CONFIG: Record<
  Verdict,
  { label: string; color: string; bgColor: string; icon: string; description: string }
> = {
  verified: {
    label: 'Verified',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    icon: 'CheckCircle',
    description: 'Reliable evidence supports this statement',
  },
  false: {
    label: 'False',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    icon: 'XCircle',
    description: 'Reliable evidence contradicts this statement',
  },
  outdated: {
    label: 'Outdated',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: 'Clock',
    description: 'This information no longer applies as presented',
  },
  partly_supported: {
    label: 'Partly Supported',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    icon: 'AlertTriangle',
    description: 'Evidence supports a limited version of this statement',
  },
  cannot_confirm: {
    label: 'Cannot Be Confirmed',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 border-slate-200',
    icon: 'HelpCircle',
    description: 'Available evidence cannot justify a reliable conclusion',
  },
};
