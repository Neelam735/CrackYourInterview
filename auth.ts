import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

// OAuth providers are enabled when their credentials are set
// (AUTH_GITHUB_ID / AUTH_GITHUB_SECRET, AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET).
const providers: Provider[] = [];
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) providers.push(GitHub);
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) providers.push(Google);

// Local development only: sign in with any name, no OAuth app needed.
export const devLoginEnabled = process.env.NODE_ENV !== "production" && process.env.AUTH_DEV_LOGIN === "true";
if (devLoginEnabled) {
  providers.push(
    Credentials({
      id: "dev",
      name: "Dev login",
      credentials: { name: { label: "Name", type: "text" } },
      authorize: (credentials) => {
        const name = String(credentials?.name ?? "").trim() || "Developer";
        return { id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name };
      },
    }),
  );
}

export const authEnabled = Boolean(process.env.AUTH_SECRET) && providers.length > 0;

export const providerList = providers.map((provider) => {
  const config = typeof provider === "function" ? provider() : provider;
  // Custom ids and names passed to a provider live in its options.
  const options = (config as { options?: { id?: string; name?: string } }).options;
  return { id: options?.id ?? config.id, name: options?.name ?? config.name };
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  callbacks: {
    jwt({ token, account }) {
      // A stable id that can't collide across providers, e.g. "github:12345".
      if (account) token.uid = `${account.provider}:${account.providerAccountId}`;
      return token;
    },
    session({ session, token }) {
      if (typeof token.uid === "string") session.user.id = token.uid;
      return session;
    },
  },
});
