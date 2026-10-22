import type { Severity } from "../../severity";
import type { FileContext, Rule, RuleMatch } from "../types";

/**
 * Audit of AI coding-agent configuration committed to the repo (Claude Code, Cursor,
 * MCP servers, VS Code tasks) and agent instruction files. Inspired by AgentShield
 * from Everything Claude Code: the agent harness itself is an attack surface.
 */

/** Parses JSON/JSONC (comments and trailing commas allowed); returns null when invalid. */
export function parseJsonc(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    // fall through to JSONC handling
  }
  try {
    const noComments = text.replace(/("(?:[^"\\]|\\.)*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (m, str) => str ?? "");
    return JSON.parse(noComments.replace(/,(\s*[}\]])/g, "$1"));
  } catch {
    return null;
  }
}

/** 1-based line of the first raw line containing `needle` (falls back to 1). */
function lineOf(ctx: FileContext, needle: string): number {
  const idx = ctx.lines.findIndex((l) => l.includes(needle));
  return idx === -1 ? 1 : idx + 1;
}

function fileName(ctx: FileContext): string {
  return ctx.file.path.toLowerCase();
}

const isClaudeSettings = (ctx: FileContext) => /(^|\/)\.claude\/settings(\.local)?\.json$|(^|\/)\.claude\.json$/.test(fileName(ctx));
const isMcpConfig = (ctx: FileContext) => /(\.mcp\.json|mcp\.json|claude_desktop_config\.json|\.gemini\/settings\.json|\.claude\.json)$/.test(fileName(ctx));

function permissionLists(ctx: FileContext): { allow: string[]; deny: string[]; data: any } | null {
  if (!isClaudeSettings(ctx)) return null;
  const data = parseJsonc(ctx.file.content);
  if (!data || typeof data !== "object") return null;
  const perms = data.permissions ?? {};
  const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  return { allow: list(perms.allow), deny: list(perms.deny), data };
}

/** Collects every hook command string from Claude Code style settings. */
function hookCommands(data: any): { event: string; command: string }[] {
  const result: { event: string; command: string }[] = [];
  const hooks = data?.hooks;
  if (!hooks || typeof hooks !== "object") return result;
  for (const [event, entries] of Object.entries<any>(hooks)) {
    for (const entry of Array.isArray(entries) ? entries : []) {
      for (const h of Array.isArray(entry?.hooks) ? entry.hooks : [entry]) {
        if (typeof h?.command === "string") result.push({ event, command: h.command });
      }
    }
  }
  return result;
}

interface McpServer {
  name: string;
  command?: string;
  args: string[];
  env: Record<string, string>;
  url?: string;
  raw: any;
}

function mcpServers(ctx: FileContext): McpServer[] {
  if (!isMcpConfig(ctx) && !isClaudeSettings(ctx)) return [];
  const data = parseJsonc(ctx.file.content);
  const servers = data?.mcpServers ?? data?.servers ?? (fileName(ctx).endsWith(".vscode/mcp.json") ? data?.servers : undefined);
  if (!servers || typeof servers !== "object") return [];
  return Object.entries<any>(servers).map(([name, s]) => ({
    name,
    command: typeof s?.command === "string" ? s.command : undefined,
    args: Array.isArray(s?.args) ? s.args.map(String) : [],
    env: s?.env && typeof s.env === "object" ? s.env : {},
    url: typeof s?.url === "string" ? s.url : typeof s?.serverUrl === "string" ? s.serverUrl : undefined,
    raw: s,
  }));
}

const BROAD_PERMISSION = /^(Bash|Bash\(\*\)|Bash\(:\*\)|Bash\(\*:\*\)|Write|Write\(\*\)|Write\(\*\*\)|Edit|Edit\(\*\)|Edit\(\*\*\)|WebFetch|mcp__\w+__\*|\*)$/;
const DANGEROUS_ALLOW = /\b(rm\s+-rf|sudo|chmod\s+(-R\s+)?777|git\s+push\s+(-f|--force)|git\s+reset\s+--hard|curl|wget|ssh|scp|nc|dd\s+if=|mkfs|docker\s+run)\b/;

