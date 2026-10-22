import type { Category } from "./score";
import type { Severity } from "./severity";

/**
 * Pure SARIF 2.1.0 builder, shared by the webapp export and the CLI so both
 * emit byte-identical reports from the same logic. Callers normalise their own
 * finding shape (Prisma rows, scanner output) into {@link SarifFinding} and
 * provide already-localised text, so this module stays free of any dependency
 * on the database, Next.js or i18n.
 */

export const SARIF_LEVEL: Record<Severity, "error" | "warning" | "note"> = {
  critical: "error",
  high: "error",
  medium: "warning",
  low: "note",
};

// GitHub maps "security-severity" (0–10) to its own severity labels.
export const SECURITY_SEVERITY: Record<Severity, string> = { critical: "9.5", high: "8.0", medium: "5.5", low: "2.0" };

export interface SarifFinding {
  ruleId: string;
  /** Short title (rule shortDescription). */
  title: string;
  /** Risk explanation (rule fullDescription). */
  explanation: string;
  /** Suggested fix (rule help text). */
  fix: string;
  severity: Severity;
  cwe?: string | null;
  category: Category;
  /** Code path; findings without one are not valid SARIF results and must be filtered out by the caller. */
  file: string;
  line: number;
  /** Stable identity for cross-run result matching. */
  fingerprint: string;
  /** Present when the finding is triaged away; emitted as a SARIF suppression. */
  suppression?: { justification: string } | null;
}

export interface SarifProvenance {
  repositoryUri: string;
  revisionId: string;
  branch: string;
}

export interface SarifMeta {
  toolName: string;
  version: string;
  informationUri: string;
  provenance?: SarifProvenance[];
}

/** Builds a SARIF 2.1.0 log from already-localised, location-bearing findings. */
export function buildSarif(findings: SarifFinding[], meta: SarifMeta) {
  const ruleIds = [...new Set(findings.map((f) => f.ruleId))];
  const rules = ruleIds.map((id) => {
    const f = findings.find((x) => x.ruleId === id)!;
    return {
      id,
      name: id,
      shortDescription: { text: f.title },
      fullDescription: { text: f.explanation },
      help: { text: f.fix },
      properties: {
        tags: ["security", ...(f.cwe ? [`external/cwe/${f.cwe.toLowerCase()}`] : []), f.category],
        "security-severity": SECURITY_SEVERITY[f.severity],
      },
    };
  });
  const results = findings.map((f) => ({
    ruleId: f.ruleId,
    ruleIndex: ruleIds.indexOf(f.ruleId),
    level: SARIF_LEVEL[f.severity],
    message: { text: `${f.title}. ${f.explanation} Fix: ${f.fix}` },
    locations: [{ physicalLocation: { artifactLocation: { uri: f.file }, region: { startLine: f.line } } }],
    partialFingerprints: { "repoguard/v1": f.fingerprint },
    ...(f.suppression ? { suppressions: [{ kind: "external", status: "accepted", justification: f.suppression.justification }] } : {}),
  }));
  return {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: { driver: { name: meta.toolName, version: meta.version, informationUri: meta.informationUri, rules } },
        versionControlProvenance: meta.provenance,
        results,
      },
    ],
  };
}
