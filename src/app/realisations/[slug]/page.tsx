import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/motion/CountUp";
import { BreadcrumbJsonLd } from "@/lib/breadcrumb";
import { listRealisations, getRealisationBySlug } from "@/lib/realisations-repo";

export async function generateStaticParams() {
  const rows = await listRealisations();
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRealisationBySlug(slug);
  if (!r) return {};
  return {
    title: r.title,
    description: r.short,
    alternates: { canonical: `/realisations/${r.slug}` },
  };
}

export default async function RealisationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await getRealisationBySlug(slug);
  if (!r) notFound();

  const all = await listRealisations();
  const idx = all.findIndex((x) => x.slug === slug);
  const prev = all[(idx - 1 + all.length) % all.length];
  const next = all[(idx + 1) % all.length];

  return (
    <>
      <Header />
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Réalisations", url: "/realisations" },
          { name: r.title, url: `/realisations/${r.slug}` },
        ]}
      />
      <main id="main">
        {/* Hero */}
        <section className="pt-40 pb-12 md:pt-48 md:pb-16" aria-labelledby="r-h1">
          <Container>
            <Link
              href="/realisations"
              className="inline-flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.18em] text-muted hover:text-ink"
            >
              <span aria-hidden>←</span> Toutes les réalisations
            </Link>
            <Eyebrow className="mt-10">{r.solution}</Eyebrow>
            <h1
              id="r-h1"
              className="mt-6 text-ink"
              style={{
                fontSize: "clamp(2.75rem, 6vw, 6rem)",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                lineHeight: 0.98,
              }}
            >
              {r.title}.
            </h1>
            <p
              className="mt-8 max-w-[640px] text-muted"
              style={{ fontSize: "clamp(1.0625rem, 1.4vw, 1.375rem)", lineHeight: 1.5 }}
            >
              {r.short}
            </p>
          </Container>
        </section>

        {/* Hero image full-bleed */}
        <section className="pb-20 md:pb-28">
          <div className="mx-auto w-full max-w-[1320px] px-6 sm:px-10 lg:px-20">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-graphite/5">
              <Image
                src={r.imageSrc}
                alt={r.imageAlt}
                fill
                preload
                sizes="(min-width: 1320px) 1280px, 100vw"
                className="object-cover photo-treatment"
              />
            </div>
          </div>
        </section>

        {/* Fiche technique band */}
        <section className="border-y border-line/60 py-12 md:py-16">
          <Container>
            <dl className="grid grid-cols-2 gap-y-8 sm:grid-cols-4">
              <div>
                <dt className="font-mono text-[13px] uppercase tracking-[0.18em] text-muted">Client</dt>
                <dd className="mt-2 text-ink" style={{ fontSize: "1.0625rem" }}>{r.client}</dd>
              </div>
              <div>
                <dt className="font-mono text-[13px] uppercase tracking-[0.18em] text-muted">Lieu</dt>
                <dd className="mt-2 text-ink" style={{ fontSize: "1.0625rem" }}>{r.city}</dd>
              </div>
              <div>
                <dt className="font-mono text-[13px] uppercase tracking-[0.18em] text-muted">Durée chantier</dt>
                <dd className="mt-2 text-ink" style={{ fontSize: "1.0625rem" }}>{r.duration}</dd>
              </div>
              <div>
                <dt className="font-mono text-[13px] uppercase tracking-[0.18em] text-muted">
                  {r.surface ? "Surface" : "Année"}
                </dt>
                <dd className="mt-2 text-ink" style={{ fontSize: "1.0625rem" }}>
                  {r.surface ?? r.year}
                </dd>
              </div>
            </dl>
          </Container>
        </section>

        {/* Story */}
        <section className="py-[clamp(120px,18vw,200px)]">
          <Container size="narrow">
            <div className="space-y-7 text-ink" style={{ fontSize: "1.1875rem", lineHeight: 1.6 }}>
              {r.story.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {r.results && r.results.length > 0 && (
              <div className="mt-16 grid grid-cols-1 gap-10 border-t border-line/60 pt-10 sm:grid-cols-2 sm:gap-16">
                {r.results.map((kv) => (
                  <div key={kv.label}>
                    <div
                      className="text-azur"
                      style={{
                        fontSize: "clamp(3rem, 5vw, 5rem)",
                        fontWeight: 200,
                        letterSpacing: "-0.04em",
                        lineHeight: 1,
                      }}
                    >
                      <CountUp value={kv.value} />
                    </div>
                    <div className="mt-3 text-sm leading-relaxed text-muted">{kv.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button href="/contact" arrow>
                Discuter d&apos;un projet similaire
              </Button>
              <Button href={`/expertises/${
                r.solution === "Étanchéité"
                  ? "etancheite"
                  : r.solution === "Cool Roofing"
                    ? "cool-roofing"
                    : r.solution === "Azur Reflect"
                      ? "azur-reflect"
                      : "autres"
              }`} variant="ghost" arrow>
                En savoir plus sur {r.solution}
              </Button>
            </div>
          </Container>
        </section>

        {/* Prev / next */}
        <section className="border-t border-line/60">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <Link
                href={`/realisations/${prev.slug}`}
                className="group flex flex-col gap-2 border-b border-line/60 py-10 md:border-b-0 md:border-r md:py-14"
              >
                <span className="font-mono text-[13px] uppercase tracking-[0.18em] text-muted">
                  ← Précédent
                </span>
                <span
                  className="text-ink underline-grow"
                  style={{ fontSize: "1.5rem", fontWeight: 500, letterSpacing: "-0.02em" }}
                >
                  {prev.title}
                </span>
              </Link>
              <Link
                href={`/realisations/${next.slug}`}
                className="group flex flex-col gap-2 py-10 text-right md:py-14 md:items-end"
              >
                <span className="font-mono text-[13px] uppercase tracking-[0.18em] text-muted">
                  Suivant →
                </span>
                <span
                  className="text-ink underline-grow"
                  style={{ fontSize: "1.5rem", fontWeight: 500, letterSpacing: "-0.02em" }}
                >
                  {next.title}
                </span>
              </Link>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
