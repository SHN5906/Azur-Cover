import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { CountUp } from "@/components/motion/CountUp";
import { BreadcrumbJsonLd } from "@/lib/breadcrumb";
import { expertises, getExpertise } from "@/content/expertises";
import { listRealisations } from "@/lib/realisations-repo";

export function generateStaticParams() {
  return expertises.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = getExpertise(slug);
  if (!e) return {};
  return {
    title: e.title,
    description: e.short,
    alternates: { canonical: `/expertises/${e.slug}` },
  };
}

export default async function ExpertisePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = getExpertise(slug);
  if (!e) notFound();

  // Realisations matching this expertise
  const solutionLabel =
    e.title === "Étanchéité"
      ? "Étanchéité"
      : e.title === "Cool Roofing"
        ? "Cool Roofing"
        : e.title === "Azur Reflect"
          ? "Azur Reflect"
          : null;
  const allRealisations = solutionLabel ? await listRealisations() : [];
  const related = solutionLabel
    ? allRealisations.filter((r) => r.solution === solutionLabel).slice(0, 3)
    : [];

  // Other expertises for cross-link
  const others = expertises.filter((x) => x.slug !== e.slug);

  return (
    <>
      <Header />
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Expertises", url: "/expertises" },
          { name: e.title, url: `/expertises/${e.slug}` },
        ]}
      />
      <main id="main">
        {/* Hero with image */}
        <section

          className="relative pt-40 pb-20 md:pt-48 md:pb-28"
          aria-labelledby="expertise-h1"
        >
          <Container>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <Eyebrow>{e.hero.eyebrow}</Eyebrow>
                <h1
                  id="expertise-h1"
                  className="mt-6 text-ink"
                  style={{
                    fontSize: "clamp(3rem, 6.5vw, 7rem)",
                    fontWeight: 600,
                    letterSpacing: "-0.04em",
                    lineHeight: 0.95,
                  }}
                >
                  {e.hero.title}
                </h1>
                <p
                  className="mt-8 max-w-[600px] text-muted"
                  style={{ fontSize: "clamp(1.0625rem, 1.4vw, 1.375rem)", lineHeight: 1.5 }}
                >
                  {e.hero.lead}
                </p>
                <div className="mt-10">
                  <Button href="/contact" arrow>
                    {e.cta}
                  </Button>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-graphite/5">
                  <Image
                    src={e.image.src}
                    alt={e.image.alt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    preload
                    className="object-cover photo-treatment"
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* KPIs band */}
        <section className="border-y border-line/60 py-12 md:py-16">
          <Container>
            <ul className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-16">
              {e.kpis.map((k) => (
                <li key={k.label}>
                  <div
                    className="text-azur"
                    style={{
                      fontSize: "clamp(2.75rem, 5vw, 4.5rem)",
                      fontWeight: 200,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                    }}
                  >
                    <CountUp value={k.value} />
                  </div>
                  <div className="mt-3 text-sm leading-relaxed text-muted">{k.label}</div>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Problem / Solution */}
        <section className="py-[clamp(120px,18vw,200px)]">
          <Container>
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
              <ScrollReveal>
                <Eyebrow>{e.problem.title}</Eyebrow>
                <div
                  className="mt-6 space-y-5 text-ink"
                  style={{ fontSize: "1.0625rem", lineHeight: 1.6 }}
                >
                  {e.problem.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </ScrollReveal>
              <ScrollReveal delay={120}>
                <Eyebrow>{e.solution.title}</Eyebrow>
                <div
                  className="mt-6 space-y-5 text-ink"
                  style={{ fontSize: "1.0625rem", lineHeight: 1.6 }}
                >
                  {e.solution.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </Container>
        </section>

        {/* Sections (longform) */}
        <section className="py-[clamp(120px,18vw,200px)]">
          <Container size="narrow">
            <div className="space-y-20 md:space-y-28">
              {e.sections.map((s, i) => (
                <ScrollReveal key={s.title} delay={i * 60}>
                  <h2
                    className="text-ink"
                    style={{
                      fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                      fontWeight: 600,
                      letterSpacing: "-0.025em",
                      lineHeight: 1.1,
                    }}
                  >
                    {s.title}
                  </h2>
                  <div
                    className="mt-6 space-y-5 text-ink"
                    style={{ fontSize: "1.0625rem", lineHeight: 1.65 }}
                  >
                    {s.body.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </section>

        {/* Bullets summary */}
        <section className="border-y border-line/60 py-20">
          <Container>
            <Eyebrow>Points clés</Eyebrow>
            <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2">
              {e.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-ink" style={{ fontSize: "1.0625rem" }}>
                  <span aria-hidden className="mt-3 inline-block h-px w-4 shrink-0 bg-azur" />
                  {b}
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Related realisations */}
        {related.length > 0 && (
          <section className="py-[clamp(120px,18vw,200px)]">
            <Container>
              <Eyebrow>Réalisations associées</Eyebrow>
              <h2
                className="mt-6 max-w-[640px] text-ink"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.5rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                }}
              >
                Voir cette expertise sur le terrain.
              </h2>
              <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/realisations/${r.slug}`}
                      className="group block"

                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-graphite/5">
                        <Image
                          src={r.imageSrc}
                          alt={r.imageAlt}
                          fill
                          loading="lazy"
                          sizes="(min-width: 768px) 33vw, 100vw"
                          className="object-cover photo-treatment transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                        />
                      </div>
                      <p className="mt-4 font-mono text-[13px] uppercase tracking-[0.18em] text-muted">
                        {r.client} · {r.city} · {r.year}
                      </p>
                      <h3 className="mt-1 text-ink" style={{ fontSize: "1.125rem", fontWeight: 500 }}>
                        {r.title}
                      </h3>
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        )}

        {/* Other expertises */}
        <section className="border-t border-line/60 py-20">
          <Container>
            <Eyebrow>Autres expertises</Eyebrow>
            <ul className="mt-8 grid grid-cols-1 gap-px bg-line/60 sm:grid-cols-3 [&>li]:bg-bg">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/expertises/${o.slug}`}
                    className="group block p-6 transition-colors hover:bg-line/30"

                  >
                    <span className="font-mono text-[13px] uppercase tracking-[0.18em] text-muted">
                      {o.index}
                    </span>
                    <div
                      className="mt-3 text-ink"
                      style={{ fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.02em" }}
                    >
                      {o.title} →
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
