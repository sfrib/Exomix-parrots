/** Shared building blocks for rules. */

export const PHP_INPUT = /\$_(GET|POST|REQUEST|COOKIE)\b/;
export const PHP_INPUT_ANY = /\$_(GET|POST|REQUEST|COOKIE|FILES|SERVER)\b/;
export const JS_INPUT = /\breq\.(query|body|params|headers|cookies)\b/;

/** Functions that sanitize/validate a PHP value when it is passed directly into them. */
export const PHP_SANITIZERS =
  "sanitize_\\w+|esc_\\w+|intval|absint|floatval|boolval|wp_kses\\w*|htmlspecialchars|htmlentities|strip_tags|" +
  "filter_var|filter_input|is_numeric|ctype_\\w+|preg_match|in_array|array_key_exists|isset|empty|" +
  "wp_verify_nonce|check_admin_referer|check_ajax_referer|password_verify|hash_equals|is_array|count|" +
  "rest_sanitize_\\w+|wp_validate_\\w+|is_email|validate_\\w+";

/** HTML output escapers only (sanitize_* also strips tags, so it is accepted too). */
export const PHP_ESCAPERS =
  "esc_\\w+|htmlspecialchars|htmlentities|intval|absint|floatval|wp_kses\\w*|sanitize_\\w+|strip_tags|json_encode|wp_json_encode|number_format";

const CAST = /\(\s*(int|integer|float|double|bool|boolean)\s*\)\s*$/i;

/**
 * True when every occurrence of `input` in `line` is wrapped by one of `wrappers`
 * (possibly through nested calls such as sanitize_text_field( wp_unslash( $_POST['x'] ) ))
 * or by a numeric cast, or is only compared against a literal.
 */
export function allOccurrencesWrapped(line: string, input: RegExp, wrappers: string): boolean {
  const global = new RegExp(input.source, "g");
  const wrapperAtEnd = new RegExp(`\\b(${wrappers})\\s*\\(\\s*(?:[\\w:>-]+\\s*\\(\\s*)*$`, "i");
  let match: RegExpExecArray | null;
  let found = false;
  while ((match = global.exec(line))) {
    found = true;
    const before = line.slice(0, match.index);
    const after = line.slice(match.index).replace(/^\$_\w+(\s*\[[^\]]*\])*/, "");
    if (wrapperAtEnd.test(before)) continue;
    if (CAST.test(before)) continue;
    if (/^\s*(===|!==|==|!=|<=|>=|<|>)/.test(after) || /(===|!==|==|!=)\s*$/.test(before)) continue;
    return false;
  }
  return found;
}

/** Extracts the source of a brace-delimited block starting at the first "{" after `fromIndex`. */
export function extractBlock(code: string, fromIndex: number): { body: string; start: number; end: number } | null {
  const open = code.indexOf("{", fromIndex);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === "{") depth++;
    else if (code[i] === "}") {
      depth--;
      if (depth === 0) return { body: code.slice(open, i + 1), start: open, end: i + 1 };
    }
  }
  return { body: code.slice(open), start: open, end: code.length };
}

export function lineOfIndex(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text[i] === "\n") line++;
  return line;
}

/** Collects text from `start` (0-based line index) until the statement ends with ";" (max `maxLines`). */
export function statementFrom(lines: string[], start: number, maxLines = 8): string {
  const parts: string[] = [];
  for (let i = start; i < lines.length && i < start + maxLines; i++) {
    parts.push(lines[i]);
    if (/;\s*$/.test(lines[i]) || /;\s*(\?>)?\s*$/.test(lines[i])) break;
  }
  return parts.join("\n");
}

export const PLACEHOLDER_VALUE =
  /^(x{3,}|\*{3,}|\.{3,}|changeme|change[-_]?me.*|password|passw0rd|secret|example.*|test|testing|dummy|null|none|undefined|todo|fixme|your[-_].*|<.*>|\$\{.*|%.*%|\{\{.*\}\}|.*placeholder.*|.*_here|put your unique phrase here|xxx.*)$/i;

export function looksLikePlaceholder(value: string): boolean {
  return PLACEHOLDER_VALUE.test(value.trim()) || /example|placeholder|changeme|change-me|dummy|sample/i.test(value);
}
