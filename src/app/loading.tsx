import Image from "next/image";

/**
 * Loading fallback rendu par Next.js quand un route segment async met
 * du temps à charger. Brand moment : logo centré qui respire doucement
 * sur fond neutre. Pas de skeleton bruyant.
 */
export default function Loading() {
  return (
    <main
      id="main"
      className="flex min-h-screen items-center justify-center bg-bg"
      aria-label="Chargement"
    >
      <span role="status" className="sr-only">
        Chargement de la page…
      </span>
      <div className="relative">
        <Image
          src="/images/brand/logo.png"
          alt="Azur Cover"
          width={120}
          height={55}
          priority
          className="loading-logo h-auto w-[120px] md:w-[140px]"
        />
        <span
          aria-hidden
          className="loading-pulse absolute -inset-4 rounded-full bg-azur/15 blur-2xl"
        />
      </div>

      <style>{`
        .loading-logo {
          opacity: 0.85;
          animation: logo-breathe 1800ms cubic-bezier(0.4,0,0.2,1) infinite alternate;
        }
        .loading-pulse {
          animation: pulse-glow 1800ms cubic-bezier(0.4,0,0.2,1) infinite alternate;
        }
        @keyframes logo-breathe {
          from { opacity: 0.55; transform: scale(0.98); }
          to   { opacity: 1; transform: scale(1.02); }
        }
        @keyframes pulse-glow {
          from { opacity: 0.4; transform: scale(0.9); }
          to   { opacity: 0.9; transform: scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          .loading-logo, .loading-pulse { animation: none; opacity: 1; }
        }
      `}</style>
    </main>
  );
}