const REMOTE_EXEC = /\b(curl|wget|iwr|Invoke-WebRequest)\b[^|\n]*\|\s*(sudo\s+)?(ba|z|da)?sh\b|\|\s*iex\b|\bbash\s+<\(\s*curl|\beval\s+"?\$\(\s*curl/i;
const REVERSE_SHELL = /\/dev\/tcp\/|\bnc\b[^\n]*\s-e\s|\bmkfifo\b[^\n]*\bnc\b|socket\.socket\([^)]*\)[\s\S]{0,80}(connect|dup2)|\bsocat\b[^\n]*exec:/i;
const CREDENTIAL_ACCESS = /~\/\.ssh|\.ssh\/id_|~\/\.aws\/credentials|\.aws\/credentials|\/etc\/shadow|security\s+find-(generic|internet)-password|secret-tool\s+lookup|\.netrc|\.docker\/config\.json|gh\s+auth\s+token/i;
const EXFIL = /\b(curl|wget|http|Invoke-RestMethod)\b[^\n]*(-d\b|--data|-F\b|--upload-file|-X\s*POST|--post-data|POST)/i;
const ANTI_FORENSICS = /\bhistory\s+-c\b|journalctl\s+--vacuum|rm\s+(-rf?\s+)?[^\n]*\.(bash_|zsh_)?history|shred\b/;

