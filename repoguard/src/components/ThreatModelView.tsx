import type { ThreatModel } from "@/generated/prisma/client";
import type { Audit, Defenses, FindingRef, Scenarios } from "@/lib/threat-model";
import { isSeverity } from "@/lib/severity";
import { formatDateTime } from "@/lib/format";
import { t } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import { SeverityBadge } from "./Badges";
import { ActionForm } from "./ActionForm";
import { AutoRefresh } from "./AutoRefresh";
import { startThreatModel } from "@/app/actions";

const L = (locale: Locale, en: string, cs: string) => (locale === "cs" ? cs : en);

const STAGE: Record<string, { en: string; cs: string }> = {
  scenarios: { en: "1/3 Modelling attack scenarios", cs: "1/3 Modelování útočných scénářů" },
  defenses: { en: "2/3 Proposing defences", cs: "2/3 Návrh obrany" },
  audit: { en: "3/3 Final audit", cs: "3/3 Závěrečný audit" },
};
const LEVEL: Record<string, { en: string; cs: string }> = {
  high: { en: "high", cs: "vysoká" },
  medium: { en: "medium", cs: "střední" },
  low: { en: "low", cs: "nízká" },
};

function parse<T>(json: string | null): T | null {
  try {
    return json ? (JSON.parse(json) as T) : null;
  } catch {
    return null;
  }
}

export function ThreatModelView({ repoId, models, aiEnabled, locale }: { repoId: string; models: ThreatModel[]; aiEnabled: boolean; locale: Locale }) {
  const latest = models[0];
  const lastDone = models.find((m) => m.status === "done");
  return (
    <div className="space-y-6">
      <div className="card space-y-3 p-4 text-sm">
        <p className="text-slate-600">
          {L(
            locale,
            "AI goes through RepoGuard's findings and shows how an attacker could chain them (e.g. missing authorisation + SQL injection → leak of owners' data). For each scenario it proposes a defence and an independent “auditor” decides what is a real risk and what is only theory. Scenarios are described in words only — ",
            "AI projde nálezy RepoGuardu a ukáže, jak by je útočník mohl řetězit (např. chybějící kontrola oprávnění + SQL injection → únik dat majitelů zvířat). Ke každému scénáři navrhne obranu a nezávislý „auditor“ určí, co je reálné riziko a co jen teorie. Scénáře jsou popsané pouze slovně – ",
          )}
          <strong>{L(locale, "no attack code, payloads or commands", "bez útočného kódu, payloadů a příkazů")}</strong>.
        </p>
        <p className="text-xs text-slate-500">
          {L(
            locale,
            "The list of findings and short code excerpts (max 8 files, secrets masked) are sent to the Claude API. The analysis makes three model calls and usually takes a few minutes.",
            "Do Claude API se odešle seznam nálezů a krátké výřezy kódu (max. 8 souborů, tajné klíče maskované). Analýza tvoří tři volání modelu a trvá obvykle několik minut.",
          )}
        </p>
        {aiEnabled ? (
          latest?.status !== "running" && (
            <ActionForm
              action={startThreatModel.bind(null, repoId, locale)}
              label={lastDone ? L(locale, "Run a new analysis", "Spustit novou analýzu") : L(locale, "Run analysis", "Spustit analýzu")}
              pendingLabel="…"
            />
          )
        ) : (
          <p className="rounded-lg bg-amber-50 p-3 text-amber-900">
            {L(locale, "AI features are off. Set ", "AI funkce nejsou zapnuté. Nastavte v ")}
            <code className="font-mono">.env</code> <code className="font-mono">AI_REVIEW_ENABLED=&quot;true&quot;</code>
            {L(locale, " and ", " a ")}
            <code className="font-mono">ANTHROPIC_API_KEY</code>
            {L(locale, " and restart the app.", " a restartujte aplikaci.")}
          </p>
        )}
      </div>

      {latest?.status === "running" && (
        <div className="card flex items-center gap-3 p-4 text-sm text-sky-800">
          <AutoRefresh />
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-700 border-t-transparent" aria-hidden />
          {L(locale, "Running", "Probíhá")}: {STAGE[latest.stage]?.[locale] ?? latest.stage}… ({L(locale, "started", "spuštěno")} {formatDateTime(latest.createdAt, locale)})
        </div>
      )}
      {latest?.status === "failed" && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {L(locale, "The last analysis", "Poslední analýza")} ({formatDateTime(latest.createdAt, locale)}) {L(locale, "failed", "selhala")}: {latest.error}
        </p>
      )}

      {lastDone && <ThreatModelResult tm={lastDone} locale={locale} />}

      {models.filter((m) => m.status === "done").length > 1 && (
        <details className="card p-4 text-sm">
          <summary className="cursor-pointer font-medium">{L(locale, "Previous analyses", "Předchozí analýzy")}</summary>
          <ul className="mt-2 space-y-1 text-slate-600">
            {models
              .filter((m) => m.status === "done" && m.id !== lastDone?.id)
              .map((m) => {
                const audit = parse<Audit>(m.audit);
                return (
                  <li key={m.id}>
                    {formatDateTime(m.createdAt, locale)} · {L(locale, "score", "skóre")} {audit?.score ?? "?"}/100 · {L(locale, "risk", "riziko")}{" "}
                    {audit && isSeverity(audit.riskLevel) ? t(`sev.${audit.riskLevel}`, locale).toLowerCase() : "?"}
                    {m.commitSha ? ` · commit ${m.commitSha.slice(0, 7)}` : ""}
                  </li>
                );
              })}
          </ul>
        </details>
      )}
    </div>
  );
}

