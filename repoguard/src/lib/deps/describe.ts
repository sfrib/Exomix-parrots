import type { DependencyVulnerability } from "./osv";
import type { Ecosystem } from "./parsers";

/**
 * Czech, human-readable explanation and fix for a dependency vulnerability.
 * Pure (no DB), so both the webapp scan pipeline and the CLI produce identical
 * text. The English equivalent lives in i18n/findings (depTextEn).
 */

export function upgradeCommand(ecosystem: Ecosystem, name: string, version: string): string {
  switch (ecosystem) {
    case "Packagist":
      return `composer require ${name}:^${version}`;
    case "npm":
      return `npm install ${name}@^${version}`;
    case "PyPI":
      return `pip install "${name}>=${version}"`;
  }
}

export function describeDependencyRisk(v: DependencyVulnerability): { explanation: string; fix: string } {
  const d = v.dependency;
  const ids = [v.advisoryId, ...v.aliases.filter((a) => a !== v.advisoryId)].join(", ");
  const parts = [
    `Balíček ${d.name} ve verzi ${d.version} obsahuje veřejně známou zranitelnost (${ids}).`,
    `Popis z databáze OSV: „${v.summary}“.`,
    "Informace o známých zranitelnostech jsou veřejné, takže je útočníci aktivně vyhledávají na webech, které používají zranitelné verze.",
  ];
  if (!d.direct) parts.push("Jde o nepřímou závislost – nainstalovala ji jiná knihovna, kterou používáte.");
  if (d.approximate) parts.push(`Verze je odvozena z rozsahu v ${d.manifest} (chybí lockfile); skutečně nainstalovaná verze může být novější.`);
  const explanation = parts.join(" ");

  let fix: string;
  if (v.fixedVersion) {
    fix = d.direct
      ? `Aktualizujte ${d.name} alespoň na verzi ${v.fixedVersion}: ${upgradeCommand(d.ecosystem, d.name, v.fixedVersion)}. Po aktualizaci aplikaci otestujte a commitněte i aktualizovaný lockfile.`
      : `Aktualizujte balíček, který ${d.name} vyžaduje, případně vynuťte opravenou verzi ${v.fixedVersion} (npm: "overrides" v package.json, Composer: composer update ${d.name} --with-dependencies). Poté commitněte lockfile.`;
  } else {
    fix = "Opravená verze zatím není k dispozici. Prostudujte doporučení v advisory (odkaz níže), zvažte náhradu balíčku nebo omezte použití zranitelné funkce.";
  }
  return { explanation, fix };
}
