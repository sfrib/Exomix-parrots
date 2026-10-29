import { randomBytes } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { type SiteFetch, SiteFetchError } from "./fetch";

/**
 * Proves the user controls a domain before any probing is allowed. The owner
 * publishes a token either as a file at /.well-known/repoguard-verify.txt or as
 * a DNS TXT record (repoguard-verify=<token>). Either is sufficient.
 */

export function newVerifyToken(): string {
  return `repoguard-verify-${randomBytes(16).toString("hex")}`;
}

export const VERIFY_PATH = "/.well-known/repoguard-verify.txt";

export async function verifyOwnership(origin: string, host: string, token: string, fetcher: SiteFetch): Promise<boolean> {
  // 1. File method
  try {
    const res = await fetcher(origin + VERIFY_PATH, { maxBytes: 4096 });
    if (res.status === 200 && res.body.includes(token)) return true;
  } catch {
    // fall through to DNS
  }
  // 2. DNS TXT method
  try {
    const records = await resolveTxt(host);
    if (records.flat().some((r) => r.includes(token))) return true;
  } catch {
    // no TXT
  }
  return false;
}
