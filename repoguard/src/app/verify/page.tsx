import Link from "next/link";
import { VerifyForm } from "@/components/VerifyForm";

export const metadata = { title: "Ověření reportu – RepoGuard" };

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← RepoGuard
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Ověření bezpečnostního reportu</h1>
        <p className="mt-2 text-sm text-slate-600">
          Dostali jste report z RepoGuardu a chcete si ověřit, že je pravý a nezměněný? Vložte sem jeho obsah (soubor .json z exportu).
          Ověření proběhne porovnáním kryptografického podpisu – nepotřebujete přihlášení ani přístup k repozitáři.
        </p>
      </div>
      <VerifyForm />
      <p className="text-xs text-slate-400">
        Podpis dokazuje, že report vytvořila tato instance RepoGuardu pro konkrétní commit a od té doby se nezměnil. Nedokazuje sám o sobě,
        že web je zranitelný – k tomu slouží u každého nálezu odkaz na přesný řádek kódu.
      </p>
    </div>
  );
}
