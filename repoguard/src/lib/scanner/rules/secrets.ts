import type { FileContext, LineRule, Rule, RuleMatch } from "../types";
import type { Severity } from "../../severity";
import { looksLikePlaceholder } from "./helpers";

const ROTATE =
  "Klíč okamžitě zneplatněte a vygenerujte nový (smazání z kódu nestačí – zůstává v historii gitu). Novou hodnotu uložte do proměnné prostředí nebo správce tajemství a v kódu ji načítejte (getenv(), process.env). Historii lze vyčistit nástrojem git filter-repo nebo BFG.";

interface ProviderSecret {
  id: string;
  title: string;
  severity: Severity;
  pattern: RegExp;
  /** Index of the capture group holding the secret value (0 = whole match). */
  group?: number;
}

const PROVIDERS: ProviderSecret[] = [
  { id: "secret.private-key", title: "Soukromý klíč v repozitáři", severity: "critical", pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY(?: BLOCK)?-----/ },
  { id: "secret.aws", title: "AWS přístupový klíč", severity: "critical", pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { id: "secret.github", title: "GitHub token", severity: "critical", pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,})\b/ },
  { id: "secret.stripe", title: "Stripe live klíč", severity: "critical", pattern: /\b(?:sk|rk)_live_[0-9a-zA-Z]{20,}\b/ },
  { id: "secret.stripe-test", title: "Stripe testovací klíč", severity: "low", pattern: /\b(?:sk|rk)_test_[0-9a-zA-Z]{20,}\b/ },
  { id: "secret.slack", title: "Slack token / webhook", severity: "high", pattern: /\bxox[abprs]-[0-9A-Za-z-]{10,}\b|https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9/_-]{20,}/ },
  { id: "secret.google", title: "Google API klíč", severity: "high", pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { id: "secret.sendgrid", title: "SendGrid API klíč", severity: "high", pattern: /\bSG\.[\w-]{16,}\.[\w-]{16,}\b/ },
  { id: "secret.mailgun", title: "Mailgun API klíč", severity: "high", pattern: /\bkey-[0-9a-zA-Z]{32}\b/ },
  { id: "secret.openai", title: "API klíč pro AI službu", severity: "high", pattern: /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{32,}\b/ },
];

function providerRule(p: ProviderSecret): LineRule {
  return {
    id: p.id,
    title: p.title,
    cwe: "CWE-798",
    severity: p.severity,
    languages: "all",
    includeComments: true,
    pattern: p.pattern,
    refine: (_line, m) => {
      const value = m[p.group ?? 0];
      if (/EXAMPLE|example/.test(value)) return null;
      return { secret: value };
    },
    explanation:
      "V kódu je uložený přístupový klíč k externí službě. Kdokoli s přístupem k repozitáři – včetně jeho historie, forků nebo uniklé zálohy – může klíč zneužít na váš účet (útrata, rozesílání spamu, přístup k datům).",
    fix: ROTATE,
  };
}

const GENERIC_KEY =
  /\b([\w-]*(?:password|passwd|pwd|heslo|secret|api[_-]?key|apikey|access[_-]?token|auth[_-]?token|client[_-]?secret|private[_-]?key|db[_-]?pass)[\w-]*)['"]?\s*(?:=>|:=|=|:)\s*(['"])([^'"\s]{6,})\2/i;

