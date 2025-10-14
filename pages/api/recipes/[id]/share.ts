
import type { NextApiRequest, NextApiResponse } from 'next';
import { makeShareToken } from '@/lib/share';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const id = req.query.id as string;
  const token = makeShareToken(id);
  const url = `${process.env.APP_URL}/r/${id}?t=${token}`;
  res.status(200).json({ url });
}
