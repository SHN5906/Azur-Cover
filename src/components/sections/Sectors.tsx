import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { sectors } from "@/content/sectors";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function Sectors() {
  return (
    <section
      id="sectors"
      data-bg="3"
      aria-labelledby="sectors-h"
      className="py-[clamp(120px,18vw,200px)]"
    >
      <Container>
        <ScrollReveal>
          <Eyebrow>Secteurs d&apos;intervention</Eyebrow>
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
            }}
          >
            Une expertise adaptée à tous les types de bâtiments.
          </h2>
        </ScrollReveal>

        <ul className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {sectors.map((s, i) => (
            <ScrollReveal key={s.id} delay={120 + i * 100} as="li">
              <Link
                href="#contact"
                data-cursor="hover"
                className="group relative block aspect-[4/5] overflow-hidden rounded-md bg-graphite"
              >
                <Image
                  src={s.image.src}
                  alt={s.image.alt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover photo-treatment transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 transition-opacity duration-500"
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
                  <span className="mt-5 inline-flex translate-y-2 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/85 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    Découvrir
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
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
