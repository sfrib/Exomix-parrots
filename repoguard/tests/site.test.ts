import { describe, expect, it } from "vitest";
import { normalizeOrigin, isPrivateAddr, SiteFetchError, type SiteFetch, type SiteResponse } from "@/lib/site/fetch";
import { auditSite, scoreSite } from "@/lib/site/audit";
import type { CertInfo, CertProvider } from "@/lib/site/fetch";

function resp(over: { status?: number; body?: string; url?: string; redirectedToHttps?: boolean; headers?: Record<string, string>; cookies?: string[] }): SiteResponse {
  const h = new Headers(over.headers ?? {});
  for (const c of over.cookies ?? []) h.append("set-cookie", c);
  return { url: over.url ?? "https://x", status: over.status ?? 200, headers: h, body: over.body ?? "", redirectedToHttps: over.redirectedToHttps ?? false };
}

describe("normalizeOrigin (SSRF guard)", () => {
  it("accepts a public https domain and defaults to https", () => {
    expect(normalizeOrigin("example.com")).toEqual({ origin: "https://example.com", host: "example.com" });
    expect(normalizeOrigin("http://app.exomix.cz/path")).toEqual({ origin: "http://app.exomix.cz", host: "app.exomix.cz" });
  });
  it("rejects localhost, IPs, internal, shorthand/bracketed IPs and non-http schemes", () => {
    for (const bad of [
      "localhost", "127.0.0.1", "http://127.0.0.1", "192.168.0.1", "ftp://example.com", "http://box.local", "notadomain",
      "http://[::1]", "http://[::ffff:127.0.0.1]", "127.1", "0x7f.0.0.1", "0177.0.0.1", "2130706433", "169.254.169.254", "metadata.internal", "http://user:pass@127.0.0.1",
    ]) {
      expect(() => normalizeOrigin(bad), bad).toThrow(SiteFetchError);
    }
  });
});

describe("isPrivateAddr", () => {
  it("blocks private, loopback, link-local, CGNAT, reserved and IPv4-mapped IPv6", () => {
    for (const ip of ["127.0.0.1", "10.0.0.1", "192.168.1.1", "172.16.0.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fe80::1", "fc00::1", "fd00::1", "::ffff:192.168.0.1", "::ffff:127.0.0.1", "::ffff:7f00:1", "garbage"]) {
      expect(isPrivateAddr(ip), ip).toBe(true);
    }
  });
  it("allows normal public addresses", () => {
    for (const ip of ["1.1.1.1", "8.8.8.8", "93.184.216.34", "2606:4700:4700::1111"]) {
      expect(isPrivateAddr(ip), ip).toBe(false);
    }
  });
});

describe("auditSite", () => {
  function fetcherFrom(map: Record<string, SiteResponse | "throw">): SiteFetch {
    return async (url) => {
      const key = url.replace(/^https?:\/\/[^/]+/, "") || "/";
      const r = map[url] ?? map[key] ?? map["*"];
      if (!r || r === "throw") throw new SiteFetchError("x");
      return r;
    };
  }

  it("flags missing headers, insecure cookies, info disclosure and exposed files", async () => {
    const origin = "https://demo.example";
    const fetcher = fetcherFrom({
      "https://demo.example": resp({
        headers: { "x-powered-by": "PHP/7.4.1", server: "Apache/2.4.29" },
        cookies: ["PHPSESSID=abc; path=/"],
        body: '<meta name="generator" content="WordPress 5.2.1">',
      }),
      "http://demo.example": resp({ status: 200, redirectedToHttps: false }),
      "https://demo.example/.env": resp({ status: 200, body: "DB_PASSWORD=secret123\nAPP_KEY=x" }),
      "https://demo.example/.git/HEAD": resp({ status: 200, body: "ref: refs/heads/main" }),
      "*": resp({ status: 404 }),
    });
    const { findings } = await auditSite(origin, fetcher, "en");
    const ids = findings.map((f) => f.id).sort();
    expect(ids).toContain("site.header.csp");
    expect(ids).toContain("site.header.hsts");
    expect(ids).toContain("site.cookie.flags");
    expect(ids).toContain("site.info-disclosure");
    expect(ids).toContain("site.no-https-redirect");
    expect(ids).toContain("site.exposed.env");
    expect(ids).toContain("site.exposed.git");
    const env = findings.find((f) => f.id === "site.exposed.env")!;
    expect(env.severity).toBe("critical");
    expect(env.evidence).toContain("/.env");
  });

  it("gives a clean well-configured site a high score", async () => {
    const secure = resp({
      headers: {
        "content-security-policy": "default-src 'self'",
        "strict-transport-security": "max-age=31536000",
        "x-content-type-options": "nosniff",
        "x-frame-options": "SAMEORIGIN",
        "referrer-policy": "strict-origin-when-cross-origin",
      },
      cookies: ["sid=abc; Secure; HttpOnly; SameSite=Lax"],
    });
    const fetcher: SiteFetch = async (url) => {
      if (url === "https://ok.example") return secure;
      if (url === "http://ok.example") return resp({ status: 301, redirectedToHttps: true });
      if (url.endsWith("/.well-known/security.txt")) return resp({ status: 200, body: "Contact: mailto:x@y" });
      return resp({ status: 404 });
    };
    const { findings } = await auditSite("https://ok.example", fetcher, "en");
    expect(findings).toEqual([]);
    expect(scoreSite(findings)).toEqual({ score: 100, grade: "A" });
  });

  it("marks an unreachable site as not reachable", async () => {
    const fetcher: SiteFetch = async () => {
      throw new SiteFetchError("down");
    };
    expect(await auditSite("https://down.example", fetcher)).toMatchObject({ reachable: false, findings: [] });
  });

  it("does not flag an exposed path that returns 200 without sensitive content (SPA 200 page)", async () => {
    const fetcher: SiteFetch = async (url) => (url === "https://spa.example" ? resp({ headers: { "content-security-policy": "x", "strict-transport-security": "x", "x-content-type-options": "nosniff", "x-frame-options": "x", "referrer-policy": "x" } }) : resp({ status: 200, body: "<!doctype html><html>app</html>" }));
    const { findings } = await auditSite("https://spa.example", fetcher, "en");
    expect(findings.filter((f) => f.id.startsWith("site.exposed."))).toEqual([]);
  });
});


