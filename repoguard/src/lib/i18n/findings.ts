import type { Locale } from "./locale";

/**
 * The finding fields this module reads. A structural subset of the Prisma
 * `Finding` row (which is assignable to it), so the English catalog can be
 * reused outside the database layer — e.g. by the CLI — without depending on
 * the generated Prisma client.
 */
export interface FindingInput {
  kind: string;
  ruleId: string;
  severity: string;
  title: string;
  explanation: string;
  fix: string;
  file?: string | null;
  installedVersion?: string | null;
  fixedVersion?: string | null;
  ecosystem?: string | null;
  packageName?: string | null;
  advisoryId?: string | null;
  aliases?: string | null;
}

/**
 * English text for every finding. Czech stays as the text stored on each finding
 * (already produced and tested by the scanner); English is this additive layer,
 * so switching locale never changes Czech behaviour. A test asserts every rule id
 * has an entry here, so findings are never shown half-translated.
 */

export interface FindingText {
  title: string;
  explanation: string;
  fix: string;
}

type RuleText = { title: string; explanation: string; fix: string };

const ROTATE_EN =
  "Invalidate the key immediately and issue a new one (deleting it from the code is not enough — it stays in git history). Store the new value in an environment variable or a secrets manager and read it in code (getenv(), process.env). History can be cleaned with git filter-repo or BFG.";
const CLEANUP_EN =
  "Do not just delete this line. This is a typical sign of a hacked site: find all such files, compare the site with a clean install from the official source, reinstall WordPress core, plugins and themes, change all passwords (DB, admin accounts, FTP/SSH, hosting) and the security keys in wp-config.php, and review the list of administrators. If unsure of the scope, get a WordPress cleanup specialist.";
const REMOVE_FROM_GIT_EN =
  "Remove the file from the repository (git rm --cached <file>) and add it to .gitignore. If it was deployed, delete it from the server too and confirm it was not publicly reachable.";

