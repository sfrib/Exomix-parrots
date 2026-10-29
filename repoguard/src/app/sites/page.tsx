import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/server";
import { formatDateTime } from "@/lib/format";
import { GradeBadge } from "@/components/Badges";
import { ActionForm } from "@/components/ActionForm";
import { addSite } from "@/app/sites/actions";

export const dynamic = "force-dynamic";

export default async function SitesPage() {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const cs = locale === "cs";
  const sites = await db.site.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{cs ? "Audit webů" : "Website audit"}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {cs
            ? "Pasivní bezpečnostní kontrola živých webů, které vlastníte: bezpečnostní hlavičky, HTTPS, cookies a veřejně vystavené citlivé soubory. Web je nutné nejdřív ověřit."
            : "Passive security check of live websites you own: security headers, HTTPS, cookies and publicly exposed sensitive files. A site must be verified first."}
        </p>
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-medium">{cs ? "Přidat web" : "Add a website"}</h2>
        <ActionForm action={addSite} label={cs ? "Přidat" : "Add"} variant="primary" className="mt-2 flex flex-wrap items-start gap-2">
          <input
            name="url"
            placeholder="https://example.com"
            className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </ActionForm>
        <p className="mt-2 text-xs text-slate-400">
          {cs
            ? "Jen veřejné domény, které vlastníte. Interní adresy, IP a localhost nejsou povolené."
            : "Only public domains you own. Internal addresses, IPs and localhost are not allowed."}
        </p>
      </div>

      {sites.length === 0 ? (
        <p className="card p-8 text-center text-slate-500">{cs ? "Zatím žádné weby." : "No websites yet."}</p>
      ) : (
        <ul className="space-y-3">
          {sites.map((site) => (
            <li key={site.id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-4">
                {site.verified && site.lastGrade ? (
                  <GradeBadge grade={site.lastGrade} score={site.lastScore ?? 0} />
                ) : (
                  <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">{cs ? "Neověřeno" : "Unverified"}</span>
                )}
                <div className="min-w-0">
                  <Link href={`/sites/${site.id}`} className="font-semibold hover:underline">
                    {site.origin}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {site.verified
                      ? `${cs ? "Poslední audit" : "Last audit"}: ${formatDateTime(site.lastAuditAt, locale)}`
                      : cs
                        ? "Čeká na ověření vlastnictví"
                        : "Awaiting ownership verification"}
                  </p>
                </div>
              </div>
              <Link href={`/sites/${site.id}`} className="btn-secondary">
                {cs ? "Detail" : "Detail"}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
