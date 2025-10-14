// pages/api/vet/reviews/[id]/decision.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  const action = (req.query.action as string) ?? (req.body?.action as string);
  const notes = (req.body?.notes as string) ?? '';
  const validUntil = req.body?.validUntil ? new Date(req.body.validUntil) : null;
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!['approve', 'changes', 'reject'].includes(action ?? '')) return res.status(400).json({ error: 'Invalid action' });

  try {
    const reqRow = await prisma.vetReviewRequest.findUnique({ where: { id }, include: { recipe: { include: { owner: true } } } });
    if (!reqRow) return res.status(404).json({ error: 'Review request not found' });

    // Create vet review
    const decision = action === 'approve' ? 'APPROVED' : (action === 'changes' ? 'CHANGES' : 'REJECTED');
    const review = await prisma.vetReview.create({
      data: {
        recipeId: reqRow.recipeId,
        vetId: reqRow.vetId ?? null,
        decision,
        notes,
        validUntil: validUntil
      }
    });

    // Update recipe status
    await prisma.recipe.update({
      where: { id: reqRow.recipeId },
      data: { status: decision === 'APPROVED' ? 'APPROVED' : (decision === 'CHANGES' ? 'CHANGES_REQUESTED' : 'REJECTED') }
    });

    // Update request status
    await prisma.vetReviewRequest.update({ where: { id }, data: { currentStatus: 'DECIDED' } });

    // Notify owner
    await prisma.notification.create({
      data: {
        userId: reqRow.recipe.ownerId,
        type: 'REVIEW_DECIDED',
        entityType: 'recipe',
        entityId: reqRow.recipeId,
        payload: {
          title: decision === 'APPROVED' ? 'Recept schválen' : decision === 'CHANGES' ? 'Recept vrácen s připomínkami' : 'Recept zamítnut',
          snippet: notes?.slice(0, 140) ?? '',
          actions: { open: `/recipes/${reqRow.recipeId}` }
        }
      }
    });

    return res.status(200).json({ ok: true, reviewId: review.id, decision });
  } catch (e:any) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
