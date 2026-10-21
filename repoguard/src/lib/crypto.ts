import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/** Key for encrypting stored GitHub tokens: TOKEN_ENCRYPTION_KEY, or derived from NEXTAUTH_SECRET. */
function key(): Buffer {
  const material = process.env.TOKEN_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  if (!material) throw new Error("Missing TOKEN_ENCRYPTION_KEY or NEXTAUTH_SECRET");
  return createHash("sha256").update(`repoguard-token:${material}`).digest();
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64"), cipher.getAuthTag().toString("base64"), data.toString("base64")].join(".");
}

export function decrypt(payload: string): string {
  const [version, iv, tag, data] = payload.split(".");
  if (version !== "v1" || !iv || !tag || !data) throw new Error("Invalid encrypted payload");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
}
