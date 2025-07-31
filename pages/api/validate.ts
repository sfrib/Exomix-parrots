// pages/api/validate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { NutrientTotals } from '@/utils/solver';
import { validateMix } from '@/utils/validator';
import { validateWithMode } from '@/utils/modeValidator';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Použij POST metodu.' });
  }

  const { nutrition, mode } = req.body;

  if (!nutrition || typeof nutrition !== 'object') {
    return res.status(400).json({ error: 'Chybí nutriční data.' });
  }

  const general = validateMix(nutrition as NutrientTotals);
  const regime = validateWithMode(nutrition as NutrientTotals, mode || 'běžný stav');

  res.status(200).json({ general, regime });
}
