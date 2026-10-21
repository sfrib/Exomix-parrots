import type { Finding, Suppression } from "@/generated/prisma/client";
import { SeverityBadge } from "./Badges";
import { ActionForm } from "./ActionForm";
import { blobUrl, cweUrl, formatDateTime } from "@/lib/format";
import { isSeverity } from "@/lib/severity";
import { VERDICT_LABEL_CS, type AiReview } from "@/lib/ai-review";
import { howItWasFound, verificationSteps } from "@/lib/verify";
import { localizedFinding } from "@/lib/i18n/findings";
import { t } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import { aiReviewFinding, restoreFinding, suppressFinding } from "@/app/actions";

interface Props {
  finding: Finding;
  htmlUrl: string;
  commitSha: string | null;
  isNew: boolean;
  aiEnabled: boolean;
  locale: Locale;
  suppression?: Suppression;
}

function parseReview(json: string | null): AiReview | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as AiReview;
  } catch {
    return null;
  }
}

const VERDICT_STYLE: Record<AiReview["verdict"], string> = {
  true_positive: "bg-red-50 text-red-800 ring-red-200",
  likely_false_positive: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  needs_context: "bg-slate-100 text-slate-700 ring-slate-200",
};

const VERDICT_EN: Record<AiReview["verdict"], string> = {
  true_positive: "Real issue",
  likely_false_positive: "Likely false positive",
  needs_context: "Needs more context",
};
const CONFIDENCE: Record<string, { en: string; cs: string }> = {
  high: { en: "high", cs: "vysoká" },
  medium: { en: "medium", cs: "střední" },
  low: { en: "low", cs: "nízká" },
};
const SUPPRESSION_LABEL: Record<string, { en: string; cs: string }> = {
  false_positive: { en: "False positive", cs: "Falešně pozitivní" },
  accepted_risk: { en: "Accepted risk", cs: "Akceptované riziko" },
};

