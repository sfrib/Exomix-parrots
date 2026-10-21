import { type RepoStatus, type Severity } from "@/lib/severity";
import { t } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";

const sevKey = (s: Severity) => (`sev.${s}` as const);
const statusKey = (s: RepoStatus) => (`status.${s}` as const);

const SEVERITY_STYLE: Record<Severity, string> = {
  critical: "bg-red-700 text-white",
  high: "bg-orange-100 text-orange-800 ring-1 ring-orange-300",
  medium: "bg-amber-50 text-amber-800 ring-1 ring-amber-300",
  low: "bg-slate-100 text-slate-700 ring-1 ring-slate-300",
};

const STATUS_STYLE: Record<RepoStatus, string> = {
  ok: "bg-emerald-50 text-emerald-800 ring-emerald-300",
  warnings: "bg-amber-50 text-amber-800 ring-amber-300",
  critical: "bg-red-50 text-red-800 ring-red-300",
  unscanned: "bg-slate-100 text-slate-600 ring-slate-300",
};

const STATUS_DOT: Record<RepoStatus, string> = {
  ok: "bg-emerald-500",
  warnings: "bg-amber-500",
  critical: "bg-red-600",
  unscanned: "bg-slate-400",
};

export function SeverityBadge({ severity, locale }: { severity: Severity; locale: Locale }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${SEVERITY_STYLE[severity]}`}>
      {t(sevKey(severity), locale)}
    </span>
  );
}

export function StatusBadge({ status, locale }: { status: RepoStatus; locale: Locale }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${STATUS_STYLE[status]}`}>
      <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} aria-hidden />
      {t(statusKey(status), locale)}
    </span>
  );
}

export function SeverityCounts({ counts, locale }: { counts: Record<Severity, number>; locale: Locale }) {
  const order: Severity[] = ["critical", "high", "medium", "low"];
  return (
    <div className="flex flex-wrap gap-1.5">
      {order.map((s) =>
        counts[s] > 0 ? (
          <span key={s} className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${SEVERITY_STYLE[s]}`} title={t(sevKey(s), locale)}>
            {counts[s]} {t(sevKey(s), locale).toLowerCase()}
          </span>
        ) : null,
      )}
    </div>
  );
}

const GRADE_STYLE: Record<string, string> = {
  A: "bg-emerald-600 text-white",
  B: "bg-lime-600 text-white",
  C: "bg-amber-500 text-white",
  D: "bg-orange-600 text-white",
  F: "bg-red-700 text-white",
};

export function GradeBadge({ grade, score, size = "sm" }: { grade: string; score: number; size?: "sm" | "lg" }) {
  const box = size === "lg" ? "h-14 w-14 text-3xl" : "h-8 w-8 text-base";
  return (
    <span className="inline-flex items-center gap-2" title={`Bezpečnostní skóre ${score}/100`}>
      <span className={`inline-flex items-center justify-center rounded-lg font-bold ${box} ${GRADE_STYLE[grade] ?? GRADE_STYLE.F}`}>{grade}</span>
      <span className={size === "lg" ? "text-lg font-semibold" : "text-sm text-slate-600"}>{score}/100</span>
    </span>
  );
}
