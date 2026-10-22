import type { Severity } from "../severity";
import type { Locale } from "../i18n/locale";
import { mapLimit } from "../concurrency";
import { type SiteFetch, type SiteResponse } from "./fetch";

/**
 * Passive live-website security audit. It performs a small, fixed set of
 * GET requests against an origin the user has verified they own: the home page
 * (for headers / cookies / info disclosure) plus a short list of well-known
 * sensitive paths. No fuzzing, brute-forcing, payloads or write requests.
 */

export interface SiteFinding {
  id: string;
  severity: Severity;
  title: string;
  explanation: string;
  fix: string;
  evidence?: string;
}

interface L {
  en: string;
  cs: string;
}
function pick(l: L, locale: Locale): string {
  return locale === "cs" ? l.cs : l.en;
}

// Security headers: key -> how to grade when missing.
const HEADER_CHECKS: { header: string; id: string; severity: Severity; title: L; explanation: L; fix: L }[] = [
  {
    header: "content-security-policy",
    id: "site.header.csp",
    severity: "medium",
    title: { en: "Missing Content-Security-Policy", cs: "Chybí Content-Security-Policy" },
    explanation: {
      en: "Without a Content-Security-Policy the browser will run any script the page contains. If an attacker injects a script (XSS), CSP would be the layer that blocks it.",
      cs: "Bez Content-Security-Policy prohlížeč spustí jakýkoli skript na stránce. Pokud útočník vloží skript (XSS), CSP je vrstva, která by to zastavila.",
    },
    fix: {
      en: "Add a Content-Security-Policy header, starting restrictive (e.g. default-src 'self') and loosening only where needed. In WordPress a security plugin or the server config can set it.",
      cs: "Přidejte hlavičku Content-Security-Policy, začněte přísně (např. default-src 'self') a povolujte jen potřebné zdroje. Ve WordPressu ji nastaví bezpečnostní plugin nebo konfigurace serveru.",
    },
  },
  {
    header: "strict-transport-security",
    id: "site.header.hsts",
    severity: "medium",
    title: { en: "Missing HSTS (Strict-Transport-Security)", cs: "Chybí HSTS (Strict-Transport-Security)" },
    explanation: {
      en: "Without HSTS a visitor's first request can be downgraded to unencrypted HTTP by an attacker on the network, who can then read or alter it.",
      cs: "Bez HSTS může útočník v síti první požadavek návštěvníka stáhnout na nešifrované HTTP a pak ho číst nebo měnit.",
    },
    fix: {
      en: "Add Strict-Transport-Security: max-age=31536000; includeSubDomains (only once HTTPS works everywhere).",
      cs: "Přidejte Strict-Transport-Security: max-age=31536000; includeSubDomains (až když HTTPS funguje všude).",
    },
  },
  {
    header: "x-content-type-options",
    id: "site.header.nosniff",
    severity: "low",
    title: { en: "Missing X-Content-Type-Options", cs: "Chybí X-Content-Type-Options" },
    explanation: {
      en: "Without 'nosniff' the browser may guess a response's type and execute e.g. an uploaded file as a script.",
      cs: "Bez 'nosniff' může prohlížeč typ odpovědi hádat a spustit např. nahraný soubor jako skript.",
    },
    fix: { en: "Add X-Content-Type-Options: nosniff.", cs: "Přidejte X-Content-Type-Options: nosniff." },
  },
  {
    header: "x-frame-options",
    id: "site.header.frame",
    severity: "low",
    title: { en: "Missing clickjacking protection", cs: "Chybí ochrana proti clickjackingu" },
    explanation: {
      en: "Without X-Frame-Options (or CSP frame-ancestors) the page can be embedded in a hidden frame on a fraudulent site and used to trick users into clicks (clickjacking).",
      cs: "Bez X-Frame-Options (nebo CSP frame-ancestors) lze stránku vložit do skrytého rámu na podvodném webu a nalákat uživatele na kliknutí (clickjacking).",
    },
    fix: { en: "Add X-Frame-Options: SAMEORIGIN, or Content-Security-Policy: frame-ancestors 'self'.", cs: "Přidejte X-Frame-Options: SAMEORIGIN, nebo Content-Security-Policy: frame-ancestors 'self'." },
  },
  {
    header: "referrer-policy",
    id: "site.header.referrer",
    severity: "low",
    title: { en: "Missing Referrer-Policy", cs: "Chybí Referrer-Policy" },
    explanation: {
      en: "Without a Referrer-Policy the full URL (which may contain tokens or IDs) can leak to other sites the user navigates to.",
      cs: "Bez Referrer-Policy může plná URL (třeba s tokenem nebo ID) unikat na jiné weby, kam uživatel přejde.",
    },
    fix: { en: "Add Referrer-Policy: strict-origin-when-cross-origin.", cs: "Přidejte Referrer-Policy: strict-origin-when-cross-origin." },
  },
];

