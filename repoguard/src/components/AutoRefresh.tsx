"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-renders the server page periodically while a background job runs. */
export function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
