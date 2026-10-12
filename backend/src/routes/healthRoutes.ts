import { Router, Request, Response } from 'express';
import { ProviderManager } from '../providers/providerManager';
import { config } from '../config/env';

export const healthRouter = Router();
const providers = new ProviderManager();

healthRouter.get('/', (_req: Request, res: Response) => {
  const providerStatus = providers.getExecutionStatus();

  res.status(200).json({
    status: 'ONLINE',
    service: 'TRUTHLINE AI Verification Engine',
    version: '1.0.0',
    tagline: "DON'T JUST FORWARD. VERIFY.",
    uptime: Math.round(process.uptime()),
    timestamp: Date.now(),
    isDemoMode: providerStatus.isOfflineDemo,
    activeModel: providerStatus.activeModel,
    providers: {
      geminiConfigured: providerStatus.geminiUsed,
      tavilyConfigured: providerStatus.tavilyUsed,
      googleFactCheckConfigured: providerStatus.factCheckUsed
    },
    constraints: {
      maxFileSizeMb: config.maxFileSizeBytes / (1024 * 1024),
      maxAudioDurationSeconds: config.maxAudioDurationSeconds,
      rateLimitMaxRequests: config.rateLimitMaxRequests
    }
  });
});
