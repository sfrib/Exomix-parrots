import fs from 'fs';
import path from 'path';
import { VetReviewEmailPayload } from '@/types/email';

export function renderVetReviewEmail(payload: VetReviewEmailPayload) {
  const htmlPath = process.env.EMAIL_TEMPLATE_HTML_PATH ?? path.join(process.cwd(), 'emails', 'exomix_email_vet_review.html');
  let html = fs.readFileSync(htmlPath, 'utf-8');

  // naive variable replace (if not using a templating engine)
  const map: Record<string, string> = {
    owner_name: payload.owner_name,
    owner_phone: payload.owner_phone ?? '',
    owner_email: payload.owner_email,
    species_common: payload.species_common,
    species_latin: payload.species_latin,
    animal_name: payload.animal_name ?? '',
    animal_age: String(payload.animal_age ?? ''),
    diet_type: payload.diet_type ?? '',
    recipe_version: String(payload.recipe_version),
    price_per_kg: String(payload.price_per_kg ?? ''),
    fat_pct: String(payload.fat_pct ?? ''),
    protein_pct: String(payload.protein_pct ?? ''),
    fiber_pct: String(payload.fiber_pct ?? ''),
    ca_to_p: payload.ca_to_p ?? '',
    delta_fat: payload.delta_fat ?? '',
    delta_protein: payload.delta_protein ?? '',
    delta_fiber: payload.delta_fiber ?? '',
    delta_cap: payload.delta_cap ?? '',
    dashboardUrl: payload.dashboardUrl,
    approveUrl: payload.approveUrl,
    requestChangesUrl: payload.requestChangesUrl,
    rejectUrl: payload.rejectUrl,
    preferencesUrl: payload.preferencesUrl ?? '#',
    privacyUrl: payload.privacyUrl ?? '#'
  };

  for (const [k, v] of Object.entries(map)) {
    html = html.replaceAll(`{{${k}}}`, v);
  }

  // mix_items table rows
  const rows = payload.mix_items.map(m => `<tr><td style="padding:6px 8px; border-bottom:1px solid #f0f3f7;">${m.name}</td><td align="right" style="padding:6px 8px; border-bottom:1px solid #f0f3f7;">${m.share_pct}</td></tr>`).join('');
  html = html.replace('{{#each mix_items}}', '').replace('{{/each}}', '').replace('{{name}}', '').replace('{{share_pct}}', '');
  html = html.replace('<!--MIX_ITEMS-->', rows);

  const text = `ExoMix – Žádost o schválení speciální diety\nZákazník: ${payload.owner_name} ${payload.owner_email}`;
  return { html, text };
}
