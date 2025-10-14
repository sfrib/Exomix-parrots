
/**
 * Run daily: node workers/reviewExpiring.ts
 * Notifies owner and vet D-7 and D-1 before validUntil.
 */
import { prisma } from '@/lib/db';
import { sendMail } from '@/lib/mailer';

function daysBetween(a: Date, b: Date) {
  return Math.ceil((a.getTime()-b.getTime())/(1000*60*60*24));
}

async function main() {
  const now = new Date();
  const reviews = await prisma.vetReview.findMany({
    where: { validUntil: { not: null } },
    include: { recipe: { include: { owner: true } }, vet: true }
  });
  for (const rev of reviews) {
    const d = daysBetween(rev.validUntil!, now);
    if (d === 7 || d === 1) {
      // notify owner
      await prisma.notification.create({
        data: {
          userId: rev.recipe.ownerId,
          type: 'REVIEW_EXPIRING',
          entityType: 'recipe',
          entityId: rev.recipeId,
          payload: { title: `Platnost schválení brzy vyprší (D-${d})`, actions: { open: `/recipes/${rev.recipeId}` } }
        }
      });
      // email owner (if needed)
      await sendMail({ to: rev.recipe.owner.email, subject: `ExoMix – Platnost schválení brzy vyprší (D-${d})`, text: `Recept: ${process.env.APP_URL}/recipes/${rev.recipeId}` });
    }
  }
  console.log('Expiring notifications processed.');
}
main().catch(e=>{ console.error(e); process.exit(1); });
