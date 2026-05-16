import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { listRealisations } from "@/lib/realisations-repo";
import { logoutAction } from "./_actions/auth";

export default async function AdminHome() {
  const admin = await requireAdmin();
  const realisations = await listRealisations();

  return (
    <main className="mx-auto max-w-2xl p-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Azur Cover</h1>
        <form action={logoutAction}>
          <button type="submit" className="text-sm underline hover:text-ink">
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
          className="rounded border border-line/60 p-5 transition-colors hover:border-ink"
        >
          <div className="flex items-baseline justify-between">
            <span className="font-medium">Chantiers (réalisations)</span>
            <span className="font-mono text-xs text-muted">
              {realisations.length} publié{realisations.length > 1 ? "s" : ""}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
            Créer, éditer, supprimer les fiches de chantier publiées sur /realisations.
          </p>
        </Link>
      </nav>
    </main>
  );
}