export const agentRules: Rule[] = [
  {
    id: "agent.perm.bypass",
    title: "AI agent má vypnuté potvrzování akcí",
    cwe: "CWE-250",
    severity: "high",
    languages: ["agentjson", "agentmd"],
    check: (ctx) => {
      const lines: RuleMatch[] = [];
      ctx.lines.forEach((l, i) => {
        if (/"defaultMode"\s*:\s*"bypassPermissions"|dangerously-skip-permissions|"skipDangerousModePermissionPrompt"\s*:\s*true|"(alwaysAllow|autoApprove)"\s*:\s*true/.test(l)) {
          lines.push({ line: i + 1 });
        }
      });
      return lines;
    },
    explanation:
      "Konfigurace nechává AI agenta (např. Claude Code) provádět příkazy, zápisy do souborů a síťové požadavky bez potvrzení člověkem. Jediný škodlivý pokyn – třeba skrytý v README závislosti, issue nebo webové stránce, kterou agent čte (prompt injection) – pak může rovnou smazat data, odeslat tajné klíče nebo pushnout kód.",
    fix:
      "Nepoužívejte bypassPermissions / --dangerously-skip-permissions ve sdílené konfiguraci. Povolte jen konkrétní bezpečné příkazy (např. \"Bash(npm test)\", \"Bash(git status)\"), ostatní nechte na potvrzení. Pokud potřebujete autonomní běh, spouštějte agenta v izolovaném kontejneru bez přístupu k produkčním klíčům.",
  },
  {
    id: "agent.perm.wildcard",
    title: "Příliš široká oprávnění AI agenta",
    cwe: "CWE-732",
    severity: "high",
    languages: ["agentjson"],
    check: (ctx) => {
      const perms = permissionLists(ctx);
      if (!perms) return [];
      return perms.allow
        .filter((p) => BROAD_PERMISSION.test(p.trim()))
        .map((p) => ({ line: lineOf(ctx, `"${p}"`), severity: (/^Bash|^\*$/.test(p) ? "high" : "medium") as Severity }));
    },
    explanation:
      "V seznamu permissions.allow je neomezený přístup (např. \"Bash(*)\" nebo \"Write\"). Agent tak smí bez dotazu spustit jakýkoli příkaz nebo přepsat jakýkoli soubor, včetně .env nebo konfigurace serveru.",
    fix: "Nahraďte zástupné znaky konkrétními příkazy a cestami, např. \"Bash(npm run test:*)\", \"Edit(src/**)\". Vše ostatní ponechte v režimu potvrzení (ask).",
  },
  {
    id: "agent.perm.dangerous-allow",
    title: "AI agent smí bez potvrzení spouštět rizikové příkazy",
    cwe: "CWE-732",
    severity: "medium",
    languages: ["agentjson"],
    check: (ctx) => {
      const perms = permissionLists(ctx);
      if (!perms) return [];
      return perms.allow
        .filter((p) => /^Bash\(/.test(p) && DANGEROUS_ALLOW.test(p))
        .map((p) => ({ line: lineOf(ctx, `"${p}"`), severity: (/rm\s+-rf|sudo|push\s+(-f|--force)|reset\s+--hard/.test(p) ? "high" : "medium") as Severity }));
    },
    explanation:
      "Mezi automaticky povolenými příkazy jsou destruktivní nebo síťové operace (rm -rf, sudo, git push --force, curl, ssh…). Ty mohou nenávratně smazat data nebo vynést soubory mimo počítač.",
    fix: "Odstraňte tyto příkazy z permissions.allow a přidejte je do permissions.deny (nebo ask), např. \"Bash(rm -rf:*)\", \"Bash(git push --force:*)\", \"Bash(curl:*)\".",
  },
  {
    id: "agent.perm.no-deny-secrets",
    title: "Agent nemá zakázané čtení tajných souborů",
    cwe: "CWE-200",
    severity: "low",
    languages: ["agentjson"],
    check: (ctx) => {
      const perms = permissionLists(ctx);
      if (!perms || perms.allow.length === 0) return [];
      const protectsSecrets = perms.deny.some((d) => /\.env|secret|credential|\.pem|id_rsa|\.key/i.test(d));
      return protectsSecrets ? [] : [{ line: lineOf(ctx, '"permissions"') }];
    },
    explanation:
      "Konfigurace agentovi povoluje akce, ale nijak mu nebrání číst soubory s hesly a klíči (.env, *.pem, wp-config.php). Při prompt injection je obsah těchto souborů první, co útočník chce získat.",
    fix: "Doplňte permissions.deny, např. [\"Read(./.env)\", \"Read(./.env.*)\", \"Read(./**/*.pem)\", \"Read(./wp-config.php)\", \"Read(./secrets/**)\"].",
  },
  {
    id: "agent.settings.local-committed",
    title: "Osobní nastavení agenta je v repozitáři",
    cwe: "CWE-538",
    severity: "low",
    languages: ["agentjson"],
    check: (ctx) => (/(^|\/)\.claude\/settings\.local\.json$/.test(fileName(ctx)) ? [{ line: 1 }] : []),
    explanation:
      "Soubor .claude/settings.local.json je určený pro osobní lokální nastavení a obvykle obsahuje široká oprávnění nashromážděná při práci. Commitem se tato oprávnění přenesou na všechny, kdo repozitář naklonují.",
    fix: "Odeberte soubor z gitu (git rm --cached .claude/settings.local.json) a přidejte ho do .gitignore. Sdílená pravidla dávejte do .claude/settings.json.",
  },
  {
    id: "agent.hook.remote-exec",
    title: "Hook stahuje a spouští kód z internetu",
    cwe: "CWE-494",
    severity: "critical",
    languages: ["agentjson"],
    check: (ctx) => {
      const data = parseJsonc(ctx.file.content);
      return hookCommands(data)
        .filter((h) => REMOTE_EXEC.test(h.command))
        .map((h) => ({ line: lineOf(ctx, h.command.slice(0, 40)) }));
    },
    explanation:
      "Hook agenta (spouští se automaticky při jeho událostech) stáhne skript z internetu a rovnou ho spustí. Kdokoli, kdo ovládne danou adresu, tak může na počítači každého vývojáře spustit libovolný kód. Stejný vzor používaly nedávné útoky na dodavatelský řetězec přes npm.",
    fix: "Skript uložte přímo do repozitáře (např. .claude/hooks/), zkontrolujte jeho obsah a hook ho volejte lokálně. Pokud stahování nutně potřebujete, ověřujte kontrolní součet (sha256) staženého souboru.",
  },
  {
    id: "agent.hook.reverse-shell",
    title: "Hook obsahuje vzor vzdáleného shellu",
    cwe: "CWE-506",
    severity: "critical",
    languages: ["agentjson", "agentmd"],
    pattern: REVERSE_SHELL,
    explanation:
      "Konfigurace obsahuje konstrukci typickou pro reverzní shell (/dev/tcp, nc -e, mkfifo + nc). Ta otevírá útočníkovi interaktivní přístup k počítači. V legitimní konfiguraci agenta se téměř nikdy nevyskytuje.",
    fix: "Řádek odstraňte a zjistěte, kdo a kdy ho do repozitáře přidal (git log -p). Pokud ho nikdo z týmu nepřidal vědomě, považujte stroje, na kterých byl agent spuštěn, za kompromitované a vyměňte jejich přístupové klíče.",
  },
  {
    id: "agent.hook.credential-access",
    title: "Hook čte přihlašovací údaje nebo je odesílá ven",
    cwe: "CWE-522",
    severity: "high",
    languages: ["agentjson"],
    check: (ctx) => {
      const data = parseJsonc(ctx.file.content);
      return hookCommands(data)
        .filter((h) => CREDENTIAL_ACCESS.test(h.command) || (EXFIL.test(h.command) && /\$|env|token|key|secret|cat\s/i.test(h.command)))
        .map((h) => ({ line: lineOf(ctx, h.command.slice(0, 40)), severity: (CREDENTIAL_ACCESS.test(h.command) && EXFIL.test(h.command) ? "critical" : "high") as Severity }));
    },
    explanation:
      "Hook přistupuje k SSH/AWS klíčům, systémové klíčence nebo odesílá data (proměnné prostředí, obsah souborů) na vzdálený server. Hooky běží automaticky a bez upozornění, takže jde o ideální místo pro únik tajemství.",
    fix: "Odstraňte přístup k přihlašovacím údajům z hooků. Pokud hook něco reportuje (např. notifikace), posílejte jen nezbytná necitlivá data na vámi spravovaný endpoint přes HTTPS.",
  },
  {
    id: "agent.hook.anti-forensics",
    title: "Hook maže historii nebo logy",
    cwe: "CWE-778",
    severity: "high",
    languages: ["agentjson"],
    check: (ctx) => {
      const data = parseJsonc(ctx.file.content);
      return hookCommands(data)
        .filter((h) => ANTI_FORENSICS.test(h.command))
        .map((h) => ({ line: lineOf(ctx, h.command.slice(0, 40)) }));
    },
    explanation: "Hook maže historii příkazů nebo systémové logy. To je typické pro zakrývání stop po škodlivé činnosti.",
    fix: "Odstraňte tento příkaz a prověřte původ změny v historii gitu.",
  },
  {
    id: "agent.hook.global-install",
    title: "Hook instaluje globální balíčky",
    cwe: "CWE-829",
    severity: "medium",
    languages: ["agentjson"],
    check: (ctx) => {
      const data = parseJsonc(ctx.file.content);
      return hookCommands(data)
        .filter((h) => /\b(npm\s+(i|install)\s+(-g|--global)|pip3?\s+install|gem\s+install|cargo\s+install|go\s+install)\b/.test(h.command))
        .map((h) => ({ line: lineOf(ctx, h.command.slice(0, 40)) }));
    },
    explanation: "Hook při každém spuštění instaluje balíčky (často bez pevné verze). Kompromitovaná nová verze balíčku se tak automaticky dostane na všechny vývojářské stroje.",
    fix: "Instalaci přesuňte do jednorázového setup skriptu s pevně danými verzemi (lockfile), případně ji zcela odstraňte.",
  },
  {
    id: "agent.hook.silent-failure",
    title: "Bezpečnostní hook potlačuje chyby",
    cwe: "CWE-390",
    severity: "low",
    languages: ["agentjson"],
    check: (ctx) => {
      const data = parseJsonc(ctx.file.content);
      return hookCommands(data)
        .filter((h) => h.event === "PreToolUse" && /\|\|\s*true|2>\s*\/dev\/null|;\s*exit\s+0\s*$/.test(h.command))
        .map((h) => ({ line: lineOf(ctx, h.command.slice(0, 40)) }));
    },
    explanation: "PreToolUse hook (kontrola před akcí agenta) končí vždy úspěchem (|| true, 2>/dev/null). Když kontrola selže, agent pokračuje, jako by bylo vše v pořádku – ochrana tak tiše přestane fungovat.",
    fix: "Nechte hook při chybě skončit nenulovým kódem (u blokující kontroly kódem 2), aby agent akci zastavil.",
  },
  {
    id: "agent.mcp.unpinned",
    title: "MCP server se instaluje bez pevné verze",
    cwe: "CWE-1357",
    severity: "medium",
    languages: ["agentjson"],
    check: (ctx) =>
      mcpServers(ctx)
        .filter((s) => /^(npx|bunx|pnpm|uvx|pipx)$/.test(s.command ?? ""))
        .filter((s) => {
          const pkg = s.args.find((a) => !a.startsWith("-") && a !== "dlx" && a !== "run");
          return Boolean(pkg) && !/@\d+(\.\d+){1,2}([-+][\w.]+)?$|==\d/.test(pkg!);
        })
        .map((s) => ({ line: lineOf(ctx, `"${s.name}"`) })),
    explanation:
      "MCP server se spouští přes npx/uvx bez uvedené verze balíčku. Při každém startu se stáhne nejnovější verze – pokud útočník převezme balíček nebo účet autora, jeho kód poběží s přístupem vašeho AI agenta k souborům a klíčům.",
    fix: "Uveďte přesnou verzi, např. \"args\": [\"-y\", \"@modelcontextprotocol/server-filesystem@2025.8.21\"], a aktualizujte ji vědomě po kontrole changelogu.",
  },
  {
    id: "agent.mcp.hardcoded-env",
    title: "Tajný klíč přímo v konfiguraci MCP serveru",
    cwe: "CWE-798",
    severity: "high",
    languages: ["agentjson"],
    check: (ctx) =>
      mcpServers(ctx).flatMap((s) =>
        Object.entries(s.env)
          .filter(([k, v]) => /key|token|secret|pass|auth|cred/i.test(k) && typeof v === "string" && v.length >= 8 && !/^\$\{|^\$[A-Z_]|^<|your|xxx|change|example/i.test(v))
          .map(([, v]) => ({ line: lineOf(ctx, v), secret: v as string })),
      ),
    explanation: "V sekci env MCP serveru je přímo zapsaný API klíč nebo token. Konfigurace je v repozitáři, takže klíč vidí každý, kdo má přístup ke kódu.",
    fix: "Použijte odkaz na proměnnou prostředí (např. \"GITHUB_TOKEN\": \"${GITHUB_TOKEN}\") a samotný klíč zneplatněte a vygenerujte nový.",
  },
  {
    id: "agent.mcp.insecure-transport",
    title: "MCP server přes nešifrované nebo veřejné spojení",
    cwe: "CWE-319",
    severity: "medium",
    languages: ["agentjson"],
    check: (ctx) =>
      mcpServers(ctx)
        .filter((s) => (s.url && /^http:\/\/(?!localhost|127\.0\.0\.1|\[::1\])/i.test(s.url)) || s.args.some((a) => /0\.0\.0\.0/.test(a)))
        .map((s) => ({ line: lineOf(ctx, `"${s.name}"`) })),
    explanation: "MCP server komunikuje přes nešifrované HTTP nebo naslouchá na všech síťových rozhraních (0.0.0.0). Kdokoli v síti pak může komunikaci odposlouchávat nebo se k serveru připojit a ovládat nástroje agenta.",
    fix: "Používejte HTTPS pro vzdálené servery a lokální servery navažte jen na 127.0.0.1.",
  },
  {
    id: "agent.mcp.sensitive-args",
    title: "MCP server má přístup k citlivým souborům nebo celému disku",
    cwe: "CWE-552",
    severity: "high",
    languages: ["agentjson"],
    check: (ctx) =>
      mcpServers(ctx)
        .filter((s) =>
          s.args.some((a) => /\.env\b|\.pem$|id_rsa|credentials\.json|\.aws|\.ssh|wp-config\.php/i.test(a) || /^(\/|~|~\/|C:\\\\?|\$HOME)$/.test(a.trim())),
        )
        .map((s) => ({ line: lineOf(ctx, `"${s.name}"`), severity: (s.args.some((a) => /^(\/|C:\\\\?)$/.test(a.trim())) ? "high" : "medium") as Severity })),
    explanation: "MCP server (např. filesystem) dostal přístup ke kořeni disku, domovskému adresáři nebo souborům s klíči. Agent i případný útočník přes prompt injection tak mohou číst cokoli na počítači.",
    fix: "Omezte server na adresář projektu (např. \"./\" nebo konkrétní podadresář) a citlivé soubory mu nepředávejte.",
  },
  {
    id: "agent.mcp.shell-metachar",
    title: "Shellové operátory v argumentech MCP serveru",
    cwe: "CWE-78",
    severity: "medium",
    languages: ["agentjson"],
    check: (ctx) =>
      mcpServers(ctx)
        .filter((s) => /^(sh|bash|zsh|cmd|powershell|pwsh)(\.exe)?$/.test(s.command ?? "") || s.args.some((a) => /&&|\|\||;\s|\|\s|`|\$\(/.test(a)))
        .map((s) => ({ line: lineOf(ctx, `"${s.name}"`) })),
    explanation: "MCP server se spouští přes shell nebo jeho argumenty obsahují řetězení příkazů. Je pak těžké zjistit, co se skutečně spouští, a snadno se do konfigurace propašuje další příkaz.",
    fix: "Spouštějte přímo binárku serveru s jednoduchým seznamem argumentů, bez sh -c a bez &&, |, ;.",
  },
  {
    id: "agent.vscode.folder-open-task",
    title: "VS Code úloha se spouští automaticky při otevření složky",
    cwe: "CWE-506",
    severity: "high",
    languages: ["agentjson"],
    check: (ctx) => {
      if (!/\.vscode\/tasks\.json$/.test(fileName(ctx))) return [];
      const data = parseJsonc(ctx.file.content);
      const tasks: any[] = Array.isArray(data?.tasks) ? data.tasks : [];
      return tasks
        .filter((t) => t?.runOptions?.runOn === "folderOpen")
        .map((t) => ({ line: lineOf(ctx, "folderOpen"), severity: (REMOTE_EXEC.test(JSON.stringify(t)) ? "critical" : "high") as Severity }));
    },
    explanation:
      "Úloha s \"runOn\": \"folderOpen\" se spustí sama, jakmile někdo otevře repozitář ve VS Code (nebo v editoru s AI agentem postaveném na VS Code). Tento mechanismus zneužívají útočníci k infikaci vývojářů přes podvržené repozitáře.",
    fix: "Odstraňte runOn: folderOpen; úlohy spouštějte ručně. Ve VS Code ponechte zapnutou funkci Workspace Trust.",
  },
  {
    id: "agent.prompt.hidden-unicode",
    title: "Skryté znaky v instrukcích pro AI",
    cwe: "CWE-1007",
    severity: "high",
    languages: ["agentmd", "agentjson"],
    includeComments: true,
    // Zero-width, bidi override and Unicode tag characters
    pattern: /[\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060-\u2064\u2066-\u2069]|\uDB40[\uDC00-\uDC7F]|.\uFEFF/,
    explanation:
      "Soubor s instrukcemi pro AI agenta obsahuje neviditelné znaky (nulové šířky, obrácení směru textu nebo tzv. tag znaky). Člověk je při kontrole nevidí, ale AI model je přečte – takto se do CLAUDE.md nebo pravidel Cursoru propašují skryté pokyny (prompt injection).",
    fix: "Odstraňte neviditelné znaky (např. v editoru s viditelnými bílými znaky nebo příkazem: perl -CSD -pi -e 's/[\\x{200B}-\\x{200F}\\x{202A}-\\x{202E}\\x{2060}-\\x{2069}\\x{E0000}-\\x{E007F}]//g' SOUBOR) a prověřte v historii gitu, kdo je přidal.",
  },
  {
    id: "agent.prompt.injection-phrase",
    title: "Instrukce typické pro prompt injection",
    cwe: "CWE-1427",
    severity: "high",
    languages: ["agentmd"],
    includeComments: true,
    pattern:
      /\b(ignore|disregard|forget)\s+(all\s+|any\s+)?(the\s+)?(previous|prior|above|earlier|system)\s+(instructions|prompts?|rules)|\byou\s+are\s+now\s+(in\s+)?(DAN|developer\s+mode|jailbreak)|\bnew\s+system\s+prompt\s*:|\bignoruj\s+(všechny\s+)?(předchozí|výše\s+uvedené)\s+(instrukce|pokyny)/i,
    explanation:
      "Soubor s instrukcemi pro AI obsahuje formulace, kterými se útočníci snaží přepsat chování modelu („ignoruj předchozí instrukce“, falešný systémový prompt). V legitimních pravidlech projektu se nevyskytují.",
    fix: "Řádek odstraňte a prověřte původ změny (git log -p). Instrukční soubory chraňte přes CODEOWNERS a povinné review.",
  },
  {
    id: "agent.prompt.auto-run",
    title: "Instrukce nutí agenta jednat bez potvrzení",
    cwe: "CWE-1427",
    severity: "medium",
    languages: ["agentmd"],
    includeComments: true,
    pattern:
      /\b(without\s+(asking|confirmation|permission|approval)|do\s+not\s+ask\s+(for\s+)?(confirmation|permission|the\s+user)|never\s+ask\s+(for\s+)?(confirmation|permission)|bez\s+(ptaní|potvrzení|dotazu))\b|--dangerously-skip-permissions|bypassPermissions/i,
    explanation:
      "Instrukce pro agenta vyžadují, aby prováděl akce bez potvrzení uživatele. To obchází poslední pojistku proti chybám i proti prompt injection z obsahu, který agent čte.",
    fix: "Formulujte pravidla tak, aby rizikové akce (mazání, push, nasazení, práce s tajnými klíči) vždy vyžadovaly potvrzení.",
  },
  {
    id: "agent.prompt.remote-exec",
    title: "Instrukce pro agenta stahují a spouštějí kód",
    cwe: "CWE-494",
    severity: "high",
    languages: ["agentmd"],
    includeComments: true,
    pattern: REMOTE_EXEC,
    explanation:
      "Instrukční soubor říká agentovi, aby stáhl skript z internetu a spustil ho. Agent to provede s vašimi oprávněními; obsah na dané adrese se může kdykoli změnit.",
    fix: "Potřebné skripty uložte do repozitáře a odkažte na lokální cestu, nebo ověřujte kontrolní součet staženého souboru.",
  },
  {
    id: "agent.prompt.suppress-findings",
    title: "Instrukce potlačují bezpečnostní upozornění",
    cwe: "CWE-1427",
    severity: "high",
    languages: ["agentmd"],
    includeComments: true,
    pattern:
      /\b(do\s+not|don'?t|never)\s+(report|mention|flag|disclose|tell\s+the\s+user\s+about)\s+[^.\n]{0,40}(security|vulnerabilit|secret|credential|warning)|\b(hide|suppress)\s+(security\s+)?(warnings|findings|vulnerabilities)\b|\bnehlas\s+(bezpečnostní|zranitelnost)/i,
    explanation: "Instrukce žádají agenta, aby zamlčel bezpečnostní problémy nebo varování. Takové pravidlo může skrýt škodlivou změnu před code review.",
    fix: "Odstraňte instrukci a prověřte, proč a kým byla přidána.",
  },
  {
    id: "agent.prompt.hidden-comment",
    title: "Skrytý HTML komentář s pokyny pro AI",
    cwe: "CWE-1427",
    severity: "medium",
    languages: ["agentmd"],
    includeComments: true,
    check: (ctx) => {
      const matches: RuleMatch[] = [];
      const re = /<!--([\s\S]*?)-->/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(ctx.file.content))) {
        if (/\b(ignore|execute|run|curl|wget|send|upload|password|token|secret|do not tell|don't tell|always|never mention|spusť|pošli)\b/i.test(m[1])) {
          matches.push({ line: ctx.file.content.slice(0, m.index).split("\n").length });
        }
      }
      return matches;
    },
    explanation: "HTML komentář se v náhledu Markdownu nezobrazí, ale AI agent ho přečte. Pokyny v něm tak mohou ovlivnit agenta bez vědomí lidí, kteří soubor kontrolují.",
    fix: "Přesuňte legitimní pokyny do viditelného textu, ostatní komentáře odstraňte.",
  },
  {
    id: "agent.prompt.encoded-blob",
    title: "Zakódovaný obsah v instrukcích pro AI",
    cwe: "CWE-1427",
    severity: "low",
    languages: ["agentmd"],
    includeComments: true,
    pattern: /(?<![\w/+])[A-Za-z0-9+/]{120,}={0,2}(?![\w/+])/,
    explanation: "Instrukční soubor obsahuje dlouhý blok zakódovaných dat (base64). Člověk ho nepřečte, model ano – může v něm být ukrytý pokyn.",
    fix: "Dekódujte obsah a ověřte, co obsahuje. Do instrukcí pro agenta patří jen čitelný text.",
  },
  {
    id: "agent.subagent.unrestricted-tools",
    title: "Subagent dědí všechny nástroje",
    cwe: "CWE-250",
    severity: "low",
    languages: ["agentmd"],
    check: (ctx) => {
      if (!/\.claude\/agents\/[^/]+\.md$/.test(fileName(ctx))) return [];
      const front = ctx.file.content.match(/^---\n([\s\S]*?)\n---/);
      if (!front) return [];
      return /^tools\s*:/m.test(front[1]) ? [] : [{ line: 1 }];
    },
    explanation: "Definice subagenta neuvádí pole tools, takže zdědí všechny nástroje hlavního agenta včetně spouštění příkazů a zápisu souborů. Specializovaný agent (např. pro review) to obvykle nepotřebuje.",
    fix: "Do frontmatteru přidejte jen potřebné nástroje, např. \"tools: Read, Grep, Glob\" pro agenta, který kód jen čte.",
  },
];

export const ciRules: Rule[] = [
  {
    id: "ci.pull-request-target-checkout",
    title: "pull_request_target spouští kód z cizího pull requestu",
    cwe: "CWE-829",
    severity: "high",
    languages: ["workflow"],
    check: (ctx) => {
      if (!/\bpull_request_target\b/.test(ctx.file.content)) return [];
      const idx = ctx.lines.findIndex((l) => /ref:\s*\$\{\{\s*github\.event\.pull_request\.head\.(sha|ref)|github\.head_ref/.test(l));
      return idx === -1 ? [] : [{ line: idx + 1 }];
    },
    explanation:
      "Workflow spuštěný přes pull_request_target má přístup k tajným klíčům repozitáře a právo zápisu, a přitom stahuje kód z pull requestu, který může poslat kdokoli. Kód z cizího forku tak poběží s vašimi tajemstvími.",
    fix: "Pro sestavení a testy cizích PR používejte událost pull_request (bez tajemství). Pokud pull_request_target potřebujete, nestahujte head PR, nebo ho spouštějte jen po schválení (label / environment s povinným review).",
  },
  {
    id: "ci.script-injection",
    title: "Nedůvěryhodný text z GitHubu vložený do shellu",
    cwe: "CWE-78",
    severity: "high",
    languages: ["workflow"],
    pattern: /\$\{\{\s*github\.(event\.(issue|pull_request|comment|review|review_comment|discussion|head_commit|commits|pages)[\w.\[\]*]*\.(title|body|message|name|label|ref|email|head_ref)|head_ref)\s*\}\}/,
    refine: (line) => (/^\s*(-\s*)?(name|uses|with|if)\s*:/.test(line) ? null : {}),
    explanation:
      "Do příkazu v kroku run: se přímo vkládá text, který může ovlivnit kdokoli (název issue, popis PR, zpráva commitu, název větve). Speciálně upravený text se vykoná jako shellový příkaz s přístupem k tajemstvím workflow.",
    fix: "Předejte hodnotu přes proměnnou prostředí a v shellu ji použijte v uvozovkách: env: TITLE: ${{ github.event.issue.title }} a pak echo \"$TITLE\".",
  },
  {
    id: "ci.write-all-permissions",
    title: "Workflow má plná oprávnění k zápisu",
    cwe: "CWE-250",
    severity: "medium",
    languages: ["workflow"],
    pattern: /^\s*permissions\s*:\s*write-all\b/,
    explanation: "Token GITHUB_TOKEN dostal právo zápisu do všech částí repozitáře. Pokud je kterýkoli krok (nebo použitá akce) kompromitován, útočník může měnit kód, vydání i nastavení.",
    fix: "Nastavte minimální oprávnění, např. permissions: contents: read a zápis povolte jen jednotlivým jobům, které ho potřebují.",
  },
  {
    id: "ci.unpinned-action",
    title: "Akce třetí strany bez pevné verze",
    cwe: "CWE-1357",
    severity: "low",
    languages: ["workflow"],
    pattern: /^\s*(-\s*)?uses\s*:\s*(?!actions\/|github\/|\.\/|docker:\/\/)[\w.-]+\/[\w./-]+@(main|master|latest|v?\d+)\s*$/,
    explanation: "Akce třetí strany je odkazovaná přes větev nebo pohyblivý tag. Pokud autor (nebo útočník s jeho účtem) tag přesune, ve vašem CI se spustí jiný kód s přístupem k tajemstvím.",
    fix: "Odkazujte akce přes plný SHA commitu (např. uses: owner/action@3f1c…  # v2.1.0) a aktualizace nechte navrhovat Dependabotem.",
  },
];