describe("audit checks — false-positive hardening (from adversarial review)", () => {
  function f(map: Record<string, SiteResponse>): SiteFetch {
    return async (url) => {
      const key = url.replace(/^https?:\/\/[^/]+/, "") || "/";
      return map[key] ?? resp({ status: 404 });
    };
  }
  const baseHeaders = { "content-security-policy": "x", "strict-transport-security": "max-age=99999999", "x-content-type-options": "n", "x-frame-options": "x", "referrer-policy": "x" };

  it("does not flag plain <a href=http://> as mixed content, but does flag an http stylesheet", async () => {
    const aOnly = await auditSite("https://x.example", f({ "/": resp({ headers: baseHeaders, body: '<a href="http://other.example/page">link</a>' }), "/.well-known/security.txt": resp({ status: 200, body: "Contact: x" }) }), "en");
    expect(aOnly.findings.map((x) => x.id)).not.toContain("site.mixed-content");
    const css = await auditSite("https://x.example", f({ "/": resp({ headers: baseHeaders, body: '<link rel="stylesheet" href="http://cdn.example/a.css">' }), "/.well-known/security.txt": resp({ status: 200, body: "Contact: x" }) }), "en");
    expect(css.findings.map((x) => x.id)).toContain("site.mixed-content");
    // A non-resource <link rel="canonical"> over http is metadata, not mixed content.
    const canonical = await auditSite("https://x.example", f({ "/": resp({ headers: baseHeaders, body: '<link rel="canonical" href="http://x.example/page"><link rel="dns-prefetch" href="http://cdn.example">' }), "/.well-known/security.txt": resp({ status: 200, body: "Contact: x" }) }), "en");
    expect(canonical.findings.map((x) => x.id)).not.toContain("site.mixed-content");
  });

  it("does not flag /backup.zip from a page that merely contains the letters PK", async () => {
    const found = await auditSite("https://x.example", f({ "/": resp({ headers: baseHeaders }), "/backup.zip": resp({ status: 200, body: "This page mentions PK raftimasr... not a zip" }), "/.well-known/security.txt": resp({ status: 200, body: "Contact: x" }) }), "en");
    expect(found.findings.map((x) => x.id)).not.toContain("site.exposed.backup");
  });

  it("does not flag .svn/entries from a soft-404 JSON page", async () => {
    const found = await auditSite("https://x.example", f({ "/": resp({ headers: baseHeaders }), "/.svn/entries": resp({ status: 200, body: '{"error":"not found"}' }), "/.well-known/security.txt": resp({ status: 200, body: "Contact: x" }) }), "en");
    expect(found.findings.map((x) => x.id)).not.toContain("site.exposed.svn");
  });

  it("only flags session-like cookies and checks SameSite", async () => {
    const consent = await auditSite("https://x.example", f({ "/": resp({ headers: baseHeaders, cookies: ["cookie_consent=1; Path=/"] }), "/.well-known/security.txt": resp({ status: 200, body: "Contact: x" }) }), "en");
    expect(consent.findings.map((x) => x.id)).not.toContain("site.cookie.flags");
    const sess = await auditSite("https://x.example", f({ "/": resp({ headers: baseHeaders, cookies: ["PHPSESSID=abc; Secure; HttpOnly"] }), "/.well-known/security.txt": resp({ status: 200, body: "Contact: x" }) }), "en");
    expect(sess.findings.map((x) => x.id)).toContain("site.cookie.flags"); // missing SameSite
  });
});

