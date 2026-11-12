import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

// NextAuth configuration.
// This sits alongside our existing custom session auth (src/lib/auth.ts).
// Both work in parallel: getCurrentUser() checks both sources.
//
// To enable Google OAuth:
//   1. https://console.cloud.google.com/apis/credentials → create OAuth 2.0 Client ID
//   2. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local
//   3. Set authorized redirect URI to: http://localhost:3000/api/auth/callback/google
//      (production: https://yourdomain.com/api/auth/callback/google)
//
// To enable GitHub OAuth:
//   1. https://github.com/settings/developers → New OAuth App
//   2. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to .env.local
//   3. Authorization callback URL: http://localhost:3000/api/auth/callback/github

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email or Username",
    credentials: {
      identifier: { label: "Email or Username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const identifier = credentials?.identifier?.trim();
      const password = credentials?.password;
      if (!identifier || !password) return null;

      const user = await db.user.findFirst({
        where: {
          OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
        },
      });
      if (!user) return null;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      return {
        id: user.id,
        name: user.name ?? user.username,
        email: user.email,
        image: user.avatarUrl ?? undefined,
        role: user.role,
        username: user.username,
      } as any;
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "USER",
        } as any;
      },
    }) as any
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      profile(profile: any) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: "USER",
        } as any;
      },
    }) as any
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For OAuth providers, ensure a User row exists in our DB.
      if (account?.provider && account.provider !== "credentials" && user?.email) {
        const existing = await db.user.findUnique({ where: { email: user.email.toLowerCase() } });
        if (!existing) {
          // Auto-create user from OAuth profile
          const username = (user.name ?? user.email!.split("@")[0]!)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "")
            .slice(0, 20) + "_" + randomUUID().slice(0, 6);
          const newUser = await db.user.create({
            data: {
              email: user.email.toLowerCase(),
              username,
              name: user.name ?? null,
              avatarUrl: user.image ?? null,
              passwordHash: await bcrypt.hash(randomUUID(), 12), // random — OAuth users don't use password
              role: "USER",
            },
          });
          await db.oAuthAccount.create({
            data: {
              userId: newUser.id,
              provider: account.provider.toUpperCase(),
              providerAccountId: account.providerAccountId,
            },
          });
          await db.notification.create({
            data: {
              userId: newUser.id,
              type: "SYSTEM",
              title: "Welcome to CineVerse!",
              body: `Your account was created via ${account.provider}. Complete your profile in Settings.`,
            },
          });
        } else {
          // Link OAuth account if not already linked
          const linked = await db.oAuthAccount.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider.toUpperCase(),
                providerAccountId: account.providerAccountId,
              },
            },
          });
          if (!linked) {
            await db.oAuthAccount.create({
              data: {
                userId: existing.id,
                provider: account.provider.toUpperCase(),
                providerAccountId: account.providerAccountId,
              },
            });
          }
        }
      }
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? "dev-only-secret-please-change-in-production-" + randomUUID(),
  debug: false,
};
