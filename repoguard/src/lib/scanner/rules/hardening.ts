import type { Severity } from "../../severity";

/**
 * Web/server hardening checks that work from the repository: files that should
 * never be published (database dumps, backups, config backups, logs, admin
 * tools) and dangerous .htaccess / wp-config directives. Path-based checks run
 * over the full file list (see checkExposedFiles) so they catch backup archives
 * whose content is never downloaded.
 */

export interface ExposedFinding {
  ruleId: string;
  title: string;
  severity: Severity;
  file: string;
  explanation: string;
  fix: string;
}

interface ExposedRule {
  id: string;
  test: RegExp;
  title: string;
  severity: Severity;
  explanation: string;
  fix: string;
}

const REMOVE_FROM_GIT =
  "Odeberte soubor z repozitáře (git rm --cached <soubor>) a přidejte ho do .gitignore. Pokud byl nasazený na web, smažte ho i ze serveru a ověřte, že nebyl veřejně dostupný.";

const EXPOSED_RULES: ExposedRule[] = [
  {
    id: "web.config-backup",
    test: /(^|\/)(wp-config\.php\.(bak|old|save|orig|txt|_|~|swp)|wp-config\.(bak|old|save)\.php|\.env\.(bak|old|save|orig|local\.bak))$/i,
    title: "Záloha konfiguračního souboru s přístupy",
    severity: "critical",
    explanation:
      "V repozitáři je záloha konfiguračního souboru (wp-config nebo .env). Zálohy s příponou .bak/.old server často neservíruje jako PHP, ale vrátí jako text – kdokoli si pak může stáhnout heslo k databázi a klíče.",
    fix: "Považujte přístupy v souboru za uniklé: změňte heslo k databázi a bezpečnostní klíče. " + REMOVE_FROM_GIT,
  },
  {
    id: "web.db-dump",
    test: /(^|\/)[^/]*\.(sql|sql\.gz|sql\.zip|dump)$/i,
    title: "Databázový export (dump) v repozitáři",
    severity: "high",
    explanation:
      "V repozitáři je export databáze. Může obsahovat osobní údaje uživatelů a hashe hesel. Pokud leží i na webu pod uhodnutelnou adresou, stáhne si ho kdokoli.",
    fix: REMOVE_FROM_GIT,
  },
  {
    id: "web.backup-archive",
    test: /(^|\/)[^/]*(backup|zaloha|záloha)[^/]*\.(zip|tar|tar\.gz|tgz|rar|7z|gz)$|(^|\/)[^/]*\.(bak|old|orig|save)$/i,
    title: "Záloha nebo archiv v repozitáři",
    severity: "medium",
    explanation:
      "V repozitáři je záloha nebo archiv. Zálohy webu bývají kompletní (včetně konfigurace a dat) a na serveru je lze často stáhnout přímou adresou.",
    fix: REMOVE_FROM_GIT,
  },
  {
    id: "web.debug-log",
    test: /(^|\/)(debug\.log|error_log|php_errors\.log|wp-content\/debug\.log)$/i,
    title: "Ladicí/chybový log v repozitáři",
    severity: "medium",
    explanation:
      "V repozitáři je logovací soubor. Logy často prozrazují cesty na serveru, SQL dotazy i části dat a usnadňují útočníkovi hledání slabin. Na webu bývá debug.log veřejně čitelný.",
    fix: "Smažte log, vypněte zobrazování/logování chyb na produkci (WP_DEBUG_LOG) a přidejte *.log do .gitignore.",
  },
  {
    id: "web.admin-tool",
    test: /(^|\/)(adminer(-[\d.]+)?\.php|phpmyadmin(\/|\.php)|pma\.php|mysql\.php|db\.php|dbadmin\.php)$/i,
    title: "Nástroj pro správu databáze na webu",
    severity: "high",
    explanation:
      "V repozitáři (a nejspíš i na webu) je nástroj pro přímou správu databáze (Adminer, phpMyAdmin apod.). Je to častý cíl útoků – pokud k němu někdo získá přístup, má celou databázi.",
    fix: "Odstraňte nástroj z webu. Pokud ho potřebujete, používejte ho jen lokálně nebo za silným přihlášením a omezením IP, ne jako běžný soubor na produkci.",
  },
  {
    id: "web.phpinfo",
    test: /(^|\/)(phpinfo|info|test|i|temp)\.php$/i,
    title: "Možný testovací/phpinfo soubor",
    severity: "medium",
    explanation:
      "Soubor s názvem jako phpinfo.php / info.php / test.php bývá dočasný testovací skript, který prozrazuje verzi PHP, cesty a konfiguraci serveru. Útočníkovi to usnadní přípravu útoku.",
    fix: "Ověřte obsah a soubor odstraňte z webu i z repozitáře, pokud není potřeba.",
  },
  {
    id: "web.htpasswd",
    test: /(^|\/)\.htpasswd$/i,
    title: "Soubor .htpasswd v repozitáři",
    severity: "medium",
    explanation: "Soubor .htpasswd obsahuje přihlašovací údaje k basic auth (hashe hesel). V repozitáři je lze offline prolomit.",
    fix: "Odeberte soubor z gitu, hesla v něm změňte a uložte ho mimo verzovaný adresář.",
  },
  {
    id: "web.editor-metadata",
    test: /(^|\/)(\.DS_Store|Thumbs\.db|\.idea\/|\.vscode\/settings\.json|npm-debug\.log|\.ftpconfig|sftp-config\.json|\.vscode\/sftp\.json|wp-config-sample-backup\.php)$/i,
    title: "Vývojářský/systémový soubor v repozitáři",
    severity: "low",
    explanation:
      "V repozitáři je pomocný soubor editoru nebo systému (.DS_Store, konfigurace FTP/SFTP klienta…). Konfigurace FTP/SFTP může obsahovat přístupy; ostatní prozrazují strukturu projektu.",
    fix: "Přidejte tyto soubory do .gitignore a odeberte je z gitu. U konfigurace FTP/SFTP považujte přístupy za uniklé a změňte je.",
  },
  {
    id: "web.git-exposed",
    test: /(^|\/)(\.git\/config|\.git\/HEAD|\.svn\/|\.hg\/)$/i,
    title: "Adresář verzování nasazený na web",
    severity: "high",
    explanation:
      "Na webu je přístupný adresář .git/.svn/.hg. Z něj lze stáhnout celý zdrojový kód webu včetně konfigurace a historie (a tím i dříve smazaných hesel).",
    fix: "Nenasazujte .git na produkci. Na serveru přístup k těmto adresářům zablokujte a nasazujte jen sestavené soubory (export/deploy, ne git pull do web rootu).",
  },
];

