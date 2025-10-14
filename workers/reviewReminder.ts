
/**
 * Run: node workers/reviewReminder.ts
 * Finds vet review requests older than 72h without decision and sends reminder.
 */
import { prisma } from '@/lib/db';
import { sendMail } from '@/lib/mailer';

async function main() {
  const since = new Date(Date.now() - 72*60*60*1000);
  const pending = await prisma.vetReviewRequest.findMany({
    where: { currentStatus: 'PENDING', createdAt: { lt: since } },
    include: { recipe: { include: { owner: true, species: true } } }
  });
  for (const r of pending) {
    if (!r.sentToEmail) continue;
    const subject = `ExoMix – Připomínka: čeká žádost o schválení (${r.recipe.species.common})`;
    const text = `Prosíme o zkontrolování receptu: ${process.env.APP_URL}/vet/reviews/${r.id}`;
    await sendMail({ to: r.sentToEmail, subject, text });
  }
  console.log(`Reminders sent: ${pending.length}`);
}
main().catch(e=>{ console.error(e); process.exit(1); });
