import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { pressItems } from "@/content/presse";

export const metadata: Metadata = {
  title: "Presse",
  description:
    "Toutes les actualités d'Azur Cover : presse, partenariats, reconnaissances institutionnelles.",
  alternates: { canonical: "/presse" },
};

export default function PressePage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          eyebrow="Presse"
          title="On parle de nous."
          lead="Reconnaissances institutionnelles, partenariats, articles. Le travail d'Azur Cover dans la presse et sur le terrain politique."
        />

        <section className="pb-[clamp(120px,18vw,200px)]">
          <Container>
            <ul className="space-y-20 md:space-y-28">
              {pressItems.map((item, i) => (
                <ScrollReveal as="li" key={item.title} delay={i * 80}>
                  <article
                    className={`grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12 ${
                      // Alternate image left/right for visual rhythm
                      i % 2 === 1 ? "md:[&>figure]:order-2" : ""
                    }`}
                  >
                    {item.image ? (
                      <figure className="md:col-span-5">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-line/60 bg-line/30">
                          <Image
                            src={item.image.src}
                            alt={item.image.alt}
                            fill
                            sizes="(min-width: 768px) 40vw, 100vw"
                            className="object-cover photo-treatment"
                          />
                        </div>
                      </figure>
                    ) : null}

                    <div className={item.image ? "md:col-span-7 md:flex md:items-center" : "md:col-span-12"}>
                      <div>
                        <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-muted">
                          {item.date} · {item.source}
                        </p>
                        <h2
                          className="mt-4 text-ink"
                          style={{
                            fontSize: "clamp(1.5rem, 2.6vw, 2.125rem)",
                            fontWeight: 600,
                            letterSpacing: "-0.02em",
                            lineHeight: 1.15,
                          }}
                        >
                          {item.title}
                        </h2>
                        <p className="mt-4 text-ink" style={{ fontSize: "1.0625rem", lineHeight: 1.65 }}>
                          {item.excerpt}
                        </p>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-ink underline-grow"
                          >
                            Lire l&apos;article <span aria-hidden>↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </ul>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
