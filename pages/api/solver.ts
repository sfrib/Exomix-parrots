// pages/api/solver.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { solveNutrition, IngredientPortion } from '@/utils/solver';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Použij POST metodu.' });
  }

  const mix: IngredientPortion[] = req.body;

  if (!Array.isArray(mix) || mix.some(i => typeof i.name !== 'string' || typeof i.percentage !== 'number')) {
    return res.status(400).json({ error: 'Neplatný vstup. Očekává se pole surovin se jménem a procentem.' });
  }

  const result = solveNutrition(mix);
  res.status(200).json(result);
}
