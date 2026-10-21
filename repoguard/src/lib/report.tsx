import path from "node:path";
import { Document, Font, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { Finding, Repo, Suppression, ThreatModel } from "@/generated/prisma/client";
import type { Audit, Defenses, Scenarios } from "./threat-model";
import { countBySeverity, groupBySeverity, partitionSuppressed, sortFindings, statusFor } from "./findings";
import { categoryOf, computeScore } from "./score";
import { VERDICT_LABEL_CS, type AiReview } from "./ai-review";
import { localizedFinding } from "./i18n/findings";
import { t } from "./i18n/messages";
import type { Locale } from "./i18n/locale";
import { formatDateTime } from "./format";
import { type Severity } from "./severity";

const L = (locale: Locale, en: string, cs: string) => (locale === "cs" ? cs : en);
const sevLabel = (locale: Locale, sev: Severity) => t(`sev.${sev}`, locale);

// DejaVu covers Czech diacritics; the built-in PDF fonts do not.
const fontDir = path.join(process.cwd(), "node_modules", "dejavu-fonts-ttf", "ttf");
Font.register({
  family: "DejaVu",
  fonts: [
    { src: path.join(fontDir, "DejaVuSans.ttf") },
    { src: path.join(fontDir, "DejaVuSans-Bold.ttf"), fontWeight: "bold" },
  ],
});
Font.register({ family: "DejaVuMono", src: path.join(fontDir, "DejaVuSansMono.ttf") });
Font.registerHyphenationCallback((word) => [word]);

const COLORS: Record<Severity, string> = { critical: "#b91c1c", high: "#c2410c", medium: "#b45309", low: "#475569" };

const s = StyleSheet.create({
  page: { fontFamily: "DejaVu", fontSize: 9, padding: 36, paddingBottom: 48, color: "#0f172a", lineHeight: 1.4 },
  h1: { fontSize: 18, fontWeight: "bold", lineHeight: 1.3, marginBottom: 2 },
  h2: { fontSize: 13, fontWeight: "bold", marginTop: 16, marginBottom: 6 },
  h3: { fontSize: 11, fontWeight: "bold", marginTop: 10, marginBottom: 4 },
  muted: { color: "#64748b" },
  row: { flexDirection: "row", gap: 12, marginTop: 8 },
  tile: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, padding: 6, width: 90 },
  finding: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, padding: 8, marginBottom: 6 },
  badge: { color: "#ffffff", fontSize: 8, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2, alignSelf: "flex-start" },
  snippet: { fontFamily: "DejaVuMono", fontSize: 7.5, backgroundColor: "#f1f5f9", padding: 4, marginTop: 4 },
  label: { fontWeight: "bold", marginTop: 4 },
  footer: { position: "absolute", bottom: 20, left: 36, right: 36, fontSize: 7, color: "#94a3b8" },
});

function parseReview(json: string | null): AiReview | null {
  try {
    return json ? (JSON.parse(json) as AiReview) : null;
  } catch {
    return null;
  }
}

function FindingBlock({ f, locale }: { f: Finding; locale: Locale }) {
  const sev = f.severity as Severity;
  const review = parseReview(f.aiReview);
  const lf = localizedFinding(f, locale);
  return (
    <View style={s.finding} wrap={false}>
      <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
        <Text style={[s.badge, { backgroundColor: COLORS[sev] }]}>{sevLabel(locale, sev)}</Text>
        <Text style={{ fontWeight: "bold", flex: 1 }}>{lf.title}</Text>
        {f.cwe ? <Text style={s.muted}>{f.cwe}</Text> : null}
      </View>
      {f.file ? (
        <Text style={[s.muted, { fontFamily: "DejaVuMono", fontSize: 8, marginTop: 2 }]}>
          {f.file}
          {f.line ? `:${f.line}` : ""}
        </Text>
      ) : null}
      {f.kind === "dependency" ? (
        <Text style={{ marginTop: 2 }}>
          {L(locale, "Installed", "Nainstalováno")}: {f.installedVersion} · {L(locale, "Fixed in", "Opraveno ve verzi")}: {f.fixedVersion ?? L(locale, "none yet", "zatím není")} · CVSS:{" "}
          {f.cvssScore !== null ? f.cvssScore.toFixed(1) : "—"}
          {f.aliases ? ` · ${f.aliases}` : ""}
        </Text>
      ) : null}
      {f.snippet ? <Text style={s.snippet}>{f.snippet}</Text> : null}
      <Text style={s.label}>{t("finding.why", locale)}</Text>
      <Text>{lf.explanation}</Text>
      <Text style={s.label}>{t("finding.fix", locale)}</Text>
      <Text>{lf.fix}</Text>
      {review ? (
        <View style={{ marginTop: 4, padding: 4, backgroundColor: "#f5f3ff" }}>
          <Text style={{ fontWeight: "bold" }}>{t("finding.aiReview", locale)}: {locale === "cs" ? VERDICT_LABEL_CS[review.verdict] : review.verdict}</Text>
          <Text>{review.summary}</Text>
        </View>
      ) : null}
      {f.referenceUrl ? <Text style={[s.muted, { marginTop: 2 }]}>{f.referenceUrl}</Text> : null}
    </View>
  );
}