export function FindingCard({ finding: f, htmlUrl, commitSha, isNew, aiEnabled, locale, suppression }: Props) {
  const review = parseReview(f.aiReview);
  const text = localizedFinding(f, locale);
  return (
    <article className={`card p-4 ${suppression ? "opacity-70" : ""}`}>
      <header className="flex flex-wrap items-center gap-2">
        {isSeverity(f.severity) && <SeverityBadge severity={f.severity} locale={locale} />}
        <h3 className="font-semibold">{text.title}</h3>
        {isNew && <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-xs font-semibold text-sky-800">{t("finding.new", locale)}</span>}
        {f.cwe && (
          <a href={cweUrl(f.cwe)} target="_blank" rel="noreferrer" className="text-xs text-slate-500 underline-offset-2 hover:underline">
            {f.cwe}
          </a>
        )}
        {suppression && (
          <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-700">{SUPPRESSION_LABEL[suppression.status]?.[locale] ?? suppression.status}</span>
        )}
      </header>

      {f.file && (
        <p className="mt-2 break-all font-mono text-xs">
          <a href={blobUrl(htmlUrl, commitSha, f.file, f.line)} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">
            {f.file}
            {f.line ? `:${f.line}` : ""}
          </a>
        </p>
      )}

      {f.kind === "dependency" && (
        <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
          <Field label={t("finding.package", locale)} value={`${f.packageName} (${f.ecosystem})`} />
          <Field label={t("finding.installedVersion", locale)} value={f.installedVersion} />
          <Field label={t("finding.fixedVersion", locale)} value={f.fixedVersion ?? t("finding.notYet", locale)} highlight={Boolean(f.fixedVersion)} />
          <Field label="CVSS" value={f.cvssScore !== null ? f.cvssScore.toFixed(1) : "—"} />
        </dl>
      )}

      {f.snippet && (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs text-slate-100">
          <code>{f.snippet}</code>
        </pre>
      )}

      <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
        <section>
          <h4 className="font-medium text-slate-700">{t("finding.why", locale)}</h4>
          <p className="mt-1 text-slate-600">{text.explanation}</p>
        </section>
        <section>
          <h4 className="font-medium text-slate-700">{t("finding.fix", locale)}</h4>
          <p className="mt-1 text-slate-600">{text.fix}</p>
        </section>
      </div>

      {review && (
        <section className="mt-3 rounded-lg border border-violet-200 bg-violet-50/50 p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-medium text-violet-900">{t("finding.aiReview", locale)}</h4>
            <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1 ${VERDICT_STYLE[review.verdict]}`}>
              {locale === "cs" ? VERDICT_LABEL_CS[review.verdict] : VERDICT_EN[review.verdict]}
            </span>
            <span className="text-xs text-slate-500">
              {locale === "cs" ? "jistota" : "confidence"}: {CONFIDENCE[review.confidence]?.[locale] ?? review.confidence} ·{" "}
              {locale === "cs" ? "navržená závažnost" : "suggested severity"}: {t(`sev.${review.suggestedSeverity}`, locale)} · {formatDateTime(f.aiReviewedAt, locale)}
            </span>
          </div>
          <p className="mt-2 font-medium text-slate-800">{review.summary}</p>
          <p className="mt-1 text-slate-600">{review.reasoning}</p>
          {review.fixSteps.length > 0 && (
            <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-slate-700">
              {review.fixSteps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          )}
          {review.patch && (
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs text-slate-100">
              <code>{review.patch}</code>
            </pre>
          )}
          <p className="mt-2 text-xs text-slate-400">{t("finding.aiGenerated", locale)}</p>
        </section>
      )}

      <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm">
        <summary className="cursor-pointer font-medium text-slate-700">{t("finding.howFound", locale)}</summary>
        <p className="mt-2 text-slate-600">{howItWasFound(f, locale)}</p>
        {f.file && (
          <p className="mt-1 text-xs">
            <span className="text-slate-500">{t("finding.exactLocation", locale)}: </span>
            <a href={blobUrl(htmlUrl, commitSha, f.file, f.line)} target="_blank" rel="noreferrer" className="break-all font-mono text-sky-700 hover:underline">
              {f.file}
              {f.line ? `:${f.line}` : ""} ↗
            </a>
          </p>
        )}
        <div className="mt-2">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("finding.verifySteps", locale)}</div>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-slate-600">
            {verificationSteps(f, locale).map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      </details>

      <footer className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-2 text-xs text-slate-400">
        <span>
          {t("finding.firstSeen", locale)}: {formatDateTime(f.firstSeenAt, locale)}
        </span>
        {f.aliases && (
          <span>
            {t("finding.ids", locale)}: {f.aliases}
          </span>
        )}
        {f.referenceUrl && (
          <a href={f.referenceUrl} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">
            {t("finding.advisoryDetail", locale)} ({f.advisoryId})
          </a>
        )}
      </footer>

      <div className="mt-3 flex flex-wrap items-start gap-3 border-t border-slate-100 pt-3">
        {aiEnabled && !suppression && (
          <ActionForm action={aiReviewFinding.bind(null, f.id, locale)} label={review ? t("finding.reReviewWithAi", locale) : t("finding.reviewWithAi", locale)} pendingLabel="…" variant="secondary" />
        )}
        {suppression ? (
          <form action={restoreFinding.bind(null, f.repoId, f.fingerprint)} className="flex flex-wrap items-center gap-2 text-sm">
            {suppression.note && <span className="text-slate-500">{suppression.note}</span>}
            <button className="btn-secondary">{t("finding.restore", locale)}</button>
          </form>
        ) : (
          <details className="text-sm">
            <summary className="btn-secondary cursor-pointer list-none">{t("finding.mark", locale)}</summary>
            <ActionForm action={suppressFinding.bind(null, f.repoId, f.fingerprint)} label={t("common.save", locale)} variant="secondary" className="mt-2 flex flex-wrap items-center gap-2">
              <select name="status" className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm" defaultValue="false_positive">
                <option value="false_positive">{t("finding.falsePositive", locale)}</option>
                <option value="accepted_risk">{t("finding.acceptedRisk", locale)}</option>
              </select>
              <input name="note" placeholder={t("finding.note", locale)} maxLength={500} className="w-64 max-w-full rounded-lg border border-slate-300 px-2 py-2 text-sm" />
            </ActionForm>
          </details>
        )}
      </div>
    </article>
  );
}

function Field({ label, value, highlight }: { label: string; value: string | null; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={highlight ? "font-semibold text-emerald-700" : "font-medium"}>{value ?? "—"}</dd>
    </div>
  );
}
