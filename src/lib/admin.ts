import "server-only";
import { cache } from "react";
import { redirect, forbidden } from "next/navigation";
import { auth } from "@/auth";
import { requireEnv } from "@/lib/env";

export const requireAdmin = cache(async () => {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/admin/login");
  }
  const adminEmail = requireEnv("ADMIN_EMAIL");
  if (session.user.email.toLowerCase() !== adminEmail.toLowerCase()) {
    forbidden();
  }
  return { email: session.user.email, name: session.user.name ?? null };
});