function checkEnvFile(ctx: FileContext): RuleMatch[] {
  const name = ctx.file.path.split("/").pop() ?? "";
  if (!/^\.env(\..+)?$/.test(name)) return [];
  if (/\.(example|sample|template|dist|defaults?)$/i.test(name)) return [];
  const idx = ctx.lines.findIndex((l) => {
    const m = l.match(/^\s*(?:export\s+)?[A-Z0-9_]+\s*=\s*['"]?([^'"#\s]+)/);
    return Boolean(m && !looksLikePlaceholder(m[1]));
  });
  return idx === -1 ? [] : [{ line: idx + 1 }];
}

export const secretRules: Rule[] = [
  ...PROVIDERS.map(providerRule),
  {
    id: "secret.wp-db-password",
    title: "Heslo k databázi ve wp-config.php",
    cwe: "CWE-798",
    severity: "critical",
    languages: ["php"],
    includeComments: true,
    pattern: /define\s*\(\s*['"]DB_PASSWORD['"]\s*,\s*['"]([^'"]+)['"]/,
    refine: (_line, m) => (looksLikePlaceholder(m[1]) ? null : { secret: m[1] }),
    explanation:
      "Soubor wp-config.php s reálným heslem k databázi je v repozitáři. S tímto heslem lze přistoupit ke všem datům webu – uživatelským účtům, objednávkám, záznamům o pacientech.",
    fix:
      "Odeberte wp-config.php z gitu (git rm --cached wp-config.php, přidejte do .gitignore), do repozitáře dejte jen wp-config-sample.php. Heslo k databázi změňte a načítejte ho z prostředí: define( 'DB_PASSWORD', getenv( 'DB_PASSWORD' ) ).",
  },
  {
    id: "secret.wp-salts",
    title: "WordPress bezpečnostní klíče (salts) v repozitáři",
    cwe: "CWE-798",
    severity: "high",
    languages: ["php"],
    includeComments: true,
    pattern: /define\s*\(\s*['"](AUTH_KEY|SECURE_AUTH_KEY|LOGGED_IN_KEY|NONCE_KEY|AUTH_SALT|SECURE_AUTH_SALT|LOGGED_IN_SALT|NONCE_SALT)['"]\s*,\s*['"]([^'"]{16,})['"]/,
    refine: (_line, m) => (looksLikePlaceholder(m[2]) ? null : { secret: m[2] }),
    explanation: "Se znalostí těchto klíčů lze padělat přihlašovací cookies WordPressu a přihlásit se jako libovolný uživatel včetně administrátora.",
    fix: "Vygenerujte nové klíče (https://api.wordpress.org/secret-key/1.1/salt/), uložte je mimo repozitář (proměnné prostředí nebo soubor mimo git) a wp-config.php z gitu odeberte.",
  },
  {
    id: "secret.connection-string",
    title: "Přihlašovací údaje v connection stringu",
    cwe: "CWE-798",
    severity: "high",
    languages: "all",
    includeComments: true,
    pattern: /\b(?:mysql|mariadb|postgres(?:ql)?|mongodb(?:\+srv)?|redis|amqp|smtps?|ftp):\/\/[^:\s'"/@]+:([^@\s'"]+)@/i,
    refine: (_line, m) => (looksLikePlaceholder(m[1]) || /^(pass|pwd|\$|\{)/i.test(m[1]) ? null : { secret: m[1] }),
    explanation: "Adresa připojení k databázi nebo službě obsahuje heslo. Kdo vidí repozitář, má přístup k databázi.",
    fix: ROTATE,
  },
  {
    id: "secret.generic",
    title: "Pevně zapsané heslo nebo klíč",
    cwe: "CWE-798",
    severity: "high",
    languages: "all",
    includeComments: true,
    pattern: GENERIC_KEY,
    exclude: /getenv|process\.env|\$_ENV|\benv\s*\(|import\.meta\.env|os\.environ|config\s*\(|type\s*=\s*['"]password['"]|DB_PASSWORD|placeholder=/i,
    refine: (_line, m) => {
      const value = m[3];
      if (looksLikePlaceholder(value)) return null;
      // Likely a lookup key, translation id or field name rather than a secret.
      if (/^[a-z_]+$/.test(value) && value.length < 20) return null;
      if (/^(true|false|required|string|text|number|hidden)$/i.test(value)) return null;
      return { secret: value };
    },
    explanation:
      "V kódu je pevně zapsané heslo, API klíč nebo token. Tajné hodnoty v repozitáři se snadno dostanou do nesprávných rukou (sdílení kódu, forky, zálohy) a zůstávají v historii gitu i po smazání.",
    fix: ROTATE,
  },
  {
    id: "secret.env-file",
    title: "Soubor .env je součástí repozitáře",
    cwe: "CWE-538",
    severity: "high",
    languages: "all",
    includeComments: true,
    check: checkEnvFile,
    explanation: "Soubor .env typicky obsahuje hesla a API klíče a nemá být verzován. Všechny hodnoty v něm považujte za uniklé.",
    fix: "Odeberte soubor z gitu (git rm --cached .env), přidejte .env do .gitignore, do repozitáře dejte jen .env.example s prázdnými hodnotami a všechna tajemství z něj vyměňte.",
  },
];

export const SECRET_RULE_PREFIX = "secret.";
