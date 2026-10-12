import crypto from 'crypto';
import { wrapUntrustedInput, PromptSanitizationResult } from '../security/promptInjection';
import { extractTextFromImageBuffer } from '../services/ocrService';
import { extractTextFromPdfBuffer } from '../services/pdfService';
import { validateAudio } from '../services/audioService';
import { scrapeUrlContent } from '../services/urlScraperService';
import { logger } from '../security/logger';

export interface Stage1Input {
  inputType: 'text' | 'url' | 'image' | 'pdf' | 'audio' | 'selected_text' | 'whatsapp_selection' | 'whatsapp_inline_marker';
  content?: string;
  url?: string;
  fileBuffer?: Buffer;
  fileMimeType?: string;
  fileName?: string;
  consent: boolean;
  language?: string;
}

export interface Stage1Output {
  sanitizedSnippet: string;
  extractedFullText: string;
  inputType: string;
  characterCount: number;
  contentHash: string;
  language?: string;
  multimodalParts?: Array<{ mimeType: string; data: string }>;
  sanitization: PromptSanitizationResult;
  metadata: Record<string, any>;
}

export class Stage1_InputProcessor {
  async process(input: Stage1Input): Promise<Stage1Output> {
    if (!input.consent) {
      throw new Error('Verification requires explicit user consent before processing external inputs.');
    }

    let extractedText = '';
    const metadata: Record<string, any> = {};
    const multimodalParts: Array<{ mimeType: string; data: string }> = [];

    switch (input.inputType) {
      case 'url': {
        if (!input.url) throw new Error('Missing URL for webpage verification');
        const scraped = await scrapeUrlContent(input.url);
        extractedText = `Title: ${scraped.title}\nPublisher: ${scraped.publisher}\n\nContent:\n${scraped.text}`;
        metadata.url = scraped.url;
        metadata.publisher = scraped.publisher;
        metadata.title = scraped.title;
        break;
      }

      case 'image': {
        if (!input.fileBuffer) throw new Error('Missing image file buffer for OCR extraction');
        logger.info(`Running Stage 1 OCR on image (${input.fileBuffer.length} bytes)...`);
        const ocr = await extractTextFromImageBuffer(input.fileBuffer);
        extractedText = ocr.text || '[Image containing visual claims with minimal detectable text]';
        metadata.ocrConfidence = ocr.confidence;
        metadata.fileSize = input.fileBuffer.length;

        // Attach base64 for Gemini multimodal vision
        if (input.fileMimeType) {
          multimodalParts.push({
            mimeType: input.fileMimeType,
            data: input.fileBuffer.toString('base64')
          });
        }
        break;
      }

      case 'pdf': {
        if (!input.fileBuffer) throw new Error('Missing PDF file buffer');
        const pdf = await extractTextFromPdfBuffer(input.fileBuffer);
        extractedText = pdf.text;
        metadata.numPages = pdf.numPages;
        metadata.isScanned = pdf.isScanned;
        metadata.pdfMethod = pdf.method;
        if (pdf.isScanned) {
          logger.warn('PDF appears to be scanned image. Text extraction may be incomplete.');
        }
        break;
      }

      case 'audio': {
        if (!input.fileBuffer) throw new Error('Missing audio file buffer');
        const audioValidation = validateAudio(input.fileBuffer, input.fileMimeType || 'audio/mpeg');
        if (!audioValidation.isValid) {
          throw new Error(audioValidation.error || 'Audio validation failed');
        }
        metadata.durationSeconds = audioValidation.durationSeconds;
        metadata.mimeType = audioValidation.mimeType;

        // Base64 audio part for multimodal transcription
        multimodalParts.push({
          mimeType: audioValidation.mimeType,
          data: input.fileBuffer.toString('base64')
        });
        extractedText = `[Audio recording ~${Math.round(audioValidation.durationSeconds)}s attached for verification]`;
        break;
      }

      case 'text':
      case 'selected_text':
      case 'whatsapp_selection':
      case 'whatsapp_inline_marker':
      default: {
        extractedText = (input.content || '').trim();
        if (!extractedText) throw new Error('No claim text provided for verification.');
        break;
      }
    }

    // Hash for caching and deduplication
    const contentHash = crypto
      .createHash('sha256')
      .update(extractedText.slice(0, 2000))
      .digest('hex');

    // Prompt injection boundary isolation
    const sanitization = wrapUntrustedInput(extractedText, input.inputType.toUpperCase());

    return {
      sanitizedSnippet: extractedText.slice(0, 200),
      extractedFullText: extractedText,
      inputType: input.inputType,
      characterCount: extractedText.length,
      contentHash,
      language: input.language || 'en',
      multimodalParts,
      sanitization,
      metadata
    };
  }
}
