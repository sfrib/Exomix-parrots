import path from "node:path";
import { Document, Font, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { Finding, Repo } from "@/generated/prisma/client";
import { countBySeverity, groupBySeverity, sortFindings, statusFor } from "./findings";
import { formatDateTime } from "./format";
import { SEVERITY_LABEL_CS, STATUS_LABEL_CS, type Severity } from "./severity";

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
  footer: { position: "absolute", bottom: 20, left: 36, right: 36, fontSize: 7, color: "#94a3b8", flexDirection: "row", justifyContent: "space-between" },
});

function FindingBlock({ f }: { f: Finding }) {
  const sev = f.severity as Severity;
  return (
    <View style={s.finding} wrap={false}>
      <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
        <Text style={[s.badge, { backgroundColor: COLORS[sev] }]}>{SEVERITY_LABEL_CS[sev]}</Text>
        <Text style={{ fontWeight: "bold", flex: 1 }}>{f.title}</Text>
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
          Nainstalováno: {f.installedVersion} · Opraveno ve verzi: {f.fixedVersion ?? "zatím není"} · CVSS:{" "}
          {f.cvssScore !== null ? f.cvssScore.toFixed(1) : "neuvedeno"}
          {f.aliases ? ` · ${f.aliases}` : ""}
        </Text>
      ) : null}
      {f.snippet ? <Text style={s.snippet}>{f.snippet}</Text> : null}
      <Text style={s.label}>Proč je to riziko</Text>
      <Text>{f.explanation}</Text>
      <Text style={s.label}>Jak to opravit</Text>
      <Text>{f.fix}</Text>
      {f.referenceUrl ? <Text style={[s.muted, { marginTop: 2 }]}>{f.referenceUrl}</Text> : null}
    </View>
  );
}

function Section({ title, findings, empty }: { title: string; findings: Finding[]; empty: string }) {
  return (
    <View>
      <Text style={s.h2}>{title}</Text>
      {findings.length === 0 ? <Text style={s.muted}>{empty}</Text> : null}
      {groupBySeverity(sortFindings(findings)).map((g) => (
        <View key={g.severity}>
          <Text style={[s.h3, { color: COLORS[g.severity] }]}>
            {SEVERITY_LABEL_CS[g.severity]} závažnost ({g.items.length})
          </Text>
          {g.items.map((f) => (
            <FindingBlock key={f.id} f={f} />
          ))}
        </View>
      ))}
    </View>
  );
}

export function renderReport(repo: Repo, findings: Finding[]): Promise<Buffer> {
  const counts = countBySeverity(findings);
  const generated = formatDateTime(new Date());
  const code = findings.filter((f) => f.kind === "code");
  const deps = findings.filter((f) => f.kind === "dependency");

  const doc = (
    <Document title={`RepoGuard – ${repo.fullName}`} author="RepoGuard" language="cs">
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Bezpečnostní report</Text>
        <Text style={{ fontSize: 12, lineHeight: 1.3 }}>{repo.fullName}</Text>
        <Text style={[s.muted, { marginTop: 4 }]}>
          Vygenerováno {generated} · větev {repo.defaultBranch}
          {repo.lastCommitSha ? ` · commit ${repo.lastCommitSha.slice(0, 7)}` : ""}
        </Text>
        <Text style={s.muted}>
          Sken kódu: {formatDateTime(repo.lastCodeScanAt)} · Kontrola závislostí: {formatDateTime(repo.lastDepScanAt)}
        </Text>

        <Text style={s.h2}>Souhrn – stav: {STATUS_LABEL_CS[statusFor(repo, findings)]}</Text>
        <View style={s.row}>
          {(Object.keys(counts) as Severity[]).map((sev) => (
            <View key={sev} style={s.tile}>
              <Text style={{ fontSize: 16, fontWeight: "bold", lineHeight: 1.3, color: COLORS[sev] }}>{counts[sev]}</Text>
              <Text style={s.muted}>{SEVERITY_LABEL_CS[sev]}</Text>
            </View>
          ))}
        </View>
        <Text style={{ marginTop: 8 }}>
          Nálezy v kódu: {code.length} · Zranitelné závislosti: {deps.length}
        </Text>

        <Section title="Nálezy ve zdrojovém kódu" findings={code} empty="Žádné nálezy." />
        <Section title="Zranitelné závislosti (CVE)" findings={deps} empty="Žádné známé zranitelnosti." />

        <Text style={[s.muted, { marginTop: 16, fontSize: 7.5 }]}>
          Statická analýza vyhledává typické vzory slabých míst a může obsahovat falešně pozitivní nálezy; každý nález
          ověřte v kontextu kódu. Data o zranitelnostech pocházejí z databáze OSV.dev. Tajné hodnoty jsou v reportu
          maskovány.
        </Text>

        <View style={s.footer} fixed>
          <Text>RepoGuard · {repo.fullName}</Text>
          <Text render={({ pageNumber, totalPages }) => `Strana ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
  return renderToBuffer(doc);
}
