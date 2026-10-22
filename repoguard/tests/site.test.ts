import { describe, expect, it } from "vitest";
import { normalizeOrigin, SiteFetchError, type SiteFetch, type SiteResponse } from "@/lib/site/fetch";
import { auditSite, scoreSite } from "@/lib/site/audit";

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
  it("rejects localhost, IPs, internal and non-http schemes", () => {
    for (const bad of ["localhost", "127.0.0.1", "http://127.0.0.1", "192.168.0.1", "ftp://example.com", "http://box.local", "notadomain"]) {
      expect(() => normalizeOrigin(bad), bad).toThrow(SiteFetchError);
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

describe("scoreSite", () => {
  it("deducts by severity and grades", () => {
    expect(scoreSite([{ id: "a", severity: "critical", title: "", explanation: "", fix: "" }]).score).toBe(75);
    expect(scoreSite([{ id: "a", severity: "medium", title: "", explanation: "", fix: "" }]).grade).toBe("A");
  });
});
