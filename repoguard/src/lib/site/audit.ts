import type { Severity } from "../severity";
import type { Locale } from "../i18n/locale";
import { mapLimit } from "../concurrency";
import { type SiteFetch, type SiteResponse, type CertProvider, type CertInfo } from "./fetch";

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
  { path: "/.git/config", id: "site.exposed.gitconfig", severity: "high", title: { en: "Exposed .git/config", cs: "Vystavený .git/config" }, mustContain: /\[core\]|\[remote/ },
  { path: "/.env.local", id: "site.exposed.envlocal", severity: "critical", title: { en: "Exposed .env.local file", cs: "Vystavený soubor .env.local" }, mustContain: /[A-Z0-9_]+=/ },
  { path: "/adminer.php", id: "site.exposed.adminer", severity: "high", title: { en: "Adminer database tool exposed", cs: "Vystavený nástroj Adminer" }, mustContain: /Adminer|Login - Adminer/i },
  { path: "/backup.zip", id: "site.exposed.backup", severity: "high", title: { en: "Exposed backup archive", cs: "Vystavený zálohový archiv" }, mustContain: /PK\x03\x04|PK/ },
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


function headerQualityFindings(home: SiteResponse, locale: Locale): SiteFinding[] {
  const out: SiteFinding[] = [];
  const csp = home.headers.get("content-security-policy");
  if (csp && /unsafe-inline|unsafe-eval/i.test(csp)) {
    out.push({
      id: "site.csp.weak",
      severity: "low",
      title: pick({ en: "Weak Content-Security-Policy (unsafe-inline/eval)", cs: "Slabá Content-Security-Policy (unsafe-inline/eval)" }, locale),
      explanation: pick(
        { en: "The CSP allows 'unsafe-inline' or 'unsafe-eval', which lets injected inline scripts run — so the policy no longer blocks most XSS.", cs: "CSP povoluje 'unsafe-inline' nebo 'unsafe-eval', takže vložené inline skripty poběží – politika pak většinu XSS nezastaví." },
        locale,
      ),
      fix: pick({ en: "Remove unsafe-inline/unsafe-eval; use nonces or hashes for the scripts you need.", cs: "Odstraňte unsafe-inline/unsafe-eval; pro potřebné skripty použijte nonce nebo hash." }, locale),
    });
  }
  const hsts = home.headers.get("strict-transport-security");
  const maxAge = hsts?.match(/max-age=(\d+)/i)?.[1];
  if (hsts && maxAge && Number(maxAge) < 15_552_000) {
    out.push({
      id: "site.hsts.short",
      severity: "low",
      title: pick({ en: "HSTS max-age is too short", cs: "HSTS max-age je příliš krátký" }, locale),
      explanation: pick(
        { en: "A short HSTS max-age means browsers soon forget to force HTTPS, reopening the downgrade window.", cs: "Krátký HSTS max-age znamená, že prohlížeče brzy zapomenou vynucovat HTTPS a okno pro downgrade se znovu otevře." },
        locale,
      ),
      fix: pick({ en: "Use max-age of at least 15552000 (180 days), ideally 31536000 with includeSubDomains.", cs: "Použijte max-age alespoň 15552000 (180 dní), ideálně 31536000 s includeSubDomains." }, locale),
      evidence: `max-age=${maxAge}`,
    });
  }
  const acao = home.headers.get("access-control-allow-origin");
  const acac = home.headers.get("access-control-allow-credentials");
  if (acao === "*" && /true/i.test(acac ?? "")) {
    out.push({
      id: "site.cors.wildcard",
      severity: "medium",
      title: pick({ en: "CORS allows any origin with credentials", cs: "CORS povoluje libovolný původ s přihlášením" }, locale),
      explanation: pick(
        { en: "Access-Control-Allow-Origin: * together with credentials lets any site read authenticated responses on behalf of your users.", cs: "Access-Control-Allow-Origin: * spolu s přihlašovacími údaji umožní libovolnému webu číst autentizované odpovědi jménem vašich uživatelů." },
        locale,
      ),
      fix: pick({ en: "Reflect only specific allowed origins instead of '*' when credentials are used.", cs: "Při použití přihlašování vracejte jen konkrétní povolené původy místo '*'." }, locale),
    });
  }
  return out;
}

function mixedContentFindings(origin: string, home: SiteResponse, locale: Locale): SiteFinding[] {
  if (!origin.startsWith("https:")) return [];
  const matches = [...home.body.matchAll(/\b(?:src|href)\s*=\s*["'](http:\/\/[^"']+)/gi)].map((m) => m[1]);
  const external = matches.filter((u) => !/\.(css)(\?|$)/i.test(u)); // keep it simple; any http resource counts
  if (external.length === 0) return [];
  return [
    {
      id: "site.mixed-content",
      severity: "medium",
      title: pick({ en: "Mixed content (HTTP resources on an HTTPS page)", cs: "Mixed content (HTTP zdroje na HTTPS stránce)" }, locale),
      explanation: pick(
        { en: "The HTTPS page loads resources over plain HTTP. Browsers may block them, and an attacker on the network can tamper with those requests.", cs: "HTTPS stránka načítá zdroje přes nešifrované HTTP. Prohlížeče je mohou blokovat a útočník v síti je může měnit." },
        locale,
      ),
      fix: pick({ en: "Load all resources over https:// (or protocol-relative), and add CSP: upgrade-insecure-requests.", cs: "Načítejte všechny zdroje přes https:// (nebo protokolově relativně) a přidejte CSP: upgrade-insecure-requests." }, locale),
      evidence: external.slice(0, 3).join(", "),
    },
  ];
}

function certFindings(host: string, cert: CertInfo | null, locale: Locale): SiteFinding[] {
  if (!cert) return [];
  const out: SiteFinding[] = [];
  if (cert.daysRemaining < 0) {
    out.push({
      id: "site.tls.expired",
      severity: "high",
      title: pick({ en: "TLS certificate has expired", cs: "TLS certifikát vypršel" }, locale),
      explanation: pick({ en: "The certificate is no longer valid, so visitors get a security warning and may not reach the site.", cs: "Certifikát už není platný, návštěvníci dostanou bezpečnostní varování a na web se nemusí dostat." }, locale),
      fix: pick({ en: "Renew the certificate now (e.g. Let's Encrypt auto-renewal).", cs: "Certifikát ihned obnovte (např. automatická obnova Let's Encrypt)." }, locale),
      evidence: `valid to ${cert.validTo.toISOString().slice(0, 10)}`,
    });
  } else if (cert.daysRemaining <= 14) {
    out.push({
      id: "site.tls.expiring",
      severity: "medium",
      title: pick({ en: `TLS certificate expires in ${cert.daysRemaining} days`, cs: `TLS certifikát vyprší za ${cert.daysRemaining} dní` }, locale),
      explanation: pick({ en: "The certificate expires soon; if renewal fails the site will show a security warning.", cs: "Certifikát brzy vyprší; pokud obnova selže, web bude hlásit bezpečnostní varování." }, locale),
      fix: pick({ en: "Make sure automatic renewal is set up and working.", cs: "Ověřte, že automatická obnova funguje." }, locale),
      evidence: `valid to ${cert.validTo.toISOString().slice(0, 10)}`,
    });
  }
  if (cert.selfSigned) {
    out.push({
      id: "site.tls.self-signed",
      severity: "high",
      title: pick({ en: "Self-signed or untrusted TLS certificate", cs: "Self-signed nebo nedůvěryhodný TLS certifikát" }, locale),
      explanation: pick({ en: "The certificate is not signed by a trusted authority, so browsers warn visitors and the encryption cannot be trusted against impersonation.", cs: "Certifikát není podepsaný důvěryhodnou autoritou, prohlížeče proto varují a šifrování nechrání proti podvržení serveru." }, locale),
      fix: pick({ en: "Use a certificate from a trusted CA (Let's Encrypt is free and automatic).", cs: "Použijte certifikát od důvěryhodné CA (Let's Encrypt je zdarma a automatický)." }, locale),
    });
  }
  if (cert.protocol && /^(TLSv1(\.0)?|TLSv1\.1|SSLv3|SSLv2)$/.test(cert.protocol)) {
    out.push({
      id: "site.tls.old-protocol",
      severity: "medium",
      title: pick({ en: `Outdated TLS protocol (${cert.protocol})`, cs: `Zastaralý TLS protokol (${cert.protocol})` }, locale),
      explanation: pick(
        { en: "The server negotiated an old TLS version (1.1 or older) that has known weaknesses and is deprecated by browsers.", cs: "Server se dohodl na staré verzi TLS (1.1 nebo starší), která má známé slabiny a prohlížeče ji už odmítají." },
        locale,
      ),
      fix: pick({ en: "Enable only TLS 1.2 and 1.3 on the server and disable TLS 1.0/1.1.", cs: "Na serveru povolte jen TLS 1.2 a 1.3 a vypněte TLS 1.0/1.1." }, locale),
      evidence: cert.protocol,
    });
  }
  if (cert.cipher && /\bRC4\b|3DES|DES-CBC|NULL|EXPORT|MD5|_CBC_SHA$|-SHA$/i.test(cert.cipher)) {
    out.push({
      id: "site.tls.weak-cipher",
      severity: "medium",
      title: pick({ en: "Weak TLS cipher suite", cs: "Slabá TLS šifra" }, locale),
      explanation: pick(
        { en: "The connection uses a cipher (RC4, 3DES, CBC-SHA, export or MD5-based) with known weaknesses, so the encryption is not strong.", cs: "Spojení používá šifru (RC4, 3DES, CBC-SHA, export nebo MD5) se známými slabinami, takže šifrování není silné." },
        locale,
      ),
      fix: pick({ en: "Configure the server to prefer modern AEAD ciphers (AES-GCM, ChaCha20-Poly1305) and drop legacy ones.", cs: "Nastavte server tak, aby preferoval moderní AEAD šifry (AES-GCM, ChaCha20-Poly1305) a odstranil staré." }, locale),
      evidence: cert.cipher,
    });
  } else if (cert.cipher && cert.protocol !== "TLSv1.3" && !/^ECDHE|^DHE|_AES_\d+_GCM/i.test(cert.cipher)) {
    out.push({
      id: "site.tls.no-pfs",
      severity: "low",
      title: pick({ en: "No forward secrecy in the TLS cipher", cs: "Šifra TLS nemá dopřednou utajenost" }, locale),
      explanation: pick(
        { en: "The cipher does not use ephemeral key exchange (ECDHE/DHE), so if the server key leaks later, past recorded traffic could be decrypted.", cs: "Šifra nepoužívá dočasnou výměnu klíčů (ECDHE/DHE), takže při pozdějším úniku klíče serveru by šel dešifrovat dříve zaznamenaný provoz." },
        locale,
      ),
      fix: pick({ en: "Prefer ECDHE cipher suites (forward secrecy).", cs: "Preferujte šifry ECDHE (dopředná utajenost)." }, locale),
      evidence: cert.cipher,
    });
  }
  if (!cert.hostnameMatches && cert.subjectCN) {
    out.push({
      id: "site.tls.hostname",
      severity: "medium",
      title: pick({ en: "TLS certificate does not match the hostname", cs: "TLS certifikát neodpovídá názvu domény" }, locale),
      explanation: pick({ en: "The certificate is not issued for this hostname, so browsers warn and the connection may be trivially intercepted.", cs: "Certifikát není vystavený pro tuto doménu, prohlížeče proto varují a spojení lze snadno odposlechnout." }, locale),
      fix: pick({ en: "Issue a certificate that covers this hostname (or add it to the SAN list).", cs: "Vystavte certifikát pokrývající tuto doménu (nebo ji přidejte do SAN)." }, locale),
      evidence: `CN=${cert.subjectCN}`,
    });
  }
  return out;
}

export interface SiteAuditResult {
  findings: SiteFinding[];
  reachable: boolean;
  usesHttps: boolean;
}

/** Runs the passive audit against a verified origin. `fetcher` is injectable for testing. */
export async function auditSite(origin: string, fetcher: SiteFetch, locale: Locale = "en", certProvider?: CertProvider): Promise<SiteAuditResult> {
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

  findings.push(...cookieFindings(home, locale), ...infoDisclosure(home, locale), ...headerQualityFindings(home, locale), ...mixedContentFindings(origin, home, locale));

  // TLS certificate (passive handshake)
  if (origin.startsWith("https:") && certProvider) {
    try {
      const host = new URL(origin).hostname;
      findings.push(...certFindings(host, await certProvider(host), locale));
    } catch {
      // ignore cert errors
    }
  }

  // security.txt recommendation (absence only)
  try {
    const sec = await fetcher(origin + "/.well-known/security.txt", { maxBytes: 4096 });
    if (sec.status !== 200 || !/contact/i.test(sec.body)) {
      findings.push({
        id: "site.no-security-txt",
        severity: "low",
        title: pick({ en: "Missing security.txt", cs: "Chybí security.txt" }, locale),
        explanation: pick(
          { en: "There is no /.well-known/security.txt, so a researcher who finds a vulnerability has no clear way to report it to you.", cs: "Chybí /.well-known/security.txt, takže ten, kdo najde zranitelnost, nemá jak vám ji bezpečně nahlásit." },
          locale,
        ),
        fix: pick({ en: "Publish /.well-known/security.txt with a Contact: line (see securitytxt.org).", cs: "Zveřejněte /.well-known/security.txt s řádkem Contact: (viz securitytxt.org)." }, locale),
      });
    }
  } catch {
    // network issue: skip
  }

  // Directory listing on common upload dirs
  for (const dir of ["/wp-content/uploads/", "/uploads/", "/files/"]) {
    try {
      const res = await fetcher(origin + dir, { maxBytes: 16 * 1024 });
      if (res.status === 200 && /<title>\s*Index of|<h1>\s*Index of/i.test(res.body)) {
        findings.push({
          id: "site.dir-listing",
          severity: "medium",
          title: pick({ en: "Directory listing is enabled", cs: "Je zapnutý výpis obsahu adresáře" }, locale),
          explanation: pick(
            { en: `The directory ${dir} shows a listing of all its files, so anyone can browse uploads, backups or logs stored there.`, cs: `Adresář ${dir} ukazuje výpis všech souborů, takže kdokoli může procházet nahrané soubory, zálohy nebo logy.` },
            locale,
          ),
          fix: pick({ en: "Turn off directory listing (Apache: Options -Indexes; Nginx: autoindex off).", cs: "Vypněte výpis adresářů (Apache: Options -Indexes; Nginx: autoindex off)." }, locale),
          evidence: `GET ${dir} → Index of`,
        });
        break;
      }
    } catch {
      // skip
    }
  }

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