function Section({ title, findings, empty, locale }: { title: string; findings: Finding[]; empty: string; locale: Locale }) {
  return (
    <View>
      <Text style={s.h2}>{title}</Text>
      {findings.length === 0 ? <Text style={s.muted}>{empty}</Text> : null}
      {groupBySeverity(sortFindings(findings)).map((g) => (
        <View key={g.severity}>
          <Text style={[s.h3, { color: COLORS[g.severity] }]}>
            {sevLabel(locale, g.severity)} {t("sev.severityWord", locale)} ({g.items.length})
          </Text>
          {g.items.map((f) => (
            <FindingBlock key={f.id} f={f} locale={locale} />
          ))}
        </View>
      ))}
    </View>
  );
}

function parseJson<T>(json: string | null): T | null {
  try {
    return json ? (JSON.parse(json) as T) : null;
  } catch {
    return null;
  }
}

function ThreatSection({ tm, locale }: { tm: ThreatModel; locale: Locale }) {
  const audit = parseJson<Audit>(tm.audit);
  const scenarios = parseJson<Scenarios>(tm.scenarios)?.scenarios ?? [];
  const defenses = new Map((parseJson<Defenses>(tm.defenses)?.defenses ?? []).map((d) => [d.scenarioId, d]));
  return (
    // Own page: react-pdf crashes when this section is split mid-block across pages.
    <View break>
      <Text style={s.h2}>{t("tab.threats", locale)}</Text>
      <Text style={s.muted}>
        {formatDateTime(tm.finishedAt, locale)} · {tm.model} · {L(locale, "scenarios described in words, no attack code", "scénáře popsané slovně, bez útočného kódu")}
      </Text>
      {audit ? (
        <View style={{ marginTop: 4 }}>
          <Text style={{ fontWeight: "bold" }}>
            {L(locale, "Risk", "Riziko")}: {sevLabel(locale, audit.riskLevel)} · {L(locale, "audit score", "skóre auditu")} {audit.score}/100
          </Text>
          <Text>{audit.summary}</Text>
          {audit.actionPlan.length ? <Text style={s.label}>{L(locale, "Fix plan", "Plán oprav")}</Text> : null}
          {[...audit.actionPlan]
            .sort((a, b) => a.priority - b.priority)
            .map((a, i) => (
              <Text key={i}>
                {i + 1}. {a.action}
              </Text>
            ))}
        </View>
      ) : null}
      {scenarios.map((sc) => {
        const d = defenses.get(sc.id);
        return (
          <View key={sc.id} style={s.finding} wrap={false}>
            <Text style={{ fontWeight: "bold" }}>
              <Text style={{ color: COLORS[sc.severity] }}>[{sevLabel(locale, sc.severity)}]</Text> {sc.id} {sc.title}
            </Text>
            <Text style={s.muted}>
              {sc.attacker} · {L(locale, "entry", "vstup")}: {sc.entryPoint} · {L(locale, "findings", "nálezy")}: {sc.relatedFindings.join(", ")}
            </Text>
            {sc.steps.map((st, i) => (
              <Text key={i}>
                {i + 1}. {st}
              </Text>
            ))}
            <Text>{L(locale, "Impact", "Dopad")}: {sc.impact}</Text>
            {d ? (
              <View>
                <Text style={s.label}>{L(locale, "Defence", "Obrana")}</Text>
                {d.prevent.map((p, i) => (
                  <Text key={i}>• {p}</Text>
                ))}
                <Text>{L(locale, "Verification", "Ověření")}: {d.verify}</Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function renderReport(repo: Repo, allFindings: Finding[], suppressions: Suppression[], threatModel?: ThreatModel | null, locale: Locale = "en"): Promise<Buffer> {
  const { active: findings, suppressed } = partitionSuppressed(allFindings, suppressions);
  const counts = countBySeverity(findings);
  const score = computeScore(findings, { code: Boolean(repo.lastCodeScanAt), deps: Boolean(repo.lastDepScanAt) });
  const generated = formatDateTime(new Date(), locale);
  const malware = findings.filter((f) => categoryOf(f) === "malware");
  const code = findings.filter((f) => f.kind === "code" && categoryOf(f) === "code");
  const secrets = findings.filter((f) => categoryOf(f) === "secrets");
  const web = findings.filter((f) => categoryOf(f) === "web");
  const agent = findings.filter((f) => categoryOf(f) === "agent");
  const deps = findings.filter((f) => f.kind === "dependency");
  const repoFindings = findings.filter((f) => f.kind === "repo");

  const doc = (
    <Document title={`RepoGuard – ${repo.fullName}`} author="RepoGuard" language={locale}>
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>{L(locale, "Security report", "Bezpečnostní report")}</Text>
        <Text style={{ fontSize: 12, lineHeight: 1.3 }}>{repo.fullName}</Text>
        <Text style={[s.muted, { marginTop: 4 }]}>
          {L(locale, "Generated", "Vygenerováno")} {generated} · {L(locale, "branch", "větev")} {repo.defaultBranch}
          {repo.lastCommitSha ? ` · commit ${repo.lastCommitSha.slice(0, 7)}` : ""}
        </Text>
        <Text style={s.muted}>
          {t("repo.codeScan", locale)}: {formatDateTime(repo.lastCodeScanAt, locale)} · {t("repo.depScan", locale)}: {formatDateTime(repo.lastDepScanAt, locale)}
        </Text>

        <Text style={s.h2}>{L(locale, "Summary — status", "Souhrn – stav")}: {t(`status.${statusFor(repo, findings)}`, locale)}</Text>
        <View style={s.row}>
          {(Object.keys(counts) as Severity[]).map((sev) => (
            <View key={sev} style={s.tile}>
              <Text style={{ fontSize: 16, fontWeight: "bold", lineHeight: 1.3, color: COLORS[sev] }}>{counts[sev]}</Text>
              <Text style={s.muted}>{sevLabel(locale, sev)}</Text>
            </View>
          ))}
        </View>
        {score ? (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: "bold" }}>
              {t("repo.score", locale)}: {score.score}/100 – {L(locale, "grade", "známka")} {score.grade}
            </Text>
            <Text style={s.muted}>
              {score.categories.map((c) => `${t(`cat.${c.category}`, locale)} ${c.score}`).join(" · ")}
            </Text>
          </View>
        ) : null}
        <Text style={{ marginTop: 8 }}>
          {t("cat.malware", locale)}: {malware.length} · {t("cat.code", locale)}: {code.length} · {t("cat.secrets", locale)}: {secrets.length} · {t("cat.web", locale)}: {web.length} ·
          {" "}{t("cat.agent", locale)}: {agent.length} · {t("cat.deps", locale)}: {deps.length} · {t("cat.repo", locale)}: {repoFindings.length}
          {suppressed.length ? ` · ${L(locale, "Suppressed", "Potlačeno")}: ${suppressed.length}` : ""}
        </Text>

        <Section title={L(locale, "Compromise detection (webshells and backdoors)", "Detekce napadení (webshelly a zadní vrátka)")} findings={malware} empty={L(locale, "No signs of compromise.", "Žádné známky napadení.")} locale={locale} />
        <Section title={L(locale, "Source code findings", "Nálezy ve zdrojovém kódu")} findings={[...code, ...secrets]} empty={L(locale, "No findings.", "Žádné nálezy.")} locale={locale} />
        <Section title={t("cat.web", locale)} findings={web} empty={L(locale, "No findings.", "Bez nálezů.")} locale={locale} />
        <Section title={L(locale, "AI agent & CI configuration", "Konfigurace AI agentů a CI")} findings={agent} empty={L(locale, "No findings.", "Žádné nálezy.")} locale={locale} />
        <Section title={L(locale, "Vulnerable dependencies (CVE)", "Zranitelné závislosti (CVE)")} findings={deps} empty={L(locale, "No known vulnerabilities.", "Žádné známé zranitelnosti.")} locale={locale} />
        <Section title={t("cat.repo", locale)} findings={repoFindings} empty={L(locale, "No recommendations.", "Bez doporučení.")} locale={locale} />

        {threatModel ? <ThreatSection tm={threatModel} locale={locale} /> : null}

        {suppressed.length ? (
          <View>
            <Text style={s.h2}>{L(locale, "Suppressed findings", "Potlačené nálezy")}</Text>
            {suppressed.map((f) => {
              const sup = suppressions.find((x) => x.fingerprint === f.fingerprint)!;
              const label = sup.status === "false_positive" ? L(locale, "False positive", "Falešně pozitivní") : L(locale, "Accepted risk", "Akceptované riziko");
              return (
                <Text key={f.id}>
                  • {localizedFinding(f, locale).title}
                  {f.file ? ` (${f.file}${f.line ? `:${f.line}` : ""})` : ""} – {label}
                  {sup.note ? `: ${sup.note}` : ""}
                </Text>
              );
            })}
          </View>
        ) : null}

        <Text style={[s.muted, { marginTop: 16, fontSize: 7.5 }]}>
          {L(
            locale,
            "Static analysis looks for typical patterns of weaknesses and may contain false positives; verify each finding in the context of the code. Vulnerability data comes from the OSV.dev database. Secret values are masked in the report.",
            "Statická analýza vyhledává typické vzory slabých míst a může obsahovat falešně pozitivní nálezy; každý nález ověřte v kontextu kódu. Data o zranitelnostech pocházejí z databáze OSV.dev. Tajné hodnoty jsou v reportu maskovány.",
          )}
        </Text>

        {/* Static footer only: dynamic `render` page numbers crash react-pdf 4.x layout on longer reports. */}
        <Text style={s.footer} fixed>
          RepoGuard · {repo.fullName} · {generated}
        </Text>
      </Page>
    </Document>
  );
  return renderToBuffer(doc);
}
