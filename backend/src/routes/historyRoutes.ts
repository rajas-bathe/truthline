import { Router, Response } from 'express';
import { AuthenticatedRequest, optionalSessionAuth } from '../security/auth';
import { VerificationRepository } from '../database/repository';
import { logger } from '../security/logger';

export const historyRouter = Router();
const repository = new VerificationRepository();

historyRouter.get('/', optionalSessionAuth, (req: AuthenticatedRequest, res: Response) => {
  const limit = parseInt((req.query.limit as string) || '50', 10);
  const offset = parseInt((req.query.offset as string) || '0', 10);
  const verdict = req.query.verdict as string;
  const search = req.query.search as string;

  const result = repository.listVerifications({ limit, offset, verdict, search });
  res.status(200).json(result);
});

historyRouter.delete('/:id', optionalSessionAuth, (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  logger.info(`Deleting verification history entry: ${id}`);
  repository.deleteVerification(id);
  res.status(200).json({ success: true, deletedId: id });
});

historyRouter.post('/clear', optionalSessionAuth, (_req: AuthenticatedRequest, res: Response) => {
  logger.info('Clearing all verification history from database...');
  repository.clearAllVerifications();
  res.status(200).json({ success: true, message: 'All history records cleared.' });
});
