import type { Severity } from "../../severity";
import type { DownloadedFile } from "../../github";

/**
 * Detects WordPress core / plugin / theme versions in the repository and flags
 * components that look outdated or unmaintained. Without a live vulnerability
 * feed (WPScan) this cannot prove a component is vulnerable, so it reports
 * version facts and conservative staleness signals and tells the owner to check.
 */

export interface ComponentFinding {
  ruleId: string;
  title: string;
  severity: Severity;
  file: string;
  explanation: string;
  fix: string;
  installedVersion?: string;
}

// WordPress 6.0 shipped in 2022; a plugin "tested up to" below that is very likely stale.
const STALE_WP = 6.0;

function parseMajorMinor(v: string): number | null {
  const m = v.match(/(\d+)\.(\d+)/);
  return m ? Number(`${m[1]}.${m[2]}`) : null;
}

function header(content: string, field: string): string | null {
  const m = content.match(new RegExp(`^[\\s*#]*${field}\\s*:\\s*(.+)$`, "im"));
  return m ? m[1].trim() : null;
}

function slugOf(path: string, kind: "plugins" | "themes"): string | null {
  const m = path.match(new RegExp(`wp-content/${kind}/([^/]+)/`));
  return m ? m[1] : null;
}

export function checkComponents(files: DownloadedFile[]): ComponentFinding[] {
  const out: ComponentFinding[] = [];

  // WordPress core
  const core = files.find((f) => /(^|\/)wp-includes\/version\.php$/.test(f.path));
  if (core) {
    const v = core.content.match(/\$wp_version\s*=\s*['"]([\d.]+)/)?.[1];
    if (v) {
      const mm = parseMajorMinor(v) ?? 0;
      out.push({
        ruleId: "comp.wp-core",
        title: `WordPress jádro verze ${v}`,
        severity: mm < STALE_WP ? "high" : "low",
        file: core.path,
        installedVersion: v,
        explanation:
          mm < STALE_WP
            ? `Jádro WordPressu je ve verzi ${v}, což je starší řada. Starší jádro má známé a veřejně popsané zranitelnosti, které útočníci cíleně vyhledávají.`
            : `V repozitáři je jádro WordPressu verze ${v}. Ověřte, že je to aktuální vydání – jádro bývá nejčastějším cílem automatizovaných útoků.`,
        fix: "Aktualizujte WordPress na nejnovější verzi (Nástěnka → Aktualizace). Před aktualizací udělejte zálohu. Ideálně zapněte automatické aktualizace jádra.",
      });
    }
  }

  // Plugins and themes: find version + "tested up to"
  const components = new Map<string, { kind: "plugins" | "themes"; version?: string; testedUpTo?: string; file: string }>();
  for (const f of files) {
    for (const kind of ["plugins", "themes"] as const) {
      const slug = slugOf(f.path, kind);
      if (!slug) continue;
      const key = `${kind}/${slug}`;
      const entry = components.get(key) ?? { kind, file: f.path };
      if (/readme\.txt$/i.test(f.path)) {
        entry.testedUpTo = header(f.content, "Tested up to") ?? entry.testedUpTo;
        entry.version = header(f.content, "Stable tag") ?? entry.version;
      } else if (/style\.css$/i.test(f.path) && kind === "themes") {
        entry.version = header(f.content, "Version") ?? entry.version;
      } else if (/\.php$/i.test(f.path) && /Plugin Name\s*:/i.test(f.content)) {
        entry.version = header(f.content, "Version") ?? entry.version;
        entry.file = f.path;
      }
      components.set(key, entry);
    }
  }

  for (const [key, c] of components) {
    const slug = key.split("/")[1];
    const tested = c.testedUpTo ? parseMajorMinor(c.testedUpTo) : null;
    if (tested !== null && tested < STALE_WP) {
      out.push({
        ruleId: "comp.stale-plugin",
        title: `${c.kind === "plugins" ? "Plugin" : "Šablona"} ${slug} je pravděpodobně neudržovaná`,
        severity: "medium",
        file: c.file,
        installedVersion: c.version,
        explanation: `Údaj „Tested up to: ${c.testedUpTo}“ znamená, že ${c.kind === "plugins" ? "plugin" : "šablona"} byla naposledy ověřena se starou verzí WordPressu. Neudržované komponenty bývají zdrojem zranitelností, protože se jejich chyby neopravují.`,
        fix: `Zkontrolujte, zda existuje novější verze. Pokud je ${c.kind === "plugins" ? "plugin" : "šablona"} opuštěná, nahraďte ji udržovanou alternativou nebo ji odstraňte, pokud ji nepotřebujete.`,
      });
    }
  }

  return out;
}

export function isComponentFile(path: string): boolean {
  return /(^|\/)wp-includes\/version\.php$/i.test(path) || /(^|\/)readme\.txt$/i.test(path) || /(^|\/)style\.css$/i.test(path);
}
