import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { SignInButton } from "@/components/AuthButtons";
import { Logo } from "@/components/Logo";

const ERRORS: Record<string, string> = {
  AccessDenied: "Tento GitHub účet nemá do RepoGuardu přístup.",
  OAuthCallback: "Přihlášení přes GitHub se nezdařilo. Zkuste to prosím znovu.",
};

export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl py-12 text-center">
      <Logo className="mx-auto h-14 w-14 text-emerald-600" />
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Bezpečnostní kontrola vašich repozitářů</h1>
      <p className="mt-4 text-lg text-slate-600">
        RepoGuard projde kód vašich PHP, WordPress a JavaScript projektů, upozorní na slabá místa a zkontroluje, zda
        používané knihovny nemají známé zranitelnosti (CVE).
      </p>
      {error && <p className="mx-auto mt-6 max-w-md rounded-lg bg-red-50 p-3 text-sm text-red-800">{ERRORS[error] ?? "Přihlášení se nezdařilo."}</p>}
      <div className="mt-8">
        <SignInButton />
      </div>
      <ul className="mt-12 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Analýza kódu", "SQL injection, XSS, chybějící kontrola oprávnění, nahrávání souborů, uložená hesla a nebezpečné funkce – s vysvětlením a návrhem opravy."],
          ["Hlídání CVE", "Kontrola composer, npm a Python závislostí proti databázi OSV.dev včetně skóre CVSS a opravené verze."],
          ["Detekce napadení", "Pozná, jestli váš web už není napadený: webshelly, zadní vrátka, obfuskovaný kód a PHP soubory v adresáři uploads – s postupem, jak web vyčistit."],
          ["Zabezpečení webu", "Vystavené zálohy a databázové exporty, nebezpečné .htaccess direktivy, ladicí logy, nástroje typu Adminer a zjevně zastaralé pluginy či jádro WordPressu."],
          ["AI agenti a CI", "Audit CLAUDE.md, .claude/, MCP serverů, pravidel Cursoru a GitHub Actions: skryté pokyny (prompt injection), nebezpečná oprávnění, hooky, nepřipnuté balíčky."],
          ["Skóre A–F a triáž", "Bezpečnostní skóre po oblastech, označení falešných poplachů, historie nových a vyřešených nálezů, export do PDF, SARIF, JSON a Markdownu."],
          ["Volitelné AI posouzení", "Claude posoudí konkrétní nález v kontextu kódu a navrhne opravu. Jen obrana – žádný útočný kód. Tajné klíče se před odesláním maskují."],
          ["Jen vaše repozitáře", "Skenovat lze pouze repozitáře, které vlastníte nebo k nimž máte udělený přístup. Kód se nikam neukládá."],
        ].map(([title, text]) => (
          <li key={title} className="card p-4">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
