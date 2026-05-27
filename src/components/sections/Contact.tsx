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
      className="py-[clamp(56px,9vw,110px)]"
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
                  textWrap: "balance",
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
                votre bâtiment, nous revenons sous 48&nbsp;h avec une estimation de
                gains thermiques et un planning d’intervention.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={320}>
              <dl className="mt-10 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-10">
                <div>
                  <dt className="font-mono text-[13px] uppercase tracking-[0.18em] text-muted">
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
                  <dt className="font-mono text-[13px] uppercase tracking-[0.18em] text-muted">
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
                  <dt className="font-mono text-[13px] uppercase tracking-[0.18em] text-muted">
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

          {/* Right. Embedded Google Maps with overlay caption */}
          <ScrollReveal delay={120}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-graphite/5 lg:aspect-square">
              <iframe
                title={`Carte Google Maps de ${site.address.full}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(site.address.full)}&hl=fr&z=15&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
              />

              {/* Caption + CTA overlay, semi-transparent so the map breathes. */}
              <a
                href={site.mapLink}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Ouvrir ${site.address.full} dans Google Maps`}
                className="group absolute inset-x-3 bottom-3 flex items-end justify-between gap-4 rounded bg-ink/90 p-5 text-white backdrop-blur-sm transition-colors hover:bg-ink md:inset-x-5 md:bottom-5 md:p-6"
              >
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
                    Notre siège
                  </p>
                  <p
                    className="mt-1.5 text-sm font-medium text-white sm:text-base"
                    style={{ letterSpacing: "-0.01em" }}
                  >
                    {site.address.building}, {site.address.city}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="mb-0.5 shrink-0 text-sm transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
