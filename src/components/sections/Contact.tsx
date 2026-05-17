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

          {/* Right. Location card */}
          <ScrollReveal delay={120}>
            <a
              href={site.mapDeepLink}
              target="_blank"
              rel="noreferrer noopener"
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-md border border-line/60 bg-graphite text-white transition-shadow hover:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.4)] lg:aspect-square"
              aria-label={`Itinéraire vers ${site.address.full}`}
            >
              <svg
                aria-hidden
                viewBox="0 0 400 400"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 h-full w-full opacity-30"
              >
                <defs>
                  <radialGradient id="contact-map-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(0,166,166,0.18)" />
                    <stop offset="60%" stopColor="rgba(0,166,166,0)" />
                  </radialGradient>
                </defs>
                {[60, 90, 120, 150, 180, 220, 260].map((r) => (
                  <circle
                    key={r}
                    cx="200"
                    cy="200"
                    r={r}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="0.5"
                    strokeDasharray="1 3"
                  />
                ))}
                <circle cx="200" cy="200" r="160" fill="url(#contact-map-glow)" />
                <line x1="0" y1="200" x2="400" y2="200" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                <line x1="200" y1="0" x2="200" y2="400" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              </svg>

              <span aria-hidden className="absolute left-1/2 top-1/2 block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2">
                <span className="absolute -inset-1 rounded-full bg-azur/40 animate-ping" />
                <span className="absolute inset-0 rounded-full bg-azur shadow-[0_0_20px_rgba(0,166,166,0.7)]" />
              </span>

              <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-4 bg-gradient-to-t from-graphite via-graphite/85 to-transparent p-6 md:p-8">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
                    Notre siège
                  </p>
                  <p className="mt-2 text-lg font-medium text-white" style={{ letterSpacing: "-0.01em" }}>
                    {site.address.building}, {site.address.city}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-white underline-grow">
                  Ouvrir l&apos;itinéraire
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
