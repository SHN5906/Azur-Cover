import "server-only";
import { timingSafeEqual } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const CredentialsSchema = z.object({
  email: z.string().email().transform((e) => e.trim().toLowerCase()),
  password: z.string().min(1).max(200),
});

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) {
    // Compare to self so timing leaks zero info about length
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // trustHost: auto-true sur Vercel, mais doit être explicite quand on run
  // `pnpm start` en local ou sur un autre host. Sans ça, Auth.js v5 rejette
  // les requêtes avec UntrustedHost.
  trustHost: true,
  // JWT strategy: pas besoin de DB adapter pour Credentials avec un seul admin
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 jours
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [
    Credentials({
      name: "admin-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(raw) {
        const parsed = CredentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) {
          console.error("auth: ADMIN_EMAIL or ADMIN_PASSWORD not configured");
          return null;
        }

        const emailOk = parsed.data.email === adminEmail;
        const passwordOk = safeEqual(parsed.data.password, adminPassword);

        // Both checks evaluated regardless of order to prevent timing oracles
        // that would reveal whether the email matches.
        if (!emailOk || !passwordOk) return null;

        return { id: "admin", email: adminEmail, name: "Admin" };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});
