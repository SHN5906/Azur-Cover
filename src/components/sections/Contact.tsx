import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function Contact() {
  return (
    <section
      id="contact"
      data-bg="4"
      aria-labelledby="contact-h"
      className="py-[clamp(120px,18vw,200px)]"
    >
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left — copy & infos */}
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
                        className="block hover:text-azur"
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
                      className="text-ink hover:text-azur"
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

          {/* Right — Map */}
          <ScrollReveal delay={120}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-line/60 bg-white lg:aspect-square">
              <iframe
                src={site.mapEmbed}
                title={`Carte — ${site.address.full}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <a
              href={site.mapDeepLink}
              className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted hover:text-ink lg:hidden"
            >
              Ouvrir dans Plans →
            </a>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
