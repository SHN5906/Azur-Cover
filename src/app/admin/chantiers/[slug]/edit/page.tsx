import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getRealisationBySlug } from "@/lib/realisations-repo";
import { RealisationForm } from "../../_components/RealisationForm";
import { updateRealisation } from "../../../_actions/realisations";

export default async function EditChantier({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const row = await getRealisationBySlug(slug);
  if (!row) notFound();

  // Lock the original slug in a bound action argument so we can update by it
  const action = updateRealisation.bind(null, slug);

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-10">
      <nav className="text-xs">
        <Link href="/admin/chantiers" className="text-muted hover:text-ink">
          ← Tous les chantiers
        </Link>
      </nav>
      <h1 className="mt-4 text-2xl font-semibold">
        Éditer : {row.title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        Modifie les champs et enregistre.{" "}
        <Link
          href={`/realisations/${row.slug}`}
          target="_blank"
          rel="noreferrer noopener"
          className="underline hover:text-ink"
        >
          Voir la fiche publique
        </Link>
        .
      </p>
      <div className="mt-10">
        <RealisationForm
          submitLabel="Enregistrer les modifications"
          action={action}
          initial={{
            slug: row.slug,
            title: row.title,
            client: row.client,
            city: row.city,
            solution: row.solution,
            sector: row.sector,
            surface: row.surface,
            duration: row.duration,
            year: row.year,
            short: row.short,
            story: row.story,
            results: row.results,
            imageSrc: row.imageSrc,
            imageAlt: row.imageAlt,
            gallery: row.gallery,
            videoUrl: row.videoUrl,
            logo: row.logo,
          }}
        />
      </div>
    </main>
  );
}
