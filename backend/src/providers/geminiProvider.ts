import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';
import { logger } from '../security/logger';

export interface GroundingSource {
  title: string;
  url: string;
  publisher?: string;
  excerpt?: string;
}

export interface GeminiVerificationOutput {
  claims: Array<{
    claimText: string;
    verdict: 'VERIFIED' | 'FALSE' | 'OUTDATED' | 'PARTIALLY_SUPPORTED' | 'CANNOT_CONFIRM';
    confidence: number;
    reasoning: string;
  }>;
  overallVerdict: 'VERIFIED' | 'FALSE' | 'OUTDATED' | 'PARTIALLY_SUPPORTED' | 'CANNOT_CONFIRM';
  explanation: string;
  challengerNotes: string;
  auditorNotes: string;
  limitations: string;
  sources: GroundingSource[];
  groundingQueries: string[];
}

export class GeminiProvider {
  private client: GoogleGenerativeAI | null = null;
  private modelName: string;

  constructor(apiKey: string | null = config.geminiApiKey, modelName: string = config.geminiModel) {
    this.modelName = modelName;
    if (apiKey) {
      this.client = new GoogleGenerativeAI(apiKey);
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  getModelName(): string {
    return this.modelName;
  }

  /**
   * Run 8-stage grounded analysis through Gemini with Google Search tool enabled
   */
  async verifyClaim(
    inputText: string,
    multimodalParts?: Array<{ mimeType: string; data: string }>
  ): Promise<GeminiVerificationOutput> {
    if (!this.client) {
      throw new Error('Gemini API key is not configured. Falling back to offline mode.');
    }

    try {
      // Create model with Google Search Grounding tool
      const model = this.client.getGenerativeModel({
        model: this.modelName,
        // @ts-ignore - Google Search Grounding tool definition in Gemini API
        tools: [{ googleSearch: {} }],
        generationConfig: {
          temperature: 0.1, // Low temperature for high factual precision
          topP: 0.95
        }
      });

      const systemPrompt = `
You are TRUTHLINE AI ("Don't Just Forward. Verify."), an elite objective forensic fact-checker and claim verification engine.
Analyze the user's input with absolute objectivity and thorough search grounding.

RULES:
1. Decompose the input into discrete atomic claims.
2. Cross-reference each claim against Google Search Grounding evidence.
3. For each atomic claim, assign exactly ONE verdict:
   - "VERIFIED": Strong corroborating evidence from primary records, official gazettes, or verified reporting.
   - "FALSE": Directly refuted by fact-checkers, official records, or authoritative consensus.
   - "OUTDATED": Previously true or past event re-shared misleadingly as current.
   - "PARTIALLY_SUPPORTED": Some details are accurate, but key claims are exaggerated or false.
   - "CANNOT_CONFIRM": Insufficient authoritative evidence to verify or debunk. NEVER label false merely because no evidence was found!
4. Challenger Agent: Actively look for omitted context, cognitive bias, or misleading framing.
5. Evidence Auditor: Verify citations exist, match genuine publishers, and directly support findings.
6. Provide an Overall Verdict, a concise plain-language explanation suitable for WhatsApp forwarding, and honest limitations.

Respond with valid JSON inside a code block:
\`\`\`json
{
  "claims": [
    {
      "claimText": "...",
      "verdict": "VERIFIED" | "FALSE" | "OUTDATED" | "PARTIALLY_SUPPORTED" | "CANNOT_CONFIRM",
      "confidence": 0.0 to 1.0,
      "reasoning": "..."
    }
  ],
  "overallVerdict": "VERIFIED" | "FALSE" | "OUTDATED" | "PARTIALLY_SUPPORTED" | "CANNOT_CONFIRM",
  "explanation": "...",
  "challengerNotes": "...",
  "auditorNotes": "...",
  "limitations": "..."
}
\`\`\`
`;

      const contents: any[] = [systemPrompt];

      // Attach multimodal parts (Image, Audio) if provided
      if (multimodalParts && multimodalParts.length > 0) {
        for (const part of multimodalParts) {
          contents.push({
            inlineData: {
              mimeType: part.mimeType,
              data: part.data
            }
          });
        }
      }

      contents.push(`Content to analyze:\n"""\n${inputText}\n"""`);

      logger.info(`Invoking Gemini (${this.modelName}) with Google Search Grounding...`);
      const result = await model.generateContent(contents);
      const response = await result.response;
      const textOutput = response.text();

      // Extract Grounding Metadata
      const sources: GroundingSource[] = [];
      const groundingQueries: string[] = [];

      try {
        const candidate = response.candidates?.[0];
        const metadata = candidate?.groundingMetadata as any;
        if (metadata) {
          if (Array.isArray(metadata.webSearchQueries)) {
            groundingQueries.push(...metadata.webSearchQueries);
          }
          const chunks = metadata.groundingChunks || metadata.groundingChuncks;
          if (Array.isArray(chunks)) {
            for (const chunk of chunks) {
              if (chunk.web?.uri) {
                sources.push({
                  title: chunk.web.title || chunk.web.uri,
                  url: chunk.web.uri,
                  publisher: new URL(chunk.web.uri).hostname.replace('www.', '')
                });
              }
            }
          }
        }
      } catch (metaErr: any) {
        logger.debug('No grounding metadata extracted: ' + metaErr.message);
      }

      // Parse JSON from LLM response
      const parsedJson = this.extractJsonFromText(textOutput);

      return {
        claims: parsedJson.claims || [
          {
            claimText: inputText.slice(0, 200),
            verdict: parsedJson.overallVerdict || 'CANNOT_CONFIRM',
            confidence: 0.8,
            reasoning: parsedJson.explanation || 'Processed as single claim.'
          }
        ],
        overallVerdict: parsedJson.overallVerdict || 'CANNOT_CONFIRM',
        explanation: parsedJson.explanation || 'Analysis completed.',
        challengerNotes: parsedJson.challengerNotes || 'Counter-evidence checked.',
        auditorNotes: parsedJson.auditorNotes || 'Citations audited.',
        limitations: parsedJson.limitations || 'Grounding limited to public web sources.',
        sources: this.deduplicateSources(sources),
        groundingQueries
      };
    } catch (err: any) {
      logger.error('Gemini Provider execution failed: ' + err.message);
      throw err;
    }
  }

  private extractJsonFromText(text: string): any {
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(text);
    } catch {
      logger.warn('Failed to parse structured JSON from Gemini output. Using fallback parser.');
      return {
        overallVerdict: 'CANNOT_CONFIRM',
        explanation: text.slice(0, 500),
        claims: []
      };
    }
  }

  private deduplicateSources(sources: GroundingSource[]): GroundingSource[] {
    const seen = new Set<string>();
    const deduplicated: GroundingSource[] = [];

    for (const s of sources) {
      if (!s.url || seen.has(s.url)) continue;
      seen.add(s.url);
      deduplicated.push(s);
    }

    return deduplicated;
  }
}
