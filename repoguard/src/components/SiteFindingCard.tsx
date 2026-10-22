import type { SiteFinding } from "@/lib/site/audit";
import { SeverityBadge } from "./Badges";
import { t } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";

export function SiteFindingCard({ finding: f, locale }: { finding: SiteFinding; locale: Locale }) {
  return (
    <article className="card p-4">
      <header className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={f.severity} locale={locale} />
        <h3 className="font-semibold">{f.title}</h3>
      </header>
      {f.evidence && <p className="mt-1 font-mono text-xs text-slate-500">{f.evidence}</p>}
      <div className="mt-2 grid gap-3 text-sm md:grid-cols-2">
        <section>
          <h4 className="font-medium text-slate-700">{t("finding.why", locale)}</h4>
          <p className="mt-1 text-slate-600">{f.explanation}</p>
        </section>
        <section>
          <h4 className="font-medium text-slate-700">{t("finding.fix", locale)}</h4>
          <p className="mt-1 text-slate-600">{f.fix}</p>
        </section>
      </div>
    </article>
  );
}
