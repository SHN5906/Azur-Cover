import type { Metadata } from "next";
import { headers } from "next/headers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { faqByCategory, faqItems } from "@/content/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Réponses détaillées à toutes vos questions sur le Cool Roofing, Azur Reflect, l'étanchéité et nos méthodes.",
  alternates: { canonical: "/faq" },
};

// FAQPage schema for Google rich snippets — chaque Q/R devient candidate à
// l'affichage en accordéon dans les résultats de recherche.
const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer.join(" "),
    },
  })),
});

export default async function FAQPage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const groups = faqByCategory();
  const order: Array<keyof typeof groups> = ["Cool Roofing", "Azur Reflect", "Étanchéité", "Général"];

  return (
    <>
      <script type="application/ld+json" nonce={nonce}>{faqJsonLd}</script>
      <Header />
      <main id="main">
        <PageHero
          eyebrow="FAQ"
          title="Toutes vos questions, des réponses claires."
          lead="Cool Roofing, Azur Reflect, étanchéité, méthode, certifications : voici les réponses aux questions que nous recevons le plus souvent."
        />

        <section className="pb-[clamp(120px,18vw,200px)]">
          <Container size="narrow">
            <div className="space-y-20">
              {order.map((cat) =>
                groups[cat] ? (
                  <section key={cat}>
                    <Eyebrow>{cat}</Eyebrow>
                    <div className="mt-8 divide-y divide-line/60 border-y border-line/60">
                      {groups[cat].map((item) => (
                        <details key={item.question} className="group py-6">
                          <summary
                            className="flex cursor-pointer list-none items-start justify-between gap-6 text-ink"
                            style={{ fontSize: "1.125rem", fontWeight: 500, letterSpacing: "-0.01em" }}
                          >
                            <span>{item.question}</span>
                            <span
                              aria-hidden
                              className="mt-1 inline-block shrink-0 text-2xl leading-none text-muted transition-transform duration-300 group-open:rotate-45"
                            >
                              +
                            </span>
                          </summary>
                          <div className="mt-4 space-y-3 text-muted" style={{ lineHeight: 1.65 }}>
                            {item.answer.map((p, i) => (
                              <p key={i}>{p}</p>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  </section>
                ) : null
              )}
            </div>

            <div className="mt-20 border-t border-line/60 pt-12 text-center">
              <p className="text-ink" style={{ fontSize: "1.25rem", fontWeight: 500 }}>
                Une autre question ?
              </p>
              <p className="mt-3 text-muted">
                Notre équipe d&apos;experts se fera un plaisir de vous répondre sous 48 h.
              </p>
              <div className="mt-6 inline-flex">
                <Button href="/contact" arrow>
                  Poser ma question
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
