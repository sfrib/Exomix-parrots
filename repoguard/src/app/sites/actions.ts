"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/server";
import { normalizeOrigin, liveFetch, SiteFetchError } from "@/lib/site/fetch";
import { newVerifyToken, verifyOwnership } from "@/lib/site/verify";
import { createSiteAudit, executeSiteAudit } from "@/lib/site/run";

export type ActionState = { ok: boolean; message: string } | null;

function msg(err: unknown): string {
  return err instanceof Error ? err.message : "Neočekávaná chyba.";
}

export async function addSite(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const input = String(formData.get("url") ?? "").trim();
  if (!input) return { ok: false, message: "Zadejte adresu webu." };
  let origin: string, host: string;
  try {
    ({ origin, host } = normalizeOrigin(input));
  } catch (err) {
    return { ok: false, message: err instanceof SiteFetchError ? err.message : "Neplatná adresa." };
  }
  const existing = await db.site.findUnique({ where: { userId_origin: { userId: user.id, origin } } });
  if (existing) return { ok: false, message: "Tento web už máte přidaný." };
  await db.site.create({ data: { userId: user.id, origin, host, verifyToken: newVerifyToken() } });
  revalidatePath("/sites");
  return { ok: true, message: "Web přidán. Nyní ho ověřte." };
}

export async function verifySite(siteId: string, _prev: ActionState): Promise<ActionState> {
  const user = await requireUser();
  const site = await db.site.findFirst({ where: { id: siteId, userId: user.id } });
  if (!site) return { ok: false, message: "Web nebyl nalezen." };
  try {
    const ok = await verifyOwnership(site.origin, site.host, site.verifyToken, liveFetch);
    if (!ok) return { ok: false, message: "Ověřovací token se zatím nenašel. Zkontrolujte, že je soubor nebo DNS záznam dostupný, a zkuste to znovu." };
    await db.site.update({ where: { id: site.id }, data: { verified: true, verifiedAt: new Date() } });
  } catch (err) {
    return { ok: false, message: msg(err) };
  }
  revalidatePath("/sites");
  revalidatePath(`/sites/${siteId}`);
  return { ok: true, message: "Vlastnictví ověřeno. Teď můžete spustit audit." };
}

export async function auditSiteAction(siteId: string, _prev: ActionState): Promise<ActionState> {
  const user = await requireUser();
  const locale = await getLocale();
  try {
    const audit = await createSiteAudit(siteId, user.id);
    after(() => executeSiteAudit(audit.id, locale));
  } catch (err) {
    return { ok: false, message: msg(err) };
  }
  revalidatePath(`/sites/${siteId}`);
  return { ok: true, message: "Audit byl spuštěn." };
}

export async function deleteSite(siteId: string): Promise<void> {
  const user = await requireUser();
  await db.site.deleteMany({ where: { id: siteId, userId: user.id } });
  revalidatePath("/sites");
  redirect("/sites");
}
