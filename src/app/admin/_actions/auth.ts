"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

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

// Rate limit en mémoire process : 5 tentatives ratées par IP sur 60s.
// Sur Vercel Fluid Compute, cette Map est partagée entre requêtes
// concurrentes du même instance (best-effort, pas une garantie crypto).
const ATTEMPT_WINDOW_MS = 60_000;
const MAX_ATTEMPTS_PER_WINDOW = 5;
const attempts = new Map<string, { count: number; windowStart: number }>();

async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function checkRateLimit(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.windowStart > ATTEMPT_WINDOW_MS) {
    attempts.set(ip, { count: 1, windowStart: now });
    return { ok: true };
  }
  if (entry.count >= MAX_ATTEMPTS_PER_WINDOW) {
    return {
      ok: false,
      retryAfter: Math.ceil((ATTEMPT_WINDOW_MS - (now - entry.windowStart)) / 1000),
    };
  }
  entry.count += 1;
  return { ok: true };
}

function resetRateLimit(ip: string) {
  attempts.delete(ip);
}

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

  const ip = await getClientIp();
  const rate = checkRateLimit(ip);
  if (!rate.ok) {
    return {
      ok: false,
      error: `Trop de tentatives. Réessayez dans ${rate.retryAfter}s.`,
    };
  }

  const redirectTo = parsed.data.from ?? "/admin";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });
    resetRateLimit(ip);
    return { ok: true };
  } catch (err) {
    // Côté succès, signIn() throw NEXT_REDIRECT — laisser remonter pour que
    // Next.js gère la redirection vers redirectTo.
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      resetRateLimit(ip);
      throw err;
    }
    if (err instanceof AuthError) {
      return { ok: false, error: "Identifiants incorrects." };
    }
    throw err;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
