import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { listRealisations } from "@/lib/realisations-repo";
import { DeleteButton } from "./_components/DeleteButton";

export default async function ChantiersList() {
  await requireAdmin();
  const rows = await listRealisations();

  return (
    <main className="mx-auto max-w-5xl p-10">
      <nav className="text-xs">
        <Link href="/admin" className="text-muted hover:text-ink">
          ← Admin
        </Link>
      </nav>

      <header className="mt-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Chantiers</h1>
          <p className="mt-1 text-sm text-muted">
            {rows.length} chantier{rows.length > 1 ? "s" : ""} publié
            {rows.length > 1 ? "s" : ""}.
          </p>
        </div>
        <Link
          href="/admin/chantiers/new"
          className="rounded bg-ink px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Nouveau
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="mt-12 rounded border border-dashed border-line/60 p-10 text-center text-sm text-muted">
          Aucun chantier pour l&apos;instant.{" "}
          <Link href="/admin/chantiers/new" className="underline hover:text-ink">
            Crée le premier
          </Link>
          .
        </div>
      ) : (
        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line/60 text-left text-xs uppercase tracking-wider text-muted">
              <th className="py-3 font-normal">Titre</th>
              <th className="py-3 font-normal">Client</th>
              <th className="py-3 font-normal">Ville</th>
              <th className="py-3 font-normal">Solution</th>
              <th className="py-3 font-normal">Année</th>
              <th className="py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line/30 align-top">
                <td className="py-3">
                  <Link
                    href={`/admin/chantiers/${r.slug}/edit`}
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    {r.title}
                  </Link>
                  <div className="text-xs text-muted">/{r.slug}</div>
                </td>
                <td className="py-3">{r.client}</td>
                <td className="py-3">{r.city}</td>
                <td className="py-3">{r.solution}</td>
                <td className="py-3">{r.year}</td>
                <td className="space-x-4 py-3 text-right">
                  <Link
                    href={`/realisations/${r.slug}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-xs underline hover:text-ink"
                  >
                    Voir
                  </Link>
                  <Link
                    href={`/admin/chantiers/${r.slug}/edit`}
                    className="text-xs underline hover:text-ink"
                  >
                    Éditer
                  </Link>
                  <DeleteButton slug={r.slug} title={r.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
