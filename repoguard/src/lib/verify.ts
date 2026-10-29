import type { Finding } from "@/generated/prisma/client";
import { categoryOf } from "./score";
import type { Locale } from "./i18n/locale";

/**
 * Evidence and verification guidance. The core static findings are deterministic
 * matches on the user's own code (a regex or parser hit at a file:line), not AI
 * output. This module explains, per finding, how RepoGuard found it and how the
 * owner can confirm it with safe, non-exploit steps — in English or Czech.
 */

export function howItWasFound(f: Finding, locale: Locale): string {
  const cs = locale === "cs";
  if (f.kind === "dependency") {
    return cs
      ? `RepoGuard přečetl verzi balíčku ${f.packageName} (${f.installedVersion}) ze souboru ${f.file} a dotázal se veřejné databáze zranitelností OSV.dev. Shoda je na záznamu ${f.advisoryId}${f.aliases ? ` (${f.aliases})` : ""}.`
      : `RepoGuard read the version of ${f.packageName} (${f.installedVersion}) from ${f.file} and queried the public OSV.dev vulnerability database. It matched advisory ${f.advisoryId}${f.aliases ? ` (${f.aliases})` : ""}.`;
  }
  if (f.kind === "repo") {
    return cs
      ? "Toto je nastavení na straně GitHubu / v souborech repozitáře, které RepoGuard zjistil přes GitHub API nebo z obsahu repozitáře. Není to odhad AI."
      : "This is a GitHub-side setting / repository file that RepoGuard read via the GitHub API or from the repository content. It is not an AI guess.";
  }
  const cat = categoryOf(f);
  const where = f.file ? (cs ? `v souboru ${f.file}${f.line ? ` na řádku ${f.line}` : ""}` : `in ${f.file}${f.line ? ` at line ${f.line}` : ""}`) : cs ? "v repozitáři" : "in the repository";
  if (cat === "web" && !f.line) {
    return cs
      ? `RepoGuard našel ${where} soubor nebo nastavení, které podle pravidla „${f.ruleId}“ nemá být veřejně v repozitáři/na webu. Jde o shodu na cestě k souboru, ne o odhad AI.`
      : `RepoGuard found ${where} a file or setting that rule "${f.ruleId}" says should not be public in the repository/on the web. It is a match on the file path, not an AI guess.`;
  }
  return cs
    ? `RepoGuard našel ${where} shodu bezpečnostního pravidla „${f.ruleId}“ (deterministický vzor nad vaším kódem, ne odhad AI). Níže je přesný řádek, kterého se to týká.`
    : `RepoGuard found ${where} a match of security rule "${f.ruleId}" (a deterministic pattern over your code, not an AI guess). The exact line is shown below.`;
}

export function verificationSteps(f: Finding, locale: Locale): string[] {
  const cs = locale === "cs";
  if (f.kind === "dependency") {
    const cmd = f.ecosystem === "Packagist" ? `composer show ${f.packageName}` : f.ecosystem === "PyPI" ? `pip show ${f.packageName}` : `npm ls ${f.packageName}`;
    return cs
      ? [
          `Ověřte nainstalovanou verzi: spusťte v projektu \`${cmd}\` a porovnejte s verzí ${f.installedVersion}.`,
          `Otevřete detail zranitelnosti na odkazu níže a přečtěte si, které verze jsou zasažené a od které je oprava (${f.fixedVersion ?? "zatím bez opravy"}).`,
        ]
      : [
          `Confirm the installed version: run \`${cmd}\` in the project and compare with ${f.installedVersion}.`,
          `Open the advisory link below to see which versions are affected and the fixed version (${f.fixedVersion ?? "none yet"}).`,
        ];
  }
  if (f.kind === "repo") {
    return cs
      ? ["Otevřete nastavení repozitáře na GitHubu (Settings → Code security / Branches) a zkontrolujte, zda daná ochrana opravdu chybí."]
      : ["Open the repository settings on GitHub (Settings → Code security / Branches) and check whether the protection is really missing."];
  }
  const cat = categoryOf(f);
  const openLine = f.file
    ? cs
      ? `Otevřete odkaz „${f.file}${f.line ? `:${f.line}` : ""}" níže – vede přímo na ten řádek na GitHubu (otevře se i v mobilu). Potvrďte, že tam kód skutečně je.`
      : `Open the "${f.file}${f.line ? `:${f.line}` : ""}" link below — it goes straight to that line on GitHub (works on mobile). Confirm the code is really there.`
    : "";
  switch (cat) {
    case "malware":
      return [
        openLine,
        cs
          ? "Pokud kód na tom řádku nepoznáváte a nepatří k žádnému pluginu ani šabloně, kterou jste vědomě nainstalovali, je to velmi podezřelé."
          : "If you do not recognise the code on that line and it does not belong to a plugin or theme you deliberately installed, it is very suspicious.",
        f.ruleId === "malware.php-in-uploads"
          ? cs
            ? "Zkuste, zda soubor existuje i na živém webu: v prohlížeči otevřete adresu domény + cesta k souboru. Pokud se načte, je to vážné – odstraňte ho."
            : "Check whether the file exists on the live site: open the domain + the file path in a browser. If it loads, it is serious — remove it."
          : cs
            ? "Porovnejte soubor s čistou kopií pluginu/šablony z oficiálního zdroje (např. WordPress.org). Rozdíl = pravděpodobně vložený škodlivý kód."
            : "Compare the file with a clean copy of the plugin/theme from the official source (e.g. WordPress.org). A difference = likely injected malicious code.",
      ].filter(Boolean);
    case "secrets":
      return [
        openLine,
        cs
          ? "Potvrďte, že na řádku je reálná hodnota (ne zástupný text jako changeme nebo example). Pokud ano, klíč je uniklý."
          : "Confirm the line holds a real value (not a placeholder like changeme or example). If so, the key is leaked.",
        cs
          ? "Ověřte, zda je v historii: v projektu spusťte `git log -p -- " + (f.file ?? "<soubor>") + "`. I po smazání zůstává v historii, proto je nutné klíč změnit."
          : "Check history: run `git log -p -- " + (f.file ?? "<file>") + "` in the project. It stays in history after deletion, so the key must be rotated.",
      ].filter(Boolean);
    case "web":
      return [
        openLine || (cs ? `Soubor ${f.file} je v repozitáři.` : `The file ${f.file} is in the repository.`),
        cs
          ? "Zkuste, zda je dostupný i na živém webu: v prohlížeči otevřete adresu domény + cesta k souboru. Pokud se stáhne nebo zobrazí, je veřejně přístupný."
          : "Check whether it is reachable on the live site: open the domain + the file path in a browser. If it downloads or displays, it is publicly accessible.",
      ];
    case "agent":
      return [openLine, cs ? "Zkontrolujte danou volbu v konfiguračním souboru. Je to nastavení, které jste tam chtěli mít?" : "Review the option in the config file. Is it a setting you intended to have?"].filter(Boolean);
    default:
      return [
        openLine,
        cs
          ? "Přečtěte si, odkud se na ten řádek dostává hodnota od uživatele (parametr, formulář) a zda je před použitím ošetřená. Pokud ne, nález platí."
          : "Trace where user input reaches that line (a parameter, a form) and whether it is sanitised before use. If not, the finding holds.",
      ].filter(Boolean);
  }
}
