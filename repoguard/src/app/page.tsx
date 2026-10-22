import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/messages";
import { SignInButton } from "@/components/AuthButtons";
import { Logo } from "@/components/Logo";

const ERRORS: Record<string, { en: string; cs: string }> = {
  AccessDenied: { en: "This GitHub account does not have access to RepoGuard.", cs: "Tento GitHub účet nemá do RepoGuardu přístup." },
  OAuthCallback: { en: "Sign-in with GitHub failed. Please try again.", cs: "Přihlášení přes GitHub se nezdařilo. Zkuste to prosím znovu." },
};

const FEATURES: { en: [string, string]; cs: [string, string] }[] = [
  {
    en: ["Code analysis", "SQL injection, XSS, missing authorisation, insecure uploads, stored passwords and dangerous functions — with an explanation and a suggested fix."],
    cs: ["Analýza kódu", "SQL injection, XSS, chybějící kontrola oprávnění, nahrávání souborů, uložená hesla a nebezpečné funkce – s vysvětlením a návrhem opravy."],
  },
  {
    en: ["Compromise detection", "Finds out whether your site is already hacked: webshells, backdoors, obfuscated code and PHP files in the uploads directory — with cleanup guidance."],
    cs: ["Detekce napadení", "Pozná, jestli váš web už není napadený: webshelly, zadní vrátka, obfuskovaný kód a PHP soubory v adresáři uploads – s postupem, jak web vyčistit."],
  },
  {
    en: ["Web hardening", "Exposed backups and database dumps, dangerous .htaccess directives, debug logs, tools like Adminer, and clearly outdated WordPress plugins or core."],
    cs: ["Zabezpečení webu", "Vystavené zálohy a databázové exporty, nebezpečné .htaccess direktivy, ladicí logy, nástroje typu Adminer a zjevně zastaralé pluginy či jádro WordPressu."],
  },
  {
    en: ["Live website audit", "For domains you own (ownership verified): security headers, HTTPS, cookie flags and publicly exposed files on a live site. Passive and SSRF-safe — no attacks."],
    cs: ["Audit živého webu", "Pro domény, které vlastníte (po ověření): bezpečnostní hlavičky, HTTPS, cookies a veřejně vystavené soubory na živém webu. Pasivní a bezpečné – žádné útoky."],
  },
  {
    en: ["CVE monitoring", "Checks composer, npm and Python dependencies against the OSV.dev database, including CVSS score and the fixed version."],
    cs: ["Hlídání CVE", "Kontrola composer, npm a Python závislostí proti databázi OSV.dev včetně skóre CVSS a opravené verze."],
  },
  {
    en: ["AI agents & CI", "Audit of CLAUDE.md, .claude/, MCP servers, Cursor rules and GitHub Actions: hidden instructions (prompt injection), dangerous permissions, hooks, unpinned packages."],
    cs: ["AI agenti a CI", "Audit CLAUDE.md, .claude/, MCP serverů, pravidel Cursoru a GitHub Actions: skryté pokyny (prompt injection), nebezpečná oprávnění, hooky, nepřipnuté balíčky."],
  },
  {
    en: ["A–F score & triage", "A security score per area, marking false positives, a history of new and resolved findings, and export to PDF, SARIF, JSON and Markdown."],
    cs: ["Skóre A–F a triáž", "Bezpečnostní skóre po oblastech, označení falešných poplachů, historie nových a vyřešených nálezů, export do PDF, SARIF, JSON a Markdownu."],
  },
  {
    en: ["Prove it to an admin", "A signed report the admin verifies at /verify, an annotation patch that adds warnings to the code as a pull request, and SARIF for GitHub Security."],
    cs: ["Doložte to adminovi", "Podepsaný report, který admin ověří na /verify, anotační patch, který přidá upozornění do kódu jako pull request, a SARIF pro GitHub Security."],
  },
  {
    en: ["Optional AI review", "Claude reviews a specific finding in the context of the code and proposes a fix. Defensive only — no attack code. Secrets are masked before sending."],
    cs: ["Volitelné AI posouzení", "Claude posoudí konkrétní nález v kontextu kódu a navrhne opravu. Jen obrana – žádný útočný kód. Tajné klíče se před odesláním maskují."],
  },
  {
    en: ["Only your repositories", "Only repositories you own or were granted access to can be scanned. The code is never stored."],
    cs: ["Jen vaše repozitáře", "Skenovat lze pouze repozitáře, které vlastníte nebo k nimž máte udělený přístup. Kód se nikam neukládá."],
  },
];

export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const [{ error }, locale] = await Promise.all([searchParams, getLocale()]);

  return (
    <div className="mx-auto max-w-2xl py-12 text-center">
      <Logo className="mx-auto h-14 w-14 text-emerald-600" />
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{t("home.heading", locale)}</h1>
      <p className="mt-4 text-lg text-slate-600">{t("home.intro", locale)}</p>
      {error && (
        <p className="mx-auto mt-6 max-w-md rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {(ERRORS[error] ?? ERRORS.OAuthCallback)[locale]}
        </p>
      )}
      <div className="mt-8">
        <SignInButton label={t("auth.signIn", locale)} />
      </div>
      <ul className="mt-12 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const [title, text] = f[locale];
          return (
            <li key={title} className="card p-4">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
