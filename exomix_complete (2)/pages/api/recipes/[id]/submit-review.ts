// pages/api/recipes/[id]/submit-review.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { sendMail } from '@/lib/mailer';
import { renderVetReviewEmail } from '@/lib/renderEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const recipeId = req.query.id as string;
  const { toEmail, vetId, channel = 'EMAIL' } = req.body as { toEmail?: string; vetId?: string; channel?: 'EMAIL'|'DASHBOARD' };

  try {
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }, include: { owner: true, species: true } });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    // Create review request
    const reqRow = await prisma.vetReviewRequest.create({
      data: {
        recipeId,
        sentToEmail: toEmail ?? null,
        vetId: vetId ?? null,
        channel: channel === 'DASHBOARD' ? 'DASHBOARD' : 'EMAIL'
      }
    });

    // Mark recipe pending
    await prisma.recipe.update({ where: { id: recipeId }, data: { status: 'PENDING_VET_REVIEW' } });

    // Create in-app notification for vet (if vetId provided)
    if (vetId) {
      await prisma.notification.create({
        data: {
          userId: vetId,
          type: 'REVIEW_REQUESTED',
          entityType: 'recipe',
          entityId: recipeId,
          payload: {
            title: `Žádost o schválení – ${recipe.species.common} (${recipe.name} v${recipe.version})`,
            snippet: `Tuk ${recipe.nutritionSummaryJson['fat']} %, bílkoviny ${recipe.nutritionSummaryJson['protein']} %. Odeslal: ${recipe.owner.name ?? recipe.owner.email}.`,
            actions: {
              open: `/vet/reviews/${reqRow.id}`,
              approve: `/vet/reviews/${reqRow.id}/approve`,
              requestChanges: `/vet/reviews/${reqRow.id}/request-changes`,
              reject: `/vet/reviews/${reqRow.id}/reject`
            }
          }
        }
      });
    }

    // E-mail vetovi (if email provided)
    if (toEmail) {
      const payload = {
        owner_name: recipe.owner.name ?? recipe.owner.email,
        owner_phone: '',
        owner_email: recipe.owner.email,
        species_common: recipe.species.common,
        species_latin: recipe.species.latin,
        animal_name: recipe.name,
        animal_age: undefined,
        diet_type: recipe.dietType ?? undefined,
        recipe_version: recipe.version,
        price_per_kg: recipe.pricePerKg ?? undefined,
        fat_pct: recipe.nutritionSummaryJson['fat'],
        protein_pct: recipe.nutritionSummaryJson['protein'],
        fiber_pct: recipe.nutritionSummaryJson['fiber'],
        ca_to_p: recipe.nutritionSummaryJson['cap'],
        delta_fat: '',
        delta_protein: '',
        delta_fiber: '',
        delta_cap: '',
        mix_items: (recipe.mixItemsJson as any[]).map((m:any)=>({name:m.name, share_pct:m.share})),
        dashboardUrl: `${process.env.APP_URL}/vet/reviews/${reqRow.id}`,
        approveUrl: `${process.env.APP_URL}/api/vet/reviews/${reqRow.id}/decision?action=approve`,
        requestChangesUrl: `${process.env.APP_URL}/api/vet/reviews/${reqRow.id}/decision?action=changes`,
        rejectUrl: `${process.env.APP_URL}/api/vet/reviews/${reqRow.id}/decision?action=reject`,
        preferencesUrl: `${process.env.APP_URL}/preferences/notifications`,
        privacyUrl: `${process.env.APP_URL}/privacy`
      };
      const { html, text } = renderVetReviewEmail(payload as any);
      await sendMail({ to: toEmail, subject: 'ExoMix – Žádost o schválení speciální diety', html, text });
    }

    return res.status(200).json({ ok: true, requestId: reqRow.id });
  } catch (e:any) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
