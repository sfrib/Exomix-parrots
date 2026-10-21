import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import { db } from "./db";
import { decrypt } from "./crypto";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return db.user.findUnique({ where: { id: session.user.id } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

export function tokenFor(user: { encryptedToken: string | null }): string {
  if (!user.encryptedToken) throw new Error("Chybí přístupový token GitHubu. Přihlaste se prosím znovu.");
  return decrypt(user.encryptedToken);
}

/** Loads a repo only if it belongs to the given user. */
export async function getOwnedRepo(repoId: string, userId: string) {
  return db.repo.findFirst({ where: { id: repoId, userId } });
}
