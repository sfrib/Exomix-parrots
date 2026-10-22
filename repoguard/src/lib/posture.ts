import type { Severity } from "./severity";
import type { GitHubRepo } from "./github";

/** Repository-level security settings and hygiene ("posture") checks. */

export interface PostureInput {
  repo: GitHubRepo;
  /** Paths and contents of posture files (.gitignore, SECURITY.md, dependabot config). */
  files: { path: string; content: string }[];
  /** true / false when known, null when the token cannot see it (needs admin). */
  dependabotAlerts: boolean | null;
  branchProtected: boolean | null;
  /** True when the repo contains code or manifests that may hold secrets in .env files. */
  usesEnvFiles: boolean;
}

export interface PostureFinding {
  ruleId: string;
  title: string;
  severity: Severity;
  file: string | null;
  explanation: string;
  fix: string;
}

export function checkPosture(input: PostureInput): PostureFinding[] {
  const out: PostureFinding[] = [];
  const has = (re: RegExp) => input.files.some((f) => re.test(f.path));
  const sa = input.repo.security_and_analysis;

  if (input.dependabotAlerts === false) {
    out.push({
      ruleId: "repo.dependabot-alerts-off",
      title: "Dependabot upozornění jsou vypnutá",
      severity: "medium",
      file: null,
      explanation: "GitHub vás neupozorní, když se ve vašich závislostech objeví nová známá zranitelnost. RepoGuard kontroluje závislosti jen při skenu, GitHub průběžně.",
      fix: "V repozitáři otevřete Settings → Code security → Dependabot alerts a zapněte je (doporučeno i Dependabot security updates).",
    });
  }
  if (sa?.secret_scanning?.status === "disabled") {
    out.push({
      ruleId: "repo.secret-scanning-off",
      title: "Secret scanning je vypnutý",
      severity: "medium",
      file: null,
      explanation: "GitHub nehlídá, zda do repozitáře neunikly API klíče a hesla. U veřejných repozitářů navíc boti hledají uniklé klíče během minut.",
      fix: "Zapněte Settings → Code security → Secret scanning a Push protection, které zablokuje push obsahující klíč.",
    });
  } else if (sa?.secret_scanning_push_protection?.status === "disabled") {
    out.push({
      ruleId: "repo.push-protection-off",
      title: "Push protection pro tajné klíče je vypnutá",
      severity: "low",
      file: null,
      explanation: "Secret scanning klíče najde až po pushnutí. Push protection zabrání tomu, aby se klíč do repozitáře vůbec dostal.",
      fix: "Zapněte Settings → Code security → Push protection.",
    });
  }
  if (input.branchProtected === false) {
    out.push({
      ruleId: "repo.branch-unprotected",
      title: `Hlavní větev ${input.repo.default_branch} není chráněná`,
      severity: "low",
      file: null,
      explanation: "Do hlavní větve lze pushovat přímo, bez review a bez úspěšných testů – včetně force-push, který přepíše historii. Kompromitovaný účet nebo AI agent s právem push tak může změnit produkční kód bez kontroly.",
      fix: "Settings → Branches (nebo Rules) → přidejte pravidlo pro hlavní větev: vyžadovat pull request, úspěšné kontroly a zakázat force-push.",
    });
  }
  if (!has(/^(\.github\/|docs\/)?security\.md$/i)) {
    out.push({
      ruleId: "repo.no-security-policy",
      title: "Chybí bezpečnostní politika (SECURITY.md)",
      severity: "low",
      file: null,
      explanation: "Kdo najde ve vašem webu zranitelnost, neví, jak vám ji bezpečně nahlásit – může ji zveřejnit nebo ji zkusí zneužít.",
      fix: "Přidejte SECURITY.md s kontaktem (e-mail) a postupem nahlášení a zapněte Settings → Private vulnerability reporting.",
    });
  }
  if (!has(/^\.github\/(dependabot\.ya?ml|renovate\.json)$|^renovate\.json$/i)) {
    out.push({
      ruleId: "repo.no-dependency-updates",
      title: "Automatické aktualizace závislostí nejsou nastavené",
      severity: "low",
      file: null,
      explanation: "Bez Dependabotu nebo Renovate se opravy zranitelností v knihovnách instalují jen ručně a snadno se na ně zapomene.",
      fix: "Přidejte .github/dependabot.yml s ekosystémy, které používáte (composer, npm, github-actions) a týdenním intervalem.",
    });
  }
  if (input.usesEnvFiles) {
    const gitignore = input.files.find((f) => f.path === ".gitignore");
    if (!gitignore || !/^\s*\/?\.env(\*|\.\*|\b)/m.test(gitignore.content)) {
      out.push({
        ruleId: "repo.env-not-ignored",
        title: "Soubory .env nejsou v .gitignore",
        severity: "low",
        file: gitignore ? ".gitignore" : null,
        explanation: "Projekt pracuje s proměnnými prostředí, ale .gitignore neignoruje soubory .env. Stačí jeden neopatrný „git add .“ a hesla jsou v historii repozitáře.",
        fix: "Přidejte do .gitignore řádky .env a .env.* (a výjimku !.env.example).",
      });
    }
  }
  return out;
}