// Well-known sensitive paths probed on the owner's own site.
const SENSITIVE_PATHS: { path: string; id: string; severity: Severity; title: L; mustContain?: RegExp }[] = [
  { path: "/.git/HEAD", id: "site.exposed.git", severity: "high", title: { en: "Exposed .git repository", cs: "Vystavený .git repozitář" }, mustContain: /^ref:|^[0-9a-f]{40}/m },
  { path: "/.env", id: "site.exposed.env", severity: "critical", title: { en: "Exposed .env file", cs: "Vystavený soubor .env" }, mustContain: /[A-Z0-9_]+=/ },
  { path: "/wp-config.php.bak", id: "site.exposed.wpconfig", severity: "critical", title: { en: "Exposed wp-config backup", cs: "Vystavená záloha wp-config" }, mustContain: /DB_|define\s*\(/ },
  { path: "/.svn/entries", id: "site.exposed.svn", severity: "high", title: { en: "Exposed .svn directory", cs: "Vystavený adresář .svn" } },
  { path: "/server-status", id: "site.exposed.serverstatus", severity: "medium", title: { en: "Apache server-status exposed", cs: "Vystavený Apache server-status" }, mustContain: /Apache Server Status|Server uptime/i },
  { path: "/phpinfo.php", id: "site.exposed.phpinfo", severity: "medium", title: { en: "phpinfo() page exposed", cs: "Vystavená stránka phpinfo()" }, mustContain: /phpinfo\(\)|PHP Version/i },
];

const EXPOSED_FIX: L = {
  en: "Make sure the file/directory is not deployed and is blocked at the server (deny access). If it was reachable, treat any credentials in it as leaked and rotate them.",
  cs: "Zajistěte, aby soubor/adresář nebyl nasazený a server k němu blokoval přístup (deny). Pokud byl dostupný, považujte přihlašovací údaje v něm za uniklé a změňte je.",
};

function cookieFindings(home: SiteResponse, locale: Locale): SiteFinding[] {
  // Headers.getSetCookie() returns all Set-Cookie lines.
  const cookies = typeof home.headers.getSetCookie === "function" ? home.headers.getSetCookie() : home.headers.get("set-cookie") ? [home.headers.get("set-cookie")!] : [];
  const bad = cookies.filter((c) => !/;\s*secure/i.test(c) || !/;\s*httponly/i.test(c));
  if (bad.length === 0) return [];
  const name = bad[0].split("=")[0];
  return [
    {
      id: "site.cookie.flags",
      severity: "medium",
      title: pick({ en: "Cookies without Secure / HttpOnly flags", cs: "Cookies bez příznaků Secure / HttpOnly" }, locale),
      explanation: pick(
        {
          en: "A session cookie without HttpOnly can be stolen by JavaScript (XSS); without Secure it can travel over unencrypted HTTP. Both make session hijacking easier.",
          cs: "Session cookie bez HttpOnly může ukrást JavaScript (XSS); bez Secure může cestovat přes nešifrované HTTP. Obojí usnadňuje převzetí relace.",
        },
        locale,
      ),
      fix: pick({ en: "Set the Secure, HttpOnly and SameSite=Lax (or Strict) flags on session cookies.", cs: "Nastavte u session cookies příznaky Secure, HttpOnly a SameSite=Lax (nebo Strict)." }, locale),
      evidence: name ? `Set-Cookie: ${name}=…` : undefined,
    },
  ];
}

function infoDisclosure(home: SiteResponse, locale: Locale): SiteFinding[] {
  const out: SiteFinding[] = [];
  const powered = home.headers.get("x-powered-by");
  const server = home.headers.get("server");
  const generator = home.body.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i)?.[1];
  const details = [powered && `X-Powered-By: ${powered}`, server && /\d/.test(server) && `Server: ${server}`, generator && `generator: ${generator}`].filter(Boolean);
  if (details.length === 0) return out;
  out.push({
    id: "site.info-disclosure",
    severity: "low",
    title: pick({ en: "Software version disclosure", cs: "Prozrazení verze software" }, locale),
    explanation: pick(
      {
        en: "The site reveals the exact software and version it runs (headers or a generator tag). Attackers use this to target known vulnerabilities for that version.",
        cs: "Web prozrazuje přesný software a verzi, kterou běží (hlavičky nebo generator tag). Útočníci podle toho cílí známé zranitelnosti dané verze.",
      },
      locale,
    ),
    fix: pick({ en: "Remove or reduce version headers (X-Powered-By, detailed Server) and the generator meta tag.", cs: "Odstraňte nebo zkraťte hlavičky s verzí (X-Powered-By, podrobný Server) a generator meta tag." }, locale),
    evidence: details.join(" · "),
  });
  return out;
}

