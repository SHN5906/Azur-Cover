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
  return (
    <main className="mx-auto max-w-md p-10">
      <h1 className="text-2xl font-semibold">Admin Azur Cover</h1>
      <p className="mt-3 text-sm text-muted">
        Connexion réservée à l&apos;administrateur du site.
      </p>
      <LoginForm hasUrlError={Boolean(params.error)} />
    </main>
  );
}
