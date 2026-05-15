import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section
      id="hero"
      data-bg="1"
      aria-labelledby="hero-h1"
      className="relative isolate flex min-h-[100svh] max-h-[920px] w-full items-center overflow-hidden"
    >
      {/* Image: right half desktop, full bg with vertical fade on mobile */}
      <div aria-hidden className="absolute inset-0 lg:left-[44%] lg:right-0">
        <Image
          src="/images/hero/building.jpg"
          alt=""
          fill
          preload
          fetchPriority="high"
          sizes="(min-width: 1024px) 56vw, 100vw"
          className="object-cover object-center photo-treatment"
        />
        {/* Mobile: vertical fade so text stays legible */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(251,251,253,0.55) 0%, rgba(251,251,253,0.15) 35%, rgba(251,251,253,0.92) 100%)",
          }}
        />
        {/* Desktop: thin seam to soften the text panel edge — only first 8% */}
        <div
          className="absolute inset-y-0 left-0 hidden w-[8%] lg:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(251,251,253,1) 0%, rgba(251,251,253,0) 100%)",
          }}
        />
      </div>

      {/* Text panel */}
      <Container className="relative pt-24 pb-24 lg:pt-32 lg:pb-32">
        <div className="max-w-[640px]">
          <h1
            id="hero-h1"
            className="text-ink"
            style={{
              fontSize: "clamp(3.25rem, 6.4vw, 7.5rem)",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              textWrap: "balance",
            }}
          >
            Performance thermique et étanchéité, sans compromis.
          </h1>

          <p
            className="mt-8 max-w-[520px] text-ink/65"
            style={{ fontSize: "1.25rem", lineHeight: 1.5, fontWeight: 400 }}
          >
            Jusqu&apos;à −12 °C en intérieur, sans climatisation. Solution unique
            en région PACA.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Button href="/contact" arrow>
              Demander un audit
            </Button>
            <Button href="/realisations" variant="ghost" arrow>
              Voir nos références
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
