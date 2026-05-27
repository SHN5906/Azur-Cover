import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { about } from "@/content/about";

// Photos éditoriales insérées entre les blocs de texte pour casser le mur de
// mots. Indexées par position de bloc → image qui suit ce bloc.
const BLOCK_IMAGES: Record<number, { src: string; alt: string; caption: string }> = {
  0: {
    src: "/images/sectors/tertiaire.jpg",
    alt: "Toiture industrielle sous le soleil du sud de la France",
    caption: "Sud de la France · contrainte permanente",
  },
  2: {
    src: "/images/realisations/ecole-cannes.jpg",
    alt: "École Jacqueline de Romilly à Cannes — chantier Cool Roofing",
    caption: "École Jacqueline de Romilly · Cannes",
  },
};

export const metadata: Metadata = {
  title: about.meta.title,
  description: about.meta.description,
  alternates: { canonical: "/qui-sommes-nous" },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          eyebrow={about.eyebrow}
          title={about.title}
          lead={about.intro}
        />

        {/* Long-form story blocks */}
        <section className="py-[clamp(80px,12vw,160px)]">
          <div className="space-y-20 md:space-y-24">
            {about.blocks.map((block, i) => {
              const image = BLOCK_IMAGES[i];
              return (
                <div key={block.title}>
                  <Container size="narrow">
                    <ScrollReveal delay={i * 60}>
                      <h2
                        className="text-ink"
                        style={{
                          fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                          fontWeight: 600,
                          letterSpacing: "-0.025em",
                          lineHeight: 1.1,
                        }}
                      >
                        {block.title}
                      </h2>
                      <div
                        className="mt-6 space-y-5 text-ink"
                        style={{ fontSize: "1.0625rem", lineHeight: 1.7 }}
                      >
                        {block.paragraphs.map((p, j) => (
                          <p key={j}>{p}</p>
                        ))}
                      </div>
                    </ScrollReveal>
                  </Container>

                  {image && (
                    <ScrollReveal delay={120}>
                      <figure className="mt-16 md:mt-20">
                        <div className="mx-auto w-full max-w-[1320px] px-6 sm:px-10 lg:px-20">
                          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-graphite/5 md:aspect-[21/9]">
                            <Image
                              src={image.src}
                              alt={image.alt}
                              fill
                              loading="lazy"
                              sizes="(min-width: 1320px) 1280px, 100vw"
                              className="object-cover photo-treatment"
                            />
                          </div>
                          <figcaption className="mt-3 font-mono text-[12px] uppercase tracking-[0.22em] text-muted">
                            {image.caption}
                          </figcaption>
                        </div>
                      </figure>
                    </ScrollReveal>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Pillars */}
        <section className="border-y border-line/60 py-[clamp(80px,12vw,160px)]">
          <Container>
            <Eyebrow>Trois piliers</Eyebrow>
            <h2
              className="mt-6 max-w-[640px] text-ink"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              Une approche construite à chaque étape.
            </h2>

            <ol className="mt-16 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-3">
              {about.pillars.map((p, i) => (
                <ScrollReveal as="li" key={p.number} delay={120 + i * 100}>
                  <span
                    className="block text-azur"
                    style={{
                      fontSize: "clamp(4rem, 7vw, 6rem)",
                      fontWeight: 200,
                      letterSpacing: "-0.04em",
                      lineHeight: 0.9,
                    }}
                  >
                    {p.number}
                  </span>
                  <h3
                    className="mt-4 text-ink"
                    style={{ fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.02em" }}
                  >
                    {p.title}
                  </h3>
                  <p className="mt-3 max-w-xs text-muted" style={{ lineHeight: 1.6 }}>
                    {p.description}
                  </p>
                </ScrollReveal>
              ))}
            </ol>
          </Container>
        </section>

        {/* CTA */}
        <section className="py-20">
          <Container>
            <div className="flex flex-col items-start gap-6">
              <h2
                className="max-w-[640px] text-ink"
                style={{
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.1,
                }}
              >
                Travaillons ensemble.
              </h2>
              <Button href="/contact" arrow>
                Demander un audit
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
