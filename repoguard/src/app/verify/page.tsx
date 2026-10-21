import Link from "next/link";
import { getLocale } from "@/lib/i18n/server";
import { VerifyForm } from "@/components/VerifyForm";

export const metadata = { title: "Verify report – RepoGuard" };

export default async function VerifyPage() {
  const locale = await getLocale();
  const cs = locale === "cs";
  const tr = {
    back: cs ? "← RepoGuard" : "← RepoGuard",
    title: cs ? "Ověření bezpečnostního reportu" : "Verify a security report",
    intro: cs
      ? "Dostali jste report z RepoGuardu a chcete si ověřit, že je pravý a nezměněný? Vložte sem jeho obsah (soubor .json z exportu). Ověření proběhne porovnáním kryptografického podpisu – nepotřebujete přihlášení ani přístup k repozitáři."
      : "Received a RepoGuard report and want to confirm it is genuine and unmodified? Paste its content here (the .json export file). Verification compares the cryptographic signature — no login or repository access needed.",
    note: cs
      ? "Podpis dokazuje, že report vytvořila tato instance RepoGuardu pro konkrétní commit a od té doby se nezměnil. Nedokazuje sám o sobě, že web je zranitelný – k tomu slouží u každého nálezu odkaz na přesný řádek kódu."
      : "The signature proves this RepoGuard instance produced the report for a specific commit and it has not changed since. It does not by itself prove the site is vulnerable — the per-finding link to the exact code line does that.",
    placeholder: cs ? 'Vložte obsah JSON reportu (začíná { "repository": ... )' : 'Paste the JSON report (starts with { "repository": ... )',
    button: cs ? "Ověřit podpis" : "Verify signature",
    verifying: cs ? "Ověřuji…" : "Verifying…",
    okTitle: cs ? "✓ Podpis souhlasí – report je pravý a nezměněný." : "✓ Signature valid — the report is genuine and unmodified.",
    repository: cs ? "Repozitář" : "Repository",
    commit: "Commit",
    count: cs ? "Počet nálezů" : "Finding count",
    signedAt: cs ? "Podepsáno" : "Signed at",
  };
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          {tr.back}
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{tr.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{tr.intro}</p>
      </div>
      <VerifyForm locale={locale} tr={tr} />
      <p className="text-xs text-slate-400">{tr.note}</p>
    </div>
  );
}
