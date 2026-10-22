import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import tls from "node:tls";

/**
 * SSRF-safe HTTP(S) fetch for the website auditor. The auditor only ever talks
 * to origins the user has verified they own, but we still block requests to
 * private / loopback / link-local addresses and non-http(s) schemes so the tool
 * itself cannot be turned into a server-side request forgery primitive.
 */

export class SiteFetchError extends Error {}

function isPrivateIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }
  const v = ip.toLowerCase();
  return v === "::1" || v === "::" || v.startsWith("fe80") || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("::ffff:127.") || v.startsWith("::ffff:10.");
}

/** Validates a user-supplied URL and normalizes it to an origin. Throws on anything unsafe. */
export function normalizeOrigin(input: string): { origin: string; host: string } {
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  } catch {
    throw new SiteFetchError("Neplatná adresa.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new SiteFetchError("Povolené jsou jen adresy http(s).");
  const host = url.hostname.toLowerCase();
  if (!host.includes(".") || host.endsWith(".local") || host.endsWith(".internal")) throw new SiteFetchError("Zadejte veřejnou doménu.");
  if (host === "localhost" || isIP(host) === 4 || isIP(host) === 6) throw new SiteFetchError("Zadejte doménu, ne IP adresu nebo localhost.");
  return { origin: `${url.protocol}//${url.host}`, host };
}

async function assertPublicHost(host: string): Promise<void> {
  let addrs: { address: string }[];
  try {
    addrs = await lookup(host, { all: true });
  } catch {
    throw new SiteFetchError("Doménu se nepodařilo přeložit (DNS).");
  }
  if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) {
    throw new SiteFetchError("Doména ukazuje na neveřejnou (interní) adresu.");
  }
}

export interface SiteResponse {
  url: string;
  status: number;
  headers: Headers;
  body: string;
  redirectedToHttps: boolean;
}

export type SiteFetch = (url: string, opts?: { method?: string; maxBytes?: number }) => Promise<SiteResponse>;

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_BYTES = 512 * 1024;

/** The real network fetcher. Resolves DNS and blocks private targets before each request. */
export const liveFetch: SiteFetch = async (url, opts = {}) => {
  const parsed = new URL(url);
  await assertPublicHost(parsed.hostname);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: opts.method ?? "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": "RepoGuard-SiteAudit/1.0 (+defensive security self-check)" },
    });
    // Follow a single same-site HTTP->HTTPS or HTTPS redirect, re-checking the target.
    const location = res.headers.get("location");
    let redirectedToHttps = false;
    if (res.status >= 300 && res.status < 400 && location) {
      const target = new URL(location, url);
      if (target.protocol === "https:" && parsed.protocol === "http:") redirectedToHttps = true;
      if (/^https?:$/.test(target.protocol) && target.hostname === parsed.hostname) {
        await assertPublicHost(target.hostname);
        const res2 = await fetch(target.toString(), { redirect: "manual", signal: controller.signal, headers: { "User-Agent": "RepoGuard-SiteAudit/1.0" } });
        const body2 = await readCapped(res2, opts.maxBytes ?? DEFAULT_MAX_BYTES);
        return { url: target.toString(), status: res2.status, headers: res2.headers, body: body2, redirectedToHttps };
      }
    }
    const body = await readCapped(res, opts.maxBytes ?? DEFAULT_MAX_BYTES);
    return { url, status: res.status, headers: res.headers, body, redirectedToHttps };
  } catch (err) {
    if (err instanceof SiteFetchError) throw err;
    throw new SiteFetchError("Web se nepodařilo načíst (nedostupný nebo vypršel čas).");
  } finally {
    clearTimeout(timer);
  }
};

async function readCapped(res: Response, maxBytes: number): Promise<string> {
  const buf = await res.arrayBuffer();
  return Buffer.from(buf.slice(0, maxBytes)).toString("utf8");
}

export interface CertInfo {
  validFrom: Date;
  validTo: Date;
  daysRemaining: number;
  issuer: string;
  subjectCN: string;
  altNames: string[];
  selfSigned: boolean;
  hostnameMatches: boolean;
  /** Negotiated TLS protocol, e.g. "TLSv1.3" / "TLSv1.1". */
  protocol: string | null;
  /** Negotiated cipher suite name, e.g. "TLS_AES_128_GCM_SHA256" or "ECDHE-RSA-AES128-GCM-SHA256". */
  cipher: string | null;
}

export type CertProvider = (host: string) => Promise<CertInfo | null>;

/** Reads the TLS certificate via a handshake (passive). Blocks private targets first. */
export const liveCert: CertProvider = async (host) => {
  await assertPublicHost(host);
  return new Promise<CertInfo | null>((resolve) => {
    const socket = tls.connect({ host, port: 443, servername: host, timeout: DEFAULT_TIMEOUT_MS, rejectUnauthorized: false }, () => {
      const cert = socket.getPeerCertificate();
      const authorized = socket.authorized;
      const protocol = socket.getProtocol();
      const cipherInfo = socket.getCipher();
      socket.end();
      if (!cert || !cert.valid_to) return resolve(null);
      const validTo = new Date(cert.valid_to);
      const validFrom = new Date(cert.valid_from);
      const altNames = (cert.subjectaltname ?? "")
        .split(",")
        .map((s) => s.trim().replace(/^DNS:/, ""))
        .filter(Boolean);
      const subjectCN = (cert.subject && typeof cert.subject === "object" ? (cert.subject as { CN?: string }).CN : undefined) ?? "";
      const issuerCN = (cert.issuer && typeof cert.issuer === "object" ? (cert.issuer as { CN?: string }).CN : undefined) ?? "";
      const matchOne = (pattern: string) =>
        pattern === host || (pattern.startsWith("*.") && host.endsWith(pattern.slice(1)) && host.split(".").length === pattern.split(".").length);
      resolve({
        validFrom,
        validTo,
        daysRemaining: Math.floor((validTo.getTime() - Date.now()) / 86_400_000),
        issuer: issuerCN,
        subjectCN,
        altNames,
        selfSigned: Boolean(issuerCN && subjectCN && issuerCN === subjectCN) || !authorized,
        hostnameMatches: [subjectCN, ...altNames].some(matchOne),
        protocol,
        cipher: cipherInfo?.standardName ?? cipherInfo?.name ?? null,
      });
    });
    socket.on("error", () => resolve(null));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(null);
    });
  });
};