export const RULE_EN: Record<string, RuleText> = {
  // --- PHP ---
  "php.sqli": {
    title: "SQL injection – unparameterised query",
    explanation:
      "A SQL query is built by concatenating strings with variables. If user input reaches the variable, an attacker can change the meaning of the query and read, modify or delete data (such as owner accounts or bird records).",
    fix: "Use a parameterised query. In WordPress: $wpdb->get_results( $wpdb->prepare( \"SELECT * FROM {$wpdb->prefix}table WHERE id = %d\", $id ) ). In plain PHP use PDO with prepare() and bindValue()/execute([...]). Whitelist column names and sort direction.",
  },
  "php.xss.echo-input": {
    title: "Output of user input without escaping (XSS)",
    explanation:
      "A value from the URL, a form or a cookie is printed straight into HTML. An attacker can craft a link that runs JavaScript in the victim's browser (e.g. steals an admin's session).",
    fix: "Always escape by context before output: esc_html() for text, esc_attr() for attributes, esc_url() for links (outside WordPress, htmlspecialchars($v, ENT_QUOTES, 'UTF-8')). Also sanitise the input on read.",
  },
  "php.input.unsanitized": {
    title: "Unsanitised input from a form / URL",
    explanation:
      "User data is used without validation or sanitisation. Even if this line is not directly exploitable, the untreated value may later reach HTML, a SQL query or the file system.",
    fix: "Sanitise input on read according to the expected type: sanitize_text_field( wp_unslash( $_POST['name'] ) ), absint( $_GET['id'] ), sanitize_email() etc. Outside WordPress use filter_input(). Validate enum values with a whitelist (in_array(..., true)).",
  },
  "php.authz.ajax-capability": {
    title: "AJAX/admin-post action without a capability check",
    explanation:
      "An action registered via wp_ajax_* or admin_post_* is available to every logged-in user — including an ordinary subscriber or an animal owner with an account. Without a capability check anyone with an account can run an admin operation. Note: is_admin() does NOT check permissions.",
    fix: "At the start of the handler check the capability: if ( ! current_user_can( 'manage_options' ) ) { wp_send_json_error( 'Forbidden', 403 ); } — pick the narrowest suitable capability.",
  },
  "php.authz.ajax-nonce": {
    title: "State-changing action without nonce verification (CSRF)",
    explanation:
      "The action changes data but does not verify a nonce. An attacker can lure a logged-in user to a foreign page that submits the action on their behalf (Cross-Site Request Forgery).",
    fix: "Add wp_nonce_field( 'my_action' ) to the form (or send the nonce in the AJAX request) and call check_ajax_referer( 'my_action' ) / check_admin_referer( 'my_action' ) in the handler.",
  },
  "php.authz.nopriv-state-change": {
    title: "Public (nopriv) action that changes data",
    explanation:
      "A wp_ajax_nopriv_* / admin_post_nopriv_* action is available to unauthenticated visitors and changes data (DB writes, files, e-mails). If unintended, anyone can abuse it, e.g. to flood the database or send e-mails.",
    fix: "Confirm the action really should be public. If not, remove the nopriv registration. If yes, add a nonce, validate all input, rate-limit and consider a CAPTCHA.",
  },
  "php.authz.rest-permission": {
    title: "REST endpoint without a permission check",
    explanation:
      "A REST route has no permission_callback (or always returns true for a write method). The endpoint is then reachable by anyone on the internet without authentication.",
    fix: "Add 'permission_callback' => function () { return current_user_can( 'edit_posts' ); }. For intentionally public read-only endpoints use '__return_true' and make sure no personal data is returned.",
  },
  "php.authz.post-handler": {
    title: "Form processing without an auth or permission check",
    explanation:
      "The file processes POST data and changes state (database, files, e-mails), but no sign-in, permission or nonce check is visible. If the file is reachable directly, anyone can trigger the action.",
    fix: "Before processing, check sign-in and role (in WordPress current_user_can() + check_admin_referer()); outside WordPress verify the session and a CSRF token. If the check lives in another file, mark the line with a repoguard-ignore comment.",
  },
  "php.upload.no-validation": {
    title: "File upload without type validation",
    explanation:
      "A file is saved with move_uploaded_file() without checking its type and extension. An attacker can upload a .php script and run it via the web, gaining full control of the site and client data.",
    fix: "Verify the real file type (wp_check_filetype_and_ext() or finfo_file()) against a whitelist (jpg, png, pdf…), rename the file to a random name, store it outside the executable directory and limit the size. In WordPress prefer wp_handle_upload() / media_handle_upload().",
  },
  "php.upload.client-filename": {
    title: "Using the client-supplied filename in a path",
    explanation:
      "The target path contains the original filename from the user. It may contain ../ or a dangerous extension and overwrite another file or store an executable script.",
    fix: "Do not use $_FILES[...]['name'] in the path. Generate your own name and derive the extension from the verified MIME type, or use sanitize_file_name() + wp_unique_filename().",
  },
  "php.upload.test-type-disabled": {
    title: "File type check disabled in wp_handle_upload",
    explanation: "'test_type' => false disables the upload file-type check in WordPress, so executable files can be uploaded too.",
    fix: "Remove 'test_type' => false and restrict allowed types with the 'mimes' parameter (e.g. array( 'jpg|jpeg' => 'image/jpeg', 'png' => 'image/png' )).",
  },
  "php.upload.dangerous-mime": {
    title: "Allowing a dangerous upload file type",
    explanation: "The code adds a file type that can execute on the server (PHP) or in the browser (SVG/HTML with JavaScript) to the list of allowed uploads.",
    fix: "Do not allow these types. If you need SVG, use a plugin that sanitises it (removes <script> and on* attributes) and allow it only for administrators.",
  },
  "php.dangerous.eval": {
    title: "Use of eval() / dynamic code",
    explanation:
      "eval() (and similar constructs) runs a string as PHP code. If external input reaches it, an attacker can run arbitrary code on the server. It is also a classic sign of a backdoor in hacked WordPress installs.",
    fix: "Remove eval(). Rewrite the logic without dynamic code (a map of allowed functions, json_decode() for data, preg_replace_callback() instead of the /e modifier). If you did not write the code, check whether the site was compromised.",
  },
  "php.dangerous.exec": {
    title: "Running system commands",
    explanation: "The code runs operating-system commands. If a command contains user data, an attacker can append their own command (e.g. ; rm -rf …) and take over the server.",
    fix: "Replace the call with a native PHP function where possible. Otherwise pass only fixed commands and escape every argument with escapeshellarg(); validate input with a whitelist. In production consider disabling these functions via disable_functions.",
  },
  "php.dangerous.unserialize": {
    title: "unserialize() of untrusted data",
    explanation: "unserialize() on data an attacker can influence (cookie, form, API) enables PHP object injection — deserialisation can invoke methods of plugin classes and even lead to code execution.",
    fix: "Use json_encode()/json_decode() for data exchange. If you need unserialize(), call unserialize( $data, array( 'allowed_classes' => false ) ) and sign the data beforehand (hash_hmac).",
  },
  "php.dangerous.include-input": {
    title: "Include/require with a user-controlled path",
    explanation: "The path of the included file comes from the user. An attacker can load any file on the server (e.g. wp-config.php) or run their own code.",
    fix: "Never include files based on input. Use a fixed map of allowed templates: $templates = array( 'contact' => 'contact.php' ); and include only values from it.",
  },
  "php.path-traversal": {
    title: "File operation driven by user input",
    explanation: "A file path contains user input. Using ../ an attacker can read or delete files outside the intended directory (e.g. the config with DB passwords).",
    fix: "Use only the filename (basename( sanitize_file_name( ... ) )), check it against a whitelist, and after composing the path confirm realpath() starts with the allowed directory.",
  },
  "php.extract-input": {
    title: "extract() on user input",
    explanation: "extract() creates variables from request keys. An attacker can thus overwrite any variable in the script (e.g. $is_admin).",
    fix: "Do not use extract() on input. Read specific keys and sanitise them: $name = sanitize_text_field( wp_unslash( $_POST['name'] ?? '' ) ).",
  },
  "php.open-redirect": {
    title: "Redirect to a user-supplied address",
    explanation: "The redirect target comes from the URL. An attacker can send a link to your site that redirects the victim to a fraudulent page (phishing under a trusted domain).",
    fix: "Use wp_safe_redirect() (allows only your domain) or validate the target against an allowlist. Call exit after the redirect.",
  },
  "php.tls.verify-disabled": {
    title: "TLS certificate verification disabled",
    explanation: "An HTTPS connection does not verify the server certificate. Anyone on the path (public Wi-Fi, a compromised router) can intercept and alter the traffic — including API keys and personal data.",
    fix: "Remove the disabling of verification ('sslverify' => true is the default). If the server uses a custom certificate, set the CA path via CURLOPT_CAINFO.",
  },
  "php.crypto.weak-password-hash": {
    title: "Weak password hashing (md5/sha1)",
    explanation: "Passwords hashed with md5/sha1 can be cracked within minutes after a database leak. Registry users often reuse the same password elsewhere.",
    fix: "Use password_hash( $password, PASSWORD_DEFAULT ) and password_verify(). In WordPress wp_hash_password() / wp_check_password(). Re-hash existing hashes on next login.",
  },
  "php.crypto.weak-random": {
    title: "Predictable randomness for tokens",
    explanation: "rand()/mt_rand()/uniqid() are not cryptographically secure. Password-reset or e-mail-verification tokens built from them can be guessed.",
    fix: "Use random_bytes() / random_int(), e.g. bin2hex( random_bytes( 32 ) ). In WordPress wp_generate_password( 32, false ).",
  },
  "php.info-disclosure": {
    title: "Debug information disclosure",
    explanation: "Debug output (phpinfo, error display) reveals server paths, software versions and sometimes variable contents, making it easier for an attacker to find weaknesses.",
    fix: "Do not display errors in production, only log them: WP_DEBUG_DISPLAY false, WP_DEBUG_LOG true, display_errors Off. Remove phpinfo().",
  },
  // --- JS ---
  "js.sqli": {
    title: "SQL injection – query built from strings",
    explanation: "A SQL query is built with a template literal or string concatenation. If a value comes from the user, an attacker can change the query and read or modify data.",
    fix: "Use parameters: db.query('SELECT * FROM users WHERE id = $1', [id]) (pg) or '?' (mysql2). In Prisma use $queryRaw`... ${id}` (tagged template, safe) instead of $queryRawUnsafe. Whitelist column names.",
  },
  "js.dangerous.eval": {
    title: "Use of eval() / new Function()",
    explanation: "A string is run as JavaScript. If user input reaches it, an attacker runs their own code — in the browser (XSS) or on the server (Node.js) with the app's privileges.",
    fix: "Remove eval()/new Function(). Use JSON.parse() for data, a map of functions to pick an action, and call setTimeout with a function, not a string.",
  },
  "js.dangerous.exec": {
    title: "Running shell commands with a built string",
    explanation: "A shell command is built from variables. If they contain user input, extra commands can be appended (; && |) and the server taken over.",
    fix: "Use execFile()/spawn() with an array of arguments and without shell: true, e.g. execFile('convert', [input, output]). Validate input with a whitelist.",
  },
  "js.xss.html-sink": {
    title: "Injecting HTML without sanitisation (XSS)",
    explanation: "HTML built from variables is inserted into the page. If they contain user data (an animal's name, a note, a URL parameter), an attacker can inject a malicious script.",
    fix: "Use textContent / innerText for text (in React just {variable}). If you must insert HTML, sanitise it first with DOMPurify: el.innerHTML = DOMPurify.sanitize(html).",
  },
  "js.xss.reflected": {
    title: "Returning request input directly in the response",
    explanation: "The server returns a request value back as HTML without escaping. An attacker can craft a link that runs a script in the victim's browser.",
    fix: "Return JSON (res.json()) or escape the value (e.g. with escape-html) and set the correct Content-Type.",
  },
  "js.path-traversal": {
    title: "File operation driven by user input",
    explanation: "A file path contains user input. Using ../ an attacker can read or overwrite files outside the intended directory (e.g. .env with keys).",
    fix: "Use path.basename() and a whitelist of allowed files. After building the path, confirm path.resolve(result) starts with the allowed directory.",
  },
  "js.nosql-injection": {
    title: "NoSQL injection – request object in the query",
    explanation: "A whole request object is passed as a MongoDB filter. An attacker can send operators like {\"$ne\": null} to bypass sign-in or read other users' data.",
    fix: "Build the filter from individual validated fields: { email: String(req.body.email) }. Validate input with a schema (zod, joi) and consider mongo-sanitize.",
  },
  "js.open-redirect": {
    title: "Redirect to a user-supplied address",
    explanation: "The redirect target comes from the URL. Your site can then be abused to redirect victims to fraudulent pages.",
    fix: "Allow only relative paths starting with a single '/', or addresses from an allowlist of domains.",
  },
  "js.tls.verify-disabled": {
    title: "TLS certificate verification disabled",
    explanation: "The HTTPS connection does not verify the certificate. An attacker on the network can read and alter the traffic.",
    fix: "Remove rejectUnauthorized: false / NODE_TLS_REJECT_UNAUTHORIZED=0. For a custom CA use the ca option or NODE_EXTRA_CA_CERTS.",
  },
  "js.jwt.none-alg": {
    title: "JWT allows the 'none' algorithm",
    explanation: "Allowing the 'none' algorithm means a token need not be signed — anyone can forge a token for any user.",
    fix: "Specify only a concrete algorithm when verifying: jwt.verify(token, secret, { algorithms: ['HS256'] }).",
  },
  "js.jwt.hardcoded-secret": {
    title: "Hardcoded JWT signing key",
    explanation: "The token signing key is in the code. Anyone with access to the repository (or a leak of it) can forge a valid token for any user.",
    fix: "Load the key from an environment variable (process.env.JWT_SECRET), generate a new random key (openssl rand -base64 32) and treat the old one as compromised.",
  },
  "js.crypto.weak-random": {
    title: "Math.random() for security tokens",
    explanation: "Math.random() is not cryptographically secure. Tokens built from it can be guessed.",
    fix: "Use crypto.randomBytes(32).toString('hex') (Node.js) or crypto.getRandomValues() / crypto.randomUUID() in the browser.",
  },
  "js.upload.no-filter": {
    title: "File upload (multer) without a type filter",
    explanation: "Multer accepts arbitrary files without a type check. Executable or HTML files can be uploaded and then served to other users.",
    fix: "Set a fileFilter with a whitelist of MIME types and extensions, limits.fileSize, random file names, and store outside the public directory.",
  },
  "js.cors.credentials-wildcard": {
    title: "CORS allows any origin with cookies",
    explanation: "CORS is set so any site can send requests with the logged-in user's cookies and read the responses.",
    fix: "Instead of origin: true / '*' list the specific allowed domains.",
  },
  // --- secrets ---
  "secret.private-key": { title: "Private key in the repository", explanation: "A cryptographic private key is committed to the repository. Anyone with repository access can impersonate the server or decrypt traffic.", fix: ROTATE_EN },
  "secret.aws": { title: "AWS access key", explanation: "An access key to an external service is stored in the code. Anyone with access to the repository — including its history, forks or a leaked backup — can abuse it on your account.", fix: ROTATE_EN },
  "secret.github": { title: "GitHub token", explanation: "A GitHub access token is stored in the code and grants access to repositories on your account.", fix: ROTATE_EN },
  "secret.stripe": { title: "Stripe live key", explanation: "A live Stripe secret key is in the code; it can move real money and read customer data.", fix: ROTATE_EN },
  "secret.stripe-test": { title: "Stripe test key", explanation: "A Stripe test key is in the code. It is only for the test environment, but should still not be committed.", fix: ROTATE_EN },
  "secret.slack": { title: "Slack token / webhook", explanation: "A Slack token or webhook is in the code and allows posting to or reading your workspace.", fix: ROTATE_EN },
  "secret.google": { title: "Google API key", explanation: "A Google API key is stored in the code and can be abused on your account (quota, billing).", fix: ROTATE_EN },
  "secret.sendgrid": { title: "SendGrid API key", explanation: "A SendGrid key is in the code and allows sending e-mail in your name.", fix: ROTATE_EN },
  "secret.mailgun": { title: "Mailgun API key", explanation: "A Mailgun key is in the code and allows sending e-mail in your name.", fix: ROTATE_EN },
  "secret.openai": { title: "AI service API key", explanation: "An API key to an AI service is in the code and can be abused on your account (cost).", fix: ROTATE_EN },
  "secret.wp-db-password": {
    title: "Database password in wp-config.php",
    explanation: "wp-config.php with a real database password is in the repository. With it, all site data — user accounts, orders, patient records — can be accessed.",
    fix: "Remove wp-config.php from git (git rm --cached wp-config.php, add it to .gitignore), keep only wp-config-sample.php in the repository. Change the database password and read it from the environment: define( 'DB_PASSWORD', getenv( 'DB_PASSWORD' ) ).",
  },
  "secret.wp-salts": {
    title: "WordPress security keys (salts) in the repository",
    explanation: "Knowing these keys lets an attacker forge WordPress login cookies and sign in as any user, including an administrator.",
    fix: "Generate new keys (https://api.wordpress.org/secret-key/1.1/salt/), store them outside the repository (environment variables or a file outside git) and remove wp-config.php from git.",
  },
  "secret.connection-string": {
    title: "Credentials in a connection string",
    explanation: "A connection string to a database or service contains a password. Whoever sees the repository has access to that service.",
    fix: ROTATE_EN,
  },
  "secret.generic": {
    title: "Hardcoded password or key",
    explanation: "A hardcoded password, API key or token is in the code. Secrets in the repository easily reach the wrong hands (code sharing, forks, backups) and remain in git history after deletion.",
    fix: ROTATE_EN,
  },
  "secret.env-file": {
    title: "A .env file is part of the repository",
    explanation: "A .env file typically holds passwords and API keys and should not be versioned. Treat every value in it as leaked.",
    fix: "Remove the file from git (git rm --cached .env), add .env to .gitignore, keep only a .env.example with empty values, and rotate every secret in it.",
  },
  // --- agent ---
  "agent.perm.bypass": {
    title: "AI agent has action confirmation disabled",
    explanation: "The configuration lets an AI agent (e.g. Claude Code) run commands, write files and make network requests without human confirmation. A single malicious instruction — hidden in a dependency's README, an issue or a web page the agent reads (prompt injection) — could then delete data, exfiltrate secrets or push code. Note: is_admin() does NOT verify permissions.",
    fix: "Do not use bypassPermissions / --dangerously-skip-permissions in shared config. Allow only specific safe commands (e.g. \"Bash(npm test)\", \"Bash(git status)\"); leave the rest to confirmation. For autonomous runs, run the agent in an isolated container without access to production keys.",
  },
  "agent.perm.wildcard": {
    title: "Overly broad AI agent permissions",
    explanation: "permissions.allow contains unrestricted access (e.g. \"Bash(*)\" or \"Write\"). The agent may run any command or overwrite any file without asking, including .env or server config.",
    fix: "Replace wildcards with specific commands and paths, e.g. \"Bash(npm run test:*)\", \"Edit(src/**)\". Keep everything else in ask mode.",
  },
  "agent.perm.dangerous-allow": {
    title: "AI agent may run risky commands without confirmation",
    explanation: "The auto-allowed commands include destructive or network operations (rm -rf, sudo, git push --force, curl, ssh…). These can irreversibly delete data or exfiltrate files.",
    fix: "Remove these commands from permissions.allow and add them to permissions.deny (or ask), e.g. \"Bash(rm -rf:*)\", \"Bash(git push --force:*)\", \"Bash(curl:*)\".",
  },
  "agent.perm.no-deny-secrets": {
    title: "Agent is not denied reading secret files",
    explanation: "The configuration allows the agent to act but does not stop it reading files with passwords and keys (.env, *.pem, wp-config.php). Under prompt injection, the contents of these files are the first thing an attacker wants.",
    fix: "Add permissions.deny, e.g. [\"Read(./.env)\", \"Read(./.env.*)\", \"Read(./**/*.pem)\", \"Read(./wp-config.php)\", \"Read(./secrets/**)\"].",
  },
  "agent.settings.local-committed": {
    title: "Personal agent settings in the repository",
    explanation: ".claude/settings.local.json is meant for personal local settings and usually accumulates broad permissions. Committing it spreads those permissions to everyone who clones the repository.",
    fix: "Remove the file from git (git rm --cached .claude/settings.local.json) and add it to .gitignore. Put shared rules in .claude/settings.json.",
  },
  "agent.hook.remote-exec": {
    title: "A hook downloads and runs code from the internet",
    explanation: "An agent hook (run automatically on its events) downloads a script from the internet and runs it. Whoever controls that address can run arbitrary code on every developer's machine. The same pattern was used in recent npm supply-chain attacks.",
    fix: "Store the script in the repository (e.g. .claude/hooks/), review its content and have the hook call it locally. If downloading is required, verify the checksum (sha256) of the downloaded file.",
  },
  "agent.hook.reverse-shell": {
    title: "A hook contains a remote-shell pattern",
    explanation: "The configuration contains a construct typical of a reverse shell (/dev/tcp, nc -e, mkfifo + nc), which gives an attacker interactive access to the machine. It virtually never appears in legitimate agent configuration.",
    fix: "Remove the line and find who added it and when (git log -p). If no one on the team added it deliberately, treat the machines the agent ran on as compromised and rotate their access keys.",
  },
  "agent.hook.credential-access": {
    title: "A hook reads credentials or sends them out",
    explanation: "The hook accesses SSH/AWS keys or the system keychain, or sends data (environment variables, file contents) to a remote server. Hooks run automatically and silently, making them an ideal place for secret exfiltration.",
    fix: "Remove credential access from hooks. If a hook reports something (e.g. a notification), send only the necessary non-sensitive data to an endpoint you control over HTTPS.",
  },
  "agent.hook.anti-forensics": {
    title: "A hook deletes history or logs",
    explanation: "The hook deletes command history or system logs, which is typical of hiding traces of malicious activity.",
    fix: "Remove this command and check the origin of the change in git history.",
  },
  "agent.hook.global-install": {
    title: "A hook installs global packages",
    explanation: "The hook installs packages on every run (often without a pinned version). A compromised new version of a package then reaches every developer machine automatically.",
    fix: "Move installation into a one-off setup script with pinned versions (lockfile), or remove it entirely.",
  },
  "agent.hook.silent-failure": {
    title: "A security hook suppresses errors",
    explanation: "A PreToolUse hook (a check before the agent's action) always ends successfully (|| true, 2>/dev/null). When the check fails, the agent proceeds as if everything were fine — the protection silently stops working.",
    fix: "Let the hook exit with a non-zero code on failure (code 2 for a blocking check) so the agent stops the action.",
  },
  "agent.mcp.unpinned": {
    title: "MCP server installed without a pinned version",
    explanation: "An MCP server is launched via npx/uvx without a package version. The latest version is fetched on each start — if an attacker takes over the package or the author's account, their code runs with your AI agent's access to files and keys.",
    fix: "Pin the exact version, e.g. \"args\": [\"-y\", \"@modelcontextprotocol/server-filesystem@2025.8.21\"], and update it deliberately after reviewing the changelog.",
  },
  "agent.mcp.hardcoded-env": {
    title: "Secret key directly in MCP server config",
    explanation: "The MCP server's env section contains an API key or token in plain text. The configuration is in the repository, so the key is visible to everyone with code access.",
    fix: "Use an environment variable reference (e.g. \"GITHUB_TOKEN\": \"${GITHUB_TOKEN}\") and invalidate the exposed key, issuing a new one.",
  },
  "agent.mcp.insecure-transport": {
    title: "MCP server over an insecure or public connection",
    explanation: "The MCP server communicates over unencrypted HTTP or listens on all interfaces (0.0.0.0). Anyone on the network can then eavesdrop or connect and control the agent's tools.",
    fix: "Use HTTPS for remote servers and bind local servers only to 127.0.0.1.",
  },
  "agent.mcp.sensitive-args": {
    title: "MCP server has access to sensitive files or the whole disk",
    explanation: "An MCP server (e.g. filesystem) was given access to the disk root, the home directory or key files. The agent — and an attacker via prompt injection — can then read anything on the machine.",
    fix: "Restrict the server to the project directory (e.g. \"./\" or a specific subdirectory) and do not pass it sensitive files.",
  },
  "agent.mcp.shell-metachar": {
    title: "Shell operators in MCP server arguments",
    explanation: "The MCP server is launched via a shell, or its arguments contain command chaining. It is then hard to tell what actually runs, and an extra command is easy to smuggle in.",
    fix: "Launch the server binary directly with a simple argument list, without sh -c and without &&, |, ;.",
  },
  "agent.vscode.folder-open-task": {
    title: "VS Code task runs automatically on folder open",
    explanation: "A task with \"runOn\": \"folderOpen\" runs by itself as soon as someone opens the repository in VS Code (or a VS Code-based AI editor). Attackers abuse this to infect developers via booby-trapped repositories.",
    fix: "Remove runOn: folderOpen; run tasks manually. Keep Workspace Trust enabled in VS Code.",
  },
  "agent.prompt.hidden-unicode": {
    title: "Hidden characters in AI instructions",
    explanation: "A file with instructions for an AI agent contains invisible characters (zero-width, text-direction overrides or tag characters). A human reviewing it does not see them, but the AI model reads them — this is how hidden instructions are smuggled into CLAUDE.md or Cursor rules (prompt injection).",
    fix: "Remove the invisible characters (e.g. in an editor with visible whitespace, or: perl -CSD -pi -e 's/[\\x{200B}-\\x{200F}\\x{202A}-\\x{202E}\\x{2060}-\\x{2069}\\x{E0000}-\\x{E007F}]//g' FILE) and check git history for who added them.",
  },
  "agent.prompt.injection-phrase": {
    title: "Phrasing typical of prompt injection",
    explanation: "A file with AI instructions contains phrasing attackers use to override the model's behaviour (\"ignore previous instructions\", a fake system prompt). It does not appear in legitimate project rules.",
    fix: "Remove the line and check the origin of the change (git log -p). Protect instruction files with CODEOWNERS and mandatory review.",
  },
  "agent.prompt.auto-run": {
    title: "Instructions push the agent to act without confirmation",
    explanation: "The agent instructions require it to act without user confirmation, bypassing the last safeguard against mistakes and prompt injection from content the agent reads.",
    fix: "Phrase the rules so that risky actions (deletion, push, deployment, working with secrets) always require confirmation.",
  },
  "agent.prompt.remote-exec": {
    title: "Agent instructions download and run code",
    explanation: "The instruction file tells the agent to download a script from the internet and run it. The agent does so with your privileges, and the content at that address can change at any time.",
    fix: "Store needed scripts in the repository and reference a local path, or verify the checksum of the downloaded file.",
  },
  "agent.prompt.suppress-findings": {
    title: "Instructions suppress security warnings",
    explanation: "The instructions ask the agent to hide security problems or warnings. Such a rule can hide a malicious change from code review.",
    fix: "Remove the instruction and investigate why and by whom it was added.",
  },
  "agent.prompt.hidden-comment": {
    title: "Hidden HTML comment with AI instructions",
    explanation: "An HTML comment is not shown in the Markdown preview, but an AI agent reads it. Instructions in it can influence the agent without the knowledge of the people reviewing the file.",
    fix: "Move legitimate instructions into visible text and remove the rest of the comments.",
  },
  "agent.prompt.encoded-blob": {
    title: "Encoded content in AI instructions",
    explanation: "The instruction file contains a long block of encoded data (base64). A human cannot read it, but the model can — it may hide an instruction.",
    fix: "Decode the content and check what it contains. AI instructions should hold only readable text.",
  },
  "agent.subagent.unrestricted-tools": {
    title: "Subagent inherits all tools",
    explanation: "The subagent definition has no tools field, so it inherits all of the main agent's tools, including running commands and writing files. A specialised agent (e.g. for review) usually does not need that.",
    fix: "Add only the needed tools to the frontmatter, e.g. \"tools: Read, Grep, Glob\" for an agent that only reads code.",
  },
  // --- CI ---
  "ci.pull-request-target-checkout": {
    title: "pull_request_target runs code from a foreign pull request",
    explanation: "A workflow triggered via pull_request_target has access to repository secrets and write permission, yet it checks out code from a pull request anyone can open. Code from a foreign fork then runs with your secrets.",
    fix: "Build and test foreign PRs with the pull_request event (no secrets). If you need pull_request_target, do not check out the PR head, or run it only after approval (a label / an environment with required review).",
  },
  "ci.script-injection": {
    title: "Untrusted GitHub text inserted into the shell",
    explanation: "A run: step inserts text anyone can control (issue title, PR body, commit message, branch name) straight into a command. Specially crafted text executes as a shell command with access to the workflow's secrets.",
    fix: "Pass the value through an environment variable and use it quoted in the shell: env: TITLE: ${{ github.event.issue.title }} then echo \"$TITLE\".",
  },
  "ci.write-all-permissions": {
    title: "Workflow has full write permissions",
    explanation: "GITHUB_TOKEN was granted write permission to every part of the repository. If any step (or action used) is compromised, an attacker can change code, releases and settings.",
    fix: "Set minimal permissions, e.g. permissions: contents: read, and grant write only to the individual jobs that need it.",
  },
  "ci.unpinned-action": {
    title: "Third-party action without a pinned version",
    explanation: "A third-party action is referenced by a branch or a moving tag. If the author (or an attacker with their account) moves the tag, different code runs in your CI with access to secrets.",
    fix: "Reference actions by full commit SHA (e.g. uses: owner/action@3f1c…  # v2.1.0) and let Dependabot propose updates.",
  },
  // --- malware ---
  "malware.obfuscated-exec": { title: "Obfuscated executed code (sign of a webshell)", explanation: "Code is unpacked from base64/gzip/rot13 before execution. This is how webshell or backdoor content is hidden from plain reading. It virtually never appears in legitimate plugin or theme code.", fix: CLEANUP_EN },
  "malware.request-callback": { title: "Function call driven by request input (backdoor)", explanation: "The name of the called function comes straight from the request. With a single call an attacker runs any function on the server — a classic backdoor construct used to control a hacked site.", fix: CLEANUP_EN },
  "malware.variable-function-input": { title: "Indirect function call from input (obfuscated backdoor)", explanation: "The code assembles a variable or function name at runtime (variable variables, $GLOBALS with a dynamic key). This is used to hide that a dangerous function is called or request input is used.", fix: CLEANUP_EN },
  "malware.charcode-obfuscation": { title: "Function name assembled from character codes (obfuscation)", explanation: "A function name is assembled character by character (chr(...).chr(...)) or in hex to hide what is called. It is a typical trick for hiding eval/exec in a webshell.", fix: CLEANUP_EN },
  "malware.long-encoded-blob": { title: "Long encoded block passed to a decoder", explanation: "The code contains a long encoded string decoded at runtime. This is how a webshell body or malicious data is stored. Legitimate code rarely decodes such large base64 blocks inline.", fix: CLEANUP_EN },
  "malware.remote-fetch-exec": { title: "Download and execution of code from a remote address", explanation: "The code downloads content from a remote address and runs it (or includes it as a file). The site's behaviour is then controlled from a foreign server — the attacker can change what runs at any time.", fix: CLEANUP_EN },
  "malware.backdoor-admin": { title: "Hidden creation of an administrator account", explanation: "The code creates a user with the administrator role and a hardcoded name/password. Attackers leave such a hidden admin account in a hacked site to regain access even after a password change.", fix: "Confirm this account is supposed to exist. If not, it is a backdoor: delete suspicious administrators under Users, remove this code and do a full cleanup. " + CLEANUP_EN },
  "malware.php-in-uploads": { title: "Executable PHP file in the uploads directory", explanation: "There is a PHP script in the uploads directory. Only images and documents belong there — a PHP file does not and is a very strong sign of compromise (an uploaded webshell).", fix: "Review and remove the file. Disable PHP execution in the uploads directory (via .htaccess in Apache, in the server config in Nginx) and check how it got there (the upload rule). " + CLEANUP_EN },
  "malware.suspicious-filename": { title: "Suspicious filename", explanation: "The filename matches patterns used by uploaded webshells (double extension like image.jpg.php, names imitating WordPress core, random-looking names). It may not be a compromise, but the file needs review.", fix: "Check where the file comes from and what it contains. If it belongs to no plugin or theme, remove it and run a compromise check. " + CLEANUP_EN },
  "malware.hidden-eval-globals": { title: "Code execution via superglobals with a dynamic key", explanation: "The code assembles a call via $GLOBALS with a variable key, or unpacks input into variables (extract/parse_str). Both patterns are used to hide backdoors and to overwrite variables from the attacker's input.", fix: CLEANUP_EN },
  // --- web hardening (content rules) ---
  "web.htaccess-dir-listing": { title: "Directory listing is enabled (.htaccess)", explanation: "The Options +Indexes directive enables directory listing. When a directory has no index file, the server shows a list of all files — an attacker can find backups, logs or uploads.", fix: "Replace with Options -Indexes, or remove the line (listing is then off)." },
  "web.htaccess-display-errors": { title: "PHP error display enabled in .htaccess", explanation: "Displaying errors in production reveals server paths and sometimes variable contents, making an attacker's job easier.", fix: "Set php_flag display_errors off and only log errors outside the web root." },
  "web.wpconfig-debug": { title: "Debug mode enabled in wp-config.php", explanation: "WP_DEBUG is enabled in wp-config.php. In production it may show errors and warnings to visitors, including paths and versions.", fix: "Set WP_DEBUG to false in production (or WP_DEBUG_LOG true and WP_DEBUG_DISPLAY false so errors are only logged)." },
  "web.wpconfig-file-edit": { title: "File editing from the admin is not disabled", explanation: "WordPress lets administrators edit plugin and theme code directly from the admin. If an attacker gets an admin account, this editor lets them drop in a webshell right away.", fix: "Add define( 'DISALLOW_FILE_EDIT', true ); to wp-config.php." },
  // --- web exposed files ---
  "web.config-backup": { title: "Backup of a configuration file with credentials", explanation: "A backup of a config file (wp-config or .env) is in the repository. Servers often do not run .bak/.old backups as PHP and return them as text — anyone could download the database password and keys.", fix: "Treat the credentials as leaked: change the database password and security keys. " + REMOVE_FROM_GIT_EN },
  "web.db-dump": { title: "Database export (dump) in the repository", explanation: "A database export is in the repository. It may contain users' personal data and password hashes. If it also sits on the web under a guessable address, anyone can download it.", fix: REMOVE_FROM_GIT_EN },
  "web.backup-archive": { title: "Backup or archive in the repository", explanation: "A backup or archive is in the repository. Site backups are often complete (including config and data) and can frequently be downloaded on the server by a direct address.", fix: REMOVE_FROM_GIT_EN },
  "web.debug-log": { title: "Debug/error log in the repository", explanation: "A log file is in the repository. Logs often reveal server paths, SQL queries and parts of data, helping an attacker find weaknesses. On the web, debug.log is often publicly readable.", fix: "Delete the log, turn off error display/logging in production (WP_DEBUG_LOG) and add *.log to .gitignore." },
  "web.admin-tool": { title: "Database management tool on the web", explanation: "A direct database management tool (Adminer, phpMyAdmin, etc.) is in the repository (and probably on the web). It is a frequent attack target — anyone who gets access to it has the whole database.", fix: "Remove the tool from the web. If you need it, use it only locally or behind strong authentication and IP restrictions, not as a plain file in production." },
  "web.phpinfo": { title: "Possible test/phpinfo file", explanation: "A file named like phpinfo.php / info.php / test.php is usually a temporary test script that reveals the PHP version, paths and server configuration, helping an attacker prepare.", fix: "Review the content and remove the file from the web and the repository if not needed." },
  "web.htpasswd": { title: ".htpasswd file in the repository", explanation: "A .htpasswd file contains basic-auth credentials (password hashes). In the repository they can be cracked offline.", fix: "Remove the file from git, change the passwords in it and store it outside the versioned directory." },
  "web.editor-metadata": { title: "Developer/system file in the repository", explanation: "A helper editor or system file is in the repository (.DS_Store, an FTP/SFTP client config…). An FTP/SFTP config may contain credentials; the others reveal project structure.", fix: "Add these files to .gitignore and remove them from git. For FTP/SFTP configs treat the credentials as leaked and change them." },
  "web.git-exposed": { title: "Version-control directory deployed to the web", explanation: "A .git/.svn/.hg directory is reachable on the web. From it the whole source code of the site can be downloaded, including config and history (and thus previously deleted passwords).", fix: "Do not deploy .git to production. Block access to these directories on the server and deploy only built files (an export/deploy, not git pull into the web root)." },
};

