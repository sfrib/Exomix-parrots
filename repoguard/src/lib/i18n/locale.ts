export const LOCALES = ["en", "cs"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "rg_locale";

export function isLocale(v: string | undefined): v is Locale {
  return v === "en" || v === "cs";
}

export const LOCALE_LABEL: Record<Locale, string> = { en: "English", cs: "Čeština" };
export const INTL_LOCALE: Record<Locale, string> = { en: "en-GB", cs: "cs-CZ" };
