import type { FileContext, Rule, RuleMatch } from "../types";
import { JS_INPUT } from "./helpers";

const SQL_KEYWORDS = /\b(SELECT|INSERT|UPDATE|DELETE|WHERE|FROM|INTO|VALUES|ORDER BY)\b/i;

function checkJsSql(ctx: FileContext): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const call = /(\.(query|execute|raw|whereRaw|orderByRaw|havingRaw)|\$queryRawUnsafe|\$executeRawUnsafe)\s*\(\s*/;
  ctx.codeLines.forEach((line, idx) => {
    const m = line.match(call);
    if (!m || m.index === undefined) return;
    const arg = ctx.codeLines.slice(idx, idx + 6).join("\n").slice(m.index + m[0].length);
    const unsafeApi = /Unsafe/.test(m[1]);
    const interpolated = /^`[^`]*\$\{/.test(arg);
    const concatenated = /^(['"])[^'"]*\1\s*\+/.test(arg) || /^\w+\s*\+\s*['"`]/.test(arg);
    if (!interpolated && !concatenated && !unsafeApi) return;
    if (!unsafeApi && !SQL_KEYWORDS.test(arg.slice(0, 400))) return;
    if (!interpolated && !concatenated && unsafeApi && /^['"`][^$+]*['"`]\s*[,)]/.test(arg)) return;
    matches.push({ line: idx + 1, severity: JS_INPUT.test(arg.slice(0, 400)) ? "critical" : "high" });
  });
  return matches;
}

function checkMulter(ctx: FileContext): RuleMatch[] {
  if (!/\bmulter\s*\(/.test(ctx.code) || /fileFilter/.test(ctx.code)) return [];
  const idx = ctx.codeLines.findIndex((l) => /\bmulter\s*\(/.test(l));
  return [{ line: idx + 1 }];
}

function checkCors(ctx: FileContext): RuleMatch[] {
  if (!/credentials\s*:\s*true/.test(ctx.code)) return [];
  const idx = ctx.codeLines.findIndex((l) => /origin\s*:\s*(true|['"]\*['"])/.test(l));
  return idx === -1 ? [] : [{ line: idx + 1 }];
}

export const jsRules: Rule[] = [
  {
    id: "js.sqli",
    title: "SQL injection – dotaz skládaný z řetězců",
    cwe: "CWE-89",
    severity: "high",
    languages: ["js"],
    check: checkJsSql,
    explanation:
      "SQL dotaz se skládá pomocí template literálu nebo spojování řetězců. Pokud hodnota pochází od uživatele, útočník může změnit dotaz a číst nebo měnit data v databázi.",
    fix:
      "Používejte parametry: db.query('SELECT * FROM users WHERE id = $1', [id]) (pg) nebo '?' (mysql2). V Prisma použijte $queryRaw`... ${id}` (tagged template, bezpečné) místo $queryRawUnsafe. Názvy sloupců ověřte whitelistem.",
  },
  {
    id: "js.dangerous.eval",
    title: "Použití eval() / new Function()",
    cwe: "CWE-95",
    severity: "high",
    languages: ["js"],
    pattern: /(?<![\w$.])eval\s*\(|\bnew\s+Function\s*\(|\bset(Timeout|Interval)\s*\(\s*['"`]/,
    explanation:
      "Řetězec se spouští jako JavaScript. Pokud do něj pronikne vstup od uživatele, útočník spustí vlastní kód – v prohlížeči (XSS) nebo na serveru (Node.js) s plnými právy aplikace.",
    fix: "Odstraňte eval()/new Function(). Pro data použijte JSON.parse(), pro výběr akce mapu funkcí, setTimeout volejte s funkcí, ne s řetězcem.",
  },
  {
    id: "js.dangerous.exec",
    title: "Spouštění příkazů shellu se skládaným řetězcem",
    cwe: "CWE-78",
    severity: "high",
    languages: ["js"],
    pattern: /\b(exec|execSync)\s*\(\s*(`[^`]*\$\{|['"][^'"]*['"]\s*\+|\w+\s*\+)|\bspawn(Sync)?\s*\([^)]*shell\s*:\s*true/,
    refine: (line) => (JS_INPUT.test(line) ? { severity: "critical" } : {}),
    explanation:
      "Příkaz shellu se skládá z proměnných. Pokud obsahují vstup od uživatele, lze přidat vlastní příkazy (; && |) a převzít server.",
    fix: "Použijte execFile()/spawn() s polem argumentů a bez shell: true, např. execFile('convert', [vstup, vystup]). Vstupy ověřte whitelistem.",
  },
  {
    id: "js.xss.html-sink",
    title: "Vkládání HTML bez ošetření (XSS)",
    cwe: "CWE-79",
    severity: "medium",
    languages: ["js"],
    pattern: /\.(innerHTML|outerHTML)\s*\+?=\s*(.+)|\binsertAdjacentHTML\s*\(|\bdocument\.write(ln)?\s*\(|dangerouslySetInnerHTML/,
    exclude: /DOMPurify\.sanitize|sanitizeHtml\s*\(|escapeHtml\s*\(/,
    refine: (_line, m) => {
      // Assigning a plain string literal without interpolation is safe.
      if (m[2] && /^\s*(['"])[^'"]*\1\s*;?\s*$|^\s*`[^`$]*`\s*;?\s*$/.test(m[2])) return null;
      return {};
    },
    explanation:
      "Do stránky se vkládá HTML složené z proměnných. Pokud obsahují data od uživatele (jméno zvířete, poznámka, parametr z URL), může útočník vložit škodlivý skript.",
    fix: "Pro text používejte textContent / innerText (v Reactu běžné {promenna}). Pokud musíte vložit HTML, nejdřív ho vyčistěte knihovnou DOMPurify: el.innerHTML = DOMPurify.sanitize(html).",
  },
  {
    id: "js.xss.reflected",
    title: "Vrácení vstupu z požadavku přímo v odpovědi",
    cwe: "CWE-79",
    severity: "high",
    languages: ["js"],
    pattern: /\bres\.(send|write|end)\s*\([^)]*\breq\.(query|body|params)/,
    explanation: "Server vrací hodnotu z požadavku zpět jako HTML bez escapování. Útočník může připravit odkaz, který v prohlížeči oběti spustí skript.",
    fix: "Vracejte JSON (res.json()) nebo hodnotu escapujte (např. knihovnou escape-html) a nastavte správný Content-Type.",
  },
  {
    id: "js.path-traversal",
    title: "Práce se souborem podle vstupu od uživatele",
    cwe: "CWE-22",
    severity: "high",
    languages: ["js"],
    pattern: /\b(fs|fsp|fs\.promises|promises)\.\w+\s*\([^)]*\breq\.(query|body|params)|\bres\.(sendFile|download)\s*\([^)]*\breq\.(query|body|params)|path\.(join|resolve)\s*\([^)]*\breq\.(query|body|params)/,
    explanation: "Cesta k souboru obsahuje vstup od uživatele. Pomocí ../ lze číst nebo přepsat soubory mimo zamýšlený adresář (např. .env s klíči).",
    fix: "Použijte path.basename() a whitelist povolených souborů. Po sestavení cesty ověřte, že path.resolve(vysledek) začíná povoleným adresářem.",
  },
  {
    id: "js.nosql-injection",
    title: "NoSQL injection – objekt z požadavku v dotazu",
    cwe: "CWE-943",
    severity: "high",
    languages: ["js"],
    pattern: /\.(find|findOne|findOneAndUpdate|updateOne|updateMany|deleteOne|deleteMany|countDocuments)\s*\(\s*req\.(body|query)/,
    explanation: "Celý objekt z požadavku se předává jako filtr do MongoDB. Útočník může poslat operátory jako {\"$ne\": null} a obejít přihlášení nebo číst cizí data.",
    fix: "Sestavte filtr z jednotlivých ověřených polí: { email: String(req.body.email) }. Vstup validujte schématem (zod, joi) a zvažte mongo-sanitize.",
  },
  {
    id: "js.open-redirect",
    title: "Přesměrování na adresu od uživatele",
    cwe: "CWE-601",
    severity: "medium",
    languages: ["js"],
    pattern: /\bres\.redirect\s*\(\s*(\d+\s*,\s*)?req\.(query|body|params)|\b(window\.)?location(\.href)?\s*=\s*[^;]*(location\.(search|hash)|URLSearchParams|searchParams\.get)/,
    explanation: "Cíl přesměrování pochází z URL. Váš web pak lze zneužít k přesměrování obětí na podvodné stránky.",
    fix: "Povolte jen relativní cesty začínající jedním '/' nebo adresy ze seznamu povolených domén.",
  },
  {
    id: "js.tls.verify-disabled",
    title: "Vypnuté ověřování TLS certifikátu",
    cwe: "CWE-295",
    severity: "medium",
    languages: ["js", "config"],
    pattern: /rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0/,
    explanation: "HTTPS spojení neověřuje certifikát. Útočník v síti může komunikaci číst a měnit.",
    fix: "Odstraňte rejectUnauthorized: false / NODE_TLS_REJECT_UNAUTHORIZED=0. Pro vlastní CA použijte volbu ca nebo NODE_EXTRA_CA_CERTS.",
  },
  {
    id: "js.jwt.none-alg",
    title: "JWT povoluje algoritmus 'none'",
    cwe: "CWE-347",
    severity: "high",
    languages: ["js"],
    pattern: /algorithms\s*:\s*\[[^\]]*['"]none['"]/i,
    explanation: "Povolený algoritmus 'none' znamená, že token nemusí být podepsaný – kdokoli si může vyrobit token libovolného uživatele.",
    fix: "Při ověřování uveďte jen konkrétní algoritmus: jwt.verify(token, secret, { algorithms: ['HS256'] }).",
  },
  {
    id: "js.jwt.hardcoded-secret",
    title: "Pevně zapsaný klíč pro JWT",
    cwe: "CWE-798",
    severity: "high",
    languages: ["js"],
    pattern: /\bjwt\.(sign|verify)\s*\([^,]+,\s*(['"])([^'"]{4,})\2/,
    refine: (_line, m) => ({ secret: m[3] }),
    explanation: "Klíč pro podepisování tokenů je přímo v kódu. Kdokoli s přístupem k repozitáři (nebo k jeho úniku) si může vyrobit platný token libovolného uživatele.",
    fix: "Načtěte klíč z proměnné prostředí (process.env.JWT_SECRET), vygenerujte nový náhodný klíč (openssl rand -base64 32) a starý považujte za kompromitovaný.",
  },
  {
    id: "js.crypto.weak-random",
    title: "Math.random() pro bezpečnostní tokeny",
    cwe: "CWE-338",
    severity: "medium",
    languages: ["js"],
    pattern: /Math\.random\s*\(/,
    refine: (line) => (/token|nonce|pass|secret|key|reset|otp|code|salt|session/i.test(line) ? {} : null),
    explanation: "Math.random() není kryptograficky bezpečný. Tokeny z něj lze odhadnout.",
    fix: "Použijte crypto.randomBytes(32).toString('hex') (Node.js) nebo crypto.getRandomValues() / crypto.randomUUID() v prohlížeči.",
  },
  {
    id: "js.upload.no-filter",
    title: "Nahrávání souborů (multer) bez filtru typu",
    cwe: "CWE-434",
    severity: "medium",
    languages: ["js"],
    check: checkMulter,
    explanation: "Multer přijímá libovolné soubory bez kontroly typu. Mohou být nahrány spustitelné nebo HTML soubory, které se pak servírují dalším uživatelům.",
    fix: "Nastavte fileFilter s whitelistem MIME typů a přípon, limits.fileSize, náhodné názvy souborů a ukládání mimo veřejný adresář.",
  },
  {
    id: "js.cors.credentials-wildcard",
    title: "CORS povoluje libovolný původ s cookies",
    cwe: "CWE-942",
    severity: "medium",
    languages: ["js"],
    check: checkCors,
    explanation: "CORS je nastaven tak, že libovolný web může posílat požadavky s cookies přihlášeného uživatele a číst odpovědi.",
    fix: "Místo origin: true / '*' uveďte konkrétní seznam povolených domén.",
  },
];
