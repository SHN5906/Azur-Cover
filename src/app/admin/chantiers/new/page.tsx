import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { RealisationForm } from "../_components/RealisationForm";
import { createRealisation } from "../../_actions/realisations";

export default async function NewChantier() {
  await requireAdmin();
  return (
    <main className="mx-auto max-w-3xl p-10">
      <nav className="text-xs">
        <Link href="/admin/chantiers" className="text-muted hover:text-ink">
          ← Tous les chantiers
        </Link>
      </nav>
      <h1 className="mt-4 text-2xl font-semibold">Nouveau chantier</h1>
      <p className="mt-2 text-sm text-muted">
        Une fois enregistré, il apparaîtra immédiatement sur /realisations.
      </p>
      <div className="mt-10">
        <RealisationForm action={createRealisation} submitLabel="Créer le chantier" />
      </div>
    </main>
  );
}
