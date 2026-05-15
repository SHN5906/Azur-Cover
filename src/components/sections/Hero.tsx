import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { site } from "@/content/site";

export function Hero() {
  return (
    <section
      id="hero"
      data-bg="1"
      aria-labelledby="hero-h1"
      className="relative isolate flex min-h-[100svh] max-h-[920px] w-full items-center overflow-hidden"
    >
      {/* Image: half-width on desktop, full-bg on mobile (with bottom fade for legibility) */}
      <div
        aria-hidden
        className="absolute inset-0 lg:left-1/2 lg:right-0"
      >
        <Image
          src="/images/hero/building.jpg"
          alt=""
          fill
          preload
          fetchPriority="high"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-center photo-treatment"
        />
        {/* Mobile: lift the bottom for text legibility */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(251,251,253,0) 30%, rgba(251,251,253,0.98) 100%)",
          }}
        />
        {/* Desktop: soft transition at the seam between text panel and image */}
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(251,251,253,1) 0%, rgba(251,251,253,0.4) 8%, rgba(251,251,253,0) 18%)",
          }}
        />
      </div>

      {/* Text panel */}
      <Container className="relative pt-24 pb-24 lg:pt-32 lg:pb-32">
        <div className="max-w-[640px]">
          <Eyebrow tone="muted" className="text-ink/60">
            Azur Cover · Expert national
          </Eyebrow>

          <h1
            id="hero-h1"
            className="mt-8 text-ink"
            style={{
              fontSize: "clamp(3.5rem, 7vw, 8rem)",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            Performance thermique et étanchéité, sans compromis.
          </h1>

          <p
            className="mt-8 max-w-[540px] text-ink/65"
            style={{
              fontSize: "1.25rem",
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            Jusqu&apos;à −12 °C en intérieur, sans climatisation. Solution unique
            en région PACA.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Button href="#contact" arrow>
              Demander un audit
            </Button>
            <Button href="#realisations" variant="ghost" arrow>
              Voir nos références
            </Button>
          </div>

          {/* Micro-credibility */}
          <div className="mt-16 max-w-md border-t border-ink/10 pt-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              {site.trust.qualibat} · {site.trust.siret} · Depuis{" "}
              {site.trust.since}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
