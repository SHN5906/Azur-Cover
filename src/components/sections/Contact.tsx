import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function Contact() {
  return (
    <section
      id="contact"

      aria-labelledby="contact-h"
      className="py-[clamp(120px,18vw,200px)]"
    >
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left. copy & infos */}
          <div>
            <ScrollReveal>
              <Eyebrow>Parlons de votre projet</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <h2
                id="contact-h"
                className="mt-6 text-ink"
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 5rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                Un audit gratuit, sans engagement.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <p
                className="mt-6 max-w-[480px] text-muted"
                style={{ fontSize: "1.125rem", lineHeight: 1.55 }}
              >
                Nos équipes se déplacent dans toute la France. Vous décrivez
                votre bâtiment, nous revenons sous 48 h avec une estimation de
                gains thermiques et un planning d&apos;intervention.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={320}>
              <dl className="mt-10 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-10">
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    Adresse
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink">
                    {site.address.building}
                    <br />
                    {site.address.street}
                    <br />
                    {site.address.postal} {site.address.city}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    Téléphone
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink">
                    {site.phones.map((p) => (
                      <a
                        key={p}
                        href={`tel:${p.replace(/\s/g, "")}`}
                        className="block hover:text-azur-deep"
                      >
                        {p}
                      </a>
                    ))}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    Email
                  </dt>
                  <dd className="mt-2 text-sm">
                    <a
                      href={`mailto:${site.email}?subject=Demande%20d%27audit`}
                      className="text-ink hover:text-azur-deep"
                    >
                      {site.email}
                    </a>
                  </dd>
                </div>
              </dl>
            </ScrollReveal>

            <ScrollReveal delay={420}>
              <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">
                <Button
                  href={`mailto:${site.email}?subject=Demande%20d%27audit%20gratuit`}
                  arrow
                >
                  Demander un audit
                </Button>
                <Button
                  href={`mailto:${site.email}`}
                  variant="ghost"
                  arrow
                >
                  Ou envoyer un message
                </Button>
              </div>
            </ScrollReveal>
          </div>

          {/* Right. CTA card linking to Google Maps */}
          <ScrollReveal delay={120}>
            <a
              href={site.mapLink}
              target="_blank"
              rel="noreferrer noopener"
              className="group relative flex aspect-[4/3] w-full flex-col justify-end overflow-hidden rounded-md bg-ink p-8 text-white transition-shadow hover:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.4)] md:p-10 lg:aspect-square"
              aria-label={`Voir ${site.address.full} sur Google Maps`}
            >
              {/* Discrete brand gradient accent */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  background:
                    "radial-gradient(circle at 80% 20%, var(--color-azur) 0%, transparent 55%), radial-gradient(circle at 15% 90%, var(--color-lime) 0%, transparent 50%)",
                }}
              />

              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
                  Notre siège
                </p>
                <p className="mt-2 text-lg font-medium text-white" style={{ letterSpacing: "-0.01em" }}>
                  {site.address.building}, {site.address.city}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white underline-grow">
                  Voir sur Google Maps
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </div>
            </a>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
