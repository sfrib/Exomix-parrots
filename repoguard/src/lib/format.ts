const dateTime = new Intl.DateTimeFormat("cs-CZ", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Prague",
});

export function formatDateTime(date: Date | null | undefined): string {
  return date ? dateTime.format(date) : "nikdy";
}

/** Czech plural: 1 nález, 2–4 nálezy, 5+ nálezů. */
export function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return `${n} ${one}`;
  if (n >= 2 && n <= 4) return `${n} ${few}`;
  return `${n} ${many}`;
}

export function blobUrl(htmlUrl: string, sha: string | null, file: string, line?: number | null): string {
  const path = file.split("/").map(encodeURIComponent).join("/");
  return `${htmlUrl}/blob/${sha ?? "HEAD"}/${path}${line ? `#L${line}` : ""}`;
}

export function cweUrl(cwe: string): string {
  return `https://cwe.mitre.org/data/definitions/${cwe.replace(/^CWE-/, "")}.html`;
}
