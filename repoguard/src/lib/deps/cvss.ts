/** CVSS v3.x base score calculator (https://www.first.org/cvss/v3.1/specification-document). */

const WEIGHTS = {
  AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
  AC: { L: 0.77, H: 0.44 },
  UI: { N: 0.85, R: 0.62 },
  CIA: { H: 0.56, L: 0.22, N: 0 },
} as const;

function roundUp(value: number): number {
  const int = Math.round(value * 100000);
  return int % 10000 === 0 ? int / 100000 : (Math.floor(int / 10000) + 1) / 10;
}

export function cvss3BaseScore(vector: string): number | null {
  if (!/^CVSS:3\.[01]\//.test(vector)) return null;
  const m: Record<string, string> = {};
  for (const part of vector.split("/").slice(1)) {
    const [k, v] = part.split(":");
    m[k] = v;
  }
  const av = WEIGHTS.AV[m.AV as keyof typeof WEIGHTS.AV];
  const ac = WEIGHTS.AC[m.AC as keyof typeof WEIGHTS.AC];
  const ui = WEIGHTS.UI[m.UI as keyof typeof WEIGHTS.UI];
  const c = WEIGHTS.CIA[m.C as keyof typeof WEIGHTS.CIA];
  const i = WEIGHTS.CIA[m.I as keyof typeof WEIGHTS.CIA];
  const a = WEIGHTS.CIA[m.A as keyof typeof WEIGHTS.CIA];
  const scopeChanged = m.S === "C";
  const pr = { N: 0.85, L: scopeChanged ? 0.68 : 0.62, H: scopeChanged ? 0.5 : 0.27 }[m.PR as "N" | "L" | "H"];
  if ([av, ac, ui, c, i, a, pr].some((x) => x === undefined) || (m.S !== "U" && m.S !== "C")) return null;

  const iss = 1 - (1 - c) * (1 - i) * (1 - a);
  const impact = scopeChanged ? 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15) : 6.42 * iss;
  const exploitability = 8.22 * av * ac * pr * ui;
  if (impact <= 0) return 0;
  return scopeChanged ? roundUp(Math.min(1.08 * (impact + exploitability), 10)) : roundUp(Math.min(impact + exploitability, 10));
}
