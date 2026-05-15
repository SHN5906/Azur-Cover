import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { site } from "@/content/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Demandez un audit gratuit. Nos équipes se déplacent partout en France. Réponse sous 48 h.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          eyebrow="Contact"
          title="Parlons de votre projet."
          lead="Vous décrivez votre bâtiment. Nous revenons sous 48 h avec une estimation de gains thermiques et un planning d'intervention. Le diagnostic est gratuit et sans engagement."
        />

        <section className="pb-[clamp(120px,18vw,200px)]">
          <Container>
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-20">
              <ContactForm />

              {/* Coordinates */}
              <aside className="lg:col-span-5 lg:border-l lg:border-line/60 lg:pl-16">
                <Eyebrow>Coordonnées</Eyebrow>
                <dl className="mt-10 space-y-8">
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                      Adresse
                    </dt>
                    <dd className="mt-2 text-ink" style={{ fontSize: "1.0625rem", lineHeight: 1.5 }}>
                      {site.address.building}
                      <br />
                      {site.address.street}
                      <br />
                      {site.address.postal} {site.address.city}, {site.address.country}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                      Téléphone
                    </dt>
                    <dd className="mt-2 space-y-1">
                      {site.phones.map((p) => (
                        <a
                          key={p}
                          href={`tel:${p.replace(/\s/g, "")}`}
                          className="block text-ink hover:text-azur-deep"
                          style={{ fontSize: "1.0625rem" }}
                        >
                          {p}
                        </a>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                      Email
                    </dt>
                    <dd className="mt-2">
                      <a
                        href={`mailto:${site.email}`}
                        className="text-ink hover:text-azur-deep"
                        style={{ fontSize: "1.0625rem" }}
                      >
                        {site.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                      Zone d&apos;intervention
                    </dt>
                    <dd className="mt-2 text-ink" style={{ fontSize: "1.0625rem", lineHeight: 1.5 }}>
                      France entière. Nos équipes se déplacent partout pour les diagnostics et chantiers.
                    </dd>
                  </div>
                </dl>

                <div className="relative mt-10 aspect-square w-full overflow-hidden rounded-md border border-line/60 bg-white">
                  <iframe
                    src={site.mapEmbed}
                    title={`Carte. ${site.address.full}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </aside>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
