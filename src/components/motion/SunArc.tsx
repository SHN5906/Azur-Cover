"use client";

import { useEffect, useRef } from "react";

/**
 * Soleil qui traverse le top de la page de gauche à droite (en arc)
 * au rythme du scroll. Pure transform GPU, zéro re-render React.
 *
 * Métaphore : le soleil agresse → tes solutions le réfléchissent.
 * Volontairement très discret — un point + halo doux, ne tire pas
 * l'attention mais existe à la périphérie de la vision.
 */
export function SunArc() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Le soleil ne traverse qu'à partir d'un certain scroll (laisse le
    // hero pur) et finit avant le footer.
    const START_SCROLL_VH = 0.5; // commence à 50% du viewport scrollé
    const END_SCROLL_VH = 3.5;   // termine à 350% (avant footer)

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const start = START_SCROLL_VH * vh;
      const end = END_SCROLL_VH * vh;
      const y = window.scrollY;
      const t = Math.min(1, Math.max(0, (y - start) / (end - start)));

      // X linéaire 0 → 100%, Y en arc (sin pour monter puis descendre)
      // L'arc culmine à t=0.5 (centre du défilement)
      const xPct = t * 100;
      const arcY = Math.sin(t * Math.PI) * 60; // 60px max altitude

      el.style.transform = `translate3d(${xPct}vw, ${-arcY}px, 0) translateX(-50%)`;
      // Visible seulement quand t > 0 et < 1
      el.style.opacity = t > 0 && t < 1 ? "1" : "0";
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-[120px] z-[5] transition-opacity duration-700 sun-arc"
      style={{ willChange: "transform, opacity", opacity: 0 }}
    >
      <span className="relative block">
        {/* Halo large */}
        <span
          aria-hidden
          className="absolute -inset-[140px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,220,180,0.35) 0%, rgba(255,200,140,0.12) 30%, transparent 60%)",
          }}
        />
        {/* Halo intermédiaire teinté azur */}
        <span
          aria-hidden
          className="absolute -inset-[60px] rounded-full blur-xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,235,200,0.55) 0%, rgba(0,166,166,0.18) 50%, transparent 70%)",
          }}
        />
        {/* Soleil — point chaud */}
        <span
          className="relative block h-8 w-8 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #FFF8E7 0%, #FFE3B0 45%, #FFB860 100%)",
            boxShadow: "0 0 30px rgba(255, 200, 130, 0.6)",
          }}
        />
      </span>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .sun-arc { display: none !important; }
        }
      `}</style>
    </div>
  );
}
