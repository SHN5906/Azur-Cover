import Link from "next/link";
import { Container } from "@/components/ui/Container";

/**
 * Strip "Couverture média" : affiche les sources presse comme wordmarks
 * sobres sur une bande horizontale. Pour l'instant typographique (pas de
 * vrais logos rasterisés) — facilement remplaçable par des PNG quand
 * disponibles via un champ `logo` optionnel.
 */
type MediaMention = {
  name: string;
  /** Optional path to a real logo PNG/SVG (e.g. /images/presse/logos/nice-matin.svg) */
  logo?: string;
  /** Optional descriptor under the wordmark (issue number, date, etc.) */
  caption?: string;
};

const MENTIONS: MediaMention[] = [
  { name: "Nice-Matin", caption: "Article 2024" },
  { name: "IN Magazine", caption: "Born to be Boss" },
  { name: "Éric Pauget", caption: "Député 06" },
  { name: "Alain Bernard", caption: "Partenariat" },
];

export function MediaCoverage() {
  return (
    <section
      aria-labelledby="media-coverage-h"
      className="border-y border-line/60 bg-bg py-16"
    >
      <Container>
        <div className="flex flex-col items-start gap-10 md:flex-row md:items-center md:justify-between md:gap-16">
          <div className="shrink-0 md:max-w-[260px]">
            <h2
              id="media-coverage-h"
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted"
            >
              Ils parlent de nous
            </h2>
            <Link
              href="/presse"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-ink underline-grow"
            >
              Voir la revue de presse
              <span aria-hidden>→</span>
            </Link>
          </div>

          <ul className="grid w-full grid-cols-2 gap-x-8 gap-y-8 md:flex md:flex-1 md:items-center md:justify-end md:gap-12 lg:gap-16">
            {MENTIONS.map((m) => (
              <li key={m.name} className="flex flex-col items-start md:items-center">
                <span
                  className="text-ink/80 transition-colors duration-300 hover:text-ink"
                  style={{
                    fontFamily: "serif",
                    fontSize: "clamp(1.1rem, 1.4vw, 1.4rem)",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    fontStyle: "italic",
                  }}
                >
                  {m.name}
                </span>
                {m.caption && (
                  <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted/70">
                    {m.caption}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
