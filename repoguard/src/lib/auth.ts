import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { db } from "./db";
import { encrypt } from "./crypto";

interface GithubProfile {
  id: number;
  login: string;
  name?: string | null;
  avatar_url?: string | null;
}

function allowedLogins(): string[] {
  return (process.env.ALLOWED_GITHUB_LOGINS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      // "repo" is required to read private repositories with an OAuth App.
      authorization: { params: { scope: process.env.GITHUB_OAUTH_SCOPE || "read:user repo" } },
    }),
  ],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/", error: "/" },
  callbacks: {
    async signIn({ account, profile }) {
      const gh = profile as GithubProfile | undefined;
      if (!gh?.id || !gh.login || !account?.access_token) return false;
      const allowed = allowedLogins();
      if (allowed.length > 0 && !allowed.includes(gh.login.toLowerCase())) return "/?error=AccessDenied";

      const data = {
        login: gh.login,
        name: gh.name ?? null,
        avatarUrl: gh.avatar_url ?? null,
        encryptedToken: encrypt(account.access_token),
      };
      await db.user.upsert({ where: { githubId: gh.id }, create: { githubId: gh.id, ...data }, update: data });
      return true;
    },
    async jwt({ token, profile }) {
      // The GitHub access token is stored encrypted in the database and never put in the session cookie.
      const gh = profile as GithubProfile | undefined;
      if (gh?.id) {
        const user = await db.user.findUnique({ where: { githubId: gh.id }, select: { id: true, login: true } });
        if (user) {
          token.uid = user.id;
          token.login = user.login;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.login = token.login as string;
      }
      return session;
    },
  },
};
