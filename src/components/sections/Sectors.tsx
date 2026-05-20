import Image from "next/image";
import { sectors } from "@/content/sectors";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function Sectors() {
  return (
    <section
      id="sectors"
      aria-labelledby="sectors-h"
      className="py-[clamp(120px,18vw,200px)]"
    >
      <Container>
        <ScrollReveal>
          <Eyebrow>Secteurs d’intervention</Eyebrow>
        </ScrollReveal>
        <ScrollReveal delay={120}>
          <h2
            id="sectors-h"
            className="mt-6 max-w-[880px] text-ink"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 5rem)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              textWrap: "balance",
            }}
          >
            Une expertise adaptée à tous les types de bâtiments.
          </h2>
        </ScrollReveal>

        <ul className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {sectors.map((s, i) => (
            <ScrollReveal key={s.id} delay={120 + i * 100} as="li">
              <article className="relative block aspect-[4/5] overflow-hidden rounded-md bg-graphite">
                <Image
                  src={s.image.src}
                  alt={s.image.alt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover photo-treatment"
                />
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 40%, rgba(10,10,11,0.85) 100%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                  <h3
                    className="text-white"
                    style={{
                      fontSize: "1.875rem",
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.05,
                    }}
                  >
                    {s.title}
                  </h3>
                  <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-white/80">
                    {s.description}
                  </p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
