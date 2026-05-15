import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function Proposition() {
  return (
    <section
      id="proposition"
      data-bg="1"
      aria-labelledby="proposition-h"
      className="py-[clamp(120px,18vw,240px)]"
    >
      <Container>
        <div className="max-w-[880px]">
          <ScrollReveal>
            <Eyebrow>Nos expertises</Eyebrow>
          </ScrollReveal>
          <ScrollReveal delay={120} as="h2">
            <span
              id="proposition-h"
              className="mt-6 block text-ink"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 5rem)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              Trois expertises. Un seul interlocuteur.
            </span>
          </ScrollReveal>
          <ScrollReveal delay={240}>
            <p
              className="mt-8 max-w-[640px] text-muted"
              style={{ fontSize: "1.25rem", lineHeight: 1.5 }}
            >
              L&apos;étanchéité, le cool roofing, le vernis anti-chaleur Azur
              Reflect. Trois savoir-faire complémentaires pour traiter la
              performance thermique d&apos;un bâtiment à sa source — sans
              surdimensionner la climatisation.
            </p>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