/** Dependency finding text, computed from the stored structured fields. */
function depTextEn(f: FindingInput): FindingText {
  const ids = [f.advisoryId, ...(f.aliases?.split(", ").filter((a) => a && a !== f.advisoryId) ?? [])].filter(Boolean).join(", ");
  const parts = [
    `Package ${f.packageName} version ${f.installedVersion} has a publicly known vulnerability (${ids}).`,
    f.explanation.includes("OSV") ? "" : "",
    "Information about known vulnerabilities is public, so attackers actively scan for sites using vulnerable versions.",
  ];
  let fix: string;
  if (f.fixedVersion) {
    const cmd =
      f.ecosystem === "Packagist" ? `composer require ${f.packageName}:^${f.fixedVersion}` : f.ecosystem === "PyPI" ? `pip install "${f.packageName}>=${f.fixedVersion}"` : `npm install ${f.packageName}@^${f.fixedVersion}`;
    fix = `Update ${f.packageName} to at least version ${f.fixedVersion}: ${cmd}. After updating, test the app and commit the updated lockfile.`;
  } else {
    fix = "No fixed version is available yet. Read the advisory (link below), consider replacing the package or limiting use of the vulnerable function.";
  }
  return { title: f.title, explanation: parts.filter(Boolean).join(" "), fix };
}

