import { INTL_LOCALE, type Locale } from "./i18n/locale";

const dateTimeFmt: Partial<Record<Locale, Intl.DateTimeFormat>> = {};
function fmt(locale: Locale): Intl.DateTimeFormat {
  return (dateTimeFmt[locale] ??= new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Prague",
  }));
}

export function formatDateTime(date: Date | null | undefined, locale: Locale = "en"): string {
  return date ? fmt(locale).format(date) : locale === "cs" ? "nikdy" : "never";
}

/** Czech plural: 1 nález, 2–4 nálezy, 5+ nálezů. */
export function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return `${n} ${one}`;
  if (n >= 2 && n <= 4) return `${n} ${few}`;
  return `${n} ${many}`;
}

/** English plural: "1 finding" / "3 findings". */
export function pluralEn(n: number, one: string, other: string): string {
  return `${n} ${n === 1 ? one : other}`;
}

export function blobUrl(htmlUrl: string, sha: string | null, file: string, line?: number | null): string {
  const path = file.split("/").map(encodeURIComponent).join("/");
  return `${htmlUrl}/blob/${sha ?? "HEAD"}/${path}${line ? `#L${line}` : ""}`;
}

export function cweUrl(cwe: string): string {
  return `https://cwe.mitre.org/data/definitions/${cwe.replace(/^CWE-/, "")}.html`;
}
