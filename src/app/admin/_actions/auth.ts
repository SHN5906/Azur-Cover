"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

const LoginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis").max(200),
});

export type LoginState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/admin",
    });
    return { ok: true };
  } catch (err) {
    // signIn() throws NEXT_REDIRECT en cas de succès — laisser remonter
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    if (err instanceof AuthError) {
      return { ok: false, error: "Identifiants incorrects." };
    }
    throw err;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
