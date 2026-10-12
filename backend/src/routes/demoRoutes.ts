import { Router, Request, Response } from 'express';

export const demoRouter = Router();

const samples = [
  {
    expectedVerdict: 'FALSE',
    category: 'Viral Health / Science Hoax',
    claim: 'NASA confirmed 15 days of total darkness starting next Monday due to solar blackout.',
    notes: 'Classic recurring internet hoax with fake agency attribution.'
  },
  {
    expectedVerdict: 'VERIFIED',
    category: 'Space Exploration Fact',
    claim: 'ISRO launched Chandrayaan-3 successfully and landed near the lunar south pole.',
    notes: 'Corroborated by space agency telemetry and international observatories.'
  },
  {
    expectedVerdict: 'OUTDATED',
    category: 'Recirculated Circular',
    claim: 'Government declares emergency nationwide 21-day lockdown starting tonight at 8 PM.',
    notes: 'Authentic 2020 pandemic circular circulated maliciously as current news.'
  },
  {
    expectedVerdict: 'PARTIALLY_SUPPORTED',
    category: 'Statistical Exaggeration',
    claim: 'New national expressway opened with record 150 km/h speed limit nationwide for all cars.',
    notes: 'Expressway was inaugurated, but speed limit is 120 km/h and not nationwide.'
  },
  {
    expectedVerdict: 'CANNOT_CONFIRM',
    category: 'Hyperlocal Assertion',
    claim: 'Local corner electronics repair shop in Smalltown gave away free laptops to anyone named Alex.',
    notes: 'Unindexed hyperlocal claim with no credible public documentation.'
  }
];

demoRouter.get('/samples', (_req: Request, res: Response) => {
  res.status(200).json({ samples });
});

demoRouter.get('/cases', (_req: Request, res: Response) => {
  res.status(200).json({ samples, cases: samples });
});

demoRouter.get('/examples', (_req: Request, res: Response) => {
  res.status(200).json({ samples, examples: samples });
});
