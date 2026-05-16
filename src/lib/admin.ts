import "server-only";
import { cache } from "react";
import { redirect, forbidden } from "next/navigation";
import { auth } from "@/auth";

export const requireAdmin = cache(async () => {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/admin/login");
  }
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL not configured on server");
  }
  if (session.user.email.toLowerCase() !== adminEmail.toLowerCase()) {
    forbidden();
  }
  return { email: session.user.email, name: session.user.name ?? null };
});
