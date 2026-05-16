import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Connexion admin",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const params = await searchParams;
  // Whitelist le redirect : on n'accepte que des chemins admin pour bloquer
  // tout open redirect via ?from=https://evil.com.
  const from =
    params.from && params.from.startsWith("/admin") ? params.from : undefined;

  return (
    <main className="mx-auto max-w-md p-10">
      <h1 className="text-2xl font-semibold">Admin Azur Cover</h1>
      <p className="mt-3 text-sm text-muted">
        Connexion réservée à l&apos;administrateur du site.
      </p>
      <LoginForm hasUrlError={Boolean(params.error)} from={from} />
    </main>
  );
}