function compTextEn(f: FindingInput): FindingText | null {
  if (f.ruleId === "comp.wp-core") {
    const v = f.installedVersion ?? "?";
    const old = f.severity === "high";
    return {
      title: `WordPress core version ${v}`,
      explanation: old
        ? `WordPress core is version ${v}, an older release. Older core has known, publicly documented vulnerabilities that attackers actively scan for.`
        : `WordPress core version ${v} is in the repository. Confirm it is the latest release — core is the most common target of automated attacks.`,
      fix: "Update WordPress to the latest version (Dashboard → Updates). Back up before updating. Ideally enable automatic core updates.",
    };
  }
  if (f.ruleId === "comp.stale-plugin") {
    const slug = f.file?.match(/wp-content\/(plugins|themes)\/([^/]+)\//)?.[2] ?? "component";
    const isTheme = f.file?.includes("/themes/");
    return {
      title: `${isTheme ? "Theme" : "Plugin"} ${slug} is probably unmaintained`,
      explanation: `The "Tested up to" value shows this ${isTheme ? "theme" : "plugin"} was last verified with an old WordPress version. Unmaintained components are a common source of vulnerabilities because their bugs are not fixed.`,
      fix: `Check whether a newer version exists. If the ${isTheme ? "theme" : "plugin"} is abandoned, replace it with a maintained alternative or remove it if you do not need it.`,
    };
  }
  return null;
}

const REPO_EN: Record<string, RuleText> = {
  "repo.dependabot-alerts-off": { title: "Dependabot alerts are off", explanation: "GitHub will not warn you when a new known vulnerability appears in your dependencies. RepoGuard checks dependencies only on scan; GitHub does so continuously.", fix: "In the repository open Settings → Code security → Dependabot alerts and enable them (Dependabot security updates recommended too)." },
  "repo.secret-scanning-off": { title: "Secret scanning is off", explanation: "GitHub is not watching for API keys and passwords leaking into the repository. For public repositories, bots look for leaked keys within minutes.", fix: "Enable Settings → Code security → Secret scanning and Push protection, which blocks a push containing a key." },
  "repo.push-protection-off": { title: "Push protection for secrets is off", explanation: "Secret scanning finds keys only after a push. Push protection stops a key from entering the repository in the first place.", fix: "Enable Settings → Code security → Push protection." },
  "repo.branch-unprotected": { title: "The default branch is not protected", explanation: "Code can be pushed to the default branch directly, without review and without passing tests — including force-push that rewrites history. A compromised account or an AI agent with push rights could change production code unchecked.", fix: "Settings → Branches (or Rules) → add a rule for the default branch: require a pull request, successful checks and disallow force-push." },
  "repo.no-security-policy": { title: "Missing security policy (SECURITY.md)", explanation: "Someone who finds a vulnerability in your site does not know how to report it safely — they may disclose it or try to exploit it.", fix: "Add a SECURITY.md with a contact (e-mail) and reporting steps, and enable Settings → Private vulnerability reporting." },
  "repo.no-dependency-updates": { title: "Automatic dependency updates are not set up", explanation: "Without Dependabot or Renovate, fixes for library vulnerabilities are installed only manually and easily forgotten.", fix: "Add a .github/dependabot.yml with the ecosystems you use (composer, npm, github-actions) and a weekly interval." },
  "repo.env-not-ignored": { title: ".env files are not in .gitignore", explanation: "The project uses environment variables, but .gitignore does not ignore .env files. One careless \"git add .\" and your secrets are in the repository history.", fix: "Add .env and .env.* to .gitignore (and an exception !.env.example)." },
};

/** Returns title/explanation/fix for a finding in the given locale. */
export function localizedFinding(f: FindingInput, locale: Locale): FindingText {
  if (locale === "cs") return { title: f.title, explanation: f.explanation, fix: f.fix };
  if (f.kind === "dependency") return depTextEn(f);
  const comp = f.ruleId.startsWith("comp.") ? compTextEn(f) : null;
  if (comp) return comp;
  const repo = REPO_EN[f.ruleId];
  if (repo) return repo;
  const rule = RULE_EN[f.ruleId];
  if (rule && rule.explanation) return rule;
  // Fallback: stored Czech (should not happen; a test asserts completeness).
  return { title: f.title, explanation: f.explanation, fix: f.fix };
}