describe("auditSite — deeper checks", () => {
  function cert(over: Partial<CertInfo>): CertProvider {
    return async () => ({
      validFrom: new Date(Date.now() - 86400000),
      validTo: new Date(Date.now() + 90 * 86400000),
      daysRemaining: 90,
      issuer: "R3",
      subjectCN: "demo.example",
      altNames: ["demo.example"],
      selfSigned: false,
      hostnameMatches: true,
      protocol: "TLSv1.3",
      cipher: "TLS_AES_128_GCM_SHA256",
      ...over,
    });
  }
  const headers = { "content-security-policy": "x", "strict-transport-security": "max-age=99999999", "x-content-type-options": "nosniff", "x-frame-options": "x", "referrer-policy": "x" };
  const okFetcher: SiteFetch = async (url) => {
    if (url.startsWith("http://")) return resp({ status: 301, redirectedToHttps: true });
    const key = url.replace(/^https?:\/\/[^/]+/, "") || "/";
    if (key === "/") return resp({ headers, cookies: ["sid=a; Secure; HttpOnly; SameSite=Lax"] });
    if (key === "/.well-known/security.txt") return resp({ status: 200, body: "Contact: mailto:x@y" });
    return resp({ status: 404 });
  };

  it("flags an expiring and hostname-mismatched certificate", async () => {
    const { findings } = await auditSite("https://demo.example", okFetcher, "en", cert({ daysRemaining: 5, validTo: new Date(Date.now() + 5 * 86400000) }));
    expect(findings.map((f) => f.id)).toContain("site.tls.expiring");
    const mism = await auditSite("https://demo.example", okFetcher, "en", cert({ hostnameMatches: false, subjectCN: "other.example" }));
    expect(mism.findings.map((f) => f.id)).toContain("site.tls.hostname");
  });

  it("flags weak CSP, short HSTS, mixed content, dir listing and missing security.txt", async () => {
    const fetcher: SiteFetch = async (url) => {
      const key = url.replace(/^https?:\/\/[^/]+/, "") || "/";
      if (key === "/") return resp({ headers: { "content-security-policy": "default-src 'self' 'unsafe-inline'", "strict-transport-security": "max-age=3600", "x-content-type-options": "n", "x-frame-options": "x", "referrer-policy": "x" }, cookies: ["sid=a; Secure; HttpOnly"], body: '<img src="http://cdn.example/a.png">' });
      if (key === "/wp-content/uploads/") return resp({ status: 200, body: "<title>Index of /wp-content/uploads</title>" });
      if (key === "/.well-known/security.txt") return resp({ status: 404 });
      return resp({ status: 404 });
    };
    const ids = (await auditSite("https://demo.example", fetcher, "en", cert({}))).findings.map((f) => f.id);
    expect(ids).toContain("site.csp.weak");
    expect(ids).toContain("site.hsts.short");
    expect(ids).toContain("site.mixed-content");
    expect(ids).toContain("site.dir-listing");
    expect(ids).toContain("site.no-security-txt");
  });

  it("flags an outdated TLS protocol and a weak cipher", async () => {
    const old = await auditSite("https://demo.example", okFetcher, "en", cert({ protocol: "TLSv1.1", cipher: "ECDHE-RSA-AES128-GCM-SHA256" }));
    expect(old.findings.map((f) => f.id)).toContain("site.tls.old-protocol");
    const weak = await auditSite("https://demo.example", okFetcher, "en", cert({ cipher: "ECDHE-RSA-RC4-SHA" }));
    expect(weak.findings.map((f) => f.id)).toContain("site.tls.weak-cipher");
    const noPfs = await auditSite("https://demo.example", okFetcher, "en", cert({ protocol: "TLSv1.2", cipher: "AES256-SHA256" }));
    expect(noPfs.findings.map((f) => f.id)).toContain("site.tls.no-pfs");
    // Static-RSA GCM (IANA name) has no forward secrecy and must be flagged.
    const rsaGcm = await auditSite("https://demo.example", okFetcher, "en", cert({ protocol: "TLSv1.2", cipher: "TLS_RSA_WITH_AES_128_GCM_SHA256" }));
    expect(rsaGcm.findings.map((f) => f.id)).toContain("site.tls.no-pfs");
    // ECDHE in the IANA name is forward-secret and must NOT be flagged.
    const ecdheGcm = await auditSite("https://demo.example", okFetcher, "en", cert({ protocol: "TLSv1.2", cipher: "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256" }));
    expect(ecdheGcm.findings.map((f) => f.id)).not.toContain("site.tls.no-pfs");
  });

  it("a fully clean site with a good cert has no findings", async () => {
    const { findings } = await auditSite("https://demo.example", okFetcher, "en", cert({}));
    expect(findings).toEqual([]);
  });
});
describe("scoreSite", () => {
  it("deducts by severity and grades", () => {
    expect(scoreSite([{ id: "a", severity: "critical", title: "", explanation: "", fix: "" }]).score).toBe(75);
    expect(scoreSite([{ id: "a", severity: "medium", title: "", explanation: "", fix: "" }]).grade).toBe("A");
  });
});
