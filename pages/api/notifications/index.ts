// pages/api/notifications/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // TODO: get user from session
    const userId = String(req.query.userId ?? '');
    if (!userId) return res.status(400).json({ error: 'userId missing (mock)' });
    const items = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return res.status(200).json({ items });
  }
  if (req.method === 'POST') {
    // create manual notification (debug)
    const { userId, payload } = req.body;
    const n = await prisma.notification.create({
      data: { userId, type: 'REVIEW_REQUESTED', entityType: 'recipe', entityId: 'debug', payload, status: 'UNREAD' }
    });
    return res.status(200).json({ ok: true, id: n.id });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