export interface SiteAuditResult {
  findings: SiteFinding[];
  reachable: boolean;
  usesHttps: boolean;
}

/** Runs the passive audit against a verified origin. `fetcher` is injectable for testing. */
export async function auditSite(origin: string, fetcher: SiteFetch, locale: Locale = "en"): Promise<SiteAuditResult> {
  const httpOrigin = origin.replace(/^https:/, "http:");
  const findings: SiteFinding[] = [];

  let home: SiteResponse;
  try {
    home = await fetcher(origin, { maxBytes: 512 * 1024 });
  } catch {
    return { findings: [], reachable: false, usesHttps: origin.startsWith("https:") };
  }

  // HTTP -> HTTPS redirect check (only if the origin is https).
  if (origin.startsWith("https:")) {
    try {
      const viaHttp = await fetcher(httpOrigin, { maxBytes: 4096 });
      if (!viaHttp.redirectedToHttps && viaHttp.status === 200) {
        findings.push({
          id: "site.no-https-redirect",
          severity: "medium",
          title: pick({ en: "HTTP is not redirected to HTTPS", cs: "HTTP se nepřesměrovává na HTTPS" }, locale),
          explanation: pick(
            {
              en: "The site is served over plain HTTP as well, so a visitor may stay on an unencrypted connection where traffic can be read and altered.",
              cs: "Web běží i přes nešifrované HTTP, takže návštěvník může zůstat na nešifrovaném spojení, kde lze provoz číst a měnit.",
            },
            locale,
          ),
          fix: pick({ en: "Redirect all HTTP requests to HTTPS (301) and then add HSTS.", cs: "Přesměrujte všechny HTTP požadavky na HTTPS (301) a pak přidejte HSTS." }, locale),
        });
      }
    } catch {
      // HTTP not reachable at all is fine.
    }
  }

  // Security headers
  for (const h of HEADER_CHECKS) {
    if (!home.headers.get(h.header)) {
      findings.push({ id: h.id, severity: h.severity, title: pick(h.title, locale), explanation: pick(h.explanation, locale), fix: pick(h.fix, locale) });
    }
  }

  findings.push(...cookieFindings(home, locale), ...infoDisclosure(home, locale));

  // Sensitive path probes (bounded concurrency)
  const probes = await mapLimit(SENSITIVE_PATHS, 4, async (p) => {
    try {
      const res = await fetcher(origin + p.path, { maxBytes: 16 * 1024 });
      if (res.status !== 200) return null;
      if (p.mustContain) return p.mustContain.test(res.body) ? p : null;
      // No specific signature: only a hit if it is not just an HTML page (SPAs/soft-404s return 200 HTML).
      return /<!doctype html|<html[\s>]/i.test(res.body) || res.body.trim() === "" ? null : p;
    } catch {
      return null;
    }
  });
  for (const p of probes) {
    if (!p) continue;
    findings.push({
      id: p.id,
      severity: p.severity,
      title: pick(p.title, locale),
      explanation: pick(
        {
          en: `The path ${p.path} is publicly reachable and returns sensitive content. Anyone on the internet can open it.`,
          cs: `Cesta ${p.path} je veřejně dostupná a vrací citlivý obsah. Může ji otevřít kdokoli z internetu.`,
        },
        locale,
      ),
      fix: pick(EXPOSED_FIX, locale),
      evidence: `GET ${p.path} → 200`,
    });
  }

  return { findings, reachable: true, usesHttps: origin.startsWith("https:") };
}

const DEDUCTION: Record<Severity, number> = { critical: 25, high: 15, medium: 5, low: 2 };

export function scoreSite(findings: SiteFinding[]): { score: number; grade: "A" | "B" | "C" | "D" | "F" } {
  const lost = findings.reduce((s, f) => s + DEDUCTION[f.severity], 0);
  const score = Math.max(0, 100 - lost);
  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";
  return { score, grade };
}
