import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { listRealisations } from "@/lib/realisations-repo";
import { RealisationsMap } from "@/components/sections/RealisationsMap";

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Quelques chantiers récents : PromoCash, École Jacqueline de Romilly à Cannes, Netto, U Express, CHU de Grasse, Vitrolles…",
  alternates: { canonical: "/realisations" },
};

export default async function RealisationsIndex() {
  const realisations = await listRealisations();

  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          eyebrow="Nos réalisations"
          title="Le terrain. Toujours."
          lead="Sélection de chantiers récents qui illustrent notre savoir-faire dans la performance thermique et l'étanchéité. bâtiments tertiaires, industriels et publics."
        />

        <section className="pb-[clamp(120px,18vw,200px)]">
          <Container>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2 md:gap-y-20 lg:gap-y-24">
              {realisations.map((r, i) => (
                <ScrollReveal as="li" key={r.slug} delay={Math.min(i, 6) * 60}>
                  <Link href={`/realisations/${r.slug}`} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-graphite/5">
                      <Image
                        src={r.imageSrc}
                        alt={r.imageAlt}
                        fill
                        loading={i < 4 ? "eager" : "lazy"}
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover photo-treatment transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                      />
                    </div>
                    <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                      {r.client} · {r.city} · {r.year}
                    </p>
                    <h2
                      className="mt-2 text-ink"
                      style={{
                        fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                      }}
                    >
                      {r.title}.
                    </h2>
                    <p className="mt-3 max-w-[480px] text-muted" style={{ lineHeight: 1.55 }}>
                      {r.short}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-ink underline-grow">
                      Lire l&apos;étude de cas
                      <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </ul>
          </Container>
        </section>

        <RealisationsMap realisations={realisations} />
      </main>
      <Footer />
    </>
  );
}
