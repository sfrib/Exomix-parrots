import type { Finding } from "@/generated/prisma/client";
import { categoryOf } from "./score";

/**
 * Evidence and verification guidance. The core static findings are deterministic
 * matches on the user's own code (a regex or parser hit at a file:line), not AI
 * output. This module explains, per finding, how RepoGuard found it and how the
 * owner can confirm it themselves with safe, non-exploit steps.
 */

/** How the finding was produced — shown so the user can trust it is not an AI guess. */
export function howItWasFound(f: Finding): string {
  if (f.kind === "dependency") {
    return `RepoGuard přečetl verzi balíčku ${f.packageName} (${f.installedVersion}) ze souboru ${f.file} a dotázal se veřejné databáze zranitelností OSV.dev. Shoda je na záznamu ${f.advisoryId}${f.aliases ? ` (${f.aliases})` : ""}.`;
  }
  if (f.kind === "repo") {
    return "Toto je nastavení na straně GitHubu / v souborech repozitáře, které RepoGuard zjistil přes GitHub API nebo z obsahu repozitáře. Není to odhad AI.";
  }
  const cat = categoryOf(f);
  const where = f.file ? `v souboru ${f.file}${f.line ? ` na řádku ${f.line}` : ""}` : "v repozitáři";
  if (cat === "web" && !f.line) {
    return `RepoGuard našel ${where} soubor nebo nastavení, které podle pravidla „${f.ruleId}“ nemá být veřejně v repozitáři/na webu. Jde o shodu na cestě k souboru, ne o odhad AI.`;
  }
  return `RepoGuard našel ${where} shodu bezpečnostního pravidla „${f.ruleId}“ (deterministický vzor nad vaším kódem, ne odhad AI). Níže je přesný řádek, kterého se to týká.`;
}

/** Safe, non-exploit steps the owner can follow to confirm the finding is real. */
export function verificationSteps(f: Finding): string[] {
  if (f.kind === "dependency") {
    const cmd =
      f.ecosystem === "Packagist"
        ? `composer show ${f.packageName}`
        : f.ecosystem === "PyPI"
          ? `pip show ${f.packageName}`
          : `npm ls ${f.packageName}`;
    return [
      `Ověřte nainstalovanou verzi: spusťte v projektu \`${cmd}\` a porovnejte s verzí ${f.installedVersion}.`,
      `Otevřete detail zranitelnosti na odkazu níže a přečtěte si, které verze jsou zasažené a od které je oprava (${f.fixedVersion ?? "zatím bez opravy"}).`,
    ];
  }
  if (f.kind === "repo") {
    return [
      "Otevřete nastavení repozitáře na GitHubu (Settings → Code security / Branches) a zkontrolujte, zda daná ochrana opravdu chybí.",
    ];
  }
  const cat = categoryOf(f);
  const openLine = f.file ? `Otevřete odkaz „${f.file}${f.line ? `:${f.line}` : ""}" níže – vede přímo na ten řádek na GitHubu (otevře se i v mobilu). Potvrďte, že tam kód skutečně je.` : "";
  switch (cat) {
    case "malware":
      return [
        openLine,
        "Pokud kód na tom řádku nepoznáváte a nepatří k žádnému pluginu ani šabloně, kterou jste vědomě nainstalovali, je to velmi podezřelé.",
        f.ruleId === "malware.php-in-uploads"
          ? "Zkuste, zda soubor existuje i na živém webu: v prohlížeči otevřete adresu domény + cesta k souboru. Pokud se načte, je to vážné – odstraňte ho."
          : "Porovnejte soubor s čistou kopií pluginu/šablony z oficiálního zdroje (např. WordPress.org). Rozdíl = pravděpodobně vložený škodlivý kód.",
      ].filter(Boolean);
    case "secrets":
      return [
        openLine,
        "Potvrďte, že na řádku je reálná hodnota (ne zástupný text jako changeme nebo example). Pokud ano, klíč je uniklý.",
        "Ověřte, zda je v historii: v projektu spusťte `git log -p -- " + (f.file ?? "<soubor>") + "`. I po smazání zůstává v historii, proto je nutné klíč změnit.",
      ].filter(Boolean);
    case "web":
      return [
        openLine || `Soubor ${f.file} je v repozitáři.`,
        "Zkuste, zda je dostupný i na živém webu: v prohlížeči otevřete adresu domény + cesta k souboru. Pokud se stáhne nebo zobrazí, je veřejně přístupný.",
      ];
    case "agent":
      return [
        openLine,
        "Zkontrolujte danou volbu v konfiguračním souboru. Je to nastavení, které jste tam chtěli mít?",
      ].filter(Boolean);
    default:
      return [
        openLine,
        "Přečtěte si, odkud se na ten řádek dostává hodnota od uživatele (parametr, formulář) a zda je před použitím ošetřená. Pokud ne, nález platí.",
      ].filter(Boolean);
  }
}
