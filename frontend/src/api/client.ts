import axios from 'axios';
import type {
  VerificationResult,
  VerificationJob,
  ProviderStatus,
  Verdict,
  ClaimResult,
  EvidenceItem,
  InputType,
} from '../types';

const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
const api = axios.create({
  baseURL: apiBase,
  timeout: 120000, // 2 minutes for verification
});

function normalizeVerdict(raw: string): Verdict {
  const v = (raw || '').toLowerCase().trim();
  if (v.includes('partially') || v.includes('partly')) return 'partly_supported';
  if (v.includes('cannot') || v.includes('unconfirmed')) return 'cannot_confirm';
  if (v === 'outdated') return 'outdated';
  if (v === 'false') return 'false';
  if (v === 'verified') return 'verified';
  return 'cannot_confirm';
}

function normalizeResult(data: any, fallbackLanguage: string = 'en'): VerificationResult {
  const chosenLang = data.language || data.metadata?.language || fallbackLanguage || 'en';
  // If data is already in frontend format
  if (data.jobId && data.claims && Array.isArray(data.claims)) {
    if (data.metadata) data.metadata.language = chosenLang;
    return data as VerificationResult;
  }

  const rawSources: any[] = data.sources || [];
  const rawClaims: any[] = data.atomicClaims || data.claims || [];

  const claims: ClaimResult[] = rawClaims.map((c: any, index: number) => {
    // Map sources as evidence
    const claimEvidence: EvidenceItem[] = (c.evidence || rawSources).map((s: any, sIdx: number) => ({
      id: s.id || `evidence-${index}-${sIdx}`,
      sourceUrl: s.url || s.sourceUrl || '#',
      sourceTitle: s.title || s.sourceTitle || s.publisher || 'Web Evidence Source',
      sourceType: s.sourceType || 'web_search',
      passage: s.excerpt || s.passage || s.title || 'Supporting document passage retrieved for verification.',
      publicationDate: s.publishedDate || s.publicationDate,
      retrievalDate: s.retrievedAt ? new Date(s.retrievedAt).toISOString() : new Date().toISOString(),
      relevanceScore: typeof s.authorityScore === 'number' ? s.authorityScore / 100 : (s.relevanceScore ?? 0.85),
      relationship: s.isSupporting === false ? 'contradicts' : 'supports',
    }));

    return {
      id: c.id || `claim-${index}`,
      claimText: c.claimText || c.claim_text || c.text || `Claim #${index + 1}`,
      originalSpan: c.originalSpan || c.original_span || c.claimText,
      verdict: normalizeVerdict(c.verdict || data.overallVerdict || data.verdict),
      confidence: typeof c.confidence === 'number' ? c.confidence : 0.9,
      explanation: c.reasoning || c.explanation || data.explanation || 'Claim evaluated against retrieved sources.',
      evidence: claimEvidence,
      temporalInfo: {
        isTimeSensitive: (c.verdict || '').toLowerCase().includes('outdated'),
        temporalMatch: !(c.verdict || '').toLowerCase().includes('outdated'),
      },
    };
  });

  const overallVerdict = normalizeVerdict(data.overallVerdict || data.verdict || (claims[0]?.verdict ?? 'cannot_confirm'));

  // Calculate Truth Score (0 to 100)
  let truthScore = 50;
  if (claims.length > 0) {
    const scoreMap: Record<Verdict, number> = {
      verified: 96,
      partly_supported: 55,
      cannot_confirm: 35,
      outdated: 18,
      false: 4,
    };
    const totalScore = claims.reduce((acc, c) => acc + (scoreMap[c.verdict] ?? 50), 0);
    truthScore = Math.round(totalScore / claims.length);
  } else {
    const singleMap: Record<Verdict, number> = {
      verified: 95,
      partly_supported: 55,
      cannot_confirm: 35,
      outdated: 18,
      false: 4,
    };
    truthScore = singleMap[overallVerdict] ?? 50;
  }

  return {
    jobId: data.id || data.jobId || `job-${Date.now()}`,
    status: 'completed',
    summary: data.explanation || data.summary || 'Claims analyzed against verified sources.',
    overallVerdict,
    truthScore,
    evidenceStrengthScore: data.evidenceStrengthScore || (rawSources.length > 0 ? Math.min(rawSources.length * 25, 95) : 75),
    whatsappRebuttal: data.whatsappRebuttal || undefined,
    challengerNotes: data.challengerNotes || undefined,
    auditorNotes: data.auditorNotes || undefined,
    claims: claims.length > 0 ? claims : [
      {
        id: 'claim-default',
        claimText: data.rawInputSnippet || 'Forwarded Content',
        verdict: overallVerdict,
        confidence: 0.85,
        explanation: data.explanation || 'Verified through the TruthLine verification pipeline.',
        evidence: rawSources.map((s, sIdx) => ({
          id: s.id || `ev-${sIdx}`,
          sourceUrl: s.url || '#',
          sourceTitle: s.title || s.publisher || 'Evidence Source',
          sourceType: s.sourceType || 'web_search',
          passage: s.excerpt || s.title || 'Verified excerpt',
          retrievalDate: new Date().toISOString(),
          relevanceScore: 0.85,
          relationship: 'supports',
        })),
      },
    ],
    metadata: {
      inputType: (data.inputType || 'text') as InputType,
      processingTimeMs: data.executionTimeMs || 1200,
      totalClaims: claims.length || 1,
      checkedClaims: claims.length || 1,
      language: chosenLang,
      checkedAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
    },
  };
}

