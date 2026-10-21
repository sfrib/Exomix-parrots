"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionState } from "@/app/actions";

interface Props {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  children?: ReactNode;
  className?: string;
}

export function ActionForm({ action, label, pendingLabel, variant = "primary", children, className }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {children}
      <button type="submit" className={`btn-${variant}`} disabled={pending}>
        {pending && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
        {pending ? pendingLabel ?? "…" : label}
      </button>
      {state && (
        <p role="status" className={`mt-2 text-sm ${state.ok ? "text-emerald-700" : "text-red-700"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
