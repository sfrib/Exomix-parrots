import type { Finding, Suppression } from "@/generated/prisma/client";
import { SeverityBadge } from "./Badges";
import { ActionForm } from "./ActionForm";
import { blobUrl, cweUrl, formatDateTime } from "@/lib/format";
import { SEVERITY_LABEL_CS, isSeverity } from "@/lib/severity";
import { SUPPRESSION_LABEL_CS } from "@/lib/findings";
import { VERDICT_LABEL_CS, type AiReview } from "@/lib/ai-review";
import { howItWasFound, verificationSteps } from "@/lib/verify";
import { aiReviewFinding, restoreFinding, suppressFinding } from "@/app/actions";

interface Props {
  finding: Finding;
  htmlUrl: string;
  commitSha: string | null;
  isNew: boolean;
  aiEnabled: boolean;
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

export function FindingCard({ finding: f, htmlUrl, commitSha, isNew, aiEnabled, suppression }: Props) {
  const review = parseReview(f.aiReview);
  return (
    <article className={`card p-4 ${suppression ? "opacity-70" : ""}`}>
      <header className="flex flex-wrap items-center gap-2">
        {isSeverity(f.severity) && <SeverityBadge severity={f.severity} />}
        <h3 className="font-semibold">{f.title}</h3>
        {isNew && <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-xs font-semibold text-sky-800">Nové</span>}
        {f.cwe && (
          <a href={cweUrl(f.cwe)} target="_blank" rel="noreferrer" className="text-xs text-slate-500 underline-offset-2 hover:underline">
            {f.cwe}
          </a>
        )}
        {suppression && (
          <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-700">
            {SUPPRESSION_LABEL_CS[suppression.status] ?? suppression.status}
          </span>
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
          <Field label="Balíček" value={`${f.packageName} (${f.ecosystem})`} />
          <Field label="Nainstalovaná verze" value={f.installedVersion} />
          <Field label="Opravená verze" value={f.fixedVersion ?? "zatím není"} highlight={Boolean(f.fixedVersion)} />
          <Field label="CVSS" value={f.cvssScore !== null ? f.cvssScore.toFixed(1) : "neuvedeno"} />
        </dl>
      )}

      {f.snippet && (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs text-slate-100">
          <code>{f.snippet}</code>
        </pre>
      )}

      <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
        <section>
          <h4 className="font-medium text-slate-700">Proč je to riziko</h4>
          <p className="mt-1 text-slate-600">{f.explanation}</p>
        </section>
        <section>
          <h4 className="font-medium text-slate-700">Jak to opravit</h4>
          <p className="mt-1 text-slate-600">{f.fix}</p>
        </section>
      </div>

      {review && (
        <section className="mt-3 rounded-lg border border-violet-200 bg-violet-50/50 p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-medium text-violet-900">AI posouzení</h4>
            <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1 ${VERDICT_STYLE[review.verdict]}`}>
              {VERDICT_LABEL_CS[review.verdict]}
            </span>
            <span className="text-xs text-slate-500">
              jistota: {review.confidence === "high" ? "vysoká" : review.confidence === "medium" ? "střední" : "nízká"} · navržená závažnost:{" "}
              {SEVERITY_LABEL_CS[review.suggestedSeverity]} · {formatDateTime(f.aiReviewedAt)}
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
          <p className="mt-2 text-xs text-slate-400">Návrh vygenerovala AI – před použitím ho zkontrolujte.</p>
        </section>
      )}

      <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm">
        <summary className="cursor-pointer font-medium text-slate-700">Jak jsem to našel a jak to ověřit</summary>
        <p className="mt-2 text-slate-600">{howItWasFound(f)}</p>
        {f.file && (
          <p className="mt-1 text-xs">
            <span className="text-slate-500">Přesné místo: </span>
            <a href={blobUrl(htmlUrl, commitSha, f.file, f.line)} target="_blank" rel="noreferrer" className="break-all font-mono text-sky-700 hover:underline">
              {f.file}
              {f.line ? `:${f.line}` : ""} ↗
            </a>
          </p>
        )}
        <div className="mt-2">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Ověření krok za krokem</div>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-slate-600">
            {verificationSteps(f).map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      </details>

      <footer className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-2 text-xs text-slate-400">
        <span>Poprvé zjištěno: {formatDateTime(f.firstSeenAt)}</span>
        {f.aliases && <span>Identifikátory: {f.aliases}</span>}
        {f.referenceUrl && (
          <a href={f.referenceUrl} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">
            Detail zranitelnosti ({f.advisoryId})
          </a>
        )}
      </footer>

      <div className="mt-3 flex flex-wrap items-start gap-3 border-t border-slate-100 pt-3">
        {aiEnabled && !suppression && (
          <ActionForm
            action={aiReviewFinding.bind(null, f.id)}
            label={review ? "Znovu posoudit pomocí AI" : "Posoudit pomocí AI"}
            pendingLabel="AI posuzuje…"
            variant="secondary"
          />
        )}
        {suppression ? (
          <form action={restoreFinding.bind(null, f.repoId, f.fingerprint)} className="flex flex-wrap items-center gap-2 text-sm">
            {suppression.note && <span className="text-slate-500">Poznámka: {suppression.note}</span>}
            <button className="btn-secondary">Obnovit nález</button>
          </form>
        ) : (
          <details className="text-sm">
            <summary className="btn-secondary cursor-pointer list-none">Označit…</summary>
            <ActionForm action={suppressFinding.bind(null, f.repoId, f.fingerprint)} label="Uložit" variant="secondary" className="mt-2 flex flex-wrap items-center gap-2">
              <select name="status" className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm" defaultValue="false_positive">
                <option value="false_positive">Falešně pozitivní</option>
                <option value="accepted_risk">Akceptované riziko</option>
              </select>
              <input name="note" placeholder="Zdůvodnění (nepovinné)" maxLength={500} className="w-64 max-w-full rounded-lg border border-slate-300 px-2 py-2 text-sm" />
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
