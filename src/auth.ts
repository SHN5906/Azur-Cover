import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const CredentialsSchema = z.object({
  email: z.string().email().transform((e) => e.trim().toLowerCase()),
  password: z.string().min(1).max(200),
});

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do a dummy comparison so timing is roughly constant
    let mismatch = 1;
    for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ a.charCodeAt(i);
    return mismatch === 0 && false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
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
        const passwordOk = timingSafeEqual(parsed.data.password, adminPassword);

        // Toujours faire les deux comparaisons pour éviter un timing side-channel
        // qui révèlerait si l'email existe
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
