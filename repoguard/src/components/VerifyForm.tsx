"use client";

import { useActionState } from "react";
import { verifyPastedReport, type VerifyResult } from "@/app/verify/actions";

export function VerifyForm() {
  const [state, action, pending] = useActionState<VerifyResult | null, FormData>(verifyPastedReport, null);
  return (
    <form action={action} className="space-y-3">
      <textarea
        name="report"
        rows={10}
        placeholder='Vložte obsah JSON reportu (začíná { "repository": ... )'
        className="block w-full rounded-lg border border-slate-300 p-3 font-mono text-xs"
      />
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Ověřuji…" : "Ověřit podpis"}
      </button>
      {state && state.ok && (
        <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">✓ Podpis souhlasí – report je pravý a nezměněný.</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1">
            <dt className="text-emerald-700">Repozitář</dt>
            <dd className="font-mono">{state.repository}</dd>
            <dt className="text-emerald-700">Commit</dt>
            <dd className="font-mono">{state.commit ?? "—"}</dd>
            <dt className="text-emerald-700">Počet nálezů</dt>
            <dd>{state.findingCount}</dd>
            <dt className="text-emerald-700">Podepsáno</dt>
            <dd>{new Date(state.signedAt).toLocaleString("cs-CZ")}</dd>
          </dl>
        </div>
      )}
      {state && !state.ok && <p className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-800">✗ {state.message}</p>}
    </form>
  );
}
