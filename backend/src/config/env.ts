import path from 'path';
import dotenv from 'dotenv';

// Load .env from server directory first, fallback to root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  allowedOrigins: string[];

  // Gemini & Search Providers
  geminiApiKey: string | null;
  geminiModel: string;
  tavilyApiKey: string | null;
  googleFactCheckApiKey: string | null;

  // Security & Sessions
  sessionSecret: string;
  rateLimitMaxRequests: number;

  // File Upload Limits
  maxFileSizeBytes: number;
  maxAudioDurationSeconds: number;

  // Persistence & Cache
  databasePath: string;
  cacheTtlHours: number;
  historyRetentionDays: number;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000,chrome-extension://*')
    .split(',')
    .map((s) => s.trim()),

  geminiApiKey: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0 && !process.env.GEMINI_API_KEY.includes('your_gemini')
    ? process.env.GEMINI_API_KEY.trim()
    : null,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',

  tavilyApiKey: process.env.TAVILY_API_KEY && process.env.TAVILY_API_KEY.trim().length > 0
    ? process.env.TAVILY_API_KEY.trim()
    : null,

  googleFactCheckApiKey:
    (process.env.GOOGLE_FACTCHECK_API_KEY || process.env.GOOGLE_FACT_CHECK_API_KEY) &&
    (process.env.GOOGLE_FACTCHECK_API_KEY || process.env.GOOGLE_FACT_CHECK_API_KEY)!.trim().length > 0
      ? (process.env.GOOGLE_FACTCHECK_API_KEY || process.env.GOOGLE_FACT_CHECK_API_KEY)!.trim()
      : null,

  sessionSecret: process.env.SESSION_SECRET || 'truthline_default_dev_session_secret_2026_xyz',
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60', 10),

  maxFileSizeBytes: (parseInt(process.env.MAX_FILE_SIZE_MB || '15', 10)) * 1024 * 1024,
  maxAudioDurationSeconds: parseInt(process.env.MAX_AUDIO_DURATION_SECONDS || '180', 10),

  databasePath: process.env.DATABASE_PATH || path.resolve(__dirname, '../../data/truthline.db'),
  cacheTtlHours: parseInt(process.env.CACHE_TTL_HOURS || '24', 10),
  historyRetentionDays: parseInt(process.env.HISTORY_RETENTION_DAYS || '30', 10),
};
