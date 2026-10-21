import type { Finding } from "@/generated/prisma/client";
import { SeverityBadge } from "./Badges";
import { blobUrl, cweUrl, formatDateTime } from "@/lib/format";
import { isSeverity } from "@/lib/severity";

interface Props {
  finding: Finding;
  htmlUrl: string;
  commitSha: string | null;
  isNew: boolean;
}

export function FindingCard({ finding: f, htmlUrl, commitSha, isNew }: Props) {
  return (
    <article className="card p-4">
      <header className="flex flex-wrap items-center gap-2">
        {isSeverity(f.severity) && <SeverityBadge severity={f.severity} />}
        <h3 className="font-semibold">{f.title}</h3>
        {isNew && <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-xs font-semibold text-sky-800">Nové</span>}
        {f.cwe && (
          <a href={cweUrl(f.cwe)} target="_blank" rel="noreferrer" className="text-xs text-slate-500 underline-offset-2 hover:underline">
            {f.cwe}
          </a>
        )}
      </header>

      {f.file && (
        <p className="mt-2 font-mono text-xs">
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

      <footer className="mt-3 flex flex-wrap gap-x-4 text-xs text-slate-400">
        <span>Poprvé zjištěno: {formatDateTime(f.firstSeenAt)}</span>
        {f.aliases && <span>Identifikátory: {f.aliases}</span>}
        {f.referenceUrl && (
          <a href={f.referenceUrl} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">
            Detail zranitelnosti ({f.advisoryId})
          </a>
        )}
      </footer>
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
