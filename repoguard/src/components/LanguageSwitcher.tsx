"use client";

import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_LABEL, LOCALE_COOKIE, type Locale } from "@/lib/i18n/locale";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const set = (next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  };
  return (
    <div className="flex items-center gap-1 text-xs" role="group" aria-label="Language">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => set(l)}
          className={l === locale ? "font-semibold text-slate-900" : "text-slate-400 hover:text-slate-700"}
          aria-pressed={l === locale}
        >
          {l.toUpperCase()}
          <span className="sr-only"> {LOCALE_LABEL[l]}</span>
        </button>
      ))}
    </div>
  );
}