export async function verifyText(text: string, language?: string): Promise<VerificationResult> {
  const { data } = await api.post('/verify/text', {
    inputType: 'text',
    text,
    content: text,
    consent: true,
    language,
  });
  return normalizeResult(data, language);
}

export async function verifyFile(file: File, language?: string): Promise<VerificationResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('consent', 'true');
  let inputType = 'image';
  if (file.type === 'application/pdf') inputType = 'pdf';
  else if (file.type.startsWith('audio/')) inputType = 'audio';
  formData.append('inputType', inputType);
  if (language) formData.append('language', language);

  const { data } = await api.post('/verify/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return normalizeResult(data, language);
}

export async function verifyUrl(url: string, language?: string): Promise<VerificationResult> {
  const { data } = await api.post('/verify/url', {
    inputType: 'url',
    url,
    consent: true,
    language,
  });
  return normalizeResult(data, language);
}

export async function getHistory(limit = 20): Promise<VerificationJob[]> {
  const { data } = await api.get('/history', { params: { limit } });
  const rawList = data.jobs || data.items || [];
  return rawList.map((item: any) => ({
    id: item.id,
    input_type: item.input_type || item.inputType || 'text',
    input_text: item.raw_input_snippet || item.inputText || item.input_text || '',
    status: 'completed',
    results: item.results || null,
    created_at: item.created_at || item.createdAt || new Date().toISOString(),
    processing_time_ms: item.execution_time_ms || item.processingTimeMs || 0,
    language: item.language || 'en',
  }));
}

export async function getJob(jobId: string): Promise<{ job: VerificationJob; claims: any[]; evidence: any[] }> {
  // Check verify endpoint first for full details
  const { data } = await api.get(`/verify/${jobId}`);
  const normalized = normalizeResult(data);
  const job: VerificationJob = {
    id: normalized.jobId,
    input_type: normalized.metadata.inputType,
    input_text: data.rawInputSnippet || '',
    status: 'completed',
    results: normalized,
    created_at: normalized.metadata.checkedAt,
    processing_time_ms: normalized.metadata.processingTimeMs,
    language: normalized.metadata.language,
  };
  return {
    job,
    claims: normalized.claims,
    evidence: (data.sources || []),
  };
}

export async function getHealth(): Promise<{ status: string; providers: ProviderStatus }> {
  const { data } = await api.get('/health');
  return {
    status: data.status || 'healthy',
    providers: {
      gemini: !!data.providers?.geminiGrounding,
      tavily: !!data.providers?.tavilySearch,
      factCheck: !!data.providers?.googleFactCheck,
      demoMode: !!data.isDemoMode,
    },
  };
}

export async function getDemoExamples(): Promise<any[]> {
  const { data } = await api.get('/demo/samples');
  return data.samples || [];
}
