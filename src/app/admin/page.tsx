import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { logoutAction } from "./_actions/auth";

export default async function AdminHome() {
  const admin = await requireAdmin();
  return (
    <main className="mx-auto max-w-2xl p-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Azur Cover</h1>
        <form action={logoutAction}>
          <button type="submit" className="text-sm underline">
            Se déconnecter
          </button>
        </form>
      </header>
      <p className="mt-4 text-sm text-muted">
        Connecté en tant que <strong>{admin.email}</strong>.
      </p>
      <nav className="mt-10 grid gap-4">
        <Link
          href="/admin/chantiers"
          className="rounded border border-line/60 p-4 transition-colors hover:border-ink"
        >
          Chantiers (réalisations) →
        </Link>
      </nav>
    </main>
  );
}
