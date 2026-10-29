import type { FileContext, Rule, RuleMatch } from "../types";
import {
  PHP_ESCAPERS,
  PHP_INPUT,
  PHP_SANITIZERS,
  allOccurrencesWrapped,
  extractBlock,
  lineOfIndex,
  statementFrom,
} from "./helpers";

const SQL_CALL =
  /(\$wpdb\s*->\s*(query|get_results|get_var|get_row|get_col)|\bmysqli?_query|\bmysqli_multi_query|\bpg_query|->\s*query|->\s*exec)\s*\(/;

// Variables that typically hold table names rather than user data.
const SAFE_SQL_VARS =
  /\{?\$wpdb\s*->\s*\w+\}?(?!\s*\()|\{?\$(table|table_name|tablename|tbl|prefix|charset_collate|wpdb_prefix)\w*\}?/gi;

const STATE_CHANGING =
  /\$wpdb\s*->\s*(insert|update|delete|replace|query)\s*\(|\b(update_option|delete_option|add_option|wp_insert_\w+|wp_update_\w+|wp_delete_\w+|wp_set_password|update_user_meta|add_user_meta|delete_user_meta|update_post_meta|delete_post_meta|unlink|move_uploaded_file|file_put_contents|wp_mail|wp_create_user|wp_set_current_user|wp_set_auth_cookie)\s*\(/;

const CAPABILITY_CHECK = /\b(current_user_can|user_can|is_super_admin|current_user_has_role|wp_get_current_user\s*\(\s*\)\s*->\s*roles)\b/;
const NONCE_CHECK = /\b(check_ajax_referer|wp_verify_nonce|check_admin_referer)\s*\(/;

function sqlArgIsDynamic(arg: string): "input" | "dynamic" | null {
  if (PHP_INPUT.test(arg)) return "input";
  const cleaned = arg.replace(SAFE_SQL_VARS, "");
  return /\$[a-zA-Z_]/.test(cleaned) ? "dynamic" : null;
}

function checkSql(ctx: FileContext): RuleMatch[] {
  const matches: RuleMatch[] = [];
  ctx.codeLines.forEach((line, idx) => {
    const call = line.match(SQL_CALL);
    if (!call || call.index === undefined) return;
    const statement = statementFrom(ctx.codeLines, idx);
    if (/->\s*prepare\s*\(/.test(statement)) return;
    const arg = statement.slice(statement.indexOf(call[0]) + call[0].length);

    // Single variable argument such as $wpdb->query( $sql ): look back for how it was built.
    const single = arg.match(/^\s*(\$\w+)\s*\)/);
    if (single) {
      const name = single[1].replace("$", "\\$");
      const assign = new RegExp(`${name}\\s*\\.?=\\s*(.*)`);
      for (let j = idx - 1; j >= Math.max(0, idx - 25); j--) {
        const m = ctx.codeLines[j].match(assign);
        if (!m) continue;
        const built = statementFrom(ctx.codeLines, j);
        if (/->\s*prepare\s*\(/.test(built)) return;
        const kind = sqlArgIsDynamic(built.slice(built.indexOf(m[1])));
        if (kind) matches.push({ line: idx + 1, severity: kind === "input" ? "critical" : "high" });
        return;
      }
      return;
    }

    const kind = sqlArgIsDynamic(arg);
    if (kind) matches.push({ line: idx + 1, severity: kind === "input" ? "critical" : "high" });
  });
  return matches;
}

interface Handler {
  hook: string;
  callback: string | null;
  line: number;
  nopriv: boolean;
}

function findHandlers(ctx: FileContext): Handler[] {
  const handlers: Handler[] = [];
  const re =
    /add_action\s*\(\s*['"]((?:wp_ajax_|admin_post_)(nopriv_)?\w+)['"]\s*,\s*(?:['"](\w+)['"]|array\s*\(\s*\$\w+\s*,\s*['"](\w+)['"]\s*\)|\[\s*\$\w+\s*,\s*['"](\w+)['"]\s*\]|\[\s*[\w\\]+::class\s*,\s*['"](\w+)['"]\s*\])?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(ctx.code))) {
    handlers.push({
      hook: m[1],
      nopriv: Boolean(m[2]),
      callback: m[3] ?? m[4] ?? m[5] ?? m[6] ?? null,
      line: lineOfIndex(ctx.code, m.index),
    });
  }
  return handlers;
}

function handlerBody(ctx: FileContext, callback: string | null): string {
  if (!callback) return ctx.code;
  const def = new RegExp(`function\\s+${callback}\\s*\\(`).exec(ctx.code);
  if (!def) return ctx.code; // defined elsewhere: fall back to whole file
  return extractBlock(ctx.code, def.index)?.body ?? ctx.code;
}

function checkWpHandlers(ctx: FileContext, want: "capability" | "nonce" | "nopriv"): RuleMatch[] {
  const matches: RuleMatch[] = [];
  for (const h of findHandlers(ctx)) {
    const body = handlerBody(ctx, h.callback);
    const changesState = STATE_CHANGING.test(body);
    if (want === "nopriv") {
      if (h.nopriv && changesState && !NONCE_CHECK.test(body)) matches.push({ line: h.line });
      continue;
    }
    if (h.nopriv) continue;
    if (want === "capability" && !CAPABILITY_CHECK.test(body)) {
      matches.push({ line: h.line, severity: changesState ? "high" : "medium" });
    }
    if (want === "nonce" && changesState && !NONCE_CHECK.test(body)) matches.push({ line: h.line });
  }
  return matches;
}

function checkRestRoutes(ctx: FileContext): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const re = /register_rest_route\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(ctx.code))) {
    // Take the call up to the matching closing parenthesis.
    let depth = 0;
    let end = m.index;
    for (let i = m.index; i < ctx.code.length; i++) {
      if (ctx.code[i] === "(") depth++;
      else if (ctx.code[i] === ")") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    const call = ctx.code.slice(m.index, end);
    const line = lineOfIndex(ctx.code, m.index);
    if (!/permission_callback/.test(call)) {
      matches.push({ line, severity: "high" });
    } else if (
      /permission_callback['"]?\s*=>\s*['"]__return_true['"]/.test(call) &&
      /(POST|PUT|PATCH|DELETE|EDITABLE|CREATABLE|DELETABLE)/.test(call)
    ) {
      matches.push({ line, severity: "medium" });
    }
  }
  return matches;
}

function checkGenericPostHandler(ctx: FileContext): RuleMatch[] {
  if (/add_action\s*\(\s*['"](wp_ajax_|admin_post_)/.test(ctx.code)) return [];
  if (/register_rest_route/.test(ctx.code)) return [];
  if (!STATE_CHANGING.test(ctx.code)) return [];
  if (/\b(current_user_can|is_user_logged_in|check_admin_referer|wp_verify_nonce|check_ajax_referer)\b/.test(ctx.code)) return [];
  if (/\$_SESSION\s*\[|auth|login|permission|capabilit|role|is_admin_user|require_admin/i.test(ctx.code)) return [];
  const idx = ctx.codeLines.findIndex((l) => /\$_(POST|REQUEST)\s*\[/.test(l));
  return idx === -1 ? [] : [{ line: idx + 1 }];
}

const UPLOAD_VALIDATION =
  /\b(wp_check_filetype_and_ext|wp_check_filetype|finfo_file|finfo_open|mime_content_type|getimagesize|exif_imagetype|wp_handle_upload|wp_handle_sideload|media_handle_upload)\s*\(|in_array\s*\(\s*(strtolower\s*\()?\s*\$\w*(ext|type|mime)/i;

function checkUploadValidation(ctx: FileContext): RuleMatch[] {
  if (UPLOAD_VALIDATION.test(ctx.code)) return [];
  const matches: RuleMatch[] = [];
  ctx.codeLines.forEach((l, i) => {
    if (/\bmove_uploaded_file\s*\(/.test(l)) matches.push({ line: i + 1 });
  });
  return matches;
}

export const phpRules: Rule[] = [
  {
    id: "php.sqli",
    title: "SQL injection – neparametrizovaný dotaz",
    cwe: "CWE-89",
    severity: "high",
    languages: ["php"],
    explanation:
      "SQL dotaz se skládá spojováním řetězců s proměnnými. Pokud se do proměnné dostane vstup od uživatele, útočník může změnit smysl dotazu – číst cizí data (např. účty majitelů nebo registrace ptáků), měnit je nebo mazat.",
    fix:
      "Použijte parametrizovaný dotaz. Ve WordPressu: $wpdb->get_results( $wpdb->prepare( \"SELECT * FROM {$wpdb->prefix}tabulka WHERE id = %d\", $id ) ). V čistém PHP použijte PDO s prepare() a bindValue()/execute([...]). Pro názvy sloupců a směr řazení použijte whitelist povolených hodnot.",
    check: checkSql,
  },
  {
    id: "php.xss.echo-input",
    title: "Výpis uživatelského vstupu bez escapování (XSS)",
    cwe: "CWE-79",
    severity: "high",
    languages: ["php"],
    pattern: /(\b(echo|print|printf|die|exit)\b|<\?=)[^;]*\$_(GET|POST|REQUEST|COOKIE|SERVER)\b/,
    refine: (line) =>
      allOccurrencesWrapped(line, /\$_(GET|POST|REQUEST|COOKIE|SERVER)\b/, PHP_ESCAPERS) ? null : {},
    explanation:
      "Hodnota z URL, formuláře nebo cookie se vypisuje přímo do HTML. Útočník může připravit odkaz, který po otevření spustí v prohlížeči oběti JavaScript (např. ukradne přihlášení administrátora).",
    fix:
      "Před výpisem vždy escapujte podle kontextu: esc_html() pro text, esc_attr() pro atributy, esc_url() pro odkazy (mimo WordPress htmlspecialchars($v, ENT_QUOTES, 'UTF-8')). Vstup navíc při načtení ošetřete, např. sanitize_text_field( wp_unslash( $_GET['x'] ) ).",
  },
  {
    id: "php.input.unsanitized",
    title: "Neošetřený vstup z formuláře / URL",
    cwe: "CWE-20",
    severity: "medium",
    languages: ["php"],
    pattern: /\$_(GET|POST|REQUEST|COOKIE)\s*\[/,
    // Sinks (output, SQL, exec, include) are reported by more specific rules.
    exclude: /\b(echo|print|printf|eval|exec|system|shell_exec|passthru|include|require|include_once|require_once|unserialize)\b|<\?=|->\s*(query|get_results|get_var|get_row|get_col|prepare)\s*\(|mysqli?_query/,
    refine: (line) => (allOccurrencesWrapped(line, PHP_INPUT, PHP_SANITIZERS) ? null : {}),
    explanation:
      "Data od uživatele se používají bez validace nebo sanitizace. I když tento řádek sám o sobě nemusí být zneužitelný, neošetřená hodnota se může později dostat do HTML, SQL dotazu nebo do souborového systému.",
    fix:
      "Ošetřete vstup hned při načtení podle očekávaného typu: sanitize_text_field( wp_unslash( $_POST['jmeno'] ) ), absint( $_GET['id'] ), sanitize_email(), sanitize_key() apod. Mimo WordPress použijte filter_input() s vhodným filtrem. Hodnoty z výčtu ověřte whitelistem (in_array(..., true)).",
  },
  {
    id: "php.authz.ajax-capability",
    title: "AJAX/admin-post akce bez kontroly oprávnění",
    cwe: "CWE-862",
    severity: "high",
    languages: ["php"],
    check: (ctx) => checkWpHandlers(ctx, "capability"),
    explanation:
      "Akce registrovaná přes wp_ajax_* nebo admin_post_* je dostupná každému přihlášenému uživateli – včetně běžného odběratele nebo majitele zvířete s účtem. Bez kontroly oprávnění může kdokoli s účtem provést administrátorskou operaci. Pozor: is_admin() oprávnění NEOVĚŘUJE.",
    fix:
      "Na začátku obslužné funkce ověřte oprávnění: if ( ! current_user_can( 'manage_options' ) ) { wp_send_json_error( 'Forbidden', 403 ); } – zvolte nejužší vhodnou capability (např. edit_posts nebo vlastní capability pro správu registru).",
  },
  {
    id: "php.authz.ajax-nonce",
    title: "Akce měnící data bez ověření nonce (CSRF)",
    cwe: "CWE-352",
    severity: "medium",
    languages: ["php"],
    check: (ctx) => checkWpHandlers(ctx, "nonce"),
    explanation:
      "Akce mění data, ale neověřuje nonce. Útočník může přihlášeného uživatele nalákat na cizí stránku, která akci odešle jeho jménem (Cross-Site Request Forgery).",
    fix:
      "Do formuláře přidejte wp_nonce_field( 'moje_akce' ) (nebo pošlete nonce v AJAX požadavku) a v obsluze zavolejte check_ajax_referer( 'moje_akce' ) resp. check_admin_referer( 'moje_akce' ).",
  },
  {
    id: "php.authz.nopriv-state-change",
    title: "Veřejná (nopriv) akce měnící data",
    cwe: "CWE-862",
    severity: "medium",
    languages: ["php"],
    check: (ctx) => checkWpHandlers(ctx, "nopriv"),
    explanation:
      "Akce wp_ajax_nopriv_* / admin_post_nopriv_* je dostupná i nepřihlášeným návštěvníkům a mění data (zápis do DB, soubory, e-maily). Pokud to není záměr, může ji kdokoli zneužít, např. k zahlcení databáze nebo rozesílání e-mailů.",
    fix:
      "Ověřte, že akce opravdu má být veřejná. Pokud ne, odstraňte nopriv registraci. Pokud ano, přidejte nonce, validaci všech vstupů, omezení počtu požadavků a případně CAPTCHA.",
  },
  {
    id: "php.authz.rest-permission",
    title: "REST endpoint bez kontroly oprávnění",
    cwe: "CWE-862",
    severity: "high",
    languages: ["php"],
    check: checkRestRoutes,
    explanation:
      "REST route nemá permission_callback (nebo vrací vždy true u zápisové metody). Endpoint je pak dostupný komukoli z internetu bez přihlášení.",
    fix:
      "Doplňte 'permission_callback' => function () { return current_user_can( 'edit_posts' ); }. Pro záměrně veřejné endpointy pouze pro čtení použijte '__return_true' a zkontrolujte, že nevrací osobní údaje.",
  },
  {
    id: "php.authz.post-handler",
    title: "Zpracování formuláře bez kontroly přihlášení či oprávnění",
    cwe: "CWE-862",
    severity: "medium",
    languages: ["php"],
    check: checkGenericPostHandler,
    explanation:
      "Soubor zpracovává POST data a mění stav (databáze, soubory, e-maily), ale není v něm vidět žádná kontrola přihlášení, oprávnění ani nonce. Pokud je soubor dostupný přímo z webu, může akci spustit kdokoli.",
    fix:
      "Před zpracováním ověřte přihlášení a roli uživatele (ve WordPressu current_user_can() + check_admin_referer()), mimo WordPress ověřte session a CSRF token. Pokud kontrola probíhá v jiném souboru, označte řádek komentářem repoguard-ignore.",
  },
  {
    id: "php.upload.no-validation",
    title: "Nahrávání souborů bez ověření typu",
    cwe: "CWE-434",
    severity: "high",
    languages: ["php"],
    check: checkUploadValidation,
    explanation:
      "Soubor se ukládá pomocí move_uploaded_file() bez ověření typu a přípony. Útočník může nahrát např. .php skript a pak ho spustit přes web – tím získá plnou kontrolu nad webem a daty klientů.",
    fix:
      "Ověřte skutečný typ souboru (wp_check_filetype_and_ext() nebo finfo_file()) proti whitelistu (jpg, png, pdf…), soubor přejmenujte na náhodný název (wp_unique_filename / bin2hex(random_bytes(16))), ukládejte mimo spustitelný adresář a omezte velikost. Ve WordPressu preferujte wp_handle_upload() / media_handle_upload().",
  },
  {
    id: "php.upload.client-filename",
    title: "Použití názvu souboru od klienta v cestě",
    cwe: "CWE-22",
    severity: "high",
    languages: ["php"],
    pattern: /\$_FILES\s*\[[^\]]+\]\s*\[\s*['"]name['"]\s*\]/,
    exclude: /sanitize_file_name|wp_unique_filename|pathinfo\s*\(|wp_check_filetype/,
    refine: (line) => (/move_uploaded_file|copy\s*\(|rename\s*\(|file_put_contents|fopen/.test(line) ? {} : null),
    explanation:
      "Cílová cesta obsahuje původní název souboru od uživatele. Ten může obsahovat ../ nebo nebezpečnou příponu a přepsat jiný soubor nebo uložit spustitelný skript.",
    fix:
      "Nepoužívejte $_FILES[...]['name'] v cestě. Vygenerujte vlastní název a příponu odvoďte z ověřeného MIME typu, případně použijte sanitize_file_name() + wp_unique_filename().",
  },
  {
    id: "php.upload.test-type-disabled",
    title: "Vypnutá kontrola typu u wp_handle_upload",
    cwe: "CWE-434",
    severity: "high",
    languages: ["php"],
    pattern: /['"]test_type['"]\s*=>\s*false/,
    explanation:
      "Volba 'test_type' => false vypíná kontrolu typu nahrávaného souboru ve WordPressu. Nahrát lze pak i spustitelné soubory.",
    fix: "Odstraňte 'test_type' => false a povolené typy omezte parametrem 'mimes' (např. array( 'jpg|jpeg' => 'image/jpeg', 'png' => 'image/png' )).",
  },
  {
    id: "php.upload.dangerous-mime",
    title: "Povolení nebezpečného typu souboru k nahrání",
    cwe: "CWE-434",
    severity: "medium",
    languages: ["php"],
    pattern: /\$\w*mimes?\s*\[\s*['"](svgz?|php\d?|phtml|phar|html?|js|exe)['"]\s*\]\s*=/i,
    refine: (_line, m) => (/php|phtml|phar|exe/i.test(m[1]) ? { severity: "critical" } : {}),
    explanation:
      "Kód přidává do povolených typů nahrávaných souborů typ, který lze spustit na serveru (PHP) nebo v prohlížeči (SVG/HTML s JavaScriptem).",
    fix: "Tyto typy nepovolujte. Pokud potřebujete SVG, použijte plugin, který SVG sanitizuje (např. odstraní <script> a on* atributy), a povolte ho jen administrátorům.",
  },
  {
    id: "php.dangerous.eval",
    title: "Použití eval() / dynamického kódu",
    cwe: "CWE-95",
    severity: "critical",
    languages: ["php"],
    pattern: /(?<![\w$>:])(eval|create_function)\s*\(|\bassert\s*\(\s*\$|\bpreg_replace\s*\(\s*(['"])([^\w\s\\]).*?\3[imsxuADSUXJ]*e[imsxuADSUXJ]*\2/,
    exclude: /function\s+(eval|create_function)\s*\(/,
    explanation:
      "eval() (a podobné konstrukce) spouští řetězec jako PHP kód. Pokud se do něj jakkoli dostane vstup zvenčí, útočník může na serveru spustit libovolný kód. Je to také typický znak zadních vrátek v napadených WordPress instalacích.",
    fix:
      "Odstraňte eval(). Logiku přepište bez dynamického kódu (např. mapa povolených funkcí, json_decode() pro data, preg_replace_callback() místo modifikátoru /e). Pokud jste kód nepsali vy, zkontrolujte, zda web nebyl kompromitován.",
  },
  {
    id: "php.dangerous.exec",
    title: "Spouštění systémových příkazů",
    cwe: "CWE-78",
    severity: "high",
    languages: ["php"],
    pattern: /(?<![\w$>:])(exec|system|shell_exec|passthru|popen|proc_open|pcntl_exec)\s*\(|(=|\(|return)\s*`[^`]*\$\w+[^`]*`/,
    exclude: /function\s+\w+\s*\(/,
    refine: (line) => (PHP_INPUT.test(line) ? { severity: "critical" } : {}),
    explanation:
      "Kód spouští příkazy operačního systému. Pokud příkaz obsahuje data od uživatele, útočník může přidat vlastní příkaz (např. ; rm -rf …) a převzít server.",
    fix:
      "Pokud to jde, nahraďte volání nativní PHP funkcí. Jinak předávejte pouze pevně dané příkazy a každý argument ošetřete escapeshellarg(); vstupy ověřte whitelistem. Na produkci zvažte zakázání těchto funkcí přes disable_functions.",
  },
  {
    id: "php.dangerous.unserialize",
    title: "unserialize() nedůvěryhodných dat",
    cwe: "CWE-502",
    severity: "medium",
    languages: ["php"],
    pattern: /(?<![\w$>:])unserialize\s*\(/,
    exclude: /allowed_classes['"]?\s*=>\s*false/,
    refine: (line) => (/\$_(GET|POST|REQUEST|COOKIE)|base64_decode/.test(line) ? { severity: "critical" } : {}),
    explanation:
      "unserialize() na datech, která může ovlivnit uživatel (cookie, formulář, API), umožňuje tzv. PHP object injection – při deserializaci se mohou spustit metody tříd z pluginů a vést až ke spuštění kódu.",
    fix: "Pro výměnu dat použijte json_encode()/json_decode(). Pokud unserialize() potřebujete, volejte unserialize( $data, array( 'allowed_classes' => false ) ) a data předem podepište (hash_hmac).",
  },
  {
    id: "php.dangerous.include-input",
    title: "Include/require s cestou od uživatele",
    cwe: "CWE-98",
    severity: "critical",
    languages: ["php"],
    pattern: /\b(include|require)(_once)?\b[^;]*\$_(GET|POST|REQUEST|COOKIE)/,
    explanation:
      "Cesta k vkládanému souboru pochází od uživatele. Útočník může načíst libovolný soubor na serveru (např. wp-config.php) nebo spustit vlastní kód.",
    fix: "Nikdy nevkládejte soubory podle vstupu. Použijte pevnou mapu povolených šablon: $sablony = array( 'kontakt' => 'kontakt.php' ); a vkládejte jen hodnoty z ní.",
  },
  {
    id: "php.path-traversal",
    title: "Práce se souborem podle vstupu od uživatele",
    cwe: "CWE-22",
    severity: "high",
    languages: ["php"],
    pattern: /\b(file_get_contents|fopen|readfile|unlink|file_put_contents|file|copy|rename|opendir|scandir)\s*\([^;]*\$_(GET|POST|REQUEST|COOKIE)/,
    exclude: /basename\s*\(\s*sanitize_file_name|realpath\s*\(/,
    explanation:
      "Cesta k souboru obsahuje vstup od uživatele. Pomocí ../ lze číst nebo mazat soubory mimo zamýšlený adresář (např. konfiguraci s hesly k databázi).",
    fix: "Použijte jen název souboru (basename( sanitize_file_name( ... ) )), ověřte ho proti whitelistu a po složení cesty zkontrolujte, že realpath() začíná povoleným adresářem.",
  },
  {
    id: "php.extract-input",
    title: "extract() na uživatelském vstupu",
    cwe: "CWE-621",
    severity: "medium",
    languages: ["php"],
    pattern: /\bextract\s*\(\s*\$_(GET|POST|REQUEST|COOKIE)/,
    explanation: "extract() vytvoří proměnné podle klíčů z požadavku. Útočník tak může přepsat libovolnou proměnnou ve skriptu (např. $is_admin).",
    fix: "Nepoužívejte extract() na vstupu. Načítejte konkrétní klíče a ošetřete je: $jmeno = sanitize_text_field( wp_unslash( $_POST['jmeno'] ?? '' ) ).",
  },
  {
    id: "php.open-redirect",
    title: "Přesměrování na adresu od uživatele",
    cwe: "CWE-601",
    severity: "medium",
    languages: ["php"],
    pattern: /(\bwp_redirect\s*\(|header\s*\(\s*['"]Location\s*:)[^;]*\$_(GET|POST|REQUEST|COOKIE)/i,
    exclude: /wp_safe_redirect|wp_validate_redirect/,
    explanation: "Cíl přesměrování pochází z URL. Útočník může poslat odkaz na váš web, který oběť přesměruje na podvodnou stránku (phishing s důvěryhodnou doménou).",
    fix: "Použijte wp_safe_redirect() (povoluje jen vaši doménu) nebo cíl ověřte proti seznamu povolených adres. Po přesměrování volejte exit.",
  },
  {
    id: "php.tls.verify-disabled",
    title: "Vypnuté ověřování TLS certifikátu",
    cwe: "CWE-295",
    severity: "medium",
    languages: ["php"],
    pattern: /CURLOPT_SSL_VERIFY(PEER|HOST)\s*,\s*(false|0)\b|['"]sslverify['"]\s*=>\s*false/i,
    explanation: "Spojení přes HTTPS neověřuje certifikát serveru. Kdokoli na cestě (např. veřejná Wi-Fi, kompromitovaný router) může komunikaci odposlechnout a měnit – včetně API klíčů a osobních údajů.",
    fix: "Odstraňte vypnutí ověřování ('sslverify' => true je výchozí). Pokud server používá vlastní certifikát, nastavte cestu k CA přes CURLOPT_CAINFO.",
  },
  {
    id: "php.crypto.weak-password-hash",
    title: "Slabé hashování hesel (md5/sha1)",
    cwe: "CWE-916",
    severity: "high",
    languages: ["php"],
    pattern: /\b(md5|sha1)\s*\([^;]*(pass|heslo|pwd)/i,
    explanation: "Hesla hashovaná md5/sha1 lze po úniku databáze prolomit během minut. Uživatelé registru často používají stejné heslo i jinde.",
    fix: "Použijte password_hash( $heslo, PASSWORD_DEFAULT ) a password_verify(). Ve WordPressu wp_hash_password() / wp_check_password(). Stávající hashe při příštím přihlášení přehashujte.",
  },
  {
    id: "php.crypto.weak-random",
    title: "Předvídatelná náhodnost pro tokeny",
    cwe: "CWE-338",
    severity: "medium",
    languages: ["php"],
    pattern: /\b(rand|mt_rand|uniqid|lcg_value|str_shuffle)\s*\(/,
    refine: (line) => (/token|nonce|pass|heslo|secret|key|reset|otp|code|kod/i.test(line) ? {} : null),
    explanation: "Funkce rand()/mt_rand()/uniqid() nejsou kryptograficky bezpečné. Tokeny pro reset hesla nebo ověření e-mailu z nich vytvořené lze uhodnout.",
    fix: "Použijte random_bytes() / random_int(), např. bin2hex( random_bytes( 32 ) ). Ve WordPressu wp_generate_password( 32, false ).",
  },
  {
    id: "php.info-disclosure",
    title: "Zobrazování ladicích informací",
    cwe: "CWE-209",
    severity: "low",
    languages: ["php"],
    pattern: /\bphpinfo\s*\(|ini_set\s*\(\s*['"]display_errors['"]\s*,\s*['"]?(1|on|true)|define\s*\(\s*['"]WP_DEBUG_DISPLAY['"]\s*,\s*true|error_reporting\s*\(\s*E_ALL\s*\)\s*;\s*ini_set\s*\(\s*['"]display_errors/i,
    explanation: "Ladicí výstup (phpinfo, zobrazování chyb) prozrazuje cesty na serveru, verze software a někdy i obsah proměnných. Útočníkovi to usnadňuje hledání slabin.",
    fix: "Na produkci chyby nezobrazujte, jen logujte: WP_DEBUG_DISPLAY false, WP_DEBUG_LOG true, display_errors Off. phpinfo() odstraňte.",
  },
];
