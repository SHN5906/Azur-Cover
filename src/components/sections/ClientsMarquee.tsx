import { clients } from "@/content/clients";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function ClientsMarquee() {
  return (
    <section
      id="trusted"
      aria-labelledby="trusted-h"
      className="border-y border-line/40 py-16 md:py-20"
    >
      <Eyebrow id="trusted-h" className="text-center">
        Ils nous font confiance
      </Eyebrow>

      {/* Bandeau auto-défilant, non interactif : le défilement est piloté
          uniquement par l'animation CSS. La piste contient 2 listes
          identiques et translate(-50%) tombe pile au début de la copie 2,
          donc la boucle est parfaitement continue (jamais de vide). */}
      <div className="mt-10">
        <div
          role="region"
          aria-label="Liste des clients"
          className="marquee-rail mask-fade-x overflow-hidden"
        >
          <div className="marquee-track flex w-max">
            <MarqueeList />
            <MarqueeList aria-hidden />
          </div>
        </div>
      </div>

      <style>{`
        .marquee-track {
          animation: marquee-track 60s linear infinite;
          will-change: transform;
        }
        .marquee-rail:hover .marquee-track {
          animation-play-state: paused;
        }
        @keyframes marquee-track {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

function MarqueeList({ "aria-hidden": ariaHidden }: { "aria-hidden"?: boolean } = {}) {
  return (
    <ul
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-16 pr-16"
    >
      {clients.map((c) => (
        <li
          key={c.name}
          className="flex h-12 shrink-0 items-center justify-center"
        >
          {/* Plain <img>: hauteur fixe, largeur auto. Tous les logos ont la
              même hauteur visuelle quel que soit leur ratio d'origine. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.src}
            alt={c.alt}
            draggable={false}
            className="h-10 w-auto max-w-[180px] object-contain opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
          />
        </li>
      ))}
    </ul>
  );
}
