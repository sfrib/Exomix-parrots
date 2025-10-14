// pages/api/notifications/mark-read.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { ids = [], userId } = req.body as { ids: string[]; userId: string };
  if (!userId) return res.status(400).json({ error: 'userId missing' });
  await prisma.notification.updateMany({
    where: { id: { in: ids }, userId },
    data: { status: 'READ', readAt: new Date() }
  });
  return res.status(200).json({ ok: true });
}
