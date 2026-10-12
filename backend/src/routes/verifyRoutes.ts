import { Router, Response } from 'express';
import multer from 'multer';
import { AuthenticatedRequest, optionalSessionAuth } from '../security/auth';
import { verificationRateLimiter } from '../security/rateLimiter';
import { VerificationPipeline } from '../pipeline/VerificationPipeline';
import { Stage1Input } from '../pipeline/Stage1_InputProcessor';
import { VerificationRepository } from '../database/repository';
import { config } from '../config/env';
import { logger } from '../security/logger';

export const verifyRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSizeBytes // 15MB
  }
});

const pipeline = new VerificationPipeline();
const repository = new VerificationRepository();

const handleVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let inputType = (req.body?.inputType as string) || 'text';
    // If route is /text, /file, or /url, infer inputType if not set
    if (req.path.includes('/text')) inputType = 'text';
    if (req.path.includes('/url')) inputType = 'url';
    if (req.file) {
      if (req.file.mimetype.startsWith('image/')) inputType = 'image';
      else if (req.file.mimetype === 'application/pdf') inputType = 'pdf';
      else if (req.file.mimetype.startsWith('audio/')) inputType = 'audio';
    }

    // Default consent to true for web UI submissions if not explicitly false
    const consent = req.body?.consent !== false && req.body?.consent !== 'false';

    if (!consent) {
      return res.status(400).json({
        error: 'Consent Required',
        message: 'Explicit consent is required before processing claims.'
      });
    }

    const stage1Input: Stage1Input = {
      inputType: inputType as any,
      content: req.body?.content || req.body?.text,
      url: req.body?.url,
      consent: true,
      language: (req.body?.language as string) || 'en'
    };

    if (req.file) {
      stage1Input.fileBuffer = req.file.buffer;
      stage1Input.fileMimeType = req.file.mimetype;
      stage1Input.fileName = req.file.originalname;
    }

    logger.info(`Received verification request: type=${inputType}, session=${req.session?.sessionId || 'anon'}`);
    const result = await pipeline.run(stage1Input, req.session?.sessionId);

    res.status(200).json(result);
  } catch (err: any) {
    logger.error('Verification route error: ' + err.message);
    res.status(400).json({
      error: 'Verification Failed',
      message: err.message || 'An error occurred during verification.'
    });
  }
};

verifyRouter.post('/', optionalSessionAuth, verificationRateLimiter, upload.single('file'), handleVerification);
verifyRouter.post('/text', optionalSessionAuth, verificationRateLimiter, upload.single('file'), handleVerification);
verifyRouter.post('/file', optionalSessionAuth, verificationRateLimiter, upload.single('file'), handleVerification);
verifyRouter.post('/url', optionalSessionAuth, verificationRateLimiter, upload.single('file'), handleVerification);

verifyRouter.get('/:id', optionalSessionAuth, (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const record = repository.getVerificationById(id);

  if (!record) {
    return res.status(404).json({ error: 'Not Found', message: `Verification with ID "${id}" was not found.` });
  }

  res.status(200).json(record);
});
