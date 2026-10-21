import type { Language } from "./types";

/**
 * Replaces comments with spaces while preserving line/column positions.
 * String literals are kept intact. Handles //, /* *\/ and (for PHP) # comments.
 * This is a lightweight lexer, not a full parser; it is good enough to avoid
 * flagging commented-out code.
 */
export function stripComments(source: string, language: Language): string {
  if (language === "config") return source;
  const hashComments = language === "php";
  const out: string[] = [];
  let i = 0;
  const n = source.length;
  let quote: string | null = null;

  const blank = (ch: string) => (ch === "\n" || ch === "\r" ? ch : " ");

  while (i < n) {
    const ch = source[i];
    const next = source[i + 1];

    if (quote) {
      // JS '...' and "..." strings cannot span lines; recover from regex literals like /["']/
      if (ch === "\n" && quote !== "`" && language === "js") quote = null;
      out.push(ch);
      if (ch === "\\" && i + 1 < n) {
        out.push(next);
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i++;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      out.push(ch);
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      const stop = end === -1 ? n : end + 2;
      for (let j = i; j < stop; j++) out.push(blank(source[j]));
      i = stop;
      continue;
    }

    // "//" line comment; skip "://" so URLs in unquoted contexts survive
    if ((ch === "/" && next === "/" && source[i - 1] !== ":") || (hashComments && ch === "#" && next !== "[")) {
      while (i < n && source[i] !== "\n") {
        // PHP line comments end at a closing tag
        if (hashComments && source[i] === "?" && source[i + 1] === ">") break;
        out.push(" ");
        i++;
      }
      continue;
    }

    // JS regex literal: "/" where an expression may start, e.g. after "=", "(", ","
    if (language === "js" && ch === "/" && /[(,=:[!&|?{};+\-*%<>~^]$|^$/.test(lastSignificant(out))) {
      const end = regexLiteralEnd(source, i);
      if (end !== -1) {
        out.push(source.slice(i, end));
        i = end;
        continue;
      }
    }

    out.push(ch);
    i++;
  }
  return out.join("");
}

function lastSignificant(out: string[]): string {
  for (let k = out.length - 1; k >= 0; k--) {
    if (!/\s/.test(out[k])) return out[k];
  }
  return "";
}

/** Returns the index just past a regex literal starting at `start`, or -1 if it is not one. */
function regexLiteralEnd(source: string, start: number): number {
  let inClass = false;
  for (let j = start + 1; j < source.length; j++) {
    const c = source[j];
    if (c === "\n") return -1;
    if (c === "\\") {
      j++;
      continue;
    }
    if (c === "[") inClass = true;
    else if (c === "]") inClass = false;
    else if (c === "/" && !inClass) {
      let k = j + 1;
      while (k < source.length && /[a-z]/i.test(source[k])) k++;
      return k;
    }
  }
  return -1;
}
