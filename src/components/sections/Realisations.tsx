import Image from "next/image";
import Link from "next/link";
import { listRealisations } from "@/lib/realisations-repo";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export async function Realisations() {
  // Show 8 first realisations on the homepage. The full list lives at /realisations.
  const realisations = await listRealisations();
  const items = realisations.slice(0, 8);

  return (
    <section
      id="realisations"
      aria-labelledby="realisations-h"
      className="py-[clamp(120px,18vw,200px)]"
    >
      <Container>
        {/* Header row: text left, "voir toutes" right */}
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end md:gap-12">
          <div className="max-w-[640px]">
            <ScrollReveal>
              <Eyebrow>Nos réalisations</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <h2
                id="realisations-h"
                className="mt-6 text-ink"
                style={{
                  fontSize: "clamp(1.875rem, 4.4vw, 4.5rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.02,
                }}
              >
                Quelques projets.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <p
                className="mt-6 max-w-[480px] text-muted"
                style={{ fontSize: "1.0625rem", lineHeight: 1.55 }}
              >
                Quelques chantiers récents qui illustrent notre savoir-faire
                dans la performance thermique et l&apos;étanchéité des
                bâtiments tertiaires, industriels et publics.
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={320} className="shrink-0">
            <Link
              href="/realisations"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink underline-grow"
            >
              Voir toutes les réalisations
              <span aria-hidden>→</span>
            </Link>
          </ScrollReveal>
        </div>

        {/* Logo card grid — 2 cols even on mobile (plus dense, plus rapide à scanner) */}
        <ul className="mt-16 grid grid-cols-2 gap-px bg-line/60 lg:grid-cols-4 [&>li]:bg-bg">
          {items.map((r, i) => (
            <ScrollReveal as="li" key={r.slug} delay={120 + Math.min(i, 6) * 60}>
              <Link
                href={`/realisations/${r.slug}`}
                className="group flex h-full flex-col p-4 transition-colors duration-300 hover:bg-line/20 sm:p-6 lg:p-8"
              >
                {/* Logo zone : compact en 2-col mobile, plein desktop */}
                <div className="relative mx-auto flex h-14 w-full items-center justify-center sm:h-20 lg:h-32">
                  {r.logo ? (
                    <Image
                      src={r.logo}
                      alt={`Logo ${r.client}`}
                      fill
                      sizes="(min-width: 1024px) 200px, 140px"
                      className="object-contain opacity-80 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                    />
                  ) : (
                    <span
                      className="font-display text-ink/30 transition-colors duration-500 group-hover:text-ink"
                      style={{
                        fontSize: "clamp(1.5rem, 4vw, 4rem)",
                        fontWeight: 200,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {r.client.split(" ").map((w) => w[0]).join("").slice(0, 3)}
                    </span>
                  )}
                </div>

                {/* Project metadata */}
                <div className="mt-5 border-t border-line/60 pt-4 sm:mt-6 sm:pt-5 lg:mt-8">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted sm:text-[10px] sm:tracking-[0.18em]">
                    {r.solution} · {r.year}
                  </p>
                  <h3
                    className="mt-2 text-ink"
                    style={{
                      fontSize: "clamp(0.95rem, 2vw, 1.0625rem)",
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.2,
                    }}
                  >
                    {r.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted sm:text-sm">{r.city}</p>

                  <span className="mt-4 hidden items-center gap-1.5 text-xs font-medium text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:inline-flex">
                    Voir le projet
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
