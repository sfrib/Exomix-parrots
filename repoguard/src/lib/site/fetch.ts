import { lookup as dnsLookup } from "node:dns";
import { lookup as dnsLookupAsync } from "node:dns/promises";
import tls from "node:tls";
import { Agent } from "undici";
import ipaddr from "ipaddr.js";

/**
 * SSRF-safe HTTP(S) fetch and TLS inspection for the website auditor. It only
 * ever talks to origins the user has verified they own, but the guard is
 * defense-in-depth: the validated IP is pinned at connect time (so DNS
 * rebinding cannot swap in a private address between check and use), responses
 * are size-capped while streaming, and private / loopback / link-local /
 * reserved targets are rejected for both HTTP and the TLS handshake.
 */

export class SiteFetchError extends Error {}

const BLOCKED_V4 = new Set(["unspecified", "broadcast", "private", "loopback", "linkLocal", "carrierGradeNat", "reserved"]);
const BLOCKED_V6 = new Set(["unspecified", "linkLocal", "uniqueLocal", "loopback", "reserved"]);

/** True for any address that is not a normal public unicast address. */
export function isPrivateAddr(ip: string): boolean {
  let addr: ipaddr.IPv4 | ipaddr.IPv6;
  try {
    addr = ipaddr.parse(ip);
  } catch {
    return true; // unparseable => treat as unsafe
  }
  if (addr.kind() === "ipv6" && (addr as ipaddr.IPv6).isIPv4MappedAddress()) {
    addr = (addr as ipaddr.IPv6).toIPv4Address();
  }
  const range = addr.range();
  return addr.kind() === "ipv4" ? BLOCKED_V4.has(range) : BLOCKED_V6.has(range) || range === "ipv4Mapped";
}

/** A DNS hostname with a non-numeric TLD (rejects IP shorthands like 127.1 or 0x7f.0.0.1). */
function isLikelyPublicDomain(host: string): boolean {
  if (host.length > 253) return false;
  const labels = host.split(".");
  if (labels.length < 2) return false;
  if (!labels.every((l) => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(l))) return false;
  const tld = labels[labels.length - 1];
  return tld.length >= 2 && /[a-z]/i.test(tld); // a public TLD is alphabetic, not all digits
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
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (ipaddr.isValid(host)) throw new SiteFetchError("Zadejte doménu, ne IP adresu.");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".localhost")) throw new SiteFetchError("Zadejte veřejnou doménu.");
  if (!isLikelyPublicDomain(host)) throw new SiteFetchError("Zadejte platnou veřejnou doménu.");
  return { origin: `${url.protocol}//${url.host}`, host };
}

/** dns.lookup-style hook used by undici: resolves, rejects if ANY address is private, pins the result. */
const safeLookup: import("node:net").LookupFunction = (hostname, _options, callback) => {
  dnsLookup(hostname, { all: true, verbatim: true }, (err, addresses) => {
    if (err) return callback(err, "", 4);
    if (addresses.length === 0 || addresses.some((a) => isPrivateAddr(a.address))) {
      return callback(new Error("Blocked: host resolves to a non-public address"), "", 4);
    }
    callback(null, addresses[0].address, addresses[0].family);
  });
};

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_BYTES = 512 * 1024;

// One shared dispatcher that validates and pins the target IP at socket-connect time.
const safeAgent = new Agent({
  connect: { lookup: safeLookup, timeout: DEFAULT_TIMEOUT_MS },
  headersTimeout: DEFAULT_TIMEOUT_MS,
  bodyTimeout: DEFAULT_TIMEOUT_MS,
});

export interface SiteResponse {
  url: string;
  status: number;
  headers: Headers;
  body: string;
  redirectedToHttps: boolean;
}

export type SiteFetch = (url: string, opts?: { method?: string; maxBytes?: number }) => Promise<SiteResponse>;

async function doFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": "RepoGuard-SiteAudit/1.0 (+defensive security self-check)" },
      // @ts-expect-error Node fetch accepts an undici dispatcher at runtime
      dispatcher: safeAgent,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Streams the body and stops after maxBytes, so a huge response cannot exhaust memory. */
async function readCapped(res: Response, maxBytes: number): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;
  try {
    while (total < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      const remaining = maxBytes - total;
      const slice = value.length > remaining ? value.subarray(0, remaining) : value;
      chunks.push(Buffer.from(slice));
      total += slice.length;
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** The real network fetcher. The dispatcher's lookup hook blocks private targets per connection. */
export const liveFetch: SiteFetch = async (url, opts = {}) => {
  const parsed = new URL(url);
  try {
    const res = await doFetch(url);
    const location = res.headers.get("location");
    let redirectedToHttps = false;
    if (res.status >= 300 && res.status < 400 && location) {
      const target = new URL(location, url);
      if (target.protocol === "https:" && parsed.protocol === "http:") redirectedToHttps = true;
      // Only follow a single redirect that stays on the same host.
      if (/^https?:$/.test(target.protocol) && target.hostname === parsed.hostname) {
        // Release the 3xx response's connection instead of leaving its body unread until bodyTimeout.
        await res.body?.cancel().catch(() => {});
        const res2 = await doFetch(target.toString());
        return { url: target.toString(), status: res2.status, headers: res2.headers, body: await readCapped(res2, opts.maxBytes ?? DEFAULT_MAX_BYTES), redirectedToHttps };
      }
    }
    return { url, status: res.status, headers: res.headers, body: await readCapped(res, opts.maxBytes ?? DEFAULT_MAX_BYTES), redirectedToHttps };
  } catch (err) {
    if (err instanceof SiteFetchError) throw err;
    throw new SiteFetchError("Web se nepodařilo načíst (nedostupný, blokovaný nebo vypršel čas).");
  }
};

export interface CertInfo {
  validFrom: Date;
  validTo: Date;
  daysRemaining: number;
  issuer: string;
  subjectCN: string;
  altNames: string[];
  selfSigned: boolean;
  hostnameMatches: boolean;
  protocol: string | null;
  cipher: string | null;
}

export type CertProvider = (host: string) => Promise<CertInfo | null>;

/** Resolves a host to a single validated public IP, or throws. */
async function resolvePublicIp(host: string): Promise<string> {
  const addrs = await dnsLookupAsync(host, { all: true, verbatim: true });
  if (addrs.length === 0 || addrs.some((a) => isPrivateAddr(a.address))) throw new SiteFetchError("Doména ukazuje na neveřejnou adresu.");
  return addrs[0].address;
}

const SELF_SIGNED_CODES = new Set(["SELF_SIGNED_CERT_IN_CHAIN", "DEPTH_ZERO_SELF_SIGNED_CERT"]);

/** Reads the TLS certificate via a handshake. Connects to a pre-validated IP with the real SNI (no rebinding). */
export const liveCert: CertProvider = async (host) => {
  const ip = await resolvePublicIp(host);
  return new Promise<CertInfo | null>((resolve) => {
    const socket = tls.connect({ host: ip, port: 443, servername: host, timeout: DEFAULT_TIMEOUT_MS, rejectUnauthorized: false }, () => {
      const cert = socket.getPeerCertificate();
      const authError = socket.authorizationError as unknown as string | undefined;
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
        selfSigned: Boolean(issuerCN && subjectCN && issuerCN === subjectCN) || (authError ? SELF_SIGNED_CODES.has(authError) : false),
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
