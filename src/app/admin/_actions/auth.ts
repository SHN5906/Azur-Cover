"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rate-limit";

const LoginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis").max(200),
  // Optionnel : URL de retour ; on n'accepte que des chemins absolus
  // commençant par /admin pour éviter tout open redirect.
  from: z
    .string()
    .optional()
    .transform((v) => (v && v.startsWith("/admin") ? v : undefined)),
});

export type LoginState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    from: formData.get("from"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }

  // Rate limit : 5 tentatives login / minute. Bloque le brute-force
  // contre le mot de passe admin (24+ chars haute entropie de toute
  // façon, mais ceinture+bretelles).
  const ip = await getClientIp();
  const rlKey = `admin:login:${ip}`;
  const rate = await checkRateLimit(rlKey, 5, 60_000);
  if (!rate.ok) {
    return {
      ok: false,
      error: `Trop de tentatives. Réessayez dans ${rate.retryAfterSec}s.`,
    };
  }

  const redirectTo = parsed.data.from ?? "/admin";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });
    await resetRateLimit(rlKey);
    return { ok: true };
  } catch (err) {
    // Côté succès, signIn() throw NEXT_REDIRECT — laisser remonter pour que
    // Next.js gère la redirection vers redirectTo.
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      await resetRateLimit(rlKey);
      throw err;
    }
    if (err instanceof AuthError) {
      console.warn(
        `[auth] login failed ip=${ip} email=${parsed.data.email}`,
      );
      return { ok: false, error: "Identifiants incorrects." };
    }
    throw err;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