function ThreatModelResult({ tm, locale }: { tm: ThreatModel; locale: Locale }) {
  const scenarios = parse<Scenarios>(tm.scenarios)?.scenarios ?? [];
  const defenses = new Map((parse<Defenses>(tm.defenses)?.defenses ?? []).map((d) => [d.scenarioId, d]));
  const audit = parse<Audit>(tm.audit);
  const refs = new Map((parse<FindingRef[]>(tm.inputs) ?? []).map((r) => [r.ref, r]));
  const verdicts = new Map((audit?.verdicts ?? []).map((v) => [v.scenarioId, v]));

  return (
    <div className="space-y-6">
      {audit && (
        <section className="card space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">{L(locale, "Audit conclusion", "Závěr auditu")}</h2>
            {isSeverity(audit.riskLevel) && <SeverityBadge severity={audit.riskLevel} locale={locale} />}
            <span className="text-sm text-slate-600">
              {L(locale, "score", "skóre")} {audit.score}/100
            </span>
            <span className="text-xs text-slate-400">
              {formatDateTime(tm.finishedAt, locale)} · {tm.model}
              {tm.commitSha ? ` · commit ${tm.commitSha.slice(0, 7)}` : ""}
            </span>
          </div>
          <p className="text-slate-700">{audit.summary}</p>
          {audit.actionPlan.length > 0 && (
            <div>
              <h3 className="font-medium text-slate-700">{L(locale, "Fix plan", "Plán oprav")}</h3>
              <ol className="mt-1 space-y-1 text-sm">
                {[...audit.actionPlan]
                  .sort((a, b) => a.priority - b.priority)
                  .map((a, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-semibold text-slate-500">{i + 1}.</span>
                      <span>
                        {a.action}{" "}
                        <span className="text-xs text-slate-400">
                          ({L(locale, "effort", "náročnost")}: {LEVEL[a.effort]?.[locale] ?? a.effort}
                          {a.scenarioIds.length ? `, ${a.scenarioIds.join(", ")}` : ""})
                        </span>
                      </span>
                    </li>
                  ))}
              </ol>
            </div>
          )}
          {audit.strengths.length > 0 && (
            <div>
              <h3 className="font-medium text-slate-700">{L(locale, "What is fine", "Co je v pořádku")}</h3>
              <ul className="mt-1 list-disc pl-5 text-sm text-slate-600">
                {audit.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {scenarios.map((s) => {
        const d = defenses.get(s.id);
        const v = verdicts.get(s.id);
        return (
          <article key={s.id} className="card space-y-3 p-4">
            <header className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-400">{s.id}</span>
              {isSeverity(s.severity) && <SeverityBadge severity={s.severity} locale={locale} />}
              <h3 className="font-semibold">{s.title}</h3>
              <span className="text-xs text-slate-500">
                {L(locale, "likelihood", "pravděpodobnost")}: {LEVEL[s.likelihood]?.[locale] ?? s.likelihood}
              </span>
              {v && (
                <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1 ${v.realistic ? "bg-red-50 text-red-800 ring-red-200" : "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                  {v.realistic ? L(locale, "Real risk", "Reálné riziko") : L(locale, "Rather theoretical", "Spíše teoretické")}
                </span>
              )}
            </header>
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <section>
                <h4 className="font-medium text-slate-700">{L(locale, "How the attack would go", "Jak by útok probíhal")}</h4>
                <p className="mt-1 text-slate-600">
                  <span className="text-slate-500">{L(locale, "Who", "Kdo")}:</span> {s.attacker}
                  <br />
                  <span className="text-slate-500">{L(locale, "Entry point", "Vstupní bod")}:</span> {s.entryPoint}
                </p>
                <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-slate-600">
                  {s.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                <p className="mt-2 text-slate-700">
                  <span className="font-medium">{L(locale, "Impact", "Dopad")}:</span> {s.impact}
                </p>
                {s.relatedFindings.length > 0 && (
                  <ul className="mt-2 space-y-0.5 text-xs text-slate-500">
                    {s.relatedFindings.map((ref) => {
                      const r = refs.get(ref);
                      return (
                        <li key={ref}>
                          <span className="font-mono">{ref}</span> {r ? `${r.title}${r.location ? ` – ${r.location}` : ""}` : ""}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {v?.reason && <p className="mt-2 text-xs text-slate-500">{L(locale, "Auditor", "Auditor")}: {v.reason}</p>}
              </section>
              {d && (
                <section className="rounded-lg bg-emerald-50/60 p-3">
                  <h4 className="font-medium text-emerald-900">{L(locale, "Defence", "Obrana")}</h4>
                  <DefenseList label={L(locale, "Prevention", "Prevence")} items={d.prevent} />
                  <DefenseList label={L(locale, "Detection", "Detekce")} items={d.detect} />
                  <DefenseList label={L(locale, "Containment", "Omezení dopadu")} items={d.contain} />
                  <p className="mt-2 text-slate-700">
                    <span className="font-medium">{L(locale, "Verification", "Ověření")}:</span> {d.verify}
                  </p>
                </section>
              )}
            </div>
          </article>
        );
      })}
      <p className="text-xs text-slate-400">
        {L(locale, "The analysis was generated by AI from the static findings — verify the output against the code.", "Analýzu vygenerovala AI na základě statických nálezů – výstupy ověřte v kontextu kódu.")}
      </p>
    </div>
  );
}

function DefenseList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-2">
      <div className="text-xs font-medium uppercase tracking-wide text-emerald-800">{label}</div>
      <ul className="list-disc pl-5 text-slate-700">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
