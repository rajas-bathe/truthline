import { config } from '../config/env';
import { logger } from '../security/logger';

export interface AudioValidationResult {
  isValid: boolean;
  durationSeconds: number;
  mimeType: string;
  error?: string;
}

const ALLOWED_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/ogg',
  'audio/wav',
  'audio/x-wav',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/aac',
  'audio/webm'
];

/**
 * Validates audio file headers, MIME types, and duration limits
 */
export function validateAudio(buffer: Buffer, mimeType: string): AudioValidationResult {
  const normalizedMime = (mimeType || '').toLowerCase().trim();

  const isAllowed = ALLOWED_AUDIO_MIMES.some(m => normalizedMime.includes(m.split('/')[1]));
  if (!isAllowed) {
    return {
      isValid: false,
      durationSeconds: 0,
      mimeType: normalizedMime,
      error: `Unsupported audio type: "${mimeType}". Supported formats: MP3, WAV, OGG, M4A, AAC.`
    };
  }

  // Estimate duration
  let estimatedDuration = estimateAudioDuration(buffer, normalizedMime);

  if (estimatedDuration > config.maxAudioDurationSeconds) {
    return {
      isValid: false,
      durationSeconds: estimatedDuration,
      mimeType: normalizedMime,
      error: `Audio duration (~${Math.round(estimatedDuration)}s) exceeds maximum allowed limit of ${config.maxAudioDurationSeconds} seconds.`
    };
  }

  logger.info(`Validated audio: ${normalizedMime}, ~${Math.round(estimatedDuration)}s, ${buffer.length} bytes`);

  return {
    isValid: true,
    durationSeconds: estimatedDuration,
    mimeType: normalizedMime
  };
}

/**
 * Helper to estimate audio duration from buffer headers without native ffmpeg
 */
function estimateAudioDuration(buffer: Buffer, mimeType: string): number {
  // If WAV file: Parse standard RIFF header
  if (mimeType.includes('wav') && buffer.length >= 44) {
    try {
      const riff = buffer.toString('ascii', 0, 4);
      const wave = buffer.toString('ascii', 8, 12);
      if (riff === 'RIFF' && wave === 'WAVE') {
        const byteRate = buffer.readUInt32LE(28);
        if (byteRate > 0) {
          const dataSize = buffer.length - 44;
          return dataSize / byteRate;
        }
      }
    } catch {
      // fallback
    }
  }

  // Standard compressed audio estimation (assuming average 128 kbps = 16,000 bytes/sec)
  const bytesPerSecond = 16000;
  return buffer.length / bytesPerSecond;
}
