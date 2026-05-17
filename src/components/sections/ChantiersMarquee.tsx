import Link from "next/link";
import { listRealisations } from "@/lib/realisations-repo";

/**
 * Bande horizontale qui défile en boucle, listant les chantiers récents
 * depuis la DB. Pure CSS animation (translateX) — pas de JS, pas
 * d'IntersectionObserver. Duplique le contenu une fois pour boucle
 * infinie sans gap.
 */
export async function ChantiersMarquee() {
  const all = await listRealisations();
  if (all.length === 0) return null;

  // Items à afficher dans la bande : on duplique pour boucle propre
  const items = [...all, ...all];

  return (
    <section
      aria-label="Chantiers récents"
      className="relative overflow-hidden border-y border-line/60 bg-bg py-7"
    >
      <div className="marquee-track flex w-max items-center gap-12 whitespace-nowrap will-change-transform">
        {items.map((r, i) => (
          <Link
            key={`${r.slug}-${i}`}
            href={`/realisations/${r.slug}`}
            className="group flex shrink-0 items-center gap-4 text-sm transition-colors hover:text-ink"
          >
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-azur transition-transform duration-300 group-hover:scale-150"
            />
            <span className="font-medium text-ink/80 group-hover:text-ink">{r.title}</span>
            <span className="text-muted">·</span>
            <span className="text-muted">{r.city}</span>
            <span className="text-muted">·</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              {r.solution} {r.surface ? `· ${r.surface}` : ""}
            </span>
          </Link>
        ))}
      </div>

      {/* Fades on edges for a polished look */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bg to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bg to-transparent"
      />

      <style>{`
        .marquee-track {
          animation: marquee-scroll ${all.length * 6}s linear infinite;
        }
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
