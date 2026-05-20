import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { expertises } from "@/content/expertises";

export const metadata: Metadata = {
  title: "Nos expertises",
  description:
    "Étanchéité, Cool Roofing, Azur Reflect et services connexes. Quatre savoir-faire complémentaires pour la performance thermique des bâtiments.",
  alternates: { canonical: "/expertises" },
};

export default function ExpertisesIndex() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          eyebrow="Nos expertises"
          title="Quatre savoir-faire. Une seule promesse : performance et durabilité."
          lead="Étanchéité, Cool Roofing, Azur Reflect, services connexes. Cliquez sur une expertise pour découvrir le détail technique, les bénéfices mesurés et nos références."
        />

        <section className="pb-[clamp(120px,18vw,200px)]">
          <Container>
            <ul className="grid grid-cols-1 gap-px bg-line/60 md:grid-cols-2 [&>li]:bg-bg">
              {expertises.map((e, i) => (
                <ScrollReveal as="li" key={e.slug} delay={120 + i * 80}>
                  <Link
                    href={`/expertises/${e.slug}`}
                    className="group block h-full p-8 md:p-12"

                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-mono text-[13px] uppercase tracking-[0.18em] text-muted">
                        {e.index} / 04
                      </span>
                      <span
                        aria-hidden
                        className="inline-block h-px w-12 origin-left scale-x-0 bg-azur transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                      />
                    </div>

                    <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-md bg-graphite/5">
                      <Image
                        src={e.image.src}
                        alt={e.image.alt}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover photo-treatment transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                      />
                    </div>

                    <h2
                      className="mt-8 text-ink"
                      style={{
                        fontSize: "clamp(2rem, 3.5vw, 3rem)",
                        fontWeight: 600,
                        letterSpacing: "-0.03em",
                        lineHeight: 1.05,
                      }}
                    >
                      {e.title}.
                    </h2>
                    <p className="mt-4 max-w-[440px] text-muted" style={{ lineHeight: 1.55 }}>
                      {e.short}
                    </p>

                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink underline-grow">
                      Découvrir l&apos;expertise
                      <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </ul>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