/** Path-based exposed-file detection over the full repo file list. */
export function checkExposedFiles(paths: { path: string }[]): ExposedFinding[] {
  const out: ExposedFinding[] = [];
  const seen = new Set<string>();
  for (const { path } of paths) {
    if (seen.has(path)) continue;
    // Rules are ordered by severity; report only the most serious match per file.
    const rule = EXPOSED_RULES.find((r) => r.test.test(path));
    if (!rule) continue;
    seen.add(path);
    out.push({ ruleId: rule.id, title: rule.title, severity: rule.severity, file: path, explanation: rule.explanation, fix: rule.fix });
  }
  return out;
}

// Content rules for .htaccess and wp-config run through the normal engine (config language).
import type { Rule } from "../types";

export const hardeningRules: Rule[] = [
  {
    id: "web.htaccess-dir-listing",
    title: "Výpis obsahu adresářů je povolený (.htaccess)",
    cwe: "CWE-548",
    severity: "medium",
    languages: ["config"],
    pattern: /^\s*Options\s+([^\n]*\s)?\+?Indexes\b/im,
    exclude: /-Indexes/,
    explanation:
      "Direktiva Options +Indexes zapíná výpis obsahu adresářů. Když ve složce chybí index soubor, server ukáže seznam všech souborů – útočník tak najde zálohy, logy nebo nahrané soubory.",
    fix: "Nahraďte za Options -Indexes, nebo řádek odstraňte (výpis je pak vypnutý).",
  },
  {
    id: "web.htaccess-display-errors",
    title: "Zobrazování PHP chyb zapnuté v .htaccess",
    cwe: "CWE-209",
    severity: "low",
    languages: ["config"],
    pattern: /php_(flag|value)\s+display_errors\s+(on|1|true)/i,
    explanation: "Zobrazování chyb na produkci prozrazuje cesty na serveru a někdy i obsah proměnných, což útočníkovi usnadní práci.",
    fix: "Nastavte php_flag display_errors off a chyby jen logujte mimo web root.",
  },
  {
    id: "web.wpconfig-debug",
    title: "Zapnutý ladicí režim ve wp-config.php",
    cwe: "CWE-489",
    severity: "low",
    languages: ["php"],
    pattern: /define\s*\(\s*['"]WP_DEBUG['"]\s*,\s*true\s*\)/,
    exclude: /WP_DEBUG_DISPLAY/,
    explanation:
      "Ve wp-config.php je WP_DEBUG zapnutý. Na produkci může zobrazovat chyby a varování návštěvníkům včetně cest a verzí.",
    fix: "Na produkci nastavte WP_DEBUG na false (nebo WP_DEBUG_LOG true a WP_DEBUG_DISPLAY false, aby se chyby jen logovaly).",
  },
  {
    id: "web.wpconfig-file-edit",
    title: "Úprava souborů z administrace není zakázaná",
    cwe: "CWE-732",
    severity: "low",
    languages: ["php"],
    // Only flag wp-config.php that does not disable the file editor.
    check: (ctx) => {
      if (!/(^|\/)wp-config\.php$/.test(ctx.file.path)) return [];
      if (/DISALLOW_FILE_(EDIT|MODS)/.test(ctx.code)) return [];
      return [{ line: 1 }];
    },
    explanation:
      "Ve WordPressu lze z administrace přímo editovat kód pluginů a šablony. Pokud útočník získá účet administrátora, tímto editorem rovnou vloží webshell. Zákaz editoru mu to znesnadní.",
    fix: "Do wp-config.php přidejte define( 'DISALLOW_FILE_EDIT', true );",
  },
];
